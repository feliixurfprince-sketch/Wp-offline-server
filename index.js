/**
 * ============================================================
 *   DEVILXD - FULL AUTH + APPROVAL + ADMIN PANEL SYSTEM
 *   Single File: index.js
 *   Admin Login: DEVILXD / LORDX00
 * ============================================================
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "db.json");
const ADMIN_USERNAME = "DEVILXD";
const ADMIN_PASSWORD = "LORDX00";

// ─── DB HELPERS ────────────────────────────────────────────
function loadDB() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {}, sessions: {}, suspended: [] }));
  }
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return { users: {}, sessions: {}, suspended: [] }; }
}

function saveDB(db) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function generateKey() {
  return "DVLX-" + crypto.randomBytes(4).toString("hex").toUpperCase() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateSession() {
  return crypto.randomBytes(24).toString("hex");
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const found = cookies.split(";").map(c => c.trim()).find(c => c.startsWith(name + "="));
  return found ? found.split("=")[1] : null;
}

function getSession(req) {
  const db = loadDB();
  const sid = getCookie(req, "session");
  if (!sid) return null;
  return db.sessions[sid] || null;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [k, v] of params.entries()) obj[k] = v;
        resolve(obj);
      } catch { resolve({}); }
    });
  });
}

// ─── HTML TEMPLATES ────────────────────────────────────────

const PARTICLE_BG = `
<div id="particles-js"></div>
<script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
<script>
window.addEventListener('load', function() {
  if(typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
      particles: {
        number: { value: 90, density: { enable: true, value_area: 800 } },
        color: { value: ["#ff69b4","#87ceeb","#ff1493","#00bfff","#ffb6c1","#1e90ff"] },
        shape: { type: "circle" },
        opacity: { value: 0.7, random: true, anim: { enable: true, speed: 1, opacity_min: 0.2 } },
        size: { value: 4, random: true, anim: { enable: true, speed: 2, size_min: 1 } },
        line_linked: { enable: true, distance: 130, color: "#ff69b4", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2.5, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } }
      },
      retina_detect: true
    });
  }
});
</script>`;

const BASE_STYLE = `
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    background: #0a0a1a;
    font-family: 'Rajdhani', sans-serif;
    color: #e0e0ff;
    overflow-x: hidden;
  }
  #particles-js {
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 0;
    background: linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 40%, #1a0a2e 70%, #0a1a2e 100%);
  }
  .container {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .card {
    background: rgba(15, 10, 40, 0.85);
    border: 1px solid rgba(255, 105, 180, 0.3);
    border-radius: 20px;
    padding: 40px 36px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 0 40px rgba(255,105,180,0.15), 0 0 80px rgba(135,206,235,0.08), inset 0 1px 0 rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    animation: cardIn 0.6s cubic-bezier(.23,1.1,.68,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(30px) scale(0.97); }
    to { opacity:1; transform: translateY(0) scale(1); }
  }
  .logo {
    text-align: center;
    margin-bottom: 28px;
  }
  .logo h1 {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.2rem;
    font-weight: 900;
    background: linear-gradient(90deg, #ff69b4, #87ceeb, #ff1493, #00bfff);
    background-size: 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
    letter-spacing: 3px;
  }
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .logo p {
    color: rgba(135,206,235,0.7);
    font-size: 0.85rem;
    letter-spacing: 2px;
    margin-top: 4px;
    text-transform: uppercase;
  }
  .form-group {
    margin-bottom: 18px;
  }
  label {
    display: block;
    font-size: 0.8rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(135,206,235,0.8);
    margin-bottom: 6px;
    font-weight: 600;
  }
  input[type=text], input[type=password] {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,105,180,0.25);
    border-radius: 10px;
    color: #e0e0ff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  input[type=text]:focus, input[type=password]:focus {
    border-color: rgba(255,105,180,0.7);
    box-shadow: 0 0 12px rgba(255,105,180,0.2);
  }
  .btn {
    display: inline-block;
    padding: 12px 28px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    transition: transform 0.15s, box-shadow 0.3s, filter 0.3s;
    text-decoration: none;
  }
  .btn:hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.15); }
  .btn:active { transform: scale(0.97); }

  .btn-pink {
    background: linear-gradient(135deg, #ff1493, #ff69b4);
    color: #fff;
    box-shadow: 0 4px 20px rgba(255,20,147,0.4);
  }
  .btn-sky {
    background: linear-gradient(135deg, #0080ff, #00bfff);
    color: #fff;
    box-shadow: 0 4px 20px rgba(0,191,255,0.35);
  }
  .btn-green {
    background: linear-gradient(135deg, #00c853, #69f0ae);
    color: #0a0a1a;
    box-shadow: 0 4px 20px rgba(0,200,83,0.35);
  }
  .btn-orange {
    background: linear-gradient(135deg, #ff6d00, #ffab40);
    color: #fff;
    box-shadow: 0 4px 20px rgba(255,109,0,0.35);
  }
  .btn-red {
    background: linear-gradient(135deg, #d50000, #ff5252);
    color: #fff;
    box-shadow: 0 4px 20px rgba(213,0,0,0.35);
  }
  .btn-purple {
    background: linear-gradient(135deg, #6200ea, #b388ff);
    color: #fff;
    box-shadow: 0 4px 20px rgba(98,0,234,0.35);
  }
  .btn-yellow {
    background: linear-gradient(135deg, #f9a825, #fff176);
    color: #1a1a00;
    box-shadow: 0 4px 20px rgba(249,168,37,0.35);
  }
  .btn-teal {
    background: linear-gradient(135deg, #00695c, #80cbc4);
    color: #fff;
    box-shadow: 0 4px 20px rgba(0,105,92,0.35);
  }
  .btn-full { width: 100%; display: block; text-align: center; }
  .btn-sm { padding: 7px 16px; font-size: 0.72rem; }

  .msg { padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem; }
  .msg-error { background: rgba(255,50,50,0.15); border: 1px solid rgba(255,50,50,0.3); color: #ff8a80; }
  .msg-success { background: rgba(0,200,83,0.12); border: 1px solid rgba(0,200,83,0.3); color: #69f0ae; }
  .msg-warn { background: rgba(255,170,0,0.12); border: 1px solid rgba(255,170,0,0.3); color: #ffcc80; }

  .divider { height: 1px; background: linear-gradient(90deg,transparent,rgba(255,105,180,0.3),transparent); margin: 24px 0; }

  .link-text { text-align: center; font-size: 0.88rem; color: rgba(135,206,235,0.6); margin-top: 16px; }
  .link-text a { color: #ff69b4; text-decoration: none; font-weight: 700; }
  .link-text a:hover { color: #87ceeb; }

  /* ADMIN PANEL */
  .admin-wrap {
    min-height: 100vh;
    position: relative; z-index: 1;
    padding: 24px;
  }
  .admin-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    background: rgba(15,10,40,0.9);
    border: 1px solid rgba(255,105,180,0.2);
    border-radius: 14px;
    margin-bottom: 28px;
    backdrop-filter: blur(20px);
  }
  .admin-header h1 {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    background: linear-gradient(90deg, #ff69b4, #87ceeb);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }
  .stat-card {
    background: rgba(15,10,40,0.85);
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    border: 1px solid rgba(255,105,180,0.15);
    backdrop-filter: blur(10px);
  }
  .stat-card .num {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.2rem;
    font-weight: 900;
  }
  .stat-card .lbl { font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.65; margin-top: 4px; }
  .stat-card.pink .num { color: #ff69b4; }
  .stat-card.sky .num { color: #87ceeb; }
  .stat-card.green .num { color: #69f0ae; }
  .stat-card.orange .num { color: #ffab40; }

  .section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ff69b4;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,105,180,0.2);
  }
  .user-table-wrap {
    background: rgba(15,10,40,0.85);
    border: 1px solid rgba(255,105,180,0.15);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 28px;
    backdrop-filter: blur(10px);
  }
  table { width: 100%; border-collapse: collapse; }
  th {
    background: rgba(255,105,180,0.1);
    padding: 12px 14px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(135,206,235,0.9);
    text-align: left;
  }
  td {
    padding: 12px 14px;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 0.88rem;
    vertical-align: middle;
  }
  tr:hover td { background: rgba(255,105,180,0.04); }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .badge-pending { background: rgba(255,170,0,0.2); color: #ffcc80; border: 1px solid rgba(255,170,0,0.3); }
  .badge-approved { background: rgba(0,200,83,0.2); color: #69f0ae; border: 1px solid rgba(0,200,83,0.3); }
  .badge-rejected { background: rgba(255,50,50,0.2); color: #ff8a80; border: 1px solid rgba(255,50,50,0.3); }
  .badge-suspended { background: rgba(150,0,200,0.2); color: #e040fb; border: 1px solid rgba(150,0,200,0.3); }

  .btn-row { display: flex; gap: 6px; flex-wrap: wrap; }

  /* APPROVAL PAGE */
  .key-box {
    background: rgba(255,105,180,0.08);
    border: 1px dashed rgba(255,105,180,0.4);
    border-radius: 12px;
    padding: 18px;
    text-align: center;
    margin: 20px 0;
  }
  .key-box .key-val {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.05rem;
    color: #ff69b4;
    letter-spacing: 2px;
    word-break: break-all;
  }
  .key-box .key-lbl { font-size: 0.78rem; letter-spacing: 2px; text-transform: uppercase; color: rgba(135,206,235,0.6); margin-bottom: 8px; }

  .wa-btn {
    background: linear-gradient(135deg, #25d366, #128c7e);
    color: #fff;
    box-shadow: 0 4px 20px rgba(37,211,102,0.35);
  }
  .tg-btn {
    background: linear-gradient(135deg, #0088cc, #00b4d8);
    color: #fff;
    box-shadow: 0 4px 20px rgba(0,136,204,0.35);
  }
  .approval-btns { display: flex; gap: 12px; margin-top: 16px; }
  .approval-btns .btn { flex: 1; text-align: center; }

  .success-banner {
    background: linear-gradient(135deg, rgba(0,200,83,0.15), rgba(105,240,174,0.08));
    border: 1px solid rgba(0,200,83,0.3);
    border-radius: 14px;
    padding: 28px;
    text-align: center;
    margin-bottom: 20px;
  }
  .success-banner h2 {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.2rem;
    color: #69f0ae;
    margin-bottom: 8px;
  }
  .success-banner p { color: rgba(105,240,174,0.8); font-size: 0.9rem; }

  @media (max-width: 600px) {
    .card { padding: 28px 20px; }
    .admin-wrap { padding: 12px; }
    .btn-row { flex-direction: column; }
    th, td { padding: 9px 8px; font-size: 0.78rem; }
  }
</style>`;

// ─── PAGE BUILDERS ──────────────────────────────────────────

function page(title, body, extraHead = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — DEVILXD</title>
  ${BASE_STYLE}
  ${extraHead}
</head>
<body>
  ${PARTICLE_BG}
  ${body}
</body>
</html>`;
}

// ─── SIGNUP PAGE ────────────────────────────────────────────
function signupPage(err = "", suc = "") {
  return page("Sign Up", `
<div class="container">
  <div class="card">
    <div class="logo">
      <h1>⚡ DEVILXD</h1>
      <p>Create Your Account</p>
    </div>
    ${err ? `<div class="msg msg-error">⚠ ${err}</div>` : ""}
    ${suc ? `<div class="msg msg-success">✔ ${suc}</div>` : ""}
    <form method="POST" action="/signup">
      <div class="form-group">
        <label>Username</label>
        <input type="text" name="username" placeholder="Choose a username" required autocomplete="off">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="Choose a password" required>
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input type="password" name="confirm" placeholder="Confirm password" required>
      </div>
      <button type="submit" class="btn btn-pink btn-full" style="margin-top:8px;">
        🚀 Create Account
      </button>
    </form>
    <div class="divider"></div>
    <div class="link-text">Already have an account? <a href="/login">Login here</a></div>
    <div style="margin-top:14px;">
      <a href="/admin/login" class="btn btn-purple btn-full" style="text-align:center;">
        🛡 Owner Admin Panel Login
      </a>
    </div>
  </div>
</div>`);
}

// ─── LOGIN PAGE ─────────────────────────────────────────────
function loginPage(err = "") {
  return page("Login", `
<div class="container">
  <div class="card">
    <div class="logo">
      <h1>⚡ DEVILXD</h1>
      <p>Login to Your Account</p>
    </div>
    ${err ? `<div class="msg msg-error">⚠ ${err}</div>` : ""}
    <form method="POST" action="/login">
      <div class="form-group">
        <label>Username</label>
        <input type="text" name="username" placeholder="Enter username" required autocomplete="off">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="Enter password" required>
      </div>
      <button type="submit" class="btn btn-sky btn-full" style="margin-top:8px;">
        🔓 Login
      </button>
    </form>
    <div class="divider"></div>
    <div class="link-text">No account? <a href="/signup">Sign up here</a></div>
    <div style="margin-top:14px;">
      <a href="/admin/login" class="btn btn-purple btn-full" style="text-align:center;">
        🛡 Owner Admin Panel Login
      </a>
    </div>
  </div>
</div>`);
}

// ─── REAL NAME PAGE ──────────────────────────────────────────
function realnamePage(user, err = "") {
  return page("Set Your Name", `
<div class="container">
  <div class="card">
    <div class="logo">
      <h1>⚡ DEVILXD</h1>
      <p>Enter Your Real Name</p>
    </div>
    <div class="msg msg-warn">👤 Please enter your real name to generate your Approval Key.</div>
    ${err ? `<div class="msg msg-error">⚠ ${err}</div>` : ""}
    <form method="POST" action="/set-realname">
      <div class="form-group">
        <label>Your Real Name</label>
        <input type="text" name="realname" placeholder="Enter your real name" value="${user.realname || ""}" required>
      </div>
      <button type="submit" class="btn btn-green btn-full" style="margin-top:8px;">
        💾 Save & Get Approval Key
      </button>
    </form>
    <div class="divider"></div>
    <a href="/admin/login" class="btn btn-purple btn-full" style="text-align:center;">
      🛡 Owner Admin Panel Login
    </a>
  </div>
</div>`);
}

// ─── APPROVAL PAGE ───────────────────────────────────────────
function approvalPage(user, statusMsg = "") {
  const db = loadDB();
  const status = user.approvalStatus || "pending";
  const key = user.approvalKey || "";
  const realname = user.realname || "Unknown";

  const waMsg = encodeURIComponent(
    `Devil sir I'm Using your server\nMy real name is:- ${realname}\nThis is my aproval key:- ${key}\nPlz aproval me key sir`
  );
  const tgMsg = encodeURIComponent(
    `Devil sir I'm Using your server\nMy real name is:- ${realname}\nThis is my aproval key:- ${key}\nPlz aproval me key sir`
  );

  if (status === "approved") {
    return page("Approved!", `
<div class="container">
  <div class="card">
    <div class="logo"><h1>⚡ DEVILXD</h1></div>
    <div class="success-banner">
      <h2>✅ Your Key Has Been Approved Successfully!</h2>
      <p>by Owner <strong>DEVILXD</strong></p>
    </div>
    <div class="msg msg-success" style="text-align:center; font-family:'Orbitron',sans-serif; font-size:1rem;">
      🎉 Welcome, ${realname}!
    </div>
    <a href="/dashboard" class="btn btn-green btn-full" style="margin-top:16px; text-align:center;">
      🚀 Go to Dashboard
    </a>
    <div class="divider"></div>
    <a href="/admin/login" class="btn btn-purple btn-full" style="text-align:center;">
      🛡 Owner Admin Panel Login
    </a>
  </div>
</div>`);
  }

  if (status === "suspended") {
    return page("Suspended", `
<div class="container">
  <div class="card">
    <div class="logo"><h1>⚡ DEVILXD</h1></div>
    <div class="msg msg-error" style="text-align:center; padding:24px;">
      <div style="font-size:2rem; margin-bottom:10px;">🚫</div>
      <strong style="font-family:'Orbitron',sans-serif;">Owner ne aapko server se suspend kar diya hai</strong><br><br>
      Aap tab tak is server ka istemal nahi kar sakte jab tak Owner aapko unsuspend na kare.<br><br>
      <em style="color:rgba(255,138,128,0.7);">Kyunki aapne is server ka galat use kiya isliye suspend kar diya Owner ne aapko.</em>
    </div>
  </div>
</div>`);
  }

  if (status === "rejected") {
    return page("Rejected", `
<div class="container">
  <div class="card">
    <div class="logo"><h1>⚡ DEVILXD</h1></div>
    <div class="msg msg-error" style="text-align:center;">
      ❌ Aapki approval request reject ho gayi. Neeche se dobara request bhejein.
    </div>
    <div class="key-box">
      <div class="key-lbl">Your Approval Key</div>
      <div class="key-val">${key}</div>
    </div>
    <div class="approval-btns">
      <a href="https://wa.me/917668337116?text=${waMsg}" target="_blank" class="btn wa-btn">📱 WhatsApp</a>
      <a href="https://t.me/itxthedevil?text=${tgMsg}" target="_blank" class="btn tg-btn">✈ Telegram</a>
    </div>
    <form method="POST" action="/check-approval" style="margin-top:16px;">
      <button type="submit" class="btn btn-orange btn-full">🔄 Check Approval Status</button>
    </form>
    <div class="divider"></div>
    <a href="/admin/login" class="btn btn-purple btn-full" style="text-align:center;">
      🛡 Owner Admin Panel Login
    </a>
  </div>
</div>`);
  }

  // Pending
  return page("Awaiting Approval", `
<div class="container">
  <div class="card">
    <div class="logo">
      <h1>⚡ DEVILXD</h1>
      <p>Approval Required</p>
    </div>
    ${statusMsg ? `<div class="msg msg-warn">⏳ ${statusMsg}</div>` : ""}
    <div class="msg msg-warn">
      ⏳ Your approval is <strong>pending</strong>. Send your key to Owner via WhatsApp or Telegram and wait for approval.
    </div>
    <div class="key-box">
      <div class="key-lbl">🔑 Your Unique Approval Key</div>
      <div class="key-val">${key}</div>
    </div>
    <p style="font-size:0.85rem; color:rgba(135,206,235,0.7); text-align:center; margin-bottom:4px;">
      👤 Real Name: <strong style="color:#ff69b4;">${realname}</strong>
    </p>
    <p style="font-size:0.8rem; color:rgba(255,255,255,0.4); text-align:center; margin-bottom:12px;">
      Click a button below to send approval request to Owner:
    </p>
    <div class="approval-btns">
      <a href="https://wa.me/917668337116?text=${waMsg}" target="_blank" class="btn wa-btn">📱 WhatsApp</a>
      <a href="https://t.me/itxthedevil?text=${tgMsg}" target="_blank" class="btn tg-btn">✈ Telegram</a>
    </div>
    <div class="divider"></div>
    <form method="POST" action="/check-approval">
      <button type="submit" class="btn btn-sky btn-full">🔄 Check Approval Status</button>
    </form>
    <div style="margin-top:12px;">
      <a href="/admin/login" class="btn btn-purple btn-full" style="text-align:center;">
        🛡 Owner Admin Panel Login
      </a>
    </div>
  </div>
</div>`);
}

// ─── DASHBOARD (placeholder after approval) ──────────────────
function dashboardPage(user) {
  return page("Dashboard", `
<div class="container">
  <div class="card" style="max-width:600px;">
    <div class="logo">
      <h1>⚡ DEVILXD</h1>
      <p>Dashboard</p>
    </div>
    <div class="msg msg-success" style="text-align:center;">
      ✅ Welcome back, <strong>${user.realname}</strong>! Your account is active.
    </div>
    <div style="text-align:center; padding: 20px 0; color:rgba(135,206,235,0.7);">
      <div style="font-size:3rem; margin-bottom:12px;">🚀</div>
      <p style="font-family:'Orbitron',sans-serif; font-size:1rem; color:#ff69b4;">Server is Ready</p>
      <p style="margin-top:8px; font-size:0.9rem;">Username: <strong style="color:#87ceeb;">${user.username}</strong></p>
    </div>
    <div class="divider"></div>
    <a href="/logout" class="btn btn-red btn-full">🚪 Logout</a>
  </div>
</div>`);
}

// ─── ADMIN LOGIN PAGE ────────────────────────────────────────
function adminLoginPage(err = "") {
  return page("Admin Login", `
<div class="container">
  <div class="card">
    <div class="logo">
      <h1>🛡 ADMIN</h1>
      <p>Owner Panel Access</p>
    </div>
    ${err ? `<div class="msg msg-error">⚠ ${err}</div>` : ""}
    <form method="POST" action="/admin/login">
      <div class="form-group">
        <label>Admin Username</label>
        <input type="text" name="username" placeholder="Admin username" required autocomplete="off">
      </div>
      <div class="form-group">
        <label>Admin Password</label>
        <input type="password" name="password" placeholder="Admin password" required>
      </div>
      <button type="submit" class="btn btn-purple btn-full" style="margin-top:8px;">
        🔐 Login as Admin
      </button>
    </form>
    <div class="divider"></div>
    <div class="link-text"><a href="/login">← Back to User Login</a></div>
  </div>
</div>`);
}

// ─── ADMIN PANEL ────────────────────────────────────────────
function adminPanel(db, msg = "") {
  const users = Object.values(db.users);
  const total = users.length;
  const approved = users.filter(u => u.approvalStatus === "approved").length;
  const pending = users.filter(u => u.approvalStatus === "pending").length;
  const suspended = users.filter(u => u.approvalStatus === "suspended").length;

  const userCards = users.map(u => {
    const status = u.approvalStatus || "pending";
    const badgeMap = {
      approved: "badge-approved",
      pending: "badge-pending",
      rejected: "badge-rejected",
      suspended: "badge-suspended"
    };
    const bClass = badgeMap[status] || "badge-pending";
    const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleString("en-IN") : "N/A";

    const approveBtn = (status !== "approved" && status !== "suspended")
      ? `<form method="POST" action="/admin/approve">
           <input type="hidden" name="username" value="${u.username}">
           <button class="btn btn-green btn-full" type="submit">✅ Approve</button>
         </form>`
      : "";

    const rejectBtn = (status === "approved" || status === "pending")
      ? `<form method="POST" action="/admin/reject">
           <input type="hidden" name="username" value="${u.username}">
           <button class="btn btn-orange btn-full" type="submit">❌ Reject</button>
         </form>`
      : "";

    const suspendBtn = status !== "suspended"
      ? `<form method="POST" action="/admin/suspend">
           <input type="hidden" name="username" value="${u.username}">
           <button class="btn btn-purple btn-full" type="submit">🚫 Suspend</button>
         </form>`
      : `<form method="POST" action="/admin/unsuspend">
           <input type="hidden" name="username" value="${u.username}">
           <button class="btn btn-teal btn-full" type="submit">🔓 Unsuspend</button>
         </form>`;

    const deleteBtn = `<form method="POST" action="/admin/delete" onsubmit="return confirm('Delete ${u.username}? This cannot be undone.')">
      <input type="hidden" name="username" value="${u.username}">
      <button class="btn btn-red btn-full" type="submit">🗑️ Delete Account</button>
    </form>`;

    return `
    <div class="ucard">
      <div class="ucard-top">
        <div class="ucard-name">
          <span class="ucard-icon">👤</span>
          <div>
            <div class="ucard-username">${u.username}</div>
            <div class="ucard-realname">${u.realname || "<em style='opacity:0.45;font-style:italic;'>Real name not set</em>"}</div>
          </div>
        </div>
        <span class="badge ${bClass}">${status.toUpperCase()}</span>
      </div>

      <div class="ucard-key">
        <div class="ucard-key-lbl">🔑 Approval Key</div>
        <div class="ucard-key-val">${u.approvalKey || "N/A"}</div>
      </div>

      <div class="ucard-meta">
        <span>📅 Joined: ${joinedDate}</span>
      </div>

      <div class="ucard-actions">
        ${approveBtn}
        ${rejectBtn}
        ${suspendBtn}
        ${deleteBtn}
      </div>
    </div>`;
  }).join("") || `
    <div style="text-align:center; padding:40px; color:rgba(255,255,255,0.35);">
      <div style="font-size:3rem; margin-bottom:12px;">👻</div>
      <p style="font-family:'Orbitron',sans-serif;">No users registered yet</p>
    </div>`;

  return page("Admin Panel", `
<style>
  .ucard {
    background: rgba(15,10,40,0.88);
    border: 1px solid rgba(255,105,180,0.2);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 18px;
    backdrop-filter: blur(12px);
    animation: cardIn 0.4s ease both;
  }
  .ucard-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 10px;
  }
  .ucard-name { display: flex; align-items: center; gap: 12px; }
  .ucard-icon { font-size: 1.8rem; }
  .ucard-username {
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #87ceeb;
  }
  .ucard-realname {
    font-size: 0.88rem;
    color: #ff69b4;
    margin-top: 2px;
    font-weight: 600;
  }
  .ucard-key {
    background: rgba(255,105,180,0.06);
    border: 1px dashed rgba(255,105,180,0.25);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 12px;
  }
  .ucard-key-lbl {
    font-size: 0.72rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(135,206,235,0.6);
    margin-bottom: 5px;
  }
  .ucard-key-val {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.82rem;
    color: #ff69b4;
    word-break: break-all;
    letter-spacing: 1px;
  }
  .ucard-meta {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.38);
    margin-bottom: 14px;
    letter-spacing: 0.5px;
  }
  .ucard-actions {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .ucard-actions form { width: 100%; }
  .ucard-actions .btn {
    width: 100%;
    padding: 13px 16px;
    font-size: 0.88rem;
    letter-spacing: 1px;
  }
</style>
<div class="admin-wrap">
  ${PARTICLE_BG}
  <div style="position:relative; z-index:1; max-width:600px; margin:0 auto;">

    <div class="admin-header">
      <div>
        <h1>🛡 DEVILXD</h1>
        <div style="font-size:0.75rem; color:rgba(135,206,235,0.6); letter-spacing:1.5px; margin-top:2px;">ADMIN PANEL</div>
      </div>
      <a href="/admin/logout" class="btn btn-red btn-sm">🚪 Logout</a>
    </div>

    ${msg ? `<div class="msg ${msg.type === "success" ? "msg-success" : "msg-error"}" style="margin-bottom:20px;">${msg.text}</div>` : ""}

    <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
      <div class="stat-card pink">
        <div class="num">${total}</div>
        <div class="lbl">Total Users</div>
      </div>
      <div class="stat-card green">
        <div class="num">${approved}</div>
        <div class="lbl">Approved</div>
      </div>
      <div class="stat-card orange">
        <div class="num">${pending}</div>
        <div class="lbl">Pending</div>
      </div>
      <div class="stat-card sky">
        <div class="num">${suspended}</div>
        <div class="lbl">Suspended</div>
      </div>
    </div>

    <div class="section-title">👥 All Users — Approval Management</div>

    ${userCards}

  </div>
</div>`);
}

// ─── HTTP SERVER ─────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  function redirect(loc, cookie = null) {
    const headers = { Location: loc };
    if (cookie) headers["Set-Cookie"] = cookie;
    res.writeHead(302, headers);
    res.end();
  }

  function send(html, code = 200, cookie = null) {
    const headers = { "Content-Type": "text/html; charset=utf-8" };
    if (cookie) headers["Set-Cookie"] = cookie;
    res.writeHead(code, headers);
    res.end(html);
  }

  const db = loadDB();

  // ── Check if admin session
  function isAdminSession() {
    const sid = getCookie(req, "admin_session");
    return sid && db.sessions["admin_" + sid];
  }

  // ── Check if user suspended by IP (for new signups)
  function isSuspendedIP() { return false; } // IP-based not needed; username-based is enough

  // ─────── ROUTES ───────────

  // Root → login
  if (pathname === "/" && method === "GET") {
    return redirect("/login");
  }

  // ── SIGNUP
  if (pathname === "/signup" && method === "GET") {
    return send(signupPage());
  }

  if (pathname === "/signup" && method === "POST") {
    const body = await parseBody(req);
    const { username, password, confirm } = body;

    if (!username || !password || !confirm)
      return send(signupPage("All fields are required."));
    if (username.length < 3)
      return send(signupPage("Username must be at least 3 characters."));
    if (password.length < 4)
      return send(signupPage("Password must be at least 4 characters."));
    if (password !== confirm)
      return send(signupPage("Passwords do not match."));
    if (db.users[username.toLowerCase()])
      return send(signupPage("Username already taken. Choose another."));

    // Check if this username was suspended
    if (db.suspended && db.suspended.includes(username.toLowerCase())) {
      return send(signupPage("⚠ Owner ne aapko server se suspend kar diya hai. Aap naya account nahi bana sakte."));
    }

    const hashedPass = crypto.createHash("sha256").update(password).digest("hex");
    const approvalKey = generateKey();
    db.users[username.toLowerCase()] = {
      username: username,
      password: hashedPass,
      approvalKey,
      approvalStatus: "pending",
      realname: "",
      createdAt: Date.now()
    };
    saveDB(db);

    return send(signupPage("", "Account created successfully! Please login."));
  }

  // ── LOGIN
  if (pathname === "/login" && method === "GET") {
    const sess = getSession(req);
    if (sess) return redirect("/approval");
    return send(loginPage());
  }

  if (pathname === "/login" && method === "POST") {
    const body = await parseBody(req);
    const { username, password } = body;
    const uname = (username || "").toLowerCase();
    const user = db.users[uname];

    if (!user) return send(loginPage("Invalid username or password."));
    const hashed = crypto.createHash("sha256").update(password || "").digest("hex");
    if (user.password !== hashed) return send(loginPage("Invalid username or password."));

    // Check suspended
    if (user.approvalStatus === "suspended") {
      return send(loginPage("⚠ Owner ne aapko server se suspend kar diya hai. Aap tab tak login nahi kar sakte jab tak owner aapko unsuspend na kare."));
    }

    const sid = generateSession();
    db.sessions[sid] = { username: uname, loginAt: Date.now() };
    saveDB(db);

    const cookieStr = `session=${sid}; Path=/; HttpOnly; Max-Age=86400`;

    if (user.approvalStatus === "approved") {
      return redirect("/dashboard", cookieStr);
    }
    return redirect("/approval", cookieStr);
  }

  // ── LOGOUT
  if (pathname === "/logout") {
    const sid = getCookie(req, "session");
    if (sid && db.sessions[sid]) { delete db.sessions[sid]; saveDB(db); }
    return redirect("/login", "session=; Path=/; Max-Age=0");
  }

  // ── SET REAL NAME
  if (pathname === "/set-realname" && method === "GET") {
    const sess = getSession(req);
    if (!sess) return redirect("/login");
    const user = db.users[sess.username];
    if (!user) return redirect("/login");
    if (user.approvalStatus === "suspended") return send(approvalPage(user));
    return send(realnamePage(user));
  }

  if (pathname === "/set-realname" && method === "POST") {
    const sess = getSession(req);
    if (!sess) return redirect("/login");
    const user = db.users[sess.username];
    if (!user) return redirect("/login");
    const body = await parseBody(req);
    const realname = (body.realname || "").trim();
    if (!realname) return send(realnamePage(user, "Real name cannot be empty."));
    db.users[sess.username].realname = realname;
    saveDB(db);
    return redirect("/approval");
  }

  // ── APPROVAL PAGE
  if (pathname === "/approval" && method === "GET") {
    const sess = getSession(req);
    if (!sess) return redirect("/login");
    const user = db.users[sess.username];
    if (!user) return redirect("/login");

    if (user.approvalStatus === "suspended") return send(approvalPage(user));
    if (user.approvalStatus === "approved") return redirect("/dashboard");

    // Need real name first
    if (!user.realname) return redirect("/set-realname");

    return send(approvalPage(user));
  }

  // ── CHECK APPROVAL STATUS
  if (pathname === "/check-approval" && method === "POST") {
    const sess = getSession(req);
    if (!sess) return redirect("/login");
    const freshDB = loadDB();
    const user = freshDB.users[sess.username];
    if (!user) return redirect("/login");

    if (user.approvalStatus === "approved") return redirect("/dashboard");
    if (user.approvalStatus === "suspended") return send(approvalPage(user));
    return send(approvalPage(user, "Still pending. Please wait for Owner approval."));
  }

  // ── DASHBOARD
  if (pathname === "/dashboard" && method === "GET") {
    const sess = getSession(req);
    if (!sess) return redirect("/login");
    const user = db.users[sess.username];
    if (!user) return redirect("/login");
    if (user.approvalStatus !== "approved") return redirect("/approval");
    return send(dashboardPage(user));
  }

  // ════════════════════════════════════════
  //   ADMIN ROUTES
  // ════════════════════════════════════════

  if (pathname === "/admin/login" && method === "GET") {
    if (isAdminSession()) return redirect("/admin");
    return send(adminLoginPage());
  }

  if (pathname === "/admin/login" && method === "POST") {
    const body = await parseBody(req);
    if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
      const sid = generateSession();
      db.sessions["admin_" + sid] = { admin: true, loginAt: Date.now() };
      saveDB(db);
      return redirect("/admin", `admin_session=${sid}; Path=/; HttpOnly; Max-Age=86400`);
    }
    return send(adminLoginPage("Invalid admin credentials."));
  }

  if (pathname === "/admin/logout") {
    const sid = getCookie(req, "admin_session");
    if (sid && db.sessions["admin_" + sid]) { delete db.sessions["admin_" + sid]; saveDB(db); }
    return redirect("/admin/login", "admin_session=; Path=/; Max-Age=0");
  }

  if (pathname === "/admin" && method === "GET") {
    if (!isAdminSession()) return redirect("/admin/login");
    return send(adminPanel(db));
  }

  // ── ADMIN APPROVE
  if (pathname === "/admin/approve" && method === "POST") {
    if (!isAdminSession()) return redirect("/admin/login");
    const body = await parseBody(req);
    const uname = (body.username || "").toLowerCase();
    if (db.users[uname]) {
      db.users[uname].approvalStatus = "approved";
      saveDB(db);
      return send(adminPanel(db, { type: "success", text: `✅ User "${db.users[uname].username}" approved successfully!` }));
    }
    return redirect("/admin");
  }

  // ── ADMIN REJECT
  if (pathname === "/admin/reject" && method === "POST") {
    if (!isAdminSession()) return redirect("/admin/login");
    const body = await parseBody(req);
    const uname = (body.username || "").toLowerCase();
    if (db.users[uname]) {
      db.users[uname].approvalStatus = "rejected";
      saveDB(db);
      return send(adminPanel(loadDB(), { type: "success", text: `❌ User "${db.users[uname].username}" rejected.` }));
    }
    return redirect("/admin");
  }

  // ── ADMIN SUSPEND
  if (pathname === "/admin/suspend" && method === "POST") {
    if (!isAdminSession()) return redirect("/admin/login");
    const body = await parseBody(req);
    const uname = (body.username || "").toLowerCase();
    if (db.users[uname]) {
      db.users[uname].approvalStatus = "suspended";
      if (!db.suspended) db.suspended = [];
      if (!db.suspended.includes(uname)) db.suspended.push(uname);
      // Kill all sessions for this user
      Object.keys(db.sessions).forEach(sid => {
        if (db.sessions[sid].username === uname) delete db.sessions[sid];
      });
      saveDB(db);
      return send(adminPanel(loadDB(), { type: "success", text: `🚫 User "${db.users[uname].username}" permanently suspended!` }));
    }
    return redirect("/admin");
  }

  // ── ADMIN UNSUSPEND
  if (pathname === "/admin/unsuspend" && method === "POST") {
    if (!isAdminSession()) return redirect("/admin/login");
    const body = await parseBody(req);
    const uname = (body.username || "").toLowerCase();
    if (db.users[uname]) {
      db.users[uname].approvalStatus = "pending";
      if (db.suspended) db.suspended = db.suspended.filter(u => u !== uname);
      saveDB(db);
      return send(adminPanel(loadDB(), { type: "success", text: `🔓 User "${db.users[uname].username}" unsuspended. Status reset to pending.` }));
    }
    return redirect("/admin");
  }

  // ── ADMIN DELETE
  if (pathname === "/admin/delete" && method === "POST") {
    if (!isAdminSession()) return redirect("/admin/login");
    const body = await parseBody(req);
    const uname = (body.username || "").toLowerCase();
    if (db.users[uname]) {
      const dispName = db.users[uname].username;
      delete db.users[uname];
      // Kill sessions
      Object.keys(db.sessions).forEach(sid => {
        if (db.sessions[sid].username === uname) delete db.sessions[sid];
      });
      saveDB(db);
      return send(adminPanel(loadDB(), { type: "success", text: `🗑 User "${dispName}" deleted permanently.` }));
    }
    return redirect("/admin");
  }

  // ── 404
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(page("404", `
<div class="container">
  <div class="card" style="text-align:center;">
    <div style="font-size:4rem; margin-bottom:16px;">💀</div>
    <h2 style="font-family:'Orbitron',sans-serif; color:#ff69b4; margin-bottom:12px;">404 — Not Found</h2>
    <a href="/login" class="btn btn-sky">← Go Home</a>
  </div>
</div>`));
});

server.listen(PORT, () => {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   ⚡  DEVILXD AUTH SYSTEM RUNNING  ⚡    ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║  🌐  http://localhost:${PORT}               ║`);
  console.log("║                                          ║");
  console.log("║  👤  USER ROUTES:                        ║");
  console.log(`║      /signup  — Create account           ║`);
  console.log(`║      /login   — User login               ║`);
  console.log(`║      /approval — Approval page           ║`);
  console.log(`║      /dashboard — After approval         ║`);
  console.log("║                                          ║");
  console.log("║  🛡  ADMIN PANEL:                        ║");
  console.log(`║      /admin/login                        ║`);
  console.log(`║      Username: DEVILXD                   ║`);
  console.log(`║      Password: LORDX00                   ║`);
  console.log("╚══════════════════════════════════════════╝\n");
});
