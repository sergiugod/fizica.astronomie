/* Fizică. Astronomie – platforma profesorului: nucleul aplicației (stare, temă, limbă, rutare, căutare) */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ş/g, 's').replace(/ţ/g, 't');

/* ---------- stare persistentă ---------- */
const ST = (() => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('fa_state') || '{}'); } catch (e) {}
  return Object.assign({lang: 'ro', theme: 'dark', hue: 222, sel: null, plans: [], pdld: {}}, s);
})();
function save() { try { localStorage.setItem('fa_state', JSON.stringify(ST)); } catch (e) {} }
const T = (ro, ru) => ST.lang === 'ru' ? (ru ?? ro) : ro;

/* ---------- date ---------- */
const CUR = window.CUR;
const NOU = Object.fromEntries(CUR.nou.map(c => [c.id, c]));
const VECHI = Object.fromEntries(CUR.vechi.map(c => [c.id, c]));
const ORDER = CUR.meta.order;
const LBL = CUR.meta.labels;
const PROFIL = id => /R$/.test(id) ? T('profil real', 'реальный профиль') : /U$/.test(id) ? T('profilurile umanist, general, arte, sport', 'профили гуманитарный, общий, искусство, спорт') : T('gimnaziu', 'гимназия');
const CLS_FULL = id => T('Clasa a ', '') + ({VI: 'VI', VII: 'VII', VIII: 'VIII', IX: 'IX', XR: 'X', XIR: 'XI', XIIR: 'XII', XU: 'X', XIU: 'XI', XIIU: 'XII'}[id]) + T('-a', ' класс') + (/(R|U)$/.test(id) ? ', ' + PROFIL(id) : '');
const PDF = 'docs/Curriculum_Fizica_Astronomie_2026.pdf';
const pdfLink = p => p ? `${PDF}#page=${p}` : PDF;
function allRI(id) {
  const out = [];
  NOU[id].unitati.forEach(u => u.uc.forEach(uc => uc.ri.forEach(r => out.push(Object.assign({uc, u, cls: id}, r)))));
  return out;
}
const unitHours = (id, nr) => (NOU[id].ore.find(r => r.nr === String(nr)) || {});
// nivelul verbului (taxonomie orientativă)
const VERB_LVL = {
  1: ['definește', 'identifică', 'recunoaște', 'descrie', 'clasifică', 'exprimă', 'extrage', 'înregistrează'],
  2: ['explică', 'caracterizează', 'compară', 'diferențiază', 'interpretează', 'reprezintă', 'corelează', 'evidențiază'],
  3: ['aplică', 'determină', 'calculează', 'utilizează', 'măsoară', 'rezolvă', 'efectuează', 'construiește', 'prelucrează', 'respectă', 'estimează', 'verifică'],
  4: ['analizează', 'investighează', 'modelează', 'stabilește', 'integrează', 'selectează'],
  5: ['argumentează', 'evaluează', 'justifică'],
  6: ['comunică', 'realizează', 'formulează', 'elaborează', 'prezintă', 'propune', 'redactează', 'proiectează', 'planifică', 'participă']};
const LVL_NAME = () => ({1: T('cunoaștere', 'знание'), 2: T('înțelegere', 'понимание'), 3: T('aplicare', 'применение'), 4: T('analiză / investigare', 'анализ / исследование'), 5: T('evaluare', 'оценка'), 6: T('creare / comunicare', 'создание / коммуникация')});
const verbLvl = v => +Object.keys(VERB_LVL).find(k => VERB_LVL[k].includes(v)) || 0;
// conjunctivul verbelor din RÎ – pentru formularea obiectivelor „Să …”
const CONJ = {'definește': 'definească', 'identifică': 'identifice', 'recunoaște': 'recunoască', 'descrie': 'descrie', 'clasifică': 'clasifice', 'exprimă': 'exprime', 'extrage': 'extragă', 'înregistrează': 'înregistreze',
  'explică': 'explice', 'compară': 'compare', 'interpretează': 'interpreteze', 'reprezintă': 'reprezinte', 'corelează': 'coreleze', 'evidențiază': 'evidențieze', 'aplică': 'aplice', 'determină': 'determine',
  'calculează': 'calculeze', 'utilizează': 'utilizeze', 'măsoară': 'măsoare', 'rezolvă': 'rezolve', 'efectuează': 'efectueze', 'construiește': 'construiască', 'prelucrează': 'prelucreze', 'respectă': 'respecte',
  'estimează': 'estimeze', 'verifică': 'verifice', 'analizează': 'analizeze', 'investighează': 'investigheze', 'modelează': 'modeleze', 'stabilește': 'stabilească', 'integrează': 'integreze', 'selectează': 'selecteze',
  'argumentează': 'argumenteze', 'evaluează': 'evalueze', 'justifică': 'justifice', 'comunică': 'comunice', 'realizează': 'realizeze', 'formulează': 'formuleze', 'elaborează': 'elaboreze', 'prezintă': 'prezinte',
  'propune': 'propună', 'redactează': 'redacteze', 'proiectează': 'proiecteze', 'planifică': 'planifice', 'participă': 'participe', 'caracterizează': 'caracterizeze', 'diferențiază': 'diferențieze'};
