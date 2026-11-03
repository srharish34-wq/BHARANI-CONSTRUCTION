/* About page script. Self-contained: includes the shared header, popup, and reveal behaviour */
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

/* timeline line grows as you scroll */
const tl = $('#tl');
const growTl = () => {
  const r = tl.getBoundingClientRect();
  tl.style.setProperty('--g', Math.min(Math.max((innerHeight * .7 - r.top) / r.height, 0), 1));
};
addEventListener('scroll', growTl, { passive: true }); growTl();

/* expertise tabs */
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tabs button, .panel').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); $('#' + b.dataset.tab).classList.add('on');
});

/* client photo marquee: duplicate cards for a seamless loop */
const pt = $('#photoTrack');
pt.innerHTML += pt.innerHTML;

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
  const text = `*New Enquiry – Bharani Website (About page)*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AService: ${enc(f.get('service'))}%0AMessage: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  e.target.reset(); closeModal();
};

/* missing images show a soft blue placeholder instead of a broken icon */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);
document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('noimg'); });