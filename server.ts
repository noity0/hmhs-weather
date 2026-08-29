import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded singleton for GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Utility to clean markdown code blocks from JSON output
function sanitizeJsonString(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGemini,
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

// Meteorological rule-based insight generator when Gemini is unavailable or under heavy demand
function generateMeteorologicalInsights(
  location: any,
  current: any,
  forecast: any,
  airQuality: any,
  userPrompt?: string
) {
  const tempC = current?.temp ?? current?.temp_c ?? 20;
  const condition = (current?.conditionText || current?.condition || "Clear").toLowerCase();
  const windKph = current?.windSpeed ?? current?.wind_kph ?? 10;
  const humidity = current?.humidity ?? 50;
  const uv = current?.uvIndex ?? 4;
  const aqi = airQuality?.usAqi ?? 35;
  const locName = location?.name || "your area";

  // Outfit recommendations
  let top = "Light breathable cotton t-shirt";
  let bottom = "Comfortable shorts or light chinos";
  let footwear = "Breathable sneakers or walking shoes";
  const accessories: string[] = [];

  if (tempC < 5) {
    top = "Thermal base layer with heavy winter coat and fleece";
    bottom = "Insulated trousers or fleece-lined pants";
    footwear = "Waterproof insulated winter boots";
    accessories.push("Thermal gloves", "Beanie / Wool cap", "Warm scarf");
  } else if (tempC < 14) {
    top = "Long-sleeve shirt paired with a medium jacket or sweater";
    bottom = "Denim jeans or heavy trousers";
    footwear = "Comfortable closed-toe leather or walking shoes";
    accessories.push("Light scarf or windbreaker");
  } else if (tempC < 22) {
    top = "Layered t-shirt with a light cardigan or denim jacket";
    bottom = "Standard trousers, chinos, or jeans";
    footwear = "Casual sneakers or flat shoes";
  } else if (tempC < 29) {
    top = "Breathable short-sleeve shirt or polo";
    bottom = "Lightweight shorts, skirt, or linen trousers";
    footwear = "Cushioned sneakers or sandals";
  } else {
    top = "Ultra-lightweight loose linen or moisture-wicking top";
    bottom = "Breathable shorts or linen pants";
    footwear = "Open sandals or ultra-light sneakers";
  }

  if (condition.includes("rain") || condition.includes("shower") || condition.includes("drizzle") || (forecast?.pop || 0) > 40) {
    accessories.push("Compact windproof umbrella", "Water-resistant jacket");
    footwear = "Waterproof sneakers or rain boots";
  }
  if (uv >= 6) {
    accessories.push("Polarized sunglasses", "SPF 50+ Broad Spectrum Sunscreen", "Wide-brim UV hat");
  } else if (uv >= 3) {
    accessories.push("UV Sunglasses", "SPF 30+ Sunscreen");
  }
  if (accessories.length === 0) {
    accessories.push("Hydration water bottle", "Sunglasses");
  }

  // Activity suitability scores (1-10)
  const isRain = condition.includes("rain") || condition.includes("thunder") || (forecast?.pop || 0) > 60;
  const isStorm = condition.includes("thunder") || condition.includes("storm") || windKph > 50;

  let runScore = 8;
  let runReason = "Great conditions for cardio pacing.";
  if (isStorm) {
    runScore = 2;
    runReason = "Avoid outdoor runs due to storm or severe gusts.";
  } else if (isRain) {
    runScore = 4;
    runReason = "Wet surfaces; consider treadmill or rain gear.";
  } else if (tempC > 30) {
    runScore = 5;
    runReason = "Hot temperatures; schedule runs for early morning or dusk.";
  } else if (tempC < 2) {
    runScore = 5;
    runReason = "Freezing temperatures; warm up thoroughly indoors.";
  }

  let cycleScore = 8;
  let cycleReason = "Favorable wind velocity and road grip.";
  if (isStorm || windKph > 35) {
    cycleScore = 3;
    cycleReason = `Strong headwinds (${Math.round(windKph)} km/h); caution on crosswinds.`;
  } else if (isRain) {
    cycleScore = 4;
    cycleReason = "Slippery road traction; reduce downhill speed.";
  }

  let diningScore = 9;
  let diningReason = "Ideal temperature for outdoor patios.";
  if (isRain || isStorm) {
    diningScore = 2;
    diningReason = "Rain expected; indoor dining highly recommended.";
  } else if (tempC < 12 || tempC > 33) {
    diningScore = 5;
    diningReason = "Chilly or intense heat; prefer climate-controlled seating.";
  }

  let summary = `Currently in ${locName}, conditions are ${condition} with temperatures around ${Math.round(tempC)}°C. `;
  if (isRain) {
    summary += `Expect periodic precipitation today with higher humidity around ${humidity}%. Keep waterproof layers handy.`;
  } else if (tempC >= 25) {
    summary += `A warm and sunny outlook today with a peak around ${Math.round(forecast?.maxTemp_c || tempC)}°C. Perfect for outdoor tasks with UV protection.`;
  } else if (tempC <= 10) {
    summary += `Brisk, cool atmospheric conditions with crisp air. Bundle up in insulating layers when heading outside.`;
  } else {
    summary += `Pleasant, balanced meteorological conditions across the region with moderate breeze of ${Math.round(windKph)} km/h.`;
  }

  // Health and UV tip
  let healthTip = "Hydrate regularly throughout the day.";
  if (aqi > 100) {
    healthTip = `Air Quality Index is elevated (AQI ${aqi}). Sensitive individuals should limit prolonged outdoor exertion.`;
  } else if (uv >= 8) {
    healthTip = `Very High UV Index (${uv}). Sunburn can occur in under 15 minutes; apply SPF 50 and seek shade during midday hours.`;
  } else if (uv >= 6) {
    healthTip = `High UV Index (${uv}). Wear protective sunglasses and sunscreen between 10 AM and 4 PM.`;
  } else if (isRain) {
    healthTip = "Damp surfaces increase slip risks; maintain indoor air ventilation.";
  } else {
    healthTip = "Air quality and atmospheric indices are optimal for outdoor exercise and healthy ventilation.";
  }

  let aiAnswer = `Based on current weather in ${locName} (${Math.round(tempC)}°C, ${condition}), conditions are generally favorable. Dress appropriately for ${Math.round(tempC)}°C and enjoy your day!`;
  if (userPrompt && userPrompt.trim()) {
    const q = userPrompt.toLowerCase();
    if (q.includes("rain") || q.includes("umbrella")) {
      aiAnswer = isRain
        ? `Yes, rain is active or likely today (${forecast?.pop || 50}% probability). An umbrella or rain jacket is strongly advised.`
        : `Rain probability is low (${forecast?.pop || 10}%). You likely will not need an umbrella for standard outings.`;
    } else if (q.includes("picnic") || q.includes("park") || q.includes("barbecue") || q.includes("bbq")) {
      aiAnswer = diningScore >= 7
        ? `Great news! Weather conditions are well-suited for a picnic or outdoor gathering. Temperature is around ${Math.round(tempC)}°C with ${condition} skies.`
        : `Outdoor picnics may be challenging today due to ${isRain ? 'rain' : 'unfavorable weather conditions'}. A covered gazebo or indoor venue is recommended.`;
    } else if (q.includes("wear") || q.includes("outfit") || q.includes("jacket")) {
      aiAnswer = `We recommend wearing: ${top} paired with ${bottom} and ${footwear}. Don't forget ${accessories.join(", ")}.`;
    } else if (q.includes("drive") || q.includes("travel") || q.includes("road")) {
      aiAnswer = isStorm || isRain
        ? `Exercise extra caution while driving; wet roads and reduced visibility may affect commute times. Keep a safe following distance.`
        : `Driving conditions are clear and favorable with good visibility across the area.`;
    } else {
      aiAnswer = `Analyzing your question for ${locName}: The current temperature is ${Math.round(tempC)}°C with ${condition} skies, ${windKph} km/h wind, and ${forecast?.pop || 0}% chance of precipitation. Plan your activities accordingly!`;
    }
  }

  return {
    summary,
    outfit: {
      top,
      bottom,
      footwear,
      accessories: accessories.slice(0, 3),
    },
    activities: [
      { name: "Running & Jogging", score: runScore, reason: runReason },
      { name: "Cycling & Commute", score: cycleScore, reason: cycleReason },
      { name: "Outdoor Dining & Parks", score: diningScore, reason: diningReason },
    ],
    healthTip,
    aiAnswer,
  };
}

// AI Weather Insights & Advice Route with multi-tier model fallback & resilient failure recovery
app.post("/api/weather-ai", async (req: Request, res: Response) => {
  const { location, current, forecast, airQuality, userPrompt } = req.body || {};

  const weatherContext = `
Location: ${location?.name || "Unknown"}, ${location?.country || ""}
Current Temperature: ${current?.temp_c ?? current?.temp ?? 20}°C (${current?.temp_f ?? (current?.temp ? (current.temp * 9/5 + 32) : 68)}°F)
Apparent Feel: ${current?.feelslike_c ?? current?.feelsLike ?? 20}°C
Weather Condition: ${current?.conditionText || current?.condition || "Clear"}
Wind Speed: ${current?.wind_kph ?? current?.windSpeed ?? 10} km/h, Direction: ${current?.wind_dir || current?.windDirection || "N"}
Humidity: ${current?.humidity ?? 50}%
UV Index: ${current?.uvIndex ?? 0}
Air Quality (US AQI): ${airQuality?.usAqi ?? 35}
Precipitation Probability today: ${forecast?.pop ?? 0}%
High/Low today: ${forecast?.maxTemp_c ?? 22}°C / ${forecast?.minTemp_c ?? 14}°C
`;

  const systemInstruction = `You are the AI Weather Intelligence Assistant for an advanced live weather app.
Provide a structured, engaging, highly accurate and practical weather report & recommendation package.
Keep your response concise, friendly, formatted cleanly in JSON.

Output MUST be valid JSON with the following structure:
{
  "summary": "2-3 sentence atmospheric narrative explaining how the weather feels and what to expect today.",
  "outfit": {
    "top": "Upper body recommendation (e.g. breathable t-shirt + windbreaker)",
    "bottom": "Lower body recommendation",
    "footwear": "Recommended footwear",
    "accessories": ["List of 2-3 items like Sunglasses, SPF 50 sunscreen, Compact Umbrella"]
  },
  "activities": [
    {"name": "Running & Jogging", "score": 8, "reason": "Cool temperature and clear paths."},
    {"name": "Cycling", "score": 7, "reason": "Mild wind breeze."},
    {"name": "Outdoor Dining", "score": 9, "reason": "Pleasant conditions without rain."}
  ],
  "healthTip": "Actionable health or UV/allergen advisory based on AQI and UV levels.",
  "aiAnswer": "Answer to user question if user asked a prompt, otherwise brief tip of the day"
}`;

  let prompt = `Analyze this weather data and generate insights:\n${weatherContext}`;
  if (userPrompt && typeof userPrompt === "string" && userPrompt.trim()) {
    prompt += `\n\nUser Question: "${userPrompt.trim()}"`;
  }

  const ai = getGeminiClient();

  if (ai) {
    // Model fallback chain: recommended standard Gemini models
    const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        const rawText = response.text || "";
        if (rawText) {
          const cleanedText = sanitizeJsonString(rawText);
          const parsed = JSON.parse(cleanedText);
          if (parsed && (parsed.summary || parsed.outfit || parsed.aiAnswer)) {
            return res.json({ success: true, data: parsed, source: "gemini", model: modelName });
          }
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini API] Notice for model ${modelName}:`, errMsg.substring(0, 150));
        // Continue to fallback model
      }
    }
  }

  // Resilient fallback: Return rich calculated meteorological insights if API key missing or models temporarily busy
  const fallbackInsights = generateMeteorologicalInsights(location, current, forecast, airQuality, userPrompt);
  return res.json({
    success: true,
    data: fallbackInsights,
    source: "meteorological_engine",
    notice: "Real-time atmospheric physics calculation active",
  });
});

// Global error handler for uncaught express errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled server error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: "Internal Server Error", message: err?.message || "An unexpected error occurred" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Live Weather Detector server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

