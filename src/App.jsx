import React, { useState, useMemo, useEffect, useRef } from "react";
import { Activity, HeartPulse, Ruler, Info, Dumbbell, Utensils, Sun, Moon, History, Download, Save, Gauge, Droplets, Camera, RotateCcw, CheckCircle2, User, Home } from "lucide-react";

const INK = "#10233B";
const TRACK = "#C1440E";
const TURF = "#2F6B4F";
const GOLD = "#B8862F";
const CHALK = "#EEF1EA";
const GRAPHITE = "var(--c-text)";
const MUTED = "var(--c-muted)";
const LINE = "var(--c-line)";

// Palet ikon berwarna per kategori (gaya dashboard kartu)
const ICON_COLORS = {
  vo2: "#4C6FFF",
  hr: "#FF6B6B",
  body: "#9B6BFF",
  onerm: "#FF9F43",
  hidrasi: "#17A2B8",
  latihan: "#5B6EF5",
  nutrisi: "#2FB380",
  riwayat: "#8C97A3",
  profil: "#C1440E",
};

const STATUS_COLORS = {
  good: { bg: "#E3F5E9", text: "#1F9254" },
  warn: { bg: "#FEF3D6", text: "#B7791F" },
  bad: { bg: "#FDE8E7", text: "#C0392B" },
  neutral: { bg: "#EEF0F5", text: "#5B6472" },
};

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        backgroundColor: "var(--c-surface)",
        border: "1px solid var(--c-line)",
        boxShadow: "0 1px 3px rgba(16,24,40,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function IconBadge({ icon: Icon, color = TRACK, size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size, backgroundColor: `${color}1F` }}
    >
      <Icon size={size * 0.5} color={color} />
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  const c = STATUS_COLORS[tone] || STATUS_COLORS.neutral;
  return (
    <span
      className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
}

function CircularProgress({ pct, size = 96, stroke = 9, color = TURF, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct || 0));
  const offset = circ - (clamped / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--c-line)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-black" style={{ fontSize: size * 0.24, color: GRAPHITE }}>
          {Math.round(clamped)}%
        </span>
        {label && (
          <span className="text-[10px] text-center leading-tight mt-0.5" style={{ color: MUTED, maxWidth: size * 0.8 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

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

function NumberInput({ value, onChange, placeholder, min, max, warnText }) {
  const num = parseFloat(value);
  const outOfRange = value !== "" && !isNaN(num) && ((min != null && num < min) || (max != null && num > max));
  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls()}
        style={{ borderColor: outOfRange ? "#D97706" : LINE, color: GRAPHITE }}
        onFocus={(e) => (e.target.style.borderColor = TRACK)}
        onBlur={(e) => (e.target.style.borderColor = outOfRange ? "#D97706" : LINE)}
      />
      {outOfRange && (
        <span className="text-xs mt-1 block" style={{ color: "#B7791F" }}>
          ⚠ {warnText || `Periksa kembali — di luar rentang wajar (${min ?? "–"}\u2013${max ?? "–"})`}
        </span>
      )}
    </div>
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
  icon,
  iconColor = TRACK,
  title,
  children,
}) {
  const animated = useCountUp(value);
  const display = value == null || isNaN(value) ? "–" : animated.toFixed(decimals);
  const hasValue = value != null && !isNaN(value);
  return (
    <Card className="p-6 md:p-8 flex flex-col h-full">
      {(icon || title) && (
        <div className="flex items-center gap-3 mb-5">
          {icon && <IconBadge icon={icon} color={iconColor} />}
          {title && (
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
              {title}
            </span>
          )}
        </div>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className="font-black leading-none tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 8vw, 3.2rem)", color: GRAPHITE, fontVariantNumeric: "tabular-nums" }}
        >
          {display}
        </span>
        {unit && (
          <span className="text-sm" style={{ color: MUTED }}>
            {unit}
          </span>
        )}
      </div>
      {category && (
        <span
          className="inline-block mt-4 px-3 py-1 text-sm font-semibold rounded-full result-badge w-fit"
          style={{ backgroundColor: categoryColor, color: "#1A1D29" }}
        >
          {category}
        </span>
      )}
      {children && <div className="mt-6">{children}</div>}
      {hasValue && (onSave || exportTitle) && (
        <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 text-xs font-semibold export-btn"
              style={{ color: savedJustNow ? "#1F9254" : MUTED }}
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
              style={{ color: MUTED }}
            >
              <Download size={14} />
              Bagikan kartu
            </button>
          )}
        </div>
      )}
    </Card>
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

function formatDayHeader(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dayName = DAY_NAMES[(d.getDay() + 6) % 7];
  const dateLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `${dayName}, ${dateLabel}`;
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
  ctx.fillText("JEJAK", 56, 74);

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


// ---------- PROFIL ----------

function loadProfileFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem("userProfile");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function useProfile() {
  const [profile, setProfileState] = useState(loadProfileFromStorage);

  const updateProfile = (patch) => {
    const next = { ...profile, ...patch };
    setProfileState(next);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("userProfile", JSON.stringify(next));
      } catch (e) {}
    }
  };

  return [profile, updateProfile];
}

function ProfilePanel() {
  const [profile, updateProfile] = useProfile();
  const [form, setForm] = useState({
    name: profile.name || "",
    age: profile.age || "",
    gender: profile.gender || "male",
    height: profile.height || "",
    weight: profile.weight || "",
    level: profile.level || "pemula",
    equipment: profile.equipment || "gym",
  });
  const [saved, setSaved] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
        <Field label="Nama (opsional)">
          <TextInput value={form.name} onChange={set("name")} placeholder="Nama Anda" />
        </Field>
        <Field label="Usia" unit="tahun">
          <NumberInput value={form.age} onChange={set("age")} placeholder="28" />
        </Field>
        <Field label="Jenis kelamin">
          <Select
            value={form.gender}
            onChange={set("gender")}
            options={[
              { value: "male", label: "Laki-laki" },
              { value: "female", label: "Perempuan" },
            ]}
          />
        </Field>
        <Field label="Tinggi badan" unit="cm">
          <NumberInput value={form.height} onChange={set("height")} placeholder="170" min={100} max={250} />
        </Field>
        <Field label="Berat badan saat ini" unit="kg">
          <NumberInput value={form.weight} onChange={set("weight")} placeholder="65" min={20} max={300} />
        </Field>
        <Field label="Level pengalaman latihan">
          <Select
            value={form.level}
            onChange={set("level")}
            options={[
              { value: "pemula", label: "Pemula" },
              { value: "menengah", label: "Menengah" },
              { value: "lanjutan", label: "Lanjutan" },
            ]}
          />
        </Field>
        <Field label="Peralatan yang biasa tersedia">
          <Select
            value={form.equipment}
            onChange={set("equipment")}
            options={[
              { value: "gym", label: "Gym (alat lengkap)" },
              { value: "bodyweight", label: "Tanpa alat (rumahan)" },
            ]}
          />
        </Field>
        <Footnote>
          Data ini dipakai sebagai isian awal di semua kalkulator (VO2, BMI,
          komposisi tubuh, hidrasi, nutrisi, program latihan) supaya Anda
          tidak perlu mengetik ulang setiap kali. Tetap bisa diubah manual di
          tiap kalkulator kapan saja — profil ini cuma nilai awal, bukan
          nilai yang dipaksakan.
        </Footnote>
      </div>
      <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
        <div className="flex items-center gap-3 mb-6">
          <IconBadge icon={User} color={ICON_COLORS.profil} />
          <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
            Profil
          </span>
        </div>
        <div className="font-black leading-none mb-4" style={{ fontSize: "1.8rem", color: GRAPHITE }}>
          {form.name || "Belum ada nama"}
        </div>
        <div className="flex flex-col gap-2 text-sm mb-6" style={{ color: MUTED }}>
          {form.age && <span>Usia {form.age} tahun</span>}
          {form.height && form.weight && (
            <span>
              {form.height} cm · {form.weight} kg
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-3 text-sm font-semibold rounded-full"
          style={{ backgroundColor: saved ? "#1F9254" : TRACK, color: "#FFFFFF" }}
        >
          {saved ? "Tersimpan" : "Simpan profil"}
        </button>
      </div>
    </div>
  );
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
  const [profile] = useProfile();
  const [method, setMethod] = useState("cooper");
  const [age, setAge] = useState(profile.age || "28");
  const [gender, setGender] = useState(profile.gender || "male");
  const [distance, setDistance] = useState("2400");
  const [timeMin, setTimeMin] = useState("13");
  const [hr, setHr] = useState("140");
  const [weightKg, setWeightKg] = useState(profile.weight || "65");
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
    <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
      <Card className="order-2 md:order-1 md:col-span-2 p-6">
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
              <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" min={20} max={300} />
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
      </Card>

      <div className="order-1 md:order-2 md:col-span-3">
        <ResultPanel
          icon={Activity}
          iconColor={ICON_COLORS.vo2}
          title="VO2 Maks"
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
    <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
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

      <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
        <div className="flex items-center gap-3 mb-5">
          <IconBadge icon={HeartPulse} color={ICON_COLORS.hr} />
          <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
            Zona Detak Jantung
          </span>
        </div>
        <div className="mb-4">
          <span className="text-sm" style={{ color: MUTED }}>
            HR maks estimasi
          </span>
          <div className="font-black leading-none mt-1" style={{ fontSize: "2.4rem", color: GRAPHITE, fontVariantNumeric: "tabular-nums" }}>
            {isNaN(hrMax) ? "–" : Math.round(animatedHrMax)}
            <span className="text-base font-normal ml-2" style={{ color: MUTED }}>bpm</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {zoneRanges.map((z) => (
            <div key={z.key} className="flex items-center gap-3">
              <div className="w-2 self-stretch rounded-sm" style={{ backgroundColor: z.color }} />
              <div className="flex-1 py-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>{z.label}</span>
                  <span className="text-sm font-mono" style={{ color: MUTED }}>
                    {z.low != null ? `${z.low}–${z.high}` : "–"} bpm
                  </span>
                </div>
                <span className="text-xs" style={{ color: MUTED }}>{z.desc}</span>
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
  const [profile] = useProfile();
  const [sub, setSub] = useState("bmi");
  const [weightKg, setWeightKg] = useState(profile.weight || "65");
  const [heightCm, setHeightCm] = useState(profile.height || "170");
  const [gender, setGender] = useState(profile.gender || "male");
  const [age, setAge] = useState(profile.age || "28");
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
        <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
          <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
            <Field label="Berat badan" unit="kg">
              <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" min={20} max={300} />
            </Field>
            <Field label="Tinggi badan" unit="cm">
              <NumberInput value={heightCm} onChange={setHeightCm} placeholder="170" min={100} max={250} />
            </Field>
            <Footnote>
              Menggunakan ambang batas Asia-Pasifik (WHO), bukan ambang batas umum
              yang biasa dipakai untuk populasi Barat.
            </Footnote>
          </div>
          <div className="order-1 md:order-2 md:col-span-3">
            <ResultPanel
              icon={Ruler}
              iconColor={ICON_COLORS.body}
              title="Indeks Massa Tubuh"
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
        <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
          <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
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
              icon={Ruler}
              iconColor={ICON_COLORS.body}
              title="Komposisi Tubuh"
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
    dada: ["Bench press", "Incline dumbbell press", "Chest fly (cable/mesin)", "Dips", "Push-up beban"],
    punggung: ["Lat pulldown", "Bent-over row", "Seated cable row", "Pull-up", "Face pull"],
    bahu: ["Overhead press", "Lateral raise", "Rear delt fly", "Front raise", "Shrug"],
    kaki: ["Squat barbel", "Leg press", "Romanian deadlift", "Leg curl", "Calf raise"],
    lengan: ["Bicep curl", "Triceps pushdown", "Hammer curl", "Skull crusher", "Cable curl"],
  },
  bodyweight: {
    fullbody: ["Push-up", "Bodyweight squat", "Inverted row / meja", "Glute bridge", "Plank"],
    upper: ["Push-up", "Pike push-up", "Inverted row / meja", "Superman", "Triceps dip (kursi)"],
    lower: ["Bodyweight squat", "Lunges", "Glute bridge", "Calf raise", "Wall sit"],
    push: ["Push-up", "Pike push-up", "Diamond push-up", "Triceps dip (kursi)", "Shoulder tap"],
    pull: ["Inverted row / meja", "Superman", "Reverse snow angel", "Towel row (jika ada handuk & tiang)"],
    legs: ["Bodyweight squat", "Lunges", "Glute bridge", "Calf raise", "Wall sit"],
    dada: ["Push-up", "Diamond push-up", "Decline push-up", "Dips (kursi)", "Pike push-up"],
    punggung: ["Inverted row / meja", "Superman", "Reverse snow angel", "Towel row", "Prone Y-raise"],
    bahu: ["Pike push-up", "Shoulder tap", "Lateral raise (botol air)", "Wall handstand hold", "Arm circles beban"],
    kaki: ["Bodyweight squat", "Lunges", "Glute bridge", "Calf raise", "Wall sit"],
    lengan: ["Diamond push-up", "Chair dips", "Towel curl (isometrik)", "Plank shoulder tap", "Wall push-up rapat"],
  },
};

const SCHEME_LABELS = {
  fullbody: { name: "Full body", sessions: ["Full body"] },
  upperlower: { name: "Upper-lower", sessions: ["Upper", "Lower"] },
  ppl: { name: "Push-pull-legs", sessions: ["Push", "Pull", "Legs"] },
  bodypart: { name: "Split otot per hari", sessions: ["Dada", "Punggung", "Bahu", "Kaki", "Lengan"] },
  pplx2: { name: "Push-pull-legs 2x/minggu", sessions: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"] },
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

// ---------- TUJUAN LATIHAN ----------

const TRAINING_GOALS = {
  cutting: {
    label: "Menurunkan berat badan / lemak",
    repScheme: "12–15 repetisi",
    restTime: "45–60 detik",
    cardioMin: 25,
    note: "Istirahat singkat, kardio lebih banyak untuk membantu defisit kalori.",
  },
  muscle: {
    label: "Menambah massa otot (hipertrofi)",
    repScheme: "8–12 repetisi",
    restTime: "90 detik – 2 menit",
    cardioMin: 15,
    note: "Fokus volume & tension otot, kardio ringan sekadar menjaga kondisi jantung.",
  },
  bulking: {
    label: "Menaikkan berat badan (kekuatan & massa)",
    repScheme: "6–8 repetisi, beban berat",
    restTime: "2–3 menit",
    cardioMin: 10,
    note: "Fokus overload beban, kardio diminimalkan supaya kalori tersisa untuk pemulihan otot.",
  },
  maintenance: {
    label: "Menjaga kebugaran umum",
    repScheme: "10–12 repetisi",
    restTime: "60–90 detik",
    cardioMin: 15,
    note: "Kombinasi seimbang antara kekuatan dan daya tahan kardiovaskular.",
  },
};

const SETS_BY_LEVEL = { pemula: 3, menengah: 4, lanjutan: 5 };
const CARDIO_SESSION_KEYS = ["legs", "lower", "kaki"];

function combinedScheme(level, goalKey, isDeload) {
  const goal = TRAINING_GOALS[goalKey] || TRAINING_GOALS.maintenance;
  const sets = SETS_BY_LEVEL[level] || 3;
  const effectiveSets = isDeload ? Math.max(sets - 1, 2) : sets;
  return {
    scheme: `${effectiveSets} set x ${goal.repScheme}`,
    rest: goal.restTime,
    cardioMin: goal.cardioMin,
    note: goal.note,
  };
}

function exercisesForSession(equipKeys, sessionKey, goalKey) {
  let list = equipKeys.flatMap((eq) => EXERCISES[eq][sessionKey] || []);
  if (CARDIO_SESSION_KEYS.includes(sessionKey)) {
    const goal = TRAINING_GOALS[goalKey] || TRAINING_GOALS.maintenance;
    const cardioLabel = equipKeys.includes("gym")
      ? `Kardio: jogging treadmill ${goal.cardioMin} menit`
      : `Kardio: jogging luar ruang ${goal.cardioMin} menit`;
    list = [...list, cardioLabel];
  }
  return list;
}

const RPE_SCALE = [
  { value: 5, label: "5 · Ringan" },
  { value: 6, label: "6 · Cukup ringan" },
  { value: 7, label: "7 · Sedang-berat" },
  { value: 8, label: "8 · Berat" },
  { value: 9, label: "9 · Sangat berat" },
  { value: 10, label: "10 · Maksimal" },
];

// ---------- PROGRAM AKTIF (mesocycle, jadwal, progres) ----------

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function loadActiveProgramFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem("activeProgram");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.startDate) return null;
    // Validasi & migrasi ringan supaya data lama tidak bikin crash
    if (!Array.isArray(parsed.completedSessions)) parsed.completedSessions = [];
    if (!parsed.durationWeeks) parsed.durationWeeks = 8;
    if (!parsed.goal || !TRAINING_GOALS[parsed.goal]) parsed.goal = "muscle";
    if (!parsed.level) parsed.level = "pemula";
    if (!parsed.equipment) parsed.equipment = "gym";
    return parsed;
  } catch (e) {
    return null;
  }
}

function useActiveProgram() {
  const [program, setProgram] = useState(loadActiveProgramFromStorage);

  const persist = (p) => {
    setProgram(p);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        if (p) window.localStorage.setItem("activeProgram", JSON.stringify(p));
        else window.localStorage.removeItem("activeProgram");
      } catch (e) {}
    }
  };

  const startProgram = (config) => {
    persist({ ...config, startDate: toDateStr(new Date()), completedSessions: [] });
  };

  const resetProgram = () => {
    if (program && typeof window !== "undefined" && window.localStorage) {
      try {
        const { days } = buildSchedule(program);
        const plannedTotal = days.filter((d) => !d.rest).length;
        const raw = window.localStorage.getItem("history:programs");
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          date: toDateStr(new Date()),
          goal: program.goal,
          durationWeeks: program.durationWeeks,
          startDate: program.startDate,
          doneCount: program.completedSessions.length,
          plannedTotal,
        });
        window.localStorage.setItem("history:programs", JSON.stringify(list.slice(-20)));
      } catch (e) {}
    }
    persist(null);
  };

  const completeDay = (session) => {
    if (!program) return;
    const idx = program.completedSessions.findIndex((s) => s.date === session.date);
    let nextSessions;
    if (idx >= 0) {
      nextSessions = [...program.completedSessions];
      nextSessions[idx] = session;
    } else {
      nextSessions = [...program.completedSessions, session];
    }
    persist({ ...program, completedSessions: nextSessions });
  };

  return { program, startProgram, resetProgram, completeDay };
}

