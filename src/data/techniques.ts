export type TechniqueSource = { label: string; url: string };
export type Technique = {
  id: string;
  title: string;
  category: "Iteration" | "Composition" | "Evaluation" | "Structure" | "Graph reasoning" | "Reliability";
  level: "Foundation" | "Intermediate" | "Advanced";
  summary: string;
  whenToUse: string[];
  tradeoffs: string[];
  steps: string[];
  example: string;
  sources: TechniqueSource[];
  tags: string[];
};

const openAI = { label: "OpenAI — Prompt engineering", url: "https://developers.openai.com/api/docs/guides/prompt-engineering" };
const openAIFlywheel = { label: "OpenAI Cookbook — Evaluation flywheel", url: "https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel" };
const anthropicBest = { label: "Anthropic — Claude prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" };
const anthropicAgents = { label: "Anthropic — Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents" };
const googlePrompting = { label: "Google AI — Prompt design strategies", url: "https://ai.google.dev/gemini-api/docs/prompting-strategies" };
const graphThoughts = { label: "Besta et al. — Graph of Thoughts (AAAI 2024)", url: "https://ojs.aaai.org/index.php/AAAI/article/view/29720" };

export const techniques: Technique[] = [
  {
    id: "prompt-anatomy",
    title: "Structured prompt anatomy",
    category: "Structure",
    level: "Foundation",
    summary: "Separate task, context, examples, input, constraints, and output contract so each requirement is visible and testable.",
    whenToUse: ["The task has multiple requirements", "Several people maintain the prompt", "Output structure matters"],
    tradeoffs: ["Too many sections add noise to simple tasks", "A prompt cannot enforce security or guarantee valid output on its own"],
    steps: ["State the task in a direct verb", "Add only relevant context and input", "Specify constraints and missing-data behavior", "Define an output shape", "Validate strict outputs in application code"],
    example: "Task: Extract the event date.\nInput: {{document}}\nConstraints: Do not infer a date that is absent.\nOutput: Return JSON with date as ISO YYYY-MM-DD or null.",
    sources: [openAI, anthropicBest],
    tags: ["clear instructions", "schema", "output format"]
  },
  {
    id: "zero-shot",
    title: "Zero-shot prompting",
    category: "Structure",
    level: "Foundation",
    summary: "Give a clear task and input without worked examples, then test it against representative cases.",
    whenToUse: ["The task is familiar and clearly scoped", "The output labels are simple", "You need a baseline"],
    tradeoffs: ["Ambiguous labels may be interpreted inconsistently", "Complex formats may need examples or constrained decoding"],
    steps: ["Define the expected action", "State allowed outputs", "Include one representative input", "Score a fixed test set before adding complexity"],
    example: "Classify this review as positive, neutral, or negative. Return only one label. Review: {{review}}",
    sources: [openAI, googlePrompting],
    tags: ["baseline", "classification"]
  },
  {
    id: "few-shot",
    title: "Few-shot examples",
    category: "Structure",
    level: "Intermediate",
    summary: "Demonstrate the intended mapping or format with a small number of representative input-output examples.",
    whenToUse: ["Labels have subtle distinctions", "Output style is hard to describe", "Examples clarify edge cases"],
    tradeoffs: ["Poor examples can teach the wrong pattern", "Examples consume context and may introduce incidental bias"],
    steps: ["Choose diverse, high-signal cases", "Keep labels and output formats consistent", "Include an important boundary case", "Test with examples that were not shown in the prompt"],
    example: "Review: 'Arrived early and works well.' -> positive\nReview: 'Stopped after a day.' -> negative\nReview: 'Works, shipping was slow.' -> mixed\nReview: {{review}} ->",
    sources: [openAI, anthropicBest, googlePrompting],
    tags: ["examples", "few shot"]
  },
  {
    id: "prompt-chaining",
    title: "Sequential prompt chaining",
    category: "Composition",
    level: "Intermediate",
    summary: "Split a larger task into explicit stages whose outputs become the next stage's inputs.",
    whenToUse: ["Intermediate results need inspection", "Steps have different constraints", "A single prompt is difficult to debug"],
    tradeoffs: ["Adds latency and more failure points", "Early mistakes can propagate downstream"],
    steps: ["Define each stage's contract", "Keep each stage focused", "Validate critical intermediate results", "Log provenance and test the whole chain"],
    example: "Stage 1: Extract claims and source passages.\nStage 2: Validate that every claim is supported by a passage.\nStage 3: Summarize only validated claims.",
    sources: [anthropicAgents, googlePrompting],
    tags: ["chain", "pipeline", "decomposition"]
  },
  {
    id: "iterative-refinement",
    title: "Iterative refinement loop",
    category: "Iteration",
    level: "Intermediate",
    summary: "Draft, evaluate against explicit criteria, and revise within a finite iteration budget.",
    whenToUse: ["Quality criteria can be made explicit", "An initial draft is useful", "Intermediate revisions can be inspected"],
    tradeoffs: ["More iterations cost time and compute", "A model's critique can be wrong or reinforce its own mistakes", "Improvement is not guaranteed"],
    steps: ["Generate a first draft", "Evaluate using deterministic checks where possible", "Return specific failures, not vague advice", "Refine against the failed criteria", "Stop on success, cancellation, or a hard limit"],
    example: "Draft a concise answer. Check that it contains a date in ISO format. If it fails, revise only the date field. Stop after at most 3 attempts and show the final check result.",
    sources: [anthropicBest, openAIFlywheel],
    tags: ["looped prompting", "self correction", "bounded iteration"]
  },
  {
    id: "evaluation-flywheel",
    title: "Evaluation flywheel",
    category: "Evaluation",
    level: "Advanced",
    summary: "Use fixed examples to expose failure patterns, change one thing, and re-run the same evaluation to detect regressions.",
    whenToUse: ["A prompt is reused in an application", "Changes must be compared", "Quality failures can be represented as cases"],
    tradeoffs: ["A narrow dataset can overstate quality", "Exact match is inappropriate for many free-form tasks"],
    steps: ["Create a representative versioned test set", "Record a baseline", "Inspect failed cases", "Make a targeted change", "Re-run the same cases and report task-appropriate metrics"],
    example: "Compare Prompt A and Prompt B on the same versioned cases. Report per-case outcomes and exact-match rate only for fields with deterministic expected values.",
    sources: [openAIFlywheel, openAI],
    tags: ["regression", "benchmark", "test set"]
  },
  {
    id: "parallel-aggregate",
    title: "Parallel branches and aggregation",
    category: "Composition",
    level: "Advanced",
    summary: "Run independent sub-tasks on the same input, then combine their outputs with an explicit merge strategy.",
    whenToUse: ["Sub-tasks are independent", "Independent perspectives add value", "A merge rule can be defined"],
    tradeoffs: ["Parallel work consumes more resources", "Branches can conflict or duplicate work", "Aggregation can hide disagreement"],
    steps: ["Split only independent work", "Name each branch output", "Run branches with bounded concurrency", "Preserve branch provenance", "Aggregate and validate the combined output"],
    example: "Branch A extracts dates. Branch B extracts people. Branch C extracts locations. Merge their JSON objects and validate the final schema.",
    sources: [anthropicAgents, googlePrompting],
    tags: ["fan out", "map reduce", "parallel"]
  },
  {
    id: "conditional-routing",
    title: "Conditional routing",
    category: "Composition",
    level: "Advanced",
    summary: "Choose a workflow branch using a declared condition rather than one prompt trying to handle every case.",
    whenToUse: ["Inputs fall into clear categories", "Different paths need different handling", "A deterministic predicate is available"],
    tradeoffs: ["Bad routing rules send work down the wrong branch", "Overly complex branches are hard to maintain"],
    steps: ["Define mutually clear routes", "Prefer deterministic predicates when possible", "Add a fallback route", "Test boundary and unknown cases"],
    example: "If input is valid JSON, route to field extraction. If it is plain text, route to parsing. Otherwise route to a human-review step.",
    sources: [anthropicAgents],
    tags: ["router", "branching", "condition"]
  },
  {
    id: "structured-delimiters",
    title: "Tagged sections and delimiters",
    category: "Structure",
    level: "Intermediate",
    summary: "Separate instructions, examples, retrieved documents, and user-provided data with explicit boundaries.",
    whenToUse: ["Prompts contain several content types", "Long context must remain readable", "Untrusted content must be clearly identified"],
    tradeoffs: ["Tags do not neutralize prompt injection", "Excessive nesting can make prompts harder to inspect"],
    steps: ["Choose clear section names", "Label untrusted material as data", "Keep instructions outside quoted content", "Enforce permissions and validation in code"],
    example: "<task>Summarize the supplied document.</task>\n<untrusted_document>{{document}}</untrusted_document>\n<output>Three bullets with source caveats.</output>",
    sources: [anthropicBest, openAI],
    tags: ["XML", "delimiters", "context"]
  },
  {
    id: "graph-workflow",
    title: "Graph workflow prompting",
    category: "Graph reasoning",
    level: "Advanced",
    summary: "Represent application steps as nodes and dependencies as edges, with explicit branch, merge, validation, and bounded-loop semantics.",
    whenToUse: ["Work has parallel or conditional stages", "A visual trace improves debugging", "Different steps need different contracts"],
    tradeoffs: ["A graph adds design and execution complexity", "Cycles must be bounded and have observable stop conditions", "A workflow graph is not automatically a reasoning algorithm"],
    steps: ["Define typed node inputs and outputs", "Connect dependencies", "Validate reachability and control flow", "Run deterministic steps first", "Trace branches, errors, and final output"],
    example: "Input -> Router -> [Summarize | Extract fields] -> Merge -> Schema check -> Output",
    sources: [anthropicAgents, googlePrompting],
    tags: ["graph prompting", "workflow", "DAG", "control flow"]
  },
  {
    id: "graph-of-thoughts",
    title: "Graph of Thoughts (research concept)",
    category: "Graph reasoning",
    level: "Advanced",
    summary: "A research framework that represents generated reasoning units as graph vertices and their dependencies as edges, allowing aggregation and refinement.",
    whenToUse: ["Studying graph-structured reasoning research", "Comparing chains, trees, and graph-based search", "Designing a research experiment"],
    tradeoffs: ["Not equivalent to a visual workflow editor", "Can require substantial orchestration and evaluation", "Published results do not generalize automatically to every task/model"],
    steps: ["Read the paper's problem formulation", "Identify the state represented by each vertex", "Specify allowed transformations and aggregation", "Define search limits and a baseline", "Reproduce the evaluation before making performance claims"],
    example: "Represent candidate partial solutions as vertices; edges describe refinement or combination. A search policy chooses which candidates to expand under a fixed budget.",
    sources: [graphThoughts],
    tags: ["GoT", "research", "reasoning graph"]
  },
  {
    id: "provider-portability",
    title: "Provider-aware, portable prompting",
    category: "Reliability",
    level: "Intermediate",
    summary: "Separate transferable prompt design principles from model-specific behavior and validate changes against the chosen runtime.",
    whenToUse: ["Moving prompts between models", "Comparing model releases", "Maintaining a provider-neutral prompt library"],
    tradeoffs: ["Model behavior and supported controls differ", "A prompt that works on one model may need adjustment on another"],
    steps: ["Store the prompt independently of a provider SDK", "Tag model-specific advice with its source", "Run the same fixed test set", "Compare failure cases and task-appropriate metrics", "Keep findings scoped to the tested model/runtime"],
    example: "Record prompt version, model/runtime identifier, generation settings, dataset version, and per-case results before comparing outputs.",
    sources: [openAI, anthropicBest, googlePrompting],
    tags: ["portability", "cross model", "model evaluation"]
  }
];

export const techniqueCategories = ["All", ...Array.from(new Set(techniques.map((item) => item.category)))];
