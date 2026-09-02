import React, { useState, useMemo, useEffect, useRef } from "react";
import { Activity, HeartPulse, Ruler, Info, Dumbbell, Utensils, Sun, Moon, History, Download, Save, Gauge, Droplets } from "lucide-react";

const INK = "#10233B";
const TRACK = "#C1440E";
const TURF = "#2F6B4F";
const GOLD = "#B8862F";
const CHALK = "#EEF1EA";
const GRAPHITE = "var(--c-text)";
const MUTED = "var(--c-muted)";
const LINE = "var(--c-line)";

function useCountUp(target, duration = 450) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target == null || isNaN(target)) {
      setDisplay(target);
      prevRef.current = target;
      return;
    }
    const start = prevRef.current != null && !isNaN(prevRef.current) ? prevRef.current : target;
    const startTime = performance.now();
    cancelAnimationFrame(frameRef.current);

    function tick(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (target - start) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

function Field({ label, unit, children }) {
  return (
    <label className="block mb-5">
      <span className="block text-sm mb-1" style={{ color: MUTED }}>
        {label} {unit ? <span className="text-xs">({unit})</span> : null}
      </span>
      {children}
    </label>
  );
}

function inputCls() {
  return "w-full bg-transparent border-0 border-b-2 py-2 text-lg outline-none transition-colors";
}

function NumberInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls()}
      style={{ borderColor: LINE, color: GRAPHITE }}
      onFocus={(e) => (e.target.style.borderColor = TRACK)}
      onBlur={(e) => (e.target.style.borderColor = LINE)}
    />
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls()}
      style={{ borderColor: LINE, color: GRAPHITE }}
      onFocus={(e) => (e.target.style.borderColor = TRACK)}
      onBlur={(e) => (e.target.style.borderColor = LINE)}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls()}
      style={{ borderColor: LINE, color: GRAPHITE }}
      onFocus={(e) => (e.target.style.borderColor = TRACK)}
      onBlur={(e) => (e.target.style.borderColor = LINE)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ResultPanel({
  value,
  decimals = 1,
  unit,
  category,
  categoryColor,
  exportTitle,
  shareHeadline,
  shareStats,
  onSave,
  savedJustNow,
  children,
}) {
  const animated = useCountUp(value);
  const display = value == null || isNaN(value) ? "–" : animated.toFixed(decimals);
  const hasValue = value != null && !isNaN(value);
  return (
    <div
      className="flex flex-col justify-between h-full p-6 md:p-8"
      style={{ backgroundColor: INK }}
    >
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-black leading-none tracking-tight"
            style={{ fontSize: "clamp(2.6rem, 9vw, 4.2rem)", color: CHALK, fontVariantNumeric: "tabular-nums" }}
          >
            {display}
          </span>
          {unit && (
            <span
              className="text-sm uppercase tracking-wide"
              style={{ color: "#9AA6B2" }}
            >
              {unit}
            </span>
          )}
        </div>
        {category && (
          <span
            className="inline-block mt-4 px-3 py-1 text-sm font-semibold rounded-sm result-badge"
            style={{ backgroundColor: categoryColor, color: INK }}
          >
            {category}
          </span>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
      {hasValue && (onSave || exportTitle) && (
        <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: "1px solid #24344A" }}>
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 text-xs font-semibold export-btn"
              style={{ color: savedJustNow ? "#9FCBA6" : "#9AA6B2" }}
            >
              <Save size={14} />
              {savedJustNow ? "Tersimpan" : "Simpan ke riwayat"}
            </button>
          )}
          {exportTitle && (
            <button
              onClick={() =>
                downloadShareCard({
                  headline: shareHeadline || exportTitle,
                  value: display,
                  unit,
                  badge: category,
                  badgeColor: categoryColor,
                  stats: shareStats || [],
                  filename: exportTitle,
                })
              }
              className="flex items-center gap-1.5 text-xs font-semibold export-btn"
              style={{ color: "#9AA6B2" }}
            >
              <Download size={14} />
              Bagikan kartu
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Footnote({ children }) {
  return (
    <div
      className="flex gap-2 items-start text-xs mt-6 pt-4 border-t"
      style={{ color: MUTED, borderColor: LINE }}
    >
      <Info size={14} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

// ---------- RIWAYAT (progress tracking) ----------

const hasStorage = typeof window !== "undefined" && !!window.localStorage;

function useHistory(storageKey) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!hasStorage) {
      setLoaded(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      setEntries(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setEntries([]);
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);

  const addEntry = (value, meta) => {
    const entry = { date: new Date().toISOString(), value, ...meta };
    const next = [...entries, entry].slice(-30);
    setEntries(next);
    if (hasStorage) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        // penyimpanan penuh/diblokir browser — tetap tampil untuk sesi ini
      }
    }
  };

  const clearAll = () => {
    setEntries([]);
    if (hasStorage) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (e) {}
    }
  };

  return { entries, addEntry, clearAll, loaded };
}

function Sparkline({ values, color }) {
  if (!values || values.length < 2) return null;
  const w = 160;
  const h = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" });
}

// ---------- EKSPOR KARTU (gaya Strava) ----------

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

function downloadShareCard({ headline, value, unit, badge, badgeColor, stats = [], filename }) {
  const rows = Math.ceil(stats.length / 2);
  const width = 800;
  const statsStartYBase = 640;
  const height = statsStartYBase + rows * 120 + 140;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // latar
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, width, height);

  // tekstur garis diagonal ala lintasan
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 46;
  for (let x = -height; x < width + height; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }
  ctx.restore();

  // label brand
  ctx.fillStyle = "#9AA6B2";
  ctx.font = "600 22px sans-serif";
  ctx.fillText("KALKULATOR KEPELATIHAN OLAHRAGA", 56, 74);

  // garis aksen
  ctx.fillStyle = TRACK;
  ctx.fillRect(56, 92, 64, 6);

  // headline
  ctx.fillStyle = CHALK;
  ctx.font = "900 46px sans-serif";
  const headlineLines = wrapCanvasText(ctx, headline, 56, 170, width - 112, 54);

  // angka besar
  const valueY = 170 + headlineLines * 54 + 110;
  ctx.font = "900 130px sans-serif";
  ctx.fillText(value, 56, valueY);
  ctx.font = "26px sans-serif";
  ctx.fillStyle = "#9AA6B2";
  ctx.fillText(unit || "", 58, valueY + 42);

  let cursorY = valueY + 90;

  // badge kategori
  if (badge) {
    ctx.font = "600 24px sans-serif";
    const padX = 22;
    const textW = ctx.measureText(badge).width;
    ctx.fillStyle = badgeColor || "#9FCBA6";
    ctx.fillRect(56, cursorY, textW + padX * 2, 52);
    ctx.fillStyle = INK;
    ctx.fillText(badge, 56 + padX, cursorY + 35);
    cursorY += 90;
  }

  // garis pembatas
  if (stats.length > 0) {
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(56, cursorY);
    ctx.lineTo(width - 56, cursorY);
    ctx.stroke();
    cursorY += 56;

    // grid statistik 2 kolom
    const colW = (width - 112) / 2;
    stats.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 56 + col * colW;
      const y = cursorY + row * 110;
      ctx.fillStyle = "#8C97A3";
      ctx.font = "20px sans-serif";
      ctx.fillText(s.label.toUpperCase(), x, y);
      ctx.fillStyle = CHALK;
      ctx.font = "700 36px sans-serif";
      ctx.fillText(String(s.value), x, y + 42);
    });
  }

  // footer
  ctx.fillStyle = "#6E7986";
  ctx.font = "20px sans-serif";
  ctx.fillText(
    new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
    56,
    height - 40
  );

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(filename || headline).toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}


// ---------- VO2 MAX ----------

const MFT_SPEEDS = Array.from({ length: 21 }, (_, i) => +(8 + i * 0.5).toFixed(1));

function vo2FromCooper(distance) {
  return (distance - 504.9) / 44.73;
}

function vo2FromRockport({ timeMin, hr, weightKg, age, gender }) {
  const weightLb = weightKg * 2.20462;
  const g = gender === "male" ? 1 : 0;
  return (
    132.853 -
    0.0769 * weightLb -
    0.3877 * age +
    6.315 * g -
    3.2649 * timeMin -
    0.1565 * hr
  );
}

function vo2FromMft({ level, age }) {
  const speed = MFT_SPEEDS[Math.min(Math.max(level - 1, 0), MFT_SPEEDS.length - 1)];
  return 31.025 + 3.238 * speed - 3.248 * age + 0.1536 * age * speed;
}

function vo2Category(v) {
  if (v == null || isNaN(v)) return null;
  if (v < 35) return { label: "Kurang", color: "#E7B8A6" };
  if (v < 42) return { label: "Cukup", color: "#E3D08A" };
  if (v < 50) return { label: "Baik", color: "#9FCBA6" };
  if (v < 60) return { label: "Sangat baik", color: "#7FBF8E" };
  return { label: "Istimewa", color: "#E8C874" };
}

function Vo2Panel() {
  const [method, setMethod] = useState("cooper");
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState("male");
  const [distance, setDistance] = useState("2400");
  const [timeMin, setTimeMin] = useState("13");
  const [hr, setHr] = useState("140");
  const [weightKg, setWeightKg] = useState("65");
  const [level, setLevel] = useState("8");
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry } = useHistory("history:vo2");

  const vo2 = useMemo(() => {
    const a = parseFloat(age);
    if (method === "cooper") {
      const d = parseFloat(distance);
      if (isNaN(d)) return null;
      return vo2FromCooper(d);
    }
    if (method === "rockport") {
      const t = parseFloat(timeMin);
      const h = parseFloat(hr);
      const w = parseFloat(weightKg);
      if ([t, h, w, a].some((x) => isNaN(x))) return null;
      return vo2FromRockport({ timeMin: t, hr: h, weightKg: w, age: a, gender });
    }
    if (method === "mft") {
      const l = parseInt(level, 10);
      if (isNaN(l) || isNaN(a)) return null;
      return vo2FromMft({ level: l, age: a });
    }
    return null;
  }, [method, age, gender, distance, timeMin, hr, weightKg, level]);

  const cat = vo2Category(vo2);
  const vo2Clamped = vo2 != null && !isNaN(vo2) ? Math.max(vo2, 0) : null;

  const handleSave = () => {
    if (vo2Clamped == null) return;
    addEntry(+vo2Clamped.toFixed(1), { category: cat?.label });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-5">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
        <Field label="Metode tes">
          <Select
            value={method}
            onChange={setMethod}
            options={[
              { value: "cooper", label: "Cooper Test (lari 12 menit)" },
              { value: "rockport", label: "Rockport Walk Test (jalan 1 mil)" },
              { value: "mft", label: "Multistage Fitness Test (bleep test)" },
            ]}
          />
        </Field>

        {method !== "mft" && (
          <Field label="Usia" unit="tahun">
            <NumberInput value={age} onChange={setAge} placeholder="28" />
          </Field>
        )}
        {method === "mft" && (
          <Field label="Usia" unit="tahun">
            <NumberInput value={age} onChange={setAge} placeholder="28" />
          </Field>
        )}

        {method === "cooper" && (
          <Field label="Jarak tempuh 12 menit" unit="meter">
            <NumberInput value={distance} onChange={setDistance} placeholder="2400" />
          </Field>
        )}

        {method === "rockport" && (
          <>
            <Field label="Jenis kelamin">
              <Select
                value={gender}
                onChange={setGender}
                options={[
                  { value: "male", label: "Laki-laki" },
                  { value: "female", label: "Perempuan" },
                ]}
              />
            </Field>
            <Field label="Berat badan" unit="kg">
              <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" />
            </Field>
            <Field label="Waktu tempuh 1 mil" unit="menit">
              <NumberInput value={timeMin} onChange={setTimeMin} placeholder="13" />
            </Field>
            <Field label="Detak jantung di garis akhir" unit="bpm">
              <NumberInput value={hr} onChange={setHr} placeholder="140" />
            </Field>
          </>
        )}

        {method === "mft" && (
          <Field label="Level terakhir yang diselesaikan" unit="level 1–21">
            <NumberInput value={level} onChange={setLevel} placeholder="8" />
          </Field>
        )}

        <Footnote>
          Hasil merupakan estimasi lapangan, bukan pengukuran laboratorium
          (gold standard: tes gas ergospirometri). Tabel kecepatan MFT
          disederhanakan (+0,5 km/j per level dari 8,0 km/j).
        </Footnote>
      </div>

      <div className="order-1 md:order-2 md:col-span-3">
        <ResultPanel
          value={vo2Clamped}
          decimals={1}
          unit="ml/kg/menit · VO2 maks"
          category={cat?.label}
          categoryColor={cat?.color}
          exportTitle="VO2 Maks"
          shareHeadline="VO2 Maks Terukur!"
          shareStats={[
            { label: "Metode", value: method === "cooper" ? "Cooper Test" : method === "rockport" ? "Rockport" : "MFT" },
            { label: "Usia", value: age || "–" },
          ]}
          onSave={handleSave}
          savedJustNow={justSaved}
        />
      </div>
    </div>
  );
}

