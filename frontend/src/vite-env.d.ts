/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_MAP_STYLE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'maplibre-gl/dist/maplibre-gl.css' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}