// Mesocycle: tiap blok 4 minggu, minggu ke-4 di tiap blok otomatis jadi deload
function isDeloadWeek(weekNum) {
  return weekNum % 4 === 0;
}

function buildSchedule(program) {
  const { freq, schemeMode, manualScheme, durationWeeks, dayMode, customDays } = program;
  const freqNum = Math.min(Math.max(parseInt(freq, 10) || 3, 2), 6);
  const trainingDayIdx = dayMode === "manual" && customDays && customDays.length > 0 ? customDays : FREQ_DAY_MAP[freqNum];
  const effectiveFreq = dayMode === "manual" ? trainingDayIdx.length : freqNum;
  const scheme = schemeMode === "auto" ? autoScheme(effectiveFreq) : manualScheme;
  const sessionCycle = SCHEME_LABELS[scheme].sessions;
  const start = new Date(program.startDate + "T00:00:00");
  const startWeekdayIdx = (start.getDay() + 6) % 7; // 0=Senin
  const firstMonday = new Date(start);
  firstMonday.setDate(start.getDate() - startWeekdayIdx); // Senin di minggu kalender saat program mulai
  const totalDays = durationWeeks * 7;

  const days = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const weekdayIdx = (d.getDay() + 6) % 7; // 0=Senin
    const trainIndex = trainingDayIdx.indexOf(weekdayIdx);
    const daysSinceFirstMonday = Math.round((d - firstMonday) / 86400000);
    const weekNum = Math.floor(daysSinceFirstMonday / 7) + 1; // selaras kalender Senin-Minggu
    const deload = isDeloadWeek(weekNum);
    if (trainIndex === -1) {
      days.push({ date: toDateStr(d), weekNum, deload, rest: true });
      continue;
    }
    const sessionLabel = sessionCycle[trainIndex % sessionCycle.length];
    const sessionKey = sessionLabel.toLowerCase().replace(" ", "").replace("-", "");
    const key = sessionKey === "fullbody" ? "fullbody" : sessionKey;
    days.push({ date: toDateStr(d), weekNum, deload, rest: false, label: sessionLabel, key });
  }
  return { scheme, days };
}

// 7 tanggal minggu kalender berjalan (Senin-Minggu), dipetakan ke jadwal program bila ada
function currentCalendarWeek(days, todayStr) {
  const today = new Date(todayStr + "T00:00:00");
  const idx = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - idx);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toDateStr(d);
    const match = days.find((x) => x.date === dateStr);
    return match || { date: dateStr, outOfRange: true };
  });
}

// Pratinjau pola 1 minggu (dipakai saat setup, sebelum program dimulai)
function previewWeekPattern({ dayMode, freq, customDays, scheme }) {
  const trainingDayIdx = dayMode === "manual" && customDays.length > 0 ? customDays : FREQ_DAY_MAP[freq];
  const sessionCycle = SCHEME_LABELS[scheme].sessions;
  return DAY_NAMES.map((day, i) => {
    const trainIndex = trainingDayIdx.indexOf(i);
    if (trainIndex === -1) return { day, rest: true };
    return { day, rest: false, label: sessionCycle[trainIndex % sessionCycle.length] };
  });
}

function weeklyEvaluations(program, days) {
  const todayStr = toDateStr(new Date());
  const weeks = [];
  for (let w = 1; w <= program.durationWeeks; w++) {
    const weekDays = days.filter((d) => d.weekNum === w);
    const planned = weekDays.filter((d) => !d.rest);
    const sessions = program.completedSessions.filter((s) => weekDays.some((d) => d.date === s.date));
    const rpeVals = sessions.filter((s) => s.rpe != null).map((s) => s.rpe);
    const hrVals = sessions.filter((s) => s.heartRate != null).map((s) => s.heartRate);
    const weightVals = sessions.filter((s) => s.weight != null).map((s) => s.weight);
    const lastDay = weekDays[weekDays.length - 1];
    const isPast = lastDay && lastDay.date < todayStr;
    const isCurrent = weekDays.some((d) => d.date === todayStr);
    let comment;
    if (!isPast && !isCurrent) comment = null;
    else if (planned.length === 0) comment = "Tidak ada sesi latihan terjadwal minggu ini.";
    else if (sessions.length >= planned.length) comment = "Kepatuhan penuh minggu ini — pertahankan konsistensinya.";
    else if (sessions.length === 0) comment = "Belum ada sesi tercatat minggu ini — coba jadwalkan ulang kalau memungkinkan.";
    else comment = `${planned.length - sessions.length} sesi belum tercatat — tidak apa, lanjutkan minggu berikutnya.`;
    weeks.push({
      weekNum: w,
      deload: weekDays[0] ? weekDays[0].deload : false,
      planned: planned.length,
      done: sessions.length,
      avgRpe: rpeVals.length ? (rpeVals.reduce((a, b) => a + b, 0) / rpeVals.length).toFixed(1) : null,
      avgHr: hrVals.length ? Math.round(hrVals.reduce((a, b) => a + b, 0) / hrVals.length) : null,
      lastWeight: weightVals.length ? weightVals[weightVals.length - 1] : null,
      isPast,
      isCurrent,
      comment,
    });
  }
  return weeks;
}

// ---------- KARTU SHARE DENGAN FOTO LATAR ----------

