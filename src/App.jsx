import { useState, useEffect, useRef } from "react";

const IPN_GUINDA = "#6B1229";
const IPN_GOLD = "#C9A84C";
const BG = "#f4f4f4";
const WHITE = "#ffffff";
const TEXT = "#2a2a2a";
const TEXT_MUTED = "#666";

const SECTORS = {
  familias: { label: "Familias",       color: "#6B1229", icon: "👨‍👩‍👧", x: 50, y: 18 },
  empresas: { label: "Empresas",       color: "#1a5276", icon: "🏭",    x: 50, y: 75 },
  gobierno: { label: "Gobierno",       color: "#1e6b3a", icon: "🏛️",   x: 10, y: 46 },
  externo:  { label: "Sector Externo", color: "#7d4e00", icon: "🌍",    x: 90, y: 46 },
};

const EXPLANATIONS = {
  familias: "Las familias ofrecen factores de producción (trabajo, capital) a las empresas y reciben ingresos. Con la Propensión Marginal a Consumir (PMC), destinan parte al consumo y el resto al ahorro.",
  empresas: "Las empresas contratan factores productivos, producen bienes y servicios, pagan impuestos y exportan. El consumo de las familias es su principal fuente de ingresos.",
  gobierno: "Recauda impuestos y redistribuye mediante gasto público. El balance fiscal (ingresos - gasto) afecta la demanda agregada.",
  externo:  "Las exportaciones inyectan dinero a la economía; las importaciones lo drenan. La balanza comercial (X - M) impacta el PIB.",
};

