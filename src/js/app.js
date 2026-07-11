console.log("🚀 YieldTrace Terminal: V1.0 Gold Master Loaded");

import { supabase } from "./supabase.js";

// --- STATE DEFINITION ---
const project = {
  name: "Phoenix Solar Array V3",
  location: "US-East-1",
  capacity_kw: 500,
  cost_basis_usd: 125000
};

const metrics = {
  actual_yield: 450,
  expected_yield: 480,
  revenue_usd: 12500,
};

// --- UI INITIALIZATION ---
document.getElementById("project-name").textContent = project.name;

const metaContainer = document.getElementById("asset-meta");
if (metaContainer) {
  metaContainer.innerHTML = `
        <div class="border-b border-slate-800 pb-2">
            <p class="text-slate-500 uppercase text-[9px]">Location</p>
            <p class="text-slate-200 font-mono">${project.location}</p>
        </div>
        <div class="border-b border-slate-800 pb-2">
            <p class="text-slate-500 uppercase text-[9px]">Capacity</p>
            <p class="text-slate-200 font-mono">${project.capacity_kw} kWp</p>
        </div>
        <div>
            <p class="text-slate-500 uppercase text-[9px]">Current Yield</p>
            <p class="text-slate-200 font-mono">${metrics.actual_yield} MWh</p>
        </div>
    `;
}

// --- SCENARIO MODELER & PRESETS ---
const yieldSlider = document.getElementById("yield-slider");
const rateSlider = document.getElementById("rate-slider");
const yieldLabel = document.getElementById("yield-val");
const rateLabel = document.getElementById("rate-val");

const syncScenarios = () => {
  const currentYield = parseFloat(yieldSlider.value);
  const currentRate = parseFloat(rateSlider.value);

  metrics.actual_yield = currentYield;
  metrics.revenue_usd = currentYield * currentRate;

  if (yieldLabel) yieldLabel.textContent = currentYield;
  if (rateLabel) rateLabel.textContent = currentRate.toFixed(1);

  const yieldDisplay = document.querySelector("#asset-meta div:last-child p:last-child");
  if (yieldDisplay) yieldDisplay.textContent = `${currentYield} MWh`;
};

const presets = {
  stress: { yield: 410, rate: 22.0, msg: "EXECUTING P90 DOWNSIDE STRESS TEST" },
  baseline: { yield: 480, rate: 27.7, msg: "RESTORING P50 TECHNICAL BASELINE" },
  bull: { yield: 535, rate: 42.5, msg: "MODELING OPTIMIZED MARKET SCENARIO" },
};

const applyPreset = (type) => {
  const config = presets[type];
  if (!yieldSlider || !rateSlider) return;
  yieldSlider.value = config.yield;
  rateSlider.value = config.rate;
  syncScenarios();
  addTrace(config.msg, type === "stress" ? "err" : "info");
};

// --- CORE UTILITIES ---
const addTrace = (msg, type = "info") => {
  const traceContainer = document.getElementById("trace-container");
  if (!traceContainer) return;
  const div = document.createElement("div");
  div.className = `text-[10px] font-mono border-l-2 pl-2 mb-1 transition-all duration-300 ${
    type === "err" ? "border-red-500 text-red-400" : "border-blue-500 text-slate-400"
  }`;
  div.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
  traceContainer.prepend(div);
};

const getTerminalState = () => ({
  project: { ...project, name: document.getElementById("project-name")?.textContent || project.name },
  metrics: { ...metrics }
});

async function loadAuditHistory() {
  const { data, error } = await supabase
    .from("financial_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return console.error(error);

  const tbody = document.getElementById("ledger-rows");
  tbody.innerHTML = data.map(row => {
    const delta = (parseFloat(row.variance_index) - 1) * 100;
    const isNegative = delta < 0;
    const deltaColor = isNegative ? 'text-red-400' : 'text-emerald-400';
    const rowGlow = isNegative ? 'bg-red-500/5' : 'bg-emerald-500/5';
    const prefix = delta > 0 ? '+' : '';

    return `
        <tr class="border-b border-slate-800/50 hover:${rowGlow} transition-colors group">
            <td class="py-3 font-mono text-slate-500 group-hover:text-slate-300">${new Date(row.created_at).toLocaleDateString()}</td>
            <td class="py-3 text-right font-mono text-slate-300">${parseFloat(row.roi_percentage).toFixed(1)}%</td>
            <td class="py-3 text-right font-mono text-slate-500">${parseFloat(row.variance_index).toFixed(3)}</td>
            <td class="py-3 text-right font-mono font-bold ${deltaColor}">${prefix}${delta.toFixed(2)}%</td>
        </tr>
    `;
  }).join('');
}

// --- EVENT LISTENERS ---
yieldSlider?.addEventListener("input", syncScenarios);
rateSlider?.addEventListener("input", syncScenarios);
document.getElementById("btn-stress")?.addEventListener("click", () => applyPreset('stress'));
document.getElementById("btn-baseline")?.addEventListener("click", () => applyPreset('baseline'));
document.getElementById("btn-bull")?.addEventListener("click", () => applyPreset('bull'));

const runBtn = document.getElementById("run-analysis");
runBtn.addEventListener("click", async () => {
  const originalText = runBtn.textContent;
  runBtn.disabled = true;
  runBtn.innerHTML = `<span class="animate-pulse text-slate-400 font-mono">ANALYZING...</span>`;
  
  addTrace("INITIALIZING AGENTIC PIPELINE...", "info");

  try {
    const { project, metrics } = getTerminalState();
    const currentSessionId = crypto.randomUUID();
    addTrace("CONNECTING TO NODE BACKEND...", "info");

    const response = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: currentSessionId, metadata: project, metrics }),
    });

    if (!response.ok) throw new Error(`Quota or Protocol Fault: ${response.status}`);

    const data = await response.json();
    addTrace("AI ANALYSIS CAPTURED. PARSING...", "info");

    // UI Updates
    document.getElementById("ai-summary-text").textContent = data.summary;
    if (data.kpis) {
      document.getElementById("kpi-roi").textContent = `${data.kpis.roi_to_date.toFixed(1)}%`;
      document.getElementById("kpi-variance").textContent = `${data.kpis.variance_index.toFixed(3)}`;
      document.getElementById("kpi-payback").textContent = `${data.kpis.projected_payback_years.toFixed(1)} Yrs`;
      
      // ALPHA ALERT
      if (data.kpis.roi_to_date >= 15.0) {
        addTrace(`[MARKET ALERT]: INVESTOR ALPHA DETECTED`, "info");
        addTrace(`TARGET EXCEEDED: ${data.kpis.roi_to_date.toFixed(1)}% ROI`, "info");
      }
    }

    // Ledger Persistence
    await supabase.from("financial_reports").insert([{
      session_id: currentSessionId,
      asset_name: project.name,
      metrics_snapshot: metrics,
      ai_summary: data.summary,
      roi_percentage: data.kpis?.roi_to_date,
      variance_index: data.kpis?.variance_index,
      payback_years: data.kpis?.projected_payback_years,
    }]);

    await loadAuditHistory();
    addTrace("PIPELINE EXECUTION COMPLETE.", "info");

  } catch (err) {
    addTrace(`SYSTEM ERROR: ${err.message}`, "err");
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = originalText;
  }
});

loadAuditHistory();