const VERB_RX = new RegExp('(^|\\s(?:și|apoi)\\s)(' + Object.keys(CONJ).join('|') + ')(?=[\\s,:;])', 'g');
function objective(ri) {
  const t = ri.text.replace(/\.$/, '').replace(VERB_RX, (m, a, v) => a + (a ? 'să ' : '') + (CONJ[v] || v));
  return 'Să ' + t + '.';
}
// persoana I singular, pentru criteriile de succes „Pot să…”
const P1X = {'descrie': 'descriu', 'recunoaște': 'recunosc', 'propune': 'propun', 'extrage': 'extrag'};
const p1 = v => P1X[v] || (v.endsWith('ează') ? v.slice(0, -4) + 'ez' : v.endsWith('ește') ? v.slice(0, -4) + 'esc' : v.endsWith('ă') ? v.slice(0, -1) : v);
function success(ri) {
  const first = ri.text.replace(/\.$/, '').split(/,\s(?=[a-zăîșțâ]+ând|utilizând|aplicând|folosind|pe baza|prin )/)[0];
  return 'Pot să ' + first.replace(new RegExp('(^|\\s(?:și|apoi)\\s)(' + Object.keys(CONJ).join('|') + ')(?=[\\s,:;])', 'g'), (m, a, v) => a + p1(v)) + '.';
}
function attitude(uc) {
  const m = (uc.text || '').match(/(manifestând|dând dovadă de|cu|asigurând|respectând)\s+([^.;]+)\.?$/i);
  return m ? 'Să manifeste ' + m[2].replace(/^(manifestând\s+)/, '') + ' în rezolvarea situațiilor analizate la lecție.' : '';
}

/* ---------- pictograme ---------- */
const I = {
  atom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="1.8" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6M9 11h6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>',
  compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M17 4v16M3 8l4-4 4 4M13 16l4 4 4-4"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/></svg>',
  rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z"/><circle cx="12" cy="10" r="2"/><path d="M9 16l-3 3v-4M15 16l3 3v-4M10 20h4"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h3M7 17h6"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M8 10h8M8 14h8M8 18h5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
  lib: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 4v16M8 4v16M12 5l4 15M17 4l3 16"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M7 8V3h10v5M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
  page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/></svg>',
  wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 12c2.5-6 5-6 7.5 0s5 6 7.5 0 3.5-4 5-2"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
};
const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--acc)"/><stop offset="1" stop-color="var(--acc2)"/></linearGradient></defs>
<circle cx="32" cy="32" r="9" fill="url(#lg)"/><ellipse cx="32" cy="32" rx="28" ry="11" fill="none" stroke="url(#lg)" stroke-width="3"/><ellipse cx="32" cy="32" rx="28" ry="11" fill="none" stroke="url(#lg)" stroke-width="3" transform="rotate(60 32 32)" opacity=".75"/><ellipse cx="32" cy="32" rx="28" ry="11" fill="none" stroke="url(#lg)" stroke-width="3" transform="rotate(120 32 32)" opacity=".5"/><circle cx="58" cy="28" r="3" fill="var(--acc2)"/></svg>`;

/* ---------- navigare ---------- */
const NAV = [
  ['', 'home', () => T('Acasă', 'Главная')],
  ['curriculum', 'book', () => T('Curriculum 2026', 'Куррикулум 2026')],
  ['laboratoare', 'flask', () => T('Laboratoare', 'Лабораторные')],
  ['proiecte', 'rocket', () => T('Proiecte', 'Проекты')],
  ['grp', '', () => T('Proiectare', 'Проектирование')],
  ['pdld', 'cal', () => T('Planificare (PDLD)', 'Долгосрочное планирование')],
  ['lectie', 'plan', () => T('Plan de lecție', 'План урока')],
  ['prompt', 'spark', () => T('Generator de prompturi', 'Генератор промптов')],
  ['grp', '', () => T('Analiză', 'Анализ')],
  ['analiza', 'chart', () => T('Analiza curriculumului', 'Анализ куррикулума')],
  ['comparatie', 'compare', () => T('Vechi ↔ Nou', 'Старый ↔ Новый')],
  ['grp', '', () => T('Resurse', 'Ресурсы')],
  ['metodologie', 'compass', () => T('Metodologie', 'Методология')],
  ['biblioteca', 'lib', () => T('Bibliotecă', 'Библиотека')],
  ['despre', 'info', () => T('Despre', 'О проекте')],
];
const BNAV = [['', 'home', () => T('Acasă', 'Главная')], ['curriculum', 'book', () => T('Curriculum', 'Курр.')], ['lectie', 'plan', () => T('Lecție', 'Урок')], ['prompt', 'spark', () => T('Prompt', 'Промпт')], ['meniu', 'compass', () => T('Meniu', 'Меню')]];
const VIEWS = {};
let ROUTE = {name: '', args: [], q: {}};
function parseHash() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(qs || ''));
  return {name: parts[0] || '', args: parts.slice(1), q};
}
const go = (path) => { location.hash = '#/' + path; };
function render() {
  ROUTE = parseHash();
  const v = VIEWS[ROUTE.name] || VIEWS[''];
  $('#main').innerHTML = v.html(ROUTE);
  $$('.side a,.bnav a').forEach(a => a.classList.toggle('on', a.dataset.r === ROUTE.name));
  document.title = (v.title ? v.title() + ' · ' : '') + T('Fizică. Astronomie – platforma profesorului', 'Физика. Астрономия – платформа учителя');
  if (v.bind) v.bind(ROUTE);
  if (!ROUTE.q.keep) window.scrollTo({top: 0});
  updateBasket();
}
function shell() {
  document.documentElement.lang = ST.lang;
  document.body.innerHTML = `
