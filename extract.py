# -*- coding: utf-8 -*-
"""Extract Photo_Manual.pdf into a rich structured JSON for the React app.

Output: src/data/manual.json
Model:
  { meta, chapters: [ { id, slug, kind, num, title, film, director, page,
                        blocks: [ heading | para | example | caption | scheda ] } ] }
  - para.runs: [ {t, k} ]   k in text|label|value|emph
  - scheda.rows: [ {label, value} ]
"""
import json, re, os, unicodedata
import fitz

SRC = "Photo_Manual.pdf"
OUT = "src/data/manual.json"


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s


def run_kind(font):
    if font.startswith("SFBX"):
        return "label"
    if font.startswith("SFTT"):
        return "value"
    if font.startswith("SFTI") or font.startswith("CMMI"):
        return "emph"
    return "text"


def is_noise_span(s):
    # drop tiny diagram tick labels / wheel degree numbers / curve axis text
    return s["size"] <= 8.5


def line_info(l):
    raw = [s for s in l["spans"] if s["text"] and not is_noise_span(s)]
    meaningful = [s for s in raw if s["text"].strip()]
    if not meaningful:
        return None
    x0 = min(s["bbox"][0] for s in meaningful)
    y0 = min(s["bbox"][1] for s in meaningful)
    maxsize = max(s["size"] for s in meaningful)
    first = meaningful[0]
    text = re.sub(r"\s+", " ", "".join(s["text"] for s in raw)).strip()
    return dict(spans=raw, x0=x0, y0=y0, maxsize=maxsize, first=first, text=text)


def collect_lines():
    doc = fitz.open(SRC)
    lines = []
    for pidx in range(doc.page_count):
        if pidx < 2:  # skip cover + TOC
            continue
        for b in doc[pidx].get_text("dict")["blocks"]:
            if "lines" not in b:
                continue
            for l in b["lines"]:
                li = line_info(l)
                if li is None:
                    continue
                if re.fullmatch(r"\d{1,3}", li["text"]):  # lone page / section number
                    continue
                li["page"] = pidx + 1
                lines.append(li)
    return lines


HYPHEN_EOL = re.compile(r"[0-9A-Za-zÀ-ÿ’']-$")


def make_runs(span_lines):
    """Build merged, well-spaced runs from a list of source lines (each a list of spans)."""
    runs = []
    pending = None  # None | "" (soft-hyphen join) | " " (line-break space)
    for line in span_lines:
        for s in line:
            txt = s["text"]
            if not txt:
                continue
            if not txt.strip() and pending is not None:
                continue  # redundant space at a line boundary; pending handles it
            k = run_kind(s["font"])
            if pending == "":
                txt = txt.lstrip()
            joiner = pending or ""
            pending = None
            if runs and runs[-1]["k"] == k:
                runs[-1]["t"] += joiner + txt
            else:
                runs.append({"t": joiner + txt, "k": k})
        if runs:  # end of source line
            cur = runs[-1]["t"].rstrip()
            runs[-1]["t"] = cur
            if HYPHEN_EOL.search(cur):
                runs[-1]["t"] = cur[:-1]
                pending = ""        # word was split across the line break
            else:
                pending = " "       # need a space before next line's text
    for r in runs:
        r["t"] = re.sub(r"\s+", " ", r["t"])
    if runs:
        runs[0]["t"] = runs[0]["t"].lstrip()
        runs[-1]["t"] = runs[-1]["t"].rstrip()
    return [r for r in runs if r["t"]]


def join_text(prev, nxt):
    if HYPHEN_EOL.search(prev):
        return prev[:-1] + nxt
    if prev and nxt:
        return prev.rstrip() + " " + nxt.lstrip()
    return prev + nxt


def canonical_titles():
    doc = fitz.open(SRC)
    return [t[1] for t in doc.get_toc() if t[0] == 1]


