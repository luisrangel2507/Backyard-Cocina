import { useId } from "react";
// "Dripping salsa" lettering: red glossy Rye letters with drips running down. Pure SVG, crisp on any screen.
// Letter x-positions were measured for Rye at 40px so the drips line up under real letters.
type Line = { text: string; x: number[]; w: number; drips: [letter: number, len: number, width?: number][] };

const L: Record<string, Line> = {
  "TRY OUR": { text: "TRY OUR", w: 171, x: [0, 24.4, 48.9, 76.3, 86.3, 115.2, 144.1], drips: [[0, 20, 7], [2, 34, 6], [4, 14, 6], [6, 26, 7]] },
  SIGNATURE: { text: "SIGNATURE", w: 222, x: [0, 22.2, 35.6, 64.5, 93.3, 117.8, 142.2, 171.1, 197.8], drips: [[1, 16, 6], [3, 30, 7], [5, 12, 6], [7, 38, 7], [8, 20, 6]] },
  SALSAS: { text: "SALSAS", w: 149, x: [0, 22.2, 51.1, 75.6, 97.8, 126.7], drips: [[0, 26, 7], [2, 14, 6], [3, 42, 7], [5, 20, 6]] },
  ONE: { text: "TRY OUR SIGNATURE SALSAS", w: 562, x: [0, 24.4, 48.9, 76.3, 86.3, 115.2, 144.1, 170.8, 180.8, 203, 216.3, 245.2, 274.1, 298.5, 323, 351.9, 378.5, 403, 413, 435.2, 464.1, 488.5, 510.8, 539.7],
    drips: [[1, 22, 7], [4, 14, 6], [7, 36, 7], [11, 18, 6], [13, 30, 7], [16, 14, 6], [19, 40, 7], [21, 20, 6], [23, 28, 7]] },
};
const SW = [24, 22, 29, 23, 36]; // approximate glyph widths used to centre drips under a letter

function Row({ line, y, fs, ox = 0, id }: { line: Line; y: number; fs: number; ox?: number; id: string }) {
  const k = fs / 40;
  return (
    <g>
      <text x={ox} y={y} fontSize={fs} fontFamily="Rye, serif" letterSpacing={0} fill={`url(#salsaFill-${id})`} stroke="#4a0905" strokeWidth={1.2} paintOrder="stroke" strokeLinejoin="round">{line.text}</text>
      {line.drips.map(([i, len, w = 6], n) => {
        const cx = ox + (line.x[i] + SW[n % SW.length] * 0.5) * k, ww = w * k, ll = len * k, top = y - 5 * k;
        const bot = top + ll;
        return (
          <g key={i}>
            <path className="drip" style={{ animationDelay: `${(n * 0.37 + y * 0.004).toFixed(2)}s` }}
              d={`M${cx - ww * 0.9} ${top} Q${cx - ww * 0.5} ${top + 5 * k} ${cx - ww / 2} ${top + 9 * k} L${cx - ww / 2} ${bot - ww / 2} A${ww / 2} ${ww / 2} 0 0 0 ${cx + ww / 2} ${bot - ww / 2} L${cx + ww / 2} ${top + 9 * k} Q${cx + ww * 0.5} ${top + 5 * k} ${cx + ww * 0.9} ${top} Z`}
              fill={`url(#salsaFill-${id})`} stroke="#4a0905" strokeWidth={1} />
            {n % 3 === 1 && <circle className="drop" cx={cx} cy={bot + 6 * k} r={ww * 0.34} fill="#d9261a" style={{ animationDelay: `${(n * 0.9).toFixed(2)}s` }} />}
          </g>
        );
      })}
    </g>
  );
}

const Defs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`salsaFill-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ff5a3c" /><stop offset=".45" stopColor="#e8321c" /><stop offset="1" stopColor="#a30f09" />
    </linearGradient>
    {/* glossy liquid look: soft specular highlight clipped to the letters */}
    <filter id={`gloss-${id}`} x="-5%" y="-5%" width="110%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b" />
      <feSpecularLighting in="b" surfaceScale="4" specularConstant=".3" specularExponent="30" lightingColor="#fff" result="s">
        <fePointLight x="-2000" y="-4000" z="9000" />
      </feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
      <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
    </filter>
  </defs>
);

export default function DripTitle() {
  const u = useId().replace(/:/g, "");
  const M = `m${u}`, D = `d${u}`;
  return (
    <>
      <span className="sr-only">Try our signature salsas</span>
      {/* phones: three lines */}
      <svg className="drip-m" viewBox="0 0 236 232" aria-hidden="true" role="img">
        <Defs id={M} />
        <g filter={`url(#gloss-${M})`}>
          <Row id={M} line={L["TRY OUR"]} y={40} fs={40} />
          <Row id={M} line={L.SIGNATURE} y={112} fs={40} />
          <Row id={M} line={L.SALSAS} y={184} fs={40} />
        </g>
      </svg>
      {/* desktop: one line */}
      <svg className="drip-d" viewBox="0 0 570 96" aria-hidden="true" role="img">
        <Defs id={D} />
        <g filter={`url(#gloss-${D})`}><Row id={D} line={L.ONE} y={40} fs={40} /></g>
      </svg>
    </>
  );
}
