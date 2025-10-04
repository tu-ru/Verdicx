import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

const summary ="This document is a Kenyan High Court judgment in a criminal appeal, DWM v Republic. Here's a summary of the key points: Background: DWM was convicted of defilement (sexual intercourse with a minor) and sentenced to 30 years imprisonment. The victim, BA, was 10 years old at the time of the alleged offense.Appeal Grounds: DWM appealed the conviction and sentence, arguing that the prosecution failed to prove its case beyond a reasonable doubt. He claimed the trial magistrate erred in rejecting his defense, relying on contradictory and uncorroborated prosecution evidence, and failing to consider crucial witnesses and medical evidence. He also claimed the magistrate shifted the burden of proof to him. He further claimed that there was a grudge between the complainant's aunt and himself, and that she had influenced the complainant's testimony. He also argued that the sentence was harsh and excessive.Court's Analysis: The High Court, as the first appellate court, re-evaluated the evidence. The court found that the victim's age was proven by her birth certificate.Regarding penetration, the court addressed the appellant's arguments about the medical evidence, stating that medical evidence is not mandatory for proving defilement, and that oral evidence is sufficient. The court dismissed the appellant's claims about the P3 form and the timing of the alleged offense, finding that the discrepancies were minor and explained by other evidence. The court found that the complainant's testimony, along with the medical evidence, established that defilement had occurred.Regarding the identity of the perpetrator, the court found that the complainant had identified the appellant by the name J, and that this identification was reliable because it was based on recognition. The court addressed the inconsistencies in witness testimony, determining that they were minor and did not affect the substance of the prosecution's case. The court addressed the lack of certain witnesses, stating the prosecution is not required to call every possible witness. The court found that the trial court had considered the appellant's defense and that the issue of a grudge was raised too late. Regarding the sentence, the court found no reason to interfere with the trial court's discretion. Decision: The High Court dismissed the appeal, upholding the conviction and sentence."

const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

const { GEMINI_API_KEY } = process.env;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in your .env file");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});
async function calcRelScore(data, userQuery) {
    try {
     
      // Generate embeddings
      const [data, userQuery] = await Promise.all([
        embeddingModel.embedContent(data),
        embeddingModel.embedContent(userQuery),
      ]);
  
      const dataEmbedding = data.embedding.values;
      const queryEmbedding = userQuery.embedding.values;
  
      console.log("Data: ",dataEmbedding, "Query: ", queryEmbedding )
    } catch (error) {
      console.error("Error calculating relevance score:", error);
      return 0; // Return 0 in case of error
    }
  }

  calcRelScore(summary, "sexual assault case no evidence")