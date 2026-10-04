import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const guard = pathToFileURL(process.cwd() + '/lib/security.mjs').href;
const source = readFileSync('app/api/generate/route.js', 'utf8')
 .replace("import { NextResponse } from 'next/server';", 'const NextResponse = Response;')
 .replace("'../../../lib/security.mjs'", JSON.stringify(guard));
const { POST } = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('authorization and streamed validation happen before provider access', async () => {
 let calls=0;
 const original=globalThis.fetch;
 globalThis.fetch=async()=>{calls++; return Response.json({content:[{text:'Allowed response'}]});};
 process.env.ANTHROPIC_API_KEY='test-only';
 const token='a'.repeat(48);
 const req=(body,auth)=>new Request('https://example.test/api/generate',{method:'POST',headers:auth?{authorization:'Bearer '+auth}:{},body});
 try {
  delete process.env.STAYDRY_STAFF_ACCESS_TOKEN;
  assert.equal((await POST(req('{}', token))).status,503);
  process.env.STAYDRY_STAFF_ACCESS_TOKEN=token;
  assert.equal((await POST(req('{}'))).status,401);
  assert.equal((await POST(req('{}','wrong'))).status,401);
  assert.equal((await POST(req('x'.repeat(17000),token))).status,413);
  assert.equal((await POST(req('[]',token))).status,400);
  assert.equal((await POST(req('{"clientName":42}',token))).status,400);
  assert.equal(calls,0);
  assert.equal((await POST(req('{"clientName":"Staff"}',token))).status,200);
  assert.equal(calls,1);
 } finally { globalThis.fetch=original; delete process.env.ANTHROPIC_API_KEY; delete process.env.STAYDRY_STAFF_ACCESS_TOKEN; }
});
test('legacy route delegates to guarded handler and browser does not embed credential',()=>{
 assert.match(readFileSync('api/generate/route.js','utf8'),/export .* from/);
 for(const p of ['app/page.jsx','page.jsx'])assert.match(readFileSync(p,'utf8'),/Bearer \$\{accessCode\}/);
});
