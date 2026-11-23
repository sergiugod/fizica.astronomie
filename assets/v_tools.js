/* Vederi: Planificare (PDLD), Plan de lecție, Generator de prompturi */
'use strict';
function clsSelect(id, cur) { return `<select id="${id}">${ORDER.map(x => `<option value="${x}" ${x === cur ? 'selected' : ''}>${esc(CLS_FULL(x))}</option>`).join('')}</select>`; }
function unitSelect(id, cls, cur) { return `<select id="${id}">${NOU[cls].unitati.map(u => `<option value="${u.nr}" ${u.nr === cur ? 'selected' : ''}>${u.nr}. ${esc(u.titlu)} (${u.ore} ${T('ore', 'ч')})</option>`).join('')}</select>`; }
function contSelect(id, cls, unr, cur) { const u = NOU[cls].unitati.find(x => x.nr === unr) || NOU[cls].unitati[0];
  return `<select id="${id}"><option value="">${T('— toată unitatea —', '— весь раздел —')}</option>${u.cont.map(x => `<option value="${x.nr}" ${x.nr === cur ? 'selected' : ''}>C${x.nr}. ${esc(x.titlu.length > 90 ? x.titlu.slice(0, 90) + '…' : x.titlu)}</option>`).join('')}</select>`; }
