import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "node_modules", "@react-three", "fiber", "dist");
const needle = "clock: new THREE.Clock(),";
const replacement = "clock: new (class{constructor(autoStart=!0){this.autoStart=autoStart;this.startTime=0;this.oldTime=0;this.elapsedTime=0;this.running=!1}start(){this.startTime=performance.now();this.oldTime=this.startTime;this.elapsedTime=0;this.running=!0}stop(){this.getElapsedTime();this.running=!1;this.autoStart=!1}getElapsedTime(){this.getDelta();return this.elapsedTime}getDelta(){if(this.autoStart&&!this.running){this.start();return 0}if(!this.running)return 0;const t=performance.now();const d=(t-this.oldTime)/1000;this.oldTime=t;this.elapsedTime+=d;return d}})(),";
const mark = "this.autoStart=autoStart;this.startTime=0;this.oldTime=0;this.elapsedTime=0;this.running=!1";

function files(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files(path, out);
    else if (name.endsWith(".js")) out.push(path);
  }
  return out;
}

let patched = 0;
let already = 0;
for (const file of files(root)) {
  const text = readFileSync(file, "utf8");
  if (text.includes(needle)) {
    writeFileSync(file, text.replaceAll(needle, replacement));
    patched += 1;
  } else if (text.includes(mark)) already += 1;
}
if (!patched && !already) console.warn("react-three-fiber clock patch found nothing to change.");
