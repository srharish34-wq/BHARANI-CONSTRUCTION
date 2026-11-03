/* Projects page script. Self-contained: shared header, popup and reveal, plus photo sliders, client filter and lightbox */
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
  const text = `*New Enquiry – Bharani Website (Projects page)*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AService: ${enc(f.get('service'))}%0AMessage: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  e.target.reset(); closeModal();
};

/* missing images show a soft blue placeholder instead of a broken icon */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);
document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('noimg'); });

/* photo sliders: auto-slide while visible, arrows, dots, swipe, click to enlarge */
const lbEl = document.createElement('div');
lbEl.className = 'lb2';
lbEl.innerHTML = '<button class="lx" aria-label="Close">×</button><button class="lp" aria-label="Previous">‹</button><img alt=""><button class="ln" aria-label="Next">›</button><p></p>';
document.body.appendChild(lbEl);
let lbImgs = [], lbI = 0;
const lbShow = () => { const im = lbImgs[lbI]; lbEl.querySelector('img').src = im.src; lbEl.querySelector('p').textContent = im.alt + '  (' + (lbI + 1) + ' / ' + lbImgs.length + ')'; };
const lbMove = d => { lbI = (lbI + d + lbImgs.length) % lbImgs.length; lbShow(); };
const lbClose = () => lbEl.classList.remove('open');
lbEl.querySelector('.lx').onclick = lbClose; lbEl.querySelector('.lp').onclick = () => lbMove(-1); lbEl.querySelector('.ln').onclick = () => lbMove(1);
lbEl.onclick = e => e.target === lbEl && lbClose();
addEventListener('keydown', e => { if (!lbEl.classList.contains('open')) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowRight') lbMove(1); if (e.key === 'ArrowLeft') lbMove(-1); });

const sliders = [...document.querySelectorAll('[data-slider]')].map((sl, k) => {
  const track = sl.querySelector('.track'), slides = [...track.children], n = slides.length;
  const dots = sl.querySelector('.dots'), cnt = sl.querySelector('.cnt'), bar = sl.querySelector('.bar');
  dots.innerHTML = slides.map(() => '<b></b>').join('');
  const dEls = [...dots.children];
  let i = 0, timer = null, drag = null;
  const go = j => {
    i = (j + n) % n; track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, x) => s.classList.toggle('on', x === i));
    dEls.forEach((d, x) => d.classList.toggle('on', x === i));
    cnt.textContent = `${i + 1} / ${n}`;
    bar.classList.remove('run'); void bar.offsetWidth; if (timer) bar.classList.add('run');
  };
  const play = () => { stop(); timer = setInterval(() => go(i + 1), 3800 + k * 150); bar.classList.add('run'); };
  const stop = () => { clearInterval(timer); timer = null; bar.classList.remove('run'); };
  sl.querySelector('.prev').onclick = e => { e.stopPropagation(); go(i - 1); if (timer) play(); };
  sl.querySelector('.next').onclick = e => { e.stopPropagation(); go(i + 1); if (timer) play(); };
  dEls.forEach((d, x) => d.onclick = e => { e.stopPropagation(); go(x); if (timer) play(); });
  sl.addEventListener('mouseenter', stop); sl.addEventListener('mouseleave', play);
  sl.addEventListener('pointerdown', e => { drag = e.clientX; });
  sl.addEventListener('pointerup', e => { if (drag === null) return; const d = e.clientX - drag; drag = null;
    if (Math.abs(d) > 40) { go(i + (d < 0 ? 1 : -1)); }
    else if (!e.target.closest('button,.dots')) { lbImgs = [...sl.querySelectorAll('img')]; lbI = i; lbShow(); lbEl.classList.add('open'); } });
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play() : stop()), { threshold: .35 }).observe(sl);
  go(0); stop();
  return { go };
});

/* client filter */
document.querySelectorAll('#fchips button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#fchips button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  document.querySelectorAll('.prow').forEach(r => {
    const show = b.dataset.f === 'all' || r.dataset.client === b.dataset.f;
    r.classList.toggle('hide', !show); r.classList.remove('pop');
    if (show) { r.classList.add('in'); void r.offsetWidth; r.classList.add('pop'); }
  });
});

/* open a project directly from a link such as projects.html#jamna-peb-building */
if (location.hash) { const t = document.querySelector(location.hash); t && t.classList.contains('prow') && setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 400); }