function loadImageEl(src) {
  return new Promise((resolve, reject) => {
    const imgEl = new Image();
    imgEl.onload = () => resolve(imgEl);
    imgEl.onerror = reject;
    imgEl.src = src;
  });
}

async function downloadPhotoShareCard({ photoDataUrl, headline, stats, listBlock, footer, filename }) {
  const width = 800;
  const statsRows = Math.ceil(stats.length / 2);
  const listLines = listBlock ? listBlock.length : 0;
  const contentHeight = 90 + statsRows * 96 + 20 + (listLines > 0 ? 30 + listLines * 32 : 0);
  const height = Math.max(contentHeight + 260, 900);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (photoDataUrl) {
    try {
      const imgEl = await loadImageEl(photoDataUrl);
      const scale = Math.max(width / imgEl.width, canvas.height / imgEl.height);
      const sw = width / scale;
      const sh = canvas.height / scale;
      const sx = (imgEl.width - sw) / 2;
      const sy = (imgEl.height - sh) / 2;
      ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, width, canvas.height);
    } catch (e) {
      ctx.fillStyle = INK;
      ctx.fillRect(0, 0, width, canvas.height);
    }
  } else {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, width, canvas.height);
  }

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "rgba(16,35,59,0.65)");
  grad.addColorStop(0.3, "rgba(16,35,59,0.15)");
  grad.addColorStop(0.55, "rgba(16,35,59,0.55)");
  grad.addColorStop(1, "rgba(16,35,59,0.95)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, canvas.height);

  let y = 90;
  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 48 + col * (width / 2 - 48);
    const yy = y + row * 96;
    ctx.font = "600 19px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(s.label, x, yy);
    ctx.font = "900 40px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(String(s.value), x, yy + 38);
  });

  let cursorY = y + Math.ceil(stats.length / 2) * 96 + 20;

  if (listBlock && listBlock.length > 0) {
    ctx.font = "600 18px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText("GERAKAN", 48, cursorY);
    cursorY += 30;
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    listBlock.forEach((line) => {
      ctx.fillText(`• ${line}`, 48, cursorY);
      cursorY += 32;
    });
  }

  ctx.fillStyle = TRACK;
  ctx.fillRect(48, canvas.height - 210, 56, 5);

  ctx.font = "900 36px sans-serif";
  ctx.fillStyle = "#FFFFFF";
  wrapCanvasText(ctx, headline, 48, canvas.height - 165, width - 96, 42);

  ctx.font = "19px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(footer, 48, canvas.height - 50);

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

// ---------- GRAFIK PROGRAM ----------

function WeightTrendChart({ points, target }) {
  if (points.length < 2) return null;
  const w = 560;
  const h = 140;
  const pad = 24;
  const values = points.map((p) => p.weight);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (target != null && !isNaN(target)) {
    min = Math.min(min, target);
    max = Math.max(max, target);
  }
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (p.weight - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const targetY = target != null && !isNaN(target) ? pad + (1 - (target - min) / range) * (h - pad * 2) : null;
  const latest = points[points.length - 1].weight;
  const delta = target != null && !isNaN(target) ? +(latest - target).toFixed(1) : null;

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ maxWidth: w }}>
        {targetY != null && (
          <>
            <line x1={pad} y1={targetY} x2={w - pad} y2={targetY} stroke="#1F9254" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={w - pad} y={targetY - 6} textAnchor="end" fontSize="10" fill="#1F9254">
              Target {target} kg
            </text>
          </>
        )}
        <polyline points={coords.join(" ")} fill="none" stroke={TRACK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => {
          const [x, y] = coords[i].split(",");
          return <circle key={i} cx={x} cy={y} r="3" fill={TRACK} />;
        })}
      </svg>
      <div className="flex justify-between text-xs mt-1" style={{ color: MUTED }}>
        <span>{formatDate(points[0].date)} · {points[0].weight} kg</span>
        <span>{formatDate(points[points.length - 1].date)} · {points[points.length - 1].weight} kg</span>
      </div>
      {delta != null && (
        <p className="text-xs mt-1 font-semibold" style={{ color: Math.abs(delta) < 0.5 ? "#1F9254" : MUTED }}>
          {Math.abs(delta) < 0.5
            ? "Sudah di target 🎉"
            : delta > 0
            ? `${delta} kg menuju target`
            : `${Math.abs(delta)} kg di bawah target`}
        </p>
      )}
    </div>
  );
}

