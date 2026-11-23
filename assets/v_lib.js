/* Vederi: Metodologie, Bibliotecă, Despre */
'use strict';
let METLOAD = null;
const nice = t => t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase().replace(/(\.\s+)([a-zăîșțâ])/g, (m, a, b) => a + b.toUpperCase()).replace(/fizică\. astronomie/gi, 'Fizică. Astronomie') : t;
function loadMet(cb) {
  if (window.MET) return cb();
  if (!METLOAD) { METLOAD = new Promise(r => { const s = document.createElement('script'); s.src = 'data/met.js'; s.onload = r; document.head.appendChild(s); }); }
  METLOAD.then(cb);
}
const LMODELS = () => [
  ['ERR / ERRE', T('Evocare → Realizarea sensului → Reflecție (→ Extindere). Modelul de bază al lecției centrate pe gândirea critică: elevul pornește de la ce știe, construiește sensul prin investigație și îl aplică în context nou.', 'Вызов → Осмысление → Рефлексия (→ Расширение).'),
    T('VI, „Densitatea substanței”: Evocare – De ce plutește gheața? Realizarea sensului – măsurarea masei și volumului pentru trei corpuri din același material, ρ = m/V. Reflecție – identificarea unei substanțe necunoscute din tabel. Extindere – densitatea unui obiect de acasă.', 'VI, «Плотность вещества».')],
  ['5E', T('Implicare – Explorare – Explicare – Elaborare – Evaluare. Potrivit pentru lecțiile bazate pe investigație.', 'Вовлечение – Исследование – Объяснение – Применение – Оценивание.'),
    T('VIII, „Rezistența electrică”: Implicare – de ce se încălzește cablul prelungitorului? Explorare – circuite cu fire diferite. Explicare – R = ρl/S. Elaborare – alegerea secțiunii cablului pentru un aparat. Evaluare – bilet de ieșire.', 'VIII, «Электрическое сопротивление».')],
  [T('Lecția de laborator', 'Лабораторный урок'), T('Scop – materiale – mod de lucru (cu securitate) – tabel de date – prelucrare – analiza erorilor – concluzii.', 'Цель – оборудование – ход работы – таблица – обработка – погрешности – выводы.'),
    T('X R, LL nr. 2 „Determinarea coeficientului de frecare la alunecare”: plan înclinat, dinamometru, 3 măsurări, valoarea medie, eroarea relativă, discuția surselor de erori.', 'X R, ЛР №2.')],
  [T('Lecția de evaluare sumativă', 'Урок итогового оценивания'), T('Matrice de specificații pe RÎ, itemi pe niveluri, 2 variante echivalente, barem și feedback la lecția următoare.', 'Матрица спецификаций, задания по уровням, 2 варианта, барем.'),
    T('IX, „Fenomene optice”: itemi de construcție a imaginii în lentilă, calcul cu formula lentilei, situație-problemă despre ochelari.', 'IX, «Оптические явления».')],
  [T('Lecția-proiect', 'Урок-проект'), T('Lansarea problemei, planificare, investigare, produs, prezentare și evaluare după criterii.', 'Запуск, планирование, исследование, продукт, презентация.'),
    T('VII, „Siguranța pe apă”: densitatea corpului uman, vesta de salvare, plutirea – produs: pliant pentru tabăra de vară.', 'VII, «Безопасность на воде».')],
];
VIEWS.metodologie = {
  title: () => T('Metodologie', 'Методология'),
  html(R) { return `<div id="metw"><div class="empty">${T('Se încarcă…', 'Загрузка…')}</div></div>`; },
  bind(R) {
    loadMet(() => {
      const d = R.args[0] || 'strat'; const si = +(R.args[1] || 0);
      const toc = `<div class="toc"><div class="small muted" style="font-weight:800;margin:6px 10px">${T('Ghidul practic', 'Практическое руководство')}</div>
        <a href="#/metodologie/strat" class="${d === 'strat' ? 'on' : ''}">${T('Strategii didactice cu exemple', 'Стратегии с примерами')}</a><a href="#/metodologie/modele" class="${d === 'modele' ? 'on' : ''}">${T('Modele de lecție', 'Модели урока')}</a><a href="#/metodologie/obiective" class="${d === 'obiective' ? 'on' : ''}">${T('Formularea obiectivelor', 'Формулирование целей')}</a>
        ${MET.map(doc => `<div class="small muted" style="font-weight:800;margin:14px 10px 4px">${esc(doc.t)}</div>${doc.s.map((s, i) => `<a href="#/metodologie/${doc.id}/${i}" class="${d === doc.id && si === i ? 'on' : ''}">${esc(nice(s.t))}</a>${d === doc.id && si === i ? s.subs.map((x, k) => `<a class="sub" href="javascript:void(0)" data-anc="s${i}-${k + 1}">${esc(x)}</a>`).join('') : ''}`).join('')}`).join('')}</div>`;
      let body = '';
      if (d === 'strat') body = `<h1>${T('Strategii didactice – cu exemple pentru gimnaziu și liceu', 'Дидактические стратегии с примерами')}</h1><p class="lead">${T('Fiecare strategie are un exemplu pentru gimnaziu și unul pentru liceu, legate de conținuturile curriculumului 2026. Din fiecare exemplu puteți genera un prompt.', 'Для каждой стратегии – пример для гимназии и лицея.')}</p>
        <div class="grid g2">${RES.strategies.map(s => `<div class="card"><h3>${esc(s.t)}</h3><p class="small">${esc(s.d)}</p><p class="small"><span class="tag">${T('gimnaziu', 'гимназия')}</span> ${esc(s.g)}</p><p class="small"><span class="tag y">${T('liceu', 'лицей')}</span> ${esc(s.l)}</p></div>`).join('')}</div>`;
      else if (d === 'modele') body = `<h1>${T('Modele de lecție', 'Модели урока')}</h1><div class="grid">${LMODELS().map(([t, dd, ex]) => `<div class="card"><h3>${t}</h3><p>${dd}</p><div class="note small"><b>${T('Exemplu', 'Пример')}:</b> ${ex}</div></div>`).join('')}</div>
        <p style="margin-top:16px"><a class="btn pri" href="#/lectie">${I.plan}${T('Creează un plan după unul dintre modele', 'Создать план по модели')}</a></p>`;
      else if (d === 'obiective') body = `<h1>${T('Formularea obiectivelor lecției', 'Формулирование целей урока')}</h1>
        <div class="card"><p>${T('Obiectivul se derivă din RÎ și răspunde, într-o singură propoziție, la trei întrebări: <b>Ce să facă elevul/eleva?</b> (verbul din RÎ) – <b>Cum?</b> (instrumentul, metoda, conceptele folosite) – <b>În ce context?</b> (situația concretă a lecției).', 'Цель выводится из результата обучения и отвечает на три вопроса одним предложением.')}</p>
        <div class="tw"><table class="t"><tr><th>RÎ</th><th>${T('Obiectiv operațional', 'Операционная цель')}</th></tr>
        <tr><td>RÎ 2.3.4 (VI). calculează viteza medie a unui corp pe baza distanței totale parcurse și a duratei totale a mișcării…</td><td>Să calculeze viteza medie a unui biciclist pe traseul spre școală, folosind distanța totală și durata totală măsurate, în argumentarea alegerii unui traseu sigur.</td></tr>
        <tr><td>RÎ 1.4.3 (VI). definește densitatea… și calculează densitatea, masa sau volumul…</td><td>Să determine densitatea unei pietre, măsurând masa cu balanța și volumul prin dezlocuire, pentru a identifica substanța din tabel.</td></tr>
        <tr><td>${T('Obiectiv de atitudine (din UC: „…manifestând responsabilitate”)', 'Ценностная цель')}</td><td>Să manifeste responsabilitate în trafic, argumentând distanța de siguranță pe baza timpului de reacție calculat.</td></tr></table></div>
        <p class="small muted">${T('Generatorul de plan de lecție transformă automat verbul RÎ în forma „Să …” și adaugă obiectivul de atitudine din unitatea de competență.', 'Генератор плана автоматически формирует цели.')}</p></div>`;
      else { const doc = MET.find(x => x.id === d) || MET[0]; const s = doc.s[si] || doc.s[0];
        body = `<div class="row" style="justify-content:space-between"><span class="tag">${esc(doc.t)}</span><a class="btn sm" href="docs/${doc.id === 'sug' ? 'Sugestii_metodologice_Fizica_Astronomie_Draft2' : 'Conceptia_disciplinei_Fizica_Astronomie'}.pdf" target="_blank" rel="noopener">${I.page}PDF</a></div><article class="doc"><h1 style="margin-top:12px">${esc(nice(s.t))}</h1>${s.h}</article>
          <div class="row" style="margin-top:20px">${si > 0 ? `<a class="btn" href="#/metodologie/${doc.id}/${si - 1}">← ${esc(doc.s[si - 1].t.slice(0, 40))}</a>` : ''}${si < doc.s.length - 1 ? `<a class="btn" href="#/metodologie/${doc.id}/${si + 1}">${esc(doc.s[si + 1].t.slice(0, 40))} →</a>` : ''}</div>`; }
      const mob = innerWidth < 980;
      $('#metw').innerHTML = `<div class="cur-wrap"><aside class="card" style="padding:10px;max-height:calc(100vh - 110px);overflow:auto">${mob ? `<details><summary style="cursor:pointer;font-weight:800;padding:6px 10px">${T('Cuprins', 'Содержание')}</summary>${toc}</details>` : toc}</aside><section>${body}</section></div>`;
      $$('[data-anc]').forEach(a => a.onclick = () => { const el = document.getElementById(a.dataset.anc); if (el) el.scrollIntoView({behavior: 'smooth'}); });
    });
  }
};

