import { SchemaType } from "@google/generative-ai";

export const schemaOld = {
  type: SchemaType.OBJECT,
  properties: {
    caseInformation: {
      type: SchemaType.OBJECT,
      properties: {
        caseTitle: { type: SchemaType.STRING },
        caseNumber: { type: SchemaType.STRING },
        neutralCitation: { type: SchemaType.STRING },
        court: { type: SchemaType.STRING },
        courtStation: { type: SchemaType.STRING },
        dateOfJudgment: { type: SchemaType.STRING },
        judges: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        originalSourceFileURL: { type: SchemaType.STRING },
        caseURL: { type: SchemaType.STRING },
      },
      required: [
        "caseTitle",
        "caseNumber",
        "court",
        "dateOfJudgment",
        "originalSourceFileURL",
        "caseURL",
      ],
      propertyOrdering: [
        "caseTitle",
        "caseNumber",
        "neutralCitation",
        "court",
        "dateOfJudgment",
        "judges",
        "originalSourceFileURL",
        "caseURL",
      ],
    },
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Keywords or tags describing the case.",
    },
    parties: {
      type: SchemaType.OBJECT,
      properties: {
        plaintiffs: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        defendants: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: ["plaintiffs", "defendants"],
      propertyOrdering: ["plaintiffs", "defendants"],
    },
    propertyDetails: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          propertyType: {
            type: SchemaType.STRING,
            description: "Type of property (land, building, etc.)",
          },
          propertyLocation: { type: SchemaType.STRING },
          propertyDescription: { type: SchemaType.STRING },
          historicalOwnership: { type: SchemaType.STRING },
          subjectProperties: { type: SchemaType.STRING },
        },
        required: ["propertyType", "propertyLocation", "propertyDescription"],
      },
      description: "Details about the properties involved in the case.",
    },
    proceduralHistory: {
      type: SchemaType.OBJECT,
      properties: {
        consolidationDetails: { type: SchemaType.STRING },
        keyProceduralSteps: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      propertyOrdering: ["consolidationDetails", "keyProceduralSteps"],
    },
    factualBackground: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          fact: { type: SchemaType.STRING },
          tag: {
            type: SchemaType.STRING,
            description: "Tag or keyword associated with the fact.",
          },
          description: {
            type: SchemaType.STRING,
            description: "Detailed description of the fact.",
          },
        },
        required: ["fact"],
      },
      description: "Detailed factual background of the case.",
    },
    legalIssues: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          issue: { type: SchemaType.STRING },
          type: {
            type: SchemaType.STRING,
            enum: ["primary", "secondary"],
            description: "Type of legal issue.",
          },
          relevantStatutes: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          description: {
            type: SchemaType.STRING,
            description: "Detailed description of the legal issue.",
          },
        },
        required: ["issue"],
      },
      description: "Legal issues presented in the case.",
    },
    arguments: {
      type: SchemaType.OBJECT,
      properties: {
        plaintiffArguments: { type: SchemaType.STRING },
        defendantArguments: { type: SchemaType.STRING },
      },
      propertyOrdering: ["plaintiffArguments", "defendantArguments"],
    },
    evidence: {
      type: SchemaType.OBJECT,
      properties: {
        keyEvidencePresented: { type: SchemaType.STRING },
        evidentialChallenges: { type: SchemaType.STRING },
      },
      propertyOrdering: ["keyEvidencePresented", "evidentialChallenges"],
    },
    courtAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        courtReasoning: { type: SchemaType.STRING },
        applicationOfLegalPrinciples: { type: SchemaType.STRING },
        keyPrecedentsCited: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              precedentName: { type: SchemaType.STRING },
              precedentSummary: { type: SchemaType.STRING },
            },
          },
        },
      },
      propertyOrdering: [
        "courtReasoning",
        "applicationOfLegalPrinciples",
        // Removed "keyPrecedentsCited" to avoid the error
      ],
      description:
        "Key precedents stated, and a summary of the precedents to the case",
    },

    finalRulingAndOrders: {
      type: SchemaType.OBJECT,
      properties: {
        disposition: { type: SchemaType.STRING },
        specificOrders: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        costs: { type: SchemaType.STRING },
      },
      required: ["disposition", "specificOrders", "costs"],
      propertyOrdering: ["disposition", "specificOrders", "costs"],
    },
    analysisAndImplications: {
      type: SchemaType.OBJECT,
      properties: {
        legalImplications: { type: SchemaType.STRING },
        practicalImplications: { type: SchemaType.STRING },
        areasForFurtherInquiry: { type: SchemaType.STRING },
        dissentingOrConcurringOpinions: { type: SchemaType.STRING },
      },
      propertyOrdering: [
        "legalImplications",
        "practicalImplications",
        "areasForFurtherInquiry",
        "dissentingOrConcurringOpinions",
      ],
    },
  },
  required: [
    "caseInformation",
    "parties",
    "legalIssues",
    "finalRulingAndOrders",
  ],
};

