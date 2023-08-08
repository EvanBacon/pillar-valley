#!/usr/bin/env ts-node

import fs from "node:fs";
import path from "node:path";
import spawnAsync from "@expo/spawn-async";

// sourcekitten structure --file modules/expo-app-icon/ios/ExpoAppIconModule.swift

async function doAsync() {
  const cwd = path.resolve(__dirname, "..");
  const fp = path.join(
    cwd,
    "modules/expo-app-icon/ios/ExpoAppIconModule.swift"
  );
  const { stdout } = await spawnAsync(
    "sourcekitten",
    ["structure", "--file", fp],
    { cwd }
  );
  const raw = fs.readFileSync(fp, "utf8");
  const data = JSON.parse(stdout) as RootAST;

  let outputDef: {
    name?: string;
    constants?: Record<
      // name
      string,
      // type
      string
    >;
  } = {};

  const moduleDef = deepSearchForModuleDefinition(
    // @ts-expect-error
    data,
    "ModuleDefinition"
  );

  if (!moduleDef) {
    throw new Error("No module definition found");
  }

  const moduleNameDef = queryAST(
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

  const constantsDef = queryAST(moduleDef, (ast) => {
    console.log("test:", ast);
    return (
      ast["key.kind"] === "source.lang.swift.expr.call" &&
      ast["key.name"] === "Constants"
    );
  });

  //   console.log("constantsDef", moduleDef, constantsDef);
  if (constantsDef) {
    // const offset = constantsDef["key.substructure"]![0];
    // outputDef.name = raw.substring(
    //   offset["key.offset"] + 1,
    //   offset["key.offset"] + (offset["key.length"] - 1)
    // );
  }

  //   console.log("data", moduleDef, moduleNameDef, outputDef);
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
