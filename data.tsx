// SHIM TRANSICIONAL — F2 commit 6. Eliminado en commit 7.
// Re-exporta DATA_SOURCE_OF_TRUTH desde src/data/. Consumers raíz
// (App.tsx en /src) mantienen import path '../data' inalterado.
export { DATA_SOURCE_OF_TRUTH } from './src/data';
