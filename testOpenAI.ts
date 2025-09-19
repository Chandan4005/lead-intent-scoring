import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  try {
    const res = await axios.get("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    console.log("✅ OpenAI call success:", res.data.data.map((m: any) => m.id));
  } catch (err: any) {
    console.error("❌ OpenAI call failed:", err.response?.data || err.message);
  }
})();
