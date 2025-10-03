import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import { aggregateKeywords } from "./dataAndResults/aggregate-keywords.js";

const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

const { aggregatedKeywords, yearAfter, yearBefore, specifiedYear } = aggregateKeywords;
const SCRAPINGDOG_API_KEY = process.env.SCRAPINGDOG_API_KEY;
if (!SCRAPINGDOG_API_KEY) {
  throw new Error("ScrapingDog API key is not defined in your .env file");
}

/**
 * Helper function to normalize URLs (remove tracking parameters, etc.).
 * Ensures URLs with same base path are treated as duplicates.
 * 
 * @param {string} url - The URL to normalize.
 * @returns {string} - Normalized URL for comparison.
 */
const normalizeUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname; // Keep only base URL path, remove query params
  } catch (error) {
    console.error("Error normalizing URL:", error);
    return url; // Return original URL if parsing fails
  }
};

/**
 * Fetch search results for a given keyword using ScrapingDog API.
 * Ensures duplicate URLs are filtered out dynamically.
 * 
 * @param {string} keyword - Search keyword.
 * @returns {Promise<{ keyword: string, caseurl: string[] }>} - Extracted URLs for the keyword.
 */
const fetchSearchResults = async (keyword) => {
  try {
    let timeFilter = "";
    if (specifiedYear) {
      timeFilter = `("${keyword}" ${specifiedYear})`;
    } else if (yearAfter && yearBefore) {
      timeFilter = `("${keyword}") after:${yearAfter} before:${yearBefore}`;
    }

    // Construct search query
    const query = `site:new.kenyalaw.org/caselaw/cases OR site:kenyalaw.org/caselaw/cases ${timeFilter} -filetype:pdf -filetype:docx`;

    // ScrapingDog API parameters
    const params = {
      api_key: SCRAPINGDOG_API_KEY,
      query: query,
      results: 5,
      country: "ke",
      cr: "countryKE",
      domain: "google.co.ke",
      page: 0,
      advance_search: "false",
    };

    const scrapingdogUrl = "https://api.scrapingdog.com/google/";
    const { data } = await axios.get(scrapingdogUrl, { params });

    // Extract URLs from the response
    let urls = data.organic_results?.map((result) => result.link) || [];

    
    const seenUrls = new Set();
    const filteredUrls = urls.filter((url) => {
      const normalized = normalizeUrl(url);
      if (seenUrls.has(normalized)) return false; // Ignore duplicates
      seenUrls.add(normalized);
      return true;
    });

    return { keyword, caseurl: filteredUrls };
  } catch (error) {
    console.error(`Error fetching results for ${keyword}:`, error.message);
    return { keyword, caseurl: [] }; // Return empty array on failure
  }
};

/**
 * Process all aggregated keywords to fetch & filter case URLs.
 */
const processKeywords = async () => {
  try {
    const results = await Promise.all(
      aggregatedKeywords.map(fetchSearchResults)
    );
    console.log("Filtered Results for Keywords:", results);
    return results;
  } catch (error) {
    console.error("Error processing keywords:", error.message);
  }
};

processKeywords();
