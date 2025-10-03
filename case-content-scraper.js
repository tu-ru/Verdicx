import axios from "axios";
import * as cheerio from "cheerio"; // Use the default import for Cheerio
import { caseUrls } from "./dataAndResults/case-urls.js";
import { writeToFile } from "./helpers.js";

// Function to clean/minify text
const minifyText = (text) => {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces (including newlines) with a single space
    .replace(/^\s+|\s+$/g, "") // Trim spaces at the start and end
    .replace(/\t/g, " ") // Remove tab characters
    .trim();
};

const scrapeBodyText = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const metaText = $("dl.document-metadata-list").text().trim();
    
    // Extract article content, fallback to <div class="judgement"> if empty
    let articleText = $("article.akn-judgment[data-name='judgment']").text().trim();
    if (!articleText) {
      articleText = $("div.judgement").text().trim();
    }

    // Helper function to validate links (filter out javascript:void())
    const validateLink = (link) => link && !link.includes("javascript:void");

    // Extract file links from metadata first
    let pdfLink = $("dl.document-metadata-list dt:contains('Original source file')")
      .next("dd")
      .find("a[href$='.pdf']")
      .attr("href");

    let docxLink = $("dl.document-metadata-list dt:contains('Original source file')")
      .next("dd")
      .find("a[href$='.docx']")
      .attr("href");

    // Fallback: Extract from <div class="features">
    if (!pdfLink) {
      pdfLink = $("div.features a.Pdf").attr("href") || $("div.features a:contains('PDF')").attr("href");
    }
    if (!docxLink) {
      docxLink = $("div.features a.Docx").attr("href") || $("div.features a:contains('DOCX')").attr("href");
    }

    // Favor PDF, fallback to DOCX, validate links
    const downloadLink = validateLink(pdfLink) ? pdfLink : validateLink(docxLink) ? docxLink : "No available download link";

    return {
      metaContent: minifyText(metaText) || "No metadata found",
      bodyContent: minifyText(articleText) || "No content found",
      downloadLink
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return {
      metaContent: "Error fetching metadata",
      bodyContent: "Error fetching content",
      downloadLink: "Error fetching download link"
    };
  }
};

// Function to process case URLs by keyword (limiting to first 5 URLs per group)
const scrapeAllCases = async () => {
  const results = [];

  for (const caseGroup of caseUrls) {
    const { keyword, caseurl } = caseGroup;
    if (!caseurl.length) continue; // Skip if no URLs available

    console.log(`Scraping for keyword: ${keyword}`);

    const scrapedData = await Promise.all(
      caseurl.map(async (url) => ({
        url,
        content: await scrapeBodyText(url),
      })),
    );

    results.push({ keyword, scrapedCases: scrapedData });
  }

  return results;
};

// Run the scraper and write results to file
scrapeAllCases().then((data) => {
  writeToFile(JSON.stringify(data, null, 2), "extracted-cases.json");
});
