import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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

/**
 * Calculates cosine similarity between two vectors.
 *
 * @param {number[]} vecA - The first vector.
 * @param {number[]} vecB - The second vector.
 * @returns {number} - Cosine similarity score.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0; // Handle empty or null vectors
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0; // Handle zero vectors
  }

  return dotProduct / (normA * normB);
}

/**
 * Weighted frequency map that counts occurrences with an applied weight.
 *
 * @param {array} items - Array of items to count.
 * @param {function} weightFunction - Function to compute weight given an item and its case context.
 * @returns {object} - Object where keys are item values and values are cumulative weighted counts.
 */
function weightedFrequencyMap(items, weightFunction = (item) => 1) {
  const frequency = {};
  items.forEach((item) => {
    let value;
    if (typeof item === "object" && item !== null && "value" in item) {
      value = item.value;
    } else {
      value = item;
    }
    // Ensure weight is a valid number
    const weight =
      typeof weightFunction(item) === "number" ? weightFunction(item) : 1;

    frequency[value] = (frequency[value] || 0) + weight;
  });
  return frequency;
}

/**
 * Calculates the relevance score between a case JSON and a user query using Google's text embedding model.
 *
 * @param {object} dataJson - The JSON object representing a case.
 * @param {string} userQuery - The user's query string.
 * @param {object} data - Data to vectorize against when calculating cosine
 * @returns {Promise<number>} - A Promise that resolves to the cosine similarity relevance score.
 */
export async function calculateRelevanceScore(data, userQuery, isCase) {
  try {
    let value;

    if (isCase) {
      // Ensure parsedOutput is an object
      const parsedOutput =
        typeof data.parsedOutput === "string"
          ? JSON.parse(data.parsedOutput)
          : data.parsedOutput;

      value = [
        parsedOutput.caseInformation?.caseTitle,
        parsedOutput.tags?.join(". "),
        parsedOutput.factualBackground
          ?.map((item) => item?.fact)
          .filter(Boolean)
          .join(". "),
        parsedOutput.factualBackground
          ?.map((item) => item?.description)
          .filter(Boolean)
          .join(". "),
        parsedOutput.legalIssues
          ?.map((item) => item?.issue)
          .filter(Boolean)
          .join(". "),
        parsedOutput.legalIssues
          ?.map((item) => item?.description)
          .filter(Boolean)
          .join(". "),
        parsedOutput.courtAnalysis?.courtReasoning,
        parsedOutput.analysisAndImplications?.legalImplications,
        parsedOutput.analysisAndImplications?.practicalImplications,
        parsedOutput.arguments?.plaintiffArguments,
        parsedOutput.arguments?.defendantArguments,
        parsedOutput.evidence?.keyEvidencePresented,
        parsedOutput.propertyDetails
          ?.map((item) => item?.propertyDescription)
          .filter(Boolean)
          .join(". "),
      ]
        .filter(Boolean)
        .join("\n\n");
    } else {
      // If it's not a case, assume `data` is a keyword (text)
      value = typeof data === "string" ? data : JSON.stringify(data);
    }

    // Generate embeddings
    const [queryEmbeddingResponse, caseEmbeddingResponse] = await Promise.all([
      embeddingModel.embedContent(userQuery),
      embeddingModel.embedContent(value),
    ]);

    const queryEmbedding = queryEmbeddingResponse.embedding.values;
    const caseEmbedding = caseEmbeddingResponse.embedding.values;

    // Calculate Cosine Similarity
    const similarityScore = cosineSimilarity(queryEmbedding, caseEmbedding);
    return similarityScore;
  } catch (error) {
    console.error("Error calculating relevance score:", error);
    return 0; // Return 0 in case of error
  }
}


/**
 * Calculate a confidence score based on consensus among cases
 * @param {number} aggregatedCount - Number of items that passed the threshold
 * @param {number} totalCount - Total number of unique items
 * @returns {number} - Confidence score between 0 and 1
 */
function calculateConfidenceScore(aggregatedCount, totalCount) {
  if (totalCount <= 1) return 1;
  return (totalCount - aggregatedCount) / (totalCount - 1);
}

/**
 * Aggregates an array of case JSON objects into a single summarized result with enhanced analysis.
 *
 * @param {array} caseArray - Array of JSON case objects.
 * @param {string} userQuery - The user's query string.
 * @param {boolean} isCase - Whether the data is a case object.
 * @param {object} options - Optional configuration.
 * @returns {Promise<object>} - Promise resolving to aggregated result.
 */
