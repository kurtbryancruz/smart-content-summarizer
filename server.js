// ─────────────────────────────────────────────
// Smart Content Summarizer — Backend (server.js)
// Powered by Groq (free, works in Philippines!)
// ─────────────────────────────────────────────

// Step 1: Load environment variables from .env file
require("dotenv").config();

// Step 2: Import the packages we need
const express = require("express");
const cors = require("cors");
const path = require("path");
const Groq = require("groq-sdk"); // Groq SDK

// Step 3: Create the Express app
const app = express();

// Step 4: Read the port from .env, or default to 3000
const PORT = process.env.PORT || 3000;

// Step 5: Set up the Groq client using the API key from .env
// NEVER paste your actual key here — always use process.env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

// Allow cross-origin requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve all files inside the /public folder
app.use(express.static(path.join(__dirname, "public")));

// ─────────────────────────────────────────────
// Route: POST /summarize
// ─────────────────────────────────────────────

app.post("/summarize", async (req, res) => {
  // Step 1: Get the text from the request body
  const { text } = req.body;

  // Step 2: Validate — make sure text was actually sent
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "No text provided. Please paste an article." });
  }

  try {
    // Step 3: Build the prompt to send to Groq
    const prompt = `Summarize the following article into exactly 3 concise bullet points.
Make them clear and easy to understand.
Return ONLY the 3 bullet points as a JSON array of strings, with no extra text.
Example format: ["Point one here.", "Point two here.", "Point three here."]

Article:
${text}`;

    // Step 4: Call the Groq API
    // llama3-8b-8192 is free, fast, and great for summarization
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes articles into clear, concise bullet points.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5, // Lower = more focused, consistent output
    });

    // Step 5: Extract the text from Groq's response
    const rawContent = result.choices[0].message.content.trim();

    // Step 6: Clean the response — sometimes wrapped in ```json ... ```
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")  // Remove opening ```json
      .replace(/^```\s*/i, "")      // Remove opening ```
      .replace(/\s*```$/i, "")      // Remove closing ```
      .trim();

    // Step 7: Parse the JSON array from the response
    let summary;
    try {
      summary = JSON.parse(cleaned);

      // Make sure we got an array
      if (!Array.isArray(summary)) {
        throw new Error("Response was not an array");
      }
    } catch (parseError) {
      // Fallback: split by newline and clean up bullet symbols
      summary = rawContent
        .split("\n")
        .map((line) => line.replace(/^[-•*\d.]+\s*/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 3);
    }

    // Step 8: Send the summary back to the frontend
    res.json({ summary });

  } catch (error) {
    // Log the real error in terminal for debugging
    console.error("Groq API error:", error.message);

    res.status(500).json({
      error: "Something went wrong while summarizing. Please check your API key and try again.",
    });
  }
});

// ─────────────────────────────────────────────
// Start the server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`📄 Open your browser and go to http://localhost:${PORT}`);
});