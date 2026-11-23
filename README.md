# Fizică. Astronomie – platforma profesorului

Platformă web pentru profesorii de fizică din Republica Moldova, construită pe **Curriculumul național Fizică. Astronomie (2026)**, clasele VI–XII.

## Ce conține
- **Curriculum 2026** – clase și profiluri, unități de învățare, UC, RÎ (cu pagina din PDF), conținuturi, lucrări de laborator, contexte, conexiuni, termeni, valori, noile educații.
- **Laboratoare și proiecte** – toate lucrările de laborator și temele de proiect, cu structura recomandată.
- **Planificare (PDLD)** – generată automat după orele din curriculum, cu date calendaristice; editabilă; export Word/CSV.
- **Plan de lecție** – ERR, ERRE, 5E, laborator, evaluare sumativă; obiective formulate din RÎ; export Word.
- **Generator de prompturi** – lecție interactivă HTML, fișă, evaluare, laborator virtual, proiect, prezentare, PDLD (RO/RU).
- **Analiză** – ore și verificări de coerență, niveluri cognitive, spirala conceptelor, noile educații, conexiuni, export CSV.
- **Vechi ↔ Nou** – legături orientative cu curriculumul din 2019, teme mutate, conținuturi noi, termeni noi.
- **Metodologie și bibliotecă** – Sugestiile metodologice, Concepția, strategii cu exemple, documente PDF, resurse digitale.

## Publicare pe GitHub Pages
1. Creați un depozit nou (de ex. `fizica-astronomie`) și încărcați **conținutul** acestui folder (inclusiv fișierul `.nojekyll`).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. Site-ul apare la `https://<utilizator>.github.io/fizica-astronomie/`.

Site-ul este static (HTML, CSS, JavaScript), fără server și fără colectare de date; planurile se salvează doar în browserul utilizatorului.

## Structura
- `index.html` – aplicația; `assets/` – stiluri și scripturi; `data/cur.js` – curriculumul (2026 și 2019) extras din documente; `data/met.js` – metodologia; `data/res.js` – resurse și strategii; `docs/` – documentele PDF; `img/` – figuri.
