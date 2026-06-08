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

app.listen(PORT, () => {
  console.log(`✅ API is running at http://localhost:${PORT}`);
  console.log(`📞 Get phone: GET  http://localhost:${PORT}/api/phone`);
  console.log(`✏️  Set phone: POST http://localhost:${PORT}/api/phone`);
});