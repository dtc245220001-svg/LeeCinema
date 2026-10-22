'use strict';
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
let shows = [], allMovies = [], selected = new Set(), currentShow = null;
let busy = false, movieVersion = 0, seatVersion = 0, showVersion = 0, selectedGenre = '';
let scheduleShows = [], scheduleDate = '', scheduleVersion = 0;
async function api(url, options) {
  const res = await fetch(url, options);
  let data;
  try { data = await res.json(); } catch { throw new Error('Không thể đọc phản hồi. Vui lòng thử lại.'); }
  if (!res.ok) { const err = new Error(data.error || 'Không thể tải dữ liệu.'); err.status = res.status; throw err; }
  return data;
}
function element(tag, text, className) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  if (className) e.className = className;
  return e;
}
function setupGenres() {
  selectedGenre = '';
}
async function loadMovies() {
  const version = ++movieVersion;
  $('movie-status').textContent = 'Đang tải phim…';
  try {
    const result = await api('/api/movies?q=' + encodeURIComponent($('search').value));
    if (version !== movieVersion) return;
    if (!$('search').value && !allMovies.length) {
      allMovies = result; $('movie-count').textContent = String(result.length).padStart(2, '0'); setupGenres();
    }
    const movies = result.filter(m => !selectedGenre || m.genre === selectedGenre);
    $('movie-list').replaceChildren();
    $('movie-status').textContent = movies.length ? '' : 'Không có phim phù hợp.';
    for (const m of movies) {
      const card = element('article', undefined, 'movie');
      const visual = element('div', undefined, 'movie-visual');
      const img = element('img'); img.src = m.poster; img.alt = 'Áp phích minh họa ' + m.title; img.width = 512; img.height = 768;
      const badge = element('span', 'ĐANG CHIẾU', 'movie-badge');
      visual.append(img, badge);
      const body = element('div', undefined, 'movie-content');
      body.append(element('p', m.genre, 'movie-genre'), element('h3', m.title), element('p', `${m.duration} phút · Phim demo`, 'movie-meta'));
      const button = element('button', 'Chi tiết & đặt vé ↗'); button.type = 'button'; button.onclick = () => openMovie(m);
      body.append(button); card.append(visual, body); $('movie-list').append(card);
    }
  } catch (e) { if (version === movieVersion) $('movie-status').textContent = e.message; }
}
function updateTotal() {
  $('selected-seats').textContent = selected.size ? 'Ghế: ' + [...selected].map(id => document.querySelector(`[data-seat="${id}"]`).textContent).join(', ') : 'Chưa chọn ghế';
  $('unit-price').textContent = currentShow ? money(currentShow.price) : '—';
  $('total').textContent = money(selected.size * (currentShow?.price || 0));
  $('confirm').disabled = busy || !currentShow || !selected.size;
}
async function openMovie(movie, preferredShowId) {
  if (busy) return;
  const version = ++showVersion; ++seatVersion;
  $('booking').hidden = false; $('receipt').hidden = true;
  $('booking-poster').src = movie.poster; $('booking-poster').alt = 'Áp phích ' + movie.title;
  $('movie-title').textContent = movie.title;
  $('movie-detail').textContent = `${movie.genre} · ${movie.duration} phút`;
  $('description').textContent = movie.description;
  $('form-status').textContent = ''; $('date').replaceChildren(); $('showtime').replaceChildren(); $('seats').replaceChildren();
  currentShow = null; selected.clear(); updateTotal();
  $('seat-status').textContent = 'Đang tải lịch chiếu…'; $('booking').scrollIntoView({ behavior: 'smooth' });
  try {
    const loaded = await api(`/api/movies/${movie.id}/showtimes`);
    if (version !== showVersion) return;
    shows = loaded;
    for (const date of [...new Set(shows.map(s => s.starts_at.slice(0, 10)))]) {
      const o = element('option', date.split('-').reverse().join('/')); o.value = date; $('date').append(o);
    }
    if (!shows.length) { $('seat-status').textContent = 'Chưa có suất chiếu sắp tới.'; return; }
    const preferred = shows.find(s => s.id === preferredShowId);
    if (preferred) $('date').value = preferred.starts_at.slice(0, 10);
    await changeDate(preferred?.id);
  } catch (e) { if (version === showVersion) $('seat-status').textContent = e.message; }
}
async function changeDate(preferredId) {
  $('showtime').replaceChildren();
  for (const s of shows.filter(s => s.starts_at.startsWith($('date').value))) {
    const o = element('option', `${s.starts_at.slice(11, 16)} · ${s.room} · ${money(s.price)}`); o.value = s.id; $('showtime').append(o);
  }
  if (preferredId) $('showtime').value = preferredId;
  await loadSeats();
}
async function loadSeats() {
  const version = ++seatVersion;
  currentShow = shows.find(s => s.id === Number($('showtime').value)); selected.clear(); $('seats').replaceChildren(); updateTotal();
  if (!currentShow) return;
  $('seat-status').textContent = 'Đang tải ghế…';
  try {
    const seats = await api(`/api/showtimes/${currentShow.id}/seats`);
    if (version !== seatVersion) return;
    for (const seat of seats) {
      const label = seat.row_label + seat.seat_number;
      const b = element('button', label, 'seat' + (seat.booked ? ' booked' : ''));
      b.type = 'button'; b.dataset.seat = seat.id; b.disabled = !!seat.booked;
      b.setAttribute('aria-label', `Ghế ${label}${seat.booked ? ', đã đặt' : ''}`); b.setAttribute('aria-pressed', 'false');
      b.onclick = () => {
        if (busy) return;
        if (selected.has(seat.id)) selected.delete(seat.id);
        else { if (selected.size >= 8) { $('form-status').textContent = 'Mỗi lần đặt tối đa 8 ghế.'; return; } selected.add(seat.id); }
        b.classList.toggle('selected', selected.has(seat.id)); b.setAttribute('aria-pressed', String(selected.has(seat.id))); updateTotal();
      };
      $('seats').append(b);
    }
    $('seat-status').textContent = seats.every(s => s.booked) ? 'Suất chiếu đã hết ghế.' : 'Chọn tối đa 8 ghế. Ghế chỉ được giữ sau khi xác nhận.';
  } catch (e) { if (version === seatVersion) { currentShow = null; updateTotal(); $('seat-status').textContent = e.message; } }
}
$('booking-form').onsubmit = async event => {
  event.preventDefault(); if (busy || !currentShow || !selected.size) return;
  busy = true; updateTotal(); $('date').disabled = true; $('showtime').disabled = true; $('form-status').textContent = 'Đang xác nhận đặt vé…';
  const form = new FormData(event.target);
  try {
    const result = await api('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ showtimeId: currentShow.id, seatIds: [...selected], name: form.get('name'), email: form.get('email'), phone: form.get('phone') }) });
    $('receipt-empty')?.remove(); $('receipt-code').textContent = result.code; $('receipt-info').replaceChildren();
    for (const [key, val] of [['Phim', result.movie], ['Suất chiếu', result.starts_at], ['Phòng', result.room], ['Ghế', result.seats.join(', ')], ['Tổng tiền', money(result.total)]]) $('receipt-info').append(element('dt', key), element('dd', val));
    $('receipt').hidden = false; location.hash = 'receipt'; $('receipt').scrollIntoView({ behavior: 'smooth' }); $('form-status').textContent = 'Đặt vé thành công.';
    await loadSeats(); scheduleShows = [];
  } catch (e) { $('form-status').textContent = e.message; if (e.status === 409) await loadSeats(); }
  finally { busy = false; $('date').disabled = false; $('showtime').disabled = false; updateTotal(); }
};
function renderSchedule() {
  $('schedule-list').replaceChildren();
  const rows = scheduleShows.filter(s => s.starts_at.startsWith(scheduleDate));
  $('schedule-status').textContent = rows.length ? `${rows.length} suất chiếu · Giá và ghế trống theo dữ liệu hiện tại` : 'Chưa có suất chiếu trong ngày này.';
  const movieIds = [...new Set(rows.map(s => s.movie_id))];
  for (const id of movieIds) {
    const sessions = rows.filter(s => s.movie_id === id), movie = sessions[0];
    const card = element('article', undefined, 'schedule-card');
    const img = element('img'); img.src = movie.poster; img.alt = 'Áp phích ' + movie.title; img.loading = 'lazy';
    const info = element('div', undefined, 'schedule-info'); info.append(element('h3', movie.title), element('p', `${movie.genre} · ${movie.duration} phút`));
    const times = element('div', undefined, 'schedule-times');
    for (const s of sessions) {
      const b = element('button', undefined, 'showtime-button'); b.type = 'button';
      b.append(element('strong', s.starts_at.slice(11, 16)), element('span', `${s.room} · ${money(s.price)}`), element('small', s.available > 0 ? `${s.available} ghế trống` : 'Hết ghế'));
      b.disabled = s.available <= 0;
      b.onclick = async () => { try { if (!allMovies.length) allMovies = await api('/api/movies'); const full = allMovies.find(m => m.id === id); if (full) await openMovie(full, s.id); } catch (e) { $('schedule-status').textContent = e.message; } };
      times.append(b);
    }
    info.append(times); card.append(img, info); $('schedule-list').append(card);
  }
}
async function loadSchedule() {
  const version = ++scheduleVersion;
  $('schedule-status').textContent = 'Đang tải lịch chiếu…'; $('schedule-list').replaceChildren(); $('schedule-dates').replaceChildren();
  try {
    const rows = await api('/api/showtimes'); if (version !== scheduleVersion) return;
    scheduleShows = rows; const dates = [...new Set(rows.map(s => s.starts_at.slice(0, 10)))];
    if (!dates.includes(scheduleDate)) scheduleDate = dates[0] || '';
    for (const date of dates) {
      const parsed = new Date(date + 'T12:00:00+07:00');
      const b = element('button', undefined, 'date-tab'); b.type = 'button'; b.dataset.date = date;
      b.append(element('span', new Intl.DateTimeFormat('vi-VN', { weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(parsed)), element('strong', date.slice(8) + '/' + date.slice(5, 7)));
      b.classList.toggle('active', date === scheduleDate); b.setAttribute('aria-pressed', String(date === scheduleDate));
      b.onclick = () => { scheduleDate = date; for (const tab of $('schedule-dates').children) { tab.classList.toggle('active', tab.dataset.date === date); tab.setAttribute('aria-pressed', String(tab.dataset.date === date)); } renderSchedule(); };
      $('schedule-dates').append(b);
    }
    renderSchedule();
  } catch (e) { if (version === scheduleVersion) $('schedule-status').textContent = e.message; }
}
function route() {
  const valid = ['home', 'movies', 'schedule', 'receipt', 'guide'];
  const hash = location.hash.slice(1); const current = valid.includes(hash) ? hash : 'home';
  const visible = current === 'home' ? ['home', 'catalog'] : [current === 'movies' ? 'catalog' : current];
  for (const view of document.querySelectorAll('[data-view]')) view.hidden = !visible.includes(view.dataset.view);
  for (const link of document.querySelectorAll('[data-route]')) { link.classList.toggle('active', link.dataset.route === current); if (link.dataset.route === current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); }
  const names = { home: 'Trang chủ', movies: 'Phim đang chiếu', schedule: 'Lịch chiếu', receipt: 'Vé của tôi', guide: 'Hướng dẫn' };
  document.title = 'Lee Cinema · ' + names[current];
  $('navigation').classList.remove('open'); $('menu-toggle').setAttribute('aria-expanded', 'false');
  if (!busy && current !== 'receipt') { ++showVersion; ++seatVersion; $('booking').hidden = true; $('receipt').hidden = true; }
  if (current === 'schedule') loadSchedule();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
$('menu-toggle').onclick = () => { const open = $('navigation').classList.toggle('open'); $('menu-toggle').setAttribute('aria-expanded', String(open)); };
$('date').onchange = () => changeDate(); $('showtime').onchange = loadSeats;
$('close-booking').onclick = () => { if (busy) return; ++showVersion; ++seatVersion; $('booking').hidden = true; };
let timer; $('search').oninput = () => { clearTimeout(timer); timer = setTimeout(loadMovies, 250); };
window.addEventListener('hashchange', route); route(); loadMovies();
