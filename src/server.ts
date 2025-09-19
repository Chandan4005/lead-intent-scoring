import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure storage folder exists
if (!fs.existsSync("storage")) fs.mkdirSync("storage");

// ---------------- Health Check ----------------
app.get("/", (_req, res) => {
  res.send("🚀 Lead Intent Scoring API is running!");
});

app.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// ---------------- POST /offer ----------------
app.post("/offer", (req, res) => {
  const offer = req.body;

  if (!offer.name || !offer.value_props || !offer.ideal_use_cases) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  (global as any).offer = offer;
  res.json({ message: "Offer saved successfully", offer });
});

// ---------------- POST /leads/upload ----------------
const upload = multer({ dest: "storage/" });

app.post("/leads/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CSV file is required" });

  const leads: any[] = [];
  const filePath = path.join(__dirname, "../", req.file.path);

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on("data", (row) => leads.push(row))
    .on("end", () => {
      (global as any).leads = leads;
      fs.unlinkSync(filePath);
      res.json({ message: "Leads uploaded successfully", count: leads.length });
    })
    .on("error", (err) => res.status(500).json({ error: err.message }));
});


// ---------------- POST /score ----------------
app.post("/score", async (_req, res) => {
  const offer = (global as any).offer;
  const leads = (global as any).leads;

  if (!offer || !leads) {
    return res
      .status(400)
      .json({ error: "Offer or leads not found. Upload them first." });
  }

  try {
    const results = leads.map((lead: any) => {
      // ---- Rule Layer (0–50) ----
      let ruleScore = 0;
      const decisionMakers = ["Head of Growth", "VP Sales", "CEO", "Founder"];
      const influencers = ["Manager", "Director"];

      if (decisionMakers.includes(lead.role)) ruleScore += 20;
      else if (influencers.includes(lead.role)) ruleScore += 10;

      const icp = offer.ideal_use_cases;
      if (icp.some((i: string) => i.toLowerCase() === lead.industry.toLowerCase())) {
        ruleScore += 20;
      } else {
        ruleScore += 10;
      }

      if (
        lead.name &&
        lead.role &&
        lead.company &&
        lead.industry &&
        lead.location &&
        lead.linkedin_bio
      ) {
        ruleScore += 10;
      }

      // ---- Fallback AI Layer (fixed) ----
      const aiPoints = 50; // Always max, since AI is skipped
      const intent = "High";
      const aiReasoning = "AI scoring skipped for testing.";

      const finalScore = ruleScore + aiPoints;

      return {
        ...lead,
        intent,
        score: finalScore,
        reasoning: `Rule score: ${ruleScore}. AI: ${aiReasoning}`,
      };
    });

    (global as any).results = results;
    res.json({ message: "Scoring complete", results });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- GET /results ----------------
app.get("/results", (_req, res) => {
  const results = (global as any).results;
  if (!results) return res.status(400).json({ error: "No scored results found. Run /score first." });
  res.json(results);
});

// ---------------- GET /results/export ----------------
app.get("/results/export", async (_req, res) => {
  const results = (global as any).results;
  if (!results || results.length === 0) return res.status(400).json({ error: "No scored results found. Run /score first." });

  const csvWriter = createObjectCsvWriter({
    path: "storage/scored_results.csv",
    header: [
      { id: "name", title: "Name" },
      { id: "role", title: "Role" },
      { id: "company", title: "Company" },
      { id: "industry", title: "Industry" },
      { id: "location", title: "Location" },
      { id: "linkedin_bio", title: "LinkedIn Bio" },
      { id: "intent", title: "Intent" },
      { id: "score", title: "Score" },
      { id: "reasoning", title: "Reasoning" },
    ],
  });

  await csvWriter.writeRecords(results);
  res.download("storage/scored_results.csv", "scored_results.csv");
});
// ---------------- POST /api/summarize ----------------
app.post("/api/summarize", async (_req, res) => {
  const results = (global as any).results;
  if (!results || results.length === 0) {
    return res.status(400).json({ error: "No results to summarize" });
  }

  try {
    // Create a simple text summary (no AI here, just rule-based)
    const topLeads = results
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);

    const summary = `Top Leads Summary:\n${topLeads
      .map(
        (l: any, i: number) =>
          `${i + 1}. ${l.name} (${l.role}, ${l.company}) → Score: ${l.score}, Intent: ${l.intent}`
      )
      .join("\n")}`;

    // --- Send to Slack if webhook is configured ---
    if (process.env.SLACK_WEBHOOK_URL) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, { text: summary });
    }

    res.json({ summary, sentToSlack: !!process.env.SLACK_WEBHOOK_URL });
  } catch (err: any) {
    console.error("Summarization error:", err.message);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// ---------------- POST /api/notify-slack ----------------
app.post("/api/notify-slack", async (_req, res) => {
  const results = (global as any).results;
  if (!results || results.length === 0) {
    return res.status(400).json({ error: "No scored results to send." });
  }

  try {
    // Pick top 3 leads
    const topLeads = results
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);

    const text = topLeads
      .map((lead: any, idx: number) => 
        `${idx + 1}. ${lead.name} (${lead.role}, ${lead.company}) → ${lead.intent} intent (Score: ${lead.score})`
      )
      .join("\n");

    await axios.post(process.env.SLACK_WEBHOOK_URL as string, {
      text: `🚀 Top Leads from Scoring:\n${text}`,
    });

    res.json({ message: "Posted top leads to Slack", topLeads });
  } catch (err: any) {
    console.error("Slack error:", err.message);
    res.status(500).json({ error: "Failed to send to Slack" });
  }
});

// ---------------- Start Server ----------------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