const schema2BluePrint = {
  type: "object",
  properties: {
    caseDetails: {
      type: "object",
      description: "Information about the specific case",
      properties: {
        caseTitle: { type: "string" },
        caseNumber: { type: "string" },
        neutralCitation: { type: "string" },
        court: { type: "string" },
        dateOfJudgment: { type: "string" },
        judges: {
          type: "array",
          items: { type: "string" },
          description: "List of judges presiding over the case",
        },
        originalSourceFileURL: { type: "string" },
        caseURL: { type: "string" },
        caseType: {
          type: "string",
          enum: [
            "patent",
            "property",
            "criminal",
            "contract",
            "family",
            "other",
          ],
        },
        caseOutcome: {
          type: "string",
          enum: ["plaintiff_win", "defendant_win", "settled", "dismissed"],
        },
        damages: {
          type: "object",
          properties: {
            amount: { type: "number" },
            type: { type: "string", enum: ["compensatory", "punitive"] },
          },
        },
      },
      required: [
        "caseTitle",
        "neutralCitation",
        "court",
        "dateOfJudgment",
        "originalSourceFileURL",
        "caseURL",
        "caseType",
        "caseOutcome",
        "damages",
      ],
      propertyOrdering: [
        "caseTitle",
        "caseNumber",
        "neutralCitation",
        "court",
        "courtLocation",
        "caseType",
        "dateOfJudgment",
        "judges",
        "originalSourceFileURL",
        "caseURL",
      ],
    },
    partiesInvolved: {
      type: "object",
      description: "Details of the parties involved in the case",
      properties: {
        plaintiffs: {
          type: "array",
          items: { type: "string" },
          description: "Parties initiating the legal action",
        },
        defendants: {
          type: "array",
          items: { type: "string" },
          description: "Parties against whom the legal action is brought",
        },
        applicants: {
          type: "array",
          items: { type: "string" },
          description: "Parties making a formal request to the court",
        },
        respondents: {
          type: "array",
          items: { type: "string" },
          description: "Parties responding to an application",
        },
        administrators: {
          type: "array",
          items: { type: "string" },
          description: "Individuals appointed to manage an estate",
        },
      },
      required: ["plaintiffs", "defendants"],
      propertyOrdering: [
        "plaintiffs",
        "defendants",
        "applicants",
        "respondents",
        "administrators",
      ],
    },
    patentDetails: {
      type: "object",
      description: "Information specific to patent cases",
      properties: {
        patentNumber: { type: "string" },
        patentTitle: { type: "string" },
        patentOwner: { type: "string" },
        priorityDate: { type: "string" },
        filingDate: { type: "string" },
      },
    },
    propertyDetails: {
      type: "array",
      items: {
        type: "object",
        properties: {
          propertyType: { type: "string" },
          propertyLocation: { type: "string" },
          propertyDescription: { type: "string" },
          historicalOwnership: { type: "string" },
          subjectProperties: { type: "string" },
        },
        required: ["propertyType", "propertyLocation", "propertyDescription"],
      },
      description: "Details about the properties involved in the case.",
    },
    proceduralHistory: {
      type: "object",
      properties: {
        consolidationDetails: { type: "string" },
        keyProceduralSteps: {
          type: "array",
          items: { type: "string" },
          description: "Important actions taken during the case",
        },
        applicationsWithinCase: {
          type: "array",
          items: {
            type: "object",
            properties: {
              applicationDate: { type: "string" },
              applicationDetails: { type: "string" },
              applicant: { type: "string" },
              responseDetails: { type: "string" },
              courtDecision: { type: "string" },
            },
          },
          description: "Formal requests made to the court within the case",
        },
      },
      propertyOrdering: [
        "consolidationDetails",
        "keyProceduralSteps",
        "applicationsWithinCase",
      ],
    },
    factualBackground: {
      type: "array",
      items: {
        type: "object",
        properties: {
          fact: { type: "string" },
          tag: { type: "string" },
          description: { type: "string" },
          source: { type: "string" },
        },
        required: ["fact"],
      },
      description: "Detailed factual background of the case.",
    },
    legalIssues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          issue: { type: "string" },
          type: {
            type: "string",
            enum: ["primary", "secondary"],
          },
          relevantStatutes: {
            type: "array",
            items: { type: "string" },
          },
          description: { type: "string" },
        },
        required: ["issue"],
      },
      description: "Legal issues presented in the case.",
    },
    arguments: {
      type: "object",
      properties: {
        plaintiffArguments: { type: "string" },
        defendantArguments: { type: "string" },
        applicantArguments: { type: "string" },
        respondentArguments: { type: "string" },
      },
      propertyOrdering: [
        "plaintiffArguments",
        "defendantArguments",
        "applicantArguments",
        "respondentArguments",
      ],
    },
    evidence: {
      type: "object",
      properties: {
        keyEvidencePresented: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              courtAssessment: { type: "string" },
            },
          },
          description:
            "Key pieces of evidence presented, including the court's assessment of their credibility or weight.",
        },
        evidentialChallenges: { type: "string" },
        exhibitsReferenced: {
          type: "array",
          items: { type: "string" },
        },
      },
      propertyOrdering: [
        "keyEvidencePresented",
        "evidentialChallenges",
        "exhibitsReferenced",
      ],
    },
    courtAnalysis: {
      type: "object",
      properties: {
        courtReasoning: { type: "string" },
        applicationOfLegalPrinciples: { type: "string" },
        keyPrecedentsCited: {
          type: "array",
          items: {
            type: "object",
            properties: {
              precedentName: { type: "string" },
              precedentSummary: { type: "string" },
            },
          },
        },
        concurringAndDissentingOpinions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              judge: { type: "string" },
              opinionSummary: { type: "string" },
            },
          },
        },
        subsequentCases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              caseName: { type: "string" },
              summary: { type: "string" },
            },
          },
        },
      },
      propertyOrdering: [
        "courtReasoning",
        "applicationOfLegalPrinciples",
        "keyPrecedentsCited",
        "concurringAndDissentingOpinions",
        "subsequentCases",
      ],
    },
    finalDecision: {
      type: "object",
      properties: {
        disposition: {
          type: "string",
          enum: ["allowed", "dismissed", "partially_allowed", "settled"],
          description:
            "The final outcome or judgment for the parties (e.g., affirmed, reversed, remanded).",
        },
        specificOrders: {
          type: "array",
          items: { type: "string" },
          description: "Specific actions or directives issued by the court.",
        },
        costs: {
          type: "string",
          description: "Details on how costs are allocated among the parties.",
        },
        ruling: {
          type: "string",
          description:
            "The court's holding or legal principle established by the decision.",
        },
      },
      required: ["disposition", "specificOrders", "costs", "ruling"],
      propertyOrdering: ["disposition", "specificOrders", "costs", "ruling"],
    },
    analysisAndImplications: {
      type: "object",
      properties: {
        legalImplications: { type: "string" },
        practicalImplications: { type: "string" },
        policyConsiderations: { type: "string" },
        areasForFurtherInquiry: { type: "string" },
      },
      propertyOrdering: [
        "legalImplications",
        "practicalImplications",
        "policyConsiderations",
        "areasForFurtherInquiry",
      ],
    },
    amendments: {
      type: "object",
      description: "Details of modifications or revisions",
      properties: {
        dateOfAmendment: { type: "string" },
        originalClaims: {
          type: "array",
          items: { type: "string" },
        },
        amendedClaims: {
          type: "array",
          items: { type: "string" },
        },
        reasonForAmendment: { type: "string" },
      },
    },
    caseTypeSpecific: {
      type: "object",
      properties: {
        type: { type: "string" },
        details: {
          type: "object",
          properties: {
            criminal: {
              charges: { type: "array", items: { type: "string" } },
              verdict: { type: "string" },
            },
            civilCase: {
              claims: { type: "array", items: { type: "string" } },
              verdict: { type: "string" },
            },
          },
        },
      },

      description:
        "Optional fields specific to the case type. The 'type' field specifies the case type, and 'details' contains type-specific information.",
    },
  },
  required: ["caseDetails", "partiesInvolved", "legalIssues", "finalDecision"],
};

