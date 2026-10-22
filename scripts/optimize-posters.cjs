const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');
const names = ['space','summer','city','cloud','race','trip','music','mist','forest','letter','moon','river'];
async function main() {
  for (const name of names) {
    const input = path.join(__dirname, '../tmp/artwork-input', name + '.png');
    const output = path.join(__dirname, '../public/posters', name + '.webp');
    if (!fs.existsSync(input)) throw new Error('Missing generated source: ' + name);
    await sharp(input).resize(768, 1152, {fit:'cover',position:'centre'}).webp({quality:82}).toFile(output);
    console.log(name + ': ' + Math.round(fs.statSync(output).size / 1024) + ' KB');
  }
}
main().catch(e => {console.error(e.message); process.exit(1);});
