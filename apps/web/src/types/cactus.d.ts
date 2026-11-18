/** Emscripten module for the vendored Cactus engine (src/vendor/cactus/cactus.mjs). */
declare module "@/vendor/cactus/cactus.mjs" {
  export type CactusModule = {
    /** Replaced when WASM memory grows: read it again after every `_malloc`. */
    HEAPU8: Uint8Array;
    _malloc(size: number): number;
    _free(ptr: number): void;
    UTF8ToString(ptr: number): string;
    /** `n` is an `unsigned long long`, passed as a BigInt. */
    _cactus_load(cact: number, n: bigint): number;
    _cactus_models(): number;
    _cactus_last_error(): number;
    _cactus_describe(
      rgb: number,
      width: number,
      height: number,
      options: number,
      language: number,
      keywords: number,
      out: number,
      outCapacity: number,
    ): number;
  };

  /** Pass `wasmBinary`: the loader looks for cactus.wasm next to the calling script otherwise. */
  const createCactus: (options?: { wasmBinary?: ArrayBuffer }) => Promise<CactusModule>;
  export default createCactus;
}
