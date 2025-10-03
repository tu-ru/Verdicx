import { keywordSamples, keywordSample2 } from "./dataAndResults/extracted-keywords.js";
import { enhancedAggregateKeywords } from "./helpers.js";

const userQuery = [
  "Given evidence of fraudulent transfer of title deeds and unauthorized encroachment on a land parcel, what ruling should the court be expected to deliver?",
  "I was sexually assulted, but i have no evidence, how will the judge handle this case?",
  "How did courts handle workplace discrimination cases in 2022?",
];
async function runAggregationForKeywords() {
  try {
    const aggregatedData = await enhancedAggregateKeywords(
      keywordSamples,
      userQuery[1],
      false,
      {
        keywordFrequencyThreshold: 0.74,
      },
    );
    console.log("Aggregated Data:\n", JSON.stringify(aggregatedData, null, 2));
  } catch (error) {
    console.error("Error in aggregation:", error);
  }
}

runAggregationForKeywords();
