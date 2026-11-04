const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nagłówek: tło po przewinięciu
const header = $('.site-header');
const onScroll = () => header?.classList.toggle('scrolled', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Menu mobilne
const toggle = $('.nav-toggle');
const nav = $('#main-nav');
if (toggle && nav) {
  const set = (open) => { nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => set(!nav.classList.contains('open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
}

// Animacje wejścia
const io = 'IntersectionObserver' in window && !reduced
  ? new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  : null;
$$('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

// Liczniki
$$('[data-count]').forEach((el) => {
  const end = Number(el.dataset.count);
  if (reduced || !end) return;
  let start;
  const step = (t) => {
    start ??= t;
    const p = Math.min((t - start) / 1200, 1);
    el.textContent = Math.round(end * (1 - (1 - p) ** 3));
    if (p < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
});

// Panel procesu – podświetlanie kolejnych kroków
const nodes = $$('.flow .node');
if (nodes.length && !reduced) {
  let i = 0;
  setInterval(() => {
    nodes.forEach((n, k) => n.classList.toggle('active', k === i));
    i = (i + 1) % nodes.length;
  }, 1400);
}

// Filtry + wyszukiwarka oferty
const cards = $$('[data-cards] .card');
if (cards.length) {
  let filter = 'all';
  let query = '';
  const empty = $('[data-empty]');
  const apply = () => {
    let shown = 0;
    cards.forEach((c) => {
      const ok = (filter === 'all' || c.dataset.category === filter) && c.dataset.search.includes(query);
      c.hidden = !ok;
      if (ok) { shown++; c.classList.add('in'); }
    });
    if (empty) empty.hidden = shown > 0;
  };
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  }));
  $('[data-search-input]')?.addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); apply(); });
}

// Lightbox galerii
const box = $('.lightbox');
if (box) {
  const img = $('img', box);
  $$('[data-lightbox]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    img.src = a.href;
    img.alt = $('img', a)?.alt || '';
    box.showModal();
  }));
  $('.lightbox-close', box).addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
}

// Kontakt: wstaw produkt z ?produkt=slug
const productField = $('#product-field');
if (productField) {
  const slug = new URLSearchParams(location.search).get('produkt');
  if (slug) productField.value = slug.replace(/-/g, ' ');
}
