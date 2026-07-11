require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // We use a manual fetch because the JS SDK's listModels is sometimes inconsistent
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("--- AVAILABLE MODELS FOR YOUR KEY ---");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`ID: ${m.name.replace('models/', '')} | Display: ${m.displayName}`);
      }
    });
  } catch (error) {
    console.error("Diagnostic Failed:", error);
  }
}

listModels();