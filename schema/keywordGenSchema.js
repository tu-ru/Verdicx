import { SchemaType } from "@google/generative-ai";
/**
 * Schema definition for keyword generation using Google's Generative AI
 * Defines required fields and data types for keyword search parameters
 * Used to validate and structure search criteria for legal document queries
 */
export const keyWordSchema = {
  type: SchemaType.OBJECT,
  properties: {
    possibleKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    yearAfter: {
      type: SchemaType.NUMBER,
      description: "Number with no floats or decimal points",
    },
    yearBefore: {
      type: SchemaType.NUMBER,
      description: "Number with no floats or decimal points",
    },
    specifiedYear: {
      type: SchemaType.NUMBER,
      description: "Number with no floats or decimal points",
    },
  },
  required: ["possibleKeywords", "yearAfter", "yearBefore", "specifiedYear"],
  propertyOrdering: [
    "possibleKeywords",
    "yearAfter",
    "yearBefore",
    "specifiedYear",
  ],
};
/**
 * Function to generate search prompts based on user queries
 * Processes user input to extract relevant keywords and time ranges
 * Returns formatted prompt for AI processing with specified parameters
 */
export function keyWordPrompt(userQuery) {
  return `First, carefully read and understand the user query to identify its core themes, intent, and specific focus areas. Avoid generic terms like 'court,' 'legal,' or 'precedents,' and do not include standalone years in the keywords. Extract meaningful, compound-noun keywords that are specific, relevant, and commonly used in search queries. Ensure the keywords closely align with the provided query to minimize irrelevant search results. Select keywords that users would realistically type into a search engine (Googling) when researching the given topic. Determine the applicable timeframe based on contextual clues in the query: If the query mentions 'recent' or 'current' events, set yearAfter = 2021 and yearBefore = 2025. If the query refers to the 'past,' set yearAfter = 2019 and yearBefore = 2023. If a specific year is mentioned, only set specifiedYear to that year, and set both yearAfter and yearBefore to 0. If no timeframe is mentioned, default to yearAfter = 2019 and yearBefore = 2025. Finally, output exactly thirty optimized, highly targeted keywords that effectively summarize the text while ensuring maximum search accuracy and relevance. Here is the users question ${userQuery[1]}`;
}