const pick = (a, n) => a.slice(0, n);
const fmtDate = d => d ? d.toLocaleDateString('ro-RO', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '';

/* ================= PDLD ================= */
const DEF_DAYS = {1: [1], 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5]};
function buildPDLD(id) {
  const c = NOU[id]; const rows = [];
  for (const u of c.unitati) {
    const hr = unitHours(id, u.nr);
    const es = hr.es ?? 1, nlab = u.lab.length;
    let pi = hr.pi != null ? hr.pi : u.ore - nlab - es;
    if (hr.total != null && pi + nlab + es > u.ore) pi = Math.max(1, u.ore - nlab - es);
    const C = u.cont; const k = C.length || 1;
    // repartizarea orelor de predare–învățare pe unitățile de conținut
    let per = C.map(() => 0);
    if (pi >= k) { per = C.map(() => Math.floor(pi / k)); let rest = pi - per.reduce((a, b) => a + b, 0);
      const order = C.map((x, i) => [x.detalii.length + 200 * u.uc.flatMap(q => q.ri).filter(r => r.c === x.nr).length, i]).sort((a, b) => b[0] - a[0]);
      for (let j = 0; rest > 0; j = (j + 1) % k, rest--) per[order[j][1]]++; }
    const lessons = [];
    if (pi >= k) C.forEach((x, i) => { for (let j = 1; j <= per[i]; j++) lessons.push({cs: [x], part: per[i] > 1 ? `${j}/${per[i]}` : ''}); });
    else { const g = Math.ceil(k / pi); for (let i = 0; i < k; i += g) lessons.push({cs: C.slice(i, i + g), part: ''}); }
    rows.push({h: true, t: `${T('Unitatea de învățare', 'Раздел')} ${u.nr}. ${u.titlu} – ${u.ore} ${T('ore', 'ч')}`});
    let lastC = 0;
    lessons.forEach((L, i) => {
      const ris = u.uc.flatMap(q => q.ri).filter(r => L.cs.some(x => x.nr === r.c)).map(r => r.cod);
      rows.push({tip: T('P-Î', 'О'), t: L.cs.map(x => `C${x.nr}. ${x.titlu}`).join('; ') + (L.part ? ` (${L.part})` : ''), ri: ris.join(', ')});
      const last = L.cs[L.cs.length - 1].nr; const nextSame = lessons[i + 1] && lessons[i + 1].cs.some(x => x.nr === last);
      if (!nextSame) u.lab.filter(l => L.cs.some(x => x.nr === l.c)).forEach(l => rows.push({tip: 'LL', t: `${T('Lucrare de laborator', 'Лабораторная работа')} nr. ${l.nr}: „${l.titlu}”`, ri: u.uc.flatMap(q => q.ri).filter(r => ['investighează', 'determină', 'măsoară', 'prelucrează', 'efectuează', 'realizează'].includes(r.verb)).map(r => r.cod).slice(0, 4).join(', ')}));
      lastC = last;
    });
    u.lab.filter(l => !l.c || !u.cont.some(x => x.nr === l.c)).forEach(l => rows.push({tip: 'LL', t: `${T('Lucrare de laborator', 'Лабораторная работа')} nr. ${l.nr}: „${l.titlu}”`, ri: ''}));
    for (let j = 0; j < es; j++) rows.push({tip: 'ES', t: `${T('Evaluare sumativă', 'Итоговое оценивание')}: ${u.titlu}`, ri: u.uc.map(q => q.cod).join(', ').replace(/(\d+\.\d+)/g, 'UC $1')});
  }
  const extra = c.ore.filter(r => !r.nr && r.titlu !== 'Total');
  for (const r of extra) {
    rows.push({h: true, t: `${r.titlu} – ${r.total} ${T('ore', 'ч')}`});
    const isP = /proiect/i.test(r.titlu), isI = /investiga/i.test(r.titlu);
    for (let j = 1; j <= (r.total || 0); j++) rows.push({tip: isP ? 'P' : isI ? 'IE' : 'D', t: isP ? `${T('Proiect interdisciplinar', 'Междисциплинарный проект')} (${j}/${r.total})` : isI ? `${T('Investigație experimentală', 'Экспериментальное исследование')} (${j}/${r.total})` : `${T('Oră la discreția cadrului didactic', 'Час на усмотрение учителя')} (${j}/${r.total})`, ri: ''});
  }
  return rows;
}
function dateSeq(start, days, n, vac) {
  const out = []; const d = new Date(start + 'T12:00:00'); if (isNaN(d)) return Array(n).fill(null);
  const ranges = (vac || '').split(/[\n;]+/).map(s => s.trim()).filter(Boolean).map(s => { const m = s.match(/(\d{4}-\d{2}-\d{2})\s*[–-]+\s*(\d{4}-\d{2}-\d{2})/) || s.match(/(\d{4}-\d{2}-\d{2})/); return m ? [new Date(m[1] + 'T00:00:00'), new Date((m[2] || m[1]) + 'T23:59:59')] : null; }).filter(Boolean);
  let guard = 0;
  while (out.length < n && guard++ < 800) { const wd = d.getDay(); if (days.includes(wd) && !ranges.some(([a, b]) => d >= a && d <= b)) out.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return out;
}
VIEWS.pdld = {
  title: () => T('Proiectare de lungă durată', 'Долгосрочное планирование'),
  html(R) {
    const id = NOU[R.args[0]] ? R.args[0] : 'VI'; const c = NOU[id];
    const cfg = Object.assign({start: '2026-09-01', days: DEF_DAYS[Math.round(c.ore_an / 34)] || [1, 4], vac: '', inst: '', prof: '', an: '2026–2027'}, (ST.pdld[id] || {}).cfg);
    const wd = [[1, T('Lu', 'Пн')], [2, T('Ma', 'Вт')], [3, T('Mi', 'Ср')], [4, T('Jo', 'Чт')], [5, T('Vi', 'Пт')]];
    return `<h1>${T('Proiectarea didactică de lungă durată', 'Долгосрочное дидактическое проектирование')}</h1><p class="lead">${T('Generată din curriculum: ore pe unități, unități de conținut, RÎ asociate, lucrări de laborator, evaluări, proiecte. Toate celulele sunt editabile; modificările se salvează în browser.', 'Создано по куррикулуму. Все ячейки редактируемые; изменения сохраняются в браузере.')}</p>
      <div class="card no-print"><div class="grid g4"><label class="f">${T('Clasa', 'Класс')}${clsSelect('pc', id)}</label><label class="f">${T('Prima zi de școală', 'Первый учебный день')}<input type="date" id="pst" value="${cfg.start}"></label>
      <label class="f">${T('Zilele cu ore de fizică', 'Дни уроков физики')}<div class="chips" id="pdays">${wd.map(([n, l]) => `<button class="chip ${cfg.days.includes(n) ? 'on' : ''}" data-d="${n}">${l}</button>`).join('')}</div></label>
      <label class="f">${T('Anul de studii', 'Учебный год')}<input type="text" id="pan" value="${esc(cfg.an)}"></label></div>
      <div class="grid g2" style="margin-top:12px"><label class="f">${T('Vacanțe și zile libere (AAAA-LL-ZZ – AAAA-LL-ZZ, câte una pe rând)', 'Каникулы (ГГГГ-ММ-ДД – ГГГГ-ММ-ДД, по одной в строке)')}<textarea id="pvac" rows="3" placeholder="2026-10-26 – 2026-11-01&#10;2026-12-24 – 2027-01-07">${esc(cfg.vac)}</textarea></label>
      <div class="grid"><label class="f">${T('Instituția', 'Учреждение')}<input type="text" id="pinst" value="${esc(cfg.inst)}"></label><label class="f">${T('Profesor/profesoară', 'Учитель')}<input type="text" id="pprof" value="${esc(cfg.prof)}"></label></div></div>
      <div class="row" style="margin-top:14px"><button class="btn pri" id="pgen">${I.cal}${T('Generează / actualizează datele', 'Сгенерировать / обновить даты')}</button><button class="btn" id="preset">${T('Regenerează din curriculum', 'Пересоздать из куррикулума')}</button>
      <button class="btn" id="pdoc">${I.doc}Word</button><button class="btn" onclick="print()">${I.print}${T('Tipărește', 'Печать')}</button><button class="btn" id="pcsv">CSV</button></div>
      <p class="small muted" style="margin-bottom:0">${T('Repartizarea temelor pe ore este o propunere automată, după orele unității și volumul unităților de conținut; asocierea RÎ – orientativă. Ajustați după clasă.', 'Распределение тем – автоматическое предложение; адаптируйте.')}</p></div>
      <div id="pdoc-area" class="ed" style="margin-top:18px"></div>`;
  },
  bind(R) {
    const id = NOU[R.args[0]] ? R.args[0] : 'VI'; const c = NOU[id];
    const st = ST.pdld[id] = ST.pdld[id] || {};
    $('#pc').onchange = e => go('pdld/' + e.target.value);
    $$('#pdays .chip').forEach(b => b.onclick = () => b.classList.toggle('on'));
    const cfg = () => ({start: $('#pst').value, days: $$('#pdays .chip.on').map(b => +b.dataset.d), vac: $('#pvac').value, inst: $('#pinst').value, prof: $('#pprof').value, an: $('#pan').value});
    const draw = () => {
      const C = st.cfg || cfg(); const rows = st.rows || buildPDLD(id);
      const n = rows.filter(r => !r.h).length; const dates = dateSeq(C.start, C.days.length ? C.days : [1], n, C.vac);
      let k = 0;
      const tr = rows.map((r, i) => r.h ? `<tr data-i="${i}"><th colspan="6" contenteditable>${esc(r.t)}</th></tr>`
        : `<tr data-i="${i}"><td>${++k}</td><td contenteditable data-f="d">${esc(r.d || fmtDate(dates[k - 1]))}</td><td contenteditable data-f="t">${esc(r.t)}</td><td contenteditable data-f="ri" class="small">${esc(r.ri)}</td><td contenteditable data-f="tip"><b>${esc(r.tip)}</b></td><td contenteditable data-f="o" class="small">${esc(r.o || '')}</td></tr>`).join('');
      const adm = c.ore.map(r => `<tr><td>${r.nr ? r.nr + '. ' : ''}${esc(r.titlu)}</td><td>${r.total ?? ''}</td><td>${r.pi ?? ''}</td><td>${r.lab ?? ''}</td><td>${r.es ?? ''}</td></tr>`).join('');
      $('#pdoc-area').innerHTML = `<div class="card"><h2 style="margin-top:0">${T('Proiectarea didactică de lungă durată la disciplina Fizică. Astronomie', 'Долгосрочное проектирование: Физика. Астрономия')}</h2>
        <p>${esc(CLS_FULL(id))} · ${T('anul de studii', 'учебный год')} ${esc(C.an)}${C.inst ? ' · ' + esc(C.inst) : ''}${C.prof ? ' · ' + esc(C.prof) : ''}</p>
        <h3>${T('Administrarea disciplinei', 'Администрирование дисциплины')}</h3><div class="tw"><table class="t"><tr><th>${T('Unitatea de învățare', 'Раздел')}</th><th>${T('Total ore', 'Всего')}</th><th>${T('Predare–învățare', 'Обучение')}</th><th>${T('Laborator', 'Лаб.')}</th><th>${T('Evaluare sumativă', 'Оценивание')}</th></tr>${adm}</table></div>
        <h3>${T('Competențele specifice', 'Специфические компетенции')}</h3><ol class="small">${CUR.cs.map(r => `<li>${esc(r.slice(1).join(' '))}</li>`).join('')}</ol>
        <h3>${T('Eșalonarea pe ore', 'Распределение по часам')}</h3><div class="tw"><table class="t" id="ptab"><tr><th style="width:44px">Nr.</th><th style="width:100px">${T('Data', 'Дата')}</th><th>${T('Unitatea de conținut / tema', 'Содержание / тема')}</th><th style="width:150px">RÎ</th><th style="width:56px">${T('Tip', 'Тип')}</th><th style="width:130px">${T('Observații', 'Примечания')}</th></tr>${tr}</table></div>
        <p class="small muted">P-Î – ${T('predare–învățare', 'обучение')}; LL – ${T('lucrare de laborator', 'лабораторная')}; ES – ${T('evaluare sumativă', 'итоговое оценивание')}; IE – ${T('investigație experimentală', 'эксп. исследование')}; P – ${T('proiect', 'проект')}; D – ${T('oră la discreție', 'час на усмотрение')}. ${T('Sursa: Curriculumul Fizică. Astronomie (2026)', 'Источник: Куррикулум (2026)')}.</p></div>`;
      $$('#ptab td[contenteditable],#ptab th[contenteditable]').forEach(td => td.onblur = () => { const tr = td.closest('tr'); const i = +tr.dataset.i; const rs = st.rows || (st.rows = buildPDLD(id));
        if (rs[i].h) rs[i].t = td.textContent; else rs[i][td.dataset.f] = td.textContent; save(); });
    };
    $('#pgen').onclick = () => { st.cfg = cfg(); (st.rows || []).forEach(r => delete r.d); save(); draw(); toast(T('Actualizat', 'Обновлено')); };
    $('#preset').onclick = () => { if (confirm(T('Se pierd modificările făcute în tabel. Continuați?', 'Изменения будут потеряны. Продолжить?'))) { st.rows = null; st.cfg = cfg(); save(); draw(); } };
    $('#pdoc').onclick = () => exportDoc('PDLD', $('#pdoc-area').innerHTML.replace(/contenteditable(="[^"]*")?/g, ''), 'PDLD_Fizica_' + LBL[id].replace(/\W+/g, '_'));
    $('#pcsv').onclick = () => download(`PDLD_${id}.csv`, $$('#ptab tr').map(tr => $$('th,td', tr).map(x => '"' + x.textContent.replace(/"/g, '""') + '"').join(';')).join('\n'), 'text/csv');
    draw();
  }
};

/* ================= PLAN DE LECȚIE ================= */
const MODELS = () => ({
  ERR: [[T('Evocare', 'Вызов'), 8], [T('Realizarea sensului', 'Осмысление'), 25], [T('Reflecție', 'Рефлексия'), 12]],
  ERRE: [[T('Evocare', 'Вызов'), 7], [T('Realizarea sensului', 'Осмысление'), 23], [T('Reflecție', 'Рефлексия'), 10], [T('Extindere', 'Расширение'), 5]],
  '5E': [[T('Implicare', 'Вовлечение'), 5], [T('Explorare', 'Исследование'), 12], [T('Explicare', 'Объяснение'), 10], [T('Elaborare', 'Применение'), 12], [T('Evaluare', 'Оценивание'), 6]],
  lab: [[T('Scopul, ipoteza și regulile de securitate', 'Цель, гипотеза, безопасность'), 6], [T('Efectuarea măsurărilor și înregistrarea datelor', 'Измерения и запись данных'), 20], [T('Prelucrarea datelor și analiza erorilor', 'Обработка данных и погрешности'), 12], [T('Concluzii și evaluare', 'Выводы и оценивание'), 7]],
  es: [[T('Instructaj și organizare', 'Инструктаж'), 3], [T('Rezolvarea testului', 'Выполнение теста'), 37], [T('Colectarea lucrărilor și autoevaluare', 'Сбор работ, самооценка'), 5]],
});
const MODEL_NAME = () => ({ERR: T('ERR (Evocare – Realizarea sensului – Reflecție)', 'ВОР'), ERRE: 'ERRE (+ ' + T('Extindere', 'Расширение') + ')', '5E': T('5E (Implicare – Explorare – Explicare – Elaborare – Evaluare)', '5E'), lab: T('Lecție de laborator', 'Лабораторный урок'), es: T('Evaluare sumativă', 'Итоговое оценивание')});
function lessonActs(model, u, x, ris, lab) {
  const ctx = t => (u.contexte.find(c => norm(c.tip).startsWith(norm(t))) || {}).text || '';
  const cot = ctx('Cotid') || ctx('Tematice') || ctx('Aplicat'), exp = ctx('Experiment'), dig = ctx('Digital'), col = ctx('Colabor');
  const tema = x ? x.titlu : u.titlu; const det = x ? x.detalii : '';
  const terms = pick(u.termeni, 6).join(', ');
  const A = (p, e, ev) => ({p, e, ev});
  const S = {
    ev: A(`Prezintă o situație-problemă din viața cotidiană${cot ? ': ' + cot.split(/[;.]/)[0] : ''}. Formulează întrebarea lecției legată de „${tema}”.`, 'Formulează ipoteze, își actualizează cunoștințele anterioare, notează întrebările.', 'Observare sistematică; întrebări orale.'),
    rs: A(`Organizează explorarea${exp ? ' (' + exp.split(/[;.]/)[0] + ')' : ''}. ${det ? 'Explică: ' + det.split(/[;]/).slice(0, 2).join(';') + '.' : ''} Introduce termenii: ${terms}. Prezintă un model de rezolvare (se dă – SI – rezolvare – răspuns – verificare).`, 'Observă, măsoară, completează tabelul de date, formulează concluzii; rezolvă sarcini pe trei niveluri (bază, aplicare, provocare).', 'Fișă de lucru; criterii de succes formulate din RÎ.'),
    rf: A(`Propune aplicarea într-un context nou${dig ? ' (' + dig.split(/[;.]/)[0] + ')' : ''}${col ? '; lucru în grup: ' + col.split(/[;.]/)[0] : ''}. Discută valoarea: ${(u.valori[0] || '').split(' – ')[0]}.`, 'Aplică, argumentează, compară rezultatele grupelor, completează autoevaluarea „Pot să…”.', 'Bilet de ieșire; autoevaluare; interevaluare.'),
    ex: A('Propune tema pentru acasă diferențiată: obligatoriu – aplicare; opțional – mini-investigație acasă cu materiale accesibile.', 'Notează sarcinile, alege nivelul.', 'Verificare la lecția următoare.'),
  };
  if (model === 'ERR' || model === 'ERRE') return [S.ev, S.rs, S.rf, S.ex].slice(0, model === 'ERR' ? 3 : 4);
  if (model === '5E') return [S.ev, A(`Organizează investigația în perechi${exp ? ': ' + exp.split(/[;.]/)[0] : ''}.`, 'Investighează, colectează date, discută observațiile.', 'Observare; fișa de investigație.'),
    A(`Sistematizează explicația științifică: ${det.split(/[;]/)[0] || tema}. Termeni: ${terms}.`, 'Explică cu propriile cuvinte, compară cu ipotezele inițiale.', 'Întrebări de verificare.'), S.rf,
    A('Aplică itemi pe trei niveluri; oferă feedback.', 'Rezolvă itemii, se autoevaluează după criterii.', 'Item de evaluare formativă; „Pot să…”.')];
  if (model === 'lab') return [A(`Comunică scopul lucrării${lab ? ' „' + lab.titlu + '”' : ''}, materialele și regulile de securitate; solicită formularea ipotezei.`, 'Studiază fișa, formulează ipoteza, pregătesc tabelul de date.', 'Verificarea înțelegerii sarcinii.'),
    A('Monitorizează efectuarea măsurărilor (minimum trei repetări), oferă sprijin.', 'Efectuează măsurările, înregistrează datele în tabel.', 'Observare; lista de verificare a abilităților practice.'),
    A('Ghidează calculul valorii medii, al erorii absolute/relative (după clasă) și construirea graficului.', 'Prelucrează datele, construiesc graficul, analizează sursele de erori.', 'Corectitudinea calculelor și a reprezentărilor.'),
    A('Organizează formularea concluziilor și prezentarea rezultatelor.', 'Formulează concluzii argumentate, compară cu alte grupe, completează raportul.', 'Raportul lucrării de laborator (barem).')];
  return [A('Instruiește privind sarcinile, timpul și criteriile.', 'Ascultă, clarifică.', '–'), A('Monitorizează rezolvarea testului (2 variante).', 'Rezolvă individual itemii.', 'Test sumativ cu barem și matrice de specificații.'), A('Colectează lucrările; propune autoevaluarea.', 'Estimează rezultatul propriu.', 'Fișă de autoevaluare.')];
}
function buildLesson(cfg) {
  const c = NOU[cfg.cls], u = c.unitati.find(x => x.nr === cfg.u) || c.unitati[0], x = u.cont.find(k => k.nr === cfg.c);
  const ris = u.uc.flatMap(q => q.ri.map(r => Object.assign({uc: q}, r))).filter(r => cfg.ri.includes(r.cod));
  const ucs = [...new Map(ris.map(r => [r.uc.cod, r.uc])).values()];
  const lab = cfg.tip === 'lab' ? (u.lab.find(l => l.nr === cfg.ll) || u.lab.find(l => l.c === cfg.c) || u.lab[0]) : null;
  const st = MODELS()[cfg.tip] || MODELS().ERRE; const acts = lessonActs(cfg.tip, u, x, ris, lab);
  const tema = lab ? `${T('Lucrare de laborator', 'Лабораторная работа')} nr. ${lab.nr}: „${lab.titlu}”` : (x ? x.titlu : u.titlu);
  const att = ucs.map(attitude).find(Boolean) || 'Să manifeste responsabilitate și rigoare științifică în rezolvarea situațiilor analizate.';
  let t = 0;
  return `<div class="card"><h2 style="margin-top:0" contenteditable>${T('Proiect didactic', 'План урока')}: ${esc(tema)}</h2>
  <div class="tw"><table class="t"><tr><th style="width:26%">${T('Disciplina', 'Предмет')}</th><td contenteditable>Fizică. Astronomie</td></tr><tr><th>${T('Clasa', 'Класс')}</th><td contenteditable>${esc(CLS_FULL(c.id))}</td></tr>
  <tr><th>${T('Unitatea de învățare', 'Раздел')}</th><td contenteditable>${u.nr}. ${esc(u.titlu)}</td></tr><tr><th>${T('Unitatea de conținut / tema', 'Тема')}</th><td contenteditable>${esc(tema)}</td></tr>
  <tr><th>${T('Tipul lecției / modelul', 'Тип урока / модель')}</th><td contenteditable>${esc(MODEL_NAME()[cfg.tip] || cfg.tip)} · ${cfg.dur} min</td></tr><tr><th>${T('Data · profesor/profesoară', 'Дата · учитель')}</th><td contenteditable>…</td></tr></table></div>
  <h3>${T('Unități de competență', 'Единицы компетенции')}</h3><ul contenteditable>${ucs.map(q => `<li>UC ${q.cod}. ${esc(q.text)}</li>`).join('') || '<li>…</li>'}</ul>
  <h3>${T('Rezultate ale învățării', 'Результаты обучения')}</h3><ul contenteditable>${ris.map(r => `<li>RÎ ${r.cod}. ${esc(r.text)}</li>`).join('') || '<li>…</li>'}</ul>
  <h3>${T('Obiective', 'Цели')}</h3><p class="small muted no-print">${T('Formulate după algoritmul „Ce să facă elevul/eleva? Cum? În ce context?”, într-o singură propoziție. Ajustați contextul concret al lecției.', 'Сформулированы по алгоритму «Что? Как? В каком контексте?».')}</p>
  <ol contenteditable>${ris.map(r => `<li>${esc(objective(r))}</li>`).join('')}<li><i>${T('Obiectiv de atitudine', 'Ценностная цель')}:</i> ${esc(att)}</li></ol>
  <h3>${T('Strategii didactice', 'Дидактические стратегии')}</h3><div class="tw"><table class="t"><tr><th>${T('Metode și procedee', 'Методы')}</th><td contenteditable>${cfg.tip === 'lab' ? 'experimentul de laborator, lucrul în perechi, analiza erorilor, raportul de laborator' : 'problematizarea, investigația ghidată, modelarea, rezolvarea de probleme pe niveluri, discuția argumentativă'}</td></tr>
  <tr><th>${T('Forme de organizare', 'Формы работы')}</th><td contenteditable>frontal, în perechi, în grup, individual</td></tr><tr><th>${T('Resurse', 'Ресурсы')}</th><td contenteditable>${esc([((u.contexte.find(k => /Digital/.test(k.tip)) || {}).text || '').replace(/\.$/, ''), lab ? 'echipamentul pentru lucrarea de laborator' : '', 'fișa de lucru'].filter(Boolean).join('; '))}</td></tr></table></div>
  <h3>${T('Desfășurarea lecției', 'Ход урока')}</h3>
  ${st.map(([n, m], i) => { t += m; const a = acts[i] || {p: '', e: '', ev: ''}; return `<div class="stage"><div class="sh"><span contenteditable>${i + 1}. ${esc(n)}</span><span contenteditable class="small">${m} min</span></div><div class="sb">
    <div><div class="lbl">${T('Activitatea profesorului', 'Деятельность учителя')}</div><div contenteditable>${esc(a.p)}</div></div><div><div class="lbl">${T('Activitatea elevilor', 'Деятельность учащихся')}</div><div contenteditable>${esc(a.e)}</div></div><div><div class="lbl">${T('Evaluare / produs', 'Оценивание / продукт')}</div><div contenteditable>${esc(a.ev)}</div></div></div></div>`; }).join('')}
  <p class="small muted">${T('Total', 'Итого')}: ${t} min</p>
  <h3>${T('Criterii de succes (pentru elevi)', 'Критерии успеха')}</h3><ul contenteditable>${ris.map(r => `<li>${esc(success(r))}</li>`).join('')}</ul>
  <h3>${T('Bibliografie', 'Библиография')}</h3><ol class="small" contenteditable><li>Curriculumul național. Fizică. Astronomie. Clasele VI–XII. Ministerul Educației și Cercetării, 2026.</li><li>Sugestii metodologice de organizare a procesului educațional la disciplina Fizică. Astronomie, MEC, 2026.</li><li>Manualul de fizică pentru ${esc(CLS_FULL(c.id))} (ediția în vigoare).</li></ol></div>`;
}
VIEWS.lectie = {
  title: () => T('Plan de lecție', 'План урока'),
  html(R) {
    const s = selGet();
    const cls = NOU[R.q.cls] ? R.q.cls : (s ? s.cls : 'VI');
    const unr = R.q.u ? +R.q.u : (s && s.cls === cls ? s.unit : NOU[cls].unitati[0].nr);
    const cnr = R.q.c ? +R.q.c : (s && s.cls === cls ? s.c : null);
    const tip = R.q.tip || 'ERRE';
    return `<h1>${T('Plan de lecție', 'План урока')}</h1><p class="lead">${T('Alegeți tema și rezultatele învățării – planul se completează automat cu obiective, etape, activități și evaluare. Totul se poate edita direct în pagină.', 'Выберите тему и результаты обучения – план заполнится автоматически. Всё можно редактировать.')}</p>
    <div class="card no-print"><div class="grid g4"><label class="f">${T('Clasa', 'Класс')}${clsSelect('lc', cls)}</label><label class="f">${T('Unitatea', 'Раздел')}<span id="lus">${unitSelect('lu', cls, unr)}</span></label>
      <label class="f">${T('Unitatea de conținut', 'Тема')}<span id="lcs">${contSelect('lcc', cls, unr, cnr)}</span></label>
      <label class="f">${T('Modelul / tipul lecției', 'Модель / тип урока')}<select id="lt">${Object.entries(MODEL_NAME()).map(([k, v]) => `<option value="${k}" ${k === tip ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label></div>
      <div style="margin-top:12px"><div class="small muted" style="font-weight:700;margin-bottom:6px">${T('Rezultatele învățării (bifate automat după tema aleasă; puteți modifica)', 'Результаты обучения')}</div><div id="lris" class="grid" style="gap:4px;max-height:260px;overflow:auto"></div></div>
      <div class="row" style="margin-top:12px"><button class="btn pri" id="lgen">${I.plan}${T('Generează planul', 'Создать план')}</button><button class="btn" id="ldoc">${I.doc}Word</button><button class="btn" onclick="print()">${I.print}${T('Tipărește', 'Печать')}</button>
      <button class="btn" id="lsave">${T('Salvează în „Planurile mele”', 'Сохранить')}</button><a class="btn" id="lpr" href="#/prompt">${I.spark}${T('Prompt pentru această lecție', 'Промпт для урока')}</a></div></div>
    <div id="lout" class="ed" style="margin-top:18px"></div>
    <h2>${T('Planurile mele', 'Мои планы')}</h2><div id="lmine"></div>`;
  },
  bind(R) {
    const s = selGet();
    const st = {cls: $('#lc').value, u: +$('#lu').value, c: $('#lcc').value ? +$('#lcc').value : null, tip: $('#lt').value, ll: R.q.ll ? +R.q.ll : null, dur: 45, ri: []};
    const risBox = () => {
      const u = NOU[st.cls].unitati.find(x => x.nr === st.u);
      const fromSel = s && s.cls === st.cls && s.unit === st.u && s.ri.length && !R.q.c ? s.ri : null;
      st.ri = fromSel ? [...fromSel] : u.uc.flatMap(q => q.ri).filter(r => st.c ? r.c === st.c : true).map(r => r.cod).slice(0, st.c ? 6 : 3);
      if (st.tip === 'lab' && !st.ri.length) st.ri = u.uc.flatMap(q => q.ri).filter(r => ['investighează', 'determină', 'măsoară', 'prelucrează'].includes(r.verb)).map(r => r.cod).slice(0, 3);
      $('#lris').innerHTML = u.uc.flatMap(q => q.ri).sort((a, b) => st.ri.includes(b.cod) - st.ri.includes(a.cod)).map(r => `<label class="small row" style="gap:8px;align-items:flex-start;flex-wrap:nowrap"><input type="checkbox" value="${r.cod}" ${st.ri.includes(r.cod) ? 'checked' : ''}><span><b>RÎ ${r.cod}</b> ${esc(r.text)}</span></label>`).join('');
      $$('#lris input').forEach(i => i.onchange = () => { st.ri = $$('#lris input:checked').map(x => x.value); });
    };
    const gen = () => { $('#lout').innerHTML = buildLesson(st); $('#lpr').href = `#/prompt?cls=${st.cls}&u=${st.u}&c=${st.c || ''}&tip=${st.tip === 'lab' ? 'lab' : 'lectie'}&ri=${st.ri.join(',')}`; };
    $('#lc').onchange = e => { st.cls = e.target.value; st.u = NOU[st.cls].unitati[0].nr; st.c = null; $('#lus').innerHTML = unitSelect('lu', st.cls, st.u); $('#lcs').innerHTML = contSelect('lcc', st.cls, st.u, null); bindU(); risBox(); gen(); };
    const bindU = () => { $('#lu').onchange = e => { st.u = +e.target.value; st.c = null; $('#lcs').innerHTML = contSelect('lcc', st.cls, st.u, null); bindC(); risBox(); gen(); }; bindC(); };
    const bindC = () => { $('#lcc').onchange = e => { st.c = e.target.value ? +e.target.value : null; risBox(); gen(); }; };
    bindU();
    $('#lt').onchange = e => { st.tip = e.target.value; gen(); };
    $('#lgen').onclick = gen;
    $('#ldoc').onclick = () => exportDoc(T('Plan de lecție', 'План урока'), $('#lout').innerHTML.replace(/contenteditable(="[^"]*")?/g, '').replace(/<p class="small muted no-print">.*?<\/p>/g, ''), 'Plan_lectie_' + LBL[st.cls].replace(/\W+/g, '_'));
    const mine = () => { $('#lmine').innerHTML = ST.plans.length ? `<div class="grid auto">${ST.plans.map((p, i) => `<div class="card"><b>${esc(p.t)}</b><div class="small muted">${esc(p.cls)} · ${esc(p.d)}</div><div class="row" style="margin-top:10px"><button class="btn sm" data-open="${i}">${T('Deschide', 'Открыть')}</button><button class="btn sm" data-del="${i}">${I.trash}</button></div></div>`).join('')}</div>` : `<p class="muted">${T('Încă nu ați salvat niciun plan. Planurile se păstrează doar în acest browser.', 'Сохранённых планов нет. Планы хранятся только в этом браузере.')}</p>`;
      $$('[data-open]').forEach(b => b.onclick = () => { $('#lout').innerHTML = ST.plans[+b.dataset.open].h; $('#lout').scrollIntoView(); });
      $$('[data-del]').forEach(b => b.onclick = () => { ST.plans.splice(+b.dataset.del, 1); save(); mine(); }); };
    $('#lsave').onclick = () => { const h = $('#lout').innerHTML; if (!h) return; const t = ($('#lout h2') || {}).textContent || 'Plan'; ST.plans.unshift({t, cls: LBL[st.cls], d: new Date().toLocaleDateString('ro-RO'), h}); ST.plans = ST.plans.slice(0, 40); save(); mine(); toast(T('Salvat', 'Сохранено')); };
    risBox(); gen(); mine();
  }
};

/* ================= GENERATOR DE PROMPTURI ================= */
const PTYPES = () => ({
  html: T('Lecție interactivă (pagină HTML)', 'Интерактивный урок (HTML)'),
  lectie: T('Plan de lecție (proiect didactic)', 'План урока'),
  activ: T('Activitate de învățare (15–20 min)', 'Учебная деятельность (15–20 мин)'),
  fisa: T('Fișă de lucru pe trei niveluri', 'Рабочий лист на трёх уровнях'),
  eval: T('Evaluare (formativă sau sumativă) cu barem', 'Оценивание с баремом'),
  lab: T('Lucrare de laborator: fișa elevului + laborator virtual', 'Лабораторная: лист + виртуальная лаборатория'),
  proiect: T('Proiect interdisciplinar', 'Междисциплинарный проект'),
  prez: T('Prezentare pentru lecție', 'Презентация к уроку'),
  pdld: T('Proiectare de lungă durată (PDLD)', 'Долгосрочное планирование'),
});
function buildPrompt(o) {
  const c = NOU[o.cls], u = c.unitati.find(x => x.nr === o.u) || c.unitati[0], x = u.cont.find(k => k.nr === o.c);
  const ris = u.uc.flatMap(q => q.ri.map(r => Object.assign({uc: q}, r))).filter(r => o.ri.includes(r.cod));
  const ucs = [...new Map(ris.map(r => [r.uc.cod, r.uc])).values()];
  const lab = o.tip === 'lab' ? (u.lab.find(l => l.nr === o.ll) || u.lab.find(l => l.c === o.c) || u.lab[0]) : null;
  const RU = o.lang === 'ru';
  const L = (ro, ru) => RU ? ru : ro;
  const RN = {VI: 'VI', VII: 'VII', VIII: 'VIII', IX: 'IX', XR: 'X', XIR: 'XI', XIIR: 'XII', XU: 'X', XIU: 'XI', XIIU: 'XII'}[c.id];
  const cls = RU ? `${RN} класс${/R$/.test(c.id) ? ', реальный профиль' : /U$/.test(c.id) ? ', профили гуманитарный, общий, искусство, спорт' : ''}` : CLS_FULL(c.id).replace(/^Clasa a /, 'clasa a ');
  const hr = unitHours(c.id, u.nr);
  const lines = [];
  const P = s => lines.push(s);
  P(L(`Ești profesor de fizică cu experiență și expert în proiectare didactică în Republica Moldova. Lucrezi strict după Curriculumul național „Fizică. Astronomie” (2026), centrat pe rezultatele învățării.`,
      `Ты опытный учитель физики и эксперт по дидактическому проектированию в Республике Молдова. Работай строго по Национальному куррикулуму «Физика. Астрономия» (2026), ориентированному на результаты обучения.`));
  P('');
  P(L('# SARCINA', '# ЗАДАНИЕ'));
  const task = {
    html: L(`Creează o lecție interactivă completă, ca o singură pagină HTML (HTML + CSS + JavaScript într-un singur fișier, fără biblioteci externe obligatorii), pentru ${cls}.`, `Создай полный интерактивный урок в виде одной HTML-страницы (HTML + CSS + JavaScript в одном файле, без обязательных внешних библиотек) для класса: ${cls}.`),
    lectie: L(`Elaborează proiectul didactic al unei lecții de ${o.dur} de minute pentru ${cls}.`, `Разработай план урока продолжительностью ${o.dur} минут для класса: ${cls}.`),
    activ: L(`Propune o activitate de învățare de 15–20 de minute pentru ${cls}, care poate fi integrată într-o lecție.`, `Предложи учебную деятельность на 15–20 минут для класса: ${cls}.`),
    fisa: L(`Creează o fișă de lucru pentru elevi, ${cls}, cu sarcini pe trei niveluri (bază / aplicare / provocare) și cheia de răspunsuri pentru profesor.`, `Создай рабочий лист для учащихся (${cls}) с заданиями трёх уровней и ключом ответов.`),
    eval: L(`Elaborează o evaluare ${o.ev === 'sum' ? 'sumativă (2 variante echivalente, 45 min)' : 'formativă (10–15 min)'} pentru ${cls}, cu matrice de specificații, itemi pe niveluri, barem de corectare și schema de notare.`, `Разработай ${o.ev === 'sum' ? 'итоговую (2 равноценных варианта, 45 мин)' : 'формативную (10–15 мин)'} проверочную работу для класса: ${cls}, с матрицей спецификаций, заданиями по уровням, баремом и схемой оценивания.`),
    lab: L(`Pregătește lucrarea de laborator pentru ${cls}: (1) fișa elevului structurată în 7 pași și (2) un laborator virtual interactiv ca o singură pagină HTML, care simulează măsurările cu erori realiste, generează date, tabel, grafic și verifică rezultatele.`, `Подготовь лабораторную работу для класса: ${cls}: (1) лист учащегося из 7 шагов и (2) виртуальную лабораторию в виде одной HTML-страницы с реалистичными погрешностями, таблицей, графиком и проверкой результатов.`),
    proiect: L(`Elaborează ghidul unui proiect interdisciplinar pentru ${cls} (4 ore${c.id === 'VI' ? ', la clasa a VI-a – 2 ore' : ''}): etape, sarcini pe roluri, calendar, produs final, criterii și grilă de evaluare, fișe de lucru pentru echipe.`, `Разработай руководство междисциплинарного проекта для класса: ${cls}: этапы, роли, график, итоговый продукт, критерии и шкалу оценивания, листы для команд.`),
    prez: L(`Creează conținutul unei prezentări (10–14 slide-uri) pentru lecție, ${cls}: titlul fiecărui slide, textul scurt, sugestii de imagini/scheme, întrebări pentru clasă și notele profesorului.`, `Создай содержание презентации (10–14 слайдов) к уроку, ${cls}: заголовки, краткий текст, идеи изображений, вопросы классу и заметки учителя.`),
    pdld: L(`Elaborează proiectarea didactică de lungă durată pentru unitatea de învățare de mai jos, ${cls}, oră cu oră, respectând strict numărul de ore din curriculum.`, `Разработай долгосрочное планирование указанного раздела (${cls}) по урокам, строго соблюдая число часов куррикулума.`),
  }[o.tip];
  P(task);
  if (o.extra) P(L('Cerințe suplimentare ale profesorului: ', 'Дополнительные требования учителя: ') + o.extra);
  P('');
  P(L('# REPERELE DIN CURRICULUM (citate exact – nu le modifica)', '# ОРИЕНТИРЫ КУРРИКУЛУМА (цитаты на румынском языке – не изменяй их смысл; переведи на русский точно)'));
  P(`- ${L('Clasa', 'Класс')}: ${RU ? cls : CLS_FULL(c.id)} (${c.ore_an} ${L('ore pe an', 'часов в год')}; ${c.ore_sapt})`);
  if (o.tip === 'proiect' && o.p) P(`- ${L('Tema proiectului', 'Тема проекта')}: ${o.p}`);
  else {
    P(`- ${L('Unitatea de învățare', 'Раздел')} ${u.nr}: „${u.titlu}” – ${u.ore} ${L('ore', 'ч')}${hr.pi != null ? ` (${hr.pi} ${L('predare–învățare', 'обучение')}, ${hr.lab || 0} ${L('laborator', 'лаб.')}, ${hr.es || 0} ${L('evaluare sumativă', 'итог. оценивание')})` : ''}`);
    if (x) P(`- ${L('Unitatea de conținut', 'Единица содержания')}: C${x.nr}. ${x.titlu}${x.detalii ? ' – ' + x.detalii : ''}${x.calitativ ? L(' [studiu calitativ – fără tratare cantitativă]', ' [качественное изучение – без количественного рассмотрения]') : ''}`);
    else if (o.tip === 'pdld' || o.tip === 'eval') P(`- ${L('Unitățile de conținut', 'Единицы содержания')}: ${u.cont.map(k => `C${k.nr}. ${k.titlu}`).join('; ')}`);
    if (lab) P(`- ${L('Lucrarea de laborator', 'Лабораторная работа')} nr. ${lab.nr}: „${lab.titlu}”`);
  }
  if (ucs.length) { P(`- ${L('Unități de competență', 'Единицы компетенции')}:`); ucs.forEach(q => P(`  • UC ${q.cod}. ${q.text}`)); }
  if (ris.length) { P(`- ${L('Rezultatele învățării vizate (Elevul/eleva:)', 'Целевые результаты обучения (Учащийся:)')}`); ris.forEach(r => P(`  • RÎ ${r.cod}. ${r.text}`)); }
  if (o.opt.ctx && u.contexte.length) { P(`- ${L('Contexte de învățare recomandate', 'Рекомендуемые контексты')}:`); u.contexte.forEach(k => P(`  • ${k.tip}: ${k.text}`)); }
  if (o.opt.con && u.conexiuni.length) { P(`- ${L('Conexiuni interdisciplinare', 'Междисциплинарные связи')}:`); u.conexiuni.forEach(k => P(`  • ${k.disc}: ${k.text}`)); }
  if (u.termeni.length) P(`- ${L('Terminologie specifică', 'Специальная терминология')}: ${u.termeni.join(', ')}`);
  if (o.opt.val) { if (u.valori.length) P(`- ${L('Valori proiectate', 'Ценности')}: ${u.valori.join(' ')}`); if (u.noua.length) P(`- ${L('Noua educație integrată', 'Новое воспитание')}: ${u.noua.join(' ')}`); if (u.cross.length) P(`- ${L('Temă cross-curriculară', 'Кросс-куррикулярная тема')}: ${u.cross.join('; ')}`); }
  P('');
  P(L('# RESTRICȚII', '# ОГРАНИЧЕНИЯ'));
  P(L(`- Nu introduce noțiuni, formule sau metode care nu apar în curriculumul clasei (verifică lista de termeni de mai sus). Unitățile de măsură – în SI; scrierea zecimală cu virgulă.`, `- Не вводи понятия, формулы и методы, которых нет в куррикулуме этого класса (сверяйся с терминами выше). Единицы – СИ; десятичная запятая.`));
  if (c.id === 'VI') P(L('- Clasa a VI-a: accelerația este doar noțiune introductivă; nu folosi forța, legile lui Newton sau vectorii.', '- VI класс: ускорение – только вводное понятие; не используй силу, законы Ньютона и векторы.'));
  if (c.id === 'VII') P(L('- Clasa a VII-a: nu folosi conceptul de accelerație (a = F : m); elevii nu îl învață în această clasă.', '- VII класс: не используй понятие ускорения (a = F : m); учащиеся его не изучают.'));
  if (/U$/.test(c.id)) P(L('- Profilurile umanist, general, arte, sport: accent pe înțelegerea fenomenelor și aplicații cotidiene; calcule simple, fără deduceri matematice extinse.', '- Гуманитарный, общий, искусство, спорт: акцент на понимании явлений и повседневных применениях; простые расчёты.'));
  if (/R$/.test(c.id)) P(L('- Profil real: modelare matematică, reprezentări grafice, analiza erorilor; sarcini de investigație.', '- Реальный профиль: математическое моделирование, графики, анализ погрешностей; исследовательские задания.'));
  P(L('- Adresează-te elevilor cu forme incluzive (elevul/eleva, elevii/elevele). Activitățile obligatorii nu trebuie să depindă de telefonul personal sau de internet; oferă alternative.', '- Используй инклюзивные формулировки. Обязательные задания не должны зависеть от личного телефона или интернета; предложи альтернативы.'));
  P('');
  P(L('# CE TREBUIE SĂ CONȚINĂ REZULTATUL', '# ЧТО ДОЛЖЕН СОДЕРЖАТЬ РЕЗУЛЬТАТ'));
  const spec = {
    html: L(`1. Ecran de start cu tema, întrebarea-problemă și obiectivele formulate pentru elev („Pot să…”).
2. Etapele lecției (${o.model}) ca secțiuni navigabile, cu cronometru pentru fiecare etapă (total ${o.dur} min).
3. Cel puțin o simulare sau o activitate interactivă (glisoare, măsurări virtuale, grafic care se actualizează) legată direct de RÎ.
4. Sarcini cu verificare automată și feedback explicativ (alegere multiplă, completare numerică cu toleranță, ordonare, asociere).
5. Un model de rezolvare a unei probleme: Se dă – SI – Rezolvare (cu justificarea relației) – Răspuns – Verificarea plauzibilității.
6. Reflecție finală, bilet de ieșire și scor.
7. Design modern, adaptat pentru tabla interactivă și telefon; temă luminoasă/întunecată; limba interfeței: ${o.lang === 'ru' ? 'rusă' : 'română'}.
8. La final, separat, notele profesorului: obiective, răspunsuri corecte, sugestii de diferențiere.`,
`1. Стартовый экран с темой, проблемным вопросом и целями для учащегося («Я могу…»).
2. Этапы урока (${o.model}) как навигируемые разделы с таймером для каждого этапа (всего ${o.dur} мин).
3. Минимум одна симуляция или интерактивная активность (ползунки, виртуальные измерения, обновляемый график), прямо связанная с результатами обучения.
4. Задания с автоматической проверкой и объясняющей обратной связью (выбор ответа, число с допуском, упорядочивание, соответствие).
5. Образец решения задачи: Дано – СИ – Решение (с обоснованием формулы) – Ответ – Проверка правдоподобия.
6. Итоговая рефлексия, «билет на выход» и счёт баллов.
7. Современный дизайн для интерактивной доски и телефона; светлая/тёмная тема; язык интерфейса: русский.
8. Отдельно – заметки учителя: цели, правильные ответы, идеи дифференциации.`),
    lectie: L(`1. Antet: disciplina, clasa, unitatea, tema, tipul lecției, durata.
2. Unitățile de competență și RÎ (exact ca mai sus).
3. Obiective formulate după algoritmul „Ce să facă elevul/eleva? Cum? În ce context?”, câte o singură propoziție (ex.: „Să explice științific…, folosind…, în…”), plus un obiectiv de atitudine rezultat din situațiile rezolvate.
4. Strategii didactice: metode, forme de organizare, resurse.
5. Desfășurarea lecției după modelul ${o.model}, în tabel: etapa, timpul, activitatea profesorului, activitatea elevilor, evaluarea / produsul.
6. Sarcini concrete (cu date numerice reale) și răspunsurile lor.
7. Evaluare formativă cu criterii de succes „Pot să…” și barem.
8. Temă pentru acasă diferențiată și bibliografie (cele mai importante surse, inclusiv curriculumul 2026).
Format: document Word, tabele clare.`,
`1. Шапка: предмет, класс, раздел, тема, тип урока, длительность.
2. Единицы компетенции и результаты обучения (точно как выше).
3. Цели по алгоритму «Что должен сделать учащийся? Как? В каком контексте?» – одним предложением каждая, плюс ценностная цель.
4. Дидактические стратегии: методы, формы работы, ресурсы.
5. Ход урока по модели ${o.model} в таблице: этап, время, деятельность учителя, деятельность учащихся, оценивание/продукт.
6. Конкретные задания (с реальными числовыми данными) и ответы.
7. Формативное оценивание с критериями успеха «Я могу…» и баремом.
8. Дифференцированное домашнее задание и библиография.
Формат: документ Word, чёткие таблицы.`),
    activ: L(`Scopul și RÎ vizate; materiale; pașii activității cu timpii; instrucțiunile pentru elevi; întrebări de discuție; produsul așteptat; modul de evaluare; variantă pentru clasă fără echipamente.`, `Цель и результаты; материалы; шаги со временем; инструкции для учащихся; вопросы для обсуждения; ожидаемый продукт; оценивание; вариант без оборудования.`),
    fisa: L(`Antetul fișei (nume, clasă, dată); o situație-problemă autentică; sarcini numerotate pe trei niveluri, fiecare marcată cu RÎ; spațiu de lucru; o problemă cu model de rezolvare; autoevaluare „Pot să…”; la final cheia de răspunsuri cu rezolvări complete. Pagina A4 se umple cu exerciții, nu cu spații goale.`, `Шапка (имя, класс, дата); аутентичная проблемная ситуация; пронумерованные задания трёх уровней с указанием результатов; место для решения; задача с образцом решения; самооценка; ключ с полными решениями. Страница A4 заполняется заданиями.`),
    eval: L(`Matricea de specificații (RÎ × niveluri); ${o.ev === 'sum' ? '2 variante echivalente' : 'o variantă'} cu itemi de tip diferit (alegere, răspuns scurt, problemă, situație-problemă din viața reală, interpretare de grafic); punctajul fiecărui item; baremul detaliat; schema de convertire a punctajului în note; recomandări pentru feedback.`, `Матрица спецификаций; ${o.ev === 'sum' ? '2 равноценных варианта' : 'один вариант'} с разными типами заданий; баллы; подробный барем; шкала перевода баллов в оценки; рекомендации по обратной связи.`),
    lab: L(`Fișa elevului: 1. Scopul lucrării 2. Materiale și echipamente necesare 3. Modul de lucru (cu regulile de securitate) 4. Înregistrarea datelor experimentale (tabelul de date) 5. Prelucrarea și interpretarea datelor experimentale 6. Analiza erorilor și a incertitudinilor de măsurare 7. Formularea concluziilor; baremul raportului.
Laboratorul virtual (un singur fișier HTML): aparatura desenată schematic, mărimi reglabile, măsurări cu dispersie realistă, tabel completat de elev, calculul valorii medii și al erorii, grafic, verificare și feedback; variantă de date pentru clasele fără echipamente.`, `Лист учащегося: 1. Цель 2. Материалы и оборудование 3. Ход работы (с правилами безопасности) 4. Таблица данных 5. Обработка и интерпретация 6. Анализ погрешностей 7. Выводы; барем отчёта.
Виртуальная лаборатория (один HTML-файл): схематичное оборудование, регулируемые величины, измерения с реалистичным разбросом, таблица, среднее значение и погрешность, график, проверка и обратная связь.`),
    proiect: L(`Întrebarea de cercetare; legătura cu RÎ din clasă și cu disciplinele asociate; etapele și calendarul; rolurile în echipă; surse și instrumente (inclusiv măsurări în localitate); produsul final; grila de evaluare pe criterii (conținut științific, metodă, produs, comunicare, colaborare); fișe de autoevaluare și interevaluare.`, `Исследовательский вопрос; связь с результатами обучения и смежными предметами; этапы и график; роли; источники и инструменты; итоговый продукт; критериальная шкала; листы само- и взаимооценки.`),
    prez: L(`Pentru fiecare slide: titlul, 2–4 idei scurte, imaginea sau schema propusă, întrebarea pentru clasă, nota profesorului. Include un slide cu problema-model și unul de reflecție.`, `Для каждого слайда: заголовок, 2–4 коротких тезиса, изображение, вопрос классу, заметка учителя. Включи слайд с образцом решения и слайд рефлексии.`),
    pdld: L(`Tabel: nr., data, unitatea de conținut (tema), RÎ vizate, tipul orei (predare–învățare / laborator / evaluare), produse și evaluare, observații. Respectă numărul de ore din curriculum; include lucrările de laborator și evaluarea sumativă.`, `Таблица: №, дата, тема, результаты, тип урока, продукты и оценивание, примечания. Соблюдай число часов; включи лабораторные и итоговое оценивание.`),
  }[o.tip];
  P(spec);
  if (o.opt.dif) P(L('- Diferențiere: sarcini pe trei niveluri și sprijin pentru elevii cu cerințe educaționale speciale.', '- Дифференциация: задания трёх уровней и поддержка учащихся с особыми образовательными потребностями.'));
  if (o.opt.astro) P(L('- Integrează, unde este natural, un exemplu din astronomia observabilă, fără a depăși curriculumul.', '- Где уместно, добавь пример из наблюдательной астрономии, не выходя за рамки куррикулума.'));
  if (o.opt.siguranta) P(L('- Include regulile de securitate pentru activitățile experimentale.', '- Включи правила безопасности для экспериментов.'));
  P('');
  P(L(`Limba rezultatului: ${o.lang === 'ru' ? 'rusă' : 'română'}. Verifică de două ori calculele, unitățile de măsură și corectitudinea științifică înainte de a răspunde.`, 'Язык результата: русский (термины – как в русскоязычных учебниках Молдовы). Дважды проверь расчёты, единицы измерения и научную корректность.'));
  return lines.join('\n');
}
VIEWS.prompt = {
  title: () => T('Generator de prompturi', 'Генератор промптов'),
  html(R) {
    const s = selGet();
    const cls = NOU[R.q.cls] ? R.q.cls : (s ? s.cls : 'VI');
    const unr = R.q.u ? +R.q.u : (s && s.cls === cls ? s.unit : NOU[cls].unitati[0].nr);
    const cnr = R.q.c ? +R.q.c : null; const tip = R.q.tip || 'html';
    return `<h1>${T('Generator de prompturi', 'Генератор промптов')}</h1><p class="lead">${T('Alegeți tema – promptul se completează cu textul exact al curriculumului (UC, RÎ, conținuturi, contexte, termeni) și cu restricțiile clasei. Copiați-l într-un asistent AI (Claude, ChatGPT, Gemini etc.).', 'Выберите тему – промпт заполнится точным текстом куррикулума и ограничениями класса. Скопируйте его в ИИ-ассистента.')}</p>
    <div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:18px" id="pwrap">
    <div class="card no-print"><div class="grid g2"><label class="f">${T('Ce creăm?', 'Что создаём?')}<select id="qt">${Object.entries(PTYPES()).map(([k, v]) => `<option value="${k}" ${k === tip ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></label>
      <label class="f">${T('Limba rezultatului', 'Язык результата')}<select id="ql"><option value="ro" ${ST.lang !== 'ru' ? 'selected' : ''}>Română</option><option value="ru" ${ST.lang === 'ru' ? 'selected' : ''}>Русский</option></select></label>
      <label class="f">${T('Clasa', 'Класс')}${clsSelect('qc', cls)}</label><label class="f">${T('Unitatea', 'Раздел')}<span id="qus">${unitSelect('qu', cls, unr)}</span></label></div>
      <label class="f" style="margin-top:12px" id="qcw">${T('Unitatea de conținut (tema)', 'Тема')}<span id="qcs">${contSelect('qcc', cls, unr, cnr)}</span></label>
      <label class="f" style="margin-top:12px;display:none" id="qpw">${T('Tema proiectului', 'Тема проекта')}<select id="qp"></select></label>
      <div class="grid g2" style="margin-top:12px"><label class="f">${T('Durata (min)', 'Длительность (мин)')}<input type="number" id="qd" value="45" min="10" max="90"></label>
      <label class="f">${T('Modelul lecției', 'Модель урока')}<select id="qm"><option>ERRE (Evocare – Realizarea sensului – Reflecție – Extindere)</option><option>ERR</option><option>5E</option><option>${T('învățare prin investigație', 'обучение через исследование')}</option><option>${T('clasa inversată', 'перевёрнутый класс')}</option></select></label>
      <label class="f" id="qew" style="display:none">${T('Tipul evaluării', 'Тип оценивания')}<select id="qe"><option value="form">${T('formativă', 'формативное')}</option><option value="sum">${T('sumativă', 'итоговое')}</option></select></label></div>
      <div style="margin-top:12px"><div class="small muted" style="font-weight:700;margin-bottom:6px">${T('Rezultatele învățării', 'Результаты обучения')}</div><div id="qris" class="grid" style="gap:4px;max-height:220px;overflow:auto"></div></div>
      <div class="chips" style="margin-top:12px">${[['ctx', T('contexte de învățare', 'контексты')], ['con', T('conexiuni interdisciplinare', 'межпредметные связи')], ['val', T('valori și noile educații', 'ценности')], ['dif', T('diferențiere', 'дифференциация')], ['astro', T('element de astronomie', 'астрономия')], ['siguranta', T('reguli de securitate', 'безопасность')]].map(([k, l], i) => `<button class="chip ${i < 4 ? 'on' : ''}" data-o="${k}">${l}</button>`).join('')}</div>
      <label class="f" style="margin-top:12px">${T('Cerințe suplimentare (opțional)', 'Доп. требования')}<textarea id="qx" rows="2" placeholder="${T('ex.: clasa are 28 de elevi, laborator fără senzori, accent pe siguranța rutieră', 'напр.: 28 учащихся, нет датчиков')}"></textarea></label></div>
    <div><div class="row" style="margin-bottom:10px"><button class="btn pri" id="qcopy">${I.copy}${T('Copiază promptul', 'Копировать промпт')}</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">${I.ext}Claude</a><button class="btn" id="qtxt">${I.doc}.txt</button><span class="small muted" id="qlen"></span></div>
      <div class="prompt-out" id="qout"></div></div></div>`;
  },
  bind(R) {
    const s = selGet();
    const o = {cls: $('#qc').value, u: +$('#qu').value, c: $('#qcc').value ? +$('#qcc').value : null, tip: $('#qt').value, lang: $('#ql').value, dur: 45, model: 'ERRE', ri: [], ll: R.q.ll ? +R.q.ll : null, ev: 'form', opt: {ctx: 1, con: 1, val: 1, dif: 1}, p: R.q.p || '', extra: ''};
    if (R.q.ri) o.ri = R.q.ri.split(',');
    const risBox = (keep) => {
      const u = NOU[o.cls].unitati.find(x => x.nr === o.u);
      if (!keep) { const fromSel = s && s.cls === o.cls && s.unit === o.u && s.ri.length && !R.q.c ? s.ri : null;
        o.ri = fromSel ? [...fromSel] : u.uc.flatMap(q => q.ri).filter(r => o.c ? r.c === o.c : true).map(r => r.cod).slice(0, o.c ? 6 : (o.tip === 'pdld' || o.tip === 'eval' ? 99 : 3)); }
      $('#qris').innerHTML = u.uc.flatMap(q => q.ri).sort((a, b) => o.ri.includes(b.cod) - o.ri.includes(a.cod)).map(r => `<label class="small row" style="gap:8px;align-items:flex-start;flex-wrap:nowrap"><input type="checkbox" value="${r.cod}" ${o.ri.includes(r.cod) ? 'checked' : ''}><span><b>RÎ ${r.cod}</b> ${esc(r.text)}</span></label>`).join('');
      $$('#qris input').forEach(i => i.onchange = () => { o.ri = $$('#qris input:checked').map(x => x.value); out(); });
    };
    const projOpts = () => { $('#qp').innerHTML = NOU[o.cls].proiecte.map(p => { const t = (p.match(/^\d+\.\s*(.*?)\s*Discipline asociate/) || [0, p])[1]; return `<option ${o.p && t.startsWith(o.p.slice(0, 30)) ? 'selected' : ''}>${esc(p)}</option>`; }).join(''); o.p = $('#qp').value; };
    const vis = () => { $('#qpw').style.display = o.tip === 'proiect' ? '' : 'none'; $('#qcw').style.display = o.tip === 'proiect' ? 'none' : ''; $('#qew').style.display = o.tip === 'eval' ? '' : 'none'; };
    const out = () => { o.lang = $('#ql').value; o.dur = +$('#qd').value || 45; o.model = $('#qm').value; o.ev = $('#qe').value; o.extra = $('#qx').value.trim();
      const t = buildPrompt(o); $('#qout').textContent = t; $('#qlen').textContent = t.length + ' ' + T('caractere', 'символов'); };
    $('#qt').onchange = e => { o.tip = e.target.value; vis(); if (o.tip === 'proiect') projOpts(); risBox(); out(); };
    $('#qc').onchange = e => { o.cls = e.target.value; o.u = NOU[o.cls].unitati[0].nr; o.c = null; $('#qus').innerHTML = unitSelect('qu', o.cls, o.u); $('#qcs').innerHTML = contSelect('qcc', o.cls, o.u, null); bindU(); projOpts(); risBox(); out(); };
    const bindU = () => { $('#qu').onchange = e => { o.u = +e.target.value; o.c = null; $('#qcs').innerHTML = contSelect('qcc', o.cls, o.u, null); bindC(); risBox(); out(); }; bindC(); };
    const bindC = () => { $('#qcc').onchange = e => { o.c = e.target.value ? +e.target.value : null; risBox(); out(); }; };
    bindU();
    $('#qp').onchange = e => { o.p = e.target.value; out(); };
    ['#ql', '#qd', '#qm', '#qe'].forEach(k => $(k).onchange = out); $('#qx').oninput = out;
    $$('[data-o]').forEach(b => b.onclick = () => { b.classList.toggle('on'); o.opt[b.dataset.o] = b.classList.contains('on') ? 1 : 0; out(); });
    $('#qcopy').onclick = () => copy($('#qout').textContent);
    $('#qtxt').onclick = () => download('prompt_fizica.txt', $('#qout').textContent);
    vis(); if (o.tip === 'proiect') projOpts(); risBox(!!R.q.ri); out();
    if (innerWidth < 980) $('#pwrap').style.gridTemplateColumns = '1fr';
  }
};
