import { readJsonFile } from '../helpers.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Convert URL to file path for Windows compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create absolute path using path.resolve
const keywordsPath = path.resolve(
  __dirname,
  '../json_outputs/ep_kwg_output.json'
);
const aggKeywordsPath = path.resolve(
  __dirname,
  '../json_outputs/csq_kwg_output.json'
);
const scrapedCasesPath = path.resolve(
  __dirname,
  '../json_outputs/ccs_output.json'
);
const caseUrlsPath = path.resolve(__dirname, '../json_outputs/csq_output.json');
export const getKeywords = async () => {
  try {
    const jsonData = await readJsonFile(keywordsPath);
    return {
      keywords: jsonData.possibleKeywords,
      yearAfter: jsonData.yearAfter,
      yearBefore: jsonData.yearBefore,
      specifiedYear: jsonData.specifiedYear,
    };
  } catch (error) {
    console.error('Failed to load keywords and expected data:', error);
    return null;
  }
};

export const getAggKeywords = async () => {
  try {
    const jsonData = await readJsonFile(aggKeywordsPath);
    return {
      aggKeywords: jsonData.aggregatedKeywords,
      yearAfter: jsonData.yearAfter,
      yearBefore: jsonData.yearBefore,
      specifiedYear: jsonData.specifiedYear,
    };
  } catch (error) {
    console.error(
      'Failed to load aggregated keywords and expected data:',
      error
    );
    return null;
  }
};

export const getCaseUrls = async () => {
  try {
    return await readJsonFile(caseUrlsPath);
  } catch (error) {
    console.error('Failed to load caseUrls and expected data:', error);
  }
};

export const getScrapedCases = async () => {
  try {
    return await readJsonFile(scrapedCasesPath);
  } catch (error) {
    console.error('Failed to load scraped cases and expected data:', error);
  }
};
