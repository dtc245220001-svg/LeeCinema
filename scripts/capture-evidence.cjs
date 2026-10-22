require('dotenv').config({quiet:true});
const {chromium}=require('@playwright/test');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.TEST_URL||'http://localhost:3003';
const grafana=process.env.GRAFANA_URL||'http://localhost:3002';
const pma=process.env.PMA_URL||'http://localhost:8082';
const prom=process.env.PROMETHEUS_URL||'http://localhost:9091';
const dir='docs/evidence';fs.mkdirSync(dir,{recursive:true});
const manifest={time:new Date().toISOString(),screenshots:[],failures:[]};
const escape=s=>String(s).split('\n').map(line=>line.trimEnd()).join('\n').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const docker=args=>execFileSync('docker',args,{encoding:'utf8'}).trim();
async function shot(page,file,label){await page.screenshot({path:path.join(dir,file),fullPage:false});manifest.screenshots.push({file,label,url:page.url(),capturedAt:new Date().toISOString()});console.log('Captured '+file);}
async function renderedEvidence(page,file,title,sections){
 const html=`<!doctype html><meta charset="utf-8"><style>body{font-family:Segoe UI,sans-serif;margin:40px;background:#f4f7fa;color:#15293b}h1{font-size:26px}h2{font-size:17px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:white;border:1px solid #cad6df;padding:15px;font-size:13px}p{color:#526575}</style><h1>${escape(title)}</h1><p>Phiếu kiểm chứng tự động từ dữ liệu thật; không phải ảnh chụp cửa sổ terminal. Thời điểm: ${escape(new Date().toISOString())}</p>${sections.map(([name,body])=>`<h2>${escape(name)}</h2><pre>${escape(body)}</pre>`).join('')}`;
 fs.writeFileSync(path.join(dir,file.replace('.png','.html')),html);
 await page.setContent(html);await shot(page,file,title);
}
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1080}}),page=await context.newPage();
 await page.goto(base+'/#movies');await page.locator('.movie').first().waitFor();
 await page.locator('.movie button').first().click();await page.locator('.seat').first().waitFor();
 const booked=page.locator('.seat.booked');assert(await booked.count()>0,'Run verify first to create booked seats');
 await shot(page,'07-booked-seat.png','Ghế đã đặt bị vô hiệu hóa trên giao diện');
 await page.locator('.seat:not([disabled])').first().click();await page.locator('#booking').scrollIntoViewIfNeeded();await shot(page,'04-seats.png','Sơ đồ ghế trống, đang chọn, đã đặt và tổng tiền');
 await page.locator('[name="name"]').fill('Khach Minh Chung');await page.locator('[name="email"]').fill('evidence@example.test');await page.locator('#confirm').click();await page.locator('#receipt:not([hidden])').waitFor();await page.locator('#receipt').scrollIntoViewIfNeeded();await shot(page,'05-receipt.png','Mã vé thật tạo trong phiên chụp minh chứng');
 await page.goto(base+'/#schedule');await page.locator('.schedule-card').first().waitFor();await shot(page,'06-schedule.png','Ngày và các suất chiếu đang có');
 const proof=JSON.parse(fs.readFileSync('docs/persistence-check.json'));
 const conflict=await fetch(base+'/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({showtimeId:proof.showtimeId,seatIds:[proof.seatId],name:'Khach Demo',email:'demo@example.test'})});
 const conflictData=await conflict.json();assert.equal(conflict.status,409);
 const rsp=await fetch(base+'/api/health');const allowed=['content-security-policy','x-content-type-options','x-frame-options','referrer-policy','permissions-policy'];
 const hdr=allowed.map(h=>`${h}: ${rsp.headers.get(h)}`).join('\n');
 const compose=['compose','-f','compose.yaml','-f','compose.monitoring.yaml','-f','compose.logging.yaml'];
 const status=docker([...compose,'ps']);
 await renderedEvidence(page,'08-stack.png','Trạng thái Docker Compose của Lee Cinema',[['Lệnh','docker compose -f compose.yaml -f compose.monitoring.yaml -f compose.logging.yaml ps'],['Kết quả thật',status]]);
 const inspect=JSON.parse(docker(['inspect',docker(['compose','ps','-q','app'])]))[0];
 const db=JSON.parse(docker(['inspect',docker(['compose','ps','-q','db'])]))[0];
 await renderedEvidence(page,'09-hardening.png','Quyền container, mạng và security headers',[['Ứng dụng',JSON.stringify({user:inspect.Config.User,readOnly:inspect.HostConfig.ReadonlyRootfs,capDrop:inspect.HostConfig.CapDrop,securityOpt:inspect.HostConfig.SecurityOpt,networks:Object.keys(inspect.NetworkSettings.Networks)},null,2)],['MySQL',JSON.stringify({publishedPorts:db.HostConfig.PortBindings,networks:Object.keys(db.NetworkSettings.Networks)},null,2)],['GET /api/health qua Nginx',hdr]]);
 await renderedEvidence(page,'10-conflict.png','Kiểm chứng từ chối đặt trùng ghế',[['Phương thức','POST /api/bookings — yêu cầu ghế đã có trong persistence-check.json'],['HTTP status',String(conflict.status)],['Phản hồi API',JSON.stringify(conflictData,null,2)],['Kết quả kiểm thử thật',fs.readFileSync('docs/evidence/test-results.json','utf8').slice(0,8500)]]);
 await page.goto(prom+'/targets');await page.getByText('nginx',{exact:true}).first().waitFor({timeout:30000}).catch(()=>{});await page.waitForTimeout(1500);await shot(page,'11-prometheus-targets.png','Prometheus targets thực tế');
 // phpMyAdmin login: password is entered only into the form, never captured.
 try{
 await page.goto(pma);await page.locator('input[name="pma_username"]').fill('cinema_app');await page.locator('input[name="pma_password"]').fill(process.env.DB_PASSWORD);await page.locator('input[type="submit"],button[type="submit"]').first().click();
 await page.locator('#pma_navigation').waitFor({timeout:30000});
 const safeQuery='SELECT id,code,showtime_id,total,payment_status,created_at FROM bookings ORDER BY id DESC LIMIT 10';
 await page.goto(pma+'/index.php?route=/sql&db=cinema&table=bookings&server=1');
 await Promise.all([page.waitForNavigation({waitUntil:'domcontentloaded'}),page.evaluate(query=>{
  const token=document.querySelector('input[name="token"]')?.value||window.CommonParams?.get('token');if(!token)throw new Error('Missing phpMyAdmin CSRF token');
  const form=document.createElement('form');form.method='POST';form.action='index.php?route=/sql';
  for(const [key,value] of Object.entries({token,server:'1',db:'cinema',table:'bookings',sql_query:query})){const input=document.createElement('input');input.type='hidden';input.name=key;input.value=value;form.append(input);}document.body.append(form);form.submit();
 },safeQuery)]);
 await page.waitForTimeout(1000);assert.equal(await page.locator('input[name="pma_password"]').count(),0);assert(!(await page.locator('body').innerText()).includes('customer_email'));assert((await page.locator('body').innerText()).includes('payment_status'));await shot(page,'12-phpmyadmin-bookings.png','Đơn mới nhất trong phpMyAdmin, không hiển thị tên/email khách');
 await page.goto(pma+'/index.php?route=/sql&db=cinema&table=booking_seats&server=1');await page.waitForTimeout(1000);await shot(page,'13-phpmyadmin-seats.png','Chi tiết ghế booking_seats trong phpMyAdmin');
 }catch(e){manifest.failures.push({service:'phpMyAdmin',error:e.message});console.log('phpMyAdmin capture failed: '+e.message);}
 const gcontext=await browser.newContext({viewport:{width:1920,height:1100}}),gp=await gcontext.newPage();
 try{
 await gp.goto(grafana+'/login');
 await gp.locator('input[name="user"]').waitFor({state:'visible',timeout:30000});
 if(await gp.locator('input[name="user"]').count()){
 await gp.locator('input[name="user"]').fill('admin');await gp.locator('input[name="password"]').fill(process.env.GRAFANA_PASSWORD);await gp.getByRole('button',{name:/Log in|Sign in/i}).click();await gp.waitForURL(url=>!url.pathname.includes('/login'),{timeout:30000});}
 await gp.goto(grafana+'/d/leecinema?orgId=1&from=now-15m&to=now&refresh=15s');await gp.getByText('MySQL sẵn sàng (1 = OK)',{exact:true}).waitFor({timeout:30000});await gp.waitForTimeout(3500);await shot(gp,'14-grafana-web-db.png','Dashboard Nginx và MySQL có dữ liệu');
 await gp.getByText('CPU từng container · leecinema',{exact:true}).scrollIntoViewIfNeeded();await gp.waitForTimeout(1000);await shot(gp,'15-grafana-containers.png','Dashboard CPU/RAM container thực tế');
 await gp.goto(grafana+'/connections/datasources');await gp.getByText('Prometheus',{exact:true}).first().waitFor({timeout:30000});await shot(gp,'16-grafana-datasources.png','Datasource Prometheus và Loki được provision');
 const queries=[['17-logql-app.png','{project="leecinema",service="app"} | json'],['18-logql-errors.png','{project="leecinema",service="app"} | json | status >= 400'],['19-logql-count.png','sum by (service) (count_over_time({project="leecinema"}[1m]))']];
 for(const [file,expr] of queries){const panes={a:{datasource:'loki',queries:[{refId:'A',expr,queryType:'range',editorMode:'code',datasource:{type:'loki',uid:'loki'}}],range:{from:'now-15m',to:'now'}}};await gp.goto(grafana+'/explore?schemaVersion=1&panes='+encodeURIComponent(JSON.stringify(panes))+'&orgId=1');await gp.waitForTimeout(5000);await shot(gp,file,'Grafana Explore LogQL, Last 15 minutes: '+expr);}
 }catch(e){manifest.failures.push({service:'Grafana',error:e.message});console.log('Grafana capture failed: '+e.message);console.log('URL: '+gp.url());console.log((await gp.locator('body').innerText()).slice(0,1800));}
 const git=execFileSync('git',['-c','safe.directory=C:/dat-ve-xem-phim','log','--oneline','-5'],{encoding:'utf8'});
 await renderedEvidence(page,'20-git-local.png','Lịch sử Git cục bộ',[['Ba mốc và các commit hoàn thiện',git],['GitHub','Tài khoản được cung cấp: https://github.com/dtc245220001-svg. Repository/push chỉ được ghi nhận khi có URL thực và xác minh thành công.']]);
 }finally{fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));await browser.close();}
 if(manifest.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exit(1)});
