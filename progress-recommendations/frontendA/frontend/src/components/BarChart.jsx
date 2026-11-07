// Simple SVG bar chart (no chart library needed).
// bars: [{ label: "11-06", value: 2550 }, ...]
export default function BarChart({ bars, unit = "", height = 220 }) {
  const W = 600, H = height, P = { l: 48, r: 16, t: 16, b: 32 };
  const max = Math.max(1, ...bars.map((b) => b.value));
  const slot = (W - P.l - P.r) / bars.length;
  const bw = Math.min(56, slot * 0.6);
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart in ${unit}`}>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={P.l} x2={W - P.r} y1={y(max * f)} y2={y(max * f)} stroke="#d9deea" strokeWidth="1" />
          <text x={P.l - 6} y={y(max * f) + 4} textAnchor="end" fontSize="11" fill="#5f6673">{Math.round(max * f)}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const cx = P.l + slot * i + slot / 2;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={y(b.value)} width={bw} height={H - P.b - y(b.value)} rx="3" fill="#2e5395">
              <title>{`${b.label}: ${b.value} ${unit}`}</title>
            </rect>
            <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill="#5f6673">{b.label}</text>
          </g>
        );
      })}
      <text x={P.l} y={11} fontSize="11" fill="#5f6673">{unit}</text>
    </svg>
  );
}
