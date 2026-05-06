import { readFileSync } from "fs";
import { runDispatchRook } from "./dist/rook_dispatch.js";

// Load GEMINI_API_KEY from settings — strip BOM if present
let settingsRaw = readFileSync("C:/Users/Administrator/.claude/settings.json", "utf8");
if (settingsRaw.charCodeAt(0) === 0xFEFF) settingsRaw = settingsRaw.slice(1);
const settings = JSON.parse(settingsRaw);
process.env.GEMINI_API_KEY = settings.env.GEMINI_API_KEY;

console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY, "length:", process.env.GEMINI_API_KEY?.length);

const result = await runDispatchRook({
  prompt_content: "Describe the concept of hydraulic pressure in one sentence.",
  model: "gemini-2.5-flash",
  max_tokens: 100,
});

console.log(JSON.stringify(result, null, 2));