function Particle({ from, to, color, speed, offset }) {
  const [pos, setPos] = useState(offset || 0);
  const ref = useRef();
  useEffect(() => {
    let p = offset || Math.random();
    const tick = () => {
      p = (p + 0.003 * speed) % 1;
      setPos(p);
      ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [speed]);

  const fx = from.x / 100, fy = from.y / 100;
  const tx = to.x / 100,   ty = to.y / 100;
  const cx = (fx + tx) / 2 + 0.12 * (ty - fy);
  const cy = (fy + ty) / 2 - 0.12 * (tx - fx);
  const t = pos, mt = 1 - t;
  const x = mt*mt*fx + 2*mt*t*cx + t*t*tx;
  const y = mt*mt*fy + 2*mt*t*cy + t*t*ty;

  return <circle cx={`${x*100}%`} cy={`${y*100}%`} r="3.5" fill={color} opacity="0.9"
    style={{ filter: `drop-shadow(0 0 3px ${color})` }} />;
}

function FlowArrow({ from, to, color, strength }) {
  if (strength <= 0) return null;
  const count = Math.max(1, Math.round(strength / 20));
  const fx = from.x, fy = from.y, tx = to.x, ty = to.y;
  const cx = (fx+tx)/2 + 10*(ty-fy)/100;
  const cy = (fy+ty)/2 - 10*(tx-fx)/100;
  return (
    <g>
      <path d={`M ${fx}% ${fy}% Q ${cx}% ${cy}% ${tx}% ${ty}%`}
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.25" strokeDasharray="5 4" />
      {Array.from({length: count}).map((_, i) => (
        <Particle key={i} from={from} to={to} color={color} speed={2 + strength/30} offset={i/count} />
      ))}
    </g>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: BG, borderRadius: 6, padding: "10px 14px", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 4, fontWeight: 600 }}>{icon} {label}</div>
      <div style={{ fontSize: 19, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const fmt = (n) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FlujoCírculár() {
  const [ingreso, setIngreso] = useState("100000");
  const [pmc, setPmc] = useState(0.75);
  const [impuestos, setImpuestos] = useState(50);
  const [gastoPublico, setGastoPublico] = useState(60);
  const [exportaciones, setExportaciones] = useState(40);
  const [importaciones, setImportaciones] = useState(30);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const ing = parseFloat(ingreso) || 0;
  const pmcVal = pmc;
  const consumo = ing * pmcVal;
  const ahorro = ing - consumo;
  const multiplicador = pmcVal < 1 ? 1 / (1 - pmcVal) : "∞";
  const balanza = exportaciones - importaciones;
  const balanceFiscal = gastoPublico - impuestos;

  const flows = [
    { from: "familias", to: "empresas", color: "#c0392b",  strength: consumo / 2000 },
    { from: "empresas", to: "familias", color: "#1a5276",  strength: ing / 2000 },
    { from: "familias", to: "gobierno", color: "#1e6b3a",  strength: impuestos },
    { from: "empresas", to: "gobierno", color: "#1e6b3a",  strength: impuestos * 0.6 },
    { from: "gobierno", to: "familias", color: "#27ae60",  strength: gastoPublico },
    { from: "empresas", to: "externo",  color: "#e67e22",  strength: exportaciones },
    { from: "externo",  to: "familias", color: "#7d4e00",  strength: importaciones },
  ];

  return (
    <div style={{ background: BG, fontFamily: "'Segoe UI', Arial, sans-serif", color: TEXT, padding: "24px 0", minHeight: "100vh" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px" }}>

        {/* Header */}
        <div style={{ background: WHITE, borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 20 }}>
          <div style={{ background: IPN_GUINDA, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 24, background: IPN_GOLD, borderRadius: 2 }} />
            <h2 style={{ margin: 0, color: WHITE, fontSize: 16, fontWeight: 700 }}>Simulador del Flujo Circular de la Economía</h2>
          </div>
          <div style={{ padding: "10px 24px", fontSize: 13, color: TEXT_MUTED }}>
            Ingresa el ingreso total y la PMC para calcular consumo, ahorro y el multiplicador keynesiano. Ajusta los sliders para ver cómo cambian los flujos.
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

          {/* Diagrama */}
          <div style={{ flex: 2, minWidth: 300, background: WHITE, borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: 20 }}>
            <svg width="100%" viewBox="0 0 100 100" style={{ display: "block", height: 340 }}>
              {flows.map((f, i) => (
                <FlowArrow key={i} from={SECTORS[f.from]} to={SECTORS[f.to]} color={f.color} strength={Math.min(f.strength, 100)} />
              ))}
              {Object.entries(SECTORS).map(([key, s]) => (
                <g key={key} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === key ? null : key)}>
                  <circle cx={`${s.x}%`} cy={`${s.y}%`} r="9"
                    fill={selected === key ? s.color : WHITE}
                    stroke={s.color} strokeWidth="2"
                    style={{ filter: selected === key ? `drop-shadow(0 0 8px ${s.color})` : "none", transition: "all 0.2s" }} />
                  <text x={`${s.x}%`} y={`${s.y}%`} textAnchor="middle" dominantBaseline="middle" fontSize="5">{s.icon}</text>
                  <text x={`${s.x}%`} y={`${s.y + 13}%`} textAnchor="middle" fontSize="3.2" fill={s.color} fontWeight="700">{s.label}</text>
                </g>
              ))}
            </svg>

            {selected && (
              <div style={{ background: `${SECTORS[selected].color}11`, border: `1px solid ${SECTORS[selected].color}44`, borderLeft: `4px solid ${SECTORS[selected].color}`, borderRadius: 6, padding: "12px 16px", fontSize: 13, lineHeight: 1.7 }}>
                <strong style={{ color: SECTORS[selected].color }}>{SECTORS[selected].icon} {SECTORS[selected].label}</strong>
                <p style={{ margin: "6px 0 0", color: TEXT }}>{EXPLANATIONS[selected]}</p>
              </div>
            )}
          </div>

          {/* Panel derecho */}
          <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Inputs keynesianos */}
            <div style={{ background: WHITE, borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ background: IPN_GUINDA, padding: "10px 16px" }}>
                <span style={{ color: WHITE, fontSize: 13, fontWeight: 700 }}>📐 Modelo Keynesiano</span>
              </div>
              <div style={{ padding: 16 }}>
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600, display: "block", marginBottom: 4 }}>Ingreso Total ($):</label>
                <input type="number" value={ingreso} min={0}
                  onChange={e => setIngreso(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: `1px solid #ccc`, borderRadius: 5, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = IPN_GUINDA}
                  onBlur={e => e.target.style.borderColor = "#ccc"}
                />
                <label style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600, display: "block", margin: "14px 0 4px" }}>
                  PMC (Propensión Marginal a Consumir): <strong style={{ color: IPN_GUINDA }}>{pmcVal.toFixed(2)}</strong>
                </label>
                <input type="range" min={0.01} max={0.99} step={0.01} value={pmcVal}
                  onChange={e => setPmc(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: IPN_GUINDA, cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: TEXT_MUTED }}>
                  <span>0.01 (alto ahorro)</span><span>0.99 (alto consumo)</span>
                </div>
              </div>
            </div>

            {/* Resultados keynesianos */}
            <div style={{ background: WHITE, borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ background: IPN_GUINDA, padding: "10px 16px" }}>
                <span style={{ color: WHITE, fontSize: 13, fontWeight: 700 }}>📊 Resultados</span>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <StatCard icon="🛒" label="Consumo" value={fmt(consumo)} sub={`${(pmcVal*100).toFixed(0)}% del ingreso`} color={IPN_GUINDA} />
                <StatCard icon="🏦" label="Ahorro" value={fmt(ahorro)} sub={`${((1-pmcVal)*100).toFixed(0)}% del ingreso`} color="#1a5276" />
                <StatCard icon="📈" label="Multiplicador Keynesiano" value={typeof multiplicador === "number" ? multiplicador.toFixed(2) + "x" : multiplicador} sub="1 / (1 - PMC)" color="#c0392b" />
              </div>
            </div>

            {/* Sliders macro */}
            <div style={{ background: WHITE, borderRadius: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ background: IPN_GUINDA, padding: "10px 16px" }}>
                <span style={{ color: WHITE, fontSize: 13, fontWeight: 700 }}>🌐 Variables Macro</span>
              </div>
              <div style={{ padding: 16 }}>
                {[
                  { key: "impuestos",     val: impuestos,     set: setImpuestos,     label: "Impuestos",      icon: "🏛️", color: "#1e6b3a" },
                  { key: "gastoPublico",  val: gastoPublico,  set: setGastoPublico,  label: "Gasto Público",  icon: "💰", color: "#27ae60" },
                  { key: "exportaciones", val: exportaciones, set: setExportaciones, label: "Exportaciones",  icon: "📦", color: "#e67e22" },
                  { key: "importaciones", val: importaciones, set: setImportaciones, label: "Importaciones",  icon: "🛒", color: "#7d4e00" },
                ].map(s => (
                  <div key={s.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: TEXT_MUTED, fontWeight: 600 }}>{s.icon} {s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.val} M MXN</span>
                    </div>
                    <input type="range" min={0} max={100} value={s.val}
                      onChange={e => s.set(Number(e.target.value))}
                      style={{ width: "100%", accentColor: s.color, cursor: "pointer" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <div style={{ flex: 1, background: BG, borderRadius: 5, padding: "8px 10px", borderLeft: `3px solid ${balanza >= 0 ? "#1e6b3a" : "#c0392b"}` }}>
                    <div style={{ fontSize: 10, color: TEXT_MUTED }}>Balanza Comercial</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: balanza >= 0 ? "#1e6b3a" : "#c0392b" }}>{balanza > 0 ? "+" : ""}{balanza} M</div>
                  </div>
                  <div style={{ flex: 1, background: BG, borderRadius: 5, padding: "8px 10px", borderLeft: `3px solid ${balanceFiscal <= 0 ? "#1e6b3a" : "#c0392b"}` }}>
                    <div style={{ fontSize: 10, color: TEXT_MUTED }}>Balance Fiscal</div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: balanceFiscal <= 0 ? "#1e6b3a" : "#c0392b" }}>{balanceFiscal > 0 ? "+" : ""}{balanceFiscal} M</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