<canvas id="sky"></canvas>
<header class="top">
  <a class="brand" href="#/">${LOGO}<div>${T('Fizică. Astronomie', 'Физика. Астрономия')}<small>${T('platforma profesorului', 'платформа учителя')}</small></div></a>
  <button class="search-btn" id="sbtn">${I.search}<span class="t">${T('Caută în curriculum: temă, RÎ, termen, laborator…', 'Поиск: тема, результат, термин, лабораторная…')}</span><kbd>Ctrl K</kbd></button>
  <div class="tools">
    <button class="icon-btn lang" id="lng" title="RO / RU">${ST.lang === 'ru' ? 'RO' : 'RU'}</button>
    <button class="icon-btn" id="thm" title="${T('Temă întunecată / deschisă', 'Тёмная / светлая тема')}">${ST.theme === 'dark' ? I.sun : I.moon}</button>
    <button class="icon-btn" id="pal" title="${T('Culoarea de accent', 'Цвет акцента')}">${I.palette}</button>
  </div>
  <div class="menu" id="palmenu"><div class="small muted" style="font-weight:700;margin-bottom:8px">${T('Culoarea de accent', 'Цвет акцента')}</div>
    <div class="row">${[[222, 'Cosmos'], [262, 'Nebuloasă'], [190, 'Laborator'], [150, 'Aurora'], [28, 'Soare'], [340, 'Pulsar']].map(([h, n]) => `<button class="sw" data-h="${h}" title="${n}" style="background:hsl(${h} 85% 58%)"></button>`).join('')}</div>
    <label class="f" style="margin-top:12px">${T('Nuanță personalizată', 'Свой оттенок')}<input type="range" min="0" max="359" value="${ST.hue}" id="hue"></label></div>
</header>
<div class="layout">
  <nav class="side">${NAV.map(([r, ic, l]) => r === 'grp' ? `<div class="grp">${l()}</div>` : `<a href="#/${r}" data-r="${r}">${I[ic]}${l()}</a>`).join('')}</nav>
  <main id="main"></main>
  <footer class="foot">${T('Curriculumul național Fizică. Astronomie (2026) · platformă realizată de grupul de autori pentru profesorii de fizică din Republica Moldova', 'Национальный куррикулум «Физика. Астрономия» (2026) · платформа группы авторов для учителей физики Республики Молдова')}</footer>
