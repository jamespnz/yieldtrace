const express = require("express");
const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { metadata, metrics, sessionId } = req.body;

  // 1. Validation Layer
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "API Configuration Missing" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // UPDATED: Using the 2026 Gemini 2.5 Flash Stable endpoint
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    console.log(`--- LIVE ANALYSIS START: ${sessionId} ---`);

    const prompt = {
    contents: [{
        parts: [{
            text: `Act as a Solar Project Controller. 
            Analyze: ${metadata.name}. 
            Cost Basis: $${metadata.cost_basis_usd}. 
            Revenue: $${metrics.revenue_usd}.
            Yield: ${metrics.actual_yield} vs ${metrics.expected_yield} MWh.

            CALCULATION RULES:
            1. ROI % = (Revenue / Cost Basis) * 100.
            2. Variance = (Actual Yield / Expected Yield).
            3. Payback = (Cost Basis / Revenue).

            Return STRICT JSON: {"summary": "string", "kpis": {"roi_to_date": 0.0, "variance_index": 0.0, "projected_payback_years": 0.0}}`
            },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompt),
    });

    const data = await response.json();

    // Handle API-level errors (like 404/403)
    if (data.error) {
      throw new Error(`Google API Error: ${data.error.message}`);
    }

    // Extract and clean the AI response
    const aiText = data.candidates[0].content.parts[0].text;
    const cleanJson = JSON.parse(aiText.replace(/```json|```/g, "").trim());

    console.log(`[SYSTEM]: Live Analysis Successful for ${sessionId}`);
    res.status(200).json(cleanJson);
  } catch (error) {
    console.error(`[SYSTEM ERROR]: ${error.message}`);
    // Fallback to professional UI error message
    res.status(500).json({
      error: "Analysis Engine Offline",
      message: "Verify model availability and API key entitlements.",
    });
  }
});

module.exports = router;
