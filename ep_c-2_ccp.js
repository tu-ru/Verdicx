import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeToFile } from './helpers.js';
import { schema2BluePrint } from './schema/case_parse_schema.js';
import { getScrapedCases } from './json_outputs/json_parser.js';
import dotenv from 'dotenv';

dotenv.config();
const { GEMINI_API_KEY } = process.env;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini's key is not defined in your .env file");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initialize the generative model with the schema
const model = genAI.getGenerativeModel({
  model: 'models/gemini-2.5-flash-preview-09-2025',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: schema2BluePrint,
    temperature: 1,
    // topK: 97,
    // topP: .8,
    maxOutputTokens: 4096,
    thinkingConfig: {
      // thinkingBudget: 1024 custom token allocation for reasoning scope
      // thinkingBudget: off = 0 dynamic on = -1
      thinkingBudget: -1,
    },
  },
});

// Parser function that accepts an array (of one object) of scraped case data and returns parsed info
async function parseScrapedCases(data) {
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
const minifyText = text => {
  return text.replace(/\s+/g, ' ').trim();
};

// Recursive function to deep minify all string values within an object or array
const deepMinify = data => {
  if (typeof data === 'string') {
    return minifyText(data);
  } else if (Array.isArray(data)) {
    return data.map(item => deepMinify(item));
  } else if (data !== null && typeof data === 'object') {
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

// Iterates over each scraped case within each keyword group
async function processScrapedCases(data) {
  const parsedResults = [];
  try {
    // Validate input data
    if (!data || !Array.isArray(data)) {
      throw new Error('Input data must be an array');
    }

    const scrapedCases = await getScrapedCases();
    if (!scrapedCases || !Array.isArray(scrapedCases)) {
      throw new Error('Failed to load scraped cases or invalid format');
    }

    for (const scrapedGroup of scrapedCases) {
      if (!scrapedGroup.scrapedCases || !Array.isArray(scrapedGroup.scrapedCases)) {
        console.warn(`Skipping invalid case group: ${JSON.stringify(scrapedGroup)}`);
        continue;
      }

      for (const scrapedCase of scrapedGroup.scrapedCases) {
        try {
          // Here we combine the keyword with the individual scarped data
          const scrapedData = [
            {
              keyword: scrapedGroup.keyword,
              url: scrapedCase.url,
              content: scrapedCase.content,
            },
          ];
          const parsedOutput = await parseScrapedCases(scrapedData);
          // Save the result along with keyword and URL details
          parsedResults.push({
            keyword: scrapedGroup.keyword,
            url: scrapedCase.url,
            parsedOutput,
          });
        } catch (error) {
          console.error(
            `Parsing failed for ${scrapedGroup.keyword} at ${scrapedCase.url}:`,
            error.message || error
          );
        }
      }
    }
    return deepMinify(parsedResults);
  } catch (error) {
    console.error('Fatal error in processScrapedCases:', error.message || error);
    throw error;
  }
}

processScrapedCases()
  .then(results => {
    writeToFile(results, './json_outputs/ccp_output.json');
  })
  .catch(error => {
    console.error('Error during parsing:', error);
  });