</div>
<nav class="bnav">${BNAV.map(([r, ic, l]) => `<a href="#/${r}" data-r="${r}">${I[ic]}${l()}</a>`).join('')}</nav>
<div class="pal" id="palette"><div class="box"><input type="search" id="pq" placeholder="${T('Caută: densitate, RÎ 2.3.4, laborator, proiect, lentilă…', 'Поиск: плотность, RÎ 2.3.4, лабораторная, проект…')}" autocomplete="off"><div class="res" id="pres"></div></div></div>
<div class="basket" id="basket"></div>
<div class="toast" id="toast"></div>`;
  $('#lng').onclick = () => { ST.lang = ST.lang === 'ru' ? 'ro' : 'ru'; save(); boot(); };
  $('#thm').onclick = () => { ST.theme = ST.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); $('#thm').innerHTML = ST.theme === 'dark' ? I.sun : I.moon; if (ST.theme === 'dark' && sky.restart) sky.restart(); };
  $('#pal').onclick = e => { e.stopPropagation(); $('#palmenu').classList.toggle('show'); };
  document.addEventListener('click', e => { if (!e.target.closest('#palmenu')) $('#palmenu').classList.remove('show'); });
  $$('.sw').forEach(b => b.onclick = () => { ST.hue = +b.dataset.h; $('#hue').value = ST.hue; save(); applyTheme(); });
  $('#hue').oninput = e => { ST.hue = +e.target.value; save(); applyTheme(); };
  $('#sbtn').onclick = openPalette;
  initPalette(); sky();
}
function applyTheme() {
  document.documentElement.dataset.theme = ST.theme;
  document.documentElement.style.setProperty('--h', ST.hue);
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 1800); }
async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  toast(T('Copiat ✓', 'Скопировано ✓'));
}

/* ---------- cerul înstelat (tema întunecată) ---------- */
function sky() {
  const c = $('#sky'), x = c.getContext('2d'); let st = [], w, h;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() { w = c.width = innerWidth * devicePixelRatio; h = c.height = innerHeight * devicePixelRatio; c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    st = Array.from({length: Math.round(innerWidth * innerHeight / 5200)}, () => ({x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .2, p: Math.random() * 6.28, s: Math.random() * .02 + .004})); }
  function draw(t) {
    x.clearRect(0, 0, w, h);
    for (const s of st) { const a = .35 + .45 * Math.sin(s.p + t * s.s * .06); x.globalAlpha = a; x.fillStyle = '#cfe0ff'; x.beginPath(); x.arc(s.x, s.y, s.r * devicePixelRatio, 0, 6.28); x.fill(); }
    if (!reduce && ST.theme === 'dark') requestAnimationFrame(draw);
  }
  size(); addEventListener('resize', size); requestAnimationFrame(draw);
  sky.restart = () => requestAnimationFrame(draw);
}

/* ---------- căutare globală (Ctrl+K) ---------- */
let INDEX = null;
function buildIndex() {
  INDEX = [];
  for (const c of CUR.nou) for (const u of c.unitati) {
    INDEX.push({k: T('Unitate', 'Раздел') + ' · ' + c.label, t: `${u.nr}. ${u.titlu} (${u.ore} ${T('ore', 'ч')})`, h: `curriculum/${c.id}/${u.nr}`});
    for (const x of u.cont) INDEX.push({k: T('Conținut', 'Содержание') + ' · ' + c.label + ' · ' + T('UÎ', 'Р') + u.nr, t: `C${x.nr}. ${x.titlu}`, d: x.detalii, h: `curriculum/${c.id}/${u.nr}?tab=cont`});
    for (const uc of u.uc) for (const r of uc.ri) INDEX.push({k: 'RÎ ' + r.cod + ' · ' + c.label, t: r.text, h: `curriculum/${c.id}/${u.nr}?ri=${r.cod}`});
    for (const l of u.lab) INDEX.push({k: T('Laborator', 'Лабораторная') + ' · ' + c.label, t: `LL${l.nr}. ${l.titlu}`, h: `laboratoare?cls=${c.id}`});
    if (u.termeni.length) INDEX.push({k: T('Termeni', 'Термины') + ' · ' + c.label + ' · ' + u.titlu, t: u.termeni.join(', '), h: `curriculum/${c.id}/${u.nr}?tab=term`});
  }
  for (const c of CUR.nou) c.proiecte.forEach((p, i) => INDEX.push({k: T('Proiect', 'Проект') + ' · ' + c.label, t: p, h: `proiecte?cls=${c.id}`}));
  for (const c of CUR.vechi) for (const [ui, u] of c.unitati.entries()) INDEX.push({k: T('Curriculum 2019', 'Куррикулум 2019') + ' · ' + c.label, t: u.titlu + ': ' + u.cont.join('; '), h: `comparatie/${c.id}?u=${ui}`});
  INDEX.forEach(o => o.n = norm(o.k + ' ' + o.t + ' ' + (o.d || '')));
}
function searchIdx(q, lim = 60) {
  if (!INDEX) buildIndex();
  const ws = norm(q).split(/\s+/).filter(Boolean); if (!ws.length) return [];
  const res = [];
  for (const o of INDEX) { if (ws.every(w => o.n.includes(w))) res.push(o); if (res.length >= lim) break; }
  return res;
}
const hl = (t, q) => { let s = esc(t); for (const w of q.split(/\s+/).filter(x => x.length > 1)) s = s.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); return s; };
function initPalette() {
  const P = $('#palette'), q = $('#pq'), R = $('#pres'); let sel = 0, hits = [];
  function draw() {
    hits = searchIdx(q.value, 40);
    R.innerHTML = hits.length ? hits.map((o, i) => `<a class="hit ${i === sel ? 'on' : ''}" href="#/${o.h}"><div class="k">${esc(o.k)}</div><div class="tx">${hl(o.t.slice(0, 220), q.value)}</div></a>`).join('')
      : `<div class="empty">${q.value ? T('Nimic găsit', 'Ничего не найдено') : T('Scrieți un cuvânt-cheie. Enter – deschide primul rezultat.', 'Введите ключевое слово. Enter – открыть первый результат.')}</div>`;
  }
  q.oninput = () => { sel = 0; draw(); };
  q.onkeydown = e => {
    if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, hits.length - 1); draw(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
    if (e.key === 'Enter' && hits[sel]) { location.hash = '#/' + hits[sel].h; closePalette(); }
  };
  P.onclick = e => { if (e.target === P || e.target.closest('.hit')) closePalette(); };
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') closePalette();
  });
  draw();
}
function openPalette() { $('#palette').classList.add('show'); const q = $('#pq'); q.focus(); q.select(); q.dispatchEvent(new Event('input')); }
function closePalette() { $('#palette').classList.remove('show'); }

/* ---------- selecția (RÎ alese pentru plan / prompt) ---------- */
function selGet() { return ST.sel && NOU[ST.sel.cls] ? ST.sel : null; }
function selToggle(cls, unit, cod) {
  if (!ST.sel || ST.sel.cls !== cls || ST.sel.unit !== unit) ST.sel = {cls, unit, ri: [], c: null};
  const i = ST.sel.ri.indexOf(cod); if (i >= 0) ST.sel.ri.splice(i, 1); else ST.sel.ri.push(cod);
  save(); updateBasket();
}
function updateBasket() {
  const b = $('#basket'); if (!b) return; const s = selGet();
  if (!s || !s.ri.length || ['lectie', 'prompt'].includes(ROUTE.name)) { b.classList.remove('show'); return; }
  b.innerHTML = `<span><b>${s.ri.length}</b> RÎ · ${LBL[s.cls]}</span><a class="btn sm" href="#/lectie">${I.plan}${T('Plan', 'План')}</a><a class="btn sm pri" href="#/prompt">${I.spark}Prompt</a><button class="btn sm" id="bclr" title="${T('Golește', 'Очистить')}">✕</button>`;
  b.classList.add('show'); $('#bclr').onclick = () => { ST.sel = null; save(); updateBasket(); if (ROUTE.name === 'curriculum') render(); };
}

/* ---------- export Word / tipar ---------- */
function exportDoc(title, bodyHtml, fname) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>@page{size:A4;margin:2cm 1.8cm}body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.35}h1{font-size:16pt;color:#1d3d8f}h2{font-size:13pt;color:#1d3d8f;margin-top:14pt}h3{font-size:11.5pt}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:4pt 6pt;vertical-align:top;font-size:10pt}th{background:#e8edf7}.lbl{font-size:8pt;color:#555;text-transform:uppercase}</style></head><body>${bodyHtml}</body></html>`;
  const blob = new Blob(['﻿', html], {type: 'application/msword'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (fname || 'document') + '.doc'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function download(name, text, type = 'text/plain') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + text], {type: type + ';charset=utf-8'})); a.download = name; a.click();
}

/* ---------- pornire ---------- */
function boot() { applyTheme(); shell(); render(); }
addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', boot);
