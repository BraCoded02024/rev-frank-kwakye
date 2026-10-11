// Isolated visual fixture; never mounted in Next or shipped as an admin route.
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
const directory = resolve("artifacts/admin-preview");
mkdirSync(directory, { recursive: true });
async function preview() {
  const fixtureAlias = { "next/link": resolve("tests/fixtures/Link.tsx") };
  await build({ alias: fixtureAlias, stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {AdminEditor} from './app/admin/AdminEditor'; import {defaultPayload} from './lib/cms/schema'; createRoot(document.getElementById('root')).render(<div className="admin-workspace"><div style={{padding:'12px 24px',background:'#e8d7b4',color:'#3f3424'}}>LOCAL LAYOUT FIXTURE · simulated saves · no authentication or database connection</div><AdminEditor initial={null} defaults={defaultPayload} loadError={null}/></div>);`, resolveDir: process.cwd(), loader: "tsx" }, outfile: resolve(directory, "bundle.js"), bundle: true, jsx: "automatic", define: { "process.env.NODE_ENV": '"development"' }, plugins: [{ name: "fixture-actions", setup(plugin) {
    plugin.onResolve({ filter: /^\.\/actions$/ }, args => args.importer.endsWith("AdminEditor.tsx") ? { path: "fixture-actions", namespace: "fixture" } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: `import {payloadSchema} from '${resolve("lib/cms/schema.ts").replace(/\\/g,"/")}'; let previous=null; export async function signOut(){throw new Error('Use the real sign-in page; this fixture has no session.')} export async function saveContent(_,form){const parsed=payloadSchema.safeParse(JSON.parse(form.get('payload')));if(!parsed.success)return {error:parsed.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; ')};if(form.get('review')==='true'&&form.get('confirmReview')!=='on')return {error:'Confirm the pastor has reviewed the saved content.'};const reviewed=form.get('review')==='true';previous={payload:parsed.data,revision:Number(form.get('revision'))+1,reviewed_by_pastor:reviewed,updated_at:new Date().toISOString(),reviewed_at:reviewed?new Date().toISOString():null};return {success:'Fixture save only. No real content has changed.',record:previous};}`, loader: "ts", resolveDir: process.cwd() }));
  } }] });
  writeFileSync(resolve(directory, "index.html"), `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin layout fixture</title><style>html,body{margin:0;font-family:Arial,sans-serif;--font-serif:Georgia;--font-sans:Arial} ${readFileSync("app/admin/admin.css","utf8")}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`);
  createServer((request, response) => {
    const file = request.url === "/bundle.js" ? "bundle.js" : "index.html";
    response.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : "text/html");
    response.end(readFileSync(resolve(directory, file)));
  }).listen(3400, "127.0.0.1", () => console.log("Isolated admin layout fixture: http://127.0.0.1:3400 — simulated saves only."));
}
preview().catch(error => { console.error(error); process.exitCode = 1; });
