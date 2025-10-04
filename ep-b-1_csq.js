/**
 * @fileoverview Case Search Query Aggregation Module.
 * This module handles the aggregation and processing of legal keywords using enhanced
 * aggregation algorithms. It works with JSON-sourced keywords and applies relevance
 * scoring and frequency thresholds to optimize search terms.
 *
 * @module case-search-query-keyword-aggregator
 * @requires ./helpers
 * @requires ./extras/kwd_parse
 *
 * @example
 * // Basic usage
 * runAggregationForKeywords().then(aggregatedData => {
 *   console.log(aggregatedData);
 * });
 *
 * @author [samm]
 * @version 1.0.0
 * @license [License MIT]
 */

import { enhancedAggregateKeywords, writeToFile } from "./helpers.js";
import { getKeywords } from "./json_outputs/json_parser.js";
import { userQueries } from "./extras/user_queries.js";

async function runAggregationForKeywords() {
    try {
        // Get keywords from JSON file
        const keywordsData = await getKeywords();
        if (!keywordsData) {
            throw new Error("Failed to load keywords data");
        }

        // Process keywords through enhanced aggregation
        const aggregatedData = await enhancedAggregateKeywords(
            keywordsData,
            userQueries[1],
            false,
            {
                keywordFrequencyThreshold: 0.799,
            }
        );

        // 1 is the max threshold, for more deterministic results push the threshold to 1, for less strict results lower down the threshold.

        console.log("Aggregated Data:\n", JSON.stringify(aggregatedData, null, 2));
        return aggregatedData;
    } catch (error) {
        console.error("Error in aggregation:", error);
        throw error;
    }
}
runAggregationForKeywords().then((aggregatedData) => {
    writeToFile(aggregatedData, "/json_outputs/csq_kwg_output.json")
}).catch(e => console.log(e))
