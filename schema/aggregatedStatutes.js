import { SchemaType } from "@google/generative-ai";

export const statutesSchema = {
  type: SchemaType.OBJECT,
  properties: {
    statutes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          statuteRelation: { type: SchemaType.STRING }, // How it's relevant
          insights: { type: SchemaType.STRING }, // Key insights from the case
        },
        required: ["statuteRelation", "insights"],
      },
    },
  },
  required: ["statutes"],
  description:
    "Detailed insights on how statutes relate to the user's legal query.",
};
