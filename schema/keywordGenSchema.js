import { SchemaType } from "@google/generative-ai";
export const keyWordSchema = {
  type: SchemaType.OBJECT,
  properties: {
    possibleKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    yearAfter: { type: SchemaType.NUMBER },
    yearBefore: { type: SchemaType.NUMBER },
    specifiedYear: { type: SchemaType.NUMBER },
  },
  required: ["possibleKeywords", "yearAfter", "yearBefore", "specifiedYear"],
  propertyOrdering: [
    "possibleKeywords",
    "yearAfter",
    "yearBefore",
    "specifiedYear",
  ],
};