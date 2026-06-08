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

app.listen(PORT, () => {
  console.log(`✅ API is running at http://localhost:${PORT}`);
  console.log(`📞 Get phone: GET  http://localhost:${PORT}/api/phone`);
  console.log(`✏️  Set phone: POST http://localhost:${PORT}/api/phone`);
});