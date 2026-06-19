# Manuale di Fotografia & Color Grading

App interattiva (mobile-first) costruita a partire da `Photo_Manual.pdf` — un manuale di
77 pagine su metodo fotografico, teoria del colore/inquadratura e **24 look cinematografici**
(Tarkovskij, Bergman, Blade Runner, Wes Anderson, …).

Pensata per la consultazione **sul telefono durante uno shoot**: ricette rapide, ruota del
colore interattiva e un selettore "quale look per questa scena".

## Funzioni

- **I 24 Look** — galleria filtrabile (clima, armonia, soggetto, mood) con swatch per stile.
- **Scheda di ogni look** — ricetta completa con i valori dei cursori evidenziati + **Scheda Rapida**.
- **Quale look?** — selettore che parte dalla scena (dalla tabella decisionale del manuale).
- **Manuale** — lettore di tutti i capitoli di teoria e delle appendici.
- **Ruota del colore** interattiva (capitolo *Teoria del Colore*).
- **Cerca** — ricerca full-text su tutto il manuale, con snippet evidenziati.

## Sviluppo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output statico in dist/ (base relativo: hostabile ovunque)
npm run preview
```

## Contenuto / dati

Il testo NON è scritto a mano: viene estratto dal PDF.

```bash
pip install -r requirements.txt
npm run extract    # = python extract.py  ->  src/data/manual.json
```

- `extract.py` usa **PyMuPDF** e ricostruisce una struttura ricca leggendo i font del PDF
  (titoli, sotto-titoli, etichette dei parametri in grassetto, valori monospace, didascalie,
  righe della Scheda Rapida). Vedi `CLAUDE.md` per i dettagli del modello dati.
- `src/data/styleMeta.json` è **curato a mano**: armonie, assi cromatici, swatch, tag per i
  filtri e la tabella scena→look del selettore.

`shoot.mjs` è un'utilità di verifica: scatta screenshot mobile via `puppeteer-core`
(usa il Chrome installato) — `node shoot.mjs [route] [nome]`.
