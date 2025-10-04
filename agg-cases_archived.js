import { parsedCases } from "./dataAndResults/parsed-cases.js";
import { calculateRelevanceScore, enhancedAggregateCases, writeToFile } from "./helpers.js";

// Example queries
const userQuery = [
  "Given evidence of fraudulent transfer of title deeds and unauthorized encroachment on a land parcel, what ruling should the court be expected to deliver?",
  "I was sexually assulted, but i have no evidence, how will the judge handle this case?",
  "How did courts handle workplace discrimination cases in 2022?",
];

// Compute key statistics from relevance scores
async function computeRelevanceStats(caseArray, query) {
  const relevanceScores = await Promise.all(
    caseArray.map(async (caseJson) => await calculateRelevanceScore(caseJson, query, true))
  );
  const mean = relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length;
  const sortedScores = [...relevanceScores].sort((a, b) => a - b);
  const median = sortedScores[Math.floor(sortedScores.length / 2)];
  const stdDev = Math.sqrt(
    relevanceScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / relevanceScores.length
  );

  return { mean, median, stdDev, relevanceScores };
}

// Adjust thresholds dynamically based on relevance score distribution
function scaleThreshold(base, min, max, relevanceStats) {
  const { mean, stdDev } = relevanceStats;

  // Adjust scaling based on how spread out the scores are
  const spreadFactor = Math.min(stdDev * 2, 0.2); // Max limit to avoid extreme jumps

  // Dynamic scaling factor using both mean & deviation
  const sensitivityFactor = Math.max(0.5, Math.min(1.2, (mean + spreadFactor) / 0.7));

  return Math.max(min, Math.min(max, base * sensitivityFactor));
}


// Run the aggregation process
async function runAggregationForCases() {
  try {
    console.log("Processing", parsedCases.length, "cases...");

    // Compute relevance score statistics
    const relevanceStats = await computeRelevanceStats(parsedCases, userQuery[1]);
    console.log("Relevance Score Stats:", relevanceStats);

    // Define dynamic thresholds with improved scaling
    const dynamicThresholds = {
      issueFrequencyThreshold: scaleThreshold(0.64, 0.56, 0.74, relevanceStats),
      statuteFrequencyThreshold: scaleThreshold(0.8, 0.7, 1.2, relevanceStats),
      evidenceFrequencyThreshold: scaleThreshold(0.57, 0.55, 0.73, relevanceStats),
      argumentsFrequencyThreshold: scaleThreshold(0.59, 0.53, 0.71, relevanceStats),
      plaintiffsFrequencyThreshold: scaleThreshold(0.57, 0.55, 0.73, relevanceStats),
      defendentsFrequencyThreshold: scaleThreshold(0.58, 0.55, 0.74, relevanceStats),
      courtReasoningFrequencyThreshold: scaleThreshold(0.62, 0.57, 0.79, relevanceStats),
      finalOrderFrequencyThreshold: scaleThreshold(0.63, 0.58, 0.77, relevanceStats),
      caseUrlFrequencyThreshold: scaleThreshold(0.57, 0.56, 0.76, relevanceStats),
      sourceFileFrequencyThreshold: scaleThreshold(0.57, 0.56, 0.77, relevanceStats),
    };

    console.log("Updated Dynamic Thresholds:", dynamicThresholds);

    // Run aggregation with new thresholds
    await enhancedAggregateCases(parsedCases, userQuery[1], true, dynamicThresholds, relevanceStats);

  } catch (error) {
    console.error("Error in aggregation:", error);
  }
}

runAggregationForCases();
