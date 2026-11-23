/* Vederi: Analiza curriculumului, Comparația vechi ↔ nou */
'use strict';
const DISC_NORM = d => d.replace(/\s*\/\s*/g, '/').replace(/^Informatică\/TIC|^TIC$|^Informatică$/, 'Informatică/TIC').replace(/^Astronomie\/Geografie$|^Geografie\/Astronomie$/, 'Geografie');
function bars(rows, max) {
  max = max || Math.max(1, ...rows.map(r => r[1]));
  return `<div class="bars">${rows.map(([l, v, t]) => `<div class="bar"><span title="${esc(t || l)}">${esc(l)}</span><div class="tr"><i style="width:${100 * v / max}%"></i></div><span class="v">${v}</span></div>`).join('')}</div>`;
}
VIEWS.analiza = {
  title: () => T('Analiza curriculumului', 'Анализ куррикулума'),
  html(R) {
    const tab = R.q.tab || 'ore';
    const tabs = [['ore', T('Ore și coerență', 'Часы и согласованность')], ['verbe', T('Verbe și niveluri', 'Глаголы и уровни')], ['spirala', T('Spirala conceptelor', 'Спираль понятий')], ['noua', T('Noile educații', 'Новые воспитания')], ['con', T('Conexiuni', 'Связи')], ['ctx', T('Contexte', 'Контексты')], ['export', T('Export', 'Экспорт')]];
    return `<h1>${T('Analiza curriculumului', 'Анализ куррикулума')}</h1><p class="lead">${T('Priviri de ansamblu calculate direct din textul curriculumului: ore, niveluri cognitive, progresia conceptelor, noile educații și conexiunile interdisciplinare.', 'Обзоры, рассчитанные непосредственно по тексту куррикулума.')}</p>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="${k === tab ? 'on' : ''}" onclick="go('analiza?tab=${k}')">${l}</button>`).join('')}</div>${this[tab] ? this[tab](R) : ''}`;
  },
  ore() {
    const chk = [];
    for (const c of CUR.nou) {
      const rows = c.ore.filter(r => r.titlu !== 'Total'); const tot = c.ore.find(r => r.titlu === 'Total') || {};
      const sum = rows.reduce((a, r) => a + (r.total || 0), 0);
      if (sum !== c.ore_an) chk.push([c.label, T(`suma rândurilor ${sum} ≠ ${c.ore_an} ore pe an`, `сумма ${sum} ≠ ${c.ore_an}`)]);
      for (const u of c.unitati) { const r = unitHours(c.id, u.nr);
        if (r.total != null && r.total !== u.ore) chk.push([c.label, T(`UÎ ${u.nr}: ${u.ore} ore în titlu, ${r.total} în tabel`, `Р${u.nr}: ${u.ore} в заголовке, ${r.total} в таблице`)]);
        if (r.total != null && r.pi != null) { const s = (r.pi || 0) + (r.lab || 0) + (r.es || 0); if (s !== r.total) chk.push([c.label, T(`UÎ ${u.nr} „${u.titlu}”: ${r.pi} P-Î + ${r.lab || 0} LL + ${r.es || 0} ES = ${s}, nu ${r.total}`, `Р${u.nr}: ${s} ≠ ${r.total}`)]); }
        if (r.lab != null && r.lab !== u.lab.length) chk.push([c.label, T(`UÎ ${u.nr}: ${r.lab} ore de laborator în tabel, ${u.lab.length} lucrări numite în conținuturi`, `Р${u.nr}: ${r.lab} ч лаб., ${u.lab.length} работ`)]); }
    }
    return `<div class="grid g2">${CUR.nou.map(c => `<div class="card"><div class="row" style="justify-content:space-between"><b>${esc(CLS_FULL(c.id))}</b><span class="tag">${c.ore_an} ${T('ore', 'ч')}</span></div>
      <div style="margin-top:10px">${bars(c.ore.filter(r => r.titlu !== 'Total').map(r => [r.titlu.length > 22 ? r.titlu.slice(0, 21) + '…' : r.titlu, r.total || 0, r.titlu]), Math.max(...CUR.nou.flatMap(x => x.ore.filter(r => r.titlu !== 'Total').map(r => r.total || 0))))}</div></div>`).join('')}</div>
      <h2>${T('Verificări automate de coerență', 'Автоматические проверки')}</h2><p class="small muted">${T('Utile grupului de autori și autorilor de manuale: diferențe între titluri, tabelul de ore și lucrările numite în conținuturi.', 'Полезно авторам: расхождения между заголовками, таблицей часов и названными работами.')}</p>
      ${chk.length ? `<div class="tw"><table class="t"><tr><th>${T('Clasa', 'Класс')}</th><th>${T('Observație', 'Замечание')}</th></tr>${chk.map(([a, b]) => `<tr><td><b>${esc(a)}</b></td><td class="warn">${esc(b)}</td></tr>`).join('')}</table></div>` : `<p class="ok">✓ ${T('Nicio diferență găsită.', 'Расхождений нет.')}</p>`}`;
  },
  verbe() {
    const L = [1, 2, 3, 4, 5, 6];
    const mat = CUR.nou.map(c => { const rs = allRI(c.id); const n = rs.length; return [c, n, L.map(l => rs.filter(r => verbLvl(r.verb) === l).length)]; });
    const allv = {}; CUR.nou.forEach(c => allRI(c.id).forEach(r => allv[r.verb] = (allv[r.verb] || 0) + 1));
    return `<div class="card"><h3>${T('Ponderea nivelurilor cognitive pe clase (după verbul RÎ)', 'Доля когнитивных уровней по классам')}</h3><p class="small muted">${T('Clasificare orientativă a verbelor. Progresia așteptată: de la descriere și explicare (gimnaziu) spre investigare, modelare și evaluare (liceu).', 'Ориентировочная классификация глаголов.')}</p>
      <div class="tw"><table class="t heat"><tr><th>${T('Clasa', 'Класс')}</th><th>RÎ</th>${L.map(l => `<th>${LVL_NAME()[l]}</th>`).join('')}</tr>${mat.map(([c, n, v]) => `<tr><td style="text-align:left"><a href="#/curriculum/${c.id}">${c.label}</a></td><td>${n}</td>${v.map(x => { const p = Math.round(100 * x / n); return `<td style="background:hsl(var(--h) 85% 55% / ${Math.min(.85, p / 45)})">${p}%</td>`; }).join('')}</tr>`).join('')}</table></div></div>
      <div class="grid g2" style="margin-top:16px"><div class="card"><h3>${T('Cele mai frecvente verbe', 'Самые частые глаголы')}</h3>${bars(Object.entries(allv).sort((a, b) => b[1] - a[1]).slice(0, 20))}</div>
      <div class="card"><h3>${T('Verbele pe niveluri', 'Глаголы по уровням')}</h3>${L.map(l => `<p class="small"><span class="tag">${LVL_NAME()[l]}</span> ${VERB_LVL[l].join(', ')}</p>`).join('')}</div></div>`;
  },
  spirala(R) {
    const q = R.q.q || '';
    const sug = ['viteză', 'energie', 'densitate', 'presiune', 'câmp', 'undă', 'lumin', 'curent electric', 'temperatur', 'Lun', 'Soare', 'forț', 'oscila', 'sarcin', 'magnet', 'nucle'];
    let res = '';
    if (q) {
      const n = norm(q);
      res = ORDER.map(id => { const c = NOU[id];
        const hits = c.unitati.flatMap(u => [...u.cont.filter(x => norm(x.titlu + ' ' + x.detalii).includes(n)).map(x => `<div class="small"><a href="#/curriculum/${id}/${u.nr}?tab=cont">UÎ${u.nr} · C${x.nr}</a> ${hl(x.titlu, q)}</div>`),
          ...u.uc.flatMap(uc => uc.ri).filter(r => norm(r.text).includes(n)).map(r => `<div class="small"><a href="#/curriculum/${id}/${u.nr}?ri=${r.cod}">RÎ ${r.cod}</a> ${hl(r.text.length > 170 ? r.text.slice(0, 170) + '…' : r.text, q)}</div>`)]);
        return `<div class="card" style="border-left:4px solid ${hits.length ? 'var(--acc)' : 'var(--line)'}"><div class="row" style="justify-content:space-between"><b>${esc(CLS_FULL(id))}</b><span class="tag ${hits.length ? '' : 'r'}">${hits.length}</span></div>${hits.slice(0, 8).join('')}${hits.length > 8 ? `<div class="small muted">+ ${hits.length - 8}…</div>` : ''}</div>`; }).join('');
    }
    return `<div class="card"><h3>${T('Cum evoluează un concept de la clasa a VI-a la a XII-a?', 'Как понятие развивается с VI по XII класс?')}</h3>
      <div class="row"><input type="search" id="spq" value="${esc(q)}" placeholder="${T('ex.: viteză, energie, câmp…', 'напр.: скорость…')}" style="flex:1"><button class="btn pri" id="spb">${I.search}${T('Arată spirala', 'Показать')}</button></div>
      <div class="chips" style="margin-top:10px">${sug.map(s => `<a class="chip" href="#/analiza?tab=spirala&q=${encodeURIComponent(s)}">${s}</a>`).join('')}</div></div><div class="grid" style="margin-top:14px">${res}</div>`;
  },
  noua() {
    const rows = CUR.nou.flatMap(c => c.unitati.filter(u => u.noua.length || u.cross.length).map(u => `<tr><td><b>${c.label}</b></td><td><a href="#/curriculum/${c.id}/${u.nr}?tab=val">${u.nr}. ${esc(u.titlu)}</a></td><td>${u.noua.map(esc).join('<br>')}</td><td>${u.cross.map(esc).join('<br>')}</td></tr>`));
    const cnt = {}; CUR.nou.forEach(c => c.unitati.forEach(u => u.noua.forEach(n => { const k = n.split(':')[0].trim(); cnt[k] = (cnt[k] || 0) + 1; })));
    return `<div class="card"><h3>${T('Noile educații – frecvență', 'Новые воспитания – частота')}</h3>${bars(Object.entries(cnt).sort((a, b) => b[1] - a[1]))}</div>
      <h2>${T('Unde sunt integrate', 'Где интегрированы')}</h2><div class="tw"><table class="t"><tr><th>${T('Clasa', 'Класс')}</th><th>${T('Unitatea', 'Раздел')}</th><th>${T('Noua educație', 'Новое воспитание')}</th><th>${T('Temă cross-curriculară', 'Кросс-куррикулярная тема')}</th></tr>${rows.join('')}</table></div>`;
  },
  con() {
    const D = {}; const set = new Set();
    CUR.nou.forEach(c => c.unitati.forEach(u => u.conexiuni.forEach(x => { const d = DISC_NORM(x.disc); set.add(d); D[c.id] = D[c.id] || {}; D[c.id][d] = (D[c.id][d] || 0) + 1; })));
    const ds = [...set].sort((a, b) => ORDER.reduce((s, id) => s + ((D[id] || {})[b] || 0), 0) - ORDER.reduce((s, id) => s + ((D[id] || {})[a] || 0), 0));
    return `<div class="card"><h3>${T('Conexiuni interdisciplinare pe clase (numărul de unități)', 'Междисциплинарные связи по классам')}</h3><div class="tw"><table class="t heat"><tr><th>${T('Disciplina', 'Предмет')}</th>${ORDER.map(id => `<th>${LBL[id]}</th>`).join('')}</tr>
      ${ds.map(d => `<tr><td style="text-align:left"><b>${esc(d)}</b></td>${ORDER.map(id => { const v = (D[id] || {})[d] || 0; return `<td style="background:hsl(var(--h) 85% 55% / ${v ? .15 + v * .15 : 0})">${v || ''}</td>`; }).join('')}</tr>`).join('')}</table></div></div>`;
  },
  ctx() {
    const D = {}; CUR.nou.forEach(c => c.unitati.forEach(u => u.contexte.forEach(x => { const k = x.tip.replace(/\s*\(.*\)/, ''); D[k] = (D[k] || 0) + 1; })));
    return `<div class="card"><h3>${T('Tipuri de contexte de învățare', 'Типы контекстов обучения')}</h3>${bars(Object.entries(D).sort((a, b) => b[1] - a[1]))}</div>
      <p class="small muted">${T('Fiecare context este afișat la unitatea respectivă (fila „Contexte de învățare”) și este folosit automat în planurile de lecție și în prompturi.', 'Каждый контекст используется в планах уроков и промптах.')}</p>`;
  },
  export() {
    return `<div class="card"><h3>${T('Descarcă datele', 'Скачать данные')}</h3><p>${T('Toate rezultatele învățării într-un tabel (CSV) – se deschide în Excel sau Google Sheets: clasa, unitatea, UC, RÎ, verbul, nivelul, pagina.', 'Все результаты обучения в CSV.')}</p>
      <div class="row"><button class="btn pri" id="csv">${I.doc}CSV – ${T('rezultatele învățării', 'результаты обучения')}</button><button class="btn" id="csvc">${I.doc}CSV – ${T('conținuturi și laboratoare', 'содержание и лабораторные')}</button></div></div>`;
  },
  bind(R) {
    const sp = $('#spb'); if (sp) { const f = () => go('analiza?tab=spirala&q=' + encodeURIComponent($('#spq').value)); sp.onclick = f; $('#spq').onkeydown = e => e.key === 'Enter' && f(); }
    const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const c1 = $('#csv'); if (c1) c1.onclick = () => download('RI_Fizica_Astronomie_2026.csv', [['Clasa', 'UI', 'Unitatea', 'UC', 'Unitatea de competenta', 'RI', 'Rezultatul invatarii', 'Verb', 'Nivel', 'Pagina'].map(q).join(';'),
      ...CUR.nou.flatMap(c => allRI(c.id).map(r => [c.label, r.u.nr, r.u.titlu, r.uc.cod, r.uc.text, r.cod, r.text, r.verb, LVL_NAME()[verbLvl(r.verb)] || '', r.p].map(q).join(';')))].join('\n'), 'text/csv');
    const c2 = $('#csvc'); if (c2) c2.onclick = () => download('Continuturi_Fizica_Astronomie_2026.csv', [['Clasa', 'UI', 'Unitatea', 'Ore', 'C', 'Continut', 'Detalii', 'Laborator'].map(q).join(';'),
      ...CUR.nou.flatMap(c => c.unitati.flatMap(u => u.cont.map(x => [c.label, u.nr, u.titlu, u.ore, 'C' + x.nr, x.titlu, x.detalii, u.lab.filter(l => l.c === x.nr).map(l => 'LL' + l.nr + ' ' + l.titlu).join(' | ')].map(q).join(';'))))].join('\n'), 'text/csv');
  }
};

/* ================= VECHI ↔ NOU ================= */
VIEWS.comparatie = {
  title: () => T('Curriculum vechi ↔ nou', 'Старый ↔ новый'),
  html(R) {
    const id = R.args[0] || 'VI'; const c = NOU[id], v = VECHI[id]; const hu = R.q.u != null ? +R.q.u : -1;
    const nOldUC = v.unitati.reduce((a, u) => a + u.uc.length, 0), nOldLab = v.unitati.reduce((a, u) => a + u.lab.length, 0);
    const nLab = c.unitati.reduce((a, u) => a + u.lab.length, 0);
    const links = c.unitati.flatMap(u => u.cont.map(x => [u, x, (CUR.match[`${id}|${u.nr}|${x.nr}`] || [])[0]]));
    const moved = links.filter(([u, x, m]) => m && m[0] !== id && m[3] >= .3);
    const fresh = links.filter(([u, x, m]) => !m || m[3] < .24);
    const nt = c.unitati.flatMap(u => CUR.termeni_noi[`${id}|${u.nr}`] || []);
    return `<h1>${T('Curriculum 2019 ↔ Curriculum 2026', 'Куррикулум 2019 ↔ 2026')}</h1><p class="lead">${T('Legăturile sunt calculate automat după asemănarea textelor (orientativ) – verificați întotdeauna în documentele oficiale.', 'Связи рассчитаны автоматически по сходству текстов (ориентировочно).')}</p>
      <div class="chips no-print" style="margin-bottom:16px">${ORDER.map(x => `<a class="chip ${x === id ? 'on' : ''}" href="#/comparatie/${x}">${LBL[x]}</a>`).join('')}</div>
      <div class="grid g4"><div class="card kpi"><b>${v.unitati.length} → ${c.unitati.length}</b><span>${T('unități de învățare', 'разделов')}</span></div>
      <div class="card kpi"><b>${nOldUC} → ${allRI(id).length}</b><span>${T('unități de competență (2019) → RÎ (2026)', 'компетенции (2019) → результаты (2026)')}</span></div>
      <div class="card kpi"><b>${nOldLab} → ${nLab}</b><span>${T('lucrări de laborator (menționate)', 'лабораторных работ')}</span></div>
      <div class="card kpi"><b>${nt.length}</b><span>${T('termeni noi față de 2019', 'новых терминов')}</span></div></div>
      <div class="cmp" style="margin-top:18px"><div><h2>${T('2019', '2019')}</h2>${v.unitati.map((u, i) => `<details class="card old" style="margin-bottom:10px" ${i === hu ? 'open id="hu"' : ''}><summary style="cursor:pointer"><b>${esc(u.titlu)}</b> ${u.comp && u.comp !== u.titlu ? `<span class="small muted">· ${esc(u.comp)}</span>` : ''}</summary>
        <div class="small" style="margin-top:8px"><b>${T('Conținuturi', 'Содержание')}:</b> ${u.cont.map(esc).join(' · ')}</div>${u.lab.length ? `<div class="small" style="margin-top:6px"><b>${T('Laborator', 'Лаб.')}:</b> ${u.lab.map(esc).join(' · ')}</div>` : ''}
        <div class="small muted" style="margin-top:6px">${u.uc.length} ${T('unități de competență', 'ед. компетенции')}</div></details>`).join('')}
        <details class="card old"><summary style="cursor:pointer"><b>${T('Finalități 2019', 'Итоги 2019')}</b></summary><ul class="small">${v.finalitati.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details></div>
      <div><h2>2026</h2>${c.unitati.map(u => `<div class="card new" style="margin-bottom:10px"><div class="row" style="justify-content:space-between"><b><a href="#/curriculum/${id}/${u.nr}">${u.nr}. ${esc(u.titlu)}</a></b><span class="tag">${u.ore} ${T('ore', 'ч')}</span></div>
        <div class="small" style="margin-top:6px">${u.cont.map(x => 'C' + x.nr + '. ' + esc(x.titlu)).join(' · ')}</div>${u.lab.length ? `<div class="small" style="margin-top:6px"><b>${T('Laborator', 'Лаб.')}:</b> ${u.lab.map(l => esc(l.titlu)).join(' · ')}</div>` : ''}</div>`).join('')}</div></div>
      <h2>${T('Teme mutate între clase', 'Темы, перенесённые между классами')}</h2>
      ${moved.length ? `<div class="card">${moved.map(([u, x, m]) => `<div class="link-row"><div><span class="tag">${LBL[m[0]]}</span> ${esc(VECHI[m[0]].unitati[m[1]].titlu)} – <span class="muted">${esc((VECHI[m[0]].unitati[m[1]].cont[m[2]] || '').slice(0, 90))}</span></div><div class="arr">→</div><div><span class="tag">${c.label}</span> C${x.nr}. ${esc(x.titlu)} <span class="score"><i style="width:${Math.min(100, m[3] * 160)}%"></i></span></div></div>`).join('')}</div>` : `<p class="muted">–</p>`}
      <h2>${T('Conținuturi fără corespondent clar în 2019 (probabil noi)', 'Содержание без явного соответствия в 2019 (вероятно новое)')}</h2>
      <div class="chips">${fresh.map(([u, x]) => `<a class="chip" href="#/curriculum/${id}/${u.nr}?tab=cont">C${x.nr}. ${esc(x.titlu.length > 60 ? x.titlu.slice(0, 60) + '…' : x.titlu)}</a>`).join('') || '–'}</div>
      <h2>${T('Toate legăturile pe conținuturi', 'Все связи по содержанию')}</h2><div class="card">${links.map(([u, x, m]) => `<div class="link-row"><div><b>${c.label} · UÎ${u.nr} · C${x.nr}.</b> ${esc(x.titlu)}</div><div class="arr">←</div><div>${m ? `<span class="tag">${LBL[m[0]]}</span> <a href="#/comparatie/${m[0]}?u=${m[1]}">${esc(VECHI[m[0]].unitati[m[1]].titlu)}</a> <span class="muted small">${esc((VECHI[m[0]].unitati[m[1]].cont[m[2]] || '').slice(0, 80))}</span><span class="score"><i style="width:${Math.min(100, m[3] * 160)}%"></i></span>` : `<span class="muted">${T('fără corespondent', 'нет соответствия')}</span>`}</div></div>`).join('')}</div>
      <h2>${T('Termeni noi față de 2019', 'Новые термины по сравнению с 2019')}</h2><div class="chips">${nt.map(t => `<span class="chip" style="cursor:default">${esc(t)}</span>`).join('') || '–'}</div>`;
  },
  bind() { const h = $('#hu'); if (h) h.scrollIntoView({block: 'center'}); }
};
