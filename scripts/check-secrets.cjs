const fs=require('node:fs');const {execFileSync}=require('node:child_process');const dotenv=require('dotenv');
const files=execFileSync('git',['-c','safe.directory=C:/dat-ve-xem-phim','ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const values=Object.entries(dotenv.parse(fs.readFileSync('.env'))).filter(([key,value])=>/PASSWORD|TOKEN|SECRET/.test(key)&&value.length>=12).map(([,value])=>Buffer.from(value));
const failures=[];
for(const file of files){if(file==='.env'||file==='monitoring/mysql/exporter.cnf'||file==='docs/report-student.local.json'||file.startsWith('tmp/')){failures.push(file);continue;}if(fs.existsSync(file)){const data=fs.readFileSync(file);if(values.some(value=>data.includes(value)))failures.push(file);}}
if(failures.length){console.error('Refusing publication; sensitive files/values detected in: '+failures.join(', '));process.exit(1);}
console.log('PASS: tracked files exclude local credentials and contain none of the configured secret values.');
