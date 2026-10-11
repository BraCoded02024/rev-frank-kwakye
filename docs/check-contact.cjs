const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = ts.transpileModule(fs.readFileSync('app/actions/contact.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function scenario(env, fetch, data) {
  const exports = {};
  vm.runInNewContext(source,{exports,require:(id)=>id==='zod'?require('zod'):{privateContact:{email:'test@example.invalid'}},process:{env},fetch,AbortSignal,Date,Map});
  return exports.sendInvitation(null,data);
}
(async()=>{
const valid=new FormData();
for(const [key,value] of Object.entries({name:'Test visitor',phone:'0502800896',email:'visitor@example.invalid',eventDate:'Next month',venue:'Test venue',theme:'Test theme',audience:'Test audience',assignment:'Test assignment',company:''}))valid.set(key,value);
assert.equal((await scenario({},()=>{throw Error('must not send')},new FormData())).ok,false);
const draft = await scenario({},()=>{throw Error('must not send')},valid);
assert.equal(draft.ok,true);
assert.match(draft.mailto,/^mailto:test@example\.invalid\?/);
const env={RESEND_API_KEY:'fake-test-key',INVITE_FROM_EMAIL:'test@example.invalid'};
assert.equal((await scenario(env,async()=>{throw Error('offline')},valid)).ok,false);
assert.equal((await scenario(env,async()=>({ok:false}),valid)).ok,false);
assert.equal((await scenario(env,async()=>({ok:true}),valid)).ok,true);
console.log('PASS: invitation validation, missing configuration, network rejection, provider rejection, mocked success. No messages sent.');
})().catch(e=>{console.error(e);process.exitCode=1});