/* ================= BIBLIOTECĂ ================= */
VIEWS.biblioteca = {
  title: () => T('Bibliotecă', 'Библиотека'),
  html(R) {
    const f = R.q.cls || ''; const tip = R.q.tip || '';
    let web = RES.web;
    if (f) { const txt = norm(NOU[f].unitati.map(u => u.titlu + ' ' + u.termeni.join(' ') + ' ' + u.cont.map(x => x.titlu).join(' ')).join(' '));
      web = web.filter(w => w[3].split(' ').some(k => txt.includes(k))); }
    if (tip) web = web.filter(w => w[2] === tip);
    const tips = [['', T('Toate', 'Все')], ['sim', T('Simulări', 'Симуляции')], ['tool', T('Instrumente de măsurare și analiză', 'Инструменты')], ['astro', T('Astronomie', 'Астрономия')], ['text', T('Explicații', 'Объяснения')]];
    const grp = g => RES.docs.filter(d => d.g === g).map(d => `<a class="card row" style="text-decoration:none;color:var(--txt);flex-wrap:nowrap" href="docs/${d.f}" target="_blank" rel="noopener"><span style="color:var(--acc);width:22px;flex:none">${I.page}</span><span>${esc(d.t)}</span></a>`).join('');
    return `<h1>${T('Bibliotecă', 'Библиотека')}</h1><p class="lead">${T('Documentele oficiale (2026 și 2019) și resurse digitale verificate, filtrabile după clasă.', 'Официальные документы и цифровые ресурсы с фильтром по классу.')}</p>
      <div class="grid g3"><div><h3>${T('Curriculum 2026', 'Куррикулум 2026')}</h3><div class="grid" style="gap:8px">${grp('2026')}</div></div><div><h3>${T('Documentele din 2019', 'Документы 2019')}</h3><div class="grid" style="gap:8px">${grp('2019')}</div></div><div><h3>${T('Standarde', 'Стандарты')}</h3><div class="grid" style="gap:8px">${grp('std')}</div></div></div>
      <h2>${T('Resurse digitale', 'Цифровые ресурсы')}</h2>
      <div class="row no-print" style="margin-bottom:10px"><div class="chips">${tips.map(([k, l]) => `<a class="chip ${k === tip ? 'on' : ''}" href="#/biblioteca?tip=${k}${f ? '&cls=' + f : ''}">${l}</a>`).join('')}</div></div>
      <div class="chips no-print" style="margin-bottom:16px"><a class="chip ${!f ? 'on' : ''}" href="#/biblioteca?tip=${tip}">${T('Toate clasele', 'Все классы')}</a>${ORDER.map(id => `<a class="chip ${f === id ? 'on' : ''}" href="#/biblioteca?cls=${id}&tip=${tip}">${LBL[id]}</a>`).join('')}</div>
      <div class="grid auto">${web.map(w => `<a class="card mod" href="${w[1]}" target="_blank" rel="noopener"><div class="row" style="justify-content:space-between"><span class="tag ${w[2] === 'astro' ? 'y' : w[2] === 'tool' ? 'g' : ''}">${tips.find(t => t[0] === w[2])[1]}</span>${I.ext.replace('<svg', '<svg width="16" height="16"')}</div><b>${esc(w[0])}</b><p>${esc(w[4])}</p></a>`).join('') || `<div class="empty">–</div>`}</div>
      <p class="small muted" style="margin-top:16px">${T('Simulările PhET (University of Colorado Boulder) sunt gratuite și au interfață în limba română. Activitățile obligatorii nu trebuie să depindă de telefonul personal sau de internet – planificați o alternativă.', 'Симуляции PhET бесплатны. Обязательные задания не должны зависеть от телефона или интернета.')}</p>`;
  }
};

