/**
 * Keyword Generator Module (MAIN ENTRY POINT)
 * -----------------------
 * Utilizes Google's Gemini AI to analyze legal queries and extract relevant keywords.
 * The module processes user questions, identifies key legal concepts, and generates
 * optimized search terms with appropriate time ranges. Output is structured according 
 * to a predefined schema and saved to JSON for downstream case analysis.
 * 
 * @requires GoogleGenerativeAI
 * @requires dotenv - For API key management
 * @output extracted-keywords.json
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import path from "path";
import dotenv from "dotenv";
import { writeToFile } from "./helpers.js";
import { keyWordSchema } from "./schema/keywordGenSchema.js";

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
 * The model should strictly adhere to CoT instructions provided. Lite versions of top tier grade models will work seamlessly
 */

const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: keyWordSchema,
  },
});

/** 
 * CoT for keyword extraction and time constrain logic
 * @requires userQuery
 * @output keywordSchema
 */
const prompt = `First, carefully read and understand the user query to identify its core themes, intent, and specific focus areas. Avoid generic terms like 'court,' 'legal,' or 'precedents,' and do not include standalone years in the keywords. Extract meaningful, compound-noun keywords that are specific, relevant, and commonly used in search queries. Ensure the keywords closely align with the provided query to minimize irrelevant search results. Select keywords that users would realistically type into a search engine when researching the given topic. Determine the applicable timeframe based on contextual clues in the query: If the query mentions 'recent' or 'current' events, set yearAfter = 2021 and yearBefore = 2025. If the query refers to the 'past,' set yearAfter = 2019 and yearBefore = 2023. If a specific year is mentioned, only set specifiedYear to that year, and set both yearAfter and yearBefore to 0. If no timeframe is mentioned, default to yearAfter = 2019 and yearBefore = 2025. Finally, output exactly five optimized, highly targeted keywords that effectively summarize the text while ensuring maximum search accuracy and relevance. Here is the users question ${userQuery[1]}`;

/* const perplexity = "You are a URL Fetcher Bot specializing in extracting the most relevant URLs related to a given legal topic. First, analyze the user’s query to determine its key legal concepts and intent, utilizing the extracted possibleKeywords output to refine search accuracy. Perform a targeted search within the specified legal domains: site:kenyalaw.org/caselaw/cases and site:new.kenyalaw.org/caselaw/cases, ensuring that results are filtered based on the provided timeframe. If specifiedYear has been provided, limit results to that exact year; otherwise, apply the range yearAfter:[X] yearBefore:[Y]. Exclude file types such as PDF, DOCX, and DOC to ensure only relevant URL links are retrieved. Once results are obtained, analyze the content of each page against the user query and possibleKeywords, prioritizing case law pages with strong legal relevance rather than simple keyword matching. Rank the URLs based on contextual alignment with the query and return exactly 13 of the most relevant case law URLs, ensuring diversity while maintaining precision." */

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
    writeToFile(extractedKeywords, "extracted-keywords.json");
  })
  .catch((error) => {
    console.error("Error: ", error);
  });
