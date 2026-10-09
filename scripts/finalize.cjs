const fs=require('node:fs');
let app=fs.readFileSync('public/app.js','utf8');
app=app.replace("shows=await api(`/api/movies/${movie.id}/showtimes`);if(version!==showVersion)return;", "const loaded=await api(`/api/movies/${movie.id}/showtimes`);if(version!==showVersion)return;shows=loaded;");
fs.writeFileSync('public/app.js',app);
let css=fs.readFileSync('public/style.css','utf8');css=css.replace('height:300px;object-fit:cover','height:340px;object-fit:cover;object-position:bottom');fs.writeFileSync('public/style.css',css);
