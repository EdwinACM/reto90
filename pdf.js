/* Generador de PDF mínimo, sin librerías (la CSP no permite scripts externos) y sin conexión.
   Texto con Helvetica y Helvetica-Bold (fuentes estándar de PDF, no hay que incrustarlas), codificación
   WinAnsi para acentos y ñ, líneas y rectángulos. Coordenadas desde la esquina superior izquierda, en puntos. */
window.MiniPDF = (() => {
  // Anchos de Helvetica (unidades de 1/1000) para los caracteres 32–126
  const HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
  const BASE = { "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ü": "u", "ñ": "n", "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U", "Ü": "U", "Ñ": "N" };
  const MAP = { "–": 0x96, "—": 0x97, "…": 0x85, "“": 0x93, "”": 0x94, "‘": 0x91, "’": 0x92, "•": 0x95, "€": 0x80 };
  const SUB = { "≈": "~", "→": "->", "−": "-", "·": "·" };
  const norm = s => String(s).replace(/[≈→−]/g, c => SUB[c]).replace(/[  ]/g, " ");
  const charW = (c, bold) => { const k = c.charCodeAt(0); let w = k >= 32 && k <= 126 ? HW[k - 32] : BASE[c] ? HW[BASE[c].charCodeAt(0) - 32] : 556; return bold ? w * 1.07 : w; };
  const toWin = s => { let o = ""; for (const c of norm(s)) { const k = c.charCodeAt(0); o += MAP[c] ? String.fromCharCode(MAP[c]) : k < 256 ? c : "?"; } return o; };
  const esc = s => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const rgb = c => c.map(v => (v / 255).toFixed(3)).join(" ");

  function create(o = {}) {
    const W = o.w || 595.28, H = o.h || 841.89, pages = [];
    let cur = null;
    const page = () => { cur = []; pages.push(cur); return api; };
    const width = (s, size, bold) => [...norm(s)].reduce((a, c) => a + charW(c, bold), 0) * size / 1000;
    const api = {
      W, H, pages,
      addPage: page,
      width,
      wrap(s, maxW, size, bold) {
        const words = String(s).split(/\s+/).filter(Boolean), lines = []; let line = "";
        words.forEach(w => { const t = line ? line + " " + w : w; if (width(t, size, bold) <= maxW || !line) line = t; else { lines.push(line); line = w; } });
        if (line) lines.push(line); return lines;
      },
      text(s, x, y, { size = 10, bold = false, color = [20, 21, 22], align = "left" } = {}) {
        const w = width(s, size, bold), xx = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
        // negrita: además de Helvetica-Bold, relleno + trazo fino para que se vea en cualquier visor
        cur.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${bold ? `${rgb(color)} RG ${(size * 0.035).toFixed(2)} w 2 Tr ` : "0 Tr "}${xx.toFixed(2)} ${(H - y).toFixed(2)} Td (${esc(toWin(s))}) Tj ET`);
        return w;
      },
      rect(x, y, w, h, { fill = [20, 21, 22] } = {}) { cur.push(`${rgb(fill)} rg ${x.toFixed(2)} ${(H - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`); },
      line(x1, y1, x2, y2, { w = 1, color = [20, 21, 22] } = {}) { cur.push(`${w} w ${rgb(color)} RG ${x1.toFixed(2)} ${(H - y1).toFixed(2)} m ${x2.toFixed(2)} ${(H - y2).toFixed(2)} l S`); },
      circle(x, y, r, { fill = [20, 21, 22] } = {}) { const k = 0.5523 * r, Y = H - y; cur.push(`${rgb(fill)} rg ${(x + r).toFixed(2)} ${Y.toFixed(2)} m ${(x + r).toFixed(2)} ${(Y + k).toFixed(2)} ${(x + k).toFixed(2)} ${(Y + r).toFixed(2)} ${x.toFixed(2)} ${(Y + r).toFixed(2)} c ${(x - k).toFixed(2)} ${(Y + r).toFixed(2)} ${(x - r).toFixed(2)} ${(Y + k).toFixed(2)} ${(x - r).toFixed(2)} ${Y.toFixed(2)} c ${(x - r).toFixed(2)} ${(Y - k).toFixed(2)} ${(x - k).toFixed(2)} ${(Y - r).toFixed(2)} ${x.toFixed(2)} ${(Y - r).toFixed(2)} c ${(x + k).toFixed(2)} ${(Y - r).toFixed(2)} ${(x + r).toFixed(2)} ${(Y - k).toFixed(2)} ${(x + r).toFixed(2)} ${Y.toFixed(2)} c f`); },
      onPage(i) { cur = pages[i]; return api; },
      blob() {
        const objs = [], add = s => { objs.push(s); return objs.length; };
        add("<< /Type /Catalog /Pages 2 0 R >>");
        add(""); // páginas: se llena después
        const f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
        const f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
        const kids = pages.map(p => { const body = p.join("\n"), c = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`); return add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`); });
        objs[1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
        let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"; const off = [];
        objs.forEach((s, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${s}\nendobj\n`; });
        const x = out.length;
        out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map(n => String(n).padStart(10, "0") + " 00000 n \n").join("") + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
        const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
        return new Blob([bytes], { type: "application/pdf" });
      },
    };
    page();
    return api;
  }
  return { create };
})();
