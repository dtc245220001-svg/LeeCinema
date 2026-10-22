require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const app = express();
const pool = mysql.createPool({host:process.env.DB_HOST || 'db',user:process.env.DB_USER || 'cinema_app',password:process.env.DB_PASSWORD,database:'cinema',connectionLimit:10,timezone:'+07:00',dateStrings:true});
const logDir=process.env.LOG_DIR || path.join(__dirname,'logs');fs.mkdirSync(logDir,{recursive:true});
function log(record){const line=JSON.stringify({time:new Date().toISOString(),...record});console.log(line);fs.appendFileSync(path.join(logDir,'app.log'),line+'\n');}
app.disable('x-powered-by');
app.use((req,res,next)=>{const start=Date.now();res.on('finish',()=>log({level:res.statusCode>=500?'error':res.statusCode>=400?'warn':'info',service:'app',method:req.method,path:req.path,status:res.statusCode,duration_ms:Date.now()-start}));next();});
app.use(express.json({limit:'16kb'}));app.use(express.static(path.join(__dirname,'public')));
app.get('/api/health',async(req,res,next)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}catch(e){next(e);}});
app.get('/api/movies',async(req,res,next)=>{try{const [rows]=await pool.execute('SELECT * FROM movies WHERE title LIKE ? ORDER BY id',['%'+String(req.query.q||'').slice(0,100)+'%']);res.json(rows);}catch(e){next(e);}});
app.get('/api/showtimes',async(req,res,next)=>{try{const [rows]=await pool.query(`SELECT s.id,s.movie_id,s.starts_at,s.price,m.title,m.genre,m.duration,m.poster,r.name AS room,(SELECT COUNT(*) FROM seats a WHERE a.room_id=s.room_id)-(SELECT COUNT(*) FROM booking_seats b WHERE b.showtime_id=s.id) AS available FROM showtimes s JOIN movies m ON m.id=s.movie_id JOIN rooms r ON r.id=s.room_id WHERE s.starts_at>NOW() AND s.starts_at<DATE_ADD(NOW(),INTERVAL 14 DAY) ORDER BY s.starts_at,m.title LIMIT 500`);res.json(rows);}catch(e){next(e);}});
app.get('/api/movies/:id/showtimes',async(req,res,next)=>{try{const [rows]=await pool.execute('SELECT s.id,s.starts_at,s.price,r.name AS room FROM showtimes s JOIN rooms r ON r.id=s.room_id WHERE s.movie_id=? AND s.starts_at>NOW() ORDER BY s.starts_at',[req.params.id]);res.json(rows);}catch(e){next(e);}});
app.get('/api/showtimes/:id/seats',async(req,res,next)=>{try{const [rows]=await pool.execute('SELECT a.id,a.row_label,a.seat_number,EXISTS(SELECT 1 FROM booking_seats b WHERE b.showtime_id=s.id AND b.seat_id=a.id) AS booked FROM showtimes s JOIN seats a ON a.room_id=s.room_id WHERE s.id=? ORDER BY a.row_label,a.seat_number',[req.params.id]);if(!rows.length)return res.status(404).json({error:'Không tìm thấy suất chiếu.'});res.json(rows);}catch(e){next(e);}});
app.post('/api/bookings',async(req,res,next)=>{
 const {showtimeId,seatIds,name,email}=req.body||{};
 if(!Number.isSafeInteger(showtimeId)||!Array.isArray(seatIds)||seatIds.length<1||seatIds.length>8||seatIds.some(x=>!Number.isSafeInteger(x)||x<1)||new Set(seatIds).size!==seatIds.length||typeof name!=='string'||name.trim().length<2||name.trim().length>100||typeof email!=='string'||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Chọn 1–8 ghế, nhập họ tên và email hợp lệ.'});
 let conn;
 try{conn=await pool.getConnection();await conn.beginTransaction();
 const [shows]=await conn.execute('SELECT * FROM showtimes WHERE id=? AND starts_at>NOW() FOR UPDATE',[showtimeId]);
 if(!shows.length){await conn.rollback();return res.status(404).json({error:'Suất chiếu không còn khả dụng.'});}
 const show=shows[0],ids=[...seatIds].sort((a,b)=>a-b),slots=ids.map(()=>'?').join(',');
 const [[metadata]]=await conn.execute('SELECT m.title,r.name AS room FROM movies m JOIN rooms r ON r.id=? WHERE m.id=?',[show.room_id,show.movie_id]);
 Object.assign(show,metadata);
 const [seats]=await conn.execute(`SELECT id,CONCAT(row_label,seat_number) AS label FROM seats WHERE room_id=? AND id IN (${slots}) ORDER BY id`,[show.room_id,...ids]);
 if(seats.length!==ids.length){await conn.rollback();return res.status(400).json({error:'Ghế không thuộc phòng chiếu.'});}
 const [taken]=await conn.execute(`SELECT seat_id FROM booking_seats WHERE showtime_id=? AND seat_id IN (${slots})`,[showtimeId,...ids]);
 if(taken.length){await conn.rollback();return res.status(409).json({error:'Ghế vừa được đặt. Vui lòng chọn ghế khác.'});}
 const total=Number(show.price)*ids.length,code='VE-'+crypto.randomBytes(8).toString('hex').toUpperCase();
 const [result]=await conn.execute('INSERT INTO bookings(code,showtime_id,customer_name,customer_email,total,payment_status) VALUES(?,?,?,?,?,?)',[code,showtimeId,name.trim(),email.trim(),total,'simulated']);
 for(const id of ids)await conn.execute('INSERT INTO booking_seats(booking_id,showtime_id,seat_id,unit_price) VALUES(?,?,?,?)',[result.insertId,showtimeId,id,show.price]);
 await conn.commit();res.status(201).json({code,movie:show.title,starts_at:show.starts_at,room:show.room,seats:seats.map(s=>s.label),total,payment:'Thanh toán giả lập'});
 }catch(e){if(conn)await conn.rollback();if(e.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Ghế vừa được đặt. Vui lòng chọn ghế khác.'});next(e);}finally{if(conn)conn.release();}
});
app.use('/api',(req,res)=>res.status(404).json({error:'Không tìm thấy API.'}));
app.use((err,req,res,next)=>{if(err.type==='entity.parse.failed')return res.status(400).json({error:'JSON không hợp lệ.'});log({level:'error',service:'app',event:'request_failed',code:err.code||'INTERNAL'});res.status(503).json({error:'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại.'});});
const server=app.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>log({level:'info',service:'app',event:'started'}));
process.on('SIGTERM',()=>server.close(async()=>{await pool.end();process.exit(0);}));
