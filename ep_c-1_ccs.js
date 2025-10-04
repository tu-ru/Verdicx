/**
 * @fileoverview Case Content Scraper Module for Kenyan Law Cases
 * This module handles the extraction and structuring of legal case content
 * from the Kenya Law website. It processes URLs from search results and
 * extracts metadata, judgment text, and document links.
 *
 * @module case-content-scraper
 * @requires axios
 * @requires cheerio
 * @requires ./helpers
 *
 * @typedef {Object} ScrapedContent
 * @property {string} metaContent - Extracted metadata
 * @property {string} bodyContent - Main judgment text
 * @property {string} downloadLink - URL to PDF/DOCX document
 *
 * @typedef {Object} CaseResult
 * @property {string} url - Case URL
 * @property {ScrapedContent} content - Scraped content
 *
 * @typedef {Object} KeywordGroup
 * @property {string} keyword - Search keyword
 * @property {CaseResult[]} scrapedCases - Array of scraped cases
 */

import axios from 'axios';
import * as cheerio from 'cheerio'; // Use the default import for Cheerio
import { getCaseUrls } from './json_outputs/json_parser.js';
import { writeToFile } from './helpers.js';

// Function to clean/minify text
const minifyText = text => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces (including newlines) with a single space
    .replace(/^\s+|\s+$/g, '') // Trim spaces at the start and end
    .replace(/\t/g, ' ') // Remove tab characters
    .trim();
};

// URL validator and normalizer
const validateUrl = url => {
  try {
    // If the URL starts with '/', it's a relative path
    if (url.startsWith('/')) {
      url = `https://new.kenyalaw.org${url}`;
    }
    const urlObj = new URL(url);
    return urlObj.hostname === 'new.kenyalaw.org';
  } catch {
    return false;
  }
};

// Helper function to ensure URL is absolute
const normalizeUrl = url => {
  if (url.startsWith('/')) {
    return `https://new.kenyalaw.org${url}`;
  }
  return url;
};
const scrapeBodyText = async url => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const metaText = $('dl.document-metadata-list').text().trim();

    // Extract article content, fallback to <div class="judgement"> if empty
    let articleText = $("article.akn-judgment[data-name='judgment']")
      .text()
      .trim();
    if (!articleText) {
      articleText = $('div.judgement').text().trim();
    }

    // Helper function to validate links (filter out javascript:void())
    const validateLink = link => link && !link.includes('javascript:void');

    // Extract PDF link from the new structure
    let pdfLink = $(
      '.btn-group.dropdown-center a.btn-primary.btn-shrink-sm'
    ).attr('href');

    // Fallback: Try metadata list if new structure not found
    if (!pdfLink) {
      pdfLink = $(
        "dl.document-metadata-list dt:contains('Original source file')"
      )
        .next('dd')
        .find("a[href$='.pdf']")
        .attr('href');
    }

    // Second fallback: Try features div
    if (!pdfLink) {
      pdfLink =
        $('div.features a.Pdf').attr('href') ||
        $("div.features a:contains('PDF')").attr('href');
    }

    // Handle PDF download link, always ensuring it's an absolute URL
    let downloadLink = 'No available download link';

    if (pdfLink) {
      // Always convert to absolute URL, whether it starts with http or /
      try {
        downloadLink = new URL(pdfLink, 'https://new.kenyalaw.org').toString();
      } catch (error) {
        console.error(`Error converting URL ${pdfLink}:`, error.message);
      }
    }

    return {
      metaContent: minifyText(metaText) || 'No metadata found',
      bodyContent: minifyText(articleText) || 'No content found',
      downloadLink,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return {
      metaContent: 'Error fetching metadata',
      bodyContent: 'Error fetching content',
      downloadLink: 'Error fetching download link',
    };
  }
};

// Function to process case URLs by keyword (limiting to first 4 URLs per group)
const urlScraper = async () => {
  const results = [];
  try {
    // Get case URLs data
    const caseUrls = await getCaseUrls();
    if (!caseUrls || !Array.isArray(caseUrls)) {
      throw new Error('Input data must be an array');
    }

    for (const caseGroup of caseUrls) {
      const { keyword, caseurl } = caseGroup;
      if (!caseurl?.length) continue;

      console.log(`Scraping for keyword: ${keyword}`);
      // Normalize and validate URLs
      const validUrls = caseurl
        .map(url => normalizeUrl(url))
        .filter(validateUrl)
        .slice(0, 2); // Limit to first 2 valid URLs for testing purposes

      console.log(`Processing ${validUrls.length} URLs for ${keyword}`);

      const scrapedData = await Promise.all(
        validUrls.map(async url => ({
          url,
          content: await scrapeBodyText(url),
        }))
      );

      results.push({ keyword, scrapedCases: scrapedData });
    }

    return results;
  } catch (error) {
    console.error('Error in urlScraper:', error);
    throw error;
  }
};
// Run the scraper and write results to file
(async () => {
  try {
    const data = await urlScraper();
    writeToFile(data, './json_outputs/ccs_output.json');
    console.log('Scraping completed successfully');
  } catch (error) {
    console.error('Scraping failed:', error);
  }
})();