const schema3BluePrint = {
  type: SchemaType.OBJECT,
  properties: {
    caseDetails: {
      type: SchemaType.OBJECT,
      description: "Information about the specific case",
      properties: {
        caseTitle: { type: SchemaType.STRING },
        caseNumber: { type: SchemaType.STRING },
        neutralCitation: { type: SchemaType.STRING },
        court: { type: SchemaType.STRING ,
          enum: ["Supreme Court", "Court of Appeal", "High Court", "Employment and Labour Relations Court", "Environment and Land Court", "Industrial Court", "Magistrate's Court", "Kadhis Courts", "Small Claims Court"],
          description: "The court that heard the case",
        },
        courtLocation: { type: SchemaType.STRING },
        dateOfJudgment: { type: SchemaType.STRING, format: "date" },
        judges: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of judges presiding over the case",
        },
        originalSourceFileURL: { type: SchemaType.STRING, format: "uri" },
        caseURL: { type: SchemaType.STRING, format: "uri" },
        caseType: {
          type: SchemaType.STRING,
          enum: ["patent", "property", "criminal", "employment", "civil", "family"],
          description: "The type of case",
        },
        caseOutcome: {
          type: SchemaType.STRING,
          enum: ["plaintiff_win", "defendant_win", "settled", "dismissed"],
          description: "The outcome of the case for prediction purposes",
        },
        damages: {
          type: SchemaType.OBJECT,
          properties: {
            amount: { type: SchemaType.NUMBER, description: "Amount of damages awarded" },
            type: {
              type: SchemaType.STRING,
              enum: ["compensatory", "punitive"],
              description: "Type of damages",
            },
          },
          description: "Details of damages awarded in the case",
        },
      },
      required: [
        "caseTitle",
        "caseNumber",
        "court",
        "dateOfJudgment",
        "originalSourceFileURL",
        "caseURL",
      ],
      propertyOrdering: [
        "caseTitle",
        "caseNumber",
        "neutralCitation",
        "court",
        "courtLocation",
        "caseType",
        "caseOutcome",
        "damages",
        "dateOfJudgment",
        "judges",
        "originalSourceFileURL",
        "caseURL",
      ],
    },
    partiesInvolved: {
      type: SchemaType.OBJECT,
      description: "Details of the parties involved in the case",
      properties: {
        plaintiffs: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, },
        defendants: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        applicants: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        respondents: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        administrators: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ["plaintiffs", "defendants"],
      propertyOrdering: [
        "plaintiffs",
        "defendants",
        "applicants",
        "respondents",
        "administrators",
      ],
    },
    propertyDetails: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          propertyType: { type: SchemaType.STRING },
          propertyLocation: { type: SchemaType.STRING },
          propertyDescription: { type: SchemaType.STRING },
          historicalOwnership: { type: SchemaType.STRING },
          subjectProperties: { type: SchemaType.STRING },
        },
        required: ["propertyType", "propertyLocation", "propertyDescription"],
      },
      description: "Details about the properties involved in the case.",
    },
    proceduralHistory: {
      type: SchemaType.OBJECT,
      properties: {
        consolidationDetails: { type: SchemaType.STRING },
        keyProceduralSteps: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              step: { type: SchemaType.STRING, description: "Description of the procedural step" },
              date: { type: SchemaType.STRING, format: "date", description: "Date of the step" },
            },
            required: ["step", "date"],
          },
          description: "Key procedural steps with dates for better tracking",
        },
        applicationsWithinCase: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              applicationDate: { type: SchemaType.STRING, format: "date" },
              applicationDetails: { type: SchemaType.STRING },
              applicant: { type: SchemaType.STRING },
              responseDetails: { type: SchemaType.STRING },
              courtDecision: { type: SchemaType.STRING },
            },
          },
        },
      },
      propertyOrdering: [
        "consolidationDetails",
        "keyProceduralSteps",
        "applicationsWithinCase",
      ],
    },
    factualBackground: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          fact: { type: SchemaType.STRING },
          tag: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          source: { type: SchemaType.STRING },
        },
        required: ["fact"],
      },
      description: "Detailed factual background of the case.",
    },
    legalIssues: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          issue: { type: SchemaType.STRING },
          type: {
            type: SchemaType.STRING,
            enum: ["primary", "secondary"],
          },
          relevantStatutes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          description: { type: SchemaType.STRING },
          linkedPrecedents: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                precedentName: { type: SchemaType.STRING },
                influence: {
                  type: SchemaType.STRING,
                  enum: ["followed", "distinguished"],
                  description: "How the precedent influenced the issue",
                },
              },
              required: ["precedentName", "influence"],
            },
            description: "Precedents linked to this legal issue",
          },
        },
        required: ["issue"],
      },
      description: "Legal issues presented in the case.",
    },
    arguments: {
      type: SchemaType.OBJECT,
      properties: {
        plaintiffArguments: {
          type: SchemaType.OBJECT,
          properties: {
            claims: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            supportingStatutes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          description: "Structured arguments presented by the plaintiff",
        },
        defendantArguments: {
          type: SchemaType.OBJECT,
          properties: {
            claims: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            supportingStatutes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          description: "Structured arguments presented by the defendant",
        },
        applicantArguments: {
          type: SchemaType.OBJECT,
          properties: {
            claims: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            supportingStatutes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          description: "Structured arguments presented by the applicant",
        },
        respondentArguments: {
          type: SchemaType.OBJECT,
          properties: {
            claims: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            supportingStatutes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          description: "Structured arguments presented by the respondent",
        },
      },
      propertyOrdering: [
        "plaintiffArguments",
        "defendantArguments",
        "applicantArguments",
        "respondentArguments",
      ],
    },
    evidence: {
      type: SchemaType.OBJECT,
      properties: {
        keyEvidencePresented: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              description: { type: SchemaType.STRING },
              courtAssessment: { type: SchemaType.STRING },
            },
          },
        },
        evidentialChallenges: { type: SchemaType.STRING },
        exhibitsReferenced: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      propertyOrdering: [
        "keyEvidencePresented",
        "evidentialChallenges",
        "exhibitsReferenced",
      ],
    },
    courtAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        courtReasoning: { type: SchemaType.STRING },
        applicationOfLegalPrinciples: { type: SchemaType.STRING },
        keyPrecedentsCited: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              precedentName: { type: SchemaType.STRING },
              precedentSummary: { type: SchemaType.STRING },
            },
          },
        },
      },
      propertyOrdering: [
        "courtReasoning",
        "applicationOfLegalPrinciples",
        "keyPrecedentsCited",
      ],
    },
    finalDecision: {
      type: SchemaType.OBJECT,
      properties: {
        disposition: {
          type: SchemaType.STRING,
          enum: ["allowed", "dismissed", "partially_allowed", "settled"],
          description: "The final disposition of the case",
        },
        specificOrders: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        costs: { type: SchemaType.STRING },
        ruling: { type: SchemaType.STRING },
      },
      required: ["disposition", "specificOrders", "costs", "ruling"],
      propertyOrdering: ["disposition", "specificOrders", "costs", "ruling"],
    },
    analysisAndImplications: {
      type: SchemaType.OBJECT,
      properties: {
        legalImplications: { type: SchemaType.STRING },
        practicalImplications: { type: SchemaType.STRING },
        policyConsiderations: { type: SchemaType.STRING },
        areasForFurtherInquiry: { type: SchemaType.STRING },
      },
      propertyOrdering: [
        "legalImplications",
        "practicalImplications",
        "policyConsiderations",
        "areasForFurtherInquiry",
      ],
    },
    amendments: {
      type: SchemaType.OBJECT,
      description: "Details of modifications or revisions made to the case",
      properties: {
        dateOfAmendment: { type: SchemaType.STRING, format: "date" },
        originalClaims: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of claims as initially presented before amendment",
        },
        amendedClaims: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of claims after amendment",
        },
        reasonForAmendment: { type: SchemaType.STRING },
        amendmentOrderReference: { type: SchemaType.STRING },
      },
      required: ["dateOfAmendment", "originalClaims", "amendedClaims", "reasonForAmendment"],
    },
    caseTypeSpecific: {
      type: SchemaType.OBJECT,
      properties: {
        type: {
          type: SchemaType.STRING,
          description: "The specific type of case (e.g., Employment, Civil, Criminal, Family)",
        },
        details: {
          type: SchemaType.OBJECT,
          description: "Additional fields specific to the case type",
          properties: {
            employmentCaseDetails: {
              type: SchemaType.OBJECT,
              properties: {
                employeeName: { type: SchemaType.STRING },
                employerName: { type: SchemaType.STRING },
                terminationReason: { type: SchemaType.STRING },
                compensationAwarded: { type: SchemaType.STRING },
              },
            },
            propertyDisputeDetails: {
              type: SchemaType.OBJECT,
              properties: {
                propertyID: { type: SchemaType.STRING },
                ownershipStatus: { type: SchemaType.STRING },
                disputedAmount: { type: SchemaType.STRING },
              },
            },
            criminalCaseDetails: {
              type: SchemaType.OBJECT,
              properties: {
                accusedPersons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                charges: { type: SchemaType.STRING },
                sentence: { type: SchemaType.STRING },
              },
            },
          },
        },
      },
    },
    citedCases: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          caseName: { type: SchemaType.STRING, description: "Name of the cited case" },
          influence: {
            type: SchemaType.STRING,
            enum: ["followed", "distinguished"],
            description: "Influence of the cited case",
          },
        },
        required: ["caseName"],
      },
      description: "Cases cited by this case for relationship tracking",
    },
    citedBy: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Cases that cite this case",
    },
    appealHistory: {
      type: SchemaType.OBJECT,
      properties: {
        appealed: { type: SchemaType.BOOLEAN, description: "Whether the case was appealed" },
        appealOutcome: { type: SchemaType.STRING, description: "Outcome of the appeal" },
      },
      description: "Details of the case's appeal history",
    },
  },
  required: ["caseDetails", "partiesInvolved", "legalIssues", "finalDecision"],
};

