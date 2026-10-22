const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
process.chdir(path.join(__dirname,'..'));
fs.mkdirSync('docs/evidence',{recursive:true});
const result = {time:new Date().toISOString(),timezone:'Asia/Saigon',cases:[]};
function run(name,exe,args){
  const r=spawnSync(exe,args,{encoding:'utf8',timeout:180000});
  const row={name,command:[exe,...args].join(' '),exitCode:r.status,output:(r.stdout||'')+(r.stderr||'')};
  result.cases.push(row); console.log(`${r.status===0?'PASS':'FAIL'}: ${name}`);
  if(r.status!==0) console.log(row.output);
  fs.writeFileSync('docs/evidence/test-results.json',JSON.stringify(result,null,2));
  return r.status===0;
}
for(const [name,file,args=[]] of [
 ['API / tranh chap ghe','integration.cjs'],['Trinh duyet desktop mobile','browser.cjs'],
 ['Prometheus exporters','monitoring.cjs'],['Grafana datasources va panels','grafana.cjs',['--loki']],
 ['Loki va LogQL','logging.cjs'],['Hardening va database','hardening.cjs'],['Khoi tao database rong','fresh-init.cjs']
]) if(!run(name,process.execPath,['tests/'+file,...args])) process.exitCode=1;
const compose=['compose','-f','compose.yaml','-f','compose.monitoring.yaml','-f','compose.logging.yaml'];
if(run('Restart rieng dich vu du an','docker',[...compose,'restart','db','app','nginx'])&&
 run('Cho dich vu healthy','docker',[...compose,'up','-d','--wait','db','app','nginx']))
 if(!run('Du lieu sau restart',process.execPath,['tests/persistence.cjs']))process.exitCode=1;
if(result.cases.some(c=>c.exitCode!==0))process.exitCode=1;
result.passed=!process.exitCode;
fs.writeFileSync('docs/evidence/test-results.json',JSON.stringify(result,null,2));
console.log(result.passed?'ALL CHECKS PASSED':'SOME CHECKS FAILED; see docs/evidence/test-results.json');