// ---------- ZONA DETAK JANTUNG ----------

const ZONES = [
  { key: 1, label: "Pemulihan", desc: "Latihan ringan, pemulihan aktif", from: 0.5, to: 0.6, color: TURF },
  { key: 2, label: "Aerobik dasar", desc: "Membangun daya tahan dasar", from: 0.6, to: 0.7, color: "#4C8C6B" },
  { key: 3, label: "Aerobik / tempo", desc: "Latihan tempo, daya tahan menengah", from: 0.7, to: 0.8, color: GOLD },
  { key: 4, label: "Ambang anaerobik", desc: "Interval keras, toleransi laktat", from: 0.8, to: 0.9, color: "#D9701E" },
  { key: 5, label: "Maksimal", desc: "Sprint, kapasitas VO2 maks", from: 0.9, to: 1.0, color: TRACK },
];

function HrPanel() {
  const [age, setAge] = useState("28");
  const [restHr, setRestHr] = useState("65");
  const [maxHrOverride, setMaxHrOverride] = useState("");

  const a = parseFloat(age);
  const rest = parseFloat(restHr);
  const maxOverride = parseFloat(maxHrOverride);
  const hrMax = !isNaN(maxOverride) && maxOverride > 0 ? maxOverride : 220 - (isNaN(a) ? 0 : a);
  const useKarvonen = !isNaN(rest) && rest > 0;
  const hrr = hrMax - (useKarvonen ? rest : 0);
  const animatedHrMax = useCountUp(isNaN(hrMax) ? null : hrMax);

  const zoneRanges = ZONES.map((z) => {
    if (isNaN(hrMax)) return { ...z, low: null, high: null };
    if (useKarvonen) {
      return {
        ...z,
        low: Math.round(rest + z.from * hrr),
        high: Math.round(rest + z.to * hrr),
      };
    }
    return {
      ...z,
      low: Math.round(z.from * hrMax),
      high: Math.round(z.to * hrMax),
    };
  });

  return (
    <div className="flex flex-col md:grid md:grid-cols-5">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
        <Field label="Usia" unit="tahun">
          <NumberInput value={age} onChange={setAge} placeholder="28" />
        </Field>
        <Field label="Detak jantung istirahat (opsional)" unit="bpm">
          <NumberInput value={restHr} onChange={setRestHr} placeholder="65" />
        </Field>
        <Field label="HR maks terukur (opsional, ganti estimasi 220−usia)" unit="bpm">
          <NumberInput value={maxHrOverride} onChange={setMaxHrOverride} placeholder="kosongkan jika tidak ada" />
        </Field>
        <Footnote>
          {useKarvonen
            ? "Menggunakan metode Karvonen (heart rate reserve) karena detak jantung istirahat diisi."
            : "Menggunakan persentase langsung dari HR maks. Isi detak jantung istirahat untuk hasil yang lebih presisi (metode Karvonen)."}
        </Footnote>
      </div>

      <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8" style={{ backgroundColor: INK }}>
        <div className="mb-4">
          <span className="text-sm uppercase tracking-wide" style={{ color: "#9AA6B2" }}>
            HR maks estimasi
          </span>
          <div className="font-black leading-none" style={{ fontSize: "2.4rem", color: CHALK, fontVariantNumeric: "tabular-nums" }}>
            {isNaN(hrMax) ? "–" : Math.round(animatedHrMax)}
            <span className="text-base font-normal ml-2" style={{ color: "#9AA6B2" }}>bpm</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {zoneRanges.map((z) => (
            <div key={z.key} className="flex items-center gap-3">
              <div className="w-2 self-stretch rounded-sm" style={{ backgroundColor: z.color }} />
              <div className="flex-1 py-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold" style={{ color: CHALK }}>{z.label}</span>
                  <span className="text-sm font-mono" style={{ color: "#C7CFD6" }}>
                    {z.low != null ? `${z.low}–${z.high}` : "–"} bpm
                  </span>
                </div>
                <span className="text-xs" style={{ color: "#8C97A3" }}>{z.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- KOMPOSISI TUBUH ----------

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Kurus", color: "#E3D08A" };
  if (bmi < 23) return { label: "Normal", color: "#9FCBA6" };
  if (bmi < 25) return { label: "Berisiko (kelebihan BB)", color: "#E7B8A6" };
  if (bmi < 30) return { label: "Obesitas I", color: "#E29A73" };
  return { label: "Obesitas II", color: "#D97F5A" };
}

function bodyFatCategory(bf, gender) {
  if (bf == null || isNaN(bf)) return null;
  const cuts =
    gender === "male"
      ? [
          { max: 5, label: "Lemak esensial" },
          { max: 13, label: "Atlet" },
          { max: 17, label: "Bugar" },
          { max: 24, label: "Rata-rata" },
          { max: 100, label: "Di atas rata-rata" },
        ]
      : [
          { max: 13, label: "Lemak esensial" },
          { max: 20, label: "Atlet" },
          { max: 24, label: "Bugar" },
          { max: 31, label: "Rata-rata" },
          { max: 100, label: "Di atas rata-rata" },
        ];
  const idx = cuts.findIndex((c) => bf <= c.max);
  const colors = ["#E3D08A", "#7FBF8E", "#9FCBA6", "#E3D08A", "#E7B8A6"];
  const found = cuts[idx === -1 ? cuts.length - 1 : idx];
  return { label: found.label, color: colors[idx === -1 ? colors.length - 1 : idx] };
}

function BodyPanel() {
  const [sub, setSub] = useState("bmi");
  const [weightKg, setWeightKg] = useState("65");
  const [heightCm, setHeightCm] = useState("170");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("28");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [savedBmi, setSavedBmi] = useState(false);
  const [savedFat, setSavedFat] = useState(false);
  const { addEntry: addBmiEntry } = useHistory("history:bmi");
  const { addEntry: addFatEntry } = useHistory("history:bodyfat");

  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm) / 100;
  const bmi = !isNaN(w) && !isNaN(h) && h > 0 ? w / (h * h) : null;
  const bmiCat = bmi != null ? bmiCategory(bmi) : null;

  const sum3 = [s1, s2, s3].map(parseFloat);
  const validSkinfold = sum3.every((x) => !isNaN(x));
  const a = parseFloat(age);
  let bodyFat = null;
  if (validSkinfold && !isNaN(a)) {
    const sum = sum3.reduce((x, y) => x + y, 0);
    const density =
      gender === "male"
        ? 1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * a
        : 1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * a;
    bodyFat = 495 / density - 450;
  }
  const bodyFatClamped = bodyFat != null && !isNaN(bodyFat) ? Math.max(bodyFat, 0) : null;
  const bfCat = bodyFatCategory(bodyFat, gender);

  const handleSaveBmi = () => {
    if (bmi == null) return;
    addBmiEntry(+bmi.toFixed(1), { category: bmiCat?.label });
    setSavedBmi(true);
    setTimeout(() => setSavedBmi(false), 1800);
  };
  const handleSaveFat = () => {
    if (bodyFatClamped == null) return;
    addFatEntry(+bodyFatClamped.toFixed(1), { category: bfCat?.label });
    setSavedFat(true);
    setTimeout(() => setSavedFat(false), 1800);
  };

  return (
    <div>
      <div className="flex gap-6 px-6 md:px-8 pt-6" style={{ borderBottom: `1px solid ${LINE}` }}>
        {[
          { key: "bmi", label: "Indeks massa tubuh" },
          { key: "fat", label: "Persentase lemak tubuh" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className="pb-3 text-sm font-semibold"
            style={{
              color: sub === t.key ? GRAPHITE : MUTED,
              borderBottom: sub === t.key ? `3px solid ${TRACK}` : "3px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "bmi" && (
        <div className="flex flex-col md:grid md:grid-cols-5">
          <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
            <Field label="Berat badan" unit="kg">
              <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" />
            </Field>
            <Field label="Tinggi badan" unit="cm">
              <NumberInput value={heightCm} onChange={setHeightCm} placeholder="170" />
            </Field>
            <Footnote>
              Menggunakan ambang batas Asia-Pasifik (WHO), bukan ambang batas umum
              yang biasa dipakai untuk populasi Barat.
            </Footnote>
          </div>
          <div className="order-1 md:order-2 md:col-span-3">
            <ResultPanel
              value={bmi}
              decimals={1}
              unit="kg/m² · BMI"
              category={bmiCat?.label}
              categoryColor={bmiCat?.color}
              exportTitle="Indeks Massa Tubuh"
              shareHeadline="BMI Terukur!"
              shareStats={[
                { label: "Berat", value: `${weightKg || "–"} kg` },
                { label: "Tinggi", value: `${heightCm || "–"} cm` },
              ]}
              onSave={handleSaveBmi}
              savedJustNow={savedBmi}
            />
          </div>
        </div>
      )}

      {sub === "fat" && (
        <div className="flex flex-col md:grid md:grid-cols-5">
          <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
            <Field label="Jenis kelamin">
              <Select
                value={gender}
                onChange={setGender}
                options={[
                  { value: "male", label: "Laki-laki" },
                  { value: "female", label: "Perempuan" },
                ]}
              />
            </Field>
            <Field label="Usia" unit="tahun">
              <NumberInput value={age} onChange={setAge} placeholder="28" />
            </Field>
            <Field label={gender === "male" ? "Skinfold dada" : "Skinfold trisep"} unit="mm">
              <NumberInput value={s1} onChange={setS1} placeholder="mm" />
            </Field>
            <Field label={gender === "male" ? "Skinfold perut" : "Skinfold suprailiaka"} unit="mm">
              <NumberInput value={s2} onChange={setS2} placeholder="mm" />
            </Field>
            <Field label="Skinfold paha" unit="mm">
              <NumberInput value={s3} onChange={setS3} placeholder="mm" />
            </Field>
            <Footnote>
              Metode Jackson-Pollock 3-titik dengan persamaan Siri. Perlu skinfold
              caliper untuk pengukuran lapangan yang akurat.
            </Footnote>
          </div>
          <div className="order-1 md:order-2 md:col-span-3">
            <ResultPanel
              value={bodyFatClamped}
              decimals={1}
              unit="% lemak tubuh"
              category={bfCat?.label}
              categoryColor={bfCat?.color}
              exportTitle="Persentase Lemak Tubuh"
              shareHeadline="Komposisi Tubuh Terukur!"
              shareStats={[
                { label: "Usia", value: age || "–" },
                { label: "Gender", value: gender === "male" ? "Laki-laki" : "Perempuan" },
              ]}
              onSave={handleSaveFat}
              savedJustNow={savedFat}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- PROGRAM LATIHAN ----------

const EXERCISES = {
  gym: {
    fullbody: ["Squat barbel", "Bench press", "Bent-over row", "Overhead press", "Romanian deadlift"],
    upper: ["Bench press", "Lat pulldown", "Overhead press", "Seated cable row", "Bicep curl", "Triceps pushdown"],
    lower: ["Squat barbel", "Romanian deadlift", "Leg press", "Leg curl", "Calf raise"],
    push: ["Bench press", "Overhead press", "Incline dumbbell press", "Lateral raise", "Triceps pushdown"],
    pull: ["Deadlift", "Bent-over row", "Lat pulldown", "Face pull", "Bicep curl"],
    legs: ["Squat barbel", "Leg press", "Romanian deadlift", "Leg curl", "Calf raise"],
  },
  bodyweight: {
    fullbody: ["Push-up", "Bodyweight squat", "Inverted row / meja", "Glute bridge", "Plank"],
    upper: ["Push-up", "Pike push-up", "Inverted row / meja", "Superman", "Triceps dip (kursi)"],
    lower: ["Bodyweight squat", "Lunges", "Glute bridge", "Calf raise", "Wall sit"],
    push: ["Push-up", "Pike push-up", "Diamond push-up", "Triceps dip (kursi)", "Shoulder tap"],
    pull: ["Inverted row / meja", "Superman", "Reverse snow angel", "Towel row (jika ada handuk & tiang)"],
    legs: ["Bodyweight squat", "Lunges", "Glute bridge", "Calf raise", "Wall sit"],
  },
};

const SCHEME_LABELS = {
  fullbody: { name: "Full body", sessions: ["Full body"] },
  upperlower: { name: "Upper-lower", sessions: ["Upper", "Lower"] },
  ppl: { name: "Push-pull-legs", sessions: ["Push", "Pull", "Legs"] },
};

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const FREQ_DAY_MAP = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
};

function autoScheme(freq) {
  if (freq <= 3) return "fullbody";
  if (freq === 4) return "upperlower";
  return "ppl";
}

function repsForLevel(level) {
  if (level === "pemula") return { scheme: "3 set x 10–12 repetisi", rest: "60–90 detik" };
  if (level === "menengah") return { scheme: "4 set x 8–10 repetisi", rest: "90 detik – 2 menit" };
  return { scheme: "5 set x 6–8 repetisi", rest: "2–3 menit" };
}

function LatihanPanel() {
  const [freq, setFreq] = useState("4");
  const [level, setLevel] = useState("pemula");
  const [equipment, setEquipment] = useState("gym");
  const [schemeMode, setSchemeMode] = useState("auto");
  const [manualScheme, setManualScheme] = useState("upperlower");
  const [justCompleted, setJustCompleted] = useState(false);
  const { addEntry: addSessionEntry } = useHistory("history:sesi");

  const freqNum = Math.min(Math.max(parseInt(freq, 10) || 3, 2), 6);
  const scheme = schemeMode === "auto" ? autoScheme(freqNum) : manualScheme;
  const sessionCycle = SCHEME_LABELS[scheme].sessions;
  const trainingDayIdx = FREQ_DAY_MAP[freqNum];
  const equipKeys = equipment === "gym" ? ["gym"] : equipment === "bodyweight" ? ["bodyweight"] : ["gym", "bodyweight"];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Senin ... 6=Minggu

  const weekPlan = DAY_NAMES.map((day, i) => {
    const trainIndex = trainingDayIdx.indexOf(i);
    if (trainIndex === -1) return { day, rest: true };
    const sessionLabel = sessionCycle[trainIndex % sessionCycle.length];
    const sessionKey = sessionLabel.toLowerCase().replace(" ", "").replace("-", "");
    const key = sessionKey === "fullbody" ? "fullbody" : sessionKey;
    return { day, rest: false, label: sessionLabel, key };
  });

  const todayEntry = weekPlan[todayIdx];
  const todayExercises = todayEntry.rest
    ? []
    : equipKeys.flatMap((eq) => EXERCISES[eq][todayEntry.key] || []);

  const handleCompleteSession = () => {
    if (todayEntry.rest) return;
    addSessionEntry(todayEntry.label, { scheme: SCHEME_LABELS[scheme].name });
    downloadShareCard({
      headline: `Sesi ${todayEntry.label} Selesai!`,
      value: todayEntry.label,
      unit: "sesi latihan hari ini",
      badge: SCHEME_LABELS[scheme].name,
      badgeColor: "#9FCBA6",
      stats: [
        { label: "Skema", value: repsForLevel(level).scheme },
        { label: "Jumlah gerakan", value: `${todayExercises.length}` },
      ],
      filename: `sesi-${todayEntry.label}`,
    });
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 2200);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-5">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
        <Field label="Frekuensi latihan per minggu">
          <Select
            value={freq}
            onChange={setFreq}
            options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}x per minggu` }))}
          />
        </Field>
        <Field label="Level pengalaman">
          <Select
            value={level}
            onChange={setLevel}
            options={[
              { value: "pemula", label: "Pemula" },
              { value: "menengah", label: "Menengah" },
              { value: "lanjutan", label: "Lanjutan" },
            ]}
          />
        </Field>
        <Field label="Peralatan">
          <Select
            value={equipment}
            onChange={setEquipment}
            options={[
              { value: "gym", label: "Gym (alat lengkap)" },
              { value: "bodyweight", label: "Tanpa alat (rumahan)" },
            ]}
          />
        </Field>
        <Field label="Skema program">
          <Select
            value={schemeMode}
            onChange={setSchemeMode}
            options={[
              { value: "auto", label: "Otomatis sesuai frekuensi" },
              { value: "manual", label: "Pilih manual" },
            ]}
          />
        </Field>
        {schemeMode === "manual" && (
          <Field label="Pilih skema">
            <Select
              value={manualScheme}
              onChange={setManualScheme}
              options={[
                { value: "fullbody", label: "Full body" },
                { value: "upperlower", label: "Upper-lower" },
                { value: "ppl", label: "Push-pull-legs" },
              ]}
            />
          </Field>
        )}
        <Footnote>
          Program ini bersifat umum berdasarkan frekuensi, level, dan peralatan —
          bukan disusun dari riwayat kesehatan. Rekomendasi istirahat antar set
          mengacu pada tinjauan Schoenfeld dkk. (2016, <em>J Strength Cond Res</em>)
          dan meta-analisis 2024 (<em>Frontiers in Sports and Active Living</em>)
          yang menunjukkan istirahat lebih panjang (2–3 menit) sama baik atau
          lebih baik untuk hipertrofi dibanding asumsi lama 60–90 detik. Bagi
          pengguna dengan cedera atau kondisi medis tertentu, konsultasikan
          dengan dokter/fisioterapis sebelum memulai.
        </Footnote>
      </div>

      <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8" style={{ backgroundColor: INK }}>
        <div className="mb-4">
          <span className="text-sm uppercase tracking-wide" style={{ color: "#9AA6B2" }}>
            Skema terpilih
          </span>
          <div className="font-black leading-none" style={{ fontSize: "1.8rem", color: CHALK }}>
            {SCHEME_LABELS[scheme].name}
          </div>
          <span className="text-xs" style={{ color: "#8C97A3" }}>
            {repsForLevel(level).scheme} · istirahat {repsForLevel(level).rest} per sesi
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {weekPlan.map((d, i) => (
            <div
              key={d.day}
              className="flex items-start gap-3 py-2"
              style={{
                borderTop: "1px solid #24344A",
                backgroundColor: i === todayIdx ? "rgba(193,68,14,0.08)" : "transparent",
                marginLeft: i === todayIdx ? "-8px" : 0,
                marginRight: i === todayIdx ? "-8px" : 0,
                paddingLeft: i === todayIdx ? "8px" : 0,
                paddingRight: i === todayIdx ? "8px" : 0,
              }}
            >
              <span className="text-xs w-16 shrink-0 pt-0.5" style={{ color: i === todayIdx ? TRACK : "#8C97A3" }}>
                {d.day}
                {i === todayIdx && <span className="block text-[10px] uppercase tracking-wide">Hari ini</span>}
              </span>
              {d.rest ? (
                <span className="text-sm" style={{ color: "#6E7986" }}>Istirahat</span>
              ) : (
                <div>
                  <span className="text-sm font-semibold" style={{ color: CHALK }}>{d.label}</span>
                  <div className="text-xs mt-1" style={{ color: "#9AA6B2" }}>
                    {equipKeys
                      .flatMap((eq) => EXERCISES[eq][d.key] || [])
                      .slice(0, equipKeys.length > 1 ? 6 : 5)
                      .join(" · ")}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4" style={{ borderTop: "1px solid #24344A" }}>
          {todayEntry.rest ? (
            <p className="text-xs" style={{ color: "#8C97A3" }}>
              Jadwal hari ini istirahat — tidak ada sesi untuk ditandai selesai.
            </p>
          ) : (
            <button
              onClick={handleCompleteSession}
              className="flex items-center gap-1.5 text-xs font-semibold export-btn"
              style={{ color: justCompleted ? "#9FCBA6" : "#9AA6B2" }}
            >
              <Download size={14} />
              {justCompleted ? "Tersimpan & kartu diunduh" : `Tandai sesi ${todayEntry.label} hari ini selesai`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- TARGET NUTRISI ----------

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryactive: 1.9,
};

const MENU_TEMPLATES = [
  {
    max: 2000,
    meals: {
      "Sarapan": "Nasi merah + telur rebus 2 butir + tumis kangkung",
      "Makan siang": "Nasi merah + ayam dada panggang + tempe + sayur bening bayam",
      "Makan malam": "Nasi merah porsi kecil + ikan kukus + tumis buncis wortel",
      "Camilan": "Buah potong + segenggam kacang almond",
    },
  },
  {
    max: 2600,
    meals: {
      "Sarapan": "Nasi + telur dadar 2 butir + tempe goreng + sayur",
      "Makan siang": "Nasi + ayam dada/paha panggang + tahu + sayur bening + buah",
      "Makan malam": "Nasi + ikan/daging tanpa lemak + tempe + sayur tumis",
      "Camilan": "Susu/yogurt + pisang atau roti gandum + selai kacang",
    },
  },
  {
    max: Infinity,
    meals: {
      "Sarapan": "Nasi porsi besar + telur 2–3 butir + tempe/tahu + susu",
      "Makan siang": "Nasi + ayam/daging porsi besar + tempe + sayur + buah",
      "Makan malam": "Nasi + ikan/daging + tempe/tahu + sayur + susu/yogurt",
      "Camilan": "Roti gandum + selai kacang + pisang, atau granola bar + susu",
    },
  },
];

function NutrisiPanel() {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("28");
  const [weightKg, setWeightKg] = useState("65");
  const [heightCm, setHeightCm] = useState("170");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintenance");
  const [savedCalories, setSavedCalories] = useState(false);
  const { addEntry: addCalorieEntry } = useHistory("history:calories");

  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm);
  const a = parseFloat(age);
  const valid = ![w, h, a].some((x) => isNaN(x));

  let calories = null;
  let proteinG = null;
  let fatG = null;
  let carbG = null;

  if (valid) {
    const bmr = gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * ACTIVITY_FACTORS[activity];
    calories = goal === "cutting" ? tdee - 500 : goal === "bulking" ? tdee + 300 : tdee;
    calories = Math.max(calories, 1200);

    const proteinFactor = goal === "cutting" ? 2.2 : goal === "bulking" ? 1.8 : 2.0;
    proteinG = proteinFactor * w;
    const proteinKcal = proteinG * 4;
    const fatKcal = calories * 0.25;
    fatG = fatKcal / 9;
    const carbKcal = Math.max(calories - proteinKcal - fatKcal, 0);
    carbG = carbKcal / 4;
  }

  const template = calories != null ? MENU_TEMPLATES.find((t) => calories <= t.max) : null;

  const animCalories = useCountUp(calories);
  const animProtein = useCountUp(proteinG);
  const animFat = useCountUp(fatG);
  const animCarb = useCountUp(carbG);

  const handleSaveCalories = () => {
    if (calories == null) return;
    addCalorieEntry(Math.round(calories), { goal });
    setSavedCalories(true);
    setTimeout(() => setSavedCalories(false), 1800);
  };

  return (
    <div>
      <div className="flex flex-col md:grid md:grid-cols-5">
        <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
          <Field label="Jenis kelamin">
            <Select
              value={gender}
              onChange={setGender}
              options={[
                { value: "male", label: "Laki-laki" },
                { value: "female", label: "Perempuan" },
              ]}
            />
          </Field>
          <Field label="Usia" unit="tahun">
            <NumberInput value={age} onChange={setAge} placeholder="28" />
          </Field>
          <Field label="Berat badan" unit="kg">
            <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" />
          </Field>
          <Field label="Tinggi badan" unit="cm">
            <NumberInput value={heightCm} onChange={setHeightCm} placeholder="170" />
          </Field>
          <Field label="Tingkat aktivitas">
            <Select
              value={activity}
              onChange={setActivity}
              options={[
                { value: "sedentary", label: "Minim gerak (kerja duduk)" },
                { value: "light", label: "Ringan (olahraga 1–3x/minggu)" },
                { value: "moderate", label: "Sedang (olahraga 3–5x/minggu)" },
                { value: "active", label: "Aktif (olahraga 6–7x/minggu)" },
                { value: "veryactive", label: "Sangat aktif (fisik berat/2x sehari)" },
              ]}
            />
          </Field>
          <Field label="Tujuan">
            <Select
              value={goal}
              onChange={setGoal}
              options={[
                { value: "cutting", label: "Menurunkan lemak (cutting)" },
                { value: "maintenance", label: "Menjaga berat (maintenance)" },
                { value: "bulking", label: "Menambah massa (bulking)" },
              ]}
            />
          </Field>
          <Footnote>
            Estimasi berdasarkan rumus Mifflin-St Jeor dan tujuan umum. Bukan
            pengganti konsultasi ahli gizi, terutama bagi pengguna dengan
            kondisi kesehatan khusus (diabetes, hipertensi, gangguan ginjal, dll).
          </Footnote>
        </div>

        <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8" style={{ backgroundColor: INK }}>
          <div className="flex items-baseline gap-2">
            <span className="font-black leading-none" style={{ fontSize: "3.2rem", color: CHALK, fontVariantNumeric: "tabular-nums" }}>
              {calories != null ? Math.round(animCalories) : "–"}
            </span>
            <span className="text-sm uppercase tracking-wide" style={{ color: "#9AA6B2" }}>kkal/hari</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Protein", value: proteinG, animated: animProtein, color: TURF },
              { label: "Lemak", value: fatG, animated: animFat, color: GOLD },
              { label: "Karbohidrat", value: carbG, animated: animCarb, color: TRACK },
            ].map((m) => (
              <div key={m.label}>
                <div className="w-full h-1 mb-2 macro-bar" style={{ backgroundColor: m.color }} />
                <div className="text-sm font-semibold" style={{ color: CHALK, fontVariantNumeric: "tabular-nums" }}>
                  {m.value != null ? `${Math.round(m.animated)} g` : "–"}
                </div>
                <div className="text-xs" style={{ color: "#8C97A3" }}>{m.label}</div>
              </div>
            ))}
          </div>
          {calories != null && (
            <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: "1px solid #24344A" }}>
              <button
                onClick={handleSaveCalories}
                className="flex items-center gap-1.5 text-xs font-semibold export-btn"
                style={{ color: savedCalories ? "#9FCBA6" : "#9AA6B2" }}
              >
                <Save size={14} />
                {savedCalories ? "Tersimpan" : "Simpan ke riwayat"}
              </button>
              <button
                onClick={() =>
                  downloadShareCard({
                    headline: "Target Kalori Harian!",
                    value: String(Math.round(animCalories)),
                    unit: "kkal/hari",
                    badge: goal === "cutting" ? "Cutting" : goal === "bulking" ? "Bulking" : "Maintenance",
                    badgeColor: "#9FCBA6",
                    stats: [
                      { label: "Protein", value: proteinG != null ? `${Math.round(proteinG)} g` : "–" },
                      { label: "Karbohidrat", value: carbG != null ? `${Math.round(carbG)} g` : "–" },
                    ],
                    filename: "Target Kalori Harian",
                  })
                }
                className="flex items-center gap-1.5 text-xs font-semibold export-btn"
                style={{ color: "#9AA6B2" }}
              >
                <Download size={14} />
                Bagikan kartu
              </button>
            </div>
          )}
        </div>
      </div>

      {template && (
        <div className="p-6 md:p-8" style={{ borderTop: `1px solid ${LINE}` }}>
          <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>
            Contoh kombinasi menu harian (ilustratif)
          </span>
          <div className="grid sm:grid-cols-2 gap-4 mt-3">
            {Object.entries(template.meals).map(([k, v]) => (
              <div key={k}>
                <span className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>{k}</span>
                <p className="text-sm mt-0.5" style={{ color: GRAPHITE }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 1RM (ONE-REP MAX) ----------

function rmEpley(weight, reps) {
  return weight * (1 + reps / 30);
}
function rmBrzycki(weight, reps) {
  return weight * (36 / (37 - reps));
}
function rmLombardi(weight, reps) {
  return weight * Math.pow(reps, 0.1);
}

const RM_PERCENT_TABLE = [
  { pct: 100, reps: "1" },
  { pct: 95, reps: "2" },
  { pct: 90, reps: "3–4" },
  { pct: 85, reps: "5–6" },
  { pct: 80, reps: "7–8" },
  { pct: 75, reps: "9–10" },
  { pct: 70, reps: "11–12" },
  { pct: 65, reps: "13–15" },
  { pct: 60, reps: "16–20" },
];

function OneRmPanel() {
  const [method, setMethod] = useState("epley");
  const [exerciseName, setExerciseName] = useState("");
  const [weight, setWeight] = useState("80");
  const [reps, setReps] = useState("5");
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry } = useHistory("history:1rm");

  const oneRm = useMemo(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r) || r < 1) return null;
    if (r === 1) return w;
    if (method === "epley") return rmEpley(w, r);
    if (method === "brzycki") return r >= 37 ? null : rmBrzycki(w, r);
    if (method === "lombardi") return rmLombardi(w, r);
    const vals = [rmEpley(w, r), r < 37 ? rmBrzycki(w, r) : null, rmLombardi(w, r)].filter((v) => v != null);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [method, weight, reps]);

  const repsNum = parseInt(reps, 10);
  const highRepWarning = !isNaN(repsNum) && repsNum > 12;

  const handleSave = () => {
    if (oneRm == null) return;
    addEntry(+oneRm.toFixed(1), { exercise: exerciseName || null });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-5">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
        <Field label="Nama gerakan (opsional)">
          <TextInput
            value={exerciseName}
            onChange={setExerciseName}
            placeholder="mis. Back Squat"
          />
        </Field>
        <Field label="Beban yang diangkat" unit="kg">
          <NumberInput value={weight} onChange={setWeight} placeholder="80" />
        </Field>
        <Field label="Repetisi maksimal pada beban itu" unit="reps">
          <NumberInput value={reps} onChange={setReps} placeholder="5" />
        </Field>
        <Field label="Metode estimasi">
          <Select
            value={method}
            onChange={setMethod}
            options={[
              { value: "epley", label: "Epley" },
              { value: "brzycki", label: "Brzycki" },
              { value: "lombardi", label: "Lombardi" },
              { value: "rata", label: "Rata-rata ketiganya" },
            ]}
          />
        </Field>
        <Footnote>
          {highRepWarning
            ? "Repetisi di atas 12 membuat estimasi rumus ini kurang akurat — hasil cenderung meleset. Untuk repetisi tinggi, pertimbangkan tes langsung pada beban lebih berat dengan repetisi lebih sedikit."
            : "Estimasi dari rumus regresi, bukan pengukuran langsung. Untuk kepentingan kompetisi/klasifikasi resmi, tetap perlu tes 1RM sesungguhnya dengan pengawasan."}
        </Footnote>
      </div>

      <div className="order-1 md:order-2 md:col-span-3">
        <ResultPanel
          value={oneRm}
          decimals={1}
          unit={`kg · estimasi 1RM${exerciseName ? " · " + exerciseName : ""}`}
          exportTitle={exerciseName ? `1RM ${exerciseName}` : "Estimasi 1RM"}
          shareHeadline={exerciseName ? `${exerciseName} — 1RM Baru!` : "1RM Baru!"}
          shareStats={[
            { label: "Beban diangkat", value: `${weight || "–"} kg` },
            { label: "Repetisi", value: `${reps || "–"}x` },
          ]}
          onSave={handleSave}
          savedJustNow={justSaved}
        >
          {oneRm != null && (
            <div>
              <span className="text-xs uppercase tracking-wide" style={{ color: "#9AA6B2" }}>
                Panduan beban latihan (% dari 1RM)
              </span>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 mt-2">
                {RM_PERCENT_TABLE.map((row) => (
                  <div key={row.pct} className="flex items-baseline justify-between text-xs">
                    <span style={{ color: "#9AA6B2" }}>{row.pct}%</span>
                    <span style={{ color: CHALK, fontVariantNumeric: "tabular-nums" }}>
                      {(oneRm * (row.pct / 100)).toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}

// ---------- KEBUTUHAN CAIRAN / HIDRASI ----------

const HYDRATION_INTENSITY_ML_PER_HOUR = {
  ringan: 400,
  sedang: 600,
  berat: 800,
};

function HydrationPanel() {
  const [weightKg, setWeightKg] = useState("65");
  const [durationMin, setDurationMin] = useState("60");
  const [intensity, setIntensity] = useState("sedang");
  const [climate, setClimate] = useState("normal");
  const [postWeightKg, setPostWeightKg] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const { addEntry } = useHistory("history:hidrasi");

  const w = parseFloat(weightKg);
  const durMin = parseFloat(durationMin);
  const postW = parseFloat(postWeightKg);

  const baselineMl = !isNaN(w) ? w * 35 : null;

  let exerciseMl = null;
  if (!isNaN(durMin) && durMin >= 0) {
    const perHour = HYDRATION_INTENSITY_ML_PER_HOUR[intensity];
    const climateFactor = climate === "panas" ? 1.2 : 1;
    exerciseMl = (durMin / 60) * perHour * climateFactor;
  }

  const totalMl = baselineMl != null && exerciseMl != null ? baselineMl + exerciseMl : null;

  const beforeMl = !isNaN(w) ? w * 6 : null; // 5-7 ml/kg, ambil titik tengah
  const duringPer15Min =
    exerciseMl != null && durMin > 0 ? (exerciseMl / durMin) * 15 : null;
  const weightLossKg = !isNaN(w) && !isNaN(postW) && w > postW ? w - postW : null;
  const afterMl = weightLossKg != null ? weightLossKg * 1350 : null; // 1.25-1.5 L per kg hilang

  const handleSave = () => {
    if (totalMl == null) return;
    addEntry(Math.round(totalMl), { intensity });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-5">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8">
        <Field label="Berat badan" unit="kg">
          <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" />
        </Field>
        <Field label="Durasi latihan" unit="menit">
          <NumberInput value={durationMin} onChange={setDurationMin} placeholder="60" />
        </Field>
        <Field label="Intensitas latihan">
          <Select
            value={intensity}
            onChange={setIntensity}
            options={[
              { value: "ringan", label: "Ringan" },
              { value: "sedang", label: "Sedang" },
              { value: "berat", label: "Berat" },
            ]}
          />
        </Field>
        <Field label="Kondisi lingkungan">
          <Select
            value={climate}
            onChange={setClimate}
            options={[
              { value: "normal", label: "Normal" },
              { value: "panas", label: "Panas & lembap" },
            ]}
          />
        </Field>
        <Field label="Berat badan setelah latihan (opsional)" unit="kg">
          <NumberInput
            value={postWeightKg}
            onChange={setPostWeightKg}
            placeholder="untuk hitung rehidrasi pasca-latihan"
          />
        </Field>
        <Footnote>
          Estimasi umum berdasarkan panduan ACSM (30–35 ml/kg kebutuhan
          harian dasar + tambahan saat latihan). Kebutuhan aktual bervariasi
          per individu — laju keringat, aklimatisasi panas, dan kondisi
          kesehatan (mis. gangguan ginjal/jantung) perlu disesuaikan dengan
          arahan tenaga medis.
        </Footnote>
      </div>

      <div className="order-1 md:order-2 md:col-span-3">
        <ResultPanel
          value={totalMl != null ? totalMl / 1000 : null}
          decimals={2}
          unit="liter · total kebutuhan hari ini"
          exportTitle="Kebutuhan Cairan"
          shareHeadline="Target Hidrasi Harian!"
          shareStats={[
            { label: "Durasi latihan", value: `${durationMin || "–"} menit` },
            { label: "Intensitas", value: intensity === "ringan" ? "Ringan" : intensity === "berat" ? "Berat" : "Sedang" },
          ]}
          onSave={handleSave}
          savedJustNow={justSaved}
        >
          {totalMl != null && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: "#9AA6B2" }}>Sebelum latihan (~2–3 jam sebelum)</span>
                <span style={{ color: CHALK }}>{beforeMl != null ? Math.round(beforeMl) : "–"} ml</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "#9AA6B2" }}>Saat latihan (tiap 15 menit)</span>
                <span style={{ color: CHALK }}>
                  {duringPer15Min != null ? Math.round(duringPer15Min) : "–"} ml
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "#9AA6B2" }}>Setelah latihan (rehidrasi)</span>
                <span style={{ color: CHALK }}>
                  {afterMl != null ? Math.round(afterMl) : "isi berat badan setelah latihan"} {afterMl != null ? "ml" : ""}
                </span>
              </div>
            </div>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}

// ---------- RIWAYAT PANEL ----------

function HistorySection({ title, unit, storageKey, color }) {
  const { entries, clearAll, loaded } = useHistory(storageKey);

  if (!loaded) return null;

  const last = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const delta = last && prev ? +(last.value - prev.value).toFixed(1) : null;

  return (
    <div className="py-6" style={{ borderBottom: `1px solid ${LINE}` }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>{title}</span>
          {entries.length === 0 ? (
            <p className="text-xs mt-1" style={{ color: MUTED }}>Belum ada data tersimpan.</p>
          ) : (
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black" style={{ color: GRAPHITE }}>{last.value}</span>
              <span className="text-xs" style={{ color: MUTED }}>{unit}</span>
              {delta != null && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: delta > 0 ? TRACK : delta < 0 ? TURF : MUTED }}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              )}
            </div>
          )}
        </div>
        {entries.length >= 2 && <Sparkline values={entries.map((e) => e.value)} color={color} />}
      </div>

      {entries.length > 0 && (
        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-3 overflow-x-auto">
            {entries
              .slice(-6)
              .reverse()
              .map((e, i) => (
                <div key={i} className="text-xs whitespace-nowrap" style={{ color: MUTED }}>
                  {formatDate(e.date)} <span style={{ color: GRAPHITE }}>· {e.value}</span>
                </div>
              ))}
          </div>
          <button onClick={clearAll} className="text-xs shrink-0 ml-4" style={{ color: MUTED }}>
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

function SessionHistorySection() {
  const { entries, clearAll } = useHistory("history:sesi");
  return (
    <div className="py-6" style={{ borderBottom: `1px solid ${LINE}` }}>
      <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>Sesi latihan diselesaikan</span>
      {entries.length === 0 ? (
        <p className="text-xs mt-1" style={{ color: MUTED }}>Belum ada sesi yang ditandai selesai.</p>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 mt-2">
            {entries
              .slice(-8)
              .reverse()
              .map((e, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span style={{ color: GRAPHITE }}>{e.value}</span>
                  <span style={{ color: MUTED }}>{formatDate(e.date)}</span>
                </div>
              ))}
          </div>
          <button onClick={clearAll} className="text-xs mt-2" style={{ color: MUTED }}>
            Hapus
          </button>
        </>
      )}
    </div>
  );
}

function HistoryPanel() {
  return (
    <div className="p-6 md:p-8">
      {!hasStorage && (
        <div className="mb-4 p-3 text-xs rounded-sm" style={{ backgroundColor: "#F3EAD8", color: "#7A5A20" }}>
          Browser Anda tidak mendukung penyimpanan lokal — riwayat hanya
          bertahan selama sesi ini berjalan dan akan hilang saat halaman
          ditutup.
        </div>
      )}
      <HistorySection title="VO2 maks" unit="ml/kg/menit" storageKey="history:vo2" color={TRACK} />
      <HistorySection title="Indeks massa tubuh" unit="kg/m²" storageKey="history:bmi" color={TURF} />
      <HistorySection title="Persentase lemak tubuh" unit="%" storageKey="history:bodyfat" color={GOLD} />
      <HistorySection title="Target kalori harian" unit="kkal" storageKey="history:calories" color={TRACK} />
      <HistorySection title="Estimasi 1RM" unit="kg" storageKey="history:1rm" color={GOLD} />
      <HistorySection title="Kebutuhan cairan harian" unit="ml" storageKey="history:hidrasi" color={TURF} />
      <SessionHistorySection />
    </div>
  );
}

// ---------- APP ----------

const TABS = [
  { key: "vo2", label: "VO2 maks", icon: Activity },
  { key: "hr", label: "Zona detak jantung", icon: HeartPulse },
  { key: "body", label: "Komposisi tubuh", icon: Ruler },
  { key: "onerm", label: "1RM", icon: Gauge },
  { key: "hidrasi", label: "Kebutuhan cairan", icon: Droplets },
  { key: "latihan", label: "Program latihan", icon: Dumbbell },
  { key: "nutrisi", label: "Target nutrisi", icon: Utensils },
  { key: "riwayat", label: "Riwayat", icon: History },
];

export default function App() {
  const [tab, setTab] = useState("vo2");
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen" data-theme={theme} style={{ backgroundColor: "var(--c-page)" }}>
      <style>{`
        :root {
          --c-page: #EEF1EA;
          --c-surface: #FFFFFF;
          --c-text: #3A3F3E;
          --c-muted: #787A6E;
          --c-line: #D8DBD3;
        }
        [data-theme='dark'] {
          --c-page: #0A121C;
          --c-surface: #141F30;
          --c-text: #E7EAE3;
          --c-muted: #9297A3;
          --c-line: #263349;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .panel-anim { animation: fadeSlideIn 300ms ease-out; }
        .header-anim { animation: headerIn 400ms ease-out; }
        .tab-btn { transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease; }
        .tab-btn:hover { background-color: rgba(255,255,255,0.04); }
        .tab-btn:active { transform: scale(0.98); }
        .result-badge { transition: transform 200ms ease; animation: fadeSlideIn 350ms ease-out; }
        .export-btn { transition: opacity 150ms ease; opacity: 0.85; }
        .export-btn:hover { opacity: 1; }
        .theme-toggle { transition: background-color 150ms ease, transform 150ms ease; }
        .theme-toggle:hover { background-color: rgba(255,255,255,0.08); }
        .theme-toggle:active { transform: scale(0.92); }
        @keyframes growBar {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .macro-bar { animation: growBar 500ms ease-out; transform-origin: left; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <header
          className={mounted ? "px-5 sm:px-6 md:px-10 pt-8 md:pt-10 pb-6 md:pb-8 header-anim flex items-start justify-between gap-4" : "px-5 sm:px-6 md:px-10 pt-8 md:pt-10 pb-6 md:pb-8 flex items-start justify-between gap-4"}
          style={{ backgroundColor: INK }}
        >
          <div>
            <h1
              className="font-black tracking-tight leading-tight"
              style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.9rem)", color: CHALK }}
            >
              Kalkulator kepelatihan olahraga
            </h1>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "#9AA6B2" }}>
              Alat bantu cepat untuk pelatih dan guru PJOK
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="theme-toggle shrink-0 p-2 rounded-full"
            style={{ color: CHALK }}
            aria-label="Ganti mode gelap/terang"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>

        <nav
          className="flex overflow-x-auto"
          style={{ backgroundColor: INK, borderBottom: `1px solid #24344A` }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="tab-btn flex items-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0"
                style={{
                  color: active ? CHALK : "#8C97A3",
                  borderBottom: active ? `3px solid ${TRACK}` : "3px solid transparent",
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <main style={{ backgroundColor: "var(--c-surface)", overflow: "hidden" }}>
          <div key={tab} className="panel-anim">
            {tab === "vo2" && <Vo2Panel />}
            {tab === "hr" && <HrPanel />}
            {tab === "body" && <BodyPanel />}
            {tab === "onerm" && <OneRmPanel />}
            {tab === "hidrasi" && <HydrationPanel />}
            {tab === "latihan" && <LatihanPanel />}
            {tab === "nutrisi" && <NutrisiPanel />}
            {tab === "riwayat" && <HistoryPanel />}
          </div>
        </main>

        <footer className="px-5 sm:px-6 md:px-10 py-6 text-xs" style={{ color: MUTED }}>
          Prototipe untuk keperluan edukasi. Bukan pengganti tes laboratorium
          atau penilaian medis untuk atlet elite.
        </footer>
      </div>
    </div>
  );
}
