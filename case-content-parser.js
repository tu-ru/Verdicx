import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { writeToFile } from "./helpers.js";
import schema from "./schema/caseParserSchema.js";
import { scrapedCaseSamples } from "./dataAndResults/case-samples.js";

dotenv.config();
const { GEMINI_API_KEY } = process.env;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini's key is not defined in your .env file");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize the generative model with the schema
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

// Parser function that accepts an array (of one object) of scraped case data and returns parsed info
async function parseCases(data) {
  try {
    const prompt = `You are a meticulous legal assistant tasked with extracting information from legal documents. Extract information and structure it in the provided JSON template. If a field cannot be filled due to lack of data, state "NOT FISIBLE". Perform a deep analysis to fill all fields whenever possible.`;
    // Convert the case sample to a JSON string for the prompt
    const inputString = JSON.stringify(data, null, 2);
    const result = await model.generateContent(`${prompt}\n${inputString}`);
    let extractedText = result.response.text();
    return extractedText;
  } catch (error) {
    throw error;
  }
}

// Function to clean/minify a text string (removes extra whitespace, newlines, tabs, etc.)
const minifyText = (text) => {
  return text.replace(/\s+/g, " ").trim();
};

// Recursive function to deep minify all string values within an object or array
const deepMinify = (data) => {
  if (typeof data === "string") {
    return minifyText(data);
  } else if (Array.isArray(data)) {
    return data.map((item) => deepMinify(item));
  } else if (data !== null && typeof data === "object") {
    const result = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        result[key] = deepMinify(data[key]);
      }
    }
    return result;
  }
  return data;
};

// Updated function that loops over each scraped case within each keyword group
async function parseCasesIndividually(data) {
  const parsedResults = [];
  
  for (const caseGroup of data) {
    for (const scrapedCase of caseGroup.scrapedCases) {
      try {
        // Here we combine the keyword with the individual case data
        const caseData = [{
          keyword: caseGroup.keyword,
          url: scrapedCase.url,
          content: scrapedCase.content
        }];
        const parsedOutput = await parseCases(caseData);
        // Save the result along with keyword and URL details
        parsedResults.push({ 
          keyword: caseGroup.keyword, 
          url: scrapedCase.url, 
          parsedOutput 
        });
      } catch (error) {
        console.error(`Parsing failed for ${caseGroup.keyword} at ${scrapedCase.url}:`, error);
      }
    }
  }
  return deepMinify(parsedResults);
}

// Trigger parsing for each scraped case and write all parsed results to file
parseCasesIndividually(scrapedCaseSamples)
  .then((results) => {
    writeToFile(JSON.stringify(results, null, 2), "parsed-cases.json");
  })
  .catch((error) => {
    console.error("Error during parsing:", error);
  });
