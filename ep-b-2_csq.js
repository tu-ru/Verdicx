/**
 * @fileoverview Case query search scraper module for Kenyan law cases.
 * This module handles the searching and scraping of legal case URLs from Kenya Law websites
 * using the ScrapingDog API. It includes functionality for URL normalization and
 * duplicate filtering.
 *
 * @module case-querySearch-scraper
 * @requires dotenv
 * @requires path
 * @requires axios
 * @requires ./dataAndResults/aggregate-keywords
 *
 * @example
 * // Basic usage
 * processKeywords().then(results => {
 *   console.log(results);
 * });
 *
 * @author [samm]
 * @version 1.0.0
 * @license [License MIT]
 */

import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import { getAggKeywords } from './json_outputs/json_parser.js';
import { writeToFile } from "./helpers.js";


const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

let state = {
    aggKeywords: [],
    yearAfter: null,
    yearBefore: null,
    specifiedYear: null,
    initialized: false
};

const init = async () => {
    if (state.initialized) return;

    const jsonData = await getAggKeywords();
    state = {
        ...jsonData,
        initialized: true
    };
};
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
 * @param {string} keyword - Search keyword (query).
 * @returns {Promise<{ keyword: string, caseurl: string[] }>} - Extracted URLs for the keyword.
 */
const fetchSearchResults = async (keyword) => {
  try {
    let keywordAndconstrain = "";
    if (state.specifiedYear) {
      keywordAndconstrain = `${keyword} ${state.specifiedYear}`;
    } else if (state.yearAfter && state.yearBefore) {
      keywordAndconstrain = `${keyword} after:${state.yearAfter} before:${state.yearBefore}`;
    }

    // Construct search query
    const query = `site:new.kenyalaw.org/akn/ke/judgment/ ${keywordAndconstrain} -filetype:pdf -filetype:docx`;

    console.log("Checking request sent to scraper dog", query)

    // ScrapingDog API parameters
    const params = {
      api_key: SCRAPINGDOG_API_KEY,
      query: query,
      results: 10,
      country: "ke",
      cr: "countryKE",
      advance_search: 'false',
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
  await init()
  try {
    const results = await Promise.all(
      state.aggKeywords.map(fetchSearchResults)
    );
    console.log("Filtered Results for Keywords:", results);
    return results;
  } catch (error) {
    console.error("Error processing keywords:", error.message);
  }
};

processKeywords().then((results => {
  writeToFile(results, "./json_outputs/csq_output.json")
})).catch(error => {
    console.error("Fetching URLs failed:", error);
});
