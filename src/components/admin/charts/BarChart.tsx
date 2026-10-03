import type { DayPoint } from "@/lib/admin/stats";

const W = 600;
const H = 180;
const PAD = { t: 8, r: 8, b: 22, l: 34 };

function niceMax(v: number): number {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

const shortDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

/** Biểu đồ cột SVG theo ngày. Màu lấy từ token theme (tự đổi theo dark mode). */
export function BarChart({ data, label, unit = "" }: { data: DayPoint[]; label: string; unit?: string }) {
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const step = iw / Math.max(1, data.length);
  const bw = Math.max(2, step * 0.7);
  const ticks = [0, max / 2, max];
  const labelIdx = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      <title>{label}</title>
      {ticks.map((t) => {
        const y = PAD.t + ih - (t / max) * ih;
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} className="stroke-ink-200" strokeWidth={1} />
            <text x={PAD.l - 6} y={y + 3} textAnchor="end" className="fill-ink-500" fontSize={10}>
              {Math.round(t).toLocaleString("vi-VN")}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * ih;
        const x = PAD.l + i * step + (step - bw) / 2;
        return (
          <g key={d.day} className="group">
            <rect x={PAD.l + i * step} y={PAD.t} width={step} height={ih} fill="transparent" />
            <rect
              x={x}
              y={PAD.t + ih - h}
              width={bw}
              height={Math.max(h, d.value > 0 ? 1 : 0)}
              rx={1.5}
              className="fill-accent opacity-80 group-hover:opacity-100"
            >
              <title>{`${shortDay(d.day)}: ${d.value.toLocaleString("vi-VN")}${unit}`}</title>
            </rect>
            {labelIdx.has(i) && (
              <text
                x={x + bw / 2}
                y={H - 6}
                textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                className="fill-ink-500"
                fontSize={10}
              >
                {shortDay(d.day)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