/* ================= DESPRE ================= */
VIEWS.despre = {
  title: () => T('Despre', 'О проекте'),
  html() {
    return `<h1>${T('Despre platformă', 'О платформе')}</h1>
      <div class="card"><p>${T('Platforma a fost creată de grupul de autori ai Curriculumului național Fizică. Astronomie (2026) pentru profesorii de fizică din Republica Moldova. Ea reunește textul integral al curriculumului, comparația cu documentele din 2019 și instrumente de proiectare didactică.', 'Платформа создана группой авторов Национального куррикулума «Физика. Астрономия» (2026) для учителей физики Республики Молдова.')}</p>
      <h3>${T('Cum sunt obținute datele', 'Как получены данные')}</h3><ul>
      <li>${T('Textul unităților, RÎ, conținuturilor, contextelor și termenilor este extras automat din documentul curriculumului; numerele de pagină trimit la PDF.', 'Текст извлечён автоматически из документа куррикулума; номера страниц ведут в PDF.')}</li>
      <li>${T('Asocierea RÎ – unitate de conținut și legăturile cu curriculumul 2019 sunt calculate după asemănarea textelor: au caracter orientativ.', 'Связи результатов с содержанием и с 2019 годом – ориентировочные (по сходству текстов).')}</li>
      <li>${T('Repartizarea temelor în PDLD și planurile de lecție sunt propuneri automate pe care profesorul le adaptează.', 'Планирование и планы уроков – автоматические предложения для адаптации.')}</li></ul>
      <h3>${T('Confidențialitate', 'Конфиденциальность')}</h3><p>${T('Platforma nu colectează date. Planurile și setările se păstrează doar în browserul dumneavoastră.', 'Платформа не собирает данные. Планы и настройки хранятся только в вашем браузере.')}</p>
      <h3>${T('Scurtături', 'Горячие клавиши')}</h3><p><b>Ctrl + K</b> – ${T('căutare în tot curriculumul', 'поиск по куррикулуму')}</p></div>`;
  }
};
