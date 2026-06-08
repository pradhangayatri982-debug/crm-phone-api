const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "db.json");

app.use(cors());
app.use(express.json());

function readPhone() {
  const data = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(data);
}

function savePhone(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/phone", (req, res) => {
  try {
    const phone = readPhone();
    res.json({ success: true, data: phone });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not read phone number" });
  }
});

app.post("/api/phone", (req, res) => {
  try {
    const { number, label, available } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    const updated = { number, label, available };
    savePhone(updated);
    res.json({ success: true, message: "Phone number updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update phone number" });
  }
});

app.delete("/api/phone", (req, res) => {
  try {
    const empty = { number: "", label: "", available: "" };
    savePhone(empty);
    res.json({ success: true, message: "Phone number cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not clear phone number" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "CRM Phone API is running ✅", version: "1.0.0" });
});

// Widget script endpoint
app.get("/widget.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    (function() {
      fetch('https://crm-phone-api-production.up.railway.app/api/phone')
        .then(r => r.json())
        .then(data => {
          if (!data.success) return;
          const num = data.data.number;
          const clean = num.replace(/[^0-9]/g, '');
          const div = document.createElement('div');
          div.style = 'display:flex;gap:10px;align-items:center;';
          div.innerHTML = \`
            <a href="https://wa.me/\${clean}?text=Hello" target="_blank"
               style="background:#25D366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-family:sans-serif;">
               WhatsApp
            </a>
            <a href="tel:\${num}"
               style="background:#eee;color:#333;padding:10px 20px;border-radius:8px;text-decoration:none;font-family:sans-serif;">
               Call \${num}
            </a>
          \`;
          document.currentScript
            ? document.currentScript.parentNode.insertBefore(div, document.currentScript)
            : document.body.appendChild(div);
        });
    })();
  `);
});

app.get("/demo", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>CRM Contact Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; max-width: 480px; margin: 40px auto; padding: 0 20px; background: #f5f5f5; }
    h2 { margin-bottom: 20px; font-size: 22px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #eee; }
    .phone-num { font-size: 24px; font-weight: bold; color: #111; margin-top: 6px; }
    label { font-size: 13px; color: #666; display: block; margin-bottom: 4px; margin-top: 12px; }
    input, textarea { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    textarea { resize: none; margin-bottom: 16px; }
    .btn { width: 100%; padding: 14px; background: #25D366; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .status { margin-top: 14px; padding: 10px 14px; background: #e8f5e9; border-radius: 8px; font-size: 13px; color: #2e7d32; display: none; }
  </style>
</head>
<body>
  <h2>Contact Support</h2>
  <div class="card">
    <div style="font-size:13px;color:#888;">Live from API</div>
    <div class="phone-num" id="phone">Loading...</div>
    <div style="font-size:12px;color:#aaa;margin-top:4px;" id="available"></div>
  </div>
  <div class="card">
    <label>Your name</label>
    <input type="text" id="name" placeholder="e.g. John Smith" />
    <label>Your message</label>
    <textarea id="msg" rows="4" placeholder="Type your message here..."></textarea>
    <button class="btn" onclick="send()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Send via WhatsApp
    </button>
    <div class="status" id="status">Message sent! Check your WhatsApp.</div>
  </div>
  <script>
    let phone = '';
    fetch('/api/phone').then(r=>r.json()).then(d=>{
      phone = d.data.number;
      document.getElementById('phone').textContent = phone;
      document.getElementById('available').textContent = d.data.available;
    });
    function send() {
      const name = document.getElementById('name').value.trim();
      const msg = document.getElementById('msg').value.trim();
      if (!msg) { alert('Please enter a message!'); return; }
      const clean = phone.replace(/[^0-9]/g,'');
      const text = name ? 'From ' + name + ': ' + msg : msg;
      window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(text), '_blank');
      document.getElementById('status').style.display = 'block';
    }
  <\/script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ API is running at http://localhost:${PORT}`);
  console.log(`📞 Get phone: GET  http://localhost:${PORT}/api/phone`);
  console.log(`✏️  Set phone: POST http://localhost:${PORT}/api/phone`);
});