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
  const data = crawlAndConvertKeys(JSON.parse(stdout)) as RootAST;

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
      ast["kind"] === "source.lang.swift.expr.call" && ast["name"] === "Name"
  );

  if (moduleNameDef) {
    const offset = moduleNameDef["substructure"]![0];
    outputDef.name = raw.substring(
      offset["offset"] + 1,
      offset["offset"] + (offset["length"] - 1)
    );
  }

  const constantsDef = queryASTShallow(moduleDef, (ast) => {
    return (
      ast["kind"] === "source.lang.swift.expr.call" &&
      ast["name"] === "Constants"
    );
  });

  function rawForOffset(offset: number, length: number): string {
    const v = raw.slice(offset, offset + length);

    // Strip quotes if present
    return v.replace(/^"(.*)"$/, "$1");
  }

  function rawForKeyElement(elm: KeyElement): string {
    // Strip quotes if present
    return rawForOffset(elm["offset"], elm["length"]);
  }

  if (constantsDef) {
    const dict = constantsDef["substructure"]![0]["substructure"]![0];
    if (dict["kind"] !== "source.lang.swift.expr.dictionary") {
      throw new Error("Expected dictionary");
    }
    const elms = dict["elements"]!;
    // console.log("consts:", elms);
    for (let i = 0; i < elms.length / 2; i++) {
      const key = dict["elements"]![i * 2];
      const value = dict["elements"]![i * 2 + 1];
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
    const funcNameDef = ast["substructure"]![0];
    const funcName = rawForOffset(
      funcNameDef["bodyoffset"]!,
      funcNameDef["bodylength"]!
    );

    const bodyDef = ast["substructure"]![1]["substructure"]![0];
    if (bodyDef["kind"] !== "source.lang.swift.expr.closure") {
      throw new Error("Expected closure as second param for: " + funcName);
    }

    const params = queryAll(
      bodyDef,
      (ast) => ast["kind"] === "source.lang.swift.decl.var.parameter"
    );

    // Drop the last param if it's a promise since this is the callback
    if (
      type === "async" &&
      params.length &&
      params[params.length - 1]["typename"] === "Promise"
    ) {
      params.pop();
    }

    const args = params.map((param) => {
      const typename = param["typename"]!;
      return {
        name: param["name"]!,
        type: swiftTypeToTypeScript(typename),
      };
    });
    const returnType =
      type === "async"
        ? "Promise<unknown>"
        : bodyDef["typename"]
        ? swiftTypeToTypeScript(bodyDef["typename"])
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
    //   //     ast["substructure"]![1]["bodyoffset"]!,
    //   //     ast["substructure"]![1]["bodylength"]!
    //   //   )
    // );
  }

  queryAll(moduleDef, (ast) => {
    return (
      ast["kind"] === "source.lang.swift.expr.call" &&
      //   ["Function"].includes(ast["name"]!)
      ["AsyncFunction", "Function"].includes(ast["name"]!)
    );
  }).map((ast) => {
    processFuncDef(ast, ast["name"] === "AsyncFunction" ? "async" : "sync");
  });

  //   console.log(moduleDef);
  queryAll(moduleDef, (ast) => {
    return (
      ast["kind"] === "source.lang.swift.expr.call" &&
      //   ["Function"].includes(ast["name"]!)
      ["Property"].includes(ast["name"]!)
    );
  }).map((ast) => {
    processFuncDef(ast, "getter");
  });
  queryAll(moduleDef, (ast) => {
    return (
      ast["kind"] === "source.lang.swift.expr.call" &&
      //   ["Function"].includes(ast["name"]!)
      ast["name"]!.startsWith('Property("')
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
  for (const substructure of ast["substructure"] ?? []) {
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
  for (const substructure of ast["substructure"] ?? []) {
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
  for (const substructure of ast["substructure"] ?? []) {
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
  return queryAST(ast, (substructure) => substructure["typename"] === type);
}

doAsync().catch((error) => {
  console.error(error);
  process.exit(1);
});

function crawlAndConvertKeys(ast: any): any {
  if (typeof ast !== "object") {
    return ast;
  }
  if (Array.isArray(ast)) {
    return ast.map(crawlAndConvertKeys);
  }

  // Crawl and strip the `key.` prefix from all keys
  const newAst: any = {};
  for (const [key, value] of Object.entries(ast)) {
    const newKey = key.replace(/^key\./, "");
    newAst[newKey] = crawlAndConvertKeys(value);
  }
  return newAst;
}

export interface RootAST {
  diagnostic_stage: string;
  length: number;
  offset: number;
  substructure: Substructure[];
}

export interface KeyElement {
  kind: string;
  length: number;
  offset: number;
}

export interface KeyInheritedtype {
  name: string;
}

export interface Substructure {
  bodylength?: number;
  bodyoffset?: number;
  kind: string;
  length: number;
  name?: string;
  namelength: number;
  nameoffset: number;
  offset: number;
  substructure?: Substructure[];
  elements?: KeyElement[];
  typename?: string;
  accessibility: string;
  attributes?: KeyAttribute[];
  inheritedtypes?: KeyInheritedtype[];
}

export interface KeyAttribute {
  attribute: string;
  length: number;
  offset: number;
}
