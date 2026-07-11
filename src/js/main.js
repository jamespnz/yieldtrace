import { supabase } from './supabase.js';
import { runAnalystSession } from './api.js';

// Configuration for the "Investment Banking" Aesthetic
const UI_CONFIG = {
    colors: { positive: 'text-blue-400', negative: 'text-red-400', neutral: 'text-silver-400' }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🛠️ SolAnalytica Terminal Initialized");
    const sessionId = crypto.randomUUID();
    document.getElementById('sessionId').innerText = sessionId.split('-')[0].toUpperCase();

    // 1. Initial Data Fetch
    const projectData = await fetchProjectOverview();
    if (projectData) {
        renderMetricsTable(projectData.metrics);
        updateProjectHeader(projectData.metadata);
    }

    // 2. Event Listener for Agentic Analysis
    document.getElementById('analyzeBtn').addEventListener('click', () => {
        triggerAgenticAnalysis(sessionId, projectData);
    });
});

/**
 * Fetches seeded solar data from Supabase tables
 */
async function fetchProjectOverview() {
    const { data: metadata, error: metaError } = await supabase
        .from('solar_projects')
        .select('*')
        .single();

    const { data: metrics, error: metricsError } = await supabase
        .from('generation_metrics')
        .select('*')
        .order('reading_date', { ascending: false })
        .limit(365);

    if (metaError || metricsError) {
        renderTraceStep('SYSTEM', '❌ Error fetching source data', 'error');
        return null;
    }

    return { metadata, metrics };
}

/**
 * Renders high-density table rows with variance logic
 */
function renderMetricsTable(metrics) {
    const tbody = document.querySelector('#metricsTable tbody');
    tbody.innerHTML = metrics.map(row => {
        const variance = ((row.actual_kwh - row.projected_kwh) / row.projected_kwh * 100).toFixed(1);
        const varianceClass = variance >= 0 ? UI_CONFIG.colors.positive : UI_CONFIG.colors.negative;

        return `
            <tr class="hover:bg-slate-800/50 border-b border-slate-800 transition-colors">
                <td class="p-2 text-silver-400">${row.reading_date}</td>
                <td class="p-2 text-right text-white">${row.actual_kwh.toLocaleString()}</td>
                <td class="p-2 text-right text-silver-400">${row.projected_kwh.toLocaleString()}</td>
                <td class="p-2 text-right font-bold ${varianceClass}">${variance}%</td>
            </tr>
        `;
    }).join('');
}

/**
 * Orchestrates the Agentic Reasoning and UI Tracing
 */
async function triggerAgenticAnalysis(sessionId, data) {
    const btn = document.getElementById('analyzeBtn');
    btn.disabled = true;
    btn.innerText = "ANALYZING...";

    // Trace Step 1: Retrieval
    renderTraceStep('RETRIEVAL', `Analyzing ${data.metrics.length} historical data points...`);
    
    try {
        // Trace Step 2: Gemini Execution via api.js
        const analysis = await runAnalystSession(sessionId, data);
        
        // Trace Step 3: Final Reasoning Display
        renderTraceStep('REASONING', analysis.summary);
        document.getElementById('roiValue').innerText = `${analysis.kpis.roi_to_date}%`;
        
    } catch (err) {
        renderTraceStep('ERROR', 'Agent reasoning failed.');
    } finally {
        btn.disabled = false;
        btn.innerText = "RUN AGENTIC ANALYSIS";
    }
}

/**
 * Utility to inject "Investment Banking" style trace logs into the sidebar
 */
export function renderTraceStep(step, message, type = 'info') {
    const traceLog = document.getElementById('traceLog');
    const color = type === 'error' ? 'text-red-400' : 'text-blue-400';
    
    const logEntry = document.createElement('div');
    logEntry.className = "border-l border-slate-700 pl-3 py-1 animate-in fade-in slide-in-from-right-4 duration-500";
    logEntry.innerHTML = `
        <div class="flex justify-between items-center mb-1">
            <span class="font-bold ${color}">[${step}]</span>
            <span class="text-slate-600 text-[8px]">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="text-silver-400 leading-relaxed">${message}</div>
    `;
    
    traceLog.prepend(logEntry);
}