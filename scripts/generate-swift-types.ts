#!/usr/bin/env ts-node

import fs from "node:fs";
import path from "node:path";
import spawnAsync from "@expo/spawn-async";

// sourcekitten structure --file modules/expo-app-icon/ios/ExpoAppIconModule.swift

type OutputDef = {
  name?: string;
  constants?: Record<
    // name
    string,
    // type
    string
  >;
  funcs: {
    name: string;
    args: { name: string; type: string }[];
    returnType: string;
  }[];
  getters: {
    name: string;
    returnType: string;
    readonly: boolean;
  }[];
};

async function doAsync() {
  const cwd = path.resolve(__dirname, "..");
  const fp = path.join(
    cwd,
    "modules/expo-app-icon/ios/ExpoAppIconModule.swift"
  );
  const outputFilepath = path.join(
    cwd,
    "modules/expo-app-icon/src/generated/module.ios.ts"
  );
  const outputShimFilepath = path.join(
    cwd,
    "modules/expo-app-icon/src/generated/module.ts"
  );
  const { stdout } = await spawnAsync(
    "sourcekitten",
    ["structure", "--file", fp],
    { cwd }
  );
  const raw = fs.readFileSync(fp, "utf8");
  const data = JSON.parse(stdout) as RootAST;

  const outputDef: OutputDef = {
    funcs: [],
    getters: [],
  };

  const moduleDef = deepSearchForModuleDefinition(
    // @ts-expect-error
    data,
    "ModuleDefinition"
  );

  if (!moduleDef) {
    throw new Error("No module definition found");
  }

  const moduleNameDef = queryASTShallow(
    moduleDef,
    (ast) =>
      ast["key.kind"] === "source.lang.swift.expr.call" &&
      ast["key.name"] === "Name"
  );

  if (moduleNameDef) {
    const offset = moduleNameDef["key.substructure"]![0];
    outputDef.name = raw.substring(
      offset["key.offset"] + 1,
      offset["key.offset"] + (offset["key.length"] - 1)
    );
  }

  const constantsDef = queryASTShallow(moduleDef, (ast) => {
    return (
      ast["key.kind"] === "source.lang.swift.expr.call" &&
      ast["key.name"] === "Constants"
    );
  });

  function rawForOffset(offset: number, length: number): string {
    const v = raw.slice(offset, offset + length);

    // Strip quotes if present
    return v.replace(/^"(.*)"$/, "$1");
  }

  function rawForKeyElement(elm: KeyElement): string {
    // Strip quotes if present
    return rawForOffset(elm["key.offset"], elm["key.length"]);
  }

  if (constantsDef) {
    const dict = constantsDef["key.substructure"]![0]["key.substructure"]![0];
    if (dict["key.kind"] !== "source.lang.swift.expr.dictionary") {
      throw new Error("Expected dictionary");
    }
    const elms = dict["key.elements"]!;
    // console.log("consts:", elms);
    for (let i = 0; i < elms.length / 2; i++) {
      const key = dict["key.elements"]![i * 2];
      const value = dict["key.elements"]![i * 2 + 1];
      const keyStr = rawForKeyElement(key);
      const valueStr = rawForKeyElement(value);
      if (!outputDef.constants) {
        outputDef.constants = {};
      }
      outputDef.constants[keyStr] = swiftTypeToTypeScript(valueStr);
    }
  }

  function processFuncDef(
    ast: Substructure,
    type: "async" | "sync" | "getter"
  ) {
    const funcNameDef = ast["key.substructure"]![0];
    const funcName = rawForOffset(
      funcNameDef["key.bodyoffset"]!,
      funcNameDef["key.bodylength"]!
    );

    const bodyDef = ast["key.substructure"]![1]["key.substructure"]![0];
    if (bodyDef["key.kind"] !== "source.lang.swift.expr.closure") {
      throw new Error("Expected closure as second param for: " + funcName);
    }

    const params = queryAll(
      bodyDef,
      (ast) => ast["key.kind"] === "source.lang.swift.decl.var.parameter"
    );

    // Drop the last param if it's a promise since this is the callback
    if (
      type === "async" &&
      params.length &&
      params[params.length - 1]["key.typename"] === "Promise"
    ) {
      params.pop();
    }

    const args = params.map((param) => {
      const typename = param["key.typename"]!;
      return {
        name: param["key.name"]!,
        type: swiftTypeToTypeScript(typename),
      };
    });
    const returnType =
      type === "async"
        ? "Promise<unknown>"
        : bodyDef["key.typename"]
        ? swiftTypeToTypeScript(bodyDef["key.typename"])
        : "unknown";
    if (type === "getter") {
      console.log("getter", funcName, bodyDef);
      outputDef.getters.push({
        name: funcName,
        returnType,
        readonly: true,
      });
    } else {
      outputDef.funcs.push({
        name: funcName,
        args,
        returnType,
      });
    }
    // console.log(
    //   "ast",
    //   bodyDef
    //   //   rawForOffset(
    //   //     ast["key.substructure"]![1]["key.bodyoffset"]!,
    //   //     ast["key.substructure"]![1]["key.bodylength"]!
    //   //   )
    // );
  }

  queryAll(moduleDef, (ast) => {
    return (
      ast["key.kind"] === "source.lang.swift.expr.call" &&
      //   ["Function"].includes(ast["key.name"]!)
      ["AsyncFunction", "Function"].includes(ast["key.name"]!)
    );
  }).map((ast) => {
    processFuncDef(ast, ast["key.name"] === "AsyncFunction" ? "async" : "sync");
  });

  //   console.log(moduleDef);
  queryAll(moduleDef, (ast) => {
    return (
      ast["key.kind"] === "source.lang.swift.expr.call" &&
      //   ["Function"].includes(ast["key.name"]!)
      ["Property"].includes(ast["key.name"]!)
    );
  }).map((ast) => {
    processFuncDef(ast, "getter");
  });
  queryAll(moduleDef, (ast) => {
    return (
      ast["key.kind"] === "source.lang.swift.expr.call" &&
      //   ["Function"].includes(ast["key.name"]!)
      ast["key.name"]!.startsWith('Property("')
    );
  }).map((ast) => {
    console.log("ff", ast);
    // processFuncDef(ast, "getter");
  });

  console.log(
    "\ndata",
    require("util").inspect(outputDef, { depth: 23, colors: true })
  );
  //   console.log("printOutputDef", printOutputDef(outputDef));
  // console.log("data", moduleDef, moduleNameDef, outputDef);

  await fs.promises.mkdir(path.dirname(outputFilepath), { recursive: true });
  await fs.promises.writeFile(outputFilepath, printOutputDef(outputDef));
  await fs.promises.writeFile(
    outputShimFilepath,
    printOutputDefShim(outputDef)
  );
}

