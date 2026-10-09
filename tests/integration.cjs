const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.TEST_URL||'http://localhost:3003';
async function request(url,body){const r=await fetch(base+url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});return {status:r.status,data:await r.json(),headers:r.headers};}
(async()=>{
const health=await request('/api/health');assert.equal(health.status,200);assert.equal(health.data.database,'connected');assert.equal(health.headers.get('x-content-type-options'),'nosniff');
const movies=await request('/api/movies');assert.equal(movies.status,200);assert(movies.data.length>=3);
const empty=await request('/api/movies?q=zzzzzzzz');assert.equal(empty.data.length,0);
const shows=(await request(`/api/movies/${movies.data[0].id}/showtimes`)).data;const show=shows[0];assert(show);
const seats=(await request(`/api/showtimes/${show.id}/seats`)).data.filter(s=>!s.booked);assert(seats.length>=4,'Need at least four free seats');
const payload={showtimeId:show.id,seatIds:[seats[0].id],name:'Khach Demo',email:'demo@example.test',total:1};
assert.equal((await request('/api/bookings',{...payload,email:'invalid'})).status,400);
assert.equal((await request('/api/bookings',{...payload,seatIds:[seats[0].id,seats[0].id]})).status,400);
const wrongShow=shows.find(s=>s.room!==show.room);const wrongSeat=(await request(`/api/showtimes/${wrongShow.id}/seats`)).data[0];assert.equal((await request('/api/bookings',{...payload,seatIds:[wrongSeat.id]})).status,400);
const first=await request('/api/bookings',payload);assert.equal(first.status,201);assert.equal(first.data.total,Number(show.price));assert(first.data.code.startsWith('VE-'));
assert.equal((await request('/api/bookings',payload)).status,409);
const concurrent={...payload,seatIds:[seats[1].id]};const race=await Promise.all([request('/api/bookings',concurrent),request('/api/bookings',concurrent)]);assert.deepEqual(race.map(r=>r.status).sort(),[201,409]);
assert.equal((await request('/api/bookings',{...payload,seatIds:[seats[0].id,seats[2].id]})).status,409);
const after=(await request(`/api/showtimes/${show.id}/seats`)).data;assert.equal(after.find(s=>s.id===seats[2].id).booked,0);assert.equal(after.find(s=>s.id===seats[0].id).booked,1);
fs.writeFileSync('docs/persistence-check.json',JSON.stringify({showtimeId:show.id,seatId:seats[0].id,code:first.data.code},null,2));
console.log('PASS: health, headers, search, validation, wrong room, booking, server price, duplicate, simultaneous 201/409, atomic rollback.');
})().catch(e=>{console.error(e);process.exit(1)});
