export type Lesson = { id: string; category: string; title: string; summary: string; minutes: number; level: string; sections: Array<{ heading: string; body: string; example?: string; takeaway?: string }> };

export const lessons: Lesson[] = [
 { id: "anatomy", category: "Foundations", title: "Anatomy of a useful prompt", summary: "Separate task, context, input, constraints, and desired output.", minutes: 6, level: "Foundation", sections: [
  { heading: "Start with the task", body: "Lead with the concrete action: classify, summarize, extract, explain, transform, or compare. Vague verbs and hidden requirements make output harder to evaluate.", example: "Task: Summarize the report for a technical reader in five bullets." },
  { heading: "Add relevant context", body: "Explain who the output is for, what the input represents, and which facts matter. More context is not automatically better; irrelevant material can distract from the task." },
  { heading: "Make constraints observable", body: "Replace 'make it good' with checkable constraints: word limits, required fields, allowed labels, source requirements, or a clear audience." },
  { heading: "Specify the output", body: "Define the structure and include a schema or example when exact formatting matters. Validate machine-readable output in code.", takeaway: "A prompt is a specification. Good specifications make success easier to recognize." }
 ]},
 { id: "zero-shot", category: "Core techniques", title: "Zero-shot prompting", summary: "Give a clear instruction without examples, then evaluate the result.", minutes: 4, level: "Foundation", sections: [
  { heading: "When it fits", body: "Use zero-shot prompting for clear tasks with a relatively simple output space." },
  { heading: "Keep the first attempt simple", body: "State the task, provide input, define important constraints, and request an explicit format.", example: "Classify the review as positive, neutral, or negative. Return only the label. Review: 'Shipping was late, but the product works.'" },
  { heading: "Measure before adding complexity", body: "Test representative cases. For systematic failures, determine whether examples, context, clearer labels, or deterministic code would help." }
 ]},
 { id: "few-shot", category: "Core techniques", title: "Few-shot prompting", summary: "Use examples to communicate a desired pattern or output.", minutes: 5, level: "Intermediate", sections: [
  { heading: "Choose informative examples", body: "Represent normal cases and meaningful edge cases. Near-identical examples can consume context without clarifying a useful distinction." },
  { heading: "Keep formats consistent", body: "Examples should use the same labels, delimiters, and output shape expected for new input.", example: "Review: 'Arrived early and works well.' -> positive\nReview: 'Stopped after one day.' -> negative\nReview: 'Works, but shipping was slow.' -> mixed" },
  { heading: "Watch for accidental bias", body: "Models may imitate incidental wording or infer the wrong pattern. Test alternate phrasings and examples." }
 ]},
 { id: "structured-output", category: "Reliability", title: "Request structured output", summary: "Define fields, types, allowed values, and missing-value behavior.", minutes: 6, level: "Intermediate", sections: [
  { heading: "Write a small schema", body: "Specify field names, types, required properties, allowed labels, and null behavior. Avoid ambiguous requests such as 'return some JSON'." },
  { heading: "Validate separately", body: "Well-written prompts can still produce malformed output. Parse and validate output in application code; do not treat a prompt as a security boundary.", example: "Return JSON with sentiment (positive|neutral|negative), evidence (array of strings), and confidence (number from 0 to 1)." }
 ]},
 { id: "decomposition", category: "Advanced techniques", title: "Task decomposition", summary: "Split brittle workflows into verifiable stages.", minutes: 7, level: "Advanced", sections: [
  { heading: "Identify independent stages", body: "Break work into steps with explicit inputs and outputs, such as extract facts, verify references, then summarize verified facts." },
  { heading: "Validate intermediate results", body: "A chain can amplify early mistakes. Check important outputs and preserve provenance so guesses are not mistaken for facts." },
  { heading: "Compare with a baseline", body: "Chaining increases latency and complexity. Use it when measured quality or control improves enough to justify the costs." }
 ]},
 { id: "evaluation", category: "Evaluation", title: "Evaluate prompts empirically", summary: "Use representative test cases and explicit scoring, not intuition alone.", minutes: 7, level: "Intermediate", sections: [
  { heading: "Create a small test set", body: "Include typical examples, boundary cases, ambiguity, malformed input, and adversarial attempts. Hold cases fixed when comparing prompt versions." },
  { heading: "Choose task-specific metrics", body: "Classification might use precision and recall; extraction might use exact match or field correctness. Human review can assess nuanced qualities." },
  { heading: "Track reproducibility", body: "Record prompt version, model/runtime, configuration, dataset, and scoring method.", takeaway: "One impressive example does not prove a prompt is effective." }
 ]},
 { id: "security", category: "Safety and security", title: "Prompt injection and trust boundaries", summary: "Treat user input and retrieved content as untrusted data.", minutes: 6, level: "Advanced", sections: [
  { heading: "Instructions and data can conflict", body: "Documents may contain malicious instructions. Delimit untrusted content, but never assume delimiters prevent attacks." },
  { heading: "Enforce policy outside the prompt", body: "Use authorization checks, scoped tools, allowlists, output validation, and human approval for high-impact actions." },
  { heading: "Minimize exposure", body: "Do not put secrets in prompts, logs, URLs, or browser bundles. Make network behavior visible to users." }
 ]},
 { id: "context", category: "Beyond prompting", title: "Context engineering", summary: "Curate the information available to a model, not just the instruction.", minutes: 8, level: "Advanced", sections: [
  { heading: "Choose context deliberately", body: "Documents, history, tool output, and memory compete for token budget. Select relevant sources and remove stale or duplicate material." },
  { heading: "Preserve provenance", body: "Distinguish source facts, generated interpretations, and open questions. Keep source identifiers for important claims." },
  { heading: "Measure context quality", body: "Evaluate retrieval relevance separately from answer correctness. A good prompt cannot fix missing or incorrect source material." }
 ]}
];
export const categories = ["All", ...Array.from(new Set(lessons.map((lesson) => lesson.category)))];