/* Vederi: Acasă, Curriculum, Laboratoare, Proiecte */
'use strict';
const GROUPS = () => [[T('Gimnaziu', 'Гимназия'), ['VI', 'VII', 'VIII', 'IX']], [T('Liceu · profil real', 'Лицей · реальный'), ['XR', 'XIR', 'XIIR']], [T('Liceu · umanist, general, arte, sport', 'Лицей · гуманитарный, общий, искусство, спорт'), ['XU', 'XIU', 'XIIU']]];
function clsChips(cur, base) {
  return `<div class="grid" style="gap:10px">${GROUPS().map(([g, ids]) => `<div class="row"><span class="small muted" style="min-width:210px;font-weight:700">${g}</span><div class="chips">${ids.map(id => `<a class="chip ${id === cur ? 'on' : ''}" href="#/${base}/${id}">${LBL[id]}</a>`).join('')}</div></div>`).join('')}</div>`;
}
const ORBIT = `<svg class="orbit" viewBox="0 0 300 300" aria-hidden="true"><defs><radialGradient id="sun"><stop offset="0" stop-color="#fff7c2"/><stop offset=".5" stop-color="var(--acc2)"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></radialGradient></defs>
<circle cx="150" cy="150" r="54" fill="url(#sun)"/><circle cx="150" cy="150" r="26" fill="var(--acc2)"/>
<g fill="none" stroke="var(--line)" stroke-width="1.5"><ellipse cx="150" cy="150" rx="84" ry="84"/><ellipse cx="150" cy="150" rx="118" ry="118" stroke-dasharray="3 6"/><ellipse cx="150" cy="150" rx="145" ry="145"/></g>
<g><circle r="8" fill="var(--acc)"><animateMotion dur="9s" repeatCount="indefinite" path="M234,150a84,84 0 1,1 -168,0a84,84 0 1,1 168,0"/></circle>
<circle r="11" fill="hsl(calc(var(--h) + 160) 70% 60%)"><animateMotion dur="17s" repeatCount="indefinite" path="M268,150a118,118 0 1,1 -236,0a118,118 0 1,1 236,0"/></circle>
<circle r="5" fill="var(--txt)" opacity=".8"><animateMotion dur="25s" repeatCount="indefinite" path="M295,150a145,145 0 1,1 -290,0a145,145 0 1,1 290,0"/></circle></g>
<path d="M20 250 C 60 210, 90 290, 130 250 S 200 210, 240 250 S 280 290, 300 260" fill="none" stroke="var(--acc)" stroke-width="2" opacity=".55"/></svg>`;

