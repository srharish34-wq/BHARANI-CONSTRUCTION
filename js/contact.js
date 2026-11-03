/* Contact page script. Self-contained: shared header, popup and reveal, plus the enquiry form, copy buttons and stars */
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
  const text = `*New Enquiry – Bharani Website (Contact page)*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AService: ${enc(f.get('service'))}%0AMessage: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  e.target.reset(); closeModal();
};

/* missing images show a soft blue placeholder instead of a broken icon */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);
document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('noimg'); });

/* toast helper */
const toast = msg => { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };

/* page enquiry form: validates, then opens WhatsApp with the details */
const cf = $('#contactForm');
cf.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  cf.querySelectorAll('[required]').forEach(el => { const bad = !el.checkValidity(); el.classList.toggle('bad', bad); if (bad) ok = false; });
  if (!ok) return toast('Please fill the highlighted fields');
  const f = new FormData(cf);
  const text = `*New Enquiry – Bharani Website (Contact page)*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AEmail: ${enc(f.get('email') || '-')}%0AService: ${enc(f.get('service'))}%0ASite: ${enc(f.get('loc') || '-')}%0ADetails: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  $('#ok').classList.add('show');
});
cf.addEventListener('input', e => e.target.classList.remove('bad'));
$('#okBtn').onclick = () => { cf.reset(); $('#ok').classList.remove('show'); };

/* copy address */
$('#copyAddr').onclick = () => {
  const t = 'Plot G1, C Block, Bringapuri Apartment, Rajeswari Street, Kamarajar Nagar, Choolaimedu, Chennai – 600 094';
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Address copied'), () => toast('Copy not supported on this browser'));
};

/* twinkling stars in the social section */
const sw = $('#stars');
for (let i = 0; i < 26; i++) { const s = document.createElement('i'); s.textContent = '★'; s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${8+Math.random()*14}px;animation-delay:${Math.random()*5}s`; sw.appendChild(s); }