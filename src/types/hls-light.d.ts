// hls.js ships its light build without type declarations; it has the same API as the full build.
declare module "hls.js/light" {
  export * from "hls.js";
  export { default } from "hls.js";
}