/* ================= ACASĂ ================= */
VIEWS[''] = {
  html() {
    const nri = CUR.nou.reduce((a, c) => a + allRI(c.id).length, 0);
    const nlab = CUR.nou.reduce((a, c) => a + c.unitati.reduce((b, u) => b + u.lab.length, 0), 0);
    const nunit = CUR.nou.reduce((a, c) => a + c.unitati.length, 0);
    const mods = [
      ['curriculum', 'book', T('Navighează curriculumul', 'Навигация по куррикулуму'), T('Clase, profiluri, unități, RÎ, conținuturi, contexte, termeni – cu trimitere la pagina din document.', 'Классы, профили, разделы, результаты обучения, содержание – со ссылкой на страницу документа.')],
      ['pdld', 'cal', T('Planificare de lungă durată', 'Долгосрочное планирование'), T('PDLD generat automat după orele din curriculum, cu date calendaristice; editabil, export Word.', 'Автоматическое планирование по часам куррикулума; редактируемое, экспорт в Word.')],
      ['lectie', 'plan', T('Plan de lecție', 'План урока'), T('Alegi tema și RÎ – primești obiective, etape ERR/ERRE/5E, activități și evaluare.', 'Выберите тему и результаты – получите цели, этапы, деятельность и оценивание.')],
      ['prompt', 'spark', T('Generator de prompturi', 'Генератор промптов'), T('Prompt complet pentru o lecție interactivă, fișă, evaluare, laborator virtual sau proiect.', 'Готовый промпт для интерактивного урока, рабочего листа, теста, виртуальной лабораторной или проекта.')],
      ['laboratoare', 'flask', T('Lucrări de laborator', 'Лабораторные работы'), T(`Toate cele ${nlab} lucrări, VI–XII, cu structura recomandată și fișă-model.`, `Все ${nlab} работ, VI–XII, с рекомендованной структурой.`)],
      ['proiecte', 'rocket', T('Proiecte interdisciplinare', 'Междисциплинарные проекты'), T('Temele de proiect pe clase, disciplinele asociate, etape și criterii.', 'Темы проектов по классам, связанные предметы, этапы и критерии.')],
      ['analiza', 'chart', T('Analiza curriculumului', 'Анализ куррикулума'), T('Ore, verbe, niveluri, noile educații, spirala conceptelor, verificări de coerență.', 'Часы, глаголы, уровни, новые воспитания, спираль понятий, проверки.')],
      ['comparatie', 'compare', T('Curriculum vechi ↔ nou', 'Старый ↔ новый куррикулум'), T('Unde a fost tema în 2019, ce s-a mutat, ce este nou, laboratoare comparate.', 'Где тема была в 2019, что перенесено, что ново.')],
      ['metodologie', 'compass', T('Metodologie', 'Методология'), T('Sugestiile metodologice, Concepția, strategii și modele de lecție cu exemple.', 'Методические рекомендации, Концепция, стратегии и модели уроков.')],
    ];
    return `<section class="hero"><div>
  <span class="tag">${T('Curriculum național 2026 · clasele VI–XII', 'Национальный куррикулум 2026 · VI–XII классы')}</span>
  <h1 style="margin-top:12px">${T('Fizică. Astronomie – tot ce îți trebuie pentru proiectare, într-un singur loc', 'Физика. Астрономия – всё для проектирования в одном месте')}</h1>
  <p class="lead">${T('Navighează noul curriculum, compară-l cu cel din 2019, generează planificări și planuri de lecție, creează prompturi pentru lecții interactive.', 'Изучайте новый куррикулум, сравнивайте с 2019 годом, создавайте планирование, планы уроков и промпты для интерактивных уроков.')}</p>
  <div class="row"><a class="btn pri" href="#/curriculum">${I.book}${T('Deschide curriculumul', 'Открыть куррикулум')}</a><button class="btn" onclick="openPalette()">${I.search}${T('Caută', 'Поиск')}</button></div>
  <div class="grid g4" style="margin-top:22px">
    <div class="kpi"><b>10</b><span>${T('clase și profiluri', 'классов и профилей')}</span></div>
    <div class="kpi"><b>${nunit}</b><span>${T('unități de învățare', 'разделов')}</span></div>
    <div class="kpi"><b>${nri}</b><span>${T('rezultate ale învățării', 'результатов обучения')}</span></div>
    <div class="kpi"><b>${nlab}</b><span>${T('lucrări de laborator', 'лабораторных работ')}</span></div>
  </div></div>${ORBIT}</section>
<h2>${T('Alege clasa', 'Выберите класс')}</h2>
<div class="cls-pick">${ORDER.map(id => `<a class="cls" href="#/curriculum/${id}"><b>${LBL[id]}</b><span>${NOU[id].ore_an} ${T('ore', 'ч')} · ${NOU[id].unitati.length} ${T('unități', 'разд.')}</span></a>`).join('')}</div>
<h2>${T('Ce poți face aici', 'Что можно сделать')}</h2>
<div class="grid auto mods">${mods.map(([r, ic, t, d]) => `<a class="card mod" href="#/${r}"><div class="ic">${I[ic]}</div><b>${t}</b><p>${d}</p></a>`).join('')}</div>
${ST.lang === 'ru' ? `<div class="note" style="margin-top:20px">Интерфейс доступен на русском языке. Тексты куррикулума приводятся на румынском языке, как в официальном документе; генератор промптов может формировать материалы на русском.</div>` : ''}`;
  }
};
VIEWS['meniu'] = {title: () => T('Meniu', 'Меню'), html: () => `<h1>${T('Meniu', 'Меню')}</h1><div class="grid" style="gap:6px">${NAV.filter(n => n[0] !== 'grp').map(([r, ic, l]) => `<a class="card row" style="padding:12px 16px;text-decoration:none;color:var(--txt)" href="#/${r}"><span style="width:22px;display:inline-block;color:var(--acc)">${I[ic]}</span><b>${l()}</b></a>`).join('')}</div>`};

