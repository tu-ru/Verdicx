/**
 * Keyword Generator Module (ENTRY POINT MODULE - NEXT ENTRY POINT IS - )
 * -----------------------
 * Utilizes Google's Gemini AI to analyze legal queries and extract relevant keywords.
 * The module processes user questions, identifies key legal concepts, and generates
 * optimized search terms with appropriate time ranges. Output is structured according
 * to a predefined schema and saved to JSON for downstream case analysis.
 *
 * @requires GoogleGenerativeAI
 * @requires dotenv - For API key management
 * @output ep_kwg_output.json
 */

import { GoogleGenerativeAI} from "@google/generative-ai";
import path from "path";
import dotenv from "dotenv";
import { writeToFile } from "./helpers.js";
import { keyWordSchema, keyWordPrompt } from "./schema/keywordGenSchema.js";

// TODO Centralize env fetching mechanism

/**
 * Initiate Gemini model using API key */
const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

const { GEMINI_API_KEY } = process.env;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini's key is not defined in your .env file");
}

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * The model should strictly adhere to CoT instructions provided. Lite versions of top tier grade models will work
 * NOTE: topK Limits the vocabulary to only consider the top K most likely next tokens
 * topP : Uses nucleus sampling to select from tokens that sum to probability P
 * ------- effects ------
 * Lower values = more focused, deterministic responses while higher values = more creative, diverse respons
 */

const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash-lite-preview-09-2025",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: keyWordSchema,
    temperature: 1,
    // topK: 97,
    // topP: .8,
    maxOutputTokens: 2048,
    thinkingConfig: {
      // thinkingBudget: 1024 custom token allocation for reasoning scope
      // thinkingBudget: off = 0 dynamic on = -1
      thinkingBudget: -1
    }
  }
});

/**
 * Variable userQuery holds the intended persona questions, and time constrains if specified
 */
const userQuery = [
  "Given evidence of fraudulent transfer of title deeds and unauthorized encroachment on a land parcel, what ruling should the court be expected to deliver?",
  "I was sexually assulted, but i have no evidence, how will the judge handle this case?",
  "How did courts handle workplace discrimination cases in 2022?",
];

/**
 * CoT for keyword extraction and time constrain logic
 * @requires keyWordPrompt
 * @requires userQuery
 * @output keywordSchema
 */
const prompt = `${keyWordPrompt(userQuery)}`;
async function keywordGenerator(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    throw error;
  }
}
keywordGenerator(prompt)
  .then((extractedKeywords) => {
    writeToFile(extractedKeywords, "/json_outputs/ep_kwg_output.json");
  })
  .catch((error) => {
    console.error("Error: ", error);
  });