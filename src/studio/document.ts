// Opaque iframe origin keeps arbitrary game code separate from app identity and native APIs.
// HTTPS assets, libraries, WebGL, and arbitrary game mechanics are supported.
export function playerDocument(html: string) {
  const source = html
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,iframe{margin:0;width:100%;height:100%;border:0;overflow:hidden;background:#101020}</style></head><body><iframe sandbox="allow-scripts allow-pointer-lock" allow="autoplay; fullscreen" srcdoc="${source}"></iframe></body></html>`;
}
