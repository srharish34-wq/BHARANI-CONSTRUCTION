const WA = '919361703989';            // client WhatsApp number
const POPUP_EVERY_MS = 60000;         // enquiry popup interval (1 minute)
const $ = (s, r = document) => r.querySelector(s);
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');

/* header, menu, year */
const hdr = $('#hdr');
addEventListener('scroll', () => hdr.classList.toggle('sc', scrollY > 20), { passive: true });
$('#burger').onclick = () => $('#nav').classList.toggle('open');
$('#nav').onclick = e => e.target.tagName === 'A' && $('#nav').classList.remove('open');
$('#yr').textContent = new Date().getFullYear();

/* scroll reveal */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .15 });
document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

/* hero counters */
document.querySelectorAll('[data-count]').forEach(el => {
  const end = +el.dataset.count, t0 = performance.now();
  const step = t => { const p = Math.min((t - t0) / 1800, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
});

/* client logo marquee: duplicate for seamless loop */
const track = $('#logoTrack');
const logos = [['J','Jamna Auto','#1565C0'],['M','Mahle Anand','#12B5A6'],['S','Sun Pharma','#F28C28'],['I','ITC','#6C4DE6'],['A','All Cargo Terminals','#E0457B'],['B','Bimetal Bearings','#C9A227'],['W','WEG Industries','#1E88E5']];
const lg = logos.map(l => `<div class="lgo" style="--c:${l[2]}"><b>${l[0]}</b>${l[1]}</div>`).join('');
track.innerHTML = lg + lg;   // swap with real <img> logos later if you have them

/* enquiry modal: opens on button, and automatically every 1 minute */
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
  const text = `*New Enquiry – Bharani Website*%0AName: ${enc(f.get('name'))}%0APhone: ${enc(f.get('phone'))}%0AService: ${enc(f.get('service'))}%0AMessage: ${enc(f.get('msg') || '-')}`;
  window.open(`https://wa.me/${WA}?text=${text}`, '_blank', 'noopener');
  e.target.reset(); closeModal();
};
const enc = v => encodeURIComponent(v);

/* cost calculator */
const cType = $('#cType'), cArea = $('#cArea'), cLoc = $('#cLoc');
const calc = () => ({ rate: +cType.value, area: +cArea.value || 0, total: (+cType.value) * (+cArea.value || 0), label: cType.selectedOptions[0].text.split(' (')[0] });
const showCalc = () => $('#cTotal').textContent = inr(calc().total);
[cType, cArea].forEach(el => el.addEventListener('input', showCalc)); showCalc();

$('#cWa').onclick = () => {
  const c = calc();
  window.open(`https://wa.me/${WA}?text=${enc(`Estimate request: ${c.label}, ${c.area} sqft, approx ${inr(c.total)}. Location: ${cLoc.value || '-'}`)}`, '_blank', 'noopener');
};
$('#cPdf').onclick = () => {
  const c = calc(), d = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><title>Bharani Estimate</title><style>
    body{font:15px Arial;color:#222;padding:40px;max-width:720px;margin:auto}
    h1{color:#1E88E5;margin:0}small{color:#8DB32B;font-weight:bold;letter-spacing:1px}
    hr{border:0;border-top:3px solid #C9A227;margin:16px 0}
    table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#0A1F44;color:#fff;text-align:left}
    td,th{padding:10px;border-bottom:1px solid #ddd}.t td{font-weight:bold;background:#FBF3D5}
    p.n{font-size:12px;color:#666;margin-top:24px}</style>
    <h1>BHARANI</h1><small>ENGINEERS &amp; CONTRACTORS</small>
    <p>Plot G1, C Block, Bringapuri Apartment, Rajeswari Street, Choolaimedu, Chennai – 600 094<br>+91 93617 03989 | info@bharaniengineers.com</p><hr>
    <h2>Construction Cost Estimate</h2><p>Date: ${d}<br>Site location: ${cLoc.value || '—'}</p>
    <table><tr><th>Work</th><th>Area (sqft)</th><th>Rate (₹)</th><th>Amount (₹)</th></tr>
    <tr><td>${c.label}</td><td>${c.area.toLocaleString('en-IN')}</td><td>${c.rate.toLocaleString('en-IN')}</td><td>${Math.round(c.total).toLocaleString('en-IN')}</td></tr>
    <tr class="t"><td colspan="3">Total (indicative)</td><td>${inr(c.total)}</td></tr></table>
    <p class="n">This is an indicative estimate. Final cost depends on site conditions, specification and material choices. Choose "Save as PDF" in the print dialog.</p>
    <script>onload=()=>print()<\/script>`);
  w.document.close();
};

/* EMI calculator */
const lAmt = $('#lAmt'), lRate = $('#lRate'), lYr = $('#lYr');
const emi = () => {
  const P = +lAmt.value, r = +lRate.value / 1200, n = +lYr.value * 12;
  const E = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  $('#lAmtV').textContent = inr(P); $('#lRateV').textContent = lRate.value + '%'; $('#lYrV').textContent = lYr.value + ' yrs';
  $('#emiOut').textContent = inr(E); $('#emiInt').textContent = inr(E * n - P);
};
[lAmt, lRate, lYr].forEach(el => el.addEventListener('input', emi)); emi();

/* scroll progress bar */
addEventListener('scroll', () => { $('#prog').style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%'; }, { passive: true });

/* testimonials: 3D card carousel. SAMPLE reviews: replace with real client feedback before launch */
(() => {
  const reviews = [
   ['Roofing was finished ahead of schedule and the finish is neat.','R. Suresh','Plant Head, Auto Components'],
   ['Their PEB shed went up quickly with very little disturbance to production.','K. Anand','Operations Manager, Filter Manufacturer'],
   ['Clear drawings, clear pricing, and the site team kept every promise.','M. Priya','Procurement Lead, Pharma Unit'],
   ['The epoxy flooring has held up well under heavy forklift traffic.','S. Karthik','Factory Manager, Machining Unit'],
   ['Good site safety discipline. No incidents during the whole expansion.','D. Ramesh','EHS Officer, Bearings Plant'],
   ['They handled our paver block yard and compound wall in one go.','A. Vinoth','Maintenance Head, Auto Industry'],
   ['Responsive team. Site engineers answered calls even on Sundays.','P. Lakshmi','Admin Manager, Cargo Terminal'],
   ['Foundation work for our LPG yard was precise and on time.','T. Murugan','Project Engineer, Industrial Plant'],
   ['The mezzanine floor was designed around our crane layout perfectly.','N. Gopal','Works Manager, Engineering Firm'],
   ['Fair rates and no hidden extras at the end of the project.','V. Sundar','Owner, Warehouse Business'],
   ['Floor polishing transformed our assembly bay. Looks brand new.','J. Elango','Plant Head, Auto Supplier'],
   ['We reused Bharani for three expansions. That says enough.','C. Selvam','General Manager, Manufacturing'],
   ['Windows and doors were fitted cleanly and handed over on the date promised.','R. Meena','Facility Manager, Pharma Company'],
   ['Their weekly progress photos made remote monitoring easy.','S. Harish','Director, Logistics Firm'],
   ['Strong with BT roads and internal drains. Water no longer stands on site.','B. Kumar','Estate Manager, Industrial Park'],
   ['Professional crew, tidy site, and quick snag closing.','L. Divya','Quality Head, Filter Systems'],
   ['PEB erection quality is excellent. Alignment was perfect.','G. Mohan','Engineering Manager, Foundry'],
   ['They suggested a cheaper roofing spec that still met our load needs.','H. Raja','Purchase Manager, Packaging Unit'],
   ['Painting and anti-corrosive coating were done without stopping operations.','U. Saravanan','Maintenance Lead, Bearings Plant'],
   ['Honest advice, timely work, and a team that stays till it is done.','E. Bharath','Managing Director, Fabrication Firm'],
   ['Reliable contractor for industrial civil works. Highly recommended.','F. Nagarajan','Plant Manager, Automotive Unit']
  ];
  const colors = ['#1565C0','#12B5A6','#F28C28','#6C4DE6','#E0457B','#C9A227'];
  const stage = $('#vxStage'), N = reviews.length;
  stage.innerHTML = reviews.map((r, i) => `<div class="vx-card" style="--c:${colors[i % 6]}"><div class="seal"><span><b>★</b>HAPPY<br>CLIENT</span></div><div class="st">★★★★★</div><p>“${r[0]}”</p><h3>${r[1]}</h3><small>${r[2]}</small></div>`).join('');
  const cards = [...stage.children];
  let idx = 0, timer, sx = null;

  const layout = () => {
    const dx = cards[0].offsetWidth * .72;
    cards.forEach((c, i) => {
      let off = ((i - idx) % N + N) % N; if (off > N / 2) off -= N;
      const a = Math.abs(off), vis = a <= 2;
      c.style.transform = `translateX(${off * dx}px) translateZ(${-a * 150}px) rotateY(${-off * 32}deg) scale(${vis ? 1 : .7})`;
      c.style.opacity = vis ? [1, .8, .4][a] : 0;
      c.style.zIndex = 10 - a;
      c.style.pointerEvents = vis ? 'auto' : 'none';
      c.classList.toggle('on', off === 0);
    });
    $('#vxCnt').textContent = `${idx + 1} / ${N}`;
  };
  const go = n => { idx = (n % N + N) % N; layout(); };
  const play = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 3800); };

  $('#vxNext').onclick = () => { go(idx + 1); play(); };
  $('#vxPrev').onclick = () => { go(idx - 1); play(); };
  cards.forEach((c, i) => c.onclick = () => { if (i !== idx) { go(i); play(); } });   // click a side card to bring it forward
  stage.addEventListener('pointerdown', e => { sx = e.clientX; clearInterval(timer); });
  addEventListener('pointerup', e => { if (sx === null) return; const d = e.clientX - sx; if (Math.abs(d) > 40) go(idx + (d < 0 ? 1 : -1)); sx = null; play(); });
  stage.addEventListener('mouseenter', () => clearInterval(timer)); stage.addEventListener('mouseleave', play);
  addEventListener('resize', layout);

  const sw = $('#vxStars');
  for (let i = 0; i < 26; i++) { const s = document.createElement('i'); s.textContent = '★'; s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${8+Math.random()*14}px;animation-delay:${Math.random()*5}s`; sw.appendChild(s); }
  layout(); play();
})();

/* 3D tilt on service cards (mouse devices only) */
if (matchMedia('(hover:hover)').matches) document.querySelectorAll('.svc2').forEach(c => {
  c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); c.style.transform = `perspective(700px) rotateY(${((e.clientX - r.left) / r.width - .5) * 8}deg) rotateX(${(.5 - (e.clientY - r.top) / r.height) * 8}deg) translateY(-6px)`; });
  c.addEventListener('mouseleave', () => c.style.transform = '');
});

/* numbers band: count up when visible */
const nio = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; nio.unobserve(e.target);
  const el = e.target, end = +el.dataset.cnt, t0 = performance.now();
  const step = t => { const p = Math.min((t - t0) / 2000, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step); }), { threshold: .6 });
document.querySelectorAll('[data-cnt]').forEach(el => nio.observe(el));

/* before / after slider */
const ba = $('#ba'); if (ba) ba.querySelector('input').addEventListener('input', e => ba.style.setProperty('--p', e.target.value + '%'));

/* any image that is missing shows a soft blue placeholder instead of a broken icon */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('noimg'); }, true);
document.querySelectorAll('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('noimg'); });