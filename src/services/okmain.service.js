import initOkmain, { extract_dominant_colors_rgba, init_panic_hook } from '../../pkg/okmain_wasm.js';
import { readFile } from 'node:fs/promises';

let initPromise;

async function initializeOkmain() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const wasmPath = new URL('../../pkg/okmain_wasm_bg.wasm', import.meta.url);
        const wasmBytes = await readFile(wasmPath);
        await initOkmain({ module_or_path: wasmBytes });
        init_panic_hook();
      } catch (error) {
        initPromise = undefined;
        throw error;
      }
    })();
  }

  return initPromise;
}

async function extractDominantColorsRgba(width, height, rgba) {
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error(`Invalid image width: ${width}`);
  }

  if (!Number.isInteger(height) || height <= 0) {
    throw new Error(`Invalid image height: ${height}`);
  }

  if (!(rgba instanceof Uint8Array)) {
    throw new Error('RGBA payload must be a Uint8Array.');
  }

  const expectedLength = width * height * 4;
  if (rgba.length !== expectedLength) {
    throw new Error(`Unexpected RGBA length: expected ${expectedLength}, got ${rgba.length}`);
  }

  await initializeOkmain();
  return extract_dominant_colors_rgba(width, height, rgba);
}

export { extractDominantColorsRgba };
