

## Overview
Verdicx is an automated pipeline that turns natural language legal queries into structured case-law data.

## Core Components

### 1. Environment Setup
```javascript
const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });
```
- Manages environment variables
# Verdicx — Project Overview and Module Reference

This document provides a concise, developer-focused reference for the key modules in the Verdicx project. Each module section follows the same structure: Purpose, Inputs, Outputs, Main Functions, Configuration, Dependencies, Usage, and Notes.

---

## 1. Entry Point Keyword Generator (`ep_kwg.js`)

Purpose
- Generate structured keyword sets from natural-language legal queries using an AI model.

Inputs
- Array of user query strings.
- Environment variable: `GEMINI_API_KEY`.

Outputs
- JSON file containing generated keywords and optional time filters (e.g., `ep_kwg_output.json`).

Main Functions
- Initialize environment and AI model.
- Format prompt and call the generative model with a response schema.
- Validate and write schema-conformant results to disk.

Configuration
- Model settings: model name, temperature, max tokens, thinking budget.
- Response schema for validating AI output.

Dependencies
- `@google/generative-ai`, `dotenv`, `path`.

Usage
- Run: `node ep_kwg.js`.

Notes
- Design output for straightforward downstream consumption (case search scraper).

---

## 2. Keyword Aggregator (`ep-b-1_csq`)

Purpose
- Aggregate and filter keyword candidates to improve search precision and recall.

Inputs
- Keyword arrays (from `ep_kwg.js` or stored JSON).
- Configuration thresholds (frequency, relevance).

Outputs
- Aggregated keyword set written to disk for the search scraper.

Main Functions
- Fetch keyword inputs.
- Apply aggregation algorithm and thresholds.
- Produce and persist cleaned keyword lists.

Configuration
- Threshold values (0.0 - 1.0) to control strictness.

Dependencies
- Local helper functions and JSON parsing utilities.

Usage
- Import as module or run aggregator script.

Notes
- Keep thresholds configurable for experimentation.

---

## 3. Case Query Search Scraper (`ep-b-2_csq`)

Purpose
- Use search APIs (ScrapingDog / Google) to collect case URLs for each keyword.

Inputs
- Aggregated keywords.
- API keys for search service.
- Optional time filters (year range or specific year).

Outputs
- JSON file with structure: [{ keyword, caseurl: [urls...] }].

Main Functions
- Build search queries with optional time filters.
- Call search API, normalize and deduplicate URLs.
- Persist results to disk for the content scraper.

Configuration
- Results per keyword, country/domain restrictions, paging.

Dependencies
- `axios`, `dotenv`.

Usage
- Run: `node ep-b-2_csq` or import functions.

Notes
- Normalize URLs to a consistent origin + path format.

---

## 4. Case Content Scraper (`ep_c-1_ccs.js`)

Purpose
- Fetch individual case pages and extract structured content (metadata, body text, document download links).

Inputs
- JSON from the search scraper: [{ keyword, caseurl: [urls...] }].

Outputs
- JSON file containing scraped case objects grouped by keyword (e.g., `ccs_output.json`).

Main Functions
- Validate and normalize URLs.
- Fetch case pages with `axios` and parse HTML with `cheerio`.
- Extract metadata, main judgment text, and PDF download links with fallbacks.
- Minify and sanitize extracted text.

Configuration
- Limit number of URLs processed per keyword (configurable slice).
- Base origin for resolving relative download links (e.g., `https://new.kenyalaw.org`).

Dependencies
- `axios`, `cheerio`, local helpers.

Usage
- Run: `node ep_c-1_ccs.js`.

Notes
- Download links are always normalized to absolute URLs.
- DOCX extraction has been removed; module focuses on PDF links only.

---

## 5. Scraped Case Parser (`ep_c-2_scp.js`)

Purpose
- Parse previously scraped case content with a generative AI model to produce schema-conformant structured data.

Inputs
- Scraped cases JSON (output from `ep_c-1_ccs.js`).
- Environment variable: `GEMINI_API_KEY`.

Outputs
- JSON file containing parsed case objects (e.g., `scp_output.json`).

Main Functions
- Load scraped cases, validate structure, and iterate per keyword and case.
- For each case, build AI prompt and call the generative model with `schema3BluePrint`.
- Minify and sanitize the AI response, then persist results.

Configuration
- Model: Gemini Pro variant, temperature, thinking budget, response schema.

Dependencies
- `@google/generative-ai`, `dotenv`, schema file, JSON parser.

Usage
- Run: `node ep_c-2_scp.js`.

Notes
- The module logs parsing failures with context; it does not abort on single-case failures.

---

## 6. Schema Definitions (`schema/case_parse_schema.js`)

Purpose
- Define the JSON schema(s) used by generative models to ensure structured outputs.

Contents
- `schema2BluePrint` and `schema3BluePrint` (or other versions) describing expected fields and data types.

Usage
- Import into modules that call the generative model.

Notes
- Keep schema versions documented and backward compatible where possible.

---

## 7. Helpers and Utilities (`helpers.js`)

Purpose
- Common utility functions used across modules (file I/O, text minification, write helpers).

Common Functions
- `writeToFile(data, path)`, `minifyText`, URL normalization helpers, etc.

Usage
- Import functions as needed.

Notes
- Keep helpers small and well-tested.

---

## Running the Whole Pipeline

1. Generate keywords
- `node ep_kwg.js` -> produces `ep_kwg_output.json`.

2. Aggregate keywords (optional)
- Run aggregator to refine keywords.

3. Collect case URLs
- `node case-querySearch-scraper.js` -> produces search results JSON.

4. Scrape case content
- `node ep_c-1_ccs.js` -> produces `ccs_output.json` and ensures download links are absolute.

5. Parse scraped cases
- `node ep_c-2_scp.js` -> produces `scp_output.json` with schema-conformant structured data.

---

## Developer Notes

- Keep all API keys in `.env` and never commit them.
- Log useful context (keyword, URL) on errors for easier debugging.
- When updating schemas, version them and migrate outputs gradually.
- Add tests for helper functions (text minification, URL normalization).

---

## License

**MIT**