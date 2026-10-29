import { lessons } from "./lessons";

export type ProductSource = {
  label: string;
  url: string;
  /** Set when the official page is not in English. */
  lang?: "zh";
};

export type ProductTier = "consumer" | "developer" | "open-weights";

export type ProductGuide = {
  id: string;
  name: string;
  vendor: string;
  tier: ProductTier;
  summary: string;
  bestFor: string[];
  /** Product-specific differences described by the linked first-party documentation. */
  modelSpecific: string[];
  /** Controls the product documents, subject to plan and region. */
  controls: string[];
  caveats: string[];
  privacy: string;
  practice: string;
  checklist: string[];
  sources: ProductSource[];
  /** Set when a source could not be re-fetched by the automated link check. */
  sourceNote?: string;
  lastVerified: string;
  reviewDue: string;
  relatedLessonIds: string[];
};

const VERIFIED = "2026-10-28";
const REVIEW_DUE = "2027-01-28";

/**
 * Guides for specific products. Every factual claim about a product is linked to
 * first-party documentation in `sources`, and each guide carries a review window.
 * Transferable prompting principles live in the lessons; these pages only describe
 * where a product differs.
 */
export const productGuides: ProductGuide[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    tier: "consumer",
    summary: "OpenAI's chat assistant for writing, analysis, coding, and everyday questions, with web search, file upload, and project-style organisation depending on plan.",
    bestFor: ["General writing and editing", "Explaining and tutoring", "Drafting and brainstorming", "Light data and document questions"],
    modelSpecific: [
      "OpenAI's developer guide recommends stating the task clearly, giving context, separating instructions from data, and iterating on examples rather than writing one long prompt.",
      "The consumer help article frames the same idea for chat: be specific, give the model the background you would give a person, and refine the answer in follow-up messages.",
      "Instructions such as length, format, and tone are easier to check when you write them as constraints the answer must satisfy."
    ],
    controls: [
      "Custom instructions let you describe yourself and how you want answers written, so you stop repeating them.",
      "Projects or similar workspaces keep related conversations and instructions grouped, when available on your plan.",
      "Web search and file upload change what the model can know; check the cited sources when search is on."
    ],
    caveats: [
      "Model choice, features, limits, and interface locations vary by plan, region, and date.",
      "Answers are generated, not retrieved; a confident tone is not evidence."
    ],
    privacy: "Do not paste confidential, personal, or regulated data into any consumer AI tool unless your organisation has approved that tool and understands its data handling terms.",
    practice: "Ask for a five-bullet summary of a document you supply, for a named reader, with one caveat line, then check each bullet against the source text.",
    checklist: [
      "Did I state the task, the reader, and the constraint?",
      "Did I supply the source text instead of relying on the model's memory?",
      "Did I check every factual claim against the original?"
    ],
    sources: [
      { label: "OpenAI — Prompt engineering guide (developers.openai.com)", url: "https://developers.openai.com/api/docs/guides/prompt-engineering" },
      { label: "OpenAI Help Center — Prompt engineering best practices for ChatGPT", url: "https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt" }
    ],
    sourceNote: "OpenAI's help centre blocks automated fetches, so that link was confirmed through the vendor's search index rather than a direct request. Open it and confirm before relying on it.",
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["anatomy", "context", "evaluation"]
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    tier: "consumer",
    summary: "Anthropic's assistant, positioned around careful long-form writing, document work, and analysis, available in chat and through an API.",
    bestFor: ["Long documents and PDFs", "Careful long-form writing", "Structured extraction with explicit formats", "Step-by-step analysis"],
    modelSpecific: [
      "Anthropic's prompting best practices emphasise clarity, giving the model a clear role, using examples, structuring longer prompts, testing against success criteria, and considering whether prompting is even the right fix.",
      "Anthropic documents that prompt engineering is not always the best solution: sometimes the task needs different data, a different tool, or a human.",
      "The consumer help article recommends breaking complex requests into steps and iterating with follow-ups rather than front-loading everything."
    ],
    controls: [
      "Projects or similar workspaces keep instructions and documents scoped to a task, when available on your plan.",
      "Document upload lets you ask questions about supplied files; treat quoted claims as claims to verify.",
      "Custom style or instruction settings reduce repetition of routine preferences."
    ],
    caveats: [
      "Features and limits vary by plan, region, and date; check Anthropic's documentation for current behaviour.",
      "Long context does not mean perfect recall: important constraints are better restated near the end of a long prompt."
    ],
    privacy: "Check your plan's data-handling terms before uploading sensitive material; when in doubt, redact names, identifiers, and figures you are not permitted to share.",
    practice: "Give Claude a one-page brief with a required output structure, ask for a draft in that exact structure, and count how many structural requirements it actually met.",
    checklist: [
      "Is the required structure written out explicitly?",
      "Did I separate instructions from the document text?",
      "Did I verify quoted passages against the original file?"
    ],
    sources: [
      { label: "Anthropic — Prompt engineering overview", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview" },
      { label: "Anthropic — Prompting best practices", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices" },
      { label: "Claude Help Center — My prompt isn't giving me a helpful answer", url: "https://support.claude.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["anatomy", "context", "structured-output"]
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    tier: "consumer",
    summary: "Google's assistant across web, mobile, and Workspace surfaces, plus a developer API with grounding and search options.",
    bestFor: ["Everyday questions with web grounding", "Workspace documents and email", "Multimodal questions", "Developer applications"],
    modelSpecific: [
      "Google's prompt design strategies page organises good prompting around clear instructions, giving the model enough context, specifying what you want the output to look like, and giving examples.",
      "Google's own guidance recommends iterating: write, run, look at what went wrong, and change one thing.",
      "Where grounding or search is enabled, answers draw on retrieved material; the retrieved sources, not the prose, are what you should check."
    ],
    controls: [
      "Apps or similar containers hold custom instructions and reference material for a topic, when available.",
      "Search or grounding modes change whether answers come from live web material.",
      "File and email context can be pulled in when you grant access; review what is in scope before you do."
    ],
    caveats: [
      "Consumer and API features differ, and both change frequently; verify against Google's current documentation.",
      "Availability depends on plan, language, and region."
    ],
    privacy: "Granting an assistant access to mail, drive, or files broadens what it can read. Review scopes, and avoid granting access for a one-off task.",
    practice: "Ask for a comparison of two options you supply, in a table with a fixed set of columns, and check that every cell is supported by your inputs.",
    checklist: [
      "Did I name the columns and the decision the table supports?",
      "Was search or grounding on, and did I open the sources?",
      "Did I check cells that state a number or a date?"
    ],
    sources: [
      { label: "Google AI for Developers — Prompt design strategies", url: "https://ai.google.dev/gemini-api/docs/prompting-strategies" },
      { label: "Gemini Apps Help — Use Gemini Apps", url: "https://support.google.com/gemini/answer/13275745?hl=en" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["anatomy", "context", "few-shot"]
  },
  {
    id: "microsoft-copilot",
    name: "Microsoft Copilot",
    vendor: "Microsoft",
    tier: "consumer",
    summary: "Microsoft's assistant integrated with Windows, Bing, Microsoft 365, and enterprise deployments, often used inside Word, Excel, Teams, and Outlook.",
    bestFor: ["Drafting inside Office documents", "Meeting and email follow-ups", "Enterprise search across internal material", "Structured business writing"],
    modelSpecific: [
      "Microsoft's official guidance teaches a four-part prompt: goal, context, source, and expectations.",
      "Copilot in Microsoft 365 works inside your documents, mail, meetings, and files, so the quality of the retrieved internal material directly limits the answer.",
      "Enterprise deployments are configured by an administrator, so the same prompt can behave differently in two organisations."
    ],
    controls: [
      "Commercial data protection and tenancy settings determine where your prompts are processed; only your administrator knows your organisation's configuration.",
      "Grounding on internal sources such as SharePoint means answers depend on what has been shared with you.",
      "Prompt libraries and prompt engineering courses published by Microsoft show reusable patterns for workplace tasks."
    ],
    caveats: [
      "Copilot is not one product: the Windows, Bing, Microsoft 365, and standalone experiences differ in features and data handling.",
      "Licence, region, and administrator settings change what is available to you."
    ],
    privacy: "Work prompts stay inside your organisation's boundary only if your tenant is configured for it. Ask your administrator before pasting sensitive material.",
    practice: "Use the goal-context-source-expectations structure to draft a project update from notes you supply, then verify every owner and date against the notes.",
    checklist: [
      "Did I give goal, context, source, and expectations?",
      "Is every name and date traceable to my notes?",
      "Did I leave anything out that my organisation treats as confidential?"
    ],
    sources: [
      { label: "Microsoft Support — Get started writing prompts in Microsoft Copilot", url: "https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-writing-prompts-in-microsoft-365-copilot" },
      { label: "Microsoft Learn — Write effective prompts to achieve optimal results", url: "https://learn.microsoft.com/en-us/training/modules/write-effective-prompts-do-more-prompting/" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["anatomy", "context", "structured-output"]
  },
  {
    id: "perplexity",
    name: "Perplexity",
    vendor: "Perplexity",
    tier: "consumer",
    summary: "An answer engine built around web research, where responses arrive with numbered citations you can open and follow.",
    bestFor: ["Web research with citations", "Comparing sources on a topic", "Scoping a search across specific sites", "Quick orientation on an unfamiliar subject"],
    modelSpecific: [
      "Perplexity's help material describes answers being assembled from searched sources with numbered citations attached to claims.",
      "Source selection controls where it may look: the web, specific sites, or uploaded files, depending on your plan and product surface.",
      "Because citations are the point of the product, treat an uncited sentence as unsupported and open the cited ones."
    ],
    controls: [
      "Focus or source selection restricts the search to the web, specific domains, or your own files.",
      "Pro or enhanced search modes do more steps of research and may change how sources are chosen.",
      "Threads keep a line of questioning together so later questions inherit earlier context."
    ],
    caveats: [
      "The set of modes and their names change frequently; confirm current options in Perplexity's help centre.",
      "A citation shows where a statement came from, not that the statement is a fair reading of the source."
    ],
    privacy: "Uploaded files and internal knowledge connectors put your material into a third-party service; check the retention terms for your plan first.",
    practice: "Ask a question with an explicit scope and date range, then open three citations and mark which of them actually support your answer.",
    checklist: [
      "Did I state the scope, date range, and depth I wanted?",
      "Did I open the citations behind the claims I plan to use?",
      "Is any claim in my notes still uncited?"
    ],
    sources: [
      { label: "Perplexity Help Center — Practical tips for using Perplexity", url: "https://www.perplexity.ai/help-center/en/articles/10352971-practical-tips-for-using-perplexity" },
      { label: "Perplexity Help Center — How does Perplexity work", url: "https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work" }
    ],
    sourceNote: "Perplexity's help centre blocks automated fetches, so these links were confirmed through the vendor's search index rather than a direct request. Open them to confirm before relying on the details.",
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["context", "security", "evaluation"]
  },
  {
    id: "grok",
    name: "Grok",
    vendor: "xAI",
    tier: "consumer",
    summary: "xAI's assistant and API, used in the Grok apps and exposed through an API with chat, tool-calling, and structured output support.",
    bestFor: ["Real-time and conversational queries", "Coding assistance via API", "Structured output through an API", "Tasks that benefit from tool use"],
    modelSpecific: [
      "xAI's documentation describes API access through a Responses-compatible interface with model-specific reasoning controls.",
      "xAI publishes the system prompts used in its consumer product, which is a useful illustration of how much instruction a production assistant carries outside the user's message.",
      "As with every API, structured output is more reliable when you validate the response in code rather than trusting the request alone."
    ],
    controls: [
      "API-side configuration such as reasoning effort and tool definitions shapes behaviour more than clever wording does.",
      "Consumer app behaviour is separate from API behaviour and is not documented in the same place."
    ],
    caveats: [
      "Model names, capabilities, and prices change quickly; check docs.x.ai for current details.",
      "Consumer app features are not guaranteed to match API capabilities."
    ],
    privacy: "API traffic goes to xAI's servers; consumer app conversations follow that product's terms. Keep secrets out of prompts and logs.",
    practice: "Ask the API for a fixed JSON object from messy text, parse it, and record how often parsing fails before you change the prompt.",
    checklist: [
      "Am I validating the response in code?",
      "Did I record the model name and date for this test?",
      "What is my fallback when parsing fails?"
    ],
    sources: [
      { label: "xAI — Grok API documentation", url: "https://docs.x.ai/overview" },
      { label: "xAI — Generate text", url: "https://docs.x.ai/developers/model-capabilities/text/generate-text" },
      { label: "xAI — Grok assistant system prompts (GitHub)", url: "https://github.com/xai-org/grok-prompts" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["structured-output", "evaluation"]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    tier: "open-weights",
    summary: "A Chinese AI company that publishes open-weight models and runs a hosted API with an OpenAI- and Anthropic-compatible interface.",
    bestFor: ["Cost-conscious API workloads", "Open-weight model deployment", "Reasoning-oriented tasks", "Applications already written against the OpenAI SDK"],
    modelSpecific: [
      "DeepSeek's API documentation describes compatibility with OpenAI and Anthropic client libraries, so existing prompt code can usually be pointed at it with a base URL change.",
      "The docs recommend including the word 'json' in the request and supplying an example of the desired format when you want JSON output.",
      "Reasoning options are exposed as API parameters rather than prompt phrasing; check current parameter names in the docs before relying on them."
    ],
    controls: [
      "Base URL, model name, and reasoning parameters are configured in code, not in a chat interface.",
      "Both hosted API and self-hosted open-weight deployments exist, with different operational trade-offs."
    ],
    caveats: [
      "Model names and legacy-name mappings change between releases; the documentation records the current mapping.",
      "Availability of hosted services differs by region."
    ],
    privacy: "Self-hosting an open-weight model keeps data on your infrastructure; using the hosted API sends it to the provider. Choose deliberately and document which one a system uses.",
    practice: "Take a text-extraction task, request a fixed JSON shape, and measure the parse failure rate over ten inputs before and after adding an example.",
    checklist: [
      "Did I validate the JSON against a schema?",
      "Did I record which model version produced this output?",
      "Would self-hosting change my privacy position?"
    ],
    sources: [
      { label: "DeepSeek API docs — Your first API call", url: "https://api-docs.deepseek.com/" },
      { label: "DeepSeek API docs — JSON output guidance", url: "https://api-docs.deepseek.com/guides/json_mode/" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["structured-output", "evaluation"]
  },
  {
    id: "qwen",
    name: "Qwen (Tongyi)",
    vendor: "Alibaba",
    tier: "open-weights",
    summary: "Alibaba's Qwen model family, available as open weights and through Alibaba Cloud's Model Studio service.",
    bestFor: ["Chinese-language tasks", "Cloud deployments on Alibaba Cloud", "Open-weight self-hosting", "Multilingual applications"],
    modelSpecific: [
      "Alibaba Cloud publishes a prompt engineering guide for Model Studio covering prompt structure, examples, delimiters, and iteration.",
      "Documentation for Model Studio is published in Chinese, so budget time for translation if you do not read it.",
      "As an open-weight family, deployment settings and system prompts are under your control when you self-host."
    ],
    controls: [
      "Model selection, context settings, and system prompts are configured through Alibaba Cloud's Model Studio or your own deployment.",
      "Open weights can be fine-tuned or deployed privately, which shifts both cost and privacy responsibility onto you."
    ],
    caveats: [
      "Documentation and service availability differ between the Chinese and international Alibaba Cloud sites.",
      "Model naming changes between releases; check the current model list."
    ],
    privacy: "Self-hosting keeps prompts on your hardware; the hosted service does not. Confirm which one a given deployment uses before sending sensitive data.",
    practice: "Run one classification task with the same prompt across a hosted and a self-hosted configuration and record where the labels disagree.",
    checklist: [
      "Do I know which deployment I am sending to?",
      "Are the labels consistent across both runs?",
      "Did I record model and date for each run?"
    ],
    sources: [
      { label: "Alibaba Cloud Model Studio — Prompt engineering guide (Chinese)", url: "https://help.aliyun.com/zh/model-studio/prompt-engineering-guide", lang: "zh" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["few-shot", "structured-output"]
  },
  {
    id: "kimi",
    name: "Kimi",
    vendor: "Moonshot AI",
    tier: "open-weights",
    summary: "Moonshot AI's assistant and API, known for long-context handling and popular in Chinese-language writing and document tasks.",
    bestFor: ["Long Chinese documents", "Document Q&A", "Writing and rewriting tasks", "Long-context summarisation"],
    modelSpecific: [
      "Moonshot's prompt best-practice guide covers system and user prompts, roles, delimiters, examples, length expectations, and reference material.",
      "The guide is published in Chinese on platform.kimi.com, which is where the older platform.moonshot.cn address now points.",
      "Long context changes what you should emphasise: state the requirement clearly and repeat the most important constraint late in the prompt."
    ],
    controls: [
      "System and user messages are separate fields in the API; put standing instructions in the system message.",
      "File and knowledge-base features depend on the product surface you are using."
    ],
    caveats: [
      "Documentation is primarily in Chinese and product surfaces change; verify current behaviour.",
      "Consumer app and API behaviour are documented separately."
    ],
    privacy: "Hosted long-context document analysis means uploading the whole document. Redact what you are not permitted to share.",
    practice: "Supply a long document, ask five questions about it, and mark which answers you can trace to a specific paragraph.",
    checklist: [
      "Can I locate each answer in the source text?",
      "Did I separate instructions from document content?",
      "Was anything in that document confidential?"
    ],
    sources: [
      { label: "Kimi platform docs — Prompt best practice (Chinese)", url: "https://platform.kimi.com/docs/guide/prompt-best-practice", lang: "zh" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["context", "structured-output"]
  },
  {
    id: "glm",
    name: "GLM",
    vendor: "Zhipu AI (Z.AI)",
    tier: "open-weights",
    summary: "Zhipu AI's GLM model family, offered as open weights and through Z.AI and BigModel platform APIs.",
    bestFor: ["Chinese-language applications", "Open-weight deployment", "Agent-style tool use", "Cost-sensitive API workloads"],
    modelSpecific: [
      "Z.AI's developer documentation walks through authentication, model selection, and calls that use system and user messages.",
      "The former BigModel API address now redirects into Zhipu's Chinese documentation, so bookmark the current entry point.",
      "As an open-weight family, system prompts and sampling settings are yours to set when self-hosting."
    ],
    controls: [
      "Model choice and system prompts are set per request in the API.",
      "Open weights can run on your own infrastructure when licensing terms allow your use."
    ],
    caveats: [
      "Documentation is split across Z.AI (English) and BigModel (Chinese) entry points that move occasionally.",
      "Model versions and endpoints change between releases."
    ],
    privacy: "A hosted call sends your text to Zhipu; a self-hosted deployment does not. Record which one a system uses.",
    practice: "Send the same extraction prompt through a hosted call and a self-hosted one, then diff the outputs field by field.",
    checklist: [
      "Did I pin the model version for this comparison?",
      "Are both deployments handling the same inputs?",
      "Did I validate structured output in code?"
    ],
    sources: [
      { label: "Z.AI developer documentation — Quick start", url: "https://docs.z.ai/guides/overview/quick-start" },
      { label: "Zhipu BigModel API documentation (Chinese, redirects to current docs)", url: "https://open.bigmodel.cn/dev/api", lang: "zh" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["structured-output", "evaluation"]
  },
  {
    id: "minimax",
    name: "MiniMax",
    vendor: "MiniMax",
    tier: "open-weights",
    summary: "A Chinese AI company offering text, speech, and video models through a platform API and published open weights.",
    bestFor: ["Chinese-language generation", "Voice and multimodal pipelines", "Open-weight deployment", "High-volume API workloads"],
    modelSpecific: [
      "MiniMax's platform documentation describes text generation, model names, context limits, and examples using OpenAI- and Anthropic-compatible request formats.",
      "Because the API follows familiar request shapes, transferable prompt structure from other guides applies with minimal changes.",
      "Speech and video features are separate product surfaces with their own prompting conventions."
    ],
    controls: [
      "Model selection and context limits are documented per model in the platform docs.",
      "Open-weight releases let you run the text models yourself where the licence permits."
    ],
    caveats: [
      "Model list and context limits change between releases; confirm in the current docs.",
      "Product naming and documentation hosts have changed before, so verify links."
    ],
    privacy: "Hosted calls send text to MiniMax; self-hosted runs do not. Choose per workload and document the choice.",
    practice: "Ask for a fixed-format summary through the API, parse it, and log parse failures across a small batch of inputs.",
    checklist: [
      "Is the output parsed, not eyeballed?",
      "Did I pin the model name and date?",
      "Which deployment handled the data?"
    ],
    sources: [
      { label: "MiniMax platform docs — Text generation", url: "https://platform.minimax.io/docs/guides/text-generation" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["structured-output", "context"]
  },
  {
    id: "ernie",
    name: "ERNIE (Qianfan)",
    vendor: "Baidu",
    tier: "open-weights",
    summary: "Baidu's ERNIE models, accessed through the Qianfan platform with application, model, and agent tooling for Chinese-language work.",
    bestFor: ["Chinese-language applications", "Enterprise deployments in China", "Structured generation through an API", "RAG-style internal knowledge apps"],
    modelSpecific: [
      "Baidu's Qianfan API reference documents text generation with chat messages, a system role for standing instructions, and request parameters.",
      "System-role instructions carry the standing behaviour while the user message carries the task, which matches how other chat APIs are structured.",
      "Qianfan also exposes retrieval and tooling features, so some quality gains come from better retrieval rather than better wording."
    ],
    controls: [
      "System and user message roles are part of the request format.",
      "Platform-side retrieval and knowledge-base features are configured in the console."
    ],
    caveats: [
      "Documentation is published mainly in Chinese and product naming shifts between Baidu and Qianfan surfaces.",
      "Service availability depends on region and account type."
    ],
    privacy: "Enterprise and consumer endpoints have different data terms; confirm which one your application uses before sending personal data.",
    practice: "Structure one request with a system instruction and a user task, then compare against a single merged message to see what the separation changes.",
    checklist: [
      "Are standing instructions in the system role?",
      "Is the task in the user message only?",
      "Did I record which endpoint handled the request?"
    ],
    sources: [
      { label: "Baidu Qianfan API — Text generation reference (Chinese)", url: "https://cloud.baidu.com/doc/qianfan-api/s/3m7of64lb", lang: "zh" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["anatomy", "structured-output"]
  },
  {
    id: "hunyuan",
    name: "Tencent Hunyuan",
    vendor: "Tencent",
    tier: "open-weights",
    summary: "Tencent's Hunyuan model family, available through Tencent Cloud, with text, image, and other modalities documented separately.",
    bestFor: ["Chinese-language text tasks", "Tencent Cloud deployments", "Image generation with Chinese prompt conventions", "Enterprise integration inside Tencent Cloud"],
    modelSpecific: [
      "Tencent publishes a dedicated prompt guide for Hunyuan image generation with templates for subjects, scenes, and styles; it applies to images, not to chat text.",
      "The text-model quick start covers enabling the service and API access rather than a prompt tutorial, so transferable lessons carry most of the weight here.",
      "Some Hunyuan capabilities are documented as moving to other Tencent surfaces, so confirm where a feature now lives."
    ],
    controls: [
      "Access is configured through Tencent Cloud with API credentials and service enablement.",
      "Different modalities have separate endpoints and separate prompt conventions."
    ],
    caveats: [
      "Documentation pages are largely in Chinese and some have been relocated; verify current URLs.",
      "Feature migration between Tencent products can move documentation without notice."
    ],
    privacy: "Cloud API calls send content to Tencent Cloud. Check your contract's data terms before uploading internal material.",
    practice: "Take one text task and one image task, write the structure for each from the official guide, and note how differently the two are specified.",
    checklist: [
      "Am I following the guide for the right modality?",
      "Did I check where the feature is documented now?",
      "Does this content belong in a cloud service at all?"
    ],
    sources: [
      { label: "Tencent Cloud — Hunyuan image generation prompt guide (Chinese)", url: "https://cloud.tencent.com/document/product/1729/106530", lang: "zh" },
      { label: "Tencent Cloud — Hunyuan quick start (Chinese)", url: "https://cloud.tencent.com/document/product/1729/97730", lang: "zh" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["anatomy", "context"]
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    vendor: "GitHub / Microsoft",
    tier: "developer",
    summary: "An AI pair programmer that works inside editors, pull requests, and the command line, with instructions and prompt files you can keep in a repository.",
    bestFor: ["Writing and refactoring code", "Explaining unfamiliar code", "Generating tests from requirements", "Reviewing changes against a checklist"],
    modelSpecific: [
      "GitHub's prompt engineering guidance recommends being specific, supplying context, splitting a large request into steps, giving examples, iterating, and reviewing the result.",
      "Custom instructions can be defined at personal, repository, path, agent, and organisation levels, so the same request can produce different behaviour in different repositories.",
      "Prompt files provide reusable Markdown templates for recurring tasks, distinct from always-on instructions."
    ],
    controls: [
      "Custom instructions scope: personal, repository, path-specific, agent, and organisation levels.",
      "Prompt files in the repository version your prompting alongside your code.",
      "Model selection is available in supported clients, with different capabilities per model."
    ],
    caveats: [
      "Copilot features differ between editors, github.com, and Copilot CLI, and change frequently.",
      "Organisation-level settings are controlled by your administrator."
    ],
    privacy: "Generated code enters your repository; prompts may include proprietary code. Review your organisation's policy on which repositories and files are in scope.",
    practice: "Ask Copilot to implement one function against a written acceptance criterion, then run the tests you specified before accepting the change.",
    checklist: [
      "Did I state the acceptance criterion up front?",
      "Did I run the code?",
      "Does the change match our repository's instructions?"
    ],
    sources: [
      { label: "GitHub Docs — Prompt engineering for GitHub Copilot", url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/prompt-engineering" },
      { label: "GitHub Docs — Custom instructions for GitHub Copilot", url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/custom-instructions" },
      { label: "GitHub Docs — Prompt files for GitHub Copilot", url: "https://docs.github.com/en/copilot/concepts/prompting-and-context/prompt-files" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["decomposition", "evaluation", "security"]
  },
  {
    id: "mistral",
    name: "Mistral",
    vendor: "Mistral AI",
    tier: "open-weights",
    summary: "A European model provider offering hosted APIs, a Le Chat assistant, and open-weight models you can run yourself.",
    bestFor: ["European data-residency requirements", "Open-weight self-hosting", "Efficient hosted inference", "Structured and multilingual tasks"],
    modelSpecific: [
      "Mistral's prompting documentation covers how its models handle instructions, examples, and structured requests, including a cookbook page that works through prompting capabilities step by step.",
      "Mistral publishes both hosted and open-weight variants, so system prompts and parameters may differ from what a hosted chat product applies.",
      "Where a feature is model-specific, the docs name the model; do not assume a behaviour carries to every model in the family."
    ],
    controls: [
      "Model selection, response format, and sampling parameters are API-level controls.",
      "Open weights can be deployed in your own environment under the model's licence."
    ],
    caveats: [
      "Documentation paths have moved before; the current prompting guide lives under docs.mistral.ai/inference/prompting.",
      "Chat product features and API features are separate."
    ],
    privacy: "Hosted inference sends text to Mistral; self-hosting keeps it in your environment. Licensing terms govern what you may deploy.",
    practice: "Request a structured classification from one hosted model and one self-hosted model with the same prompt and compare the confusion points.",
    checklist: [
      "Did I name the exact model for this test?",
      "Are outputs validated by code, not by eye?",
      "Which deployment saw the data?"
    ],
    sources: [
      { label: "Mistral Docs — Prompting", url: "https://docs.mistral.ai/inference/prompting" },
      { label: "Mistral Docs — Prompting capabilities cookbook", url: "https://docs.mistral.ai/resources/cookbooks/mistral-prompting-prompting_capabilities" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["few-shot", "structured-output"]
  },
  {
    id: "llama",
    name: "Llama",
    vendor: "Meta",
    tier: "open-weights",
    summary: "Meta's openly released Llama model family, downloaded and run by anyone under Meta's licence, in hosted services or on your own hardware.",
    bestFor: ["Self-hosted and private deployments", "Fine-tuning for a specific task", "Cost control at scale", "Research and experimentation"],
    modelSpecific: [
      "Meta documents the chat prompt format for each Llama release, including the system message and turn formatting the model was trained to expect.",
      "Following the documented prompt format matters more for open weights than for hosted chat, because there is no product layer repairing your formatting.",
      "Licence terms, acceptable use, and distribution rules accompany the weights and are updated between releases."
    ],
    controls: [
      "You choose the runtime, system prompt, and sampling settings when you self-host.",
      "Fine-tuning and quantisation change behaviour and quality; record them with your results."
    ],
    caveats: [
      "Prompt formats are model-generation specific; check the format document for the exact model you run.",
      "Licence terms have changed between releases and constrain commercial use in some cases."
    ],
    privacy: "Self-hosting is the main privacy argument for Llama: prompts never leave your infrastructure. Operational security becomes your responsibility.",
    practice: "Take a prompt written for a hosted assistant, convert it to the documented Llama format, and note what had to change to get equivalent output.",
    checklist: [
      "Am I using the prompt format for this model version?",
      "Did I record quantisation and runtime with my results?",
      "Have I checked the licence for my use case?"
    ],
    sources: [
      { label: "Meta Llama — Prompt format documentation (GitHub)", url: "https://github.com/meta-llama/llama-models/blob/main/models/llama4/prompt_format.md" }
    ],
    lastVerified: VERIFIED,
    reviewDue: REVIEW_DUE,
    relatedLessonIds: ["structured-output", "security"]
  }
];

export function findProductGuide(id: string): ProductGuide | undefined {
  return productGuides.find((guide) => guide.id === id);
}

export function isReviewDue(guide: ProductGuide, today: string = VERIFIED): boolean {
  return guide.reviewDue <= today;
}

export function validateProductGuides(): string[] {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const errors: string[] = [];
  const ids = new Set<string>();
  const hosts = ["openai.com", "anthropic.com", "claude.com", "google", "microsoft.com", "github.com", "perplexity.ai", "x.ai", "deepseek.com", "aliyun.com", "kimi.com", "moonshot.cn", "z.ai", "bigmodel.cn", "minimax", "baidu.com", "tencent.com", "mistral.ai", "meta-llama"];
  for (const guide of productGuides) {
    if (!guide.id.trim() || ids.has(guide.id)) errors.push("Guide IDs must be non-empty and unique: " + guide.id);
    ids.add(guide.id);
    if (!guide.name.trim() || !guide.vendor.trim() || !guide.summary.trim()) {
      errors.push("Guide " + guide.id + " needs a name, vendor, and summary.");
    }
    if (guide.sources.length === 0) errors.push("Guide " + guide.id + " must link at least one first-party source.");
    for (const source of guide.sources) {
      if (!source.url.startsWith("https://")) errors.push("Guide " + guide.id + " has a source without https: " + source.url);
      else if (!hosts.some((host) => source.url.includes(host))) {
        errors.push("Guide " + guide.id + " source is not on a known first-party domain: " + source.url);
      }
    }
    if (!guide.lastVerified || !guide.reviewDue || guide.reviewDue <= guide.lastVerified) {
      errors.push("Guide " + guide.id + " needs a last-verified date and a later review-due date.");
    }
    if (guide.modelSpecific.length === 0 || guide.practice.trim() === "" || guide.checklist.length === 0) {
      errors.push("Guide " + guide.id + " needs product notes, a practice scenario, and a review checklist.");
    }
    for (const lessonId of guide.relatedLessonIds) {
      if (!lessonIds.has(lessonId)) errors.push("Guide " + guide.id + " references unknown lesson " + lessonId);
    }
  }
  return errors;
}
