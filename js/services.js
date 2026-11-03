/* Services page script. Self-contained: shared header, popup and reveal behaviour plus menu spy and card tilt */
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

/* enquiry modal: header button, and automatically every 1 minute */
const modal = $('#modal');
const openModal = svc => { const sel = $('#enqForm select'); if (typeof svc === 'string' && svc) sel.value = svc; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
document.querySelectorAll('[data-open-enquiry]').forEach(b => b.onclick = () => openModal(b.dataset.svc));
$('#mClose').onclick = closeModal;
modal.onclick = e => e.target === modal && closeModal();
addEventListener('keydown', e => e.key === 'Escape' && closeModal());
setInterval(() => { if (!modal.classList.contains('open')) openModal(); }, POPUP_EVERY_MS);
$('#enqForm').onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const text = `*New Enquiry – Bharani Website (Services page)*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AService: ${enc(f.get('service'))}%0AMessage: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  e.target.reset(); closeModal();
};

/* missing images show a soft blue placeholder instead of a broken icon */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);
document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('noimg'); });

/* sticky menu: highlight the section being read */
const links = [...document.querySelectorAll('#snav a')];
const secs = links.map(a => $(a.getAttribute('href')));
const spy = () => {
  let cur = 0; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < 200) cur = i; });
  links.forEach((a, i) => a.classList.toggle('on', i === cur));
  const on = links[cur]; if (on && $('#snav').scrollWidth > $('#snav').clientWidth) $('#snav').scrollTo({ left: on.offsetLeft - 40, behavior: 'smooth' });
};
addEventListener('scroll', spy, { passive: true }); spy();

/* 3D tilt on type cards (mouse devices only) */
if (matchMedia('(hover:hover)').matches) document.querySelectorAll('.sc').forEach(c => {
  c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); c.style.transform = `perspective(700px) rotateY(${((e.clientX - r.left) / r.width - .5) * 9}deg) rotateX(${(.5 - (e.clientY - r.top) / r.height) * 9}deg) translateY(-6px)`; });
  c.addEventListener('mouseleave', () => c.style.transform = '');
});

/* gentle parallax on the main service photos */
const mi = [...document.querySelectorAll('.mimg img')];
addEventListener('scroll', () => mi.forEach(i => { const r = i.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) i.style.objectPosition = `50% ${50 + (r.top / innerHeight - .5) * 30}%`; }), { passive: true });