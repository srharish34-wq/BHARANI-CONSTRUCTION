/* Clients page script. Self-contained: shared header, popup and reveal, plus industry filter and the 3D review ring */
const WA = '919361703989';            // client WhatsApp number
const POPUP_EVERY_MS = 60000;         // enquiry popup interval (1 minute)
const $ = (s, r = document) => r.querySelector(s);
const enc = encodeURIComponent;

/* header, menu, year, progress bar */
const hdr = $('#hdr');
addEventListener('scroll', () => {
  hdr.classList.toggle('sc', scrollY > 20);
  $('#prog').style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
}, { passive: true });
$('#burger').onclick = () => $('#nav').classList.toggle('open');
$('#nav').onclick = e => e.target.tagName === 'A' && $('#nav').classList.remove('open');
$('#yr').textContent = new Date().getFullYear();

/* scroll reveal */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

/* count-up numbers */
const nio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; nio.unobserve(e.target);
  const el = e.target, end = +el.dataset.cnt, t0 = performance.now();
  const step = t => { const p = Math.min((t - t0) / 2000, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}), { threshold: .6 });
document.querySelectorAll('[data-cnt]').forEach(el => nio.observe(el));

/* enquiry modal: header button, and automatically every 1 minute */
const modal = $('#modal');
const openModal = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
document.querySelectorAll('[data-open-enquiry]').forEach(b => b.onclick = openModal);
$('#mClose').onclick = closeModal;
modal.onclick = e => e.target === modal && closeModal();
addEventListener('keydown', e => e.key === 'Escape' && closeModal());
setInterval(() => { if (!modal.classList.contains('open')) openModal(); }, POPUP_EVERY_MS);
$('#enqForm').onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = `*New Enquiry – Bharani Website (Clients page)*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AService: ${enc(f.get('service'))}%0AMessage: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  e.target.reset(); closeModal();
};

/* missing images show a soft blue placeholder instead of a broken icon */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);
document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('noimg'); });

/* industry filter */
document.querySelectorAll('#fchips button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#fchips button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  document.querySelectorAll('.crow').forEach(r => {
    const show = b.dataset.f === 'all' || r.dataset.ind === b.dataset.f;
    r.classList.toggle('hide', !show); r.classList.remove('pop');
    if (show) { r.classList.add('in'); void r.offsetWidth; r.classList.add('pop'); }
  });
});

/* twinkling stars behind the review ring */
const sw = $('#stars');
for (let i = 0; i < 26; i++) { const s = document.createElement('i'); s.textContent = '★'; s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${8+Math.random()*14}px;animation-delay:${Math.random()*5}s`; sw.appendChild(s); }

/* 3D review ring. SAMPLE REVIEWS: replace each quote with real feedback from the client before launch */
const reviews = [
  ['Jamna Auto Industries','Automobile · Civil and PEB','Civil and PEB works were handled by one team, and the building was handed over on schedule.','#1565C0'],
  ['Mahle Anand Filter Systems','Filter systems · Civil and PEB','A reliable partner for our expansion works. Site coordination with our team was smooth.','#12B5A6'],
  ['Sun Pharmaceuticals Industries','Pharmaceuticals · Civil, road and painting','Civil, road and painting works were completed with attention to safety and tidy execution.','#F28C28'],
  ['ITC Ltd – ATC','Cigarette · BT road and foundations','BT road and foundation works were done to specification with minimal disruption to operations.','#6C4DE6'],
  ['All Cargo Terminals','Cargo · Roofing and painting','Roofing and painting finished cleanly, and the crew worked well within our operating hours.','#E0457B'],
  ['Bimetal Bearings','Bearings · Roofing','The roofing work was neat and weather-tight. We would happily call them again.','#C9A227'],
  ['WEG Industries (India)','Automobile · LPG yard foundation','The LPG yard foundation was executed carefully, with strict safety discipline on site.','#1E88E5']
];
const ring = $('#ring'), dots = $('#dots'), N = reviews.length, step = 360 / N;
ring.innerHTML = reviews.map((r, i) => `<div class="rc" style="--c:${r[3]}"><div class="seal"><span><b>★</b>VERIFIED<br>CLIENT</span></div><div class="st">★★★★★</div><p>${r[2]}</p><h3>${r[0]}</h3><small>${r[1]}</small></div>`).join('');
dots.innerHTML = reviews.map((_, i) => `<i data-i="${i}"></i>`).join('');
const cards = [...ring.children], dotEls = [...dots.children];
let idx = 0, timer;
function layout() {
  const w = cards[0].offsetWidth, R = Math.round((w / 2) / Math.tan(Math.PI / N)) + 50;
  cards.forEach((c, i) => c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px) rotateZ(${i % 2 ? 1.5 : -1.5}deg)`);
  ring.style.transform = `translateZ(${-R}px) rotateY(${-idx * step}deg)`;
  cards.forEach((c, i) => c.classList.toggle('dim', ((i - idx) % N + N) % N !== 0));
  dotEls.forEach((d, i) => d.classList.toggle('on', ((idx % N) + N) % N === i));
}
function go(n) { idx = n; layout(); }
const next = () => go(idx + 1), prev = () => go(idx - 1);
const play = () => { clearInterval(timer); timer = setInterval(next, 4200); };
$('#rNext').onclick = () => { next(); play(); };
$('#rPrev').onclick = () => { prev(); play(); };
dotEls.forEach(d => d.onclick = () => { const t = +d.dataset.i, cur = ((idx % N) + N) % N; go(idx + (t - cur)); play(); });
const stage = $('#stage'); let sx = null;
stage.addEventListener('pointerdown', e => { sx = e.clientX; clearInterval(timer); });
addEventListener('pointerup', e => { if (sx === null) return; const d = e.clientX - sx; if (Math.abs(d) > 40) (d < 0 ? next : prev)(); sx = null; play(); });
stage.addEventListener('mouseenter', () => clearInterval(timer)); stage.addEventListener('mouseleave', play);
addEventListener('resize', layout);
layout(); play();