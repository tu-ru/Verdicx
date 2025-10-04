import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { aggSampleData } from "./dataAndResults/aggdata.js";
import { statutesSchema } from "./schema/aggregatedStatutes.js";
import { writeToFile } from "./helpers.js";

const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

const { GEMINI_API_KEY, SCRAPINGDOG_API_KEY } = process.env;
if (!GEMINI_API_KEY) throw new Error("Gemini API key is missing");
if (!SCRAPINGDOG_API_KEY) throw new Error("ScrapingDog API key is missing");
// Destructure more fields from aggSampleData for richer analysis
const {
  aggregatedStatutes,
  aggregatedDefendants,
  aggregatedPlaintiffs,
  mostLikelyDisposition,
  confidenceScores,
  enhancedAnalysis: {
    issueClassification: { primaryIssues, secondaryIssues },
    precedentAnalysis: { keyPrecedents },
    implicationsAnalysis: {
      legalImplications,
      practicalImplications,
      dissentingOpinions,
    },
    counterArguments,
    timelineAnalysis: { yearlyTrends },
    jurisdictionDistribution,
  },
  counts,
  aggregatedFinalCaseURLs,
  aggregatedSourceFileURLs,
  enhancedAnalysis,
} = aggSampleData;

const userQuery = [
  "Given evidence of fraudulent transfer of title deeds and unauthorized encroachment on a land parcel, what ruling should the court be expected to deliver?",
  "I was sexually assulted, but i have no evidence, how will the judge handle this case?",
  "How did courts handle workplace discrimination cases in 2022?",
];

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const insightModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: statutesSchema,
  },
});