def start_chapter(canon, page, chapters):
    kind, num, title, film, director = "theory", None, canon, None, None
    m = re.match(r"^Stile\s+(\d+):\s*(.+)$", canon, re.I)
    if m:
        kind, num, rest = "style", int(m.group(1)), m.group(2).strip()
        fm = re.match(r"^(.*?)\s*\((.+)\)\s*$", rest)
        if fm:
            title, inside = fm.group(1).strip(), fm.group(2).strip()
            if " - " in inside:
                film, director = [p.strip() for p in inside.rsplit(" - ", 1)]
            else:
                film = inside
        else:
            title = rest
    elif canon.lower().startswith("appendice"):
        kind = "appendix"
    slug = slugify((("stile-%d-" % num) if num else "") + title)
    ch = {"id": len(chapters) + 1, "slug": slug, "kind": kind, "num": num,
          "title": title, "film": film, "director": director,
          "page": page, "blocks": []}
    chapters.append(ch)
    return ch


def main():
    lines = collect_lines()
    titles = canonical_titles()
    chapters = []
    cur = None
    mode = None            # None | "scheda" | "caption"
    title_buf = None
    para_lines = []        # accumulating span-lines of the current paragraph
    prev_y = prev_page = None

    def flush_para():
        nonlocal para_lines
        if cur is not None and para_lines:
            runs = make_runs(para_lines)
            if runs:
                cur["blocks"].append({"type": "para", "runs": runs})
        para_lines = []

    for li in lines:
        size, font, text, x0 = li["maxsize"], li["first"]["font"], li["text"], li["x0"]

        # ---- TITLE (chapter / style / appendix), may span 2 source lines ----
        if size >= 16:
            flush_para()
            title_buf = (title_buf or []) + [text]
            mode = None
            continue
        if title_buf is not None:
            raw = title_buf[0]
            for nxt in title_buf[1:]:
                raw = join_text(raw, nxt)
            title_buf = None
            canon = titles[len(chapters)] if len(chapters) < len(titles) else raw
            cur = start_chapter(canon, li["page"], chapters)
            mode = None

        if cur is None:
            continue

        # ---- SCHEDA RAPIDA marker (bold, ~10.9pt) ----
        if font.startswith("SFBX") and size < 13 and text.upper() == "SCHEDA RAPIDA":
            flush_para()
            cur["blocks"].append({"type": "scheda", "rows": []})
            mode = "scheda"
            continue

        if mode == "scheda":
            if x0 < 150 and font.startswith("SFBX"):       # label column
                cur["blocks"][-1]["rows"].append({"label": text, "value": ""})
            else:                                           # value column / wrap
                rows = cur["blocks"][-1]["rows"]
                if rows:
                    rows[-1]["value"] = join_text(rows[-1]["value"], text) if rows[-1]["value"] else text
            continue

        # ---- section heading (bold, >= 13.5pt) ----
        if font.startswith("SFBX") and size >= 13.5:
            flush_para()
            cur["blocks"].append({"type": "heading", "text": text})
            mode = None
            continue

        # ---- "Esempio visivo:" style lead-in (italic) ----
        if font.startswith("SFTI") and size <= 11.5 and text.lower().startswith("esempio"):
            flush_para()
            cur["blocks"].append({"type": "example", "text": text})
            mode = None
            continue

        # ---- standalone italic line = diagram caption (may wrap) ----
        if font.startswith("SFTI") and size <= 11.5:
            flush_para()
            if mode == "caption" and cur["blocks"] and cur["blocks"][-1]["type"] == "caption":
                cur["blocks"][-1]["text"] = join_text(cur["blocks"][-1]["text"], text)
            else:
                cur["blocks"].append({"type": "caption", "text": text})
                mode = "caption"
            continue

        # ---- body line: accumulate, splitting paragraphs on vertical gaps ----
        mode = None
        if prev_page == li["page"] and prev_y is not None and (li["y0"] - prev_y) > 22:
            flush_para()
        para_lines.append(li["spans"])
        prev_y, prev_page = li["y0"], li["page"]

    flush_para()

    meta = {
        "title": "Manuale di Fotografia & Color Grading",
        "subtitle": "Metodo, teoria e 24 look cinematografici",
        "chapters": len(chapters),
    }
    os.makedirs("src/data", exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"meta": meta, "chapters": chapters}, f, ensure_ascii=False, indent=1)
    print("wrote", OUT, "chapters:", len(chapters))


if __name__ == "__main__":
    main()