function printOutputDef(def: OutputDef): string {
  return `import { requireNativeModule } from "expo-modules-core";

export interface NativeModule {
  // Functions
${def.funcs
  .map((func) => {
    return `  ${func.name}(${func.args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(", ")}): ${func.returnType};`;
  })
  .join("\n")}

  // Constants
${
  def.constants
    ? Object.entries(def.constants).map(([key, value]) => {
        return `  ${key}: ${value};`;
      })
    : ""
}

  // Properties
${def.getters.map((getter) => {
  return `  readonly ${getter.name}: ${getter.returnType};`;
})}

}

export default requireNativeModule("${def.name}") as NativeModule;
`;
}
function printOutputDefShim(def: OutputDef): string {
  return `export interface NativeModule {
  // Functions
${def.funcs
  .map((func) => {
    return `  ${func.name}(${func.args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(", ")}): ${func.returnType};`;
  })
  .join("\n")}

  // Constants
${
  def.constants
    ? Object.entries(def.constants).map(([key, value]) => {
        return `  ${key}: ${value};`;
      })
    : ""
}

  // Properties
${def.getters.map((getter) => {
  return `  readonly ${getter.name}: ${getter.returnType};`;
})}
}

export default {
  get name() {
    return "${def.name}";
  },
} as Partial<NativeModule>;
`;
}

const CONVERT_TYPES = {
  String: "string",
  Int: "number",
  Bool: "boolean",
  Double: "number",
  Float: "number",
};

function swiftTypeToTypeScript(typename: string): string {
  const isOptional = typename.endsWith("?");
  const addOptional = (str: string) => str + (isOptional ? " | null" : "");
  typename = typename.replace(/\?$/, "");

  if (typename in CONVERT_TYPES) {
    // @ts-expect-error
    return addOptional(CONVERT_TYPES[typename]);
  }

  if (typename.startsWith("Array<")) {
    return addOptional(
      "(" + swiftTypeToTypeScript(typename.slice(6, -1)) + ")[]"
    );
  }

  console.warn("Unknown type:", typename);
  return addOptional('unknown /* "' + typename + '" */');
}

function queryASTShallow(
  ast: Substructure,
  test: (ast: Substructure) => boolean
): Substructure | null {
  for (const substructure of ast["key.substructure"] ?? []) {
    if (test(substructure)) {
      return substructure;
    }
  }

  return null;
}
function queryAll(
  ast: Substructure,
  test: (ast: Substructure) => boolean
): Substructure[] {
  const results: Substructure[] = [];
  for (const substructure of ast["key.substructure"] ?? []) {
    if (test(substructure)) {
      results.push(substructure);
    }
  }

  return results;
}
function queryAST(
  ast: Substructure,
  test: (ast: Substructure) => boolean
): Substructure | null {
  for (const substructure of ast["key.substructure"] ?? []) {
    if (test(substructure)) {
      return substructure;
    }
    return queryAST(substructure, test);
  }

  return null;
}
function deepSearchForModuleDefinition(
  ast: Substructure,
  type: string
): Substructure | null {
  return queryAST(ast, (substructure) => substructure["key.typename"] === type);
}

doAsync().catch((error) => {
  console.error(error);
  process.exit(1);
});

export interface RootAST {
  "key.diagnostic_stage": string;
  "key.length": number;
  "key.offset": number;
  "key.substructure": Substructure[];
}

export interface KeyElement {
  "key.kind": string;
  "key.length": number;
  "key.offset": number;
}

export interface KeyInheritedtype {
  "key.name": string;
}

export interface Substructure {
  "key.bodylength"?: number;
  "key.bodyoffset"?: number;
  "key.kind": string;
  "key.length": number;
  "key.name"?: string;
  "key.namelength": number;
  "key.nameoffset": number;
  "key.offset": number;
  "key.substructure"?: Substructure[];
  "key.elements"?: KeyElement[];
  "key.typename"?: string;
  "key.accessibility": string;
  "key.attributes"?: KeyAttribute[];
  "key.inheritedtypes"?: KeyInheritedtype[];
}

export interface KeyAttribute {
  "key.attribute": string;
  "key.length": number;
  "key.offset": number;
}
