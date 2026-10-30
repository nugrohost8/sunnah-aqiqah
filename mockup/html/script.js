// Navbar background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll);
onScroll();

// Mobile menu
const navLinks = document.getElementById('navLinks');
document.getElementById('navToggle').addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Switches: harga betina/jantan & bundling perempuan/laki-laki
const switchHandlers = {
  pricing: val => document.querySelectorAll('.price-card__price strong').forEach(s => { s.textContent = s.dataset[val]; }),
  bundling: val => document.querySelectorAll('#bundling [data-panel]').forEach(t => { t.hidden = t.dataset.panel !== val; }),
};
document.querySelectorAll('[data-switch]').forEach(sw => {
  const buttons = sw.querySelectorAll('button');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchHandlers[sw.dataset.switch](btn.dataset.val);
  }));
});

// Formulir pemesanan -> WhatsApp admin
document.getElementById('orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const lines = [
    "Assalamu'alaikum Sunnah Aqiqah, saya ingin memesan:",
    `Nama: ${f.get('nama')}`,
    f.get('anak') && `Nama ananda: ${f.get('anak')}`,
    f.get('tanggal') && `Tanggal acara: ${f.get('tanggal')}`,
    `Paket: ${f.get('jenis')} (${f.get('hewan')})`,
    f.get('catatan') && `Catatan: ${f.get('catatan')}`,
  ].filter(Boolean);
  window.open(`https://wa.me/6281322422825?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});
