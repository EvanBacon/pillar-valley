// Reexport the native module. On web, it will be resolved to TargetLinksModule.web.ts
// and on native platforms to TargetLinksModule.ts
export { default } from "./src/TargetLinksModule";
export * from "./src/TargetLinks.types";
