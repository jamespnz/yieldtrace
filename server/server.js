require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors"); // 1. REQUIRE THE PACKAGE
const analyzeRoutes = require("./routes/analyze");
const rootDir = path.join(__dirname, "../");
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "connect-src * wss:;"
  );
  next();
});

// 2. ACTIVATE CORS FOR LOCAL DEVELOPMENT PORT BOUNDARIES
app.use(cors({
  origin: [
    "https://yieldtrace.headsup-consulting.com",
    "https://yieldtrace.netlify.app" // Temporary fallback during DNS propagation
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- 1. THE STATUS GATEWAY ---
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

// --- 1b. GSC VERIFICATION GATEWAY ---
app.get("/google9a93f6f686d88ddc.html", (req, res) => {
  res.sendFile(path.join(rootDir, "google9a93f6f686d88ddc.html"));
});

// --- 2. THE UI GATEWAY (The priority) ---
// This looks for index.html in the root folder (one level up from /server)
app.use(express.static(rootDir));

// --- 3. THE ANALYTICS ENGINE ---
app.use("/api", analyzeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 YieldTrace Backend Active: http://localhost:${PORT}`);
});