const minifyText = (text) => {
  return text
    .replace(/\s+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .trim();
};



const narrowedFetchResults = async (statutes) => {
  // Extract the first 4 statutes only
  const firstFourStatutes = statutes.slice(0, 3);

  console.log(firstFourStatutes)
  // Loop through each statute and fetch results
  const searchResults = await Promise.all(
    firstFourStatutes.map(async (statute) => {
      const query = `site:new.kenyalaw.org/akn/ke/act "${statute}" -filetype:pdf -filetype:docx`;
      const params = {
        api_key: SCRAPINGDOG_API_KEY,
        query,
        results: 1,
        country: "ke",
        cr: "countryKE",
        domain: "google.co.ke",
        page: 0,
        advance_search: "false",
      };
      const scrapingdogUrl = "https://api.scrapingdog.com/google/";

      try {
        const { data } = await axios.get(scrapingdogUrl, { params });
        return {
          statute,
          caseurl: data.organic_results?.map((result) => result.link) || [],
        };
      } catch (error) {
        console.error(`Error fetching results for ${statute}:`, error.message);
        return { statute, caseurl: [] };
      }
    })
  );

  return searchResults;
};

const scrapeActBodyText = async (urls) => {
  try {
    const results = await Promise.all(
      urls.slice(0, 4).map(async (url) => {
        try {
          const { data } = await axios.get(url);
          const $ = cheerio.load(data);

          // Try extracting content using multiple selectors for robustness
          let actText = $("#document-content.content-and-enrichments").text().trim();
          if (!actText) actText = $("la-akoma-ntoso.flash-target").text().trim();

          if (!actText) {
            return { url, statutesInsights: "No valid insights available" };
          }

          // Create AI model prompt
          const prompt = `Analyze the provided statute extract: ${actText} in relation to the user's query: "${userQuery[1]}". Explain the statute's relevance, its connection to the query, and state the key legal insights and relationship with the query. Return the result in JSON format: {"insights": "...", "statuteRelation": "..."}`;

          // Fetch AI model response
          const modelResponse = await insightModel.generateContent(prompt);
          const rawText = modelResponse?.response.text();
          return {
            url,
            rawText
          };
        } catch (error) {
          console.error(`Error scraping ${url}:`, error.message);
          return { url, statutesInsights: { insights: "Error fetching content", statuteRelation: "N/A" } };
        }
      })
    );

    return results;
  } catch (error) {
    console.error("Unexpected error while scraping acts:", error.message);
    return [{ statutesInsights: { insights: "Unexpected error occurred", statuteRelation: "N/A" } }];
  }
};

const analyzeLegalQueryWithCoT = async (statutesInsightsArray) => {
  const insightsOutput = statutesInsightsArray
  .map(
    (statute, index) => `
    **Statute ${index + 1}:**
    - URL: ${statute.url}
    - Insights: ${statute.rawText.statutes?.insights || "No insights available"}
    - Relation: ${statute.rawText.statutes?.statuteRelation || "No relation available"}`
  )
  .join("\n\n");

  const systemPrompt = `You are LegalPredictAI, a specialized legal analysis system that combines deep Chain-of-Thought reasoning with structured reporting. Your analysis should: 1. Follow a clear progression of logical reasoning steps. 2. Explain the significance of each finding to the overall legal question. 3. Connect legal principles to case-specific details in a way that reveals deeper insights. 4. Balance authoritative legal precision with accessibility for legal professionals. 5. Acknowledge uncertainties and alternative interpretations with intellectual honesty. Your responses should feel like receiving advice from a senior attorney who thoroughly examines every facet of an issue before presenting their structured conclusions.`;
  const userPrompt = `You are a highly specialized Legal Research AI focused on providing a **clear and structured legal prediction** based on case law, statutes, and relevant precedents. Given the user’s query, perform a step-by-step Chain-of-Thought legal analysis using the following structured format.

## **Legal Prediction Analysis**  

#### Your request: ${userQuery[1]}

### ** Defining the Legal Issues & Relevant Statutes**
#### **Primary Legal Issue**  
${
  Array.isArray(primaryIssues)
    ? primaryIssues.map((issue) => `- ${issue}`).join("\n")
    : "No primary issues found."
}  

#### **Key Statutory Basis**  
**Most relevant statute excerpt:**  
${
  aggregatedStatutes?.length
    ? `- ${aggregatedStatutes[0]}`
    : "No applicable statute found."
}  

**How it applies:**  
${insightsOutput}
---

### **Applying Precedents & Legal Reasoning**
#### **Top Precedents Related to the Query**
${
  enhancedAnalysis?.precedentAnalysis?.keyPrecedents?.length
    ? enhancedAnalysis.precedentAnalysis.keyPrecedents
        .slice(0, 4)
        .map(
          (precedent, i) => `**Case ${i + 1}: ${precedent.name}**  
  - **Summary:** ${precedent.citations?.[0]?.summary || "N/A"}  
  - **Key Legal Reasoning:** ${precedent.citations?.[0]?.relatedReasoning || "N/A"}  
  - **Relevance Weight:** ${precedent.totalWeight || "N/A"}`,
        )
        .join("\n\n")
    : "No key precedents available."
}  

---

### **Argument Breakdown: Strongest Positions**
#### **Plaintiff's Argument (Claimant)**
${
  aggregatedPlaintiffs?.length
    ? `- ${aggregatedPlaintiffs[0]}`
    : "No plaintiff argument found."
}  

#### **Defendant's Argument (Respondent)**
${
  aggregatedDefendants?.length
    ? `- ${aggregatedDefendants[0]}`
    : "No defendant argument found."
}  

#### **Counterpoint Analysis (If Applicable)**
${
  Array.isArray(counterArguments) && counterArguments.length
    ? counterArguments.map((arg) => `- ${arg}`).join("\n")
    : "No counter-arguments identified."
}  


### **Ruling Prediction & Confidence Score**
#### **Most Likely Disposition**
**${mostLikelyDisposition || "Unknown"}**  

#### **Confidence Score**
Do not recalculate the confidence score, simply use the provided one. This is an overall score based on the aggregates and relevance of all the data to the users Query
${
  confidenceScores?.overall
    ? `- **Overall Confidence:** ${confidenceScores.overall}%`
    : "No confidence score calculated."
}  

#### **Rationale**
- **Key Reasoning:**  
${
  enhancedAnalysis?.precedentAnalysis?.keyPrecedents?.length
    ? enhancedAnalysis.precedentAnalysis.keyPrecedents
        .map(
          (precedent) =>
            `- ${precedent.name}: ${precedent.citations?.[0]?.relatedReasoning}`,
        )
        .join("\n")
    : "No direct precedent found."
}  

---

### **Key Takeaways & Practical Implications**
#### **Legal Implications**
${
  Array.isArray(legalImplications)
    ? legalImplications.map((imp) => `- ${imp}`).join("\n")
    : "No strong legal implications identified."
}  

#### **Practical Implications**
${
  Array.isArray(practicalImplications)
    ? practicalImplications.map((imp) => `- ${imp}`).join("\n")
    : "No major practical implications."
}  

---

### **Final Ruling Statement**
Provide a concise and **authoritative ruling statement that summarizes the most probable legal outcome, grounded in case law and statutory interpretation.


### **References & Authoritative Sources**
${
  aggregatedFinalCaseURLs?.length
    ? aggregatedFinalCaseURLs
        .map((url, i) => `- [Case Reference ${i + 1}](${url})`)
        .join("\n")
    : "No authoritative case references found."
}  

${
  aggregatedSourceFileURLs?.length
    ? aggregatedSourceFileURLs
        .filter((url) => url !== "NOT VISIBLE")
        .map((url, i) => `- [Source Document ${i + 1}](${url})`)
        .join("\n")
    : "No source documents available."
}  

`;
  const finalAnalysisModel = genAI.getGenerativeModel({
    model: "gemini-2.0-pro-exp-02-05",
    systemInstruction: systemPrompt,
  });
  const modelResponse = await finalAnalysisModel.generateContent(userPrompt);
  writeToFile(modelResponse?.response.text(), "finalAnalysis3.md");
  return modelResponse?.response.text() || "No AI-generated response available";
};

// Main execution function with error handling
const main = async () => {
  try {
    // Fetch URLs for the first four statutes
    const searchResults = await narrowedFetchResults(aggregatedStatutes);
    console.log("Search Results:", searchResults);

    // Extract all URLs from the results
    const caseUrls = searchResults.flatMap(result => result.caseurl);
    console.log("Case URLs:", caseUrls);

    if (!caseUrls.length) throw new Error("No case law found");

    // Scrape and analyze statute texts
    const statutesInsightsArray = await scrapeActBodyText(caseUrls);
    console.log("Statutes Insights:", statutesInsightsArray);

    // Pass the entire array of statute insights to the legal query analyzer
    const finalAnalysis = await analyzeLegalQueryWithCoT(statutesInsightsArray);

    return finalAnalysis;
  } catch (error) {
    console.error("Error in execution:", error.message);
    return { error: "Failed to process query", details: error.message };
  }
};


main();