/* ================= CURRICULUM ================= */
VIEWS.curriculum = {
  title: () => T('Curriculum 2026', 'Куррикулум 2026'),
  html(R) {
    const id = R.args[0];
    if (!NOU[id]) return `<h1>${T('Curriculum Fizică. Astronomie (2026)', 'Куррикулум «Физика. Астрономия» (2026)')}</h1><p class="lead">${T('Alegeți clasa și profilul.', 'Выберите класс и профиль.')}</p>${clsChips('', 'curriculum')}
      <h2>${T('Competențele specifice ale disciplinei', 'Специфические компетенции дисциплины')}</h2><div class="grid">${CUR.cs.map(r => `<div class="card"><b class="tag">${esc(r[0])}</b><div style="margin-top:6px">${esc(r.slice(1).join(' '))}</div></div>`).join('')}</div>
      <h2>${T('Glosar operațional', 'Операционный глоссарий')}</h2><div class="tw"><table class="t">${CUR.glosar.map((r, i) => i === 0 ? `<tr><th>${esc(r[0])}</th><th>${esc(r[1] || '')}</th></tr>` : `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1] || '')}</td></tr>`).join('')}</table></div>`;
    const c = NOU[id]; const nr = +R.args[1] || 0; const u = c.unitati.find(x => x.nr === nr);
    const mob = innerWidth < 980;
    const aside = `<aside>${mob ? `<details ${nr ? '' : 'open'} class="card" style="padding:10px 12px"><summary style="cursor:pointer;font-weight:800">${T('Unitățile de învățare', 'Разделы')} (${c.unitati.length})</summary><div style="margin-top:10px">` : ''}<div class="units">${c.unitati.map(x => `<button class="unit-btn ${x.nr === nr ? 'on' : ''}" onclick="go('curriculum/${id}/${x.nr}')"><span class="nr">${x.nr}</span><span class="tt">${esc(x.titlu)}</span><span class="h">${x.ore} ${T('ore', 'ч')}</span></button>`).join('')}
      <button class="unit-btn ${!nr ? 'on' : ''}" onclick="go('curriculum/${id}')"><span class="nr">∑</span><span class="tt">${T('Prezentarea clasei: ore, finalități, proiecte', 'Обзор класса: часы, итоги, проекты')}</span></button></div>
      <div class="card small" style="margin-top:12px"><b>${c.ore_an} ${T('ore pe an', 'ч в год')}</b> · ${esc(c.ore_sapt)}<br><a href="${pdfLink(c.pagini[0])}" target="_blank" rel="noopener">${I.page.replace('<svg', '<svg width="14" height="14"')} ${T('Curriculum, p.', 'Куррикулум, с.')} ${c.pagini[0]}–${c.pagini[1]}</a></div>${mob ? '</div></details>' : ''}</aside>`;
    let body;
    if (!u) {
      body = `<h2 style="margin-top:0">${T('Repartizarea orelor', 'Распределение часов')}</h2><div class="tw"><table class="t"><tr><th>${T('Unitatea de învățare', 'Раздел')}</th><th>${T('Total', 'Всего')}</th><th>${T('Predare–învățare', 'Обучение')}</th><th>${T('Laborator', 'Лаб.')}</th><th>${T('Evaluare sumativă', 'Итог. оценивание')}</th></tr>
        ${c.ore.map(r => `<tr ${r.titlu === 'Total' ? 'style="font-weight:800"' : ''}><td>${r.nr ? r.nr + '. ' : ''}${esc(r.titlu)}</td><td>${r.total ?? '–'}</td><td>${r.pi ?? '–'}</td><td>${r.lab ?? '–'}</td><td>${r.es ?? '–'}</td></tr>`).join('')}</table></div>
        ${c.note_ore.map(n => `<p class="small muted">${esc(n)}</p>`).join('')}
        <h2>${T('Finalități de învățare la sfârșitul clasei', 'Итоговые результаты в конце класса')}</h2><div class="card"><ol style="margin:0;padding-left:1.2em">${c.finalitati.map(f => `<li style="margin:4px 0">${esc(f)}</li>`).join('')}</ol></div>
        <h2>${T('Teme de proiecte interdisciplinare la alegere', 'Темы междисциплинарных проектов')}</h2><div class="grid g2">${c.proiecte.map(p => projCard(c, p)).join('')}</div>
        ${c.note.length ? `<h2>${T('Precizări', 'Уточнения')}</h2>${c.note.map(n => `<p class="note small">${esc(n)}</p>`).join('')}` : ''}`;
    } else {
      const hr = unitHours(id, nr); const tab = R.q.tab || 'ri';
      const tabs = [['ri', T('Rezultatele învățării', 'Результаты обучения')], ['cont', T('Conținuturi', 'Содержание')], ['lab', T('Laborator', 'Лабораторные')], ['ctx', T('Contexte de învățare', 'Контексты')], ['con', T('Conexiuni', 'Связи')], ['term', T('Termeni', 'Термины')], ['val', T('Valori · noua educație', 'Ценности')]];
      body = `<div class="row" style="justify-content:space-between;align-items:flex-start"><div><span class="tag">${c.label} · ${T('UÎ', 'Раздел')} ${u.nr}</span><h1 style="margin-top:8px">${esc(u.titlu)}</h1>
        <div class="row small muted"><span><b>${u.ore}</b> ${T('ore', 'ч')}</span>${hr.pi != null ? `<span>· ${hr.pi} ${T('predare–învățare', 'обучение')}</span>` : ''}${hr.lab ? `<span>· ${hr.lab} ${T('laborator', 'лаб.')}</span>` : ''}${hr.es ? `<span>· ${hr.es} ${T('evaluare sumativă', 'оценивание')}</span>` : ''}</div></div>
        <div class="row no-print"><a class="btn sm" href="#/pdld/${id}">${I.cal}PDLD</a><a class="btn sm" href="#/comparatie/${id}">${I.compare}2019</a></div></div>
        <div class="row" style="margin-top:10px">${u.noua.map(n => `<span class="tag g">${esc(n.split(':')[0])}</span>`).join('')}${u.cross.map(n => `<span class="tag y" title="${T('temă cross-curriculară', 'кросс-куррикулярная тема')}">✦ ${esc(n.length > 70 ? n.slice(0, 70) + '…' : n)}</span>`).join('')}</div>
        <div class="tabs">${tabs.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div><div id="tabbody">${unitTab(c, u, tab, R)}</div>`;
    }
    return `<div class="row" style="justify-content:space-between"><div><h1 style="margin:0">${esc(CLS_FULL(id))}</h1><p class="muted" style="margin:4px 0 14px">${T('Curriculumul național Fizică. Astronomie, 2026', 'Национальный куррикулум «Физика. Астрономия», 2026')}</p></div></div>
      ${ST.lang === 'ru' ? '<div class="note small" style="margin-bottom:12px">Тексты куррикулума приводятся на румынском языке, как в официальном документе.</div>' : ''}
      <details class="no-print" style="margin-bottom:16px"><summary class="small" style="cursor:pointer;font-weight:700">${T('Schimbă clasa', 'Другой класс')}</summary><div style="margin-top:10px">${clsChips(id, 'curriculum')}</div></details>
      <div class="cur-wrap">${aside}<section>${body}</section></div>`;
  },
  bind(R) {
    $$('.tabs button[data-tab]').forEach(b => b.onclick = () => { $$('.tabs button').forEach(x => x.classList.remove('on')); b.classList.add('on');
      const c = NOU[R.args[0]], u = c.unitati.find(x => x.nr === +R.args[1]); $('#tabbody').innerHTML = unitTab(c, u, b.dataset.tab, R); bindTab(R); });
    bindTab(R);
    if (R.q.ri) { const el = $(`[data-ri="${R.q.ri}"]`); if (el) { el.classList.add('sel'); el.scrollIntoView({block: 'center'}); } }
  }
};
function riRow(c, u, r) {
  const s = selGet(); const on = s && s.cls === c.id && s.unit === u.nr && s.ri.includes(r.cod);
  const w = r.text.split(' '); const lv = verbLvl(r.verb);
  return `<div class="ri ${on ? 'sel' : ''}" data-ri="${r.cod}" data-q="${esc(norm(r.text))}" data-l="${lv}"><span class="code">RÎ ${r.cod}</span><div><span class="verb">${esc(w[0])}</span> ${esc(w.slice(1).join(' '))}
    <div class="row small" style="margin-top:4px;gap:6px">${lv ? `<span class="tag">${LVL_NAME()[lv]}</span>` : ''}${r.c ? `<span class="tag" title="${T('asociere orientativă, calculată automat', 'ориентировочная связь')}">≈ C${r.c}</span>` : ''}</div></div>
    <div class="acts"><button data-sel="${r.cod}" title="${T('Adaugă la plan / prompt', 'Добавить в план / промпт')}">${on ? '✓' : I.plus}</button><button data-copy="RÎ ${r.cod}. ${esc(r.text)}" title="${T('Copiază', 'Копировать')}">${I.copy}</button><a href="${pdfLink(r.p)}" target="_blank" rel="noopener" title="${T('Pagina', 'Страница')} ${r.p}">${I.page}</a></div></div>`;
}
function unitTab(c, u, tab, R) {
  if (tab === 'ri') {
    const verbs = [...new Set(u.uc.flatMap(x => x.ri.map(r => r.verb)))];
    return `<div class="row no-print" style="margin-bottom:12px"><input type="search" id="rif" placeholder="${T('Filtrează RÎ…', 'Фильтр…')}" style="flex:1;min-width:200px">
      <select id="rilv"><option value="">${T('toate nivelurile', 'все уровни')}</option>${[1, 2, 3, 4, 5, 6].map(l => `<option value="${l}">${LVL_NAME()[l]}</option>`).join('')}</select>
      <button class="btn sm" id="selall">${I.plus}${T('Selectează toate', 'Выбрать все')}</button></div>
      <p class="small muted no-print">${T('Bifați RÎ (+) pentru a genera un plan de lecție sau un prompt. Verbe în această unitate:', 'Отметьте результаты (+) для плана урока или промпта. Глаголы:')} ${verbs.map(v => `<b>${esc(v)}</b>`).join(', ')}</p>
      ${u.uc.map(uc => `<div class="uc"><div class="uch"><span class="code">UC ${uc.cod}</span><span>${esc(uc.text)}</span></div>${uc.ri.map(r => riRow(c, u, r)).join('')}</div>`).join('')}`;
  }
  if (tab === 'cont') return u.cont.map(x => {
    const labs = u.lab.filter(l => l.c === x.nr); const ris = u.uc.flatMap(uc => uc.ri).filter(r => r.c === x.nr);
    const m = (CUR.match[`${c.id}|${u.nr}|${x.nr}`] || []);
    return `<div class="ci"><div class="row" style="justify-content:space-between"><div><b>C${x.nr}.</b> <strong>${esc(x.titlu)}</strong> ${x.calitativ ? `<span class="tag y">${T('studiu calitativ', 'качественно')}</span>` : ''}</div>
      <div class="row no-print"><a class="btn sm" href="#/lectie?cls=${c.id}&u=${u.nr}&c=${x.nr}">${I.plan}${T('Plan', 'План')}</a><a class="btn sm" href="#/prompt?cls=${c.id}&u=${u.nr}&c=${x.nr}">${I.spark}Prompt</a></div></div>
      ${x.detalii ? `<div class="small" style="margin-top:6px">${esc(x.detalii)}</div>` : ''}
      ${labs.map(l => `<div class="lab-badge">${I.flask}${T('Lucrare de laborator', 'Лабораторная работа')} nr. ${l.nr}: „${esc(l.titlu)}”</div>`).join('')}
      ${ris.length ? `<div class="small muted" style="margin-top:6px">${T('RÎ asociate (orientativ):', 'Связанные результаты (ориентир.):')} ${ris.map(r => `<a href="#/curriculum/${c.id}/${u.nr}?ri=${r.cod}">${r.cod}</a>`).join(', ')}</div>` : ''}
      ${m.length ? `<div class="small muted" style="margin-top:4px">${T('În curriculumul 2019:', 'В куррикулуме 2019:')} ${m.slice(0, 2).map(([oc, ou, ol, s]) => { const vu = VECHI[oc].unitati[ou]; return `<a href="#/comparatie/${oc}?u=${ou}">${LBL[oc]} · ${esc(vu.titlu)}</a> <span class="score" title="${T('similaritate', 'сходство')} ${s}"><i style="width:${Math.min(100, s * 160)}%"></i></span>`; }).join(' · ')}</div>` : ''}</div>`;
  }).join('');
  if (tab === 'lab') return u.lab.length ? u.lab.map(l => labCard(c, u, l)).join('') : `<div class="empty">${T('Această unitate nu are lucrări de laborator. Vezi „Contexte de învățare” pentru activități experimentale.', 'В этом разделе нет лабораторных работ.')}</div>`;
  if (tab === 'ctx') return u.contexte.length ? `<div class="grid g2">${u.contexte.map(x => `<div class="card"><span class="tag">${esc(x.tip)}</span><p style="margin:8px 0 0">${esc(x.text)}</p></div>`).join('')}</div>` : `<div class="empty">–</div>`;
  if (tab === 'con') return u.conexiuni.length ? `<div class="grid g2">${u.conexiuni.map(x => `<div class="card"><span class="tag y">${esc(x.disc)}</span><p style="margin:8px 0 0">${esc(x.text)}</p></div>`).join('')}</div>` : `<div class="empty">–</div>`;
  if (tab === 'term') { const nt = new Set(CUR.termeni_noi[`${c.id}|${u.nr}`] || []);
    return `<p class="small muted">${T('Marcate „nou” – termeni care nu apar în curriculumul din 2019 (verificare automată, orientativă).', 'Отмечены «новые» – термины, которых нет в куррикулуме 2019 (автоматическая проверка).')}</p><div class="chips">${u.termeni.map(t => `<span class="chip" style="cursor:default">${esc(t)}${nt.has(t) ? ' <span class="tag g">' + T('nou', 'новый') + '</span>' : ''}</span>`).join('')}</div>`; }
  if (tab === 'val') return `<div class="grid g2"><div class="card"><h3>${T('Valori proiectate', 'Ценности')}</h3><ul>${u.valori.map(v => `<li>${esc(v)}</li>`).join('')}</ul></div>
    <div class="card"><h3>${T('Noua educație integrată', 'Новые воспитания')}</h3>${u.noua.length ? `<ul>${u.noua.map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : '<p class="muted">–</p>'}
    ${u.cross.length ? `<h3>${T('Temă cross-curriculară', 'Кросс-куррикулярная тема')}</h3><ul>${u.cross.map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : ''}</div></div>`;
  return '';
}
function bindTab(R) {
  const id = R.args[0], nr = +R.args[1];
  $$('[data-sel]').forEach(b => b.onclick = () => { selToggle(id, nr, b.dataset.sel); const row = b.closest('.ri'); const on = selGet() && selGet().ri.includes(b.dataset.sel); row.classList.toggle('sel', on); b.innerHTML = on ? '✓' : I.plus; });
  $$('[data-copy]').forEach(b => b.onclick = () => copy(b.dataset.copy));
  const f = $('#rif'), lv = $('#rilv');
  const flt = () => { const q = norm(f.value); $$('.ri').forEach(r => { r.style.display = (!q || r.dataset.q.includes(q)) && (!lv.value || r.dataset.l === lv.value) ? '' : 'none'; }); };
  if (f) { f.oninput = flt; lv.onchange = flt; }
  const sa = $('#selall'); if (sa) sa.onclick = () => { $$('.ri').filter(r => r.style.display !== 'none').forEach(r => { const s = selGet(); if (!(s && s.cls === id && s.unit === nr && s.ri.includes(r.dataset.ri))) selToggle(id, nr, r.dataset.ri); }); render(); };
}

/* ================= LABORATOARE ================= */
const LAB7 = () => [T('Scopul lucrării', 'Цель работы'), T('Materiale și echipamente necesare', 'Материалы и оборудование'), T('Modul de lucru', 'Ход работы'), T('Înregistrarea datelor experimentale (tabelul de date)', 'Запись экспериментальных данных (таблица)'), T('Prelucrarea și interpretarea datelor experimentale', 'Обработка и интерпретация данных'), T('Analiza erorilor și a incertitudinilor de măsurare', 'Анализ погрешностей измерений'), T('Formularea concluziilor', 'Выводы')];
function labCard(c, u, l) {
  const x = u.cont.find(k => k.nr === l.c);
  return `<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><div><span class="tag g">${c.label} · ${T('UÎ', 'Р')}${u.nr} · LL${l.nr}</span>
    <h3 style="margin:8px 0 4px">${esc(l.titlu)}</h3><div class="small muted">${esc(u.titlu)}${x ? ' · C' + x.nr + '. ' + esc(x.titlu) : ''}</div></div>
    <div class="row no-print"><a class="btn sm" href="#/lectie?cls=${c.id}&u=${u.nr}&c=${l.c || ''}&tip=lab&ll=${l.nr}">${I.plan}${T('Plan de lecție', 'План урока')}</a><a class="btn sm pri" href="#/prompt?cls=${c.id}&u=${u.nr}&c=${l.c || ''}&tip=lab&ll=${l.nr}">${I.spark}${T('Fișă / laborator virtual', 'Лист / вирт. лаборатория')}</a></div></div></div>`;
}
VIEWS.laboratoare = {
  title: () => T('Lucrări de laborator', 'Лабораторные работы'),
  html(R) {
    const f = R.q.cls || '';
    const list = CUR.nou.filter(c => !f || c.id === f);
    const tot = CUR.nou.reduce((a, c) => a + c.unitati.reduce((b, u) => b + u.lab.length, 0), 0);
    return `<h1>${T('Lucrări de laborator', 'Лабораторные работы')}</h1><p class="lead">${T(`Toate cele ${tot} lucrări de laborator prevăzute de curriculum, pe clase și unități. Pentru fiecare – plan de lecție și prompt pentru fișa elevului sau un laborator virtual.`, `Все ${tot} лабораторных работ по классам и разделам.`)}</p>
      <div class="card" style="margin-bottom:18px"><h3>${T('Structura recomandată a lucrării de laborator', 'Рекомендуемая структура лабораторной работы')}</h3><div class="steps">${LAB7().map(s => `<div>${s}</div>`).join('')}</div>
      <p class="small muted" style="margin-bottom:0">${T('La profilul real, clasele X–XII, se adaugă 10 ore de investigații experimentale (3 ore pentru alegerea problemelor, 6 ore de laborator, 1 oră de prezentare).', 'В реальном профиле X–XII добавляются 10 часов экспериментальных исследований.')}</p></div>
      <div class="chips no-print" style="margin-bottom:16px"><a class="chip ${!f ? 'on' : ''}" href="#/laboratoare">${T('Toate', 'Все')}</a>${ORDER.map(id => `<a class="chip ${f === id ? 'on' : ''}" href="#/laboratoare?cls=${id}">${LBL[id]}<span class="n">${NOU[id].unitati.reduce((a, u) => a + u.lab.length, 0)}</span></a>`).join('')}</div>
      ${list.map(c => `<h2>${esc(CLS_FULL(c.id))}</h2>${c.unitati.flatMap(u => u.lab.map(l => labCard(c, u, l))).join('')}`).join('')}
      <h2>${T('Lucrările de laborator din curriculumul 2019', 'Лабораторные работы куррикулума 2019')}</h2><p class="small muted">${T('Pentru comparație – extrase din coloana „Activități și produse de învățare”.', 'Для сравнения.')}</p>
      <div class="grid g2">${CUR.vechi.filter(c => !f || c.id === f).map(c => `<div class="card old"><b>${c.label}</b><ul class="small" style="margin:6px 0 0;padding-left:1.1em">${c.unitati.flatMap(u => u.lab).map(l => `<li>${esc(l)}</li>`).join('') || '<li>–</li>'}</ul></div>`).join('')}</div>`;
  }
};

/* ================= PROIECTE ================= */
function projCard(c, p) {
  const m = p.match(/^(\d+)\.\s*(.*?)\s*Discipline asociate:\s*(.*)$/);
  const t = m ? m[2] : p, d = m ? m[3].replace(/\.$/, '') : '';
  const enc = encodeURIComponent(t);
  return `<div class="card"><span class="tag">${c.label}${m ? ' · ' + T('tema', 'тема') + ' ' + m[1] : ''}</span><h3 style="margin:8px 0 6px">${esc(t)}</h3>
    ${d ? `<div class="chips">${d.split(/,\s*/).map(x => `<span class="tag y">${esc(x)}</span>`).join('')}</div>` : ''}
    <div class="row no-print" style="margin-top:12px"><a class="btn sm pri" href="#/prompt?cls=${c.id}&tip=proiect&p=${enc}">${I.spark}${T('Prompt pentru proiect', 'Промпт проекта')}</a></div></div>`;
}
VIEWS.proiecte = {
  title: () => T('Proiecte interdisciplinare', 'Междисциплинарные проекты'),
  html(R) {
    const f = R.q.cls || '';
    return `<h1>${T('Proiecte interdisciplinare', 'Междисциплинарные проекты')}</h1><p class="lead">${T('Temele de proiect recomandate de curriculum pentru fiecare clasă (2 ore la clasa a VI-a, 4 ore în celelalte clase), cu disciplinele asociate.', 'Рекомендуемые темы проектов по классам.')}</p>
      <div class="card" style="margin-bottom:18px"><h3>${T('Etapele unui proiect interdisciplinar', 'Этапы междисциплинарного проекта')}</h3><div class="steps">
      <div><b>${T('Lansare', 'Запуск')}</b> – ${T('problema autentică, întrebarea de cercetare, formarea echipelor, criteriile de evaluare comunicate de la început.', 'аутентичная проблема, вопрос исследования, команды, критерии оценивания.')}</div>
      <div><b>${T('Planificare', 'Планирование')}</b> – ${T('roluri, calendar, surse, măsuri de siguranță.', 'роли, график, источники, безопасность.')}</div>
      <div><b>${T('Investigare', 'Исследование')}</b> – ${T('colectarea datelor (măsurări, observații, sondaje, simulări), cu legătura explicită la RÎ.', 'сбор данных с явной связью с результатами обучения.')}</div>
      <div><b>${T('Produsul', 'Продукт')}</b> – ${T('poster, infografic, raport, machetă, prezentare, aplicație, campanie în comunitate.', 'постер, инфографика, отчёт, макет, презентация.')}</div>
      <div><b>${T('Prezentare și evaluare', 'Презентация и оценивание')}</b> – ${T('după criterii (conținut științific, metodă, produs, comunicare, colaborare), autoevaluare și interevaluare.', 'по критериям, само- и взаимооценивание.')}</div></div></div>
      <div class="chips no-print" style="margin-bottom:16px"><a class="chip ${!f ? 'on' : ''}" href="#/proiecte">${T('Toate', 'Все')}</a>${ORDER.map(id => `<a class="chip ${f === id ? 'on' : ''}" href="#/proiecte?cls=${id}">${LBL[id]}</a>`).join('')}</div>
      ${CUR.nou.filter(c => !f || c.id === f).map(c => `<h2>${esc(CLS_FULL(c.id))}</h2><div class="grid g2">${c.proiecte.map(p => projCard(c, p)).join('')}</div>`).join('')}`;
  }
};