// Exmaples for guiding LLMS:

const populatedSchema1 = {
  caseDetails: {
    caseTitle:
      "Gurey & 2 others v Principal Secretary, Ministry of Interior & National Administration & 5 others",
    caseNumber: "Petition E004 of 2024",
    neutralCitation: "[2024] KEELRC 13570 (KLR)",
    court: "EMPLOYMENT AND LABOUR RELATIONS COURT AT GARISSA",
    courtLocation: "Garissa",
    dateOfJudgment: "2024-12-19",
    judges: ["B ONGAYA, J"],
    originalSourceFileURL:
      "https://new.kenyalaw.org/akn/ke/judgment/keelrc/2024/13570/enge2024-12-19",
    caseURL:
      "https://new.kenyalaw.org/akn/ke/judgment/keelrc/2024/13570/enge2024-12-19",
    caseType: "Constitutional Petition",
  },
  partiesInvolved: {
    plaintiffs: [
      "DUBEN HUSSEIN GUREY",
      "ANWAR YUSSUF AHMED",
      "MASLAH HUSSEIN GURE",
    ],
    defendants: [
      "PRINCIPAL SECRETARY, MINISTRY OF INTERIOR & NATIONAL ADMINISTRATION",
      "THE REGIONAL COMMISSIONER, NORTEASTERN REGION",
      "COUNTY COMMISSIONER, GARISSA COUNTY",
      "DEPUTY COUNTY COMMISSIONER, LAGDERA SUBCOUNTY",
      "CABINET SECRETARY, MINISTRY OF INTERIOR & NATIONAL ADMINISTRATION",
      "THE ATTORNEY GENERAL",
    ],
    applicants: [
      "DUBEN HUSSEIN GUREY",
      "ANWAR YUSSUF AHMED",
      "MASLAH HUSSEIN GURE",
    ],
    respondents: [
      "PRINCIPAL SECRETARY, MINISTRY OF INTERIOR & NATIONAL ADMINISTRATION",
      "THE REGIONAL COMMISSIONER, NORTEASTERN REGION",
      "COUNTY COMMISSIONER, GARISSA COUNTY",
      "DEPUTY COUNTY COMMISSIONER, LAGDERA SUBCOUNTY",
      "CABINET SECRETARY, MINISTRY OF INTERIOR & NATIONAL ADMINISTRATION",
      "THE ATTORNEY GENERAL",
    ],
  },
  patentDetails: {},
  propertyDetails: [],
  proceduralHistory: {
    keyProceduralSteps: [
      "Advertisements for the position on 05.10.2023, 08.01.2024, and 04.03.2024",
      "Interviews and vetting of candidates",
      "Selection of MohamedKhadar Hussein Gure",
      "Letter from 3rd respondent dated 13.09.2024 to repeat the process",
      "Petition filed on 09.10.2024",
      "Grounds of opposition filed on 15.11.2024",
    ],
    applicationsWithinCase: [
      {
        applicationDate: "2024-10-09",
        applicationDetails:
          "Petition filed seeking declarations and orders to quash the directive to repeat the appointment process",
        applicant:
          "DUBEN HUSSEIN GUREY, ANWAR YUSSUF AHMED, MASLAH HUSSEIN GURE",
      },
    ],
  },
  factualBackground: [
    {
      fact: "The position of Chief II Modogashe Location was advertised on 05.10.2023, 08.01.2024, and 04.03.2024.",
    },
    {
      fact: "Interviews and vetting were conducted, and MohamedKhadar Hussein Gure was selected.",
    },
    {
      fact: "The 3rd respondent issued a letter on 13.09.2024 to repeat the appointment process.",
    },
    {
      fact: "Petitioners claim the repeat directive is irregular and against the community's interests.",
    },
  ],
  legalIssues: [
    {
      issue: "Whether the petitioners have locus standi to bring the petition.",
      type: "primary",
      relevantStatutes: [
        "Article 22(2)(c) of the Constitution",
        "Article 258(2)(c) of the Constitution",
      ],
    },
    {
      issue: "Whether the court has jurisdiction over the matter.",
      type: "primary",
      relevantStatutes: [
        "Section 12(2) of the Employment and Labour Relations Court Act",
      ],
    },
    {
      issue:
        "Whether the directive to repeat the appointment process is lawful and constitutional.",
      type: "primary",
      relevantStatutes: [
        "Article 47 of the Constitution",
        "Article 232 of the Constitution",
        "Article 10 of the Constitution",
      ],
    },
  ],
  arguments: {
    plaintiffArguments:
      "The repeat directive is irregular, against the community's wishes, and violates constitutional values.",
    defendantArguments:
      "The petition is an abuse of process, petitioners lack locus standi, and the court lacks jurisdiction.",
    applicantArguments:
      "The directive undermines a constitutionally conducted recruitment process and public interest.",
    respondentArguments:
      "The matter is private law, no employment relationship exists, and the petitioners lack standing.",
  },
  evidence: {},
  courtAnalysis: {
    courtReasoning:
      "The court found that the petitioners have established a public interest in ensuring the recruitment process is conducted constitutionally. The court also held that it has jurisdiction under the Employment and Labour Relations Court Act. Furthermore, the court determined that the directive to repeat the process was unlawful and unconstitutional, violating Articles 47, 232, and 10 of the Constitution.",
  },
  finalDecision: {
    disposition: "Petition granted",
    specificOrders: [
      "Declaration that the directive by the 3rd respondent is irregular and contrary to the best interest of the community and offends the core values of governance prescribed under the Constitution.",
      "Quashing the directive by the 3rd respondent communicated vide a letter dated 13.09.2024.",
      "Freezing and staying any directive, notice or communication directing the repeat of the process for the conduct of interviews for the appointment of Chief II Modogashe Location.",
      "Upholding and affirming the results of the previously conducted selection process that led to the recommendation of the appointment of Mr. MohamedKhadar Hussein Gure as the Chief II Modogashe Location.",
    ],
    costs: "No costs of the petition.",
    ruling:
      "The directive to repeat the appointment process is unlawful and unconstitutional, and the selection of Mr. Gure should be upheld.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {
    type: "Administrative Law",
    details: {
      position: "Chief II Modogashe Location",
      location: "Modogashe Division, Lagdera Sub County, Garissa County",
    },
  },
};
const populatedSchema2 = {
  caseDetails: {
    caseTitle: "Tufaa Capital Limited v Jactone Owinyo Otieno",
    caseNumber: "Commercial Case 182 of 2021",
    neutralCitation: "[2021] SCC 5 (KLR)",
    court: "MILIMANI SMALL CLAIMS COURT",
    courtLocation: "Nairobi, Kenya",
    dateOfJudgment: "2021-08-26",
    judges: ["KO GWENO, RM"],
    originalSourceFileURL: "",
    caseURL:
      "https://new.kenyalaw.org/akn/ke/judgment/ssc/2021/5/eng@2021-08-26",
    caseType: "Commercial",
  },
  partiesInvolved: {
    plaintiffs: ["TUFAA CAPITAL LIMITED"],
    defendants: ["JACTONE OWINYO OTIENO"],
    applicants: [],
    respondents: [],
    administrators: [],
  },
  patentDetails: {},
  propertyDetails: [],
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Claimant filed statement of claim on 30th June 2021",
      "Respondent entered appearance and filed response on 1st July 2021",
      "Matter proceeded to hearing",
    ],
    applicationsWithinCase: [],
  },
  factualBackground: [
    {
      fact: "Claimant lent respondent Kshs 60,000 on 8th July 2019",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Loan was to be repaid by 24th August 2019 with interest",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Respondent failed to repay the loan",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Amount accrued to Kshs 409,185.68",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Respondent claimed debt was relinquished but provided no evidence",
      tag: "",
      description: "",
      source: "",
    },
  ],
  legalIssues: [
    {
      issue: "Whether the respondent owes the claimant Kshs 409,185.68",
      type: "primary",
      relevantStatutes: [],
      description: "",
    },
    {
      issue: "Whether the interest and penalties charged are exorbitant",
      type: "secondary",
      relevantStatutes: [],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments:
      "Respondent entered into loan agreement, failed to repay, owes Kshs 409,185.68",
    defendantArguments:
      "Debt was relinquished, interest and penalties are exorbitant",
    applicantArguments: "",
    respondentArguments: "",
  },
  evidence: {
    keyEvidencePresented: [
      {
        description: "Loan agreement",
        courtAssessment: "",
      },
      {
        description: "Statement of account",
        courtAssessment: "",
      },
      {
        description: "Testimony of Faith Mumali (PW1)",
        courtAssessment: "",
      },
    ],
    evidentialChallenges: "",
    exhibitsReferenced: ["Loan agreement", "Statement of account"],
  },
  courtAnalysis: {
    courtReasoning:
      "Parties entered into valid loan agreement, respondent failed to repay, interest and penalties were clearly set out",
    applicationOfLegalPrinciples:
      "Parties are bound by the terms of their contract unless there is evidence of coercion, fraud, or undue influence",
    keyPrecedentsCited: [
      {
        precedentName: "Jiwaji v Jiwaji [1968] E.A. 547",
        precedentSummary:
          "Where there is no ambiguity in an agreement, it must be construed according to the clear words used by the parties",
      },
      {
        precedentName:
          "Total Kenya Ltd v Joseph Ojiem, Nairobi HCCC No. 1243 of 1999",
        precedentSummary:
          "Parties to a contract that they have entered into voluntarily are bound by its terms and conditions",
      },
      {
        precedentName:
          "National Bank of Kenya Ltd v Pipeplastic Samkolit (K) Ltd & Another, Civil Appeal No. 95 of 1999 (2001) KLR 112 (2002) EA 503",
        precedentSummary:
          "A court of law cannot re-write a contract between the parties. The parties are bound by the terms of their contract unless coercion, fraud or undue influence are pleaded and proved",
      },
    ],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Judgment in favor of the claimant",
    specificOrders: [
      "Respondent to pay Kshs 409,185.68",
      "Claimant awarded costs and interest from date of judgment",
    ],
    costs: "Claimant awarded costs",
    ruling:
      "Respondent is bound by the loan agreement and must pay the accrued amount",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {},
};
const populatedSchema3 = {
  caseDetails: {
    caseTitle: "Gilbert Keroro Masaki v Charles Nyariki Mabeya & another",
    caseNumber: "ELC CIVIL CASE NO. 171 OF 2013",
    neutralCitation: "[2019] eKLR",
    court: "ENVIRONMENT AND LAND COURT AT NAIROBI",
    courtLocation: "Nairobi",
    dateOfJudgment: "2019-09-25",
    judges: ["L. KOMINGOI"],
    originalSourceFileURL: "http://www.kenyalaw.org",
    caseURL: "http://www.kenyalaw.org",
    caseType: "Civil",
  },
  partiesInvolved: {
    plaintiffs: ["GILBERT KERORO MASAKI"],
    defendants: ["CHARLES NYARIKI MABEYA", "ANTHONY MUMIO THOITHI"],
    applicants: [],
    respondents: [],
    administrators: [],
  },
  propertyDetails: [
    {
      propertyType: "Land",
      propertyLocation: "Kajiado/Kitengela",
      propertyDescription:
        "Kajiado/Kitengela/10791 and Kajiado/Kitengela/10792",
      historicalOwnership: "Initially registered to Charles Nyariki Mabeya",
      subjectProperties: "",
    },
  ],
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Plaint filed on 5th February 2013",
      "2nd defendant filed defense on 5th April 2013",
      "Trial conducted with testimonies from PW1 and DW1",
      "Written submissions tendered by both parties",
    ],
    applicationsWithinCase: [],
  },
  factualBackground: [
    {
      fact: "Plaintiff paid Kshs. 100,000 to Ubora Housing Cooperative Society for two plots using 1st defendant's name.",
      tag: "",
      description: "",
      source: "PW1 testimony",
    },
    {
      fact: "1st defendant acquired titles for Kajiado/Kitengela/10791 and 10792 on 19th October 1999.",
      tag: "",
      description: "",
      source: "Plaintiff's exhibits P3 and P4",
    },
    {
      fact: "1st defendant signed transfer forms in favor of the plaintiff but transfers were not registered.",
      tag: "",
      description: "",
      source: "Plaintiff's exhibits P5 and P6",
    },
    {
      fact: "2nd defendant purchased the properties from 1st defendant in 2011 and obtained titles.",
      tag: "",
      description: "",
      source: "DW1 testimony and exhibits D5",
    },
  ],
  legalIssues: [
    {
      issue:
        "Whether the plaintiff is the bona fide owner of the suit properties.",
      type: "primary",
      relevantStatutes: [
        "Section 3(3) of the Law of Contract Act",
        "Section 38 of the Land Act 2012",
      ],
      description: "",
    },
    {
      issue: "Whether the 2nd defendant's title was fraudulently obtained.",
      type: "primary",
      relevantStatutes: ["Section 26(1) of the Land Registration Act"],
      description: "",
    },
    {
      issue:
        "Whether the 2nd defendant is an innocent purchaser who purchased the properties with utmost good faith.",
      type: "primary",
      relevantStatutes: [],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments:
      "Plaintiff purchased the properties, had signed transfer forms, and was in possession since 1999.",
    defendantArguments:
      "No written agreement between plaintiff and 1st defendant; titles legally obtained by 2nd defendant.",
    applicantArguments: "",
    respondentArguments: "",
  },
  evidence: {
    keyEvidencePresented: [
      {
        description: "Deposit slip and receipt for Kshs. 100,000 payment",
        courtAssessment: "Indicated payment by 1st defendant, not plaintiff",
      },
      {
        description: "Title deeds in 1st defendant's name",
        courtAssessment: "",
      },
      {
        description: "Signed transfer forms by 1st defendant",
        courtAssessment: "Not lodged with land registry",
      },
      {
        description: "Gazette notice for replacement of title deeds",
        courtAssessment: "",
      },
    ],
    evidentialChallenges: "Plaintiff failed to prove fraud or ownership",
    exhibitsReferenced: [
      "P1",
      "P2",
      "P3",
      "P4",
      "P5",
      "P6",
      "P10",
      "P11 A and B",
      "D1",
      "D2",
      "D3",
      "D4",
      "D5",
    ],
  },
  courtAnalysis: {
    courtReasoning:
      "No written agreement between plaintiff and 1st defendant, transfers not registered, 2nd defendant followed proper procedure.",
    applicationOfLegalPrinciples:
      "Section 3(3) of the Law of Contract Act requires written contracts for land disposition.",
    keyPrecedentsCited: [
      {
        precedentName:
          "Thrift Homes Limited vs Kays Investment Limited [2015] eKLR",
        precedentSummary:
          "Specific performance requires a valid enforceable contract.",
      },
    ],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Plaintiff's suit dismissed",
    specificOrders: ["Each party to bear own costs"],
    costs: "Each party to bear own costs",
    ruling: "Plaintiff failed to prove ownership on a balance of probability.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {},
};
const populatedSchema4 = {
  caseDetails: {
    caseTitle: "City Clock (Kenya) Ltd v Paul Muimi Mutemi & another",
    caseNumber: "IPT CASE NO. 72 OF 2016",
    neutralCitation: "[2019] eKLR",
    court: "INDUSTRIAL PROPERTY TRIBUNAL AT NAIROBI",
    courtLocation: "Nairobi",
    dateOfJudgment: "2019-09-12",
    judges: [
      "Brown M. Kairaria",
      "Wycliffe Swanya",
      "Pauline Mudeshi",
      "Brettah Muthuri",
    ],
    originalSourceFileURL: "",
    caseURL: "",
    caseType: "Industrial Design",
  },
  partiesInvolved: {
    plaintiffs: ["CITY CLOCK (KENYA) LTD"],
    defendants: ["PAUL MUIMI MUTEMI", "BONIFACE MUAGE KITIVO"],
    applicants: ["CITY CLOCK (KENYA) LTD"],
    respondents: ["PAUL MUIMI MUTEMI", "BONIFACE MUAGE KITIVO"],
    administrators: [],
  },
  patentDetails: {
    patentNumber: "1327 & 1328",
    patentTitle: "Industrial Design",
    patentOwner: "",
    priorityDate: "",
    filingDate: "",
  },
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Matter fixed for further hearing on 1st August 2019",
      "Application for adjournment on 12th September 2019",
      "Tribunal dismissed adjournment application and ordered hearing to proceed",
    ],
    applicationsWithinCase: [
      {
        applicationDate: "2019-09-12",
        applicationDetails: "Application for adjournment by respondents",
        applicant: "Respondents",
        responseDetails: "Opposed by applicant",
        courtDecision: "Application dismissed",
      },
    ],
  },
  factualBackground: [
    {
      fact: "Matter was set for further hearing of respondents' case on 1st August 2019 by consent.",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Respondents' counsel applied for adjournment on 12th September 2019.",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Applicant opposed the adjournment application.",
      tag: "",
      description: "",
      source: "",
    },
  ],
  legalIssues: [
    {
      issue: "Whether the adjournment application should be granted.",
      type: "primary",
      relevantStatutes: [],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments:
      "Adjournment should be denied as date was set by consent and reasons are not legitimate.",
    defendantArguments:
      "Adjournment necessary due to counsel's unavailability and 1st respondent's emergency.",
    applicantArguments: "",
    respondentArguments: "",
  },
  evidence: {},
  courtAnalysis: {
    courtReasoning:
      "Hearing date set by consent, reasons for adjournment not compelling, matter is old and needs to proceed.",
    applicationOfLegalPrinciples: "",
    keyPrecedentsCited: [],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Application for adjournment dismissed",
    specificOrders: ["Respondents' case to proceed for hearing"],
    costs: "",
    ruling: "Adjournment not warranted given the circumstances.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {
    type: "Industrial Property",
    details: {
      designNumbers: "1327 & 1328",
    },
  },
};
const populatedSchema5 = {
  caseDetails: {
    caseTitle: "Zinj Limited v The Honourable Attorney General & 4 others",
    caseNumber: "ELC PETITION NO. 2 OF 2010",
    neutralCitation: "[2018] eKLR",
    court: "ENVIRONMENT AND LAND COURT AT MALINDI",
    courtLocation: "Malindi",
    dateOfJudgment: "2018-03-15",
    judges: ["J.O. OLOLA"],
    originalSourceFileURL: "",
    caseURL: "",
    caseType: "Constitutional Petition",
  },
  partiesInvolved: {
    plaintiffs: ["ZINJ LIMITED"],
    defendants: [
      "THE HONOURABLE ATTORNEY GENERAL",
      "THE COMMISSIONER OF LANDS",
      "THE PRINCIPAL REGISTRAR OF TITLES",
      "THE CHIEF LAND REGISTRAR",
      "DEPARTMENT OF DEFENCE",
    ],
    applicants: ["ZINJ LIMITED"],
    respondents: [
      "THE HONOURABLE ATTORNEY GENERAL",
      "THE COMMISSIONER OF LANDS",
      "THE PRINCIPAL REGISTRAR OF TITLES",
      "THE CHIEF LAND REGISTRAR",
      "DEPARTMENT OF DEFENCE",
    ],
    administrators: [],
  },
  propertyDetails: [
    {
      propertyType: "Land",
      propertyLocation: "Coast Province, Kenya",
      propertyDescription: "LR No. 25528, 425.7 hectares",
      historicalOwnership: "Registered to Zinj Limited since 1st April 1977",
      subjectProperties: "",
    },
  ],
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Petition filed on 13th September 2010",
      "Amended Petition filed on 28th August 2015",
      "Respondents filed Replying Affidavit on 31st October 2016",
      "Parties agreed to canvass Petition by pleadings and documents on 13th February 2017",
    ],
    applicationsWithinCase: [],
  },
  factualBackground: [
    {
      fact: "Petitioner is registered owner of LR No. 25528 since 1977.",
      tag: "",
      description: "",
      source: "Petitioner's affidavit",
    },
    {
      fact: "Government issued duplicate titles over parts of LR No. 25528 in 2007.",
      tag: "",
      description: "",
      source: "Petitioner's affidavit",
    },
    {
      fact: "Government issued title LR No. 24853 to Department of Defence, overlapping with LR No. 25528.",
      tag: "",
      description: "",
      source: "Petitioner's affidavit",
    },
    {
      fact: "Petitioner protested but received no compensation or protection from Government.",
      tag: "",
      description: "",
      source: "Petitioner's affidavit",
    },
  ],
  legalIssues: [
    {
      issue:
        "Whether the issuance of duplicate titles over parts of LR No. 25528 violates the Petitioner's constitutional rights.",
      type: "primary",
      relevantStatutes: [
        "Article 40 of the Constitution",
        "Registration of Titles Act, Cap 281",
      ],
      description: "",
    },
    {
      issue:
        "Whether the Petitioner is entitled to compensation for the deprivation of its property.",
      type: "primary",
      relevantStatutes: ["Land Act 2012", "Land Acquisition Act (repealed)"],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments:
      "Issuance of duplicate titles is unlawful and violates constitutional rights; entitled to compensation.",
    defendantArguments:
      "Followed due process in establishing Ngomeni Settlement Scheme; Petitioner's claim is time-barred.",
    applicantArguments: "",
    respondentArguments: "",
  },
  evidence: {
    keyEvidencePresented: [
      {
        description: "Title deed for LR No. 25528",
        courtAssessment: "Confirmed Petitioner's ownership",
      },
      {
        description: "Survey report on extent of encroachment",
        courtAssessment: "Established 51.129 ha affected",
      },
      {
        description: "Valuation reports for compensation",
        courtAssessment: "Wesco report accepted",
      },
    ],
    evidentialChallenges: "",
    exhibitsReferenced: ["Title deed", "Survey report", "Valuation reports"],
  },
  courtAnalysis: {
    courtReasoning:
      "Issuance of duplicate titles without compensation is unlawful and violates Article 40; Petitioner entitled to compensation.",
    applicationOfLegalPrinciples:
      "First title in time prevails; compensation required for compulsory acquisition.",
    keyPrecedentsCited: [
      {
        precedentName:
          "Virenda Ramji Gudka & 3 Others v Attorney General [2014] eKLR",
        precedentSummary: "Allotment of already titled land is unlawful.",
      },
      {
        precedentName:
          "Govas Holdings Ltd v Tom Mayani Omami & 2 Others [2004] eKLR",
        precedentSummary: "Government cannot allot land already allocated.",
      },
    ],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Petition allowed",
    specificOrders: [
      "Declaration that Petitioner is the lawful owner of LR No. 25528",
      "Declaration that taking possession of parts of LR No. 25528 is unlawful",
      "Compensation of Kshs 413,844,248.70 for value of land",
      "General damages of Kshs 51,129,000 for breach of rights",
      "Interest at court rates",
      "Costs to the Petitioner",
    ],
    costs: "Costs to the Petitioner",
    ruling:
      "Government's actions violated Petitioner's constitutional rights; compensation awarded.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {},
};
const populatedSchema6 = {
  caseDetails: {
    caseTitle:
      "Kenya Union of Commercial Food & Allied Workers v The Permanent Secretary, Ministry of Labour & another",
    caseNumber: "",
    neutralCitation: "[2024] eKLR",
    court: "INDUSTRIAL COURT OF KENYA",
    courtLocation: "Nairobi",
    dateOfJudgment: "2024-02-07",
    judges: ["James Rika"],
    originalSourceFileURL: "https://new.kenyalaw.org",
    caseURL:
      "https://new.kenyalaw.org/akn/ke/judgment/kcic/2024/1/eng@2024-02-07",
    caseType: "Civil",
  },
  partiesInvolved: {
    plaintiffs: ["KENYA UNION OF COMMERCIAL FOOD & ALLIED WORKERS"],
    defendants: [
      "THE PERMANENT SECRETARY, MINISTRY OF LABOUR",
      "THE ATTORNEY GENERAL",
    ],
    applicants: ["KENYA UNION OF COMMERCIAL FOOD & ALLIED WORKERS"],
    respondents: [
      "THE PERMANENT SECRETARY, MINISTRY OF LABOUR",
      "THE ATTORNEY GENERAL",
    ],
    administrators: [],
  },
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Application for execution filed under Order 29 Rule 3 of the Civil Procedure Rules",
      "Court ordered service of application on respondents",
    ],
    applicationsWithinCase: [
      {
        applicationDate: "",
        applicationDetails:
          "Application for arrest and committal of Cabinet Secretary to civil jail",
        applicant: "KENYA UNION OF COMMERCIAL FOOD & ALLIED WORKERS",
        responseDetails: "",
        courtDecision: "Application to be served on respondents for hearing",
      },
    ],
  },
  factualBackground: [
    {
      fact: "Claimant seeks execution of a decree against the Government.",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Application for arrest and committal of Cabinet Secretary to civil jail for failure to satisfy the decree.",
      tag: "",
      description: "",
      source: "",
    },
  ],
  legalIssues: [
    {
      issue:
        "Whether the court can order the arrest and committal of a Cabinet Secretary to civil jail for failure to satisfy a decree against the Government.",
      type: "primary",
      relevantStatutes: ["Government Proceedings Act"],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments:
      "Cabinet Secretary should be arrested and committed to civil jail for failure to satisfy the decree.",
    defendantArguments: "",
    applicantArguments: "",
    respondentArguments: "",
  },
  evidence: {},
  courtAnalysis: {
    courtReasoning:
      "Doubtful if a Cabinet Secretary can be arrested for Government's failure to satisfy a decree; no precedent cited.",
    applicationOfLegalPrinciples: "",
    keyPrecedentsCited: [],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Application to be served on respondents",
    specificOrders: [
      "Application shall be served upon the Respondents",
      "Hearing date to be assigned after responses",
    ],
    costs: "",
    ruling:
      "Court requires service and hearing before deciding on the application.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {},
};
const populatedSchema7 = {
  caseDetails: {
    caseTitle:
      "Kenya Union of Commercial Food & Allied Workers v The Permanent Secretary, Ministry of Labour & another",
    caseNumber: "",
    neutralCitation: "[2024] eKLR",
    court: "INDUSTRIAL COURT OF KENYA",
    courtLocation: "Nairobi",
    dateOfJudgment: "2024-02-07",
    judges: ["James Rika"],
    originalSourceFileURL: "https://new.kenyalaw.org",
    caseURL:
      "https://new.kenyalaw.org/akn/ke/judgment/kcic/2024/1/eng@2024-02-07",
    caseType: "Civil",
  },
  partiesInvolved: {
    plaintiffs: ["KENYA UNION OF COMMERCIAL FOOD & ALLIED WORKERS"],
    defendants: [
      "THE PERMANENT SECRETARY, MINISTRY OF LABOUR",
      "THE ATTORNEY GENERAL",
    ],
    applicants: ["KENYA UNION OF COMMERCIAL FOOD & ALLIED WORKERS"],
    respondents: [
      "THE PERMANENT SECRETARY, MINISTRY OF LABOUR",
      "THE ATTORNEY GENERAL",
    ],
    administrators: [],
  },
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Application for execution filed under Order 29 Rule 3 of the Civil Procedure Rules",
      "Court ordered service of application on respondents",
    ],
    applicationsWithinCase: [
      {
        applicationDate: "",
        applicationDetails:
          "Application for arrest and committal of Cabinet Secretary to civil jail",
        applicant: "KENYA UNION OF COMMERCIAL FOOD & ALLIED WORKERS",
        responseDetails: "",
        courtDecision: "Application to be served on respondents for hearing",
      },
    ],
  },
  factualBackground: [
    {
      fact: "Claimant seeks execution of a decree against the Government.",
      tag: "",
      description: "",
      source: "",
    },
    {
      fact: "Application for arrest and committal of Cabinet Secretary to civil jail for failure to satisfy the decree.",
      tag: "",
      description: "",
      source: "",
    },
  ],
  legalIssues: [
    {
      issue:
        "Whether the court can order the arrest and committal of a Cabinet Secretary to civil jail for failure to satisfy a decree against the Government.",
      type: "primary",
      relevantStatutes: ["Government Proceedings Act"],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments:
      "Cabinet Secretary should be arrested and committed to civil jail for failure to satisfy the decree.",
    defendantArguments: "",
    applicantArguments: "",
    respondentArguments: "",
  },
  evidence: {},
  courtAnalysis: {
    courtReasoning:
      "Doubtful if a Cabinet Secretary can be arrested for Government's failure to satisfy a decree; no precedent cited.",
    applicationOfLegalPrinciples: "",
    keyPrecedentsCited: [],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Application to be served on respondents",
    specificOrders: [
      "Application shall be served upon the Respondents",
      "Hearing date to be assigned after responses",
    ],
    costs: "",
    ruling:
      "Court requires service and hearing before deciding on the application.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {},
};
const populatedSchema8 = {
  caseDetails: {
    caseTitle:
      "In re Estate of Kombo Mulinge alias Bernard Mulinge Kombo (Deceased)",
    caseNumber: "SUCCESSION CAUSE 228 OF 2010",
    neutralCitation: "[2024] KEHC 14126 (KLR)",
    court: "HIGH COURT AT MACHAKOS",
    courtLocation: "Machakos",
    dateOfJudgment: "2024-11-14",
    judges: ["FR OLEL"],
    originalSourceFileURL: "https://new.kenyalaw.org",
    caseURL:
      "https://new.kenyalaw.org/akn/ke/judgment/kehc/2024/14126/eng@2024-11-14",
    caseType: "Succession",
  },
  partiesInvolved: {
    plaintiffs: [],
    defendants: [],
    applicants: [
      "REGINA NTHENYA KOMBO",
      "TECKLA KAVEKE KOMBO",
      "AGNES MUTINDA KOMBO",
      "ANNAH KATUNGE KOMBO",
    ],
    respondents: ["SOPHIA NDUKU KOMBO"],
    administrators: [
      "REGINA NTHENYA KOMBO",
      "TECKLA KAVEKE KOMBO",
      "AGNES MUTINDA KOMBO",
      "ANNAH KATUNGE KOMBO",
    ],
  },
  proceduralHistory: {
    consolidationDetails: "",
    keyProceduralSteps: [
      "Summons application filed on 18th April 2023",
      "Respondent filed replying affidavit on 21st July 2023",
      "Court considered pleadings and submissions",
    ],
    applicationsWithinCase: [
      {
        applicationDate: "2023-04-18",
        applicationDetails:
          "Application to compel respondent to hand over title deeds or issue duplicates",
        applicant: "Administrators",
        responseDetails: "Opposed by respondent citing pending appeal",
        courtDecision: "Application allowed with conditions",
      },
    ],
  },
  factualBackground: [
    {
      fact: "Administrators seek to compel respondent to hand over title deeds for distribution.",
      tag: "",
      description: "",
      source: "Application dated 18th April 2023",
    },
    {
      fact: "Respondent holds title deeds and has filed an appeal against the ruling.",
      tag: "",
      description: "",
      source: "Replying affidavit dated 21st July 2023",
    },
  ],
  legalIssues: [
    {
      issue:
        "Whether the court should compel the respondent to hand over the title deeds or issue duplicates.",
      type: "primary",
      relevantStatutes: [
        "Section 47 and 83 of the Law of Succession Act",
        "Rules 44(1) and 49 of the Probate and Administration Rules",
      ],
      description: "",
    },
    {
      issue:
        "Whether the court should hold the matter in abeyance pending the respondent's appeal.",
      type: "primary",
      relevantStatutes: [],
      description: "",
    },
  ],
  arguments: {
    plaintiffArguments: "",
    defendantArguments: "",
    applicantArguments:
      "Administrators need title deeds to complete distribution as per the grant.",
    respondentArguments:
      "Pending appeal and application for stay of execution.",
  },
  evidence: {},
  courtAnalysis: {
    courtReasoning:
      "Administrators have a duty to distribute the estate; respondent's appeal does not automatically stay proceedings.",
    applicationOfLegalPrinciples:
      "Court must balance the rights of both parties and ensure justice is not delayed.",
    keyPrecedentsCited: [
      {
        precedentName: "Suleiman vs. Amboseli Resort Limited [2004] 2 KLR 589",
        precedentSummary: "Court should opt for the lower risk of injustice.",
      },
    ],
    concurringAndDissentingOpinions: [],
    subsequentCases: [],
  },
  finalDecision: {
    disposition: "Application allowed with conditions",
    specificOrders: [
      "Respondent to deposit title deeds with the Deputy Registrar within 30 days",
      "If not complied, Lands Registrar to issue duplicates",
      "No transfer by transmission until appeal is determined",
      "Each party to bear own costs",
    ],
    costs: "Each party to bear own costs",
    ruling:
      "Administrators entitled to title deeds for distribution, but transfer stayed pending appeal.",
  },
  analysisAndImplications: {},
  amendments: {},
  caseTypeSpecific: {
    type: "Succession",
    details: {
      deceased: "Kombo Mulinge alias Bernard Mulinge Kombo",
    },
  },
};