export async function enhancedAggregateCases(
  caseArray,
  userQuery,
  isCase,
  options = {},
  relevanceStats
) {
  // Define thresholds for all fields with defaults
  const issueFrequencyThreshold = options.issueFrequencyThreshold || 1;
  const statuteFrequencyThreshold = options.statuteFrequencyThreshold || 1;
  const argumentsFrequencyThreshold = options.argumentsFrequencyThreshold || 1;
  const evidenceFrequencyThreshold = options.evidenceFrequencyThreshold || 1;
  const plaintiffsFrequencyThreshold =
    options.plaintiffsFrequencyThreshold || 1;
  const defendentsFrequencyThreshold =
    options.defendentsFrequencyThreshold || 1;
  const courtReasoningFrequencyThreshold =
    options.courtReasoningFrequencyThreshold || 1;
  const finalOrderFrequencyThreshold =
    options.finalOrderFrequencyThreshold || 1;
  const caseUrlFrequencyThreshold = options.caseUrlFrequencyThreshold || 1;
  const sourceFileFrequencyThreshold =
    options.sourceFileFrequencyThreshold || 1;

  // Arrays to collect data with associated context
  const legalIssuesData = [];
  const statutesData = [];
  const argumentsData = [];
  const evidenceData = [];
  const plaintiffsData = [];
  const defendantsData = [];
  const courtReasonings = [];
  const finalOrdersData = [];
  const dispositionData = [];
  const implicationsData = []; // For legal and practical implications
  const precedentsData = []; // For tracking precedents with context
  const jurisdictionData = []; // For tracking jurisdiction data
  const timelineData = []; // For tracking temporal trends
  const caseURLs = []; //for traking relevant case URLs
  const sourceURLs = []; //for tracking source URLs

  // Loop through each case with its relevance score
  caseArray.forEach((caseJson, index) => {
    const relevanceScore = relevanceStats?.relevanceScores[index];
    console.log("Each Relevance - Scores: ", relevanceScore)

    // Ensure parsedOutput is an object if it's a string
    const parsedCase =
      typeof caseJson.parsedOutput === "string"
        ? JSON.parse(caseJson.parsedOutput)
        : caseJson.parsedOutput || caseJson;

    // Track jurisdiction data
    if (parsedCase.caseInformation?.court) {
      jurisdictionData.push({
        value: parsedCase.caseInformation.court,
        weight: relevanceScore,
      });
    }
    if (parsedCase.arguments?.plaintiffArguments) {
      argumentsData.push({
        value: parsedCase.arguments.plaintiffArguments,
        weight: relevanceScore,
        party: "plaintiff",
      });
    }
    if (parsedCase.arguments?.defendantArguments) {
      argumentsData.push({
        value: parsedCase.arguments.defendantArguments,
        weight: relevanceScore,
        party: "defendant",
      });
    }
    // Track timeline data with pre-parsed dates
    if (parsedCase.caseInformation?.dateOfJudgment) {
      timelineData.push({
        date: new Date(parsedCase.caseInformation.dateOfJudgment),
        caseTitle: parsedCase.caseInformation?.caseTitle || "Unknown case",
        relevanceScore: relevanceScore,
      });
    }
    // Extract legal issues
    if (Array.isArray(parsedCase.legalIssues)) {
      parsedCase.legalIssues.forEach((issue) => {
        if (issue && issue.issue) {
          legalIssuesData.push({
            value: issue.issue,
            weight: relevanceScore,
            caseContext: caseJson,
            isPrimary: issue.type === "primary",
            statutes: issue.relevantStatutes || [],
            description: issue.description || null,
          });

          // Add statutes separately
          if (Array.isArray(issue.relevantStatutes)) {
            issue.relevantStatutes.forEach((statute) => {
              if (statute) {
                statutesData.push({
                  value: statute,
                  weight: relevanceScore,
                  relatedIssue: issue.issue,
                });
              }
            });
          }
        }
      });
    }
    // Arguments
    if (parsedCase.arguments?.plaintiffArguments) {
      plaintiffsData.push({
        value: parsedCase.arguments.plaintiffArguments,
        weight: relevanceScore,
        party: "plaintiff",
      });
    }
    // plaintiffs
    if (parsedCase.arguments?.defendantArguments) {
      defendantsData.push({
        value: parsedCase.arguments.defendantArguments,
        weight: relevanceScore,
        party: "defendant",
      });
    }
    // Evidence
    if (parsedCase.evidence?.keyEvidencePresented) {
      const keyEvidence = parsedCase.evidence.keyEvidencePresented;
      if (Array.isArray(keyEvidence)) {
        keyEvidence.forEach((evidence) => {
          if (evidence) {
            evidenceData.push({
              value: evidence,
              weight: relevanceScore,
            });
          }
        });
      } else if (typeof keyEvidence === "string") {
        evidenceData.push({
          value: keyEvidence,
          weight: relevanceScore,
        });
      }
    }
    // Court reasoning
    if (parsedCase.courtAnalysis?.courtReasoning) {
      const reasoning = parsedCase.courtAnalysis.courtReasoning;
      if (Array.isArray(reasoning)) {
        reasoning.forEach((item) => {
          if (item) {
            courtReasonings.push({
              value: item,
              weight: relevanceScore,
            });
          }
        });
      } else if (typeof reasoning === "string") {
        courtReasonings.push({
          value: reasoning,
          weight: relevanceScore,
        });
      }
    }
    // Track precedents with context
    if (parsedCase.courtAnalysis?.keyPrecedentsCited) {
      const precedents = parsedCase.courtAnalysis.keyPrecedentsCited;
      if (Array.isArray(precedents)) {
        precedents.forEach((precedent) => {
          if (precedent && precedent.precedentName) {
            precedentsData.push({
              value: precedent.precedentName, // Use precedentName as the key for frequency
              weight: relevanceScore,
              caseContext: caseJson,
              relatedReasoning: parsedCase.courtAnalysis.courtReasoning,
              summary: precedent.precedentSummary, // Include summary for detailed output
            });
          }
        });
      }
    }
    // Final orders
    if (parsedCase.finalRulingAndOrders?.specificOrders) {
      const orders = parsedCase.finalRulingAndOrders.specificOrders;
      if (Array.isArray(orders)) {
        orders.forEach((order) => {
          if (order) {
            finalOrdersData.push({
              value: order,
              weight: relevanceScore,
            });
          }
        });
      }
    }
    // Disposition
    if (parsedCase.finalRulingAndOrders?.disposition) {
      dispositionData.push({
        value: parsedCase.finalRulingAndOrders.disposition,
        weight: relevanceScore,
      });
    }
    // Implications data
    if (parsedCase.analysisAndImplications) {
      if (parsedCase.analysisAndImplications.legalImplications) {
        implicationsData.push({
          type: "legal",
          value: parsedCase.analysisAndImplications.legalImplications,
          weight: relevanceScore,
          caseTitle: parsedCase.caseInformation.caseTitle
        });
      }

      if (parsedCase.analysisAndImplications.practicalImplications) {
        implicationsData.push({
          type: "practical",
          value: parsedCase.analysisAndImplications.practicalImplications,
          weight: relevanceScore,
          casetitle: parsedCase.caseInformation.caseTitle
        });
      }

      if (parsedCase.analysisAndImplications.areasForFurtherInquiry) {
        implicationsData.push({
          type: "further_inquiry",
          value: parsedCase.analysisAndImplications.areasForFurtherInquiry,
          weight: relevanceScore,
        });
      }

      if (parsedCase.analysisAndImplications.dissentingOrConcurringOpinions) {
        implicationsData.push({
          type: "dissenting_opinions",
          value:
            parsedCase.analysisAndImplications.dissentingOrConcurringOpinions,
          weight: relevanceScore,
        });
      }

      if (parsedCase.caseInformation.caseURL) {
        caseURLs.push({
          value: parsedCase.caseInformation.caseURL,
          weight: relevanceScore,
        });
      }

      if (
        parsedCase.caseInformation.originalSourceFileURL !==
        "No available download link"
      ) {
        sourceURLs.push({
          value: parsedCase.caseInformation.originalSourceFileURL,
          weight: relevanceScore,
        });
      }
    }
  });

  // Build weighted frequency maps for key fields
  const issuesFrequency = weightedFrequencyMap(legalIssuesData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const statutesFrequency = weightedFrequencyMap(statutesData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const evidenceFrequency = weightedFrequencyMap(evidenceData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const argumentsFrequency = weightedFrequencyMap(argumentsData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const plaintiffsFrequency = weightedFrequencyMap(plaintiffsData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const defendantsFrequency = weightedFrequencyMap(defendantsData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const courtReasoningFrequency = weightedFrequencyMap(
    courtReasonings,
    (item) => (typeof item.weight === "number" ? item.weight : 1),
  );
  const finalOrdersFrequency = weightedFrequencyMap(finalOrdersData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const dispositionFrequency = weightedFrequencyMap(dispositionData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const jurisdictionFrequency = weightedFrequencyMap(
    jurisdictionData,
    (item) => (typeof item.weight === "number" ? item.weight : 1),
  );
  const precedentsFrequency = weightedFrequencyMap(precedentsData, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );
  const caseURLsFrequency = weightedFrequencyMap(caseURLs, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );

  const sourceURLsFrequency = weightedFrequencyMap(sourceURLs, (item) =>
    typeof item.weight === "number" ? item.weight : 1,
  );

  const aggregatedLegalIssues = Object.entries(issuesFrequency)
    .filter(([_, count]) => count >= issueFrequencyThreshold)
    .map(([issue]) => issue);

  const aggregatedArguments = Object.entries(argumentsFrequency)
    .filter(([_, count]) => count >= argumentsFrequencyThreshold)
    .map(([argument]) => argument);

  const aggregatedStatutes = Object.entries(statutesFrequency)
    .filter(([_, count]) => count >= statuteFrequencyThreshold)
    .map(([statute]) => statute);

  const aggregatedEvidence = Object.entries(evidenceFrequency)
    .filter(([_, count]) => count >= evidenceFrequencyThreshold)
    .map(([evidence]) => evidence);

  const aggregatedPlaintiffs = Object.entries(plaintiffsFrequency)
    .filter(([_, count]) => count >= plaintiffsFrequencyThreshold)
    .map(([plaintiff]) => plaintiff);

  const aggregatedDefendants = Object.entries(defendantsFrequency)
    .filter(([_, count]) => count >= defendentsFrequencyThreshold)
    .map(([defendant]) => defendant);

  const aggregatedCourtReasonings = Object.entries(courtReasoningFrequency)
    .filter(([_, count]) => count >= courtReasoningFrequencyThreshold)
    .map(([reasoning]) => reasoning);

  const aggregatedFinalOrders = Object.entries(finalOrdersFrequency)
    .filter(([_, count]) => count >= finalOrderFrequencyThreshold)
    .map(([order]) => order);

  const aggregatedFinalCaseURLs = Object.entries(caseURLsFrequency)
    .filter(([_, count]) => count >= caseUrlFrequencyThreshold)
    .map(([url]) => url);

  const aggregatedSourceFileURLs = Object.entries(sourceURLsFrequency)
    .filter(([_, count]) => count >= sourceFileFrequencyThreshold)
    .map(([url]) => url);

  // Aggregated jurisdiction data
  const jurisdictionDistribution = Object.entries(jurisdictionFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([jurisdiction, count]) => ({ jurisdiction, count }));

  // Aggregated precedents with detailed citations
  const keyPrecedents = Object.entries(precedentsFrequency)
    .sort((a, b) => b[1] - a[1]) // Sort by total weight descending
    .slice(0, 10) // Top 10 precedents
    .map(([precedentName, totalWeight]) => {
      const citations = precedentsData
        .filter((item) => item.value === precedentName)
        .map((item) => ({
          summary: item.summary,
          relatedReasoning: item.relatedReasoning,
          weight: item.weight,
        }));
      return {
        name: precedentName,
        totalWeight,
        citations, // Detailed list of cases citing this precedent
      };
    });

  // Find the most likely disposition based on weighted frequency
  let mostLikelyDisposition = null;
  let highestWeight = 0;

  Object.entries(dispositionFrequency).forEach(([disposition, weight]) => {
    if (weight > highestWeight) {
      highestWeight = weight;
      mostLikelyDisposition = disposition;
    }
  });

   // Timeline analysis
  timelineData.sort((a, b) => a.date - b.date);

  // Group cases by year for trend analysis
  const casesByYear = {};
  timelineData.forEach((item) => {
    const year = item.date.getFullYear();
    if (!casesByYear[year]) casesByYear[year] = [];
    casesByYear[year].push(item);
  });

  // Calculate average relevance by year
  const yearlyTrends = Object.entries(casesByYear).map(([year, cases]) => {
    const avgRelevance =
      cases.reduce((sum, c) => sum + c.relevanceScore, 0) / cases.length;
    return {
      year: parseInt(year),
      caseCount: cases.length,
      averageRelevance: avgRelevance,
      cases: cases.map((c) => c.caseTitle),
    };
  });

  // Extract legal and practical implications
  const legalImplications = implicationsData
    .filter((item) => item.type === "legal")
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

  const practicalImplications = implicationsData
    .filter((item) => item.type === "practical")
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

  const areasForFurtherInquiry = implicationsData
    .filter((item) => item.type === "further_inquiry")
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

  const dissentingOpinions = implicationsData
    .filter((item) => item.type === "dissenting_opinions")
    .sort((a, b) => b.weight - a.weight)
    .map((item) => item.value);

    const primaryIssues = legalIssuesData
    .filter(item => item.isPrimary && item.weight >= issueFrequencyThreshold) // Apply threshold
    .sort((a, b) => b.weight - a.weight)
    .map(item => item.value);
  
  const secondaryIssues = legalIssuesData
    .filter(item => !item.isPrimary && item.weight >= issueFrequencyThreshold) // Apply threshold
    .sort((a, b) => b.weight - a.weight)
    .map(item => item.value);
  

  // Calculate confidence score based on the consensus among cases
  const totalCases = caseArray.length;
  const confidenceScores = {
    legalIssues: calculateConfidenceScore(
      aggregatedLegalIssues.length,
      Object.keys(issuesFrequency).length,
    ),
    statutes: calculateConfidenceScore(
      aggregatedStatutes.length,
      Object.keys(statutesFrequency).length,
    ),
    disposition: calculateConfidenceScore(
      1,
      Object.keys(dispositionFrequency).length,
    ),
    precedents: calculateConfidenceScore(
      keyPrecedents.length,
      Object.keys(precedentsFrequency).length,
    ),
    overall: calculateConfidenceScore(
      aggregatedLegalIssues.length + aggregatedStatutes.length + 1,
      Object.keys(issuesFrequency).length +
        Object.keys(statutesFrequency).length +
        Object.keys(dispositionFrequency).length,
    ),
  };

  // Analyze counter-arguments
  const counterArgumentAnalysis = analyzeCounterArguments(
    argumentsData,
    dispositionData,
  );

  const aggData = {
    aggregatedLegalIssues,
    aggregatedStatutes,
    aggregatedArguments,
    aggregatedPlaintiffs,
    aggregatedDefendants,
    aggregatedEvidence,
    aggregatedCourtReasonings,
    aggregatedFinalOrders,
    aggregatedFinalCaseURLs,
    aggregatedSourceFileURLs,
    mostLikelyDisposition,
    confidenceScores,
    // Enhanced analysis fields
    enhancedAnalysis: {
      // Issue classification
      issueClassification: {
        primaryIssues,
        secondaryIssues
      },
      jurisdictionDistribution,
      // Timeline analysis
      timelineAnalysis: {
        earliestCase: timelineData.length > 0 ? timelineData[0] : null,
        latestCase:
          timelineData.length > 0
            ? timelineData[timelineData.length - 1]
            : null,
        yearlyTrends,
      },  
     
      // Precedent analysis

      precedentAnalysis: {
        keyPrecedents, // Updated to detailed structure
      },
      // Implications analysis
      implicationsAnalysis: {
        legalImplications: legalImplications.slice(0, 5), // Top 5 legal implications
        practicalImplications: practicalImplications.slice(0, 5), // Top 5 practical implications
        areasForFurtherInquiry: areasForFurtherInquiry.slice(0, 3), // Top 3 areas for inquiry
        dissentingOpinions: dissentingOpinions.slice(0, 3), // Top 3 dissenting opinions
      },
      // Counter-argument analysis
      counterArguments: counterArgumentAnalysis,
    },
    // Confidence scores (repeated for clarity in output)
    confidenceScores,
    // Original counts
    counts: {
      legalIssues: Object.keys(issuesFrequency).length,
      statutes: Object.keys(statutesFrequency).length,
      arguments: Object.keys(argumentsFrequency).length,
      evidence: Object.keys(evidenceFrequency).length,
      courtReasonings: Object.keys(courtReasoningFrequency).length,
      finalOrders: Object.keys(finalOrdersFrequency).length,
      dispositions: Object.keys(dispositionFrequency).length,
      totalCases,
      jurisdictions: Object.keys(jurisdictionFrequency).length,
      precedents: Object.keys(precedentsFrequency).length,
    },
  };

  writeToFile(aggData, "aggdata.json");

  // Return the final aggregated result with enhanced analysis
  return {
    aggData,
  };
}

/**## Documentation for `enhancedAggregateCases` Return Fields

The `enhancedAggregateCases` function returns an object containing aggregated data and enhanced analysis derived from a set of legal cases. This documentation describes each field in the returned object, explaining their purpose and how they can be utilized for **case analysis**, **legal building**, and **case prediction**.

---

### 1. Original Fields

These fields provide aggregated data on key legal elements across the cases, filtered by frequency thresholds.

- **`aggregatedLegalIssues`**  
  - **Description**: A list of legal issues that appear frequently across the cases.  
  - **Purpose**: Identifies the most common legal questions or disputes in the dataset.  
  - **Utilization**:  
    - **Case Analysis**: Highlights recurring legal issues to understand the core disputes in similar cases.  
    - **Legal Building**: Guides focus on addressing these prevalent issues in arguments or pleadings.  
    - **Case Prediction**: Suggests which legal issues are likely to arise in future similar cases.

- **`aggregatedStatutes`**  
  - **Description**: A list of statutes frequently cited or relevant in the cases.  
  - **Purpose**: Indicates which laws are most applicable or contested.  
  - **Utilization**:  
    - **Case Analysis**: Reveals the statutory framework governing the cases.  
    - **Legal Building**: Informs the selection of statutes to cite or challenge in a case.  
    - **Case Prediction**: Highlights statutes likely to influence future rulings.

- **`aggregatedArguments`**  
  - **Description**: Common arguments made by parties across the cases.  
  - **Purpose**: Shows typical arguments presented in similar legal disputes.  
  - **Utilization**:  
    - **Case Analysis**: Provides insight into recurring argumentative strategies.  
    - **Legal Building**: Helps craft arguments by drawing on frequently used approaches.  
    - **Case Prediction**: Indicates arguments likely to be raised in future cases.

- **`aggregatedEvidence`**  
  - **Description**: Types of evidence frequently presented in the cases.  
  - **Purpose**: Identifies critical evidence commonly relied upon.  
  - **Utilization**:  
    - **Case Analysis**: Shows what evidence drives decisions in these cases.  
    - **Legal Building**: Guides the collection and presentation of impactful evidence.  
    - **Case Prediction**: Suggests which evidence might sway future outcomes.

- **`aggregatedCourtReasonings`**  
  - **Description**: Common reasoning or logic used by courts in their decisions.  
  - **Purpose**: Captures judicial thought processes in similar cases.  
  - **Utilization**:  
    - **Case Analysis**: Offers insight into how courts interpret and decide cases.  
    - **Legal Building**: Aligns arguments with reasoning patterns courts favor.  
    - **Case Prediction**: Helps forecast judicial reasoning in future cases.

- **`aggregatedFinalOrders`**  
  - **Description**: Frequently issued final decisions or orders.  
  - **Purpose**: Reflects typical case resolutions.  
  - **Utilization**:  
    - **Case Analysis**: Shows the range of outcomes in similar cases.  
    - **Legal Building**: Sets expectations for potential rulings.  
    - **Case Prediction**: Indicates likely final orders based on historical data.

- **`mostLikelyDisposition`**  
  - **Description**: The most common case disposition (e.g., "affirmed," "reversed") based on weighted frequency.  
  - **Purpose**: Predicts the predominant outcome based on past cases.  
  - **Utilization**:  
    - **Case Analysis**: Identifies the prevailing resolution trend.  
    - **Legal Building**: Helps set realistic outcome expectations.  
    - **Case Prediction**: Offers a direct prediction of the likely disposition.

- **`extractedPrecedents`**  
  - **Description**: Key precedents frequently cited in the cases.  
  - **Purpose**: Highlights influential case law shaping legal outcomes.  
  - **Utilization**:  
    - **Case Analysis**: Reveals foundational cases affecting the dataset.  
    - **Legal Building**: Provides authoritative precedents to strengthen arguments.  
    - **Case Prediction**: Suggests precedents likely to be cited in future rulings.

- **`confidenceScores`**  
  - **Description**: Scores indicating the consistency of findings for legal issues, statutes, disposition, precedents, and overall aggregation.  
  - **Purpose**: Measures the reliability of the aggregated data.  
  - **Utilization**:  
    - **Case Analysis**: Indicates how uniform the data is across cases.  
    - **Legal Building**: Guides reliance on certain elements based on their consistency.  
    - **Case Prediction**: Higher scores suggest more reliable outcome predictions.

---

### 2. Enhanced Analysis Fields

These fields offer deeper insights and classifications for nuanced analysis.

- **`issueClassification`**  
  - **Description**: Categorizes legal issues into primary and secondary types.  
    - `primaryIssues`: Main points of contention.  
    - `secondaryIssues`: Related but less central issues.  
  - **Purpose**: Prioritizes the most critical legal issues.  
  - **Utilization**:  
    - **Case Analysis**: Focuses attention on the primary disputes driving cases.  
    - **Legal Building**: Directs efforts toward addressing key issues effectively.  
    - **Case Prediction**: Highlights issues likely to determine future outcomes.

- **`jurisdictionDistribution`**  
  - **Description**: Distribution of cases across different jurisdictions.  
  - **Purpose**: Shows jurisdictional variations in case handling.  
  - **Utilization**:  
    - **Case Analysis**: Reveals if certain jurisdictions treat cases differently.  
    - **Legal Building**: Informs venue selection or jurisdictional strategies.  
    - **Case Prediction**: Suggests jurisdiction-specific outcome trends.

- **`timelineAnalysis`**  
  - **Description**: Details the temporal scope and trends of the cases.  
    - `earliestCase`: Oldest case in the dataset.  
    - `latestCase`: Most recent case.  
    - `yearlyTrends`: Case counts and relevance by year.  
  - **Purpose**: Tracks the evolution of the legal landscape over time.  
  - **Utilization**:  
    - **Case Analysis**: Provides historical context for case patterns.  
    - **Legal Building**: Offers temporal insights for framing arguments.  
    - **Case Prediction**: Identifies trends that may influence future rulings.

- **`precedentAnalysis`**  
  - **Description**: Lists top precedents and their citation frequency.  
  - **Purpose**: Identifies the most influential case law.  
  - **Utilization**:  
    - **Case Analysis**: Highlights precedents shaping legal interpretations.  
    - **Legal Building**: Guides the use of impactful precedents in arguments.  
    - **Case Prediction**: Suggests precedents likely to affect future decisions.

- **`implicationsAnalysis`**  
  - **Description**: Analyzes broader impacts and alternative perspectives.  
    - `legalImplications`: Wider legal effects of the cases.  
    - `practicalImplications`: Real-world consequences.  
    - `areasForFurtherInquiry`: Unresolved issues or questions.  
    - `dissentingOpinions`: Alternative judicial views.  
  - **Purpose**: Assesses the full scope of case outcomes.  
  - **Utilization**:  
    - **Case Analysis**: Provides a comprehensive view of case significance.  
    - **Legal Building**: Incorporates implications and dissenting views into strategy.  
    - **Case Prediction**: Anticipates future developments or challenges.

- **`counterArguments`**  
  - **Description**: Analysis of arguments opposing the majority view.  
  - **Purpose**: Identifies potential challenges to prevailing arguments.  
  - **Utilization**:  
    - **Case Analysis**: Exposes weaknesses in common positions.  
    - **Legal Building**: Prepares rebuttals for opposing counsel’s arguments.  
    - **Case Prediction**: Helps anticipate obstacles to predicted outcomes.

---

### 3. Counts

These fields quantify the diversity of elements in the dataset.

- **`counts`**  
  - **Description**: Numerical data on unique items, including legal issues, statutes, arguments, evidence types, court reasonings, final orders, dispositions, total cases, jurisdictions, and precedents.  
  - **Purpose**: Measures the variety and complexity of the dataset.  
  - **Utilization**:  
    - **Case Analysis**: Indicates the breadth of elements involved.  
    - **Legal Building**: Helps assess the scope of issues or arguments to address.  
    - **Case Prediction**: More unique elements may suggest less predictability; fewer suggest greater consistency.

---

### Utilization Summary

- **Case Analysis**:  
  The original fields (e.g., `aggregatedLegalIssues`, `aggregatedCourtReasonings`) provide a broad overview of common elements in similar cases, while enhanced fields (e.g., `issueClassification`, `timelineAnalysis`) offer deeper insights into priorities, trends, and impacts. Together, they enable a thorough understanding of case patterns and context.

- **Legal Building**:  
  Fields like `aggregatedArguments`, `extractedPrecedents`, and `precedentAnalysis` inform the construction of robust legal strategies by highlighting successful approaches and authoritative case law. `counterArguments` and `implicationsAnalysis` strengthen preparation by addressing opposing views and broader consequences.

- **Case Prediction**:  
  `mostLikelyDisposition` and `confidenceScores` provide direct outcome predictions and their reliability, while `timelineAnalysis` and `jurisdictionDistribution` refine forecasts by revealing trends and jurisdictional influences. `issueClassification` ensures focus on decisive factors.

---

This documentation outlines the fields returned by `enhancedAggregateCases`, their purposes, and their practical applications, equipping legal professionals with a powerful tool for analysis, strategy development, and outcome prediction. */

/**
 * Helper function to analyze counter-arguments by comparing
 * arguments from winning and losing parties
 *
 * @param {Array} argumentsData - Collection of arguments with context
 * @param {Array} dispositionData - Collection of case dispositions
 * @return {Object} Analysis of successful counter-arguments
 */
function analyzeCounterArguments(argumentsData, dispositionData) {
  // Create a map of case contexts to their dispositions
  const caseDispositions = {};
  dispositionData.forEach((item) => {
    const caseId = item.caseContext?.id || JSON.stringify(item.caseContext);
    caseDispositions[caseId] = item.value.toLowerCase();
  });

  // Identify plaintiff and defendant arguments by case
  const caseArguments = {};
  argumentsData.forEach((item) => {
    const caseId = item.caseContext?.id || JSON.stringify(item.caseContext);
    if (!caseArguments[caseId]) {
      caseArguments[caseId] = { plaintiff: [], defendant: [] };
    }

    if (item.party === "plaintiff") {
      caseArguments[caseId].plaintiff.push(item.value);
    } else if (item.party === "defendant") {
      caseArguments[caseId].defendant.push(item.value);
    }
  });

  // Analyze successful arguments based on disposition
  const successfulPlaintiffArguments = [];
  const successfulDefendantArguments = [];

  Object.entries(caseArguments).forEach(([caseId, args]) => {
    const disposition = caseDispositions[caseId];
    if (!disposition) return; // Skip cases with no disposition

    // More accurate pattern matching for disposition
    const plaintiffWon = /plaintiff|granted|in favor of plaintiff/i.test(
      disposition,
    );
    const defendantWon = /defendant|dismissed|in favor of defendant/i.test(
      disposition,
    );

    if (plaintiffWon && args.plaintiff.length) {
      successfulPlaintiffArguments.push(...args.plaintiff);
    }

    if (defendantWon && args.defendant.length) {
      successfulDefendantArguments.push(...args.defendant);
    }
  });

  return {
    successfulPlaintiffArguments,
    successfulDefendantArguments,
    counts: {
      plaintiff: successfulPlaintiffArguments.length,
      defendant: successfulDefendantArguments.length,
    },
  };
}

export async function enhancedAggregateKeywords(
  keywordsArr,
  userQuery,
  isCase,
  options = {},
) {
  const keywordFrequencyThreshold = options.keywordFrequencyThreshold || 1;

  // Ensure keywordsArr is an array; if it's a single object, wrap it
  if (!Array.isArray(keywordsArr)) {
    keywordsArr = [keywordsArr]; // Convert single object into an array
  }

  // Extract all possible keywords from the objects
  let allKeywords = [];
  keywordsArr.forEach((keywordJson) => {
    if (keywordJson.possibleKeywords) {
      allKeywords = allKeywords.concat(keywordJson.possibleKeywords);
    }
  });

  // Extract the additional values
  const yearAfter = keywordsArr[0]?.yearAfter ?? 0;
  const yearBefore = keywordsArr[0]?.yearBefore ?? 0;
  const specifiedYear = keywordsArr[0]?.specifiedYear ?? 0;

  // Calculate relevance scores for each keyword individually
  const relevanceScores = await Promise.all(
    allKeywords.map((keyword) =>
      calculateRelevanceScore(keyword, userQuery, isCase),
    ),
  );

  console.log(relevanceScores)

  // Collect keywords with their relevance weights
  const keywordsData = allKeywords.map((keyword, index) => ({
    value: keyword,
    weight: relevanceScores[index],
  }));

  // Create a weighted frequency map for the keywords
  const keywordsFrequency = weightedFrequencyMap(
    keywordsData,
    (item) => item.weight || 1,
  );

  // Filter and aggregate keywords based on the frequency threshold
  const aggregatedKeywords = Object.entries(keywordsFrequency)
    .filter(([_, count]) => count >= keywordFrequencyThreshold)
    .map(([possibleKeyword]) => possibleKeyword)
    .slice(0, 3); // Limit to first two keywords

  return {
    aggregatedKeywords,
    yearAfter,
    yearBefore,
    specifiedYear,
  };
}

export const writeToFile = (data, dataPath) => {
  try {
    const rootDir = process.cwd();
    const outputFilePath = path.join(rootDir, dataPath);
    const outputDir = path.dirname(outputFilePath);
    fs.mkdirSync(outputDir, { recursive: true });
    // Convert data to string if it's not already a string
    const stringData =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(outputFilePath, stringData, "utf8");
  } catch (error) {
    throw error;
  }
};