function WeeklyBarChart({ weeks }) {
  const max = Math.max(...weeks.map((w) => w.planned), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 90 }}>
      {weeks.map((w, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm"
            style={{
              height: `${Math.max((w.done / max) * 70, w.done > 0 ? 6 : 2)}px`,
              backgroundColor: w.done >= w.planned && w.planned > 0 ? "#1F9254" : TRACK,
              opacity: w.planned === 0 ? 0.2 : 1,
            }}
          />
          <span className="text-[10px]" style={{ color: MUTED }}>
            M{i + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------- PROGRAM LATIHAN ----------

const DURATION_RECOMMENDATIONS = {
  cutting: { weeks: 12, note: "Fase defisit kalori umumnya efektif pada 8–16 minggu (konsensus banyak studi/tinjauan gizi olahraga); 12 minggu titik tengah yang aman sebelum disarankan jeda diet." },
  muscle: { weeks: 12, note: "Program hipertrofi umumnya butuh minimal 8 minggu untuk hasil terlihat, 12 minggu lebih ideal (NASM; block periodization hipertrofi 4–6 minggu x2)." },
  bulking: { weeks: 12, note: "Blok kekuatan & massa bergantian (hipertrofi 4–6 minggu + kekuatan 4–6 minggu) umumnya membentuk siklus 8–12 minggu (model block periodization powerlifting)." },
  maintenance: { weeks: 8, note: "Blok pemeliharaan standar — tidak perlu sepanjang program transformasi." },
};

// Rentang IMT normal Asia-Pasifik (WHO) — konsisten dengan kalkulator BMI di app ini
function idealWeightRangeBmi(heightCm) {
  const h = parseFloat(heightCm) / 100;
  if (!h || isNaN(h)) return null;
  return { min: 18.5 * h * h, max: 22.9 * h * h };
}

// Rumus Broca — rumus BB ideal yang populer dipakai di Indonesia
function idealWeightBroca(heightCm, gender) {
  const h = parseFloat(heightCm);
  if (!h || isNaN(h)) return null;
  const base = h - 100;
  return gender === "female" ? base - base * 0.15 : base - base * 0.1;
}

function IdealWeightHint({ height, weight, gender = "male" }) {
  const weightNum = weight ? parseFloat(weight) : null;

  if (!height) {
    return (
      <div className="text-xs p-3 rounded-lg mb-5" style={{ backgroundColor: "var(--c-page)", color: MUTED }}>
        Isi tinggi badan untuk melihat rekomendasi berat badan ideal di sini.
      </div>
    );
  }

  const bmiRange = idealWeightRangeBmi(height);
  const broca = idealWeightBroca(height, gender);
  if (!bmiRange) return null;

  let deltaNote = null;
  if (weightNum != null && !isNaN(weightNum)) {
    if (weightNum > bmiRange.max) {
      deltaNote = `Sekitar ${(weightNum - bmiRange.max).toFixed(1)} kg di atas rentang IMT normal.`;
    } else if (weightNum < bmiRange.min) {
      deltaNote = `Sekitar ${(bmiRange.min - weightNum).toFixed(1)} kg di bawah rentang IMT normal.`;
    } else {
      deltaNote = "Berat badan saat ini sudah berada dalam rentang IMT normal.";
    }
  }

  return (
    <div className="p-4 rounded-lg mb-5" style={{ backgroundColor: "var(--c-page)" }}>
      <div className="flex items-center gap-2 mb-2">
        <IconBadge icon={Ruler} color={ICON_COLORS.body} size={28} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
          Rekomendasi berat badan
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-xs block" style={{ color: MUTED }}>Rentang IMT normal</span>
          <span className="font-bold" style={{ color: GRAPHITE }}>
            {bmiRange.min.toFixed(1)}–{bmiRange.max.toFixed(1)} kg
          </span>
        </div>
        {broca != null && (
          <div>
            <span className="text-xs block" style={{ color: MUTED }}>Rumus Broca</span>
            <span className="font-bold" style={{ color: GRAPHITE }}>{broca.toFixed(1)} kg</span>
          </div>
        )}
      </div>
      {deltaNote && (
        <p className="text-xs mt-2" style={{ color: MUTED }}>
          {weight} kg saat ini — {deltaNote}
        </p>
      )}
      <p className="text-xs mt-2" style={{ color: MUTED }}>
        Estimasi umum berdasarkan tinggi badan saja — tidak memperhitungkan massa otot atau bentuk tubuh individu. Gunakan sebagai acuan kasar, bukan target mutlak.
      </p>
    </div>
  );
}

function DashboardPanel({ onNavigate }) {
  const [profile] = useProfile();
  const { program } = useActiveProgram();

  const features = [
    {
      icon: Gauge,
      color: ICON_COLORS.onerm,
      title: "8 Kalkulator Ilmiah",
      body: "VO2 Maks, BMI, 1RM, dan lainnya — berbasis riset sains kepelatihan terkini.",
      tab: "vo2",
    },
    {
      icon: Dumbbell,
      color: ICON_COLORS.latihan,
      title: "Program Otomatis",
      body: "Jadwal harian personal sesuai tujuan, level, dan waktu latihan Anda.",
      tab: "latihan",
    },
    {
      icon: History,
      color: ICON_COLORS.riwayat,
      title: "Progres Terekam",
      body: "Tren berat badan, kekuatan, dan kepatuhan latihan tersimpan otomatis.",
      tab: "riwayat",
    },
    {
      icon: Utensils,
      color: ICON_COLORS.nutrisi,
      title: "Target Nutrisi",
      body: "Kebutuhan kalori & makro harian, menyesuaikan tujuan latihan Anda.",
      tab: "nutrisi",
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Card className="p-6 md:p-8 mb-4" style={{ backgroundColor: INK, border: "none" }}>
        <IconBadge icon={Dumbbell} color={TRACK} size={48} />
        <h2 className="font-black text-2xl mt-4" style={{ color: CHALK }}>
          {profile.name ? `Halo, ${profile.name} 👋` : "Wujudkan Tujuan Kebugaran Anda"}
        </h2>
        <p className="text-sm mt-2 max-w-md" style={{ color: "#9AA6B2" }}>
          {program
            ? "Program latihan Anda sedang berjalan — lanjutkan untuk melihat sesi hari ini."
            : "Buat program latihan personal dalam hitungan detik — lengkap dengan jadwal otomatis, pelacakan progres, dan rekomendasi berbasis sains."}
        </p>
        <button
          onClick={() => onNavigate && onNavigate("latihan")}
          className="mt-4 px-5 py-2.5 text-sm font-semibold rounded-full"
          style={{ backgroundColor: TRACK, color: "#FFFFFF" }}
        >
          {program ? "Buka Program Latihan →" : "Mulai Buat Program →"}
        </button>
      </Card>

      <span className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: MUTED }}>
        Fitur utama
      </span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        {features.map((f) => (
          <button key={f.title} onClick={() => onNavigate && onNavigate(f.tab)} className="text-left">
            <Card className="p-4 h-full">
              <IconBadge icon={f.icon} color={f.color} size={32} />
              <div className="text-sm font-bold mt-2" style={{ color: GRAPHITE }}>
                {f.title}
              </div>
              <p className="text-xs mt-1" style={{ color: MUTED }}>
                {f.body}
              </p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProgramSetupForm({ onStart }) {
  const [profile] = useProfile();
  const [freq, setFreq] = useState("4");
  const [level, setLevel] = useState(profile.level || "pemula");
  const [goal, setGoal] = useState("muscle");
  const [equipment, setEquipment] = useState(profile.equipment || "gym");
  const [schemeMode, setSchemeMode] = useState("auto");
  const [manualScheme, setManualScheme] = useState("upperlower");
  const [durationMode, setDurationMode] = useState("auto");
  const [durationWeeksManual, setDurationWeeksManual] = useState("8");
  const [dayMode, setDayMode] = useState("auto");
  const [customDays, setCustomDays] = useState([0, 2, 4, 5]); // Senin, Rabu, Jumat, Sabtu
  const [targetWeight, setTargetWeight] = useState("");

  const durationWeeks = durationMode === "auto" ? String(DURATION_RECOMMENDATIONS[goal].weeks) : durationWeeksManual;
  const freqNum = Math.min(Math.max(parseInt(freq, 10) || 3, 2), 6);
  const effectiveFreq = dayMode === "manual" ? customDays.length : freqNum;
  const scheme = schemeMode === "auto" ? autoScheme(effectiveFreq) : manualScheme;
  const combined = combinedScheme(level, goal, false);
  const numBlocks = Math.ceil(parseInt(durationWeeks, 10) / 4);

  const bmiRangeForTarget = profile.height ? idealWeightRangeBmi(profile.height) : null;
  const suggestedTarget = bmiRangeForTarget ? ((bmiRangeForTarget.min + bmiRangeForTarget.max) / 2).toFixed(1) : "";
  const effectiveTargetWeight = targetWeight || suggestedTarget;

  const toggleDay = (idx) => {
    setCustomDays((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()));
  };

  const weekPreview = previewWeekPattern({ dayMode, freq: freqNum, customDays, scheme });

  return (
    <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
        <Field label="Tujuan latihan">
          <Select
            value={goal}
            onChange={setGoal}
            options={Object.entries(TRAINING_GOALS).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </Field>

        {(goal === "cutting" || goal === "bulking") && (
          <>
            <IdealWeightHint height={profile.height} weight={profile.weight} gender={profile.gender} />
            <Field label="Target berat badan Anda" unit="kg">
              <NumberInput
                value={targetWeight}
                onChange={setTargetWeight}
                placeholder={suggestedTarget ? `${suggestedTarget} (saran dari rentang IMT normal)` : "isi target Anda"}
              />
            </Field>
          </>
        )}

        <Field label="Penentuan hari latihan">
          <Select
            value={dayMode}
            onChange={setDayMode}
            options={[
              { value: "auto", label: "Otomatis (dipilihkan sistem)" },
              { value: "manual", label: "Saya pilih sendiri hari-harinya" },
            ]}
          />
        </Field>
        {dayMode === "auto" ? (
          <Field label="Frekuensi latihan per minggu">
            <Select
              value={freq}
              onChange={setFreq}
              options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}x per minggu` }))}
            />
          </Field>
        ) : (
          <Field label={`Pilih hari (${customDays.length} hari dipilih)`}>
            <div className="flex flex-wrap gap-2 pt-1">
              {DAY_NAMES.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-sm"
                  style={{
                    backgroundColor: customDays.includes(i) ? TRACK : "transparent",
                    color: customDays.includes(i) ? CHALK : GRAPHITE,
                    border: `1px solid ${customDays.includes(i) ? TRACK : LINE}`,
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </Field>
        )}
        <Field label="Durasi program">
          <Select
            value={durationMode}
            onChange={setDurationMode}
            options={[
              { value: "auto", label: "Otomatis sesuai tujuan (rekomendasi kajian ilmiah)" },
              { value: "manual", label: "Saya tentukan sendiri" },
            ]}
          />
        </Field>
        {durationMode === "auto" ? (
          <div className="mb-5 -mt-3 text-xs" style={{ color: MUTED }}>
            <span className="font-semibold" style={{ color: GRAPHITE }}>
              {DURATION_RECOMMENDATIONS[goal].weeks} minggu ({numBlocks} blok)
            </span>{" "}
            — {DURATION_RECOMMENDATIONS[goal].note}
          </div>
        ) : (
          <Field label="Pilih durasi (mesocycle 4 minggu)">
            <Select
              value={durationWeeksManual}
              onChange={setDurationWeeksManual}
              options={[
                { value: "4", label: "4 minggu — 1 blok" },
                { value: "8", label: "8 minggu — 2 blok" },
                { value: "12", label: "12 minggu — 3 blok" },
                { value: "16", label: "16 minggu — 4 blok" },
              ]}
            />
          </Field>
        )}
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
                { value: "bodypart", label: "Split otot per hari (Dada/Punggung/dst)" },
                { value: "pplx2", label: "Push-pull-legs 2x/minggu" },
              ]}
            />
          </Field>
        )}
        <Footnote>
          {TRAINING_GOALS[goal].note} Kardio otomatis ditambahkan di hari
          kaki/lower. Program dibagi jadi {numBlocks} blok 4 minggu — minggu
          terakhir tiap blok otomatis jadi <em>deload</em> (volume
          diturunkan) mengikuti prinsip periodisasi standar (Bompa; mesocycle
          3–6 minggu). Soal skema "Split otot per hari" vs "PPL 2x": riset
          (Schoenfeld dkk. 2016/2019) menunjukkan melatih tiap otot 2x/minggu
          umumnya memberi hasil hipertrofi sedikit lebih baik dibanding 1x/minggu
          pada volume yang sama — tapi split per hari tetap valid & banyak
          disukai karena motivasi & fokusnya. Konsultasikan dokter/fisioterapis
          bila ada cedera/kondisi medis tertentu.
        </Footnote>
      </div>

      <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
        <div className="flex items-center gap-3 mb-4">
          <IconBadge icon={Dumbbell} color={ICON_COLORS.latihan} />
          <div>
            <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>
              Jadwal mingguan · {SCHEME_LABELS[scheme].name}
            </span>
            <span className="text-xs block mt-0.5" style={{ color: MUTED }}>
              {combined.scheme} · istirahat {combined.rest}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-6">
          {weekPreview.map((d) => (
            <div key={d.day} className="flex items-center gap-3 py-1.5" style={{ borderTop: `1px solid ${LINE}` }}>
              <span className="text-xs w-16 shrink-0" style={{ color: MUTED }}>
                {d.day}
              </span>
              <span className="text-sm font-semibold" style={{ color: d.rest ? MUTED : GRAPHITE }}>
                {d.rest ? "Istirahat" : d.label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs mb-6" style={{ color: MUTED }}>
          Program {durationWeeks} minggu ({numBlocks} blok) akan dibuatkan
          jadwal harian penuh mulai hari ini mengikuti pola di atas, lengkap
          dengan minggu deload otomatis dan evaluasi tiap minggu.
        </p>
        <button
          onClick={() =>
            onStart({
              freq,
              level,
              goal,
              equipment,
              schemeMode,
              manualScheme,
              durationWeeks: parseInt(durationWeeks, 10),
              dayMode,
              customDays,
              targetWeight:
                (goal === "cutting" || goal === "bulking") && effectiveTargetWeight
                  ? parseFloat(effectiveTargetWeight)
                  : null,
            })
          }
          disabled={dayMode === "manual" && customDays.length === 0}
          className="px-5 py-3 text-sm font-semibold rounded-full disabled:opacity-40"
          style={{ backgroundColor: TRACK, color: "#FFFFFF" }}
        >
          Mulai Program Ini
        </button>
      </div>
    </div>
  );
}

function TodaySessionCard({ program, todayEntry, todayExercises, combined, onComplete, existingSession, onCancelEdit }) {
  const isEdit = !!existingSession;
  const [photoPreview, setPhotoPreview] = useState(null);
  const [duration, setDuration] = useState(isEdit && existingSession.durationMin != null ? String(existingSession.durationMin) : "60");
  const [heartRate, setHeartRate] = useState(isEdit && existingSession.heartRate != null ? String(existingSession.heartRate) : "");
  const [weight, setWeight] = useState(isEdit && existingSession.weight != null ? String(existingSession.weight) : "");
  const [rpe, setRpe] = useState(isEdit && existingSession.rpe != null ? String(existingSession.rpe) : "7");
  const [exerciseText, setExerciseText] = useState(isEdit ? existingSession.exercises.join("\n") : todayExercises.join("\n"));
  const [editingExercises, setEditingExercises] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const finalExercises = exerciseText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleComplete = async (withPhoto) => {
    const session = {
      date: todayEntry.date,
      label: todayEntry.label,
      durationMin: duration ? parseInt(duration, 10) : null,
      heartRate: heartRate ? parseInt(heartRate, 10) : null,
      weight: weight ? parseFloat(weight) : null,
      rpe: rpe ? parseInt(rpe, 10) : null,
      exercises: finalExercises,
    };
    onComplete(session);

    const stats = [
      { label: "SESI", value: todayEntry.label },
      { label: "DURASI", value: duration ? `${duration} menit` : "–" },
    ];
    if (heartRate) stats.push({ label: "DETAK JANTUNG", value: `${heartRate} bpm` });
    if (weight) stats.push({ label: "BERAT BADAN", value: `${weight} kg` });
    if (rpe) stats.push({ label: "RPE", value: `${rpe}/10` });

    await downloadPhotoShareCard({
      photoDataUrl: withPhoto ? photoPreview : null,
      headline: `Sesi ${todayEntry.label} Selesai!`,
      stats,
      listBlock: finalExercises,
      footer: `Minggu ${todayEntry.weekNum} dari ${program.durationWeeks}${todayEntry.deload ? " · Deload" : ""} · Jejak`,
      filename: `sesi-${todayEntry.label}-${todayEntry.date}`,
    });
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 2500);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm uppercase tracking-wide" style={{ color: MUTED }}>
          {isEdit ? "Edit sesi" : "Hari ini"} · Minggu {todayEntry.weekNum}
          {todayEntry.deload ? " · Deload" : ""}
        </span>
        {isEdit && onCancelEdit && (
          <button onClick={onCancelEdit} className="text-xs" style={{ color: MUTED }}>
            Batal
          </button>
        )}
      </div>
      <div className="font-black text-2xl mb-2" style={{ color: GRAPHITE }}>
        {todayEntry.label}
      </div>
      <div className="text-xs mb-3" style={{ color: MUTED }}>
        {combined.scheme} · istirahat {combined.rest}
      </div>

      {editingExercises ? (
        <div className="mb-3">
          <textarea
            value={exerciseText}
            onChange={(e) => setExerciseText(e.target.value)}
            rows={Math.max(finalExercises.length, 4)}
            className="w-full text-sm p-2 rounded-sm"
            style={{ backgroundColor: "var(--c-page)", color: GRAPHITE, border: `1px solid ${LINE}` }}
          />
          <button onClick={() => setEditingExercises(false)} className="text-xs mt-1" style={{ color: "#1F9254" }}>
            Selesai edit
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <div className="text-xs mb-1" style={{ color: MUTED }}>
            {finalExercises.join(" · ")}
          </div>
          <button onClick={() => setEditingExercises(true)} className="text-xs" style={{ color: MUTED }}>
            Sesuaikan gerakan/alat yang tersedia
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Durasi latihan" unit="menit">
          <NumberInput value={duration} onChange={setDuration} placeholder="60" />
        </Field>
        <Field label="Detak jantung (opsional)" unit="bpm">
          <NumberInput value={heartRate} onChange={setHeartRate} placeholder="dari smartwatch" />
        </Field>
        <Field label="Berat badan (opsional)" unit="kg">
          <NumberInput value={weight} onChange={setWeight} placeholder="opsional" min={20} max={300} />
        </Field>
        <Field label="RPE (opsional)">
          <Select value={rpe} onChange={setRpe} options={RPE_SCALE.map((r) => ({ value: String(r.value), label: r.label }))} />
        </Field>
      </div>

      {photoPreview && <img src={photoPreview} alt="preview" className="w-24 h-24 object-cover rounded-sm mb-3" />}
      <div className="flex flex-wrap gap-3">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button
          onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
          className="flex items-center gap-1.5 text-xs font-semibold export-btn"
          style={{ color: MUTED }}
        >
          <Camera size={14} /> Ambil foto
        </button>
        <button
          onClick={() => galleryInputRef.current && galleryInputRef.current.click()}
          className="flex items-center gap-1.5 text-xs font-semibold export-btn"
          style={{ color: MUTED }}
        >
          <Download size={14} /> Pilih dari galeri
        </button>
        <button
          onClick={() => handleComplete(!!photoPreview)}
          className="flex items-center gap-1.5 text-xs font-semibold export-btn"
          style={{ color: justCompleted ? "#1F9254" : TRACK }}
        >
          <CheckCircle2 size={14} />
          {justCompleted ? "Tersimpan & kartu diunduh" : isEdit ? "Simpan perubahan & bagikan ulang" : "Tandai selesai & bagikan"}
        </button>
      </div>
    </div>
  );
}

function ProgramSummary({ program, days }) {
  const trainingDays = days.filter((d) => !d.rest);
  const sessions = program.completedSessions;
  const doneCount = sessions.length;
  const adherence = trainingDays.length > 0 ? Math.round((doneCount / trainingDays.length) * 100) : 0;
  const weights = sessions.filter((s) => s.weight != null).map((s) => ({ date: s.date, weight: s.weight }));
  const weightChange = weights.length >= 2 ? +(weights[weights.length - 1].weight - weights[0].weight).toFixed(1) : null;
  const hrValues = sessions.filter((s) => s.heartRate != null).map((s) => s.heartRate);
  const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : null;
  const rpeValues = sessions.filter((s) => s.rpe != null).map((s) => s.rpe);
  const avgRpe = rpeValues.length > 0 ? (rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length).toFixed(1) : null;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMin || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="p-6 md:p-8" style={{ backgroundColor: "var(--c-surface)" }}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
            Ringkasan program
          </span>
          <div className="font-black text-2xl mt-1" style={{ color: GRAPHITE }}>
            Kepatuhan latihan
          </div>
        </div>
        <CircularProgress pct={adherence} color={adherence >= 80 ? "#1F9254" : adherence >= 50 ? "#B7791F" : TRACK} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs" style={{ color: MUTED }}>Sesi selesai</span>
          <div className="text-xl font-bold" style={{ color: GRAPHITE }}>{doneCount} / {trainingDays.length}</div>
        </div>
        <div>
          <span className="text-xs" style={{ color: MUTED }}>Total waktu latihan</span>
          <div className="text-xl font-bold" style={{ color: GRAPHITE }}>{totalHours} jam</div>
        </div>
        {weightChange != null && (
          <div>
            <span className="text-xs" style={{ color: MUTED }}>Perubahan berat badan</span>
            <div className="text-xl font-bold" style={{ color: weightChange < 0 ? "#1F9254" : GRAPHITE }}>
              {weightChange > 0 ? "+" : ""}{weightChange} kg
            </div>
          </div>
        )}
        {avgHr != null && (
          <div>
            <span className="text-xs" style={{ color: MUTED }}>Rata-rata detak jantung</span>
            <div className="text-xl font-bold" style={{ color: GRAPHITE }}>{avgHr} bpm</div>
          </div>
        )}
        {avgRpe != null && (
          <div>
            <span className="text-xs" style={{ color: MUTED }}>Rata-rata RPE</span>
            <div className="text-xl font-bold" style={{ color: GRAPHITE }}>{avgRpe}/10</div>
          </div>
        )}
      </div>
      {weights.length >= 2 && (
        <div className="mt-4">
          <span className="text-xs" style={{ color: MUTED }}>Tren berat badan</span>
          <div className="mt-2">
            <WeightTrendChart points={weights} target={program.targetWeight} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramDashboard({ program, onComplete, onReset }) {
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingPreviewExercises, setEditingPreviewExercises] = useState(false);
  const [exerciseOverride, setExerciseOverride] = useState(null); // { date, list: [] }
  const [profile] = useProfile();
  const { entries: bmiEntries } = useHistory("history:bmi");
  const { entries: rmEntries } = useHistory("history:1rm");

  const { days } = useMemo(() => buildSchedule(program), [program]);
  const equipKeys = program.equipment === "gym" ? ["gym"] : ["bodyweight"];
  const todayStr = toDateStr(new Date());
  const activeDate = selectedDate || todayStr;
  const activeEntry = days.find((d) => d.date === activeDate);
  const todayEntry = days.find((d) => d.date === todayStr);
  const todayWeekNum = todayEntry ? todayEntry.weekNum : null;
  const activeDone = program.completedSessions.find((s) => s.date === activeDate);
  const programEnded = todayStr > days[days.length - 1].date;
  const isFuture = activeDate > todayStr;

  useEffect(() => {
    setEditingPreviewExercises(false);
  }, [activeDate]);

  const trainingDays = days.filter((d) => !d.rest);
  const doneCount = program.completedSessions.length;
  const progressPct = trainingDays.length > 0 ? Math.round((doneCount / trainingDays.length) * 100) : 0;

  const activeExercises = activeEntry && !activeEntry.rest ? exercisesForSession(equipKeys, activeEntry.key, program.goal) : [];
  const displayExercises =
    exerciseOverride && exerciseOverride.date === activeDate ? exerciseOverride.list : activeExercises;
  const combined = activeEntry ? combinedScheme(program.level, program.goal, activeEntry.deload) : null;

  const weeksGrouped = [];
  for (let w = 1; w <= program.durationWeeks; w++) {
    weeksGrouped.push(days.filter((d) => d.weekNum === w));
  }
  const weeklyBars = weeksGrouped.map((week) => ({
    planned: week.filter((d) => !d.rest).length,
    done: week.filter((d) => !d.rest && program.completedSessions.some((s) => s.date === d.date)).length,
  }));
  const currentWeekPlanned = weeksGrouped[(todayWeekNum || 1) - 1]
    ? weeksGrouped[(todayWeekNum || 1) - 1].filter((d) => !d.rest).length
    : 0;

  const schemeName =
    SCHEME_LABELS[
      program.schemeMode === "auto"
        ? autoScheme(program.dayMode === "manual" ? (program.customDays || []).length : Math.min(Math.max(parseInt(program.freq, 10) || 3, 2), 6))
        : program.manualScheme
    ].name;

  // Sesi berikutnya (dipakai saat hari ini istirahat / program belum mulai hari ini)
  const nextSession = days.find((d) => d.date >= todayStr && !d.rest && !program.completedSessions.some((s) => s.date === d.date));

  // Jadwal Minggu Ini: kalau minggu kalender berjalan sudah tuntas semua, otomatis
  // tampilkan minggu yang berisi sesi berikutnya supaya tetap bisa dipilih/diklik.
  const thisCalendarWeek = currentCalendarWeek(days, todayStr);
  const thisWeekFullyHandled = thisCalendarWeek.every(
    (d) => d.outOfRange || d.rest || program.completedSessions.some((s) => s.date === d.date)
  );
  const scheduleWeek =
    thisWeekFullyHandled && nextSession && nextSession.date !== todayStr
      ? currentCalendarWeek(days, nextSession.date)
      : thisCalendarWeek;
  const scheduleWeekLabel =
    scheduleWeek !== thisCalendarWeek && scheduleWeek[0] && !scheduleWeek[0].outOfRange
      ? `Minggu ${scheduleWeek.find((d) => !d.outOfRange)?.weekNum ?? ""}`
      : null;

  const weights = program.completedSessions.filter((s) => s.weight != null).map((s) => ({ date: s.date, weight: s.weight }));
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.weight || null;
  const latestBmi = bmiEntries.length > 0 ? bmiEntries[bmiEntries.length - 1] : null;
  const latestRm = rmEntries.length > 0 ? rmEntries[rmEntries.length - 1] : null;

  const recentActivity = [...program.completedSessions].reverse().slice(0, 4);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4">
      {/* Baris statistik atas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-3">
          <IconBadge icon={Dumbbell} color={ICON_COLORS.latihan} />
          <div className="min-w-0">
            <span className="text-xs" style={{ color: MUTED }}>Program aktif</span>
            <div className="text-sm font-bold truncate" style={{ color: GRAPHITE }}>
              {TRAINING_GOALS[program.goal].label.split(" ")[0]} · {schemeName}
            </div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-3">
          <IconBadge icon={Dumbbell} color={ICON_COLORS.hidrasi} />
          <div>
            <span className="text-xs" style={{ color: MUTED }}>Minggu</span>
            <div className="text-lg font-black" style={{ color: GRAPHITE }}>
              {todayWeekNum || "–"} <span className="text-sm font-normal" style={{ color: MUTED }}>dari {program.durationWeeks}</span>
            </div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-3">
          <IconBadge icon={CheckCircle2} color={ICON_COLORS.nutrisi} />
          <div>
            <span className="text-xs" style={{ color: MUTED }}>Sesi selesai</span>
            <div className="text-lg font-black" style={{ color: GRAPHITE }}>
              {doneCount}/{trainingDays.length}
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs" style={{ color: MUTED }}>Progres program</span>
          <div className="text-lg font-black mt-0.5" style={{ color: GRAPHITE }}>{progressPct}%</div>
          <div className="w-full h-1.5 mt-2 rounded-full" style={{ backgroundColor: "var(--c-line)" }}>
            <div className="h-1.5 rounded-full" style={{ width: `${progressPct}%`, backgroundColor: TRACK }} />
          </div>
        </Card>
      </div>

      {/* Latihan Hari Ini + Jadwal Minggu Ini */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="md:col-span-3 p-6">
          {programEnded && activeDate === todayStr ? (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: TRACK }}>Program selesai</span>
              <div className="font-black text-xl mt-1" style={{ color: GRAPHITE }}>
                Program {program.durationWeeks} minggu sudah tuntas
              </div>
              <p className="text-sm mt-2" style={{ color: MUTED }}>
                Kerja bagus! Cek ringkasan lengkap lalu mulai program baru kalau siap lanjut.
              </p>
              <button onClick={onReset} className="mt-4 px-4 py-2.5 text-sm font-semibold rounded-full" style={{ backgroundColor: TRACK, color: "#FFFFFF" }}>
                Mulai Program Baru
              </button>
            </div>
          ) : !activeEntry ? (
            <p className="text-sm" style={{ color: MUTED }}>Tanggal ini di luar rentang program.</p>
          ) : activeEntry.rest ? (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                {formatDayHeader(activeEntry.date).toUpperCase()} · MINGGU {activeEntry.weekNum}
              </span>
              <div className="font-black text-2xl mt-1" style={{ color: GRAPHITE }}>Hari Istirahat 💤</div>
              <p className="text-sm mt-2" style={{ color: MUTED }}>
                {activeDate === todayStr
                  ? "Manfaatkan hari ini untuk pemulihan. Tidur cukup dan asupan protein tetap membantu pertumbuhan otot."
                  : "Hari ini terjadwal istirahat."}
              </p>
              {nextSession && (
                <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${LINE}` }}>
                  <div>
                    <span className="text-xs" style={{ color: MUTED }}>Sesi berikutnya</span>
                    <div className="text-sm font-semibold" style={{ color: GRAPHITE }}>
                      {formatDayHeader(nextSession.date)} · {nextSession.label}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (openSession || editMode) ? (
            <TodaySessionCard
              program={program}
              todayEntry={activeEntry}
              todayExercises={displayExercises}
              combined={combined}
              onComplete={(session) => {
                onComplete(session);
                setEditMode(false);
                setOpenSession(false);
              }}
              existingSession={editMode ? activeDone : null}
              onCancelEdit={() => {
                setEditMode(false);
                setOpenSession(false);
              }}
            />
          ) : activeDone ? (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                {formatDayHeader(activeEntry.date).toUpperCase()} · MINGGU {activeEntry.weekNum}
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold mt-1 mb-2" style={{ color: "#1F9254" }}>
                <CheckCircle2 size={18} /> Sesi {activeEntry.label} sudah selesai
              </div>
              <div className="text-xs mb-4" style={{ color: MUTED }}>
                {activeDone.durationMin != null && <span>Durasi: {activeDone.durationMin} menit · </span>}
                {activeDone.heartRate != null && <span>HR: {activeDone.heartRate} bpm · </span>}
                {activeDone.weight != null && <span>BB: {activeDone.weight} kg · </span>}
                {activeDone.rpe != null && <span>RPE: {activeDone.rpe}/10</span>}
              </div>
              <button onClick={() => setEditMode(true)} className="text-sm font-semibold" style={{ color: TRACK }}>
                Edit foto & data, bagikan ulang
              </button>
              {nextSession && nextSession.date !== activeDate && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
                  <span className="text-xs" style={{ color: MUTED }}>Sesi berikutnya</span>
                  <div className="text-sm font-semibold" style={{ color: GRAPHITE }}>
                    {formatDayHeader(nextSession.date)} · {nextSession.label}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: TRACK }}>
                {formatDayHeader(activeEntry.date).toUpperCase()} · MINGGU {activeEntry.weekNum}
              </span>
              <div className="font-black text-2xl mt-1" style={{ color: GRAPHITE }}>{activeEntry.label}</div>
              <div className="flex items-center gap-1.5 text-sm mt-2" style={{ color: MUTED }}>
                <span>{combined.scheme}</span>
                <span>·</span>
                <span>istirahat {combined.rest}</span>
              </div>

              {editingPreviewExercises ? (
                <div className="mt-4">
                  <textarea
                    value={displayExercises.join("\n")}
                    onChange={(e) =>
                      setExerciseOverride({
                        date: activeDate,
                        list: e.target.value.split("\n"),
                      })
                    }
                    rows={Math.max(displayExercises.length, 4)}
                    className="w-full text-sm p-2 rounded-lg"
                    style={{ backgroundColor: "var(--c-page)", color: GRAPHITE, border: `1px solid ${LINE}` }}
                  />
                  <button
                    onClick={() => {
                      setExerciseOverride((prev) =>
                        prev
                          ? { date: activeDate, list: prev.list.map((s) => s.trim()).filter(Boolean) }
                          : prev
                      );
                      setEditingPreviewExercises(false);
                    }}
                    className="text-xs font-semibold mt-1"
                    style={{ color: "#1F9254" }}
                  >
                    Selesai edit
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-4">
                  {displayExercises.map((ex, i) => {
                    const cardioMatch = ex.match(/^(Kardio: .+?\s)(\d+)(\smenit)$/);
                    return (
                      <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}` }}>
                        <span
                          className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0"
                          style={{ backgroundColor: "var(--c-page)", color: MUTED }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm flex-1" style={{ color: GRAPHITE }}>
                          {cardioMatch ? cardioMatch[1].trim() : ex}
                        </span>
                        {cardioMatch ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              value={cardioMatch[2]}
                              onChange={(e) => {
                                const newMin = e.target.value.replace(/[^0-9]/g, "") || "0";
                                const newList = [...displayExercises];
                                newList[i] = `${cardioMatch[1]}${newMin}${cardioMatch[3]}`;
                                setExerciseOverride({ date: activeDate, list: newList });
                              }}
                              className="w-12 text-xs text-right bg-transparent border-b outline-none"
                              style={{ borderColor: LINE, color: GRAPHITE }}
                            />
                            <span className="text-xs" style={{ color: MUTED }}>menit</span>
                          </div>
                        ) : (
                          <span className="text-xs shrink-0" style={{ color: MUTED }}>
                            {combined.scheme}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {showDetail && (
                <p className="text-xs mt-3 p-3 rounded-lg" style={{ backgroundColor: "var(--c-page)", color: MUTED }}>
                  {combined.note}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => setOpenSession(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full"
                  style={{ backgroundColor: TRACK, color: "#FFFFFF" }}
                >
                  ▶ {activeDate === todayStr ? "Lanjutkan Latihan" : isFuture ? "Mulai Lebih Awal" : "Catat Sesi Ini"}
                </button>
                {!editingPreviewExercises && (
                  <button
                    onClick={() => setEditingPreviewExercises(true)}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full"
                    style={{ backgroundColor: "var(--c-page)", color: GRAPHITE }}
                  >
                    Sesuaikan gerakan/alat
                  </button>
                )}
                <button
                  onClick={() => setShowDetail((v) => !v)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-full"
                  style={{ backgroundColor: "var(--c-page)", color: GRAPHITE }}
                >
                  {showDetail ? "Sembunyikan detail" : "Lihat Detail"}
                </button>
                {activeDate !== todayStr && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-5 py-2.5 text-sm font-semibold rounded-full"
                    style={{ color: MUTED }}
                  >
                    Kembali ke hari ini
                  </button>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card className="md:col-span-2 p-6">
          <div className="flex items-baseline justify-between">
            <span className="font-black text-lg" style={{ color: GRAPHITE }}>
              {scheduleWeekLabel ? "Jadwal Minggu Berikutnya" : "Jadwal Minggu Ini"}
            </span>
            {scheduleWeekLabel && (
              <span className="text-xs font-semibold" style={{ color: TRACK }}>{scheduleWeekLabel}</span>
            )}
          </div>
          {scheduleWeekLabel && (
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              Minggu ini sudah tuntas — ini jadwal minggu berikutnya.
            </p>
          )}
          <div className="flex flex-col gap-1 mt-3">
            {scheduleWeek.map((d) => {
              if (d.outOfRange) {
                const dayIdx = (new Date(d.date + "T00:00:00").getDay() + 6) % 7;
                return (
                  <div key={d.date} className="flex items-center justify-between py-2 px-2 opacity-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-9" style={{ color: MUTED }}>
                        {DAY_NAMES[dayIdx].slice(0, 3).toUpperCase()}
                      </span>
                      <span className="text-sm" style={{ color: MUTED }}>
                        {d.date < program.startDate ? "Sebelum program mulai" : "Di luar program"}
                      </span>
                    </div>
                  </div>
                );
              }
              const isDone = program.completedSessions.some((s) => s.date === d.date);
              const isToday = d.date === todayStr;
              const isSelected = d.date === activeDate;
              const dayIdx = (new Date(d.date + "T00:00:00").getDay() + 6) % 7;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date === todayStr ? null : d.date)}
                  className="flex items-center justify-between py-2 px-2 rounded-lg text-left"
                  style={{ backgroundColor: isSelected ? "rgba(193,68,14,0.1)" : isToday ? "rgba(193,68,14,0.05)" : "transparent" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold w-9" style={{ color: isToday ? TRACK : MUTED }}>
                      {DAY_NAMES[dayIdx].slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium" style={{ color: d.rest ? MUTED : GRAPHITE }}>
                      {d.rest ? "Istirahat" : d.label}
                    </span>
                  </div>
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#1F9254" }}>
                      <CheckCircle2 size={13} /> Selesai
                    </span>
                  ) : isToday ? (
                    <span className="text-xs font-semibold" style={{ color: TRACK }}>Hari Ini</span>
                  ) : d.rest ? (
                    <span className="text-xs" style={{ color: MUTED }}>Istirahat</span>
                  ) : (
                    <span className="text-xs" style={{ color: MUTED }}>Belum mulai</span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Progress Program + Performa & Perkembangan */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="md:col-span-2 p-6">
          <span className="font-black text-lg" style={{ color: GRAPHITE }}>Progress Program</span>
          <div className="flex justify-between items-baseline mt-1 mb-3">
            <span className="text-sm" style={{ color: MUTED }}>Minggu {todayWeekNum} dari {program.durationWeeks}</span>
            <span className="text-sm font-bold" style={{ color: GRAPHITE }}>{progressPct}%</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {Array.from({ length: program.durationWeeks }, (_, i) => i + 1).map((w) => (
              <div
                key={w}
                className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold"
                style={{
                  backgroundColor: w === todayWeekNum ? TRACK : "var(--c-page)",
                  color: w === todayWeekNum ? "#FFFFFF" : MUTED,
                }}
              >
                {w}
              </div>
            ))}
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-xl font-black" style={{ color: GRAPHITE }}>{doneCount}</div>
              <span className="text-xs" style={{ color: MUTED }}>sesi selesai</span>
            </div>
            <div>
              <div className="text-xl font-black" style={{ color: GRAPHITE }}>{currentWeekPlanned}</div>
              <span className="text-xs" style={{ color: MUTED }}>sesi/minggu</span>
            </div>
          </div>
          <button
            onClick={() => setShowFullSchedule((v) => !v)}
            className="text-sm font-semibold mt-4"
            style={{ color: TRACK }}
          >
            {showFullSchedule ? "Sembunyikan jadwal lengkap" : "Lihat Program Lengkap →"}
          </button>
          <button onClick={onReset} className="flex items-center gap-1.5 text-xs mt-3" style={{ color: MUTED }}>
            <RotateCcw size={12} /> Reset / ganti program
          </button>
        </Card>

        <Card className="md:col-span-3 p-6">
          <span className="font-black text-lg" style={{ color: GRAPHITE }}>Performa & Perkembangan</span>
          <div className="grid md:grid-cols-5 gap-4 mt-3">
            <div className="md:col-span-3">
              {weights.length >= 2 ? (
                <>
                  <span className="text-xs" style={{ color: MUTED }}>Tren berat badan (kg)</span>
                  <div className="mt-2">
                    <WeightTrendChart points={weights} target={program.targetWeight} />
                  </div>
                </>
              ) : (
                <p className="text-xs" style={{ color: MUTED }}>
                  Catat berat badan saat menandai sesi selesai untuk melihat tren di sini.
                </p>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col gap-3">
              {program.targetWeight != null && (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--c-page)" }}>
                  <div>
                    <span className="text-xs" style={{ color: MUTED }}>Target Berat Badan</span>
                    <div className="text-lg font-black" style={{ color: "#1F9254" }}>{program.targetWeight} <span className="text-xs font-normal">kg</span></div>
                  </div>
                  <IconBadge icon={Ruler} color="#1F9254" size={32} />
                </div>
              )}
              {latestWeight && (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--c-page)" }}>
                  <div>
                    <span className="text-xs" style={{ color: MUTED }}>Berat Badan</span>
                    <div className="text-lg font-black" style={{ color: GRAPHITE }}>{latestWeight} <span className="text-xs font-normal">kg</span></div>
                  </div>
                  <IconBadge icon={Ruler} color={ICON_COLORS.body} size={32} />
                </div>
              )}
              {latestBmi && (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--c-page)" }}>
                  <div>
                    <span className="text-xs" style={{ color: MUTED }}>IMT</span>
                    <div className="text-lg font-black" style={{ color: GRAPHITE }}>{latestBmi.value}</div>
                  </div>
                  <Pill tone={latestBmi.category === "Normal" ? "good" : "neutral"}>{latestBmi.category || "–"}</Pill>
                </div>
              )}
              {latestRm && (
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--c-page)" }}>
                  <div>
                    <span className="text-xs" style={{ color: MUTED }}>1RM {latestRm.exercise || "terakhir"}</span>
                    <div className="text-lg font-black" style={{ color: GRAPHITE }}>{latestRm.value} <span className="text-xs font-normal">kg</span></div>
                  </div>
                  <IconBadge icon={Gauge} color={ICON_COLORS.onerm} size={32} />
                </div>
              )}
              {!program.targetWeight && !latestWeight && !latestBmi && !latestRm && (
                <p className="text-xs" style={{ color: MUTED }}>
                  Data BMI/1RM akan muncul di sini setelah Anda memakai kalkulator terkait.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {showFullSchedule && (
        <Card className="p-6">
          <span className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>
            Jadwal lengkap {program.durationWeeks} minggu
          </span>
          <div className="flex flex-col gap-1 mt-3 max-h-96 overflow-y-auto">
            {days.map((d) => {
              const isDone = program.completedSessions.some((s) => s.date === d.date);
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className="flex items-start gap-3 py-1.5 text-xs w-full text-left"
                  style={{ borderTop: `1px solid ${LINE}` }}
                >
                  <span style={{ color: d.date === todayStr ? TRACK : MUTED, width: 90, flexShrink: 0 }}>
                    {formatDate(d.date)}
                    {d.deload ? " · DL" : ""}
                  </span>
                  {d.rest ? (
                    <span style={{ color: MUTED }}>Istirahat</span>
                  ) : (
                    <span style={{ color: isDone ? "#1F9254" : GRAPHITE }}>
                      {d.label}
                      {isDone ? " ✓" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Aktivitas Terakhir */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="font-black text-lg" style={{ color: GRAPHITE }}>Aktivitas Terakhir</span>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-xs mt-2" style={{ color: MUTED }}>Belum ada sesi yang diselesaikan.</p>
        ) : (
          <div className="flex flex-col gap-1 mt-2">
            {recentActivity.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <IconBadge icon={Dumbbell} color={ICON_COLORS.latihan} size={34} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: GRAPHITE }}>{s.label} Workout</div>
                    <div className="text-xs truncate" style={{ color: MUTED }}>{(s.exercises || []).slice(0, 3).join(", ")}{(s.exercises || []).length > 3 ? ", dll." : ""}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs" style={{ color: MUTED }}>{formatDate(s.date)}</div>
                  {s.durationMin != null && <div className="text-xs" style={{ color: MUTED }}>{s.durationMin} menit</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedDate && selectedDate !== todayStr && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-3 z-30" style={{ backgroundColor: INK, color: CHALK }}>
          Melihat {formatDate(selectedDate)}
          <button onClick={() => setSelectedDate(null)} style={{ color: TRACK }}>Kembali ke hari ini</button>
        </div>
      )}
    </div>
  );
}

function LatihanPanel() {
  const { program, startProgram, resetProgram, completeDay } = useActiveProgram();
  const [confirmReset, setConfirmReset] = useState(false);

  const requestReset = () => setConfirmReset(true);
  const confirmResetNow = () => {
    resetProgram();
    setConfirmReset(false);
  };

  if (!program) {
    return <ProgramSetupForm onStart={startProgram} />;
  }

  return (
    <div>
      <div className="flex gap-2 px-4 md:px-6 pt-4">
        <button
          className="px-4 py-2 text-sm font-semibold rounded-full"
          style={{ backgroundColor: TRACK, color: "#FFFFFF" }}
        >
          Program Aktif
        </button>
        <button
          onClick={requestReset}
          className="px-4 py-2 text-sm font-semibold rounded-full"
          style={{ backgroundColor: "var(--c-surface)", color: GRAPHITE, border: `1px solid ${LINE}` }}
        >
          Buat Program Baru
        </button>
      </div>

      {confirmReset && (
        <div
          className="mx-4 md:mx-6 mt-3 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ backgroundColor: "#FDE8E7", border: "1px solid #F5C2BF" }}
        >
          <span className="text-sm" style={{ color: "#7A2622" }}>
            Program aktif beserta progresnya akan dihapus. Lanjutkan buat program baru?
          </span>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={confirmResetNow}
              className="px-3 py-1.5 text-xs font-semibold rounded-full"
              style={{ backgroundColor: "#C0392B", color: "#FFFFFF" }}
            >
              Ya, buat baru
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full"
              style={{ backgroundColor: "#FFFFFF", color: GRAPHITE, border: `1px solid ${LINE}` }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <ProgramDashboard program={program} onComplete={completeDay} onReset={requestReset} />
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
  const [profile] = useProfile();
  const [gender, setGender] = useState(profile.gender || "male");
  const [age, setAge] = useState(profile.age || "28");
  const [weightKg, setWeightKg] = useState(profile.weight || "65");
  const [heightCm, setHeightCm] = useState(profile.height || "170");
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
    calories =
      goal === "cutting" ? tdee - 500 : goal === "bulking" ? tdee + 300 : goal === "muscle" ? tdee + 150 : tdee;
    calories = Math.max(calories, 1200);

    const proteinFactor = goal === "cutting" ? 2.2 : goal === "bulking" ? 1.8 : goal === "muscle" ? 2.2 : 2.0;
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
      <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
        <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
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
            <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" min={20} max={300} />
          </Field>
          <Field label="Tinggi badan" unit="cm">
            <NumberInput value={heightCm} onChange={setHeightCm} placeholder="170" min={100} max={250} />
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
                { value: "muscle", label: "Menambah massa otot (lean bulk)" },
                { value: "maintenance", label: "Menjaga berat (maintenance)" },
                { value: "bulking", label: "Menambah massa (bulking)" },
              ]}
            />
          </Field>

          {(goal === "cutting" || goal === "bulking") && (
            <IdealWeightHint height={heightCm} weight={weightKg} gender={gender} />
          )}

          <Footnote>
            Estimasi berdasarkan rumus Mifflin-St Jeor dan tujuan umum. Bukan
            pengganti konsultasi ahli gizi, terutama bagi pengguna dengan
            kondisi kesehatan khusus (diabetes, hipertensi, gangguan ginjal, dll).
          </Footnote>
        </div>

        <div className="order-1 md:order-2 md:col-span-3 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
          <div className="flex items-center gap-3 mb-5">
            <IconBadge icon={Utensils} color={ICON_COLORS.nutrisi} />
            <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
              Target Nutrisi
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-black leading-none" style={{ fontSize: "3rem", color: GRAPHITE, fontVariantNumeric: "tabular-nums" }}>
              {calories != null ? Math.round(animCalories) : "–"}
            </span>
            <span className="text-sm" style={{ color: MUTED }}>kkal/hari</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Protein", value: proteinG, animated: animProtein, color: TURF },
              { label: "Lemak", value: fatG, animated: animFat, color: GOLD },
              { label: "Karbohidrat", value: carbG, animated: animCarb, color: TRACK },
            ].map((m) => (
              <div key={m.label}>
                <div className="w-full h-1 mb-2 macro-bar" style={{ backgroundColor: m.color }} />
                <div className="text-sm font-semibold" style={{ color: GRAPHITE, fontVariantNumeric: "tabular-nums" }}>
                  {m.value != null ? `${Math.round(m.animated)} g` : "–"}
                </div>
                <div className="text-xs" style={{ color: MUTED }}>{m.label}</div>
              </div>
            ))}
          </div>
          {calories != null && (
            <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
              <button
                onClick={handleSaveCalories}
                className="flex items-center gap-1.5 text-xs font-semibold export-btn"
                style={{ color: savedCalories ? "#1F9254" : MUTED }}
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
                    badge:
                      goal === "cutting"
                        ? "Cutting"
                        : goal === "bulking"
                        ? "Bulking"
                        : goal === "muscle"
                        ? "Lean Bulk"
                        : "Maintenance",
                    badgeColor: "#9FCBA6",
                    stats: [
                      { label: "Protein", value: proteinG != null ? `${Math.round(proteinG)} g` : "–" },
                      { label: "Karbohidrat", value: carbG != null ? `${Math.round(carbG)} g` : "–" },
                    ],
                    filename: "Target Kalori Harian",
                  })
                }
                className="flex items-center gap-1.5 text-xs font-semibold export-btn"
                style={{ color: MUTED }}
              >
                <Download size={14} />
                Bagikan kartu
              </button>
            </div>
          )}
        </div>
      </div>

      {template && (
        <div className="mx-4 md:mx-6 mb-4 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
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
    <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
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
          icon={Gauge}
          iconColor={ICON_COLORS.onerm}
          title="Estimasi 1RM"
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
              <span className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>
                Panduan beban latihan (% dari 1RM)
              </span>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 mt-2">
                {RM_PERCENT_TABLE.map((row) => (
                  <div key={row.pct} className="flex items-baseline justify-between text-xs">
                    <span style={{ color: MUTED }}>{row.pct}%</span>
                    <span style={{ color: GRAPHITE, fontVariantNumeric: "tabular-nums" }}>
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
  const [profile] = useProfile();
  const [weightKg, setWeightKg] = useState(profile.weight || "65");
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
    <div className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-5 gap-4">
      <div className="order-2 md:order-1 md:col-span-2 p-6 md:p-8 rounded-xl" style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "0 1px 3px rgba(16,24,40,0.04)" }}>
        <Field label="Berat badan" unit="kg">
          <NumberInput value={weightKg} onChange={setWeightKg} placeholder="65" min={20} max={300} />
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
          icon={Droplets}
          iconColor={ICON_COLORS.hidrasi}
          title="Kebutuhan Cairan"
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
                <span style={{ color: MUTED }}>Sebelum latihan (~2–3 jam sebelum)</span>
                <span style={{ color: GRAPHITE }}>{beforeMl != null ? Math.round(beforeMl) : "–"} ml</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: MUTED }}>Saat latihan (tiap 15 menit)</span>
                <span style={{ color: GRAPHITE }}>
                  {duringPer15Min != null ? Math.round(duringPer15Min) : "–"} ml
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: MUTED }}>Setelah latihan (rehidrasi)</span>
                <span style={{ color: GRAPHITE }}>
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

function SessionHistorySection({ onNavigate }) {
  const { program } = useActiveProgram();
  return (
    <div className="py-6" style={{ borderBottom: `1px solid ${LINE}` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>Program latihan</span>
        {program && onNavigate && (
          <button onClick={() => onNavigate("latihan")} className="text-xs font-semibold" style={{ color: TRACK }}>
            Lanjutkan program →
          </button>
        )}
      </div>
      {!program ? (
        <p className="text-xs mt-1" style={{ color: MUTED }}>
          Belum ada program aktif — mulai satu di tab Program Latihan.
        </p>
      ) : (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: GRAPHITE }}>{TRAINING_GOALS[program.goal].label}</span>
            <span style={{ color: MUTED }}>
              {program.completedSessions.length} sesi selesai · {program.durationWeeks} minggu
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {program.completedSessions.slice(-14).map((s, i) => (
              <div key={i} className="text-xs px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: "#E4EFE7", color: TURF }}>
                {s.label} · {formatDate(s.date)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompletedProgramsSection() {
  const [list, setList] = useState(() => {
    if (typeof window === "undefined" || !window.localStorage) return [];
    try {
      const raw = window.localStorage.getItem("history:programs");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  if (list.length === 0) return null;

  return (
    <div className="py-6" style={{ borderBottom: `1px solid ${LINE}` }}>
      <span className="text-sm font-semibold" style={{ color: GRAPHITE }}>Riwayat program selesai</span>
      <div className="flex flex-col gap-2 mt-2">
        {[...list].reverse().map((p, i) => {
          const adherence = p.plannedTotal > 0 ? Math.round((p.doneCount / p.plannedTotal) * 100) : 0;
          return (
            <div key={i} className="flex items-center justify-between text-xs py-1.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${LINE}` }}>
              <div>
                <span className="font-semibold" style={{ color: GRAPHITE }}>
                  {TRAINING_GOALS[p.goal] ? TRAINING_GOALS[p.goal].label : p.goal}
                </span>
                <span style={{ color: MUTED }}> · {p.durationWeeks} minggu · mulai {formatDate(p.startDate)}</span>
              </div>
              <span style={{ color: adherence >= 80 ? "#1F9254" : MUTED }}>
                {p.doneCount}/{p.plannedTotal} sesi ({adherence}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryPanel({ onNavigate }) {
  return (
    <div className="p-6 md:p-8">
      {!hasStorage && (
        <div className="mb-4 p-3 text-xs rounded-sm" style={{ backgroundColor: "#F3EAD8", color: "#7A5A20" }}>
          Browser Anda tidak mendukung penyimpanan lokal — riwayat hanya
          bertahan selama sesi ini berjalan dan akan hilang saat halaman
          ditutup.
        </div>
      )}
      <SessionHistorySection onNavigate={onNavigate} />
      <CompletedProgramsSection />
      <HistorySection title="VO2 maks" unit="ml/kg/menit" storageKey="history:vo2" color={TRACK} />
      <HistorySection title="Indeks massa tubuh" unit="kg/m²" storageKey="history:bmi" color={TURF} />
      <HistorySection title="Persentase lemak tubuh" unit="%" storageKey="history:bodyfat" color={GOLD} />
      <HistorySection title="Target kalori harian" unit="kkal" storageKey="history:calories" color={TRACK} />
      <HistorySection title="Estimasi 1RM" unit="kg" storageKey="history:1rm" color={GOLD} />
      <HistorySection title="Kebutuhan cairan harian" unit="ml" storageKey="history:hidrasi" color={TURF} />
    </div>
  );
}

// ---------- APP ----------

const CALC_TABS = [
  { key: "vo2", label: "VO2 maks", icon: Activity },
  { key: "hr", label: "Zona detak jantung", icon: HeartPulse },
  { key: "body", label: "Komposisi tubuh", icon: Ruler },
  { key: "onerm", label: "1RM", icon: Gauge },
  { key: "hidrasi", label: "Kebutuhan cairan", icon: Droplets },
];

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "latihan", label: "Program Latihan", icon: Dumbbell },
  ...CALC_TABS,
  { key: "nutrisi", label: "Target nutrisi", icon: Utensils },
  { key: "riwayat", label: "Riwayat", icon: History },
  { key: "profil", label: "Profil", icon: User },
];

const BOTTOM_NAV = [
  { key: "latihan", label: "Latihan", icon: Dumbbell },
  { key: "nutrisi", label: "Nutrisi", icon: Utensils },
  { key: "__calc", label: "Kalkulator", icon: Gauge },
  { key: "riwayat", label: "Riwayat", icon: History },
];

function CalcSheet({ activeTab, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,18,28,0.55)" }} />
      <div
        className="relative w-full sheet-anim"
        style={{ backgroundColor: "var(--c-surface)", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: LINE }} />
        </div>
        <div className="p-4">
          <span className="text-xs uppercase tracking-wide px-2" style={{ color: MUTED }}>
            Pilih kalkulator
          </span>
          <div className="flex flex-col mt-2">
            {CALC_TABS.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => onSelect(t.key)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-lg sheet-item"
                  style={{ backgroundColor: active ? "rgba(193,68,14,0.08)" : "transparent" }}
                >
                  <Icon size={18} color={active ? TRACK : MUTED} />
                  <span className="text-sm font-semibold" style={{ color: active ? TRACK : GRAPHITE }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
      </div>
    </div>
  );
}

// ---------- ONBOARDING ----------

const ONBOARDING_SLIDES = [
  {
    icon: Dumbbell,
    color: TRACK,
    title: "Selamat datang 👋",
    body: "Jejak membantu Anda menghitung kebutuhan latihan & nutrisi, sekaligus menyusun program latihan otomatis berdasarkan tujuan Anda.",
  },
  {
    icon: User,
    color: ICON_COLORS.profil,
    title: "Mulai dari Profil",
    body: "Isi usia, tinggi, berat badan sekali di menu Profil — data ini otomatis mengisi semua kalkulator lain, jadi Anda tidak perlu ketik ulang setiap kali.",
  },
  {
    icon: Dumbbell,
    color: ICON_COLORS.latihan,
    title: "Buat Program Latihan",
    body: "Pilih tujuan, frekuensi, dan durasi — sistem otomatis membuat jadwal harian lengkap dengan minggu deload, dan mengingat progres Anda setiap hari.",
  },
  {
    icon: Gauge,
    color: ICON_COLORS.onerm,
    title: "8 kalkulator siap pakai",
    body: "VO2 Maks, Zona Detak Jantung, Komposisi Tubuh, 1RM, Kebutuhan Cairan, dan Target Nutrisi — semua bisa dipakai kapan saja lewat menu Kalkulator.",
  },
];

function loadOnboardedFlag() {
  if (typeof window === "undefined" || !window.localStorage) return true;
  try {
    return window.localStorage.getItem("hasOnboarded") === "1";
  } catch (e) {
    return true;
  }
}

function OnboardingOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = ONBOARDING_SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,18,28,0.6)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6 panel-anim" style={{ backgroundColor: "var(--c-surface)" }}>
        <div className="flex justify-end">
          <button onClick={onDone} className="text-xs" style={{ color: MUTED }}>
            Lewati
          </button>
        </div>
        <div className="flex flex-col items-center text-center py-4">
          <IconBadge icon={Icon} color={slide.color} size={56} />
          <h2 className="font-black text-xl mt-4" style={{ color: GRAPHITE }}>
            {slide.title}
          </h2>
          <p className="text-sm mt-2" style={{ color: MUTED }}>
            {slide.body}
          </p>
        </div>
        <div className="flex justify-center gap-1.5 my-4">
          {ONBOARDING_SLIDES.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i === step ? 18 : 6,
                height: 6,
                backgroundColor: i === step ? TRACK : "var(--c-line)",
                transition: "width 200ms ease",
              }}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2.5 text-sm font-semibold rounded-full"
              style={{ backgroundColor: "var(--c-page)", color: GRAPHITE }}
            >
              Kembali
            </button>
          )}
          <button
            onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-full"
            style={{ backgroundColor: TRACK, color: "#FFFFFF" }}
          >
            {isLast ? "Mulai" : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [booted, setBooted] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);
  const [calcSheetOpen, setCalcSheetOpen] = useState(false);
  const [profile] = useProfile();
  const [needsOnboarding, setNeedsOnboarding] = useState(() => !loadOnboardedFlag());

  const finishOnboarding = () => {
    setNeedsOnboarding(false);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("hasOnboarded", "1");
      } catch (e) {}
    }
  };

  useEffect(() => {
    setMounted(true);
    const t1 = setTimeout(() => setBooted(true), 550);
    const t2 = setTimeout(() => setSplashHidden(true), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const isCalcTab = CALC_TABS.some((t) => t.key === tab);
  const activeTabMeta = TABS.find((t) => t.key === tab);
  const greeting = profile.name ? `Selamat datang kembali, ${profile.name} 👋` : "Selamat datang kembali 👋";
  const headerSubtitle = tab === "dashboard" ? greeting : "Kalkulator & program latihan personal Anda";

  return (
    <div className="min-h-screen" data-theme={theme} style={{ backgroundColor: "var(--c-page)" }}>
      <style>{`
        :root {
          --c-page: #F5F6F3;
          --c-surface: #FFFFFF;
          --c-text: #1A1D29;
          --c-muted: #6B7280;
          --c-line: #E8EAE5;
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
        .panel-anim { animation: fadeSlideIn 300ms ease-out; }
        .tab-btn { transition: color 180ms ease, background-color 180ms ease; }
        .tab-btn:hover { background-color: rgba(255,255,255,0.06); }
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

        .bottom-nav-btn { transition: color 150ms ease, transform 120ms ease; }
        .bottom-nav-btn:active { transform: scale(0.92); }

        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .sheet-anim { animation: sheetUp 220ms cubic-bezier(0.32, 0.72, 0, 1); }
        .sheet-item { transition: background-color 150ms ease; }
        .sheet-item:active { transform: scale(0.98); }

        @keyframes splashPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .splash-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: #10233B;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: opacity 400ms ease;
        }
        .splash-overlay.boot-out { opacity: 0; }
        .splash-mark {
          width: 72px; height: 72px; border-radius: 16px;
          background: #10233B; border: 2px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          animation: splashPulse 1.1s ease-in-out infinite;
        }
      `}</style>

      {!splashHidden && (
        <div className={`splash-overlay${booted ? " boot-out" : ""}`}>
          <div className="splash-mark">
            <span style={{ color: "#EEF1EA", fontWeight: 900, fontSize: 30 }}>J</span>
          </div>
          <div style={{ width: 44, height: 4, backgroundColor: "#C1440E", marginTop: 14, borderRadius: 2 }} />
          <span style={{ color: "#9AA6B2", fontSize: 13, marginTop: 14, letterSpacing: "0.02em" }}>
            Jejak — Kepelatihan Olahraga
          </span>
        </div>
      )}

      <div className="md:flex md:min-h-screen">
        {/* Sidebar desktop */}
        <aside
          className="hidden md:flex md:flex-col md:w-60 md:shrink-0"
          style={{ backgroundColor: INK }}
        >
          <div className="px-6 pt-8 pb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 34, height: 34, backgroundColor: TRACK }}
              >
                <span style={{ color: "#FFFFFF", fontWeight: 900, fontSize: 16 }}>J</span>
              </div>
              <span className="font-black leading-tight" style={{ color: CHALK, fontSize: 17 }}>
                Jejak
              </span>
            </div>
          </div>
          <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="tab-btn flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left"
                  style={{
                    color: active ? CHALK : "#8C97A3",
                    backgroundColor: active ? "rgba(193,68,14,0.18)" : "transparent",
                  }}
                >
                  <Icon size={17} color={active ? TRACK : "#8C97A3"} />
                  {t.label}
                </button>
              );
            })}
          </nav>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="theme-toggle mx-3 mb-6 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left"
            style={{ color: "#8C97A3" }}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            {theme === "light" ? "Mode gelap" : "Mode terang"}
          </button>
        </aside>

        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          {/* Header mobile */}
          <header
            className="md:hidden px-5 sm:px-6 pt-8 pb-6 flex items-start justify-between gap-4"
            style={{ backgroundColor: INK }}
          >
            <div>
              <h1
                className="font-black tracking-tight leading-tight"
                style={{ fontSize: "clamp(1.4rem, 4.5vw, 1.9rem)", color: CHALK }}
              >
                Jejak
              </h1>
              <p className="mt-1 text-xs sm:text-sm" style={{ color: "#9AA6B2" }}>
                {headerSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setTab("dashboard")}
                className="theme-toggle p-2 rounded-full"
                style={{ color: tab === "dashboard" ? TRACK : CHALK }}
                aria-label="Buka dashboard"
              >
                <Home size={20} />
              </button>
              <button
                onClick={() => setTab("profil")}
                className="theme-toggle p-2 rounded-full"
                style={{ color: tab === "profil" ? TRACK : CHALK }}
                aria-label="Buka profil"
              >
                <User size={20} />
              </button>
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="theme-toggle p-2 rounded-full"
                style={{ color: CHALK }}
                aria-label="Ganti mode gelap/terang"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </header>

          {/* Header desktop (judul halaman) */}
          <header className="hidden md:flex items-center justify-between px-8 pt-8 pb-2">
            <div>
              <h1 className="font-black text-2xl" style={{ color: GRAPHITE }}>
                {activeTabMeta ? activeTabMeta.label : "Jejak"}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: MUTED }}>
                {headerSubtitle}
              </p>
            </div>
          </header>

          <main className="max-w-4xl md:max-w-none">
            <div key={tab} className="panel-anim">
              {tab === "vo2" && <Vo2Panel />}
              {tab === "hr" && <HrPanel />}
              {tab === "body" && <BodyPanel />}
              {tab === "onerm" && <OneRmPanel />}
              {tab === "hidrasi" && <HydrationPanel />}
              {tab === "dashboard" && <DashboardPanel onNavigate={setTab} />}
              {tab === "latihan" && <LatihanPanel />}
              {tab === "nutrisi" && <NutrisiPanel />}
              {tab === "riwayat" && <HistoryPanel onNavigate={setTab} />}
              {tab === "profil" && <ProfilePanel />}
            </div>
          </main>

          <footer className="hidden md:block px-8 py-6 text-xs" style={{ color: MUTED }}>
            Prototipe untuk keperluan edukasi. Bukan pengganti tes laboratorium
            atau penilaian medis untuk atlet elite.
          </footer>
        </div>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex z-40"
        style={{ backgroundColor: INK, borderTop: "1px solid #24344A", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {BOTTOM_NAV.map((t) => {
          const Icon = t.icon;
          const isCalc = t.key === "__calc";
          const active = isCalc ? isCalcTab : tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => (isCalc ? setCalcSheetOpen(true) : setTab(t.key))}
              className="bottom-nav-btn flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
              style={{ color: active ? TRACK : "#8C97A3" }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {calcSheetOpen && (
        <CalcSheet
          activeTab={tab}
          onSelect={(k) => {
            setTab(k);
            setCalcSheetOpen(false);
          }}
          onClose={() => setCalcSheetOpen(false)}
        />
      )}

      {needsOnboarding && splashHidden && <OnboardingOverlay onDone={finishOnboarding} />}
    </div>
  );
}
