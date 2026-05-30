// ============================================================
//  Initium
// ============================================================
import { useState, useRef, useCallback, useEffect } from "react";

// ── Firebase SDK ────────────────────
import { auth, db, rtdb } from "./firebase";
import { login as fbLogin, register as fbRegister } from "./auth";
import {
  createCombatRoom,
  listenCombat,
  moveToken as fbMoveToken,
  nextTurn as fbNextTurn,
} from "./combat";

// ── Firestore helpers ────────────────────────────────────────
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc,
} from "firebase/firestore";

// ── Realtime Database helpers ─────────────────────────────────
import { ref, push, update, remove } from "firebase/database";

// ── Firebase Auth helpers ─────────────────────────────────────
import { onAuthStateChanged, signOut } from "firebase/auth";

// ── Flaticon UIcons CDN ─────────────
const _fi = document.createElement("link");
_fi.rel = "stylesheet";
_fi.href =
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css";
document.head.appendChild(_fi);
const _fi2 = document.createElement("link");
_fi2.rel = "stylesheet";
_fi2.href =
  "https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css";
document.head.appendChild(_fi2);

// ─────────────────────────────────────────────────────────────
//  CSS GLOBAL
// ─────────────────────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#09091a;--surface:#0f0f1f;--card:#13132a;--card2:#18183a;
  --border:#2a2a55;--border2:#38387a;
  --gold:#8b6fff;--gold-l:#a78bfa;--gold-d:#5b3fd4;
  --red:#9b2335;--red-l:#c0392b;--blue:#1a3a6e;--blue-l:#2a5aaa;
  --green:#1a4a2a;--green-l:#2a7a40;
  --text:#e8e4ff;--text2:#9d99c0;--text3:#5a5880;
  --radius:8px;--radius-l:12px;
}
i[class^="fi"]{vertical-align:middle;line-height:1}
body{background:var(--bg);color:var(--text);font-family:'Crimson Text',Georgia,serif;font-size:16px;line-height:1.6;min-height:100vh}
h1,h2,h3,h4{font-family:'Cinzel',serif;letter-spacing:.03em;color:var(--gold)}
input,select,textarea{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-family:'Crimson Text',Georgia,serif;font-size:15px;padding:10px 12px;width:100%;outline:none;transition:border-color .2s}
input:focus,select:focus,textarea:focus{border-color:var(--gold-d)}
input::placeholder{color:var(--text3)}
button{font-family:'Cinzel',serif;cursor:pointer;border:none;border-radius:var(--radius);font-size:13px;letter-spacing:.05em;transition:all .2s}
select option{background:var(--card)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--surface)}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.btn-gold{background:linear-gradient(135deg,#8b6fff,#a78bfa);color:#1a1200;padding:12px 24px;font-weight:600;width:100%}
.btn-gold:hover{background:linear-gradient(135deg,#a78bfa,#9d99c0)}
.btn-gold:disabled{opacity:.5;cursor:not-allowed}
.btn-outline{background:transparent;border:1px solid var(--border2);color:var(--text2);padding:10px 20px}
.btn-outline:hover{border-color:var(--gold-d);color:var(--gold)}
.btn-danger{background:var(--red);color:#fff;padding:8px 16px}
.btn-danger:hover{background:var(--red-l)}
.btn-sm{padding:7px 14px;font-size:12px}
.btn-icon{background:transparent;border:1px solid var(--border);color:var(--text2);width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius);font-size:16px;cursor:pointer}
.btn-icon:hover{border-color:var(--gold-d);color:var(--gold)}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-l);padding:16px}
.card2{background:var(--card2);border:1px solid var(--border2);border-radius:var(--radius-l);padding:16px}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:12px;font-family:'Cinzel',serif;letter-spacing:.04em}
.badge-gold{background:rgba(134, 76, 201, 0.15);color:var(--gold);border:1px solid rgba(143, 76, 201, 0.3)}
.badge-red{background:rgba(155,35,53,.2);color:#e05070;border:1px solid rgba(155,35,53,.4)}
.badge-blue{background:rgba(26,58,110,.4);color:#7aadff;border:1px solid rgba(42,90,170,.5)}
.badge-green{background:rgba(26,74,42,.4);color:#6aca90;border:1px solid rgba(42,122,64,.5)}
.tag-master{background:rgba(155,35,53,.25);color:#e87890;border:1px solid rgba(155,35,53,.5)}
.tag-player{background:rgba(26,58,110,.35);color:#7aadff;border:1px solid rgba(42,90,170,.5)}
.page{max-width:480px;margin:0 auto;padding:16px;min-height:100vh}
.nav{position:sticky;top:0;background:var(--surface);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;gap:12px;z-index:100}
.nav-title{font-family:'Cinzel',serif;color:var(--gold);font-size:15px;flex:1}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.flex{display:flex;align-items:center}
.flex-between{display:flex;align-items:center;justify-content:space-between}
.gap4{gap:4px}.gap8{gap:8px}.gap12{gap:12px}
.mb4{margin-bottom:4px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.mb24{margin-bottom:24px}
.mt8{margin-top:8px}.mt16{margin-top:16px}
.label{font-size:12px;color:var(--text2);font-family:'Cinzel',serif;letter-spacing:.06em;margin-bottom:4px}
.muted{color:var(--text2);font-size:14px}
.small{font-size:13px}
.text-center{text-align:center}
.w-full{width:100%}
.hp-bar{height:6px;background:var(--border);border-radius:3px;overflow:hidden}
.hp-fill{height:100%;background:linear-gradient(90deg,#c0392b,#27ae60);transition:width .3s;border-radius:3px}
.token{position:absolute;width:44px;height:44px;border-radius:50%;border:2px solid #fff;cursor:grab;display:flex;align-items:center;justify-content:center;font-size:18px;text-align:center;user-select:none;touch-action:none;transform:translate(-50%,-50%);z-index:10}
.token:active{cursor:grabbing;z-index:20}
.token.enemy{border-color:#c0392b}
.token-label{position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;color:#fff;text-shadow:0 1px 2px #000;pointer-events:none}
.dice-btn{width:52px;height:52px;border-radius:var(--radius);border:1px solid var(--border2);background:var(--card2);color:var(--gold);font-family:'Cinzel',serif;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.dice-btn:hover{border-color:var(--gold);background:rgba(201,168,76,.1)}
.dice-btn:active{transform:scale(.9)}
.dice-result{font-size:36px;font-family:'Cinzel',serif;color:var(--gold-l);text-align:center}
.roll-log{max-height:140px;overflow-y:auto}
.roll-entry{font-size:13px;color:var(--text2);border-bottom:1px solid var(--border);padding:4px 0}
.init-item{display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--radius);border:1px solid var(--border);margin-bottom:6px;transition:border-color .2s}
.init-item.active{border-color:var(--gold);background:rgba(201,168,76,.07)}
.init-badge{width:32px;height:32px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#7aadff;font-family:'Cinzel',serif}
.init-badge.enemy{background:var(--red);color:#e87890}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:var(--radius);font-size:13px;cursor:pointer;transition:background .15s;position:relative}
.cal-day:hover{background:var(--card2)}
.cal-day.today{background:rgba(201,168,76,.15);color:var(--gold)}
.cal-day.has-event::after{content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--gold)}
.cal-day.other-month{color:var(--text3)}
.room-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-l);padding:16px;position:relative;overflow:hidden}
.room-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold-d),var(--gold))}
.auth-bg{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08) 0%,transparent 60%),var(--bg)}
.auth-logo{font-family:'Cinzel',serif;font-size:28px;color:var(--gold);letter-spacing:.1em;margin-bottom:4px}
.auth-sub{color:var(--text2);font-size:14px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:32px}
.role-btn{border:1px solid var(--border2);background:var(--card2);border-radius:var(--radius-l);padding:16px;cursor:pointer;transition:all .2s;text-align:center}
.role-btn:hover,.role-btn.active{border-color:var(--gold);background:rgba(201,168,76,.08)}
.role-icon{font-size:28px;margin-bottom:6px}
.role-name{font-family:'Cinzel',serif;color:var(--gold);font-size:14px;margin-bottom:4px}
.role-desc{color:var(--text2);font-size:12px}
.home-hero{text-align:center;padding:32px 0 20px}
.home-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-l);padding:20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.home-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,.04),transparent);pointer-events:none}
.home-card:hover{border-color:var(--gold-d);transform:translateY(-2px)}
.home-card:active{transform:translateY(0)}
.card-icon{font-size:32px;margin-bottom:12px}
.card-title{font-family:'Cinzel',serif;color:var(--gold);font-size:16px;margin-bottom:6px}
.card-desc{color:var(--text2);font-size:14px;line-height:1.5}
.card-count{position:absolute;top:14px;right:14px;background:rgba(143, 76, 201, 0.11);color:var(--gold);border-radius:20px;padding:2px 10px;font-size:12px;font-family:'Cinzel',serif}
.stat-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:10px 8px;text-align:center}
.stat-name{font-size:10px;color:var(--text3);font-family:'Cinzel',serif;letter-spacing:.06em;margin-top:2px}
.tab-bar{display:flex;gap:4px;background:var(--surface);border-radius:var(--radius);padding:4px;margin-bottom:16px}
.tab{flex:1;padding:8px;border-radius:6px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.05em;border:none;background:transparent;color:var(--text2);cursor:pointer;text-align:center;transition:all .2s}
.tab.active{background:var(--card2);color:var(--gold);border:1px solid var(--border2)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.modal-sheet{background:var(--card);border-radius:16px 16px 0 0;border:1px solid var(--border2);border-bottom:none;padding:20px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto}
.modal-handle{width:36px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 16px}
.sys-pill{padding:6px 14px;border-radius:20px;border:1px solid var(--border2);background:var(--card2);color:var(--text2);font-family:'Cinzel',serif;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .15s}
.sys-pill.active{border-color:var(--gold);background:rgba(201,168,76,.12);color:var(--gold)}
.share-box{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px;font-size:13px;color:var(--text2);word-break:break-all}
.loading-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px}
.spinner{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-msg{background:rgba(155,35,53,.15);border:1px solid rgba(155,35,53,.4);border-radius:var(--radius);padding:10px 14px;color:#e05070;font-size:13px;margin-bottom:12px}
.live-dot{width:8px;height:8px;border-radius:50%;background:#27ae60;animation:pulse 1.5s ease-in-out infinite;display:inline-block}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.85)}}
@keyframes fadeInOut{
  0%{opacity:0;transform:translateX(-50%) translateY(-8px)}
  15%{opacity:1;transform:translateX(-50%) translateY(0)}
  75%{opacity:1;transform:translateX(-50%) translateY(0)}
  100%{opacity:0;transform:translateX(-50%) translateY(-8px)}
}
`;
document.head.appendChild(styleEl);

// ─────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────
const TABLE_SYSTEMS = [
  { id: "dnd5e", name: "D&D 5e", icon: "fi fi-rr-sword" },
  { id: "witcher", name: "The Witcher", icon: "fi fi-rr-paw" },
  { id: "deadlands", name: "Deadlands", icon: "fi fi-rr-hat-cowboy" },
  { id: "pathfinder", name: "Pathfinder 2e", icon: "fi fi-rr-map" },
  { id: "cthulhu", name: "Call of Cthulhu", icon: "fi fi-rr-eye" },
  { id: "vampiro", name: "Vampiro: A Máscara", icon: "fi fi-rr-blood" },
];

const DICE = [4, 6, 8, 10, 12, 20, 53, 100];

const SHEET_TEMPLATES = {
  dnd5e: {
    stats: ["FOR", "DES", "CON", "INT", "SAB", "CAR"],
    fields: ["Raça", "Classe", "Nível", "Antecedente", "Alinhamento"],
    extras: ["HP Máximo", "CA", "Velocidade", "Iniciativa", "Proficiência"],
    abilities: [
      "Acrobacia",
      "Arcanismo",
      "Atletismo",
      "Enganação",
      "Furtividade",
      "Historia",
      "Intimidação",
      "Medicina",
      "Natureza",
      "Percepção",
      "Persuasão",
      "Religião",
      "Sobrevivência",
    ],
  },
  witcher: {
    stats: [
      "CORPO",
      "REFLEXO",
      "DESTR",
      "EMPATIA",
      "ARTESANATO",
      "INTEL",
      "VONTADE",
      "SORTE",
    ],
    fields: ["Profissão", "Origem", "Gênero", "Idade"],
    extras: ["VIDA", "VIGOR", "Reputação", "Riqueza"],
    abilities: [
      "Atletismo",
      "Esquiva",
      "Furtividade",
      "Consciência",
      "Astúcia",
      "Carisma",
      "Persuasão",
      "Combate com Espada",
      "Magia de Sinais",
      "Alquimia",
    ],
  },
  deadlands: {
    stats: ["AGILIDADE", "ASTÚCIA", "ESPÍRITO", "FORÇA", "VIGOR"],
    fields: ["Arquétipo", "Rank", "Organização"],
    extras: ["Ferimentos", "Fadiga", "Bênçãos", "Maldições"],
    abilities: [
      "Atletismo",
      "Cavalgar",
      "Atirar",
      "Lutar",
      "Intimidar",
      "Notar",
      "Persuadir",
      "Furtividade",
      "Sobrevivência",
      "Arcanos",
    ],
  },
  pathfinder: {
    stats: ["FOR", "DES", "CON", "INT", "SAB", "CAR"],
    fields: ["Ancestral", "Classe", "Nível", "Background"],
    extras: ["HP", "CA", "Velocidade", "Percepção"],
    abilities: [
      "Acrobacia",
      "Arcanos",
      "Atletismo",
      "Artesanato",
      "Enganação",
      "Diplomacia",
      "Furtividade",
      "Intimidação",
      "Medicina",
      "Natureza",
      "Ocultismo",
      "Religião",
      "Sobrevivência",
    ],
  },
  cthulhu: {
    stats: ["FOR", "CON", "TAM", "DES", "APA", "EDU", "INT", "POD", "SAN"],
    fields: ["Ocupação", "Idade", "Residência", "Época"],
    extras: ["Pontos de Vida", "Sanidade", "Magia", "Sorte"],
    abilities: [
      "Armas de Fogo",
      "Charme",
      "Crédito",
      "Direito",
      "Escuta",
      "Furtividade",
      "Psicologia",
      "Medicina",
      "Magia",
      "Primeiros Socorros",
    ],
  },
  vampiro: {
    stats: ["FOR", "DES", "VIG", "CAR", "MAN", "APA", "PER", "INT", "AST"],
    fields: ["Clã", "Geração", "Sire", "Abraço"],
    extras: ["Sangue", "Humanidade", "Força de Vontade", "Tempos Acordado"],
    abilities: [
      "Alerta",
      "Atletismo",
      "Briga",
      "Empatia",
      "Esquiva",
      "Expressão",
      "Furtividade",
      "Intimidação",
      "Liderança",
      "Subterfúgio",
    ],
  },
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ─────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const rollDie = (s) => Math.floor(Math.random() * s) + 1;
const statMod = (v) => {
  const m = Math.floor((parseInt(v || 10) - 10) / 2);
  return (m >= 0 ? "+" : "") + m;
};
const clean = (o) => JSON.parse(JSON.stringify(o));
const dateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function buildCalDays(year, month) {
  const first = new Date(year, month, 1).getDay(),
    days = new Date(year, month + 1, 0).getDate(),
    prevD = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = first - 1; i >= 0; i--)
    cells.push({ day: prevD - i, cur: false });
  for (let d = 1; d <= days; d++) cells.push({ day: d, cur: true });
  let n = 1;
  while (cells.length % 7 !== 0) cells.push({ day: n++, cur: false });
  return cells;
}

// ─────────────────────────────────────────────────────────────
//  COMPRESSÃO DE IMAGEM
//  Usa Canvas API para redimensionar e comprimir antes de salvar.
//  avatars  → max 200×200, JPEG 0.82  ≈ 8–20 KB
//  mapa     → max 1280×960, JPEG 0.70 ≈ 60–150 KB (base64 no RTDB)
// ─────────────────────────────────────────────────────────────
function compressImage(file, maxW = 200, maxH = 200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────
//  IMAGE UPLOAD — componente reutilizável com preview
// ─────────────────────────────────────────────────────────────
function ImageUpload({
  value,
  onChange,
  size = 80,
  label = "Foto",
  maxW = 200,
  maxH = 200,
  quality = 0.82,
}) {
  const inputRef = useRef();
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true);
    try {
      const b64 = await compressImage(file, maxW, maxH, quality);
      onChange(b64);
    } catch (err) {
      console.error("Compressão falhou:", err);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      {label && <div className="label mb8">{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Preview circular */}
        <div
          onClick={() => !compressing && inputRef.current.click()}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            flexShrink: 0,
            border: `2px dashed ${value ? "var(--gold-d)" : "var(--border2)"}`,
            background: value
              ? `url(${value}) center/cover no-repeat`
              : "var(--surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.35,
            overflow: "hidden",
            transition: "border-color .2s",
          }}
        >
          {!value && !compressing && (
            <i
              className="fi fi-rr-camera"
              style={{ fontSize: 28, color: "var(--text3)" }}
            ></i>
          )}
          {compressing && (
            <div
              className="spinner"
              style={{ width: 24, height: 24, borderWidth: 2 }}
            />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            className="btn-outline btn-sm"
            onClick={() => !compressing && inputRef.current.click()}
            disabled={compressing}
          >
            {compressing
              ? "Comprimindo..."
              : value
                ? "Trocar imagem"
                : "Escolher foto"}
          </button>
          {value && (
            <button
              className="btn-sm"
              style={{
                background: "transparent",
                border: "1px solid var(--red)",
                color: "var(--red)",
                padding: "4px 10px",
                fontSize: 11,
              }}
              onClick={() => onChange(null)}
            >
              <i
                className="fi fi-rr-cross-small"
                style={{ marginRight: 4 }}
              ></i>
              Remover
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  LOADING
// ─────────────────────────────────────────────────────────────
function LoadingScreen({ msg = "Carregando..." }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="muted">{msg}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  AUTH SCREEN — usa fbLogin / fbRegister do auth.js
//
//  IMPORTANTE: NÃO chamamos onLogin aqui. Deixamos o
//  onAuthStateChanged do App ser a ÚNICA fonte de verdade.
//  Assim nunca há dessincronismo entre o objeto retornado
//  pelo auth.js e o que está salvo no Firestore.
// ─────────────────────────────────────────────────────────────
function AuthScreen() {
  const [modeVal, setModeVal] = useState("login");
  const [role, setRole] = useState("player");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!form.email || !form.password) return setErr("Preencha email e senha.");
    if (modeVal === "register" && !form.name)
      return setErr("Informe seu nome.");
    setLoading(true);
    try {
      // Apenas dispara o login/registro.
      // O onAuthStateChanged no App detecta o usuário autenticado
      // e lê o perfil completo (com role) do Firestore.
      if (modeVal === "login") {
        await fbLogin(form.email, form.password);
      } else {
        await fbRegister(form.email, form.password, form.name, role);
      }
      // Não chamamos nada aqui — onAuthStateChanged cuida do resto.
    } catch (e) {
      const msgs = {
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "Email ou senha incorretos.",
        "auth/email-already-in-use": "Este email já está cadastrado.",
        "auth/invalid-email": "Email inválido.",
        "auth/weak-password": "Senha fraca (mínimo 6 caracteres).",
      };
      setErr(msgs[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 380, padding: "0 4px" }}>
        <div className="text-center mb24">
          <div
            className="auth-logo"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
              color: "var(--text)",
            }}
          >
            <img
              src="initium-white.png"
              alt="Initium Logo"
              style={{
                width: 100,
                height: "auto",
                verticalAlign: "middle",
              }}
            ></img>
            INITIUM
          </div>
          <div className="auth-sub">O Começo de uma Lenda</div>
        </div>
        <div className="card mb16">
          <div className="tab-bar mb16">
            <button
              className={`tab${modeVal === "login" ? " active" : ""}`}
              onClick={() => {
                setModeVal("login");
                setErr("");
              }}
            >
              Entrar
            </button>
            <button
              className={`tab${modeVal === "register" ? " active" : ""}`}
              onClick={() => {
                setModeVal("register");
                setErr("");
              }}
            >
              Registrar
            </button>
          </div>
          {modeVal === "register" && (
            <div className="mb12">
              <div className="label">Escolha seu papel</div>
              <div className="grid2">
                <div
                  className={`role-btn${role === "master" ? " active" : ""}`}
                  onClick={() => setRole("master")}
                >
                  <div className="role-icon">
                    <i className="fi fi-rr-eye"></i>
                  </div>
                  <div className="role-name">Mestre</div>
                  <div className="role-desc">
                    Controla a partida e os inimigos
                  </div>
                </div>
                <div
                  className={`role-btn${role === "player" ? " active" : ""}`}
                  onClick={() => setRole("player")}
                >
                  <div className="role-icon">
                    <i className="fi fi-rr-shield"></i>
                  </div>
                  <div className="role-name">Jogador</div>
                  <div className="role-desc">Controla seu personagem</div>
                </div>
              </div>
            </div>
          )}
          {modeVal === "register" && (
            <div className="mb12">
              <div className="label">Nome</div>
              <input
                placeholder="Teu nome de aventureiro"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="mb12">
            <div className="label">Email</div>
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="mb16">
            <div className="label">Senha</div>
            <input
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          {err && <div className="error-msg">{err}</div>}
          <button className="btn-gold" onClick={submit} disabled={loading}>
            {loading
              ? "Aguarda..."
              : modeVal === "login"
                ? "Entrar na Taverna"
                : "Forjar Conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HOME
// ─────────────────────────────────────────────────────────────
function HomeScreen({ user, counts, setView, onLogout }) {
  const isMaster = user.role === "master";
  return (
    <div>
      <div className="nav">
        <div className="nav-title" style={{ color: "var(--text)" }}>
          <img
            src="initium-white.png"
            style={{ width: 32, height: "auto", verticalAlign: "middle" }}
          ></img>
          Initium
        </div>
        <span
          className={`badge ${user.role === "master" ? "tag-master" : "tag-player"}`}
        >
          {user.role === "master" ? (
            <>
              <i className="fi fi-rr-eye" style={{ marginRight: 4 }}></i>Mestre
            </>
          ) : (
            <>
              <i className="fi fi-rr-shield" style={{ marginRight: 4 }}></i>
              Jogador
            </>
          )}
        </span>
        <button
          className="btn-icon"
          title="Sair"
          onClick={onLogout}
          style={{ fontSize: 13 }}
        >
          <i className="fi fi-rr-power"></i>
        </button>
      </div>
      <div className="page">
        <div className="home-hero">
          <h1>Olá, {user.name}!</h1>
          <p className="muted" style={{ fontSize: 14 }}>
            Que sua jornada seja épica.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="home-card" onClick={() => setView("characters")}>
            <div className="card-count">{counts.characters}</div>
            <div className="card-icon">
              <i className="fi fi-rr-hat-wizard"></i>
            </div>
            <div className="card-title">Personagens</div>
            <div className="card-desc">
              {isMaster
                ? "Veja todos os heróis da campanha"
                : "Crie e gerencie teu personagem"}
            </div>
          </div>
          {isMaster && (
            <div className="home-card" onClick={() => setView("enemies")}>
              <div className="card-count">{counts.enemies}</div>
              <div className="card-icon">
                <i className="fi fi-rr-skull"></i>
              </div>
              <div className="card-title">Inimigos & Chefões</div>
              <div className="card-desc">
                Crie fichas de monstros e antagonistas
              </div>
            </div>
          )}
          <div className="home-card" onClick={() => setView("calendar")}>
            <div className="card-count">{counts.events}</div>
            <div className="card-icon">
              <i className="fi fi-rr-calendar"></i>
            </div>
            <div className="card-title">Calendário da Campanha</div>
            <div className="card-desc">
              {isMaster
                ? "Organize eventos, sessões e acontecimentos"
                : "Acompanha os eventos da campanha"}
            </div>
          </div>
          <div className="home-card" onClick={() => setView("rooms")}>
            <div className="card-count">{counts.rooms}</div>
            <div className="card-icon">
              <i className="fi fi-rr-two-swords"></i>
            </div>
            <div className="card-title">Salas de Combate</div>
            <div className="card-desc">
              Batalhas em tempo real com mapa, tokens e dados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FICHA DE PERSONAGEM — FORMULÁRIO (salva no Firestore)
// ─────────────────────────────────────────────────────────────
function CharacterForm({ user, onSave, onBack, initial }) {
  const [sys, setSys] = useState(initial?.system || "dnd5e");
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);

  const blank = (s) => {
    const t = SHEET_TEMPLATES[s];
    return {
      name: "",
      system: s,
      avatar: "fi fi-rr-hat-wizard",
      stats: Object.fromEntries(t.stats.map((x) => [x, "10"])),
      fields: Object.fromEntries(t.fields.map((x) => [x, ""])),
      extras: Object.fromEntries(t.extras.map((x) => [x, ""])),
      abilities: Object.fromEntries(t.abilities.map((x) => [x, "0"])),
      hp: "20",
      maxHp: "20",
      notes: "",
      backstory: "",
    };
  };

  const [form, setForm] = useState(
    initial
      ? { ...blank(initial.system || "dnd5e"), ...initial }
      : blank("dnd5e"),
  );
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const changeSys = (s) => {
    setSys(s);
    setForm((f) => ({ ...blank(s), name: f.name, avatar: f.avatar }));
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = clean({
      ...form,
      system: sys,
      ownerId: initial?.ownerId || user.uid,
      ownerName: initial?.ownerName || user.name,
      updatedAt: Date.now(),
    });
    try {
      if (initial?.firestoreId) {
        await updateDoc(doc(db, "characters", initial.firestoreId), data);
      } else {
        await addDoc(collection(db, "characters"), {
          ...data,
          createdAt: Date.now(),
        });
      }
      onSave();
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const tmpl = SHEET_TEMPLATES[sys];
  const tabs = ["Sistema", "Atributos", "Extras", "Perícias", "Notas"];

  return (
    <div>
      <div className="nav">
        <button className="btn-icon" onClick={onBack}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title">
          {initial ? "Editar Personagem" : "Novo Personagem"}
        </div>
        <button className="btn-gold btn-sm" onClick={save} disabled={saving}>
          {saving ? "..." : "Salvar"}
        </button>
      </div>
      <div className="page">
        <div className="tab-bar mb16">
          {tabs.map((t, i) => (
            <button
              key={t}
              className={`tab${tab === i ? " active" : ""}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            <div className="mb12">
              <div className="label">Sistema</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TABLE_SYSTEMS.map((s) => (
                  <div
                    key={s.id}
                    className={`sys-pill${sys === s.id ? " active" : ""}`}
                    onClick={() => changeSys(s.id)}
                  >
                    <>
                      <i
                        className={s.icon}
                        style={{ marginRight: 5, fontSize: 13 }}
                      ></i>
                      {s.name}
                    </>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb12">
              <div className="label">Nome</div>
              <input
                value={form.name}
                onChange={(e) => upd("name", e.target.value)}
                placeholder="Nome épico..."
              />
            </div>
            <div className="mb12">
              <div className="label">Avatar</div>
              <div style={{ marginBottom: 12 }}>
                <ImageUpload
                  value={form.avatarUrl || null}
                  onChange={(v) => upd("avatarUrl", v)}
                  size={72}
                  label={null}
                  maxW={200}
                  maxH={200}
                  quality={0.84}
                />
              </div>
              <div className="label mb4" style={{ fontSize: 11 }}>
                Ou escolhe um ícone
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { k: "wizard", cls: "fi fi-rr-hat-wizard" },
                  { k: "sword", cls: "fi fi-rr-sword" },
                  { k: "bow", cls: "fi fi-rr-bow-arrow" },
                  { k: "shield", cls: "fi fi-rr-shield" },
                  { k: "dagger", cls: "fi fi-rr-knife" },
                  { k: "magic", cls: "fi fi-rr-sparkles" },
                  { k: "dragon", cls: "fi fi-rr-dragon" },
                  { k: "feather", cls: "fi fi-rr-feather" },
                  { k: "paw", cls: "fi fi-rr-paw" },
                  { k: "skull", cls: "fi fi-rr-skull" },
                  { k: "leaf", cls: "fi fi-rr-leaf" },
                  { k: "blood", cls: "fi fi-rr-blood" },
                ].map((e) => (
                  <div
                    key={e.k}
                    onClick={() => upd("avatar", e.cls)}
                    style={{
                      width: 38,
                      height: 38,
                      border: `2px solid ${!form.avatarUrl && form.avatar === e.cls ? "var(--gold)" : "var(--border)"}`,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 19,
                      opacity: form.avatarUrl ? 0.5 : 1,
                    }}
                  >
                    <i className={e.cls}></i>
                  </div>
                ))}
              </div>
            </div>
            {tmpl.fields.map((f) => (
              <div key={f} className="mb12">
                <div className="label">{f}</div>
                <input
                  value={form.fields[f] || ""}
                  onChange={(e) =>
                    upd("fields", { ...form.fields, [f]: e.target.value })
                  }
                  placeholder={f}
                />
              </div>
            ))}
          </div>
        )}

        {tab === 1 && (
          <div>
            <div className="label mb8">Atributos Principais</div>
            <div className="grid3 mb16">
              {tmpl.stats.map((s) => (
                <div key={s} className="stat-box">
                  <div className="stat-name">{s}</div>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={form.stats[s] || "10"}
                    onChange={(e) =>
                      upd("stats", { ...form.stats, [s]: e.target.value })
                    }
                    style={{
                      textAlign: "center",
                      padding: "6px 4px",
                      fontSize: 18,
                      border: "none",
                      background: "transparent",
                      color: "var(--gold-l)",
                      fontFamily: "Cinzel,serif",
                      fontWeight: 600,
                    }}
                  />
                  {(sys === "dnd5e" || sys === "pathfinder") && (
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>
                      {statMod(form.stats[s])}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="label mb8">Pontos de Vida</div>
            <div className="grid2">
              <div>
                <div className="label">HP Atual</div>
                <input
                  type="number"
                  value={form.hp}
                  onChange={(e) => upd("hp", e.target.value)}
                />
              </div>
              <div>
                <div className="label">HP Máximo</div>
                <input
                  type="number"
                  value={form.maxHp}
                  onChange={(e) => upd("maxHp", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div className="label mb8">Valores Extras</div>
            {tmpl.extras.map((e) => (
              <div key={e} className="mb12">
                <div className="label">{e}</div>
                <input
                  value={form.extras[e] || ""}
                  onChange={(ev) =>
                    upd("extras", { ...form.extras, [e]: ev.target.value })
                  }
                  placeholder={e}
                />
              </div>
            ))}
          </div>
        )}

        {tab === 3 && (
          <div>
            <div className="label mb8">Perícias & Habilidades</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                gap: 8,
                alignItems: "center",
              }}
            >
              {tmpl.abilities.map((a) => (
                <>
                  <div key={a + "l"} style={{ fontSize: 14 }}>
                    {a}
                  </div>
                  <input
                    key={a}
                    type="number"
                    min="0"
                    max="10"
                    value={form.abilities[a] || "0"}
                    onChange={(e) =>
                      upd("abilities", {
                        ...form.abilities,
                        [a]: e.target.value,
                      })
                    }
                    style={{ textAlign: "center" }}
                  />
                </>
              ))}
            </div>
          </div>
        )}

        {tab === 4 && (
          <div>
            <div className="mb12">
              <div className="label">História</div>
              <textarea
                rows={5}
                value={form.backstory}
                onChange={(e) => upd("backstory", e.target.value)}
                placeholder="Conta a origem do teu herói..."
                style={{ resize: "vertical" }}
              />
            </div>
            <div>
              <div className="label">Anotações</div>
              <textarea
                rows={5}
                value={form.notes}
                onChange={(e) => upd("notes", e.target.value)}
                placeholder="Equipamentos, aliados, objetivos..."
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PERSONAGENS — LISTAGEM (Firestore onSnapshot)
// ─────────────────────────────────────────────────────────────
function CharactersScreen({ user, setView }) {
  const [chars, setChars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const isMaster = user.role === "master";

  useEffect(() => {
    const q = isMaster
      ? query(collection(db, "characters"), orderBy("createdAt", "desc"))
      : query(
          collection(db, "characters"),
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setChars(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [user.uid, isMaster]);

  const del = async (firestoreId) => {
    if (!window.confirm("Remover personagem?")) return;
    await deleteDoc(doc(db, "characters", firestoreId));
  };

  if (creating || editing) {
    return (
      <CharacterForm
        user={user}
        initial={editing}
        onBack={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="nav">
        <button className="btn-icon" onClick={() => setView("home")}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title">Personagens</div>
        <button className="btn-gold btn-sm" onClick={() => setCreating(true)}>
          <i className="fi fi-rr-plus" style={{ marginRight: 4 }}></i>Novo
        </button>
      </div>
      <div className="page">
        {loading && <LoadingScreen msg="Buscando personagens..." />}
        {!loading && chars.length === 0 && (
          <div className="text-center" style={{ padding: "48px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              <i
                className="fi fi-rr-castle"
                style={{ fontSize: 48, color: "var(--text3)" }}
              ></i>
            </div>
            <p className="muted">
              Nenhum personagem ainda.
              <br />
              Cria teu primeiro herói!
            </p>
          </div>
        )}
        {chars.map((c) => {
          const sys = TABLE_SYSTEMS.find((s) => s.id === c.system);
          const pct = Math.max(
            0,
            Math.min(100, (parseInt(c.hp || 0) / parseInt(c.maxHp || 1)) * 100),
          );
          return (
            <div
              key={c.firestoreId}
              className="card mb12"
              onClick={() => setEditing(c)}
              style={{ cursor: "pointer" }}
            >
              <div className="flex-between mb8">
                <div className="flex gap12" style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: "2px solid var(--border2)",
                      overflow: "hidden",
                      background: "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    ) : c.avatar?.startsWith("fi ") ? (
                      <i className={c.avatar} style={{ fontSize: 22 }}></i>
                    ) : (
                      <i
                        className="fi fi-rr-hat-wizard"
                        style={{ fontSize: 22 }}
                      ></i>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Cinzel,serif",
                        color: "var(--gold)",
                        fontSize: 16,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {c.name}
                    </div>
                    <div className="muted small">
                      {c.ownerName} ·{" "}
                      <>
                        {sys && (
                          <i
                            className={sys.icon}
                            style={{ marginRight: 4, fontSize: 12 }}
                          ></i>
                        )}
                        {sys?.name}
                      </>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hp-bar">
                <div className="hp-fill" style={{ width: pct + "%" }} />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "Cinzel,serif",
                  fontSize: 13,
                  color: "var(--text2)",
                  marginTop: 4,
                }}
              >
                {c.hp}/{c.maxHp} HP
              </div>
              {(isMaster || c.ownerId === user.uid) && (
                <button
                  className="btn-danger btn-sm mt8"
                  style={{ fontSize: 11 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    del(c.firestoreId);
                  }}
                >
                  <i className="fi fi-rr-trash"></i>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  INIMIGOS — FORMULÁRIO (sistema + tipo boss/comum)
//  Tem os mesmos campos de ficha que os personagens,
//  + Tipo de Criatura universal + mecânicas de Boss
// ─────────────────────────────────────────────────────────────
function EnemyForm({ user, onSave, onBack, initial }) {
  const [saving, setSaving] = useState(false);
  const [sys, setSys] = useState(initial?.system || "dnd5e");
  const [tab, setTab] = useState(0);

  const blank = (s) => {
    const t = SHEET_TEMPLATES[s];
    return {
      name: "",
      isBoss: false,
      system: s,
      type: "humanoide",
      cr: "1",
      hp: "20",
      maxHp: "20",
      ac: "12",
      avatar: "fi fi-rr-skull",
      avatarUrl: null,
      stats: Object.fromEntries(t.stats.map((x) => [x, "10"])),
      fields: Object.fromEntries(t.fields.map((x) => [x, ""])),
      extras: Object.fromEntries(t.extras.map((x) => [x, ""])),
      abilities: Object.fromEntries(t.abilities.map((x) => [x, "0"])),
      attacks: "",
      specialAbilities: "",
      loot: "",
      notes: "",
      legendaryActions: "",
      resistances: "",
    };
  };

  const [form, setForm] = useState(
    initial
      ? { ...blank(initial.system || "dnd5e"), ...initial }
      : blank("dnd5e"),
  );

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const changeSys = (s) => {
    setSys(s);
    const b = blank(s);
    setForm((f) => ({
      ...b,
      // preserva campos visuais e gerais ao trocar de sistema
      name: f.name,
      isBoss: f.isBoss,
      type: f.type,
      cr: f.cr,
      hp: f.hp,
      maxHp: f.maxHp,
      ac: f.ac,
      avatar: f.avatar,
      avatarUrl: f.avatarUrl,
      attacks: f.attacks,
      loot: f.loot,
      notes: f.notes,
    }));
  };

  const save = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    const data = clean({
      ...form,
      system: sys,
      creatorId: user.uid,
      updatedAt: Date.now(),
    });
    try {
      if (initial?.firestoreId) {
        await updateDoc(doc(db, "enemies", initial.firestoreId), data);
      } else {
        await addDoc(collection(db, "enemies"), {
          ...data,
          createdAt: Date.now(),
        });
      }
      onSave();
    } catch (e) {
      alert("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const tmpl = SHEET_TEMPLATES[sys];
  const tabs = [
    "Sistema",
    "Perfil",
    "Atributos",
    "Perícias",
    "Combate",
    "Notas",
  ];

  return (
    <div>
      <div className="nav">
        <button className="btn-icon" onClick={onBack}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title">
          {initial ? "Editar Inimigo" : "Novo Inimigo"}
        </div>
        <button className="btn-gold btn-sm" onClick={save} disabled={saving}>
          {saving ? "..." : "Salvar"}
        </button>
      </div>
      <div className="page">
        <div className="tab-bar mb16">
          {tabs.map((t, i) => (
            <button
              key={t}
              className={`tab${tab === i ? " active" : ""}`}
              onClick={() => setTab(i)}
              style={{ fontSize: 10 }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── tab 0: Sistema ── */}
        {tab === 0 && (
          <div>
            <div className="mb16">
              <div className="label mb8">Categoria</div>
              <div className="grid2">
                <div
                  className={`role-btn${!form.isBoss ? " active" : ""}`}
                  onClick={() => upd("isBoss", false)}
                >
                  <div className="role-icon">
                    <i className="fi fi-rr-skull"></i>
                  </div>
                  <div className="role-name">Inimigo Comum</div>
                  <div className="role-desc">Token tamanho normal no mapa</div>
                </div>
                <div
                  className={`role-btn${form.isBoss ? " active" : ""}`}
                  onClick={() => upd("isBoss", true)}
                  style={{
                    borderColor: form.isBoss ? "#c0392b" : "var(--border2)",
                  }}
                >
                  <div className="role-icon">
                    <i className="fi fi-rr-dragon"></i>
                  </div>
                  <div
                    className="role-name"
                    style={{ color: form.isBoss ? "#e05070" : "var(--gold)" }}
                  >
                    Chefão / Boss
                  </div>
                  <div className="role-desc">
                    Token 2× maior, ações lendárias
                  </div>
                </div>
              </div>
            </div>

            <div className="mb12">
              <div className="label">Sistema de Jogo</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TABLE_SYSTEMS.map((s) => (
                  <div
                    key={s.id}
                    className={`sys-pill${sys === s.id ? " active" : ""}`}
                    onClick={() => changeSys(s.id)}
                  >
                    <>
                      <i
                        className={s.icon}
                        style={{ marginRight: 5, fontSize: 13 }}
                      ></i>
                      {s.name}
                    </>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb12">
              <div className="label">Imagem / Avatar</div>
              <div style={{ marginBottom: 10 }}>
                <ImageUpload
                  value={form.avatarUrl || null}
                  onChange={(v) => upd("avatarUrl", v)}
                  size={form.isBoss ? 88 : 72}
                  label={null}
                  maxW={200}
                  maxH={200}
                  quality={0.84}
                />
              </div>
              <div className="label mb4" style={{ fontSize: 11 }}>
                Ou escolhe um ícone
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { k: "skull", cls: "fi fi-rr-skull" },
                  { k: "dragon", cls: "fi fi-rr-dragon" },
                  { k: "axe", cls: "fi fi-rr-axe" },
                  { k: "hammer", cls: "fi fi-rr-hammer" },
                  { k: "moon", cls: "fi fi-rr-moon" },
                  { k: "bug", cls: "fi fi-rr-bug" },
                  { k: "snake", cls: "fi fi-rr-worm" },
                  { k: "biohazard", cls: "fi fi-rr-biohazard" },
                  { k: "ghost", cls: "fi fi-rr-cloud" },
                  { k: "rock", cls: "fi fi-rr-mountains" },
                  { k: "paw", cls: "fi fi-rr-paw" },
                  { k: "crown", cls: "fi fi-rr-crown" },
                  { k: "eye", cls: "fi fi-rr-eye" },
                  { k: "swords", cls: "fi fi-rr-two-swords" },
                ].map((e) => (
                  <div
                    key={e.k}
                    onClick={() => upd("avatar", e.cls)}
                    style={{
                      width: 38,
                      height: 38,
                      border: `2px solid ${!form.avatarUrl && form.avatar === e.cls ? "var(--gold)" : "var(--border)"}`,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 19,
                      opacity: form.avatarUrl ? 0.5 : 1,
                    }}
                  >
                    <i className={e.cls}></i>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb12">
              <div className="label">Nome</div>
              <input
                value={form.name || ""}
                onChange={(e) => upd("name", e.target.value)}
                placeholder={form.isBoss ? "Nome do Chefão" : "Nome do monstro"}
              />
            </div>
            {/* Tipo de Criatura: universal, presente em todas as mesas */}
            <div className="grid2 mb12">
              <div>
                <div className="label">Tipo de Criatura</div>
                <input
                  value={form.type || ""}
                  onChange={(e) => upd("type", e.target.value)}
                  placeholder="Ex: Humanoide, Besta..."
                />
              </div>
              <div>
                <div className="label">ND / CR / Nível</div>
                <input
                  value={form.cr || ""}
                  onChange={(e) => upd("cr", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── tab 1: Perfil (fields + extras do sistema, igual personagens) ── */}
        {tab === 1 && (
          <div>
            <div className="label mb8" style={{ color: "var(--text2)" }}>
              Campos do sistema —{" "}
              {TABLE_SYSTEMS.find((s) => s.id === sys)?.name}
            </div>
            {tmpl.fields.map((f) => (
              <div key={f} className="mb12">
                <div className="label">{f}</div>
                <input
                  value={form.fields?.[f] || ""}
                  onChange={(e) =>
                    upd("fields", { ...form.fields, [f]: e.target.value })
                  }
                  placeholder={f}
                />
              </div>
            ))}
            <hr className="divider" />
            <div className="label mb8">Valores Extras</div>
            {tmpl.extras.map((e) => (
              <div key={e} className="mb12">
                <div className="label">{e}</div>
                <input
                  value={form.extras?.[e] || ""}
                  onChange={(ev) =>
                    upd("extras", { ...form.extras, [e]: ev.target.value })
                  }
                  placeholder={e}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── tab 2: Atributos ── */}
        {tab === 2 && (
          <div>
            <div className="grid3 mb12">
              <div>
                <div className="label">HP Atual</div>
                <input
                  type="number"
                  value={form.hp || ""}
                  onChange={(e) => upd("hp", e.target.value)}
                />
              </div>
              <div>
                <div className="label">HP Máx</div>
                <input
                  type="number"
                  value={form.maxHp || ""}
                  onChange={(e) => upd("maxHp", e.target.value)}
                />
              </div>
              <div>
                <div className="label">CA / Defesa</div>
                <input
                  type="number"
                  value={form.ac || ""}
                  onChange={(e) => upd("ac", e.target.value)}
                />
              </div>
            </div>
            <div className="label mb8">
              Atributos — {TABLE_SYSTEMS.find((s) => s.id === sys)?.name}
            </div>
            <div className="grid3">
              {tmpl.stats.map((s) => (
                <div key={s} className="stat-box">
                  <div className="stat-name">{s}</div>
                  <input
                    type="number"
                    value={form.stats?.[s] || "10"}
                    onChange={(e) =>
                      upd("stats", { ...form.stats, [s]: e.target.value })
                    }
                    style={{
                      textAlign: "center",
                      padding: "4px",
                      border: "none",
                      background: "transparent",
                      color: "var(--gold-l)",
                      fontFamily: "Cinzel,serif",
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  />
                  {(sys === "dnd5e" || sys === "pathfinder") && (
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>
                      {statMod(form.stats?.[s])}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {form.isBoss && (
              <div className="card2 mt16">
                <div
                  style={{
                    fontFamily: "Cinzel,serif",
                    color: "#e05070",
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  <i className="fi fi-rr-crown" style={{ marginRight: 5 }}></i>
                  Mecânicas de Chefão
                </div>
                <div className="mb12">
                  <div className="label">Ações Lendárias / Especiais</div>
                  <textarea
                    rows={3}
                    value={form.legendaryActions || ""}
                    onChange={(e) => upd("legendaryActions", e.target.value)}
                    placeholder="Descreve as ações lendárias..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                <div>
                  <div className="label">Resistências / Imunidades</div>
                  <textarea
                    rows={2}
                    value={form.resistances || ""}
                    onChange={(e) => upd("resistances", e.target.value)}
                    placeholder="Imune a fogo, resistente a veneno..."
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── tab 3: Perícias (abilities do sistema, igual personagens) ── */}
        {tab === 3 && (
          <div>
            <div className="label mb8">
              Perícias & Habilidades —{" "}
              {TABLE_SYSTEMS.find((s) => s.id === sys)?.name}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px",
                gap: 8,
                alignItems: "center",
              }}
            >
              {tmpl.abilities.map((a) => (
                <>
                  <div key={a + "l"} style={{ fontSize: 14 }}>
                    {a}
                  </div>
                  <input
                    key={a}
                    type="number"
                    min="0"
                    max="10"
                    value={form.abilities?.[a] || "0"}
                    onChange={(e) =>
                      upd("abilities", {
                        ...form.abilities,
                        [a]: e.target.value,
                      })
                    }
                    style={{ textAlign: "center" }}
                  />
                </>
              ))}
            </div>
          </div>
        )}

        {/* ── tab 4: Combate ── */}
        {tab === 4 && (
          <div>
            <div className="mb12">
              <div className="label">Ataques</div>
              <textarea
                rows={4}
                value={form.attacks || ""}
                onChange={(e) => upd("attacks", e.target.value)}
                placeholder="Ex: Garra +5, 2d6+3 cortante&#10;Mordida +7, 3d8+4 perfurante"
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="mb12">
              <div className="label">Habilidades Especiais</div>
              <textarea
                rows={3}
                value={form.specialAbilities || ""}
                onChange={(e) => upd("specialAbilities", e.target.value)}
                placeholder="Sentidos especiais, visão no escuro..."
                style={{ resize: "vertical" }}
              />
            </div>
            <div>
              <div className="label">Saque / Loot</div>
              <input
                value={form.loot || ""}
                onChange={(e) => upd("loot", e.target.value)}
                placeholder="50po, Espada +1, Grimório..."
              />
            </div>
          </div>
        )}

        {/* ── tab 5: Notas ── */}
        {tab === 5 && (
          <div>
            <div className="label">Anotações do Mestre</div>
            <textarea
              rows={8}
              value={form.notes || ""}
              onChange={(e) => upd("notes", e.target.value)}
              placeholder="Comportamento, motivações, fraquezas secretas..."
              style={{ resize: "vertical" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  INIMIGOS — LISTAGEM (Firestore onSnapshot)
// ─────────────────────────────────────────────────────────────
function EnemiesScreen({ user, setView }) {
  const [enemies, setEnemies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "enemies"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEnemies(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Remover inimigo?")) return;
    await deleteDoc(doc(db, "enemies", id));
  };

  if (creating || editing) {
    return (
      <EnemyForm
        user={user}
        initial={editing}
        onBack={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSave={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="nav">
        <button className="btn-icon" onClick={() => setView("home")}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title">Inimigos</div>
        <button className="btn-gold btn-sm" onClick={() => setCreating(true)}>
          <i className="fi fi-rr-plus" style={{ marginRight: 4 }}></i>Novo
        </button>
      </div>
      <div className="page">
        {loading && <LoadingScreen msg="Buscando inimigos..." />}
        {!loading && enemies.length === 0 && (
          <div className="text-center" style={{ padding: "48px 0" }}>
            <div style={{ fontSize: 48 }}>
              <i
                className="fi fi-rr-dragon"
                style={{ fontSize: 48, color: "var(--text3)" }}
              ></i>
            </div>
            <p className="muted">Nenhum inimigo criado.</p>
          </div>
        )}
        {enemies.map((e) => {
          const pct = Math.max(
            0,
            Math.min(100, (parseInt(e.hp || 0) / parseInt(e.maxHp || 1)) * 100),
          );
          const sys = TABLE_SYSTEMS.find((s) => s.id === e.system);
          return (
            <div
              key={e.firestoreId}
              className="card mb12"
              onClick={() => setEditing(e)}
              style={{
                cursor: "pointer",
                borderColor: e.isBoss ? "rgba(192,57,43,.4)" : "var(--border)",
              }}
            >
              {e.isBoss && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(90deg,#c0392b,#e05070,#c0392b)",
                    borderRadius: "12px 12px 0 0",
                  }}
                />
              )}
              <div className="flex-between mb8">
                <div className="flex gap12" style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: e.isBoss ? 52 : 44,
                      height: e.isBoss ? 52 : 44,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `2px solid ${e.isBoss ? "#c0392b" : "var(--border2)"}`,
                      overflow: "hidden",
                      background: "var(--surface)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: e.isBoss ? 30 : 24,
                      boxShadow: e.isBoss
                        ? "0 0 12px rgba(192,57,43,.4)"
                        : "none",
                    }}
                  >
                    {e.avatarUrl ? (
                      <img
                        src={e.avatarUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt=""
                      />
                    ) : e.avatar?.startsWith("fi ") ? (
                      <i className={e.avatar} style={{ fontSize: 22 }}></i>
                    ) : (
                      <i
                        className="fi fi-rr-skull"
                        style={{ fontSize: 22 }}
                      ></i>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Cinzel,serif",
                        color: "var(--gold)",
                        fontSize: 16,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {e.name}
                    </div>
                    <div className="flex gap4 mt4">
                      {e.isBoss && (
                        <span
                          className="badge badge-red"
                          style={{ fontSize: 10 }}
                        >
                          <i
                            className="fi fi-rr-crown"
                            style={{ marginRight: 3 }}
                          ></i>
                          Boss
                        </span>
                      )}
                      {sys && (
                        <span
                          className="badge badge-gold"
                          style={{ fontSize: 10 }}
                        >
                          <i
                            className={sys.icon}
                            style={{ marginRight: 4 }}
                          ></i>
                          {sys.name}
                        </span>
                      )}
                    </div>
                    <div className="muted small">
                      {e.type} · ND {e.cr} · CA {e.ac}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hp-bar">
                <div
                  className="hp-fill"
                  style={{
                    width: pct + "%",
                    background: e.isBoss
                      ? "linear-gradient(90deg,#8b0000,#e05070)"
                      : "",
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontFamily: "Cinzel,serif",
                  fontSize: 13,
                  color: "var(--text2)",
                  marginTop: 4,
                }}
              >
                {e.hp}/{e.maxHp} HP
              </div>
              <button
                className="btn-danger btn-sm mt8"
                style={{ fontSize: 11 }}
                onClick={(ev) => {
                  ev.stopPropagation();
                  del(e.firestoreId);
                }}
              >
                <i className="fi fi-rr-trash"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CALENDÁRIO
//  • Ano inicial 1873 (ambientação Deadlands / período)
//  • Todos os usuários vêem — só Mestre adiciona/remove eventos
//  • Ao abrir, navega para o último dia com evento (ou Jan 1873)
// ─────────────────────────────────────────────────────────────
const CAL_START_YEAR = 1873;

function CalendarScreen({ user, setView }) {
  const isMaster = user.role === "master";

  const [yr, setYr] = useState(CAL_START_YEAR);
  const [mo, setMo] = useState(0);
  const [sel, setSel] = useState(null);
  const [events, setEvents] = useState([]);
  const loadedRef = useRef(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", type: "sessão" });
  const [saving, setSaving] = useState(false);

  // Todos os eventos (Mestre filtra por si; todos vêem tudo)
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const evs = snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
      setEvents(evs);

      // Na primeira carga, navega para o último evento
      if (!loadedRef.current) {
        loadedRef.current = true;
        if (evs.length > 0) {
          const last = evs[evs.length - 1];
          const [y, m, d] = last.date.split("-").map(Number);
          setYr(y);
          setMo(m - 1);
          setSel(d);
        }
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selKey = sel ? dateKey(yr, mo, sel) : null;
  const dayEvents = sel ? events.filter((e) => e.date === selKey) : [];
  const cells = buildCalDays(yr, mo);

  const addEvent = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await addDoc(
        collection(db, "events"),
        clean({
          ...form,
          date: selKey,
          masterId: user.uid,
          createdAt: Date.now(),
        }),
      );
      setShowForm(false);
      setForm({ title: "", desc: "", type: "sessão" });
    } finally {
      setSaving(false);
    }
  };

  const delEvent = async (id) => {
    if (!isMaster) return;
    await deleteDoc(doc(db, "events", id));
  };

  const prevMo = () => {
    if (mo === 0) {
      setMo(11);
      setYr((y) => y - 1);
    } else setMo((m) => m - 1);
    setSel(null);
  };
  const nextMo = () => {
    if (mo === 11) {
      setMo(0);
      setYr((y) => y + 1);
    } else setMo((m) => m + 1);
    setSel(null);
  };

  return (
    <div>
      <div className="nav">
        <button className="btn-icon" onClick={() => setView("home")}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title">Calendário da Campanha</div>
        {isMaster && sel && (
          <button className="btn-gold btn-sm" onClick={() => setShowForm(true)}>
            <i className="fi fi-rr-plus" style={{ marginRight: 4 }}></i>Evento
          </button>
        )}
      </div>
      <div className="page">
        {/* Cabeçalho mês/ano */}
        <div className="flex-between mb4">
          <button className="btn-icon" onClick={prevMo}>
            <i className="fi fi-rr-arrow-left"></i>
          </button>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "Cinzel,serif",
                color: "var(--gold)",
                fontSize: 16,
              }}
            >
              {MONTHS[mo]}
            </div>
            <div
              style={{
                fontFamily: "Cinzel,serif",
                color: "var(--text2)",
                fontSize: 13,
              }}
            >
              {yr}
            </div>
          </div>
          <button className="btn-icon" onClick={nextMo}>
            <i className="fi fi-rr-arrow-right"></i>
          </button>
        </div>

        {/* Atalho de ano */}
        <div className="flex gap8 mb12" style={{ justifyContent: "center" }}>
          <button
            className="btn-outline btn-sm"
            style={{ fontSize: 11 }}
            onClick={() => {
              setYr(CAL_START_YEAR);
              setMo(0);
              setSel(null);
            }}
          >
            ↩ {CAL_START_YEAR}
          </button>
          <input
            type="number"
            value={yr}
            onChange={(e) => setYr(Number(e.target.value))}
            style={{
              width: 80,
              textAlign: "center",
              padding: "6px 8px",
              fontSize: 13,
            }}
          />
        </div>

        {/* Grade */}
        <div className="cal-grid mb8">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--text3)",
                fontFamily: "Cinzel,serif",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="cal-grid mb16">
          {cells.map((c, i) => {
            const key = c.cur ? dateKey(yr, mo, c.day) : null;
            const hasEv = key && events.some((e) => e.date === key);
            return (
              <div
                key={i}
                className={`cal-day${!c.cur ? " other-month" : ""}${hasEv ? " has-event" : ""}`}
                onClick={() => c.cur && setSel(c.day)}
              >
                {sel === c.day && c.cur && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: "1.5px solid var(--gold)",
                      borderRadius: 8,
                    }}
                  />
                )}
                {c.day}
              </div>
            );
          })}
        </div>

        {/* Eventos do dia */}
        {sel && (
          <div>
            <div className="flex-between mb10">
              <h4 style={{ fontSize: 14 }}>
                {sel} de {MONTHS[mo]}, {yr}
              </h4>
            </div>
            {dayEvents.length === 0 && (
              <p className="muted small">
                {isMaster
                  ? "Nenhum evento. Toca em + Evento."
                  : "Nenhum evento neste dia."}
              </p>
            )}
            {dayEvents.map((ev) => (
              <div key={ev.firestoreId} className="card mb8">
                <div className="flex-between">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      className={`badge ${ev.type === "sessão" ? "badge-gold" : ev.type === "combate" ? "badge-red" : "badge-blue"}`}
                    >
                      {ev.type}
                    </span>
                    <div
                      style={{
                        fontFamily: "Cinzel,serif",
                        marginTop: 6,
                        fontSize: 15,
                      }}
                    >
                      {ev.title}
                    </div>
                    {ev.desc && (
                      <div className="muted small mt8">{ev.desc}</div>
                    )}
                  </div>
                  {isMaster && (
                    <button
                      className="btn-icon btn-sm"
                      style={{ marginLeft: 8 }}
                      onClick={() => delEvent(ev.firestoreId)}
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!sel && events.length > 0 && (
          <div>
            <div className="label mb8">Próximos eventos</div>
            {events
              .slice(-5)
              .reverse()
              .map((ev) => (
                <div
                  key={ev.firestoreId}
                  className="card mb8"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const [y, m, d] = ev.date.split("-").map(Number);
                    setYr(y);
                    setMo(m - 1);
                    setSel(d);
                  }}
                >
                  <div className="flex gap8">
                    <span
                      className={`badge ${ev.type === "sessão" ? "badge-gold" : ev.type === "combate" ? "badge-red" : "badge-blue"}`}
                    >
                      {ev.type}
                    </span>
                    <div>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: 14 }}>
                        {ev.title}
                      </div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {ev.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {isMaster && showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>
              Novo Evento — {sel}/{mo + 1}/{yr}
            </h3>
            <div className="mb12">
              <div className="label">Tipo</div>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>sessão</option>
                <option>combate</option>
                <option>festival</option>
                <option>viagem</option>
                <option>batalha</option>
                <option>outro</option>
              </select>
            </div>
            <div className="mb12">
              <div className="label">Título</div>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nome do evento"
              />
            </div>
            <div className="mb16">
              <div className="label">Descrição</div>
              <textarea
                rows={3}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="Notas..."
                style={{ resize: "vertical" }}
              />
            </div>
            <button className="btn-gold" onClick={addEvent} disabled={saving}>
              {saving ? "..." : "Adicionar Evento"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SALAS DE COMBATE (Firestore metadados + RTDB combate)
// ─────────────────────────────────────────────────────────────
function RoomsScreen({ user, setView, setActiveRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    system: "dnd5e",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const isMaster = user.role === "master";

  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRooms(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const createRoom = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      // 1) Cria documento de metadados no Firestore
      const docRef = await addDoc(
        collection(db, "rooms"),
        clean({
          name: form.name,
          system: form.system,
          description: form.description,
          masterId: user.uid,
          masterName: user.name,
          createdAt: Date.now(),
        }),
      );
      // 2) Cria nó de combate no Realtime Database — usa teu combat.js
      await createCombatRoom(docRef.id, {
        tokens: {},
        initiative: [],
        currentTurn: 0,
        round: 1,
        mapBg: "",
        log: {},
        active: true,
      });
      setShowForm(false);
      setForm({ name: "", system: "dnd5e", description: "" });
    } catch (e) {
      alert("Erro ao criar sala: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const delRoom = async (room) => {
    if (!window.confirm("Encerrar esta sala?")) return;
    await deleteDoc(doc(db, "rooms", room.firestoreId));
    await remove(ref(rtdb, `rooms/${room.firestoreId}`));
  };

  return (
    <div>
      <div className="nav">
        <button className="btn-icon" onClick={() => setView("home")}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title">Salas de Combate</div>
        {isMaster && (
          <button className="btn-gold btn-sm" onClick={() => setShowForm(true)}>
            <i className="fi fi-rr-plus" style={{ marginRight: 4 }}></i>Criar
          </button>
        )}
      </div>
      <div className="page">
        {loading && <LoadingScreen msg="Buscando salas..." />}
        {!loading && rooms.length === 0 && (
          <div className="text-center" style={{ padding: "48px 0" }}>
            <div style={{ fontSize: 48 }}>
              <i
                className="fi fi-rr-map"
                style={{ fontSize: 48, color: "var(--text3)" }}
              ></i>
            </div>
            <p className="muted">
              {isMaster
                ? "Cria uma sala de combate!"
                : "Aguarda o Mestre criar uma sala."}
            </p>
          </div>
        )}
        {rooms.map((r) => {
          const sys = TABLE_SYSTEMS.find((s) => s.id === r.system);
          const link = `${window.location.origin}/combat/${r.firestoreId}`;
          return (
            <div key={r.firestoreId} className="room-card mb12">
              <div className="flex-between mb8">
                <div>
                  <div
                    style={{
                      fontFamily: "Cinzel,serif",
                      color: "var(--gold)",
                      fontSize: 16,
                    }}
                  >
                    {r.name}
                  </div>
                  <div className="muted small">
                    <>
                      {sys && (
                        <i
                          className={sys.icon}
                          style={{ marginRight: 4, fontSize: 12 }}
                        ></i>
                      )}
                      {sys?.name}
                    </>{" "}
                    · Mestre: {r.masterName}
                  </div>
                </div>
                <div className="flex gap8">
                  <div className="live-dot" />
                  <span className="badge badge-green" style={{ fontSize: 10 }}>
                    <i
                      className="fi fi-rr-signal-stream"
                      style={{ marginRight: 3 }}
                    ></i>
                    AO VIVO
                  </span>
                </div>
              </div>
              {r.description && (
                <p className="muted small mb8">{r.description}</p>
              )}
              <div className="share-box mb8">
                <i className="fi fi-rr-link" style={{ marginRight: 6 }}></i>
                {link}
              </div>
              <div className="flex gap8">
                <button
                  className="btn-gold btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setActiveRoom(r);
                    setView("combat");
                  }}
                >
                  Entrar na Sala
                </button>
                {isMaster && r.masterId === user.uid && (
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => delRoom(r)}
                  >
                    <i className="fi fi-rr-trash"></i>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>
              Nova Sala de Combate
            </h3>
            <div className="mb12">
              <div className="label">Nome da Sala</div>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Caverna do Dragão..."
              />
            </div>
            <div className="mb12">
              <div className="label">Sistema</div>
              <select
                value={form.system}
                onChange={(e) => setForm({ ...form, system: e.target.value })}
              >
                {TABLE_SYSTEMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    <>{s.name}</>
                  </option>
                ))}
              </select>
            </div>
            <div className="mb16">
              <div className="label">Descrição</div>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Contexto da batalha..."
                style={{ resize: "vertical" }}
              />
            </div>
            <button
              className="btn-gold"
              onClick={createRoom}
              disabled={creating}
            >
              {creating ? "Criando..." : "Criar Sala"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BULK HP INPUT — campo para digitar dano/cura em quantidade
// ─────────────────────────────────────────────────────────────
function BulkHpInput({ token, onApply }) {
  const [val, setVal] = useState("");
  const apply = (sign) => {
    const n = parseInt(val);
    if (!n || isNaN(n)) return;
    onApply(token, sign * Math.abs(n));
    setVal("");
  };
  return (
    <div className="flex gap4" style={{ marginTop: 2 }}>
      <input
        type="number"
        min="1"
        placeholder="qtd"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        style={{
          width: 52,
          padding: "4px 6px",
          fontSize: 12,
          textAlign: "center",
          color: "var(--text)",
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          borderRadius: "var(--radius)",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply(-1);
        }}
      />
      <button
        onClick={() => apply(1)}
        style={{
          padding: "4px 7px",
          borderRadius: 6,
          border: "1px solid var(--green-l)",
          background: "rgba(26,74,42,.3)",
          color: "var(--green-l)",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "Cinzel,serif",
        }}
      >
        +curar
      </button>
      <button
        onClick={() => apply(-1)}
        style={{
          padding: "4px 7px",
          borderRadius: 6,
          border: "1px solid var(--red-l)",
          background: "rgba(155,35,53,.2)",
          color: "var(--red-l)",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "Cinzel,serif",
        }}
      >
        -dano
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ARENA DE COMBATE — TEMPO REAL via RTDB
//  • Mapa 2400×1800 px, rolável em toda a tela do celular
//  • Tokens criados a partir das fichas existentes no Firestore
//  • Player só arrasta tokens do próprio personagem (ownerId)
//  • Mapa de fundo via upload de imagem do dispositivo
//  • Boss token 2× maior
//  • Iniciativa por dado do sistema
//  • Painel de iniciativa flutuante + painel de dados flutuante
// ─────────────────────────────────────────────────────────────
const MAP_W = 2400;
const MAP_H = 1800;
const CELL = 60;

// Dado de iniciativa SUGERIDO por sistema (aparece em destaque)
const SYSTEM_INIT_DICE = {
  dnd5e: [20],
  pathfinder: [20],
  witcher: [10],
  deadlands: [4, 6, 8, 10, 12],
  cthulhu: [10],
  vampiro: [10],
};
// Todos os dados disponíveis para iniciativa (sempre mostrados)
const ALL_INIT_DICE = [4, 6, 8, 10, 12, 20, 53, 100];

// Tamanho do token em px (base 52 para comum, 88 para boss)
const tokenSize = (isBoss) => (isBoss ? 90 : 52);

// Renderiza o avatar do token: foto > emoji
function TokenFace({ t, size = 40 }) {
  if (t.avatarUrl)
    return (
      <img
        src={t.avatarUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "50%",
        }}
        alt=""
      />
    );
  const isFiClass = (t.avatar || "").startsWith("fi ");
  return isFiClass ? (
    <i className={t.avatar} style={{ fontSize: size * 0.45 }}></i>
  ) : (
    <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>
      {t.avatar || <i className="fi fi-rr-sword"></i>}
    </span>
  );
}

function CombatArena({ user, room, setView }) {
  const roomId = room.firestoreId;
  const rtdbPath = `rooms/${roomId}`;
  const isMaster = user.role === "master";

  // ── Estado RTDB (sincronizado em tempo real) ───────────────
  const [tokens, setTokens] = useState({});
  const [initiative, setInitiative] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [mapBg, setMapBg] = useState("");
  const [log, setLog] = useState([]);

  // ── Estado local ───────────────────────────────────────────
  const [tab, setTab] = useState("map");
  const [diceResult, setDiceResult] = useState(null);
  const [diceCount, setDiceCount] = useState(1);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showAddInit, setShowAddInit] = useState(false);
  const [initForm, setInitForm] = useState({
    tokenId: null,
    name: "",
    roll: "10",
    isEnemy: false,
    avatarUrl: null,
    avatar: "fi fi-rr-sword",
  });
  const [uploadingMap, setUploadingMap] = useState(false);
  // Personagens e inimigos do Firestore
  const [fsChars, setFsChars] = useState([]);
  const [fsEnemies, setFsEnemies] = useState([]);
  const [tokenTab, setTokenTab] = useState("chars");
  // Painéis flutuantes no mapa
  const [showInitPanel, setShowInitPanel] = useState(false);
  const [showDicePanel, setShowDicePanel] = useState(false);
  // Roller por texto ("3d8+2" etc)
  const [diceExpr, setDiceExpr] = useState("");
  const [diceExprResult, setDiceExprResult] = useState(null);

  const [showSideMenu, setShowSideMenu] = useState(false);
  const [sideMenuTab, setSideMenuTab] = useState("initiative");

  const mapRef = useRef(null); // o canvas grande (2400×1800)
  const scrollRef = useRef(null); // o container rolável
  const dragging = useRef(null); // { id, startX, startY }
  const mapBgInputRef = useRef();

  const [viewingSheet, setViewingSheet] = useState(null); // { type:"char"|"enemy", data:obj }

  const [zoom, setZoom] = useState(0.65);
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 1.5;
  const ZOOM_STEP = 0.15;

  const [showTurnBanner, setShowTurnBanner] = useState(false);

  // Mostrar turno atual no centro da tela a cada mudança, por 2 segundos
  useEffect(() => {
    if (!initiative.length) return;
    setShowTurnBanner(true);
    const timer = setTimeout(() => setShowTurnBanner(false), 3000);
    return () => clearTimeout(timer);
  }, [currentTurn, initiative]);

  // ── 1) Listener RTDB ──────────────────────────────────────
  useEffect(() => {
    const unsub = listenCombat(roomId, (data) => {
      if (!data) return;
      setTokens(data.tokens || {});
      setInitiative(Array.isArray(data.initiative) ? data.initiative : []);
      setCurrentTurn(data.currentTurn ?? 0);
      setRound(data.round || 1);
      setMapBg(data.mapBg || "");
      const arr = data.log
        ? Object.values(data.log)
            .sort((a, b) => b.ts - a.ts)
            .slice(0, 80)
        : [];
      setLog(arr);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [roomId]);

  // ── 2) Personagens e inimigos do Firestore ─────────────────
  useEffect(() => {
    if (!showAddToken) return;
    const qC = query(
      collection(db, "characters"),
      where("system", "==", room.system),
      orderBy("createdAt", "desc"),
    );
    const qE = query(
      collection(db, "enemies"),
      where("system", "==", room.system),
      orderBy("createdAt", "desc"),
    );
    const u1 = onSnapshot(qC, (s) =>
      setFsChars(s.docs.map((d) => ({ firestoreId: d.id, ...d.data() }))),
    );
    const u2 = onSnapshot(qE, (s) =>
      setFsEnemies(s.docs.map((d) => ({ firestoreId: d.id, ...d.data() }))),
    );
    return () => {
      u1();
      u2();
    };
  }, [showAddToken]);

  // ── 3) Helpers RTDB ───────────────────────────────────────
  const pushLog = useCallback(
    async (msg) => {
      await push(ref(rtdb, `${rtdbPath}/log`), {
        msg,
        author: user.name,
        ts: Date.now(),
      });
    },
    [rtdbPath, user.name],
  );

  const rtdbUpdate = useCallback(async (path, data) => {
    await update(ref(rtdb, path), data);
  }, []);

  // ── 4) Drag de tokens ─────────────────────────────────────
  //  Mestre: arrasta qualquer token (vivo ou morto)
  //  Player: arrasta somente os seus, e somente se estiver vivo
  const isDead = (token) => parseInt(token.hp || 0) <= 0;

  const canDrag = (token) => {
    if (isMaster) return true; // mestre move qualquer um
    if (isDead(token)) return false; // token morto: ninguém além do mestre
    return token.ownerId === user.uid; // player: só o próprio
  };

  const getCanvasPos = (e) => {
    if (!mapRef.current) return { x: MAP_W / 2, y: MAP_H / 2 };
    const rect = mapRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(22, Math.min(MAP_W - 22, (cx - rect.left) / zoom)),
      y: Math.max(22, Math.min(MAP_H - 22, (cy - rect.top) / zoom)),
    };
  };

  const onTokenPointerDown = (e, tokenId) => {
    const tok = tokens[tokenId];
    if (!tok || !canDrag(tok)) return;
    e.stopPropagation();
    dragging.current = tokenId;
    document.addEventListener("mousemove", onPointerMove, { passive: false });
    mapRef.current.addEventListener("touchmove", onPointerMove, {
      passive: false,
    });
    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("touchend", onPointerUp);
  };

  const onPointerMove = useCallback((e) => {
    if (!dragging.current || !mapRef.current) return;
    if (e.cancelable) e.preventDefault();
    const { x, y } = getCanvasPos(e);
    setTokens((prev) => ({
      ...prev,
      [dragging.current]: { ...prev[dragging.current], x, y },
    }));
  }, []);

  const onPointerUp = useCallback(async () => {
    if (!dragging.current) return;
    const id = dragging.current;
    dragging.current = null;
    document.removeEventListener("mousemove", onPointerMove);
    mapRef.current?.removeEventListener("touchmove", onPointerMove);
    document.removeEventListener("mouseup", onPointerUp);
    document.removeEventListener("touchend", onPointerUp);
    // Persiste posição final no RTDB (em pixels do canvas grande)
    setTokens((prev) => {
      const t = prev[id];
      if (t) fbMoveToken(roomId, id, t.x, t.y);
      return prev;
    });
  }, [onPointerMove, roomId]);

  // ── 5) Dados — rolagem padrão e por expressão ─────────────
  const rollDice = async (sides, count = diceCount) => {
    const results = Array.from({ length: count }, () => rollDie(sides));
    const total = results.reduce((a, b) => a + b, 0);
    setDiceResult({ sides, results, total, count });
    await pushLog(
      `${user.name} rolou ${count}d${sides}: [${results.join(", ")}] = ${total}`,
    );
  };

  const rollExpr = async () => {
    const raw = diceExpr.trim().toLowerCase();

    // Regex que captura múltiplos grupos de dados e bônus
    // Suporta: 1d6+1d8, 2d6+3, 1d8+2+1d6, 3d4-1, etc.
    const dicePattern = /(\d+)d(\d+)/g;
    const bonusPattern = /([+-]\d+)(?!d)/g;

    const diceMatches = [...raw.matchAll(dicePattern)];
    if (diceMatches.length === 0) {
      setDiceExprResult("Formato inválido. Ex: 1d6+1d8, 2d6+3");
      return;
    }

    let total = 0;
    const parts = [];

    // Rola cada grupo de dados
    for (const m of diceMatches) {
      const n = Math.min(parseInt(m[1]), 99);
      const s = Math.min(parseInt(m[2]), 1000);
      const rolls = Array.from({ length: n }, () => rollDie(s));
      const sum = rolls.reduce((a, b) => a + b, 0);
      total += sum;
      parts.push(`${n}d${s}:[${rolls.join("+")}]=${sum}`);
    }

    // Soma bônus fixos (números sem dado)
    const bonusOnly = raw.replace(/\d+d\d+/g, "");
    const bonusMatches = [...bonusOnly.matchAll(/([+-]\d+)/g)];
    let bonus = 0;
    for (const m of bonusMatches) {
      bonus += parseInt(m[1]);
    }
    total += bonus;

    const label =
      diceMatches.map((m) => `${m[1]}d${m[2]}`).join("+") +
      (bonus !== 0 ? (bonus > 0 ? `+${bonus}` : `${bonus}`) : "");

    setDiceExprResult({ label, parts, total, bonus });
    await pushLog(
      `${user.name} rolou ${label}: ${parts.join(" | ")}${bonus ? ` + ${bonus}` : ""} = ${total}`,
    );
  };

  // ── 6) Tokens criados a partir de fichas existentes ────────
  const spawnToken = async (source, isEnemy) => {
    const id = uid();
    const sz = tokenSize(source.isBoss);
    const x = 600 + Math.random() * (MAP_W - 1200);
    const y = 400 + Math.random() * (MAP_H - 800);

    // Conta quantos tokens com o mesmo nome já existem
    const sameNameCount = Object.values(tokens).filter(
      (t) => t.name === source.name || t.name.startsWith(source.name + " "),
    ).length;

    // Nome final com numeração se já houver duplicatas
    const tokenName =
      sameNameCount === 0 ? source.name : `${source.name} ${sameNameCount + 1}`;

    const token = clean({
      id,
      name: tokenName, // ← usa o nome com número
      avatar: source.avatar || "fi fi-rr-sword",
      avatarUrl: source.avatarUrl || null,
      isEnemy,
      isBoss: source.isBoss || false,
      tokenSize: sz,
      hp: source.hp || "20",
      maxHp: source.maxHp || "20",
      ownerId: source.ownerId || null,
      x,
      y,
    });

    await rtdbUpdate(`${rtdbPath}/tokens/${id}`, token);
    await pushLog(
      `Token "${tokenName}"${source.isBoss ? " [BOSS]" : ""} adicionado ao mapa`,
    );
    setShowAddToken(false);
  };

  const removeToken = async (id, name) => {
    await remove(ref(rtdb, `${rtdbPath}/tokens/${id}`));
    await pushLog(`Token "${name}" removido`);
  };

  const changeTokenHp = async (token, delta) => {
    const newHp = Math.max(
      0,
      Math.min(parseInt(token.maxHp || 20), parseInt(token.hp || 0) + delta),
    );
    await rtdbUpdate(`${rtdbPath}/tokens/${token.id}`, { hp: String(newHp) });
    if (delta !== 0) await pushLog(`${token.name}: HP ${token.hp} → ${newHp}`);
  };

  // ── 7) Mapa de fundo via upload do dispositivo ─────────────
  const handleMapUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMap(true);
    try {
      // Comprime para max 1280×960, JPEG 70% → ~60–150 KB em base64
      const b64 = await compressImage(file, 1280, 960, 0.7);
      await rtdbUpdate(rtdbPath, { mapBg: b64 });
      await pushLog("Mapa de fundo atualizado");
    } catch (err) {
      alert("Erro ao processar imagem: " + err.message);
    } finally {
      setUploadingMap(false);
      e.target.value = "";
    }
  };

  const clearMap = async () => {
    await rtdbUpdate(rtdbPath, { mapBg: "" });
    await pushLog("Mapa de fundo removido");
  };

  // ── 8) Iniciativa ──────────────────────────────────────────
  const addInit = async () => {
    if (!initForm.name.trim()) return;
    const newList = [...initiative, { ...initForm, id: uid() }].sort(
      (a, b) => parseInt(b.roll) - parseInt(a.roll),
    );
    await rtdbUpdate(rtdbPath, { initiative: newList, currentTurn: 0 });
    setShowAddInit(false);
    setInitForm({
      tokenId: null,
      name: "",
      roll: "10",
      isEnemy: false,
      avatarUrl: null,
      avatar: "fi fi-rr-sword",
    });
  };

  const removeInit = async (id) => {
    const newList = initiative.filter((x) => x.id !== id);
    await rtdbUpdate(rtdbPath, { initiative: newList, currentTurn: 0 });
  };

  const doNextTurn = async () => {
    if (initiative.length === 0) return;
    await fbNextTurn(roomId, currentTurn, initiative.length);
    const next = (currentTurn + 1) % initiative.length;
    const newRound = next === 0 ? round + 1 : round;
    if (next === 0) await rtdbUpdate(rtdbPath, { round: newRound });
    await pushLog(`▶ Turno de ${initiative[next]?.name} (Round ${newRound})`);
  };

  const tokenArr = Object.values(tokens);
  const SYS_NAME = TABLE_SYSTEMS.find((s) => s.id === room.system)?.name || "";
  const systemInitDice = SYSTEM_INIT_DICE[room.system] || [20];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)" }}>
      <div className="nav" style={{ maxWidth: "100%" }}>
        <button className="btn-icon" onClick={() => setView("rooms")}>
          <i className="fi fi-rr-arrow-left"></i>
        </button>
        <div className="nav-title" style={{ fontSize: 13 }}>
          {room.name}
        </div>
        <div className="flex gap8">
          <div className="live-dot" />
          <span className="badge badge-green" style={{ fontSize: 10 }}>
            <i
              className="fi fi-rr-signal-stream"
              style={{ marginRight: 3 }}
            ></i>
            AO VIVO
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div
          className="tab-bar"
          style={{
            margin: "8px 12px 0",
            borderRadius: 8,
            background: "var(--surface)",
          }}
        >
          {["map", "tokens", "log"].map((t) => (
            <button
              key={t}
              className={`tab${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
              style={{ fontSize: 11 }}
            >
              {t === "map" ? (
                <>
                  <i className="fi fi-rr-map"></i> Mapa
                </>
              ) : t === "tokens" ? (
                <>
                  <i className="fi fi-rr-sword"></i> Tokens
                </>
              ) : (
                <>
                  <i className="fi fi-rr-scroll"></i> Log
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ════ MAPA ════════════════════════════════════════════ */}
      {tab === "map" && (
        <div style={{ position: "relative" }}>
          <div
            ref={scrollRef}
            style={{
              width: "100vw",
              height: "calc(100vh - 112px)",
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
              background: "#050709",
            }}
          >
            <div
              style={{
                width: MAP_W * zoom,
                height: MAP_H * zoom,
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                ref={mapRef}
                style={{
                  width: MAP_W + "px",
                  height: MAP_H + "px",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  background: mapBg
                    ? `url(${mapBg}) left top / cover no-repeat`
                    : "linear-gradient(135deg,#0d1117 0%,#1a1030 40%,#0d1520 70%,#080b12 100%)",
                }}
              >
                <svg
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.18,
                    pointerEvents: "none",
                  }}
                >
                  <defs>
                    <pattern
                      id="combatgrid"
                      width={CELL}
                      height={CELL}
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#combatgrid)" />
                </svg>
                {!mapBg && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      opacity: 0.15,
                      textAlign: "center",
                      pointerEvents: "none",
                      color: "var(--text2)",
                      fontSize: 14,
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 8 }}>
                      <i
                        className="fi fi-rr-map"
                        style={{ fontSize: 48, color: "var(--text3)" }}
                      ></i>
                    </div>
                    Arrasta para explorar
                  </div>
                )}
                {tokenArr.map((t) => {
                  const draggable = canDrag(t);
                  const dead = isDead(t);
                  const pct = Math.max(
                    0,
                    Math.min(
                      100,
                      (parseInt(t.hp || 0) / parseInt(t.maxHp || 1)) * 100,
                    ),
                  );
                  const sz = t.tokenSize || tokenSize(t.isBoss);
                  const r = sz / 2 + 1;
                  const circ = 2 * Math.PI * r;
                  return (
                    <div
                      key={t.id}
                      style={{
                        position: "absolute",
                        left: (t.x || MAP_W / 2) + "px",
                        top: (t.y || MAP_H / 2) + "px",
                        transform: "translate(-50%,-50%)",
                        width: sz + 10,
                        height: sz + 10,
                        zIndex: t.isBoss ? 15 : 10,
                        cursor: draggable ? "grab" : "default",
                        userSelect: "none",
                        touchAction: "none",
                        opacity: dead ? 0.5 : 1,
                        filter: dead ? "grayscale(1)" : "none",
                        transition: "opacity .4s,filter .4s",
                      }}
                      onMouseDown={(e) => onTokenPointerDown(e, t.id)}
                      onTouchStart={(e) => onTokenPointerDown(e, t.id)}
                    >
                      {t.isBoss && !dead && (
                        <div
                          style={{
                            position: "absolute",
                            inset: -4,
                            borderRadius: "50%",
                            boxShadow: "0 0 18px 4px rgba(192,57,43,.55)",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      <svg
                        width={sz + 10}
                        height={sz + 10}
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                        }}
                      >
                        <circle
                          cx={(sz + 10) / 2}
                          cy={(sz + 10) / 2}
                          r={r}
                          fill="none"
                          stroke={t.isEnemy ? "#6b1520" : "#0d2040"}
                          strokeWidth={t.isBoss ? 4 : 3}
                          opacity=".6"
                        />
                        <circle
                          cx={(sz + 10) / 2}
                          cy={(sz + 10) / 2}
                          r={r}
                          fill="none"
                          stroke={
                            dead ? "#444" : t.isEnemy ? "#e05070" : "#4a90d9"
                          }
                          strokeWidth={t.isBoss ? 4 : 3}
                          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
                          strokeLinecap="round"
                          style={{
                            transform: `rotate(-90deg)`,
                            transformOrigin: `${(sz + 10) / 2}px ${(sz + 10) / 2}px`,
                          }}
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 5,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: `${t.isBoss ? 3 : 2}px solid ${dead ? "#444" : t.isEnemy ? "#c0392b" : "#2a5aaa"}`,
                          background: dead
                            ? "rgba(40,40,40,.85)"
                            : t.isEnemy
                              ? "rgba(155,35,53,.85)"
                              : "rgba(26,58,110,.85)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TokenFace t={t} size={sz - 10} />
                      </div>
                      {dead && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 5,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,.5)",
                            fontSize: sz * 0.28,
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        >
                          <i className="fi fi-rr-skull"></i>
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          whiteSpace: "nowrap",
                          fontSize: t.isBoss ? 11 : 10,
                          color: dead ? "#555" : t.isBoss ? "#e87890" : "#fff",
                          textShadow: "0 1px 3px #000",
                          pointerEvents: "none",
                          marginTop: 2,
                          fontFamily: "Cinzel,serif",
                        }}
                      >
                        {dead ? (
                          <>
                            <i
                              className="fi fi-rr-skull"
                              style={{ marginRight: 3 }}
                            ></i>
                          </>
                        ) : t.isBoss ? (
                          <>
                            <i
                              className="fi fi-rr-crown"
                              style={{ marginRight: 3 }}
                            ></i>
                          </>
                        ) : (
                          ""
                        )}
                        {(t.name || "").slice(0, 14)}
                      </div>
                      {(!t.isEnemy || isMaster) && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: -1,
                            right: -6,
                            background: dead ? "#1a1a1a" : "var(--surface)",
                            border: `1px solid ${dead ? "#333" : "var(--border)"}`,
                            borderRadius: 10,
                            padding: "1px 5px",
                            fontSize: 10,
                            color: dead ? "#555" : "var(--text2)",
                            fontFamily: "Cinzel,serif",
                            pointerEvents: "none",
                          }}
                        >
                          {t.hp}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Botões de zoom */}
            <div
              style={{
                position: "fixed",
                bottom: 90,
                left: 10,
                zIndex: 55,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))),
                  )
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(13,18,32,.95)",
                  border: "1px solid var(--border2)",
                  color: "var(--gold)",
                  fontSize: 22,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,.4)",
                }}
              >
                +
              </button>
              <button
                onClick={() =>
                  setZoom((z) =>
                    Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))),
                  )
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(13,18,32,.95)",
                  border: "1px solid var(--border2)",
                  color: "var(--gold)",
                  fontSize: 22,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,.4)",
                }}
              >
                −
              </button>
              {/* Indicador de zoom atual */}
              <div
                style={{
                  textAlign: "center",
                  fontSize: 9,
                  color: "var(--text3)",
                  fontFamily: "Cinzel,serif",
                }}
              >
                {Math.round(zoom * 100)}%
              </div>
            </div>
            {/* ── FAB: abre menu lateral ──────────────────────── */}
            <button
              onClick={() => setShowSideMenu((v) => !v)}
              style={{
                position: "fixed",
                bottom: 26,
                right: 10,
                zIndex: 55,
                width: 52,
                height: 52,
                borderRadius: "20%",
                background: "linear-gradient(135deg,var(--gold-d),var(--gold))",
                border: "none",
                color: "#fff",
                fontSize: 22,
                boxShadow: "0 4px 20px rgba(0,0,0,.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="initium-white.png"
                style={{
                  width: "45px",
                  height: "auto",
                  verticalAlign: "middle",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              ></img>
            </button>

            {/* ── Painel lateral unificado ─────────────────────── */}
            {showSideMenu && (
              <>
                {/* Overlay escurecido */}
                <div
                  onClick={() => setShowSideMenu(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,.5)",
                    zIndex: 56,
                  }}
                />
                {/* Painel */}
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 57,
                    width: "82vw",
                    maxWidth: 320,
                    background: "#0d1220",
                    borderLeft: "1px solid var(--border2)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "-8px 0 32px rgba(0,0,0,.6)",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Cinzel,serif",
                        color: "var(--gold-l)",
                        fontSize: 15,
                        letterSpacing: ".06em",
                      }}
                    >
                      Controles
                    </span>
                    <button
                      className="btn-icon"
                      style={{ width: 32, height: 32 }}
                      onClick={() => setShowSideMenu(false)}
                    >
                      <i className="fi fi-rr-cross-small"></i>
                    </button>
                  </div>

                  {/* Sub-tabs */}
                  <div
                    style={{
                      display: "flex",
                      borderBottom: "1px solid var(--border)",
                      flexShrink: 0,
                    }}
                  >
                    {[
                      { k: "initiative", label: "⚡ Init" },
                      { k: "dice", label: "🎲 Dados" },
                      { k: "map", label: "🖼 Mapa" },
                    ].map((item) => (
                      <button
                        key={item.k}
                        onClick={() => setSideMenuTab(item.k)}
                        style={{
                          flex: 1,
                          padding: "10px 4px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Cinzel,serif",
                          fontSize: 11,
                          letterSpacing: ".04em",
                          background: "transparent",
                          color:
                            sideMenuTab === item.k
                              ? "var(--gold-l)"
                              : "var(--text3)",
                          borderBottom:
                            sideMenuTab === item.k
                              ? "2px solid var(--gold)"
                              : "2px solid transparent",
                          transition: "color .15s",
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Conteúdo rolável */}
                  <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
                    {/* ── INICIATIVA ── */}
                    {sideMenuTab === "initiative" && (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: "Cinzel,serif",
                                fontSize: 13,
                                color: "var(--gold-l)",
                              }}
                            >
                              Ordem de Iniciativa
                            </div>
                            <div
                              style={{ fontSize: 11, color: "var(--text3)" }}
                            >
                              Round {round} · {SYS_NAME}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {isMaster && (
                              <button
                                className="btn-gold btn-sm"
                                style={{ padding: "5px 10px", fontSize: 11 }}
                                onClick={() => setShowAddInit(true)}
                              >
                                +
                              </button>
                            )}
                            {isMaster && initiative.length > 0 && (
                              <button
                                className="btn-outline btn-sm"
                                style={{ padding: "5px 10px", fontSize: 11 }}
                                onClick={doNextTurn}
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>
                        {initiative.length === 0 && (
                          <p style={{ color: "var(--text3)", fontSize: 13 }}>
                            Adiciona tokens ao mapa primeiro.
                          </p>
                        )}
                        {initiative.map((p, i) => (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "7px 6px",
                              borderRadius: 8,
                              marginBottom: 4,
                              background:
                                i === currentTurn
                                  ? "rgba(109,69,255,.12)"
                                  : "transparent",
                              border:
                                i === currentTurn
                                  ? "1px solid var(--gold-d)"
                                  : "1px solid transparent",
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                flexShrink: 0,
                                overflow: "hidden",
                                border: `2px solid ${p.isEnemy ? "#c0392b" : "#2a5aaa"}`,
                                background: p.isEnemy
                                  ? "rgba(155,35,53,.8)"
                                  : "rgba(26,58,110,.8)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                              }}
                            >
                              {p.avatarUrl ? (
                                <img
                                  src={p.avatarUrl}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  alt=""
                                />
                              ) : p.avatar?.startsWith("fi ") ? (
                                <i className={p.avatar}></i>
                              ) : (
                                <i className="fi fi-rr-sword"></i>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: "Cinzel,serif",
                                  fontSize: 12,
                                  color:
                                    i === currentTurn
                                      ? "var(--gold-l)"
                                      : "var(--text)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.name}
                              </div>
                              <div
                                style={{ fontSize: 10, color: "var(--text3)" }}
                              >
                                Init {p.roll}
                              </div>
                            </div>
                            {i === currentTurn && (
                              <span
                                style={{ color: "var(--gold)", fontSize: 13 }}
                              >
                                ▶
                              </span>
                            )}
                            {isMaster && (
                              <button
                                onClick={() => removeInit(p.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--text3)",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: 2,
                                }}
                              >
                                <i className="fi fi-rr-cross-small"></i>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── DADOS ── */}
                    {sideMenuTab === "dice" && (
                      <div>
                        {diceResult && (
                          <div
                            style={{
                              background: "var(--surface)",
                              borderRadius: 10,
                              padding: "12px",
                              textAlign: "center",
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                color: "var(--text3)",
                                fontSize: 11,
                                marginBottom: 2,
                              }}
                            >
                              {diceResult.count}d{diceResult.sides}
                            </div>
                            <div
                              style={{
                                fontFamily: "Cinzel,serif",
                                fontSize: 36,
                                color: "var(--gold-l)",
                              }}
                            >
                              {diceResult.total}
                            </div>
                            {diceResult.results.length > 1 && (
                              <div
                                style={{ color: "var(--text3)", fontSize: 11 }}
                              >
                                [{diceResult.results.join("+")}]
                              </div>
                            )}
                          </div>
                        )}
                        <div style={{ marginBottom: 10 }}>
                          <div className="label mb4">Quantidade</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <button
                                key={n}
                                onClick={() => setDiceCount(n)}
                                style={{
                                  flex: 1,
                                  padding: "6px 2px",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontFamily: "Cinzel,serif",
                                  cursor: "pointer",
                                  background:
                                    diceCount === n
                                      ? "rgba(109,69,255,.2)"
                                      : "var(--card2)",
                                  border:
                                    diceCount === n
                                      ? "1px solid var(--gold-d)"
                                      : "1px solid var(--border)",
                                  color:
                                    diceCount === n
                                      ? "var(--gold-l)"
                                      : "var(--text2)",
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="label mb4">Dados</div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4,1fr)",
                            gap: 6,
                            marginBottom: 12,
                          }}
                        >
                          {DICE.map((d) => (
                            <button
                              key={d}
                              className="dice-btn"
                              style={{ width: "100%", height: 46 }}
                              onClick={() => rollDice(d, diceCount)}
                            >
                              <i
                                className="fi fi-rr-dice"
                                style={{ fontSize: 15 }}
                              ></i>
                              <span style={{ fontSize: 10 }}>d{d}</span>
                            </button>
                          ))}
                        </div>
                        <div className="label mb4">Expressão personalizada</div>
                        <div style={{ gap: 6, marginBottom: 10 }}>
                          <input
                            value={diceExpr}
                            onChange={(e) => setDiceExpr(e.target.value)}
                            placeholder="ex: 3d8+2"
                            style={{
                              flex: 1,
                              fontSize: 13,
                              padding: "7px 10px",
                              color: "var(--text)",
                              background: "var(--surface)",
                              border: "1px solid var(--border2)",
                              borderRadius: "var(--radius)",
                            }}
                            onKeyDown={(e) => e.key === "Enter" && rollExpr()}
                          />
                          <button
                            className="btn-gold btn-sm"
                            style={{ padding: "7px 12px" }}
                            onClick={rollExpr}
                          >
                            <i className="fi fi-rr-dice-d20"></i>
                          </button>
                        </div>
                        {diceExprResult && (
                          <div
                            style={{
                              background: "var(--surface)",
                              borderRadius: 8,
                              padding: 10,
                              textAlign: "center",
                            }}
                          >
                            {typeof diceExprResult !== "string" && (
                              <>
                                <div
                                  style={{
                                    color: "var(--text3)",
                                    fontSize: 11,
                                  }}
                                >
                                  {diceExprResult.label}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "Cinzel,serif",
                                    fontSize: 28,
                                    color: "var(--gold-l)",
                                  }}
                                >
                                  {diceExprResult.total}
                                </div>
                                {diceExprResult.parts?.map((p, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      color: "var(--text3)",
                                      fontSize: 10,
                                    }}
                                  >
                                    {p}
                                  </div>
                                ))}
                                {diceExprResult.bonus !== 0 && (
                                  <div
                                    style={{
                                      color: "var(--text3)",
                                      fontSize: 10,
                                    }}
                                  >
                                    Bônus:{" "}
                                    {diceExprResult.bonus > 0
                                      ? `+${diceExprResult.bonus}`
                                      : diceExprResult.bonus}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── MAPA ── */}
                    {sideMenuTab === "map" && isMaster && (
                      <div>
                        <div className="label mb8">Imagem de Fundo</div>
                        <button
                          onClick={() => mapBgInputRef.current.click()}
                          disabled={uploadingMap}
                          className="btn-outline"
                          style={{
                            width: "100%",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          {uploadingMap ? (
                            <>
                              <i className="fi fi-rr-loading"></i> Carregando...
                            </>
                          ) : (
                            <>
                              <i className="fi fi-rr-picture"></i> Escolher do
                              dispositivo
                            </>
                          )}
                        </button>
                        {mapBg && (
                          <>
                            <div
                              style={{
                                borderRadius: 8,
                                overflow: "hidden",
                                marginBottom: 8,
                                border: "1px solid var(--border)",
                              }}
                            >
                              <img
                                src={mapBg}
                                style={{
                                  width: "100%",
                                  height: 120,
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                alt="mapa atual"
                              />
                            </div>
                            <button
                              onClick={clearMap}
                              className="btn-danger"
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                              }}
                            >
                              <i className="fi fi-rr-trash"></i> Remover mapa
                            </button>
                          </>
                        )}
                        {!mapBg && (
                          <p style={{ color: "var(--text3)", fontSize: 13 }}>
                            Nenhum mapa definido.
                          </p>
                        )}
                        <input
                          ref={mapBgInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleMapUpload}
                        />
                      </div>
                    )}
                    {sideMenuTab === "map" && !isMaster && (
                      <p style={{ color: "var(--text3)", fontSize: 13 }}>
                        Só o Mestre pode alterar o mapa.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* ── Banner de turno ── */}
          {showTurnBanner && initiative[currentTurn] && (
            <div
              style={{
                position: "fixed",
                top: 120,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 58,
                background: "rgba(13,18,32,.97)",
                border: `1px solid ${initiative[currentTurn].isEnemy ? "#c0392b" : "var(--gold-d)"}`,
                borderRadius: 12,
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,.6)",
                animation: "fadeInOut 3s ease forwards",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: `2px solid ${initiative[currentTurn].isEnemy ? "#c0392b" : "var(--gold)"}`,
                  background: initiative[currentTurn].isEnemy
                    ? "rgba(155,35,53,.8)"
                    : "rgba(26,58,110,.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                {initiative[currentTurn].avatarUrl ? (
                  <img
                    src={initiative[currentTurn].avatarUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    alt=""
                  />
                ) : initiative[currentTurn].avatar?.startsWith("fi ") ? (
                  <i className={initiative[currentTurn].avatar}></i>
                ) : (
                  <i className="fi fi-rr-sword"></i>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "Cinzel,serif",
                    fontSize: 10,
                    color: "var(--gold-l)",
                  }}
                >
                  Turno de
                </div>
                <div
                  style={{
                    fontFamily: "Cinzel,serif",
                    fontSize: 12,
                    color: "var(--text)",
                  }}
                >
                  {initiative[currentTurn].name}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "Cinzel,serif",
                  fontSize: 9,
                  color: "var(--text3)",
                  marginLeft: 4,
                }}
              >
                Round {round}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════ TOKENS ══════════════════════════════════════════ */}
      {tab === "tokens" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
          <div className="flex-between mb12">
            <h4 style={{ fontSize: 14 }}>Tokens no Mapa</h4>
            {isMaster && (
              <button
                className="btn-gold btn-sm"
                onClick={() => setShowAddToken(true)}
              >
                <i className="fi fi-rr-plus" style={{ marginRight: 4 }}></i>
                Adicionar
              </button>
            )}
          </div>
          {tokenArr.length === 0 && (
            <p className="muted small">
              Nenhum token. O Mestre adiciona a partir das fichas.
            </p>
          )}
          {/* ── ALIADOS ── */}
          {tokenArr.filter((t) => !t.isEnemy).length > 0 && (
            <div className="mb16">
              <div
                style={{
                  fontFamily: "Cinzel,serif",
                  fontSize: 11,
                  color: "#7aadff",
                  letterSpacing: ".1em",
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="fi fi-rr-shield"></i>
                ALIADOS · {tokenArr.filter((t) => !t.isEnemy).length}
              </div>
              {tokenArr
                .filter((t) => !t.isEnemy)
                .map((t) => {
                  const dead = isDead(t);
                  const pct = Math.max(
                    0,
                    Math.min(
                      100,
                      (parseInt(t.hp || 0) / parseInt(t.maxHp || 1)) * 100,
                    ),
                  );
                  return (
                    <div
                      key={t.id}
                      className="card mb8"
                      style={{
                        borderColor: dead
                          ? "#333"
                          : t.isBoss
                            ? "rgba(192,57,43,.4)"
                            : "var(--border)",
                        opacity: dead ? 0.75 : 1,
                        filter: dead ? "grayscale(.7)" : "none",
                        transition: "opacity .3s,filter .3s",
                      }}
                    >
                      <div className="flex-between mb6">
                        <div
                          className="flex gap8"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: `2px solid ${dead ? "#444" : t.isEnemy ? "#7a2a2a" : "var(--border2)"}`,
                              background: "var(--surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 22,
                              flexShrink: 0,
                            }}
                          >
                            <TokenFace t={t} size={42} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontFamily: "Cinzel,serif",
                                color: dead ? "#666" : "var(--text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dead && (
                                <i
                                  className="fi fi-rr-skull"
                                  style={{ marginRight: 3 }}
                                ></i>
                              )}
                              {t.name}
                            </div>
                            <div
                              className="flex gap4"
                              style={{ marginTop: 2, flexWrap: "wrap" }}
                            >
                              {dead ? (
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: 10,
                                    background: "rgba(60,60,60,.5)",
                                    color: "#666",
                                    border: "1px solid #333",
                                  }}
                                >
                                  Morto
                                </span>
                              ) : (
                                <span
                                  className="badge badge-blue"
                                  style={{ fontSize: 10 }}
                                >
                                  Aliado
                                </span>
                              )}
                              {t.ownerId === user.uid && !isMaster && !dead && (
                                <span
                                  className="badge badge-gold"
                                  style={{ fontSize: 10 }}
                                >
                                  Teu
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: "Cinzel,serif",
                            fontSize: 13,
                            color: dead ? "#666" : "var(--text)",
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          {t.hp}
                          <span style={{ color: "var(--text3)", fontSize: 11 }}>
                            /{t.maxHp}
                          </span>
                        </div>
                      </div>
                      <div className="hp-bar mb8">
                        <div
                          className="hp-fill"
                          style={{ width: pct + "%", transition: "width .3s" }}
                        />
                      </div>
                      {isMaster && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--green-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, 1)}
                            >
                              +1
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--green-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, 5)}
                            >
                              +5
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--red-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, -1)}
                            >
                              -1
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--red-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, -5)}
                            >
                              -5
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                fontSize: 11,
                                height: 28,
                                color: "var(--text3)",
                              }}
                              onClick={() => removeToken(t.id, t.name)}
                            >
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </div>
                          <BulkHpInput token={t} onApply={changeTokenHp} />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* ── INIMIGOS ── */}
          {tokenArr.filter((t) => t.isEnemy).length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "Cinzel,serif",
                  fontSize: 11,
                  color: "#e05070",
                  letterSpacing: ".1em",
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="fi fi-rr-skull"></i>
                INIMIGOS · {tokenArr.filter((t) => t.isEnemy).length}
              </div>
              {tokenArr
                .filter((t) => t.isEnemy)
                .map((t) => {
                  const dead = isDead(t);
                  const pct = Math.max(
                    0,
                    Math.min(
                      100,
                      (parseInt(t.hp || 0) / parseInt(t.maxHp || 1)) * 100,
                    ),
                  );
                  return (
                    <div
                      key={t.id}
                      className="card mb8"
                      style={{
                        borderColor: dead
                          ? "#333"
                          : t.isBoss
                            ? "rgba(192,57,43,.4)"
                            : "var(--border)",
                        opacity: dead ? 0.75 : 1,
                        filter: dead ? "grayscale(.7)" : "none",
                        transition: "opacity .3s,filter .3s",
                      }}
                    >
                      <div className="flex-between mb6">
                        <div
                          className="flex gap8"
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              overflow: "hidden",
                              border: `2px solid ${dead ? "#444" : t.isBoss ? "#c0392b" : "#7a2a2a"}`,
                              background: "var(--surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 22,
                              flexShrink: 0,
                              boxShadow:
                                !dead && t.isBoss
                                  ? "0 0 8px rgba(192,57,43,.4)"
                                  : "none",
                            }}
                          >
                            <TokenFace t={t} size={42} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontFamily: "Cinzel,serif",
                                color: dead
                                  ? "#666"
                                  : t.isBoss
                                    ? "#e05070"
                                    : "var(--text)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dead && (
                                <i
                                  className="fi fi-rr-skull"
                                  style={{ marginRight: 3 }}
                                ></i>
                              )}
                              {t.isBoss && !dead && (
                                <i
                                  className="fi fi-rr-crown"
                                  style={{ marginRight: 3 }}
                                ></i>
                              )}
                              {t.name}
                            </div>
                            <div
                              className="flex gap4"
                              style={{ marginTop: 2, flexWrap: "wrap" }}
                            >
                              {dead ? (
                                <span
                                  className="badge"
                                  style={{
                                    fontSize: 10,
                                    background: "rgba(60,60,60,.5)",
                                    color: "#666",
                                    border: "1px solid #333",
                                  }}
                                >
                                  Morto
                                </span>
                              ) : (
                                <span
                                  className="badge badge-red"
                                  style={{ fontSize: 10 }}
                                >
                                  Inimigo
                                </span>
                              )}
                              {t.isBoss && !dead && (
                                <span
                                  className="badge badge-red"
                                  style={{ fontSize: 10 }}
                                >
                                  <i
                                    className="fi fi-rr-crown"
                                    style={{ marginRight: 3 }}
                                  ></i>
                                  Boss
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* HP só visível para o mestre em inimigos */}
                        {isMaster && (
                          <div
                            style={{
                              fontFamily: "Cinzel,serif",
                              fontSize: 13,
                              color: dead ? "#666" : "var(--text)",
                              flexShrink: 0,
                              marginLeft: 8,
                            }}
                          >
                            {t.hp}
                            <span
                              style={{ color: "var(--text3)", fontSize: 11 }}
                            >
                              /{t.maxHp}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Barra de HP só para o mestre */}
                      {isMaster ? (
                        <div className="hp-bar mb8">
                          <div
                            className="hp-fill"
                            style={{
                              width: pct + "%",
                              background: dead
                                ? "#333"
                                : t.isBoss
                                  ? "linear-gradient(90deg,#8b0000,#e05070)"
                                  : "",
                              transition: "width .3s",
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ height: 6, marginBottom: 8 }} />
                      )}
                      {isMaster && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--green-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, 1)}
                            >
                              +1
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--green-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, 5)}
                            >
                              +5
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--red-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, -1)}
                            >
                              -1
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                flex: 1,
                                fontSize: 11,
                                color: "var(--red-l)",
                                height: 28,
                              }}
                              onClick={() => changeTokenHp(t, -5)}
                            >
                              -5
                            </button>
                            <button
                              className="btn-icon btn-sm"
                              style={{
                                fontSize: 11,
                                height: 28,
                                color: "var(--text3)",
                              }}
                              onClick={() => removeToken(t.id, t.name)}
                            >
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </div>
                          <BulkHpInput token={t} onApply={changeTokenHp} />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ════ LOG ════════════════════════════════════════════ */}
      {tab === "log" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
          <h4 style={{ fontSize: 14, marginBottom: 12 }}>Log em Tempo Real</h4>
          {log.length === 0 && (
            <p className="muted small">
              O log aparece aqui conforme o combate avança.
            </p>
          )}
          {log.map((l, i) => (
            <div key={i} className="roll-entry">
              <span
                style={{ color: "var(--text3)", marginRight: 6, fontSize: 11 }}
              >
                {l.ts
                  ? new Date(l.ts).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--"}
              </span>
              {l.msg}
            </div>
          ))}
        </div>
      )}

      {/* ════ MODAL: Adicionar Token ══════════════════════════ */}
      {showAddToken && (
        <div className="modal-overlay" onClick={() => setShowAddToken(false)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "82vh" }}
          >
            <div className="modal-handle" />
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              Adicionar Token ao Mapa
            </h3>
            <p className="muted small mb12">
              Exibindo fichas de{" "}
              <strong style={{ color: "var(--gold)" }}>{SYS_NAME}</strong>{" "}
              apenas.
            </p>
            <div className="tab-bar mb12">
              <button
                className={`tab${tokenTab === "chars" ? " active" : ""}`}
                onClick={() => setTokenTab("chars")}
              >
                <i
                  className="fi fi-rr-hat-wizard"
                  style={{ marginRight: 4 }}
                ></i>
                Personagens
              </button>
              <button
                className={`tab${tokenTab === "enemies" ? " active" : ""}`}
                onClick={() => setTokenTab("enemies")}
              >
                <i className="fi fi-rr-skull" style={{ marginRight: 4 }}></i>
                Inimigos
              </button>
            </div>
            {tokenTab === "chars" && (
              <div>
                {fsChars.length === 0 && (
                  <p className="muted small">
                    Nenhum personagem de <strong>{SYS_NAME}</strong> cadastrado.
                  </p>
                )}
                {fsChars.map((c) => {
                  const pct = Math.max(
                    0,
                    Math.min(
                      100,
                      (parseInt(c.hp || 0) / parseInt(c.maxHp || 1)) * 100,
                    ),
                  );
                  return (
                    <div
                      key={c.firestoreId}
                      className="card mb8"
                      style={{ cursor: "pointer" }}
                      onClick={() => spawnToken(c, false)}
                    >
                      <div className="flex gap8">
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: "2px solid var(--border2)",
                            background: "var(--surface)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                            flexShrink: 0,
                          }}
                        >
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              alt=""
                            />
                          ) : c.avatar?.startsWith("fi ") ? (
                            <i
                              className={c.avatar}
                              style={{ fontSize: 22 }}
                            ></i>
                          ) : (
                            <i
                              className="fi fi-rr-hat-wizard"
                              style={{ fontSize: 22 }}
                            ></i>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "Cinzel,serif",
                              fontSize: 14,
                              color: "var(--gold)",
                            }}
                          >
                            {c.name}
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {c.ownerName} · HP {c.hp}/{c.maxHp}
                          </div>
                          <div className="hp-bar mt8">
                            <div
                              className="hp-fill"
                              style={{ width: pct + "%" }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            color: "var(--gold)",
                            fontSize: 20,
                            alignSelf: "center",
                          }}
                        >
                          +
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {tokenTab === "enemies" && (
              <div>
                {fsEnemies.length === 0 && (
                  <p className="muted small">
                    Nenhum inimigo de <strong>{SYS_NAME}</strong> cadastrado.
                  </p>
                )}
                {fsEnemies.map((e) => (
                  <div
                    key={e.firestoreId}
                    className="card mb8"
                    style={{
                      cursor: "pointer",
                      borderColor: e.isBoss
                        ? "rgba(192,57,43,.4)"
                        : "var(--border)",
                    }}
                    onClick={() => spawnToken(e, true)}
                  >
                    <div className="flex gap8">
                      <div
                        style={{
                          width: e.isBoss ? 48 : 40,
                          height: e.isBoss ? 48 : 40,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: `2px solid ${e.isBoss ? "#c0392b" : "var(--border2)"}`,
                          background: "var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: e.isBoss ? 26 : 22,
                          flexShrink: 0,
                          boxShadow: e.isBoss
                            ? "0 0 8px rgba(192,57,43,.4)"
                            : "none",
                        }}
                      >
                        {e.avatarUrl ? (
                          <img
                            src={e.avatarUrl}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            alt=""
                          />
                        ) : e.avatar?.startsWith("fi ") ? (
                          <i className={e.avatar} style={{ fontSize: 22 }}></i>
                        ) : (
                          <i
                            className="fi fi-rr-skull"
                            style={{ fontSize: 22 }}
                          ></i>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "Cinzel,serif",
                            fontSize: 14,
                            color: e.isBoss ? "#e05070" : "var(--text)",
                          }}
                        >
                          {e.isBoss ? (
                            <>
                              <i
                                className="fi fi-rr-crown"
                                style={{ marginRight: 3 }}
                              ></i>
                            </>
                          ) : (
                            ""
                          )}
                          {e.name}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {e.type} · ND {e.cr} · HP {e.hp}/{e.maxHp}
                        </div>
                        {e.isBoss && (
                          <span
                            className="badge badge-red"
                            style={{ fontSize: 10, marginTop: 4 }}
                          >
                            <i
                              className="fi fi-rr-crown"
                              style={{ marginRight: 3 }}
                            ></i>
                            Token 2× maior
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: "var(--gold)",
                          fontSize: 20,
                          alignSelf: "center",
                        }}
                      >
                        +
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ MODAL: Adicionar à Iniciativa ══════════════════ */}
      {showAddInit && (
        <div className="modal-overlay" onClick={() => setShowAddInit(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              Adicionar à Iniciativa
            </h3>
            <p className="muted small mb12">
              {SYS_NAME} · dados sugeridos:{" "}
              <strong style={{ color: "var(--gold)" }}>
                {systemInitDice.map((d) => `d${d}`).join(", ")}
              </strong>
            </p>

            {/* Passo 1 — seleciona um Token do mapa */}
            <div className="label mb8">1. Escolhe um Token do mapa</div>
            {tokenArr.length === 0 ? (
              <p className="muted small mb12">
                Nenhum token no mapa. Adiciona tokens primeiro.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                {tokenArr.map((t) => {
                  const sel = initForm.tokenId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() =>
                        setInitForm((f) => ({
                          ...f,
                          tokenId: t.id,
                          name: t.name,
                          avatar: t.avatar || "fi fi-rr-sword",
                          avatarUrl: t.avatarUrl || null,
                          isEnemy: t.isEnemy,
                        }))
                      }
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: `2px solid ${sel ? "var(--gold)" : t.isEnemy ? "rgba(192,57,43,.4)" : "var(--border)"}`,
                        background: sel
                          ? "rgba(201,168,76,.08)"
                          : "var(--card2)",
                        minWidth: 60,
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: `2px solid ${t.isEnemy ? "#c0392b" : "#2a5aaa"}`,
                          background: t.isEnemy
                            ? "rgba(155,35,53,.8)"
                            : "rgba(26,58,110,.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                        }}
                      >
                        {t.avatarUrl ? (
                          <img
                            src={t.avatarUrl}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            alt=""
                          />
                        ) : t.avatar?.startsWith("fi ") ? (
                          <i className={t.avatar}></i>
                        ) : (
                          <span>
                            {t.avatar || <i className="fi fi-rr-sword"></i>}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontFamily: "Cinzel,serif",
                          fontSize: 10,
                          color: sel ? "var(--gold)" : "var(--text2)",
                          textAlign: "center",
                          maxWidth: 58,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.name}
                      </div>
                      {sel && (
                        <div style={{ fontSize: 10, color: "var(--gold)" }}>
                          <i className="fi fi-rr-check"></i>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Passo 2 — rola a iniciativa */}
            <div className="label mb8">2. Rola a iniciativa</div>
            <input
              type="number"
              value={initForm.roll}
              onChange={(e) =>
                setInitForm((f) => ({ ...f, roll: e.target.value }))
              }
              style={{
                marginBottom: 8,
                color: "var(--text)",
                background: "var(--surface)",
              }}
            />
            {/* Dados sugeridos pelo sistema (destacados) + todos os outros */}
            <div style={{ marginBottom: 14 }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>
                Sugeridos para {SYS_NAME}:
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 8,
                }}
              >
                {systemInitDice.map((d) => (
                  <button
                    key={"s" + d}
                    onClick={() =>
                      setInitForm((f) => ({ ...f, roll: String(rollDie(d)) }))
                    }
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--gold-d)",
                      background: "rgba(201,168,76,.12)",
                      color: "var(--gold)",
                      fontFamily: "Cinzel,serif",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <i className="fi fi-rr-dice" style={{ marginRight: 3 }}></i>
                    d{d}
                  </button>
                ))}
              </div>
              <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>
                Todos os dados:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ALL_INIT_DICE.filter((d) => !systemInitDice.includes(d)).map(
                  (d) => (
                    <button
                      key={"a" + d}
                      onClick={() =>
                        setInitForm((f) => ({ ...f, roll: String(rollDie(d)) }))
                      }
                      className="btn-outline btn-sm"
                      style={{ fontSize: 11 }}
                    >
                      d{d}
                    </button>
                  ),
                )}
              </div>
            </div>

            <button
              className="btn-gold"
              onClick={addInit}
              disabled={!initForm.name}
            >
              {initForm.name
                ? `Adicionar ${initForm.name}`
                : "Seleciona um token primeiro"}
            </button>
          </div>
        </div>
      )}

      {viewingSheet && (
        <div className="modal-overlay" onClick={() => setViewingSheet(null)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh" }}
          >
            <div className="modal-handle" />
            <div className="flex-between mb16">
              <h3 style={{ fontSize: 16 }}>{viewingSheet.data.name}</h3>
              <button
                className="btn-icon"
                onClick={() => setViewingSheet(null)}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>
            {/* Atributos */}
            {viewingSheet.data.stats && (
              <div className="mb12">
                <div className="label mb8">Atributos</div>
                <div className="grid3">
                  {Object.entries(viewingSheet.data.stats).map(([k, v]) => (
                    <div key={k} className="stat-box">
                      <div className="stat-name">{k}</div>
                      <div
                        style={{
                          fontFamily: "Cinzel,serif",
                          color: "var(--gold-l)",
                          fontSize: 18,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* HP e CA */}
            <div className="grid3 mb12">
              <div className="card2" style={{ textAlign: "center" }}>
                <div className="label">HP</div>
                <div
                  style={{ fontFamily: "Cinzel,serif", color: "var(--gold)" }}
                >
                  {viewingSheet.data.hp}/{viewingSheet.data.maxHp}
                </div>
              </div>
              {viewingSheet.data.ac && (
                <div className="card2" style={{ textAlign: "center" }}>
                  <div className="label">CA</div>
                  <div
                    style={{ fontFamily: "Cinzel,serif", color: "var(--gold)" }}
                  >
                    {viewingSheet.data.ac}
                  </div>
                </div>
              )}
            </div>
            {/* Campos do sistema */}
            {viewingSheet.data.fields &&
              Object.entries(viewingSheet.data.fields)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="mb8">
                    <div className="label">{k}</div>
                    <div style={{ color: "var(--text)" }}>{v}</div>
                  </div>
                ))}
            {/* Ataques (inimigos) */}
            {viewingSheet.data.attacks && (
              <div className="mb8">
                <div className="label">Ataques</div>
                <div
                  style={{
                    color: "var(--text)",
                    whiteSpace: "pre-wrap",
                    fontSize: 14,
                  }}
                >
                  {viewingSheet.data.attacks}
                </div>
              </div>
            )}
            {/* Notas */}
            {viewingSheet.data.notes && (
              <div>
                <div className="label">Notas</div>
                <div
                  style={{
                    color: "var(--text2)",
                    fontSize: 14,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {viewingSheet.data.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  APP ROOT — sessão persistida pelo Firebase Auth
// ─────────────────────────────────────────────────────────────
export default function App() {
  // null  = verificando sessão | false = não logado | object = logado
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [activeRoom, setActiveRoom] = useState(null);
  const [counts, setCounts] = useState({
    characters: 0,
    enemies: 0,
    events: 0,
    rooms: 0,
  });

  // ── Persiste sessão com onAuthStateChanged ────────────────
  //
  //  Por que o retry?
  //  Após o registro, o Firebase Auth dispara onAuthStateChanged
  //  ANTES do auth.js terminar de escrever o documento no Firestore.
  //  Se a primeira leitura não encontrar o doc, esperamos 800ms e
  //  tentamos de novo — tempo mais que suficiente para o write completar.
  useEffect(() => {
    const fetchProfile = async (firebaseUser, attempt = 1) => {
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          // Documento encontrado: usa o role salvo no Firestore
          setUser({ uid: firebaseUser.uid, ...snap.data() });
        } else if (attempt < 4) {
          // Documento ainda não existe (race condition pós-registro):
          // aguarda e tenta novamente (até 3 tentativas extras)
          setTimeout(
            () => fetchProfile(firebaseUser, attempt + 1),
            attempt * 800,
          );
        } else {
          // Após 4 tentativas sem sucesso: fallback seguro
          // Nunca assume "player" sem tentar ler o Firestore
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.email,
            role: "player",
            email: firebaseUser.email,
          });
        }
      } catch (e) {
        console.error("Erro ao buscar perfil:", e);
        if (attempt < 4) {
          setTimeout(
            () => fetchProfile(firebaseUser, attempt + 1),
            attempt * 800,
          );
        } else {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.email,
            role: "player",
            email: firebaseUser.email,
          });
        }
      }
    };

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(false);
        return;
      }
      fetchProfile(firebaseUser);
    });
    return () => unsub();
  }, []);

  // ── Contadores dos cards (onSnapshot) ────────────────────
  useEffect(() => {
    if (!user) return;
    const isMaster = user.role === "master";
    const qC = isMaster
      ? collection(db, "characters")
      : query(collection(db, "characters"), where("ownerId", "==", user.uid));
    const qE = collection(db, "enemies");
    const qEv = collection(db, "events"); // todos vêem — filtro de escrita é no componente
    const qR = collection(db, "rooms");
    const u1 = onSnapshot(qC, (s) =>
      setCounts((c) => ({ ...c, characters: s.size })),
    );
    const u2 = onSnapshot(qE, (s) =>
      setCounts((c) => ({ ...c, enemies: s.size })),
    );
    const u3 = onSnapshot(qEv, (s) =>
      setCounts((c) => ({ ...c, events: s.size })),
    );
    const u4 = onSnapshot(qR, (s) =>
      setCounts((c) => ({ ...c, rooms: s.size })),
    );
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(false);
    setView("home");
    setActiveRoom(null);
  };

  // ── Aguarda verificação ───────────────────────────────────
  if (user === null) return <LoadingScreen msg="Verificando sessão..." />;
  if (user === false) return <AuthScreen />;

  return (
    <div>
      {view === "home" && (
        <HomeScreen
          user={user}
          counts={counts}
          setView={setView}
          onLogout={handleLogout}
        />
      )}
      {view === "characters" && (
        <CharactersScreen user={user} setView={setView} />
      )}
      {view === "enemies" && <EnemiesScreen user={user} setView={setView} />}
      {view === "calendar" && <CalendarScreen user={user} setView={setView} />}
      {view === "rooms" && (
        <RoomsScreen
          user={user}
          setView={setView}
          setActiveRoom={setActiveRoom}
        />
      )}
      {view === "combat" && activeRoom && (
        <CombatArena user={user} room={activeRoom} setView={setView} />
      )}
    </div>
  );
}
