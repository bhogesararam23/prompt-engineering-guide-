# Prompt Engineering Guide — Learning-First Product Roadmap

**Status:** Product direction and implementation roadmap  
**Research snapshot:** 24 October 2026  
**Primary product goal:** Teach people how to write, evaluate, adapt, and safely use prompts—not to become another chatbot, prompt generator, or AI-tools directory.

This document is the source of truth for the product direction. It supersedes the previous feature-first sequence where workflow tooling could appear to be the product itself. Existing tools can remain useful, but the learning experience comes first.

---

## 1. Product thesis

### The product we are building

**A clear, trusted, practical field guide to prompt engineering across tasks, professions, and AI products.**

A learner should be able to arrive with a real need—write a better report, analyze a spreadsheet, learn a difficult concept, research a topic, debug code, prepare a presentation, or use a particular AI product—and leave understanding:

1. What type of prompting problem they have.
2. Which prompting pattern is appropriate, and why.
3. How to write a first prompt.
4. How to judge the response instead of accepting it blindly.
5. How to revise the prompt when the output fails.
6. Which parts transfer to other models and which depend on a specific product.
7. What information should not be shared, and what risks need human review.

The main outcome is **learner competence**, not the number of prompt templates copied, tools clicked, pages published, or AI responses generated.

### What we are not trying to be

- Not a general-purpose AI chatbot.
- Not primarily a prompt generator or prompt marketplace.
- Not a wrapper around a hosted LLM API.
- Not a directory of hundreds of shallow “ultimate prompts.”
- Not a news site whose content expires every week.
- Not an API-development course disguised as beginner prompt engineering.
- Not a claim that one universal prompt formula works equally well for every model and task.
- Not an SEO content farm or a website filled with auto-generated near-duplicate pages.
- Not a certificate provider until we can assess learning outcomes credibly.

The existing Prompt Lab, local-model option, workflow builder, and evaluation bench may stay as **optional practice and advanced study areas**. They must not dominate the navigation or delay the core curriculum.

### Product promise

“Learn why prompts work, when they fail, how to improve them, and how to adapt them to the AI you use.”

Do not promise guaranteed accuracy, a magic prompt, or universal model behavior. Modern model products change, prompt effects vary by task, and some problems cannot be fixed by prompting alone.

---

## 2. Competitive research: what already exists

This is a representative benchmark of major resources, courses, official documentation, and search/monetization guidance reviewed on 24 October 2026. It is not a claim that every prompt-engineering website on the internet has been examined. The point is to map the competitive landscape and choose a real product gap rather than recreate an existing guide.

### 2.1 Direct learning resources

| Resource | Observed strength | What this means for our product |
|---|---|---|
| [Learn Prompting](https://learnprompting.org/docs/introduction) | Broad, accessible curriculum from basics through advanced techniques, reliability, image prompting, prompt hacking, and tooling. It also offers courses, community, and certification products. | Do not compete by merely adding more definitions. Be especially strong at navigable learning paths, task-based learning, company-specific adaptation, clearly reviewed examples, and visible evidence quality. |
| [Prompt Engineering Guide / promptingguide.ai](https://www.promptingguide.ai/introduction) and the [DAIR.AI repository](https://github.com/dair-ai/Prompt-Engineering-Guide) | Broad reference coverage of techniques, research, terminology, and practical applications. | Build a usable learning system from the material: a consistent taxonomy, prerequisite paths, beginner explanations, practice, and clear links between techniques and real tasks. A reference library alone is not the complete product experience. |
| [The Prompt Report](https://arxiv.org/abs/2406.06608) | Systematic literature survey with a vocabulary and taxonomy of prompting methods, including text and multimodal methods. It is a useful research map, not a beginner course. | Use research taxonomies to keep the curriculum comprehensive, but translate concepts into plain language and teach limitations. Cite research rather than copying its terminology without context. |
| [DataCamp — Understanding Prompt Engineering](https://www.datacamp.com/courses/understanding-prompt-engineering) | Short, structured course with exercises, progress, and examples for beginner and business use. | Lessons should include an activity and a feedback rubric—not only reading. Make it possible to learn one concept quickly while also offering a coherent path to mastery. |
| [DeepLearning.AI — ChatGPT Prompt Engineering for Developers](https://www.deeplearning.ai/courses/chatgpt-prompt-eng/) | Concise, hands-on developer course with code examples and application-oriented exercises. | Preserve a separate advanced/developer track, but do not make Python, APIs, or model deployment prerequisites for the core audience. |
| [OpenAI Academy](https://academy.openai.com/) and its [AI Foundations course](https://academy.openai.com/public/courses/ai-foundations-juzjs?autoEnroll=true) | Practical learning organized around audiences and workplace tasks, including prompting, review, and repeatable workflows. This is a major adjacent competitor, not merely a technical documentation site. | Teach habits and complete work scenarios. Do not copy first-party course content or rely on the assumption that official resources will stay narrow. Make cross-provider comparison and independent editorial synthesis a differentiator. |
| [Microsoft Learn — effective prompts for Copilot](https://learn.microsoft.com/en-us/training/modules/write-effective-prompts-do-more-prompting/) | Role- and product-specific learning, structured learning objectives, assessments, and guidance tied to a changing product experience. | Our company guides need dates, product/plan caveats, current primary sources, and real tasks. Never present all AI products as if their context or controls are identical. |

### 2.2 Official product documentation

- [OpenAI prompting guide](https://developers.openai.com/api/docs/guides/prompting) and [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering): structure, context, examples, prompt iteration, and evaluation. The API-focused guidance is valuable but should not be treated as a substitute for teaching ordinary users.
- [Anthropic prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview): emphasizes success criteria, empirical testing, task fit, and the fact that prompt engineering is not always the best way to solve a problem.
- [Google AI prompting strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies): includes examples, iteration, grounding, and model-family-specific advice.
- [Microsoft Learn prompt module](https://learn.microsoft.com/en-us/training/modules/write-effective-prompts-do-more-prompting/): teaches a context/goal/source/expectations framing in a specific Copilot setting.

**Implication:** the company-specific section must be treated as living documentation, while the foundations should remain useful when a product UI or model changes. Company-specific claims must link to first-party sources and show when the page was last verified.

### 2.3 What the research suggests

The market already contains comprehensive guides, short interactive courses, advanced technical courses, product documentation, and professional AI training. Merely publishing more prompt examples is not meaningful differentiation.

The opportunity for this site is to combine the strengths of those categories in a deliberately learning-first experience:

1. **Technique → task → job-to-be-done:** explain the underlying idea, then show which tasks it helps with and where it may fail.
2. **One concept, multiple products:** teach the transferable principle before showing product-specific differences.
3. **Before/after with diagnosis:** show what changed in a prompt, why that change was made, how to assess the output, and when the improvement would not generalize.
4. **A curriculum rather than a pile of articles:** guide learners from novice to practitioner, with optional routes for knowledge workers and developers.
5. **Evidence and limitations:** label official guidance, research findings, editorial recommendations, and illustrative examples differently.
6. **A maintained reference:** record sources, owners, review dates, product-version caveats, and change history.
7. **Real workplace and study scenarios:** use realistic inputs, constraints, privacy considerations, and review steps—not only toy questions.
8. **Tool-independent first principles:** a learner should still benefit if they use a different model or have no paid account.

These are product hypotheses to validate with learners, not a claim that no existing site does any of them.

---

## 3. Positioning and target audiences

### Primary audience for the first release

**Non-technical and semi-technical people who regularly use AI assistants and want more reliable results.**

Examples: students, educators, researchers, office workers, analysts, founders, writers, marketers, managers, and professionals trying to improve routine work.

The beginner path should not require a model API key, subscription, programming experience, or account on our website.

### Secondary audiences

1. **Practitioners:** people already using AI who want advanced techniques, verification habits, and model-specific guidance.
2. **Developers and technical users:** prompt design in applications, structured output contracts, multi-step workflows, evaluation, prompt injection, and model behavior.
3. **Teams and educators:** reusable learning paths, lesson links, exercises, team training material, and clear guidance on safe use.

### Audience jobs-to-be-done

- “I know what I want, but I do not know how to ask the AI clearly.”
- “The output is generic, wrong, too long, or in the wrong format.”
- “I need to use AI for a work task without leaking confidential data.”
- “I use ChatGPT, Claude, Gemini, Copilot, or Perplexity and need to understand what changes between them.”
- “I have learned some prompt tricks, but I do not know which technique to select.”
- “I need to check whether a prompt actually improved the result.”
- “I am responsible for reviewing AI-assisted work and need a repeatable method.”

The homepage and information architecture should lead from these tasks rather than from internal feature names.

---

## 4. The information architecture

The product should feel like a professional learning publication with a clear curriculum—not a dashboard that happens to contain articles.

### Recommended top-level navigation

1. **Learn** — structured beginner, intermediate, and advanced learning paths.
2. **Prompt Techniques** — the searchable technique encyclopedia.
3. **By Task** — practical guides for a specific job to be done.
4. **By Role** — role-based learning paths for students, educators, researchers, analysts, developers, marketers, managers, and others.
5. **AI Product Guides** — maintained guides for specific company/product families.
6. **Practice** — optional exercises, Prompt Lab, saved progress, and advanced workflow/evaluation experiments.
7. **Glossary** — precise, short definitions linked to lessons.
8. **About & Editorial Standards** — mission, sourcing policy, authors/reviewers, corrections, feedback, privacy, and contact.

Do not launch every section as a top-level destination if it has almost no useful content. Use progressive disclosure: publish only when each section has a coherent first set of pages.

### Homepage requirements

The homepage should help a new visitor answer, within a few seconds:

- What this site teaches.
- Where to start if they are new.
- How to find a lesson for a task they need to complete now.
- How to compare AI products.
- Why they should trust the explanations and how they are sourced.

Proposed content order:

1. Short value proposition and “Start learning” route.
2. Task finder prompt: “What are you trying to do?” with curated links, not a mandatory chatbot.
3. Three learning routes: Beginner, Better at Everyday Work, Advanced/Technical.
4. Featured core techniques with clear reading-time and level labels.
5. A practical before/after case study showing both a prompt and an evaluation rubric.
6. Product-specific guides with last-reviewed dates.
7. Editorial trust links and a restrained newsletter option only if it can be maintained.

Avoid a hero dominated by a prompt generator, a fake conversation interface, unsupported performance percentages, or a large grid of shallow prompt cards.

### Implementation status — 26 October 2026

- [x] Homepage task finder: eight curated, deterministic job-to-lesson routes with a brief recommendation and rationale; no chatbot or model call is required.
- [x] Automated checks verify task IDs, lesson references, distinct coverage, and browser navigation from a task card into its lesson.
- [ ] Add coherent Beginner, Everyday Work, and Advanced/Technical learning paths with prerequisites and progression criteria.
- [ ] Add reviewed task-specific worked cases with weak/better prompt comparisons and explicit assessment rubrics.
- [ ] Add maintained AI product guides with first-party sources and last-reviewed metadata.

The task finder is a navigation layer over the current eight lessons, not a claim that the full task library or role-based curriculum is complete.

### Standard lesson page

Every lesson should use a consistent structure:

- Clear title that describes what the learner will learn.
- Who it is for, required knowledge, level, and reading/practice time.
- Learning objectives.
- Short explanation and the problem the technique solves.
- A deliberately weak or underspecified example.
- A better-structured version, with each meaningful change explained.
- A complete worked example using realistic, non-sensitive sample data.
- A section on when the technique is useful—and when it is not.
- Common failure modes and how to diagnose them.
- A small practice task.
- A feedback rubric or answer explanation.
- Model/product caveats where material.
- Further reading and links to related lessons.
- Author/reviewer, sources, last-reviewed date, and a correction/feedback link.

Never require an embedded LLM to view or complete the lesson. An optional local-model experiment may be provided, but it must not be the only way to learn.

---

## 5. Curriculum architecture

Organize content in several connected dimensions. A single flat tag list is not enough.

### Dimension A — Learner level

- **Foundation:** no technical prerequisites; clear task specification and basic prompt improvement.
- **Working practitioner:** combining techniques, managing context, checking results, and using multi-step tasks.
- **Advanced practitioner:** structured outputs, complex decomposition, iterative workflows, evaluation design, safety, and specialized prompting.
- **Technical/research:** application prompts, system/developer/user instruction boundaries where relevant, structured schemas, retrieval-grounded prompting, advanced research techniques, and reproducible evaluation.

The labels describe prerequisite knowledge, not the user's intelligence or professional status.

### Dimension B — Technique taxonomy

Use the taxonomy in [The Prompt Report](https://arxiv.org/abs/2406.06608) and other current research as a research map. Build a curated, readable selection first; do not attempt to transcribe every named technique into equally important lessons. Many technique names overlap, depend on an older model behavior, or need careful caveats.

#### Core prompt construction
- Task definition and success criteria.
- Clear, direct instructions.
- Role or perspective framing, with limits explained.
- Relevant context and audience.
- Constraints, priorities, and explicit exclusions.
- Input/output separation and delimiters.
- Output structure: headings, bullets, tables, JSON/schema requests where supported.
- Length, tone, reading level, language, and style constraints.
- Clarifying questions and missing-information handling.
- Examples and counterexamples.

#### Example-based and instruction techniques
- Zero-shot prompting.
- One-shot and few-shot prompting.
- Selecting diverse, representative examples.
- Instruction hierarchy and conflict resolution.
- Reusable prompt templates with explicit variables.
- Positive instructions versus negative constraints.
- Output priming and structured format requests, where the model supports them.

#### Reasoning and decomposition patterns
- Task decomposition.
- Prompt chaining.
- Plan-then-execute patterns where appropriate.
- Compare-and-choose.
- Self-critique and targeted revision.
- Multiple-candidate generation and selection.
- Self-consistency/ensembling concepts with cost and error-correlation caveats.
- Branching and aggregation.
- Graph-based research concepts.
- Bounded iteration and stop conditions.

Teach these as methods for structuring work, not as magic phrases that guarantee reasoning quality. Do not encourage requests for hidden internal reasoning as a universal best practice; prefer concise explanations, explicit checks, intermediate artifacts, and verifiable results appropriate to the task.

#### Grounding, retrieval, and long context
- Supplying reference documents and excerpts.
- Asking the model to distinguish source evidence from inference.
- Citation requests and verification of citations.
- Summarizing and querying long documents.
- Context selection and ordering.
- Handling conflicting or stale sources.
- When external search, a calculator, a database, or another specialized tool is more appropriate than prompt wording alone.

#### Output control and task patterns
- Summarization.
- Classification and tagging.
- Extraction.
- Transformation and translation.
- Rewriting and editing.
- Ideation and divergent exploration.
- Comparison and decision support.
- Structured report generation.
- Code explanation, code review, debugging, and test generation.
- Tables and spreadsheet assistance.
- Teaching/tutoring, Socratic questioning, and self-testing.
- Research synthesis and source comparison.
- Planning and project execution.

#### Reliability and evaluation
- Defining pass/fail criteria before changing a prompt.
- Rubric-based review.
- Representative test cases and edge cases.
- Regression tests for prompt changes.
- Normalized exact match versus semantic measures.
- Error analysis and failure categories.
- Model and model-version comparisons.
- Human review for high-impact uses.
- Recognizing when a better prompt cannot compensate for missing data, model limitations, or a task that needs a deterministic system.

#### Security, privacy, and responsible use
- Sensitive-data minimization.
- Prompt injection and untrusted retrieved content.
- Conflicting instructions and malicious documents.
- Personal and organizational data boundaries.
- High-stakes decisions and human accountability.
- Bias, representativeness, and inclusive evaluation.
- Copyright, attribution, and provenance considerations.
- Safe handling of outputs that may be wrong but sound confident.

#### Multimodal prompting
Create distinct branches, with their own examples and limitations, for:
- Image understanding and visual question answering.
- Image generation and editing.
- Audio transcription, analysis, and generation.
- Video understanding and generation.
- Mixed inputs such as text plus image/document/audio.

Multimodal guidance must describe the specific model/product context. Do not assume the same prompt syntax or capabilities across image, audio, video, and text products.

### Dimension C — Intended task

Every technique page should connect to one or more actual tasks. Learners should be able to find a method from their goal without knowing a technical term.

### Dimension D — AI product/vendor

The product guide explains where a transferable principle intersects with a particular product's instructions, UI, context sources, files, memory, tools, or limitations. It should not duplicate the general lesson verbatim.

### Dimension E — Domain/role

Role pages combine a learning path, safe use cases, examples, required review practices, and links into the technique/task/product dimensions.

---

## 6. Foundational learning path: first priority

Before publishing a large encyclopedia, turn the current introductory material into a coherent course. Each module needs learning objectives, a worked example, a practice task, and a way to check understanding.

### Module 1 — What prompting is (and is not)
- What an AI language model and prompt are, explained without assuming technical background.
- Difference between a one-shot request, a multi-turn conversation, and instructions/context that persist in a particular product.
- Why outputs vary; why confidence in wording is not evidence of correctness.
- What prompt engineering can improve, and what it cannot solve.
- Diagnostic exercise: identify what is missing from an unclear request.

**Exit gate:** learner can explain the task, inputs, expected output, and limits in plain language.

### Module 2 — State the job clearly
- Start with the action and the desired outcome.
- Specify the target audience and purpose.
- Distinguish the task from background information.
- Replace vague adjectives with observable requirements.
- Add examples, constraints, and priorities only when they affect success.

**Exit gate:** learner can rewrite a vague prompt into a specific instruction and explain why each change matters.

### Module 3 — Provide useful context
- What information the model needs and what it does not need.
- Supply source material instead of assuming the model knows private or current facts.
- Define ambiguous terms.
- Separate instructions, data, and examples.
- Handle long or conflicting context.

**Exit gate:** learner can decide what context to include, omit, or verify.

### Module 4 — Specify the answer
- Format, structure, length, tone, style, audience, language.
- Tables, lists, headings, and structured fields.
- Schemas and strict structured output: explain that ordinary prompting may not guarantee schema validity where a product does not enforce it.
- Ask for a useful acknowledgement of uncertainty or missing information.

**Exit gate:** learner can write a prompt with an inspectable output contract and test whether it was followed.

### Module 5 — Show examples when they help
- Zero-shot versus one-shot versus few-shot prompting.
- Good, bad, incomplete, and edge-case examples.
- Why examples can clarify style and structure but can also overfit or bias results.
- How to keep examples consistent with instructions.

**Exit gate:** learner can choose whether examples are warranted for a given task.

### Module 6 — Improve a result methodically
- Inspect the first response against the stated requirements.
- Classify the failure before changing the prompt.
- Add missing context, sharpen a constraint, provide an example, or split the task—one meaningful change at a time.
- Compare two prompt versions against the same input.
- Stop iterating when additional changes do not help.

**Exit gate:** learner can explain the failure, change one relevant part of a prompt, and compare outcomes honestly.

### Module 7 — Verify instead of trusting
- Check facts, calculations, dates, citations, code, and extracted fields with appropriate sources or tools.
- Distinguish evidence, assumptions, inferences, and creative suggestions.
- Know when an output requires expert review.
- Avoid treating the model as an independent verifier of its own answer.

**Exit gate:** learner can create a simple verification checklist for a real task.

### Module 8 — Privacy, safety, and professional judgment
- What not to paste into a consumer service without permission and an understanding of its data handling.
- How to redact or minimize input data.
- Bias and impact considerations.
- Prompt injection basics for documents and retrieved content.
- How to disclose AI assistance and keep a human accountable.

**Exit gate:** learner can identify common data and safety risks in a scenario.

The complete foundation should remain usable without a paid subscription, API, code, local model download, or account on our site.

---

## 7. Task library: teach a prompt for a real job

Develop pages around task outcomes rather than just “100 best prompts.” Each guide should include the decision about whether AI is appropriate, a minimal prompt, a more complete prompt, a failure example, improvement steps, review criteria, privacy notes, and related techniques.

### Writing and communication
- Email drafting and replies.
- Tone adjustment for a specific audience.
- Shortening and clarifying prose.
- Reports, executive summaries, and briefs.
- Outlines, proposals, and meeting follow-ups.
- Editing without changing intended meaning.
- Translation and localization with human review.

### Research and knowledge work
- Build a research question and search plan.
- Compare source documents.
- Extract evidence from provided material.
- Synthesize multiple documents without mixing claims.
- Produce a source-backed briefing.
- Generate questions for an expert interview.
- Distinguish discovery, synthesis, and fact verification.

### Learning and teaching
- Explain at a chosen level.
- Tutor through questions instead of simply revealing an answer.
- Generate practice questions with answer explanations.
- Design a revision plan from a syllabus.
- Check understanding and uncover misconceptions.
- Create lesson plans and rubrics.
- Use AI as a study aid without outsourcing the learning task.

### Analysis and data
- Turn a question into an analysis plan.
- Explain a table or dataset.
- Draft spreadsheet formulas and explain them.
- Classify records with defined labels.
- Extract structured fields from text.
- Summarize trends without inventing causality.
- Request assumptions, units, caveats, and validation steps.

### Programming and technical work
- Explain unfamiliar code.
- Reproduce and narrow a bug.
- Generate tests from requirements.
- Review a patch against an explicit checklist.
- Document an API or design.
- Ask for alternatives and trade-offs.
- Verify outputs by running tests; a plausible patch is not proof of correctness.

### Business operations
- Standard operating procedures.
- Process mapping and process improvement.
- Project briefs, risks, milestones, and status updates.
- Meeting preparation and action-item extraction.
- Customer-support response drafts and triage classification.
- Internal knowledge-base synthesis.
- Management reporting with source and approval requirements.

### Marketing, sales, and product
- Audience research with evidence boundaries.
- Positioning alternatives and messaging drafts.
- Content briefs and campaign variants.
- Product requirement drafts and user stories.
- Interview synthesis from supplied notes.
- Sales discovery preparation and follow-up drafting.
- Competitive analysis with explicit source/date coverage.

### Specialized professional contexts
Publish carefully scoped guides for HR/recruiting, finance, law/compliance, healthcare, and other sensitive domains. These must focus on low-risk assistance, data handling, documentation, and mandatory human review—not automated hiring, diagnosis, investment decisions, legal conclusions, or other high-impact decision-making.

For every domain, be explicit about permitted input, expected review, and what the model must not decide autonomously.

### Content rule for the task library

Start with a small number of deeply worked scenarios, then expand using learner requests and evidence from site search. Do not generate hundreds of generic pages simply to fill a category.

---

## 8. AI product/company-specific guides

These guides are a major planned differentiator, but they are also the content most likely to become stale. Maintain fewer accurate guides rather than a wide set of abandoned pages.

### Tier 1 — First-party consumer assistants
1. **ChatGPT / OpenAI**
2. **Claude / Anthropic**
3. **Gemini / Google**
4. **Microsoft Copilot**
5. **Perplexity**

Each guide should cover, when applicable and officially documented:
- What this product is suited for and what it is not.
- How to communicate tasks and output expectations.
- How to provide context, documents, and examples.
- Product-specific controls such as project/custom instructions, memory, web search, files, or other available features.
- How to ask for source citations and then check them.
- Prompting patterns that transfer from other tools.
- Product/model behaviors that need special handling.
- Relevant plan or version caveats.
- Data and privacy considerations.
- A short practice scenario and review checklist.
- Primary-source links, date last checked, author/reviewer, and change notes.

Do not promise that feature availability, usage limits, model behaviors, or UI locations are universal across plans or countries. Mark uncertain or plan-specific information clearly.

### Tier 2 — Developer-focused products
After the consumer guides are accurate and useful, add GitHub Copilot and selected coding assistants as task-focused guides. Teach instructions, repository context, acceptance criteria, testing, patch review, and secure coding practices. Keep tool setup steps separate from transferable prompting principles.

### Tier 3 — Visual and multimodal products
Add product-specific image, video, audio, and design workflows only after the site has a well-organized multimodal curriculum. Examples might cover major image-generation and creative products, but every product must earn inclusion through user demand and reliable primary-source documentation.

### Company-guide maintenance contract
Every company guide must have:
- A named editorial owner.
- A last-verified date.
- A link to the relevant official source documentation.
- A scope statement: product, model family, plan/region caveats where relevant.
- A way to report a stale claim.
- A change history for material updates.
- A scheduled review and an event-triggered review when the provider changes relevant behavior or documentation.

Expired reviews should trigger a visible “review due” state for maintainers. Do not silently change dates to make stale pages look current.

---

## 9. Role-based learning paths

Create these after the fundamentals and task library have real coverage.

### Knowledge worker
A short path covering writing, summarization, document review, meeting follow-ups, analysis, data privacy, and verification.

### Student and lifelong learner
Explaining concepts, tutoring, self-testing, research support, revision, citation verification, and academic-integrity considerations.

### Educator
Lesson preparation, activity design, rubric creation, differentiating explanations, feedback drafts, privacy, and avoiding fabricated citations.

### Researcher and analyst
Research questions, source synthesis, evidence extraction, uncertainty, reproducibility, data privacy, and defensible claims.

### Software developer
Requirements, code context, bug diagnosis, tests, code review, design alternatives, secure coding, and model/tool-specific coding guidance.

### Manager and team lead
Briefs, stakeholder updates, meeting preparation, scenario analysis, decision memos, and review workflows.

### Founder and operator
Customer discovery synthesis, product specs, support processes, marketing drafts, planning, and decision records.

### Marketing, sales, and customer support
Audience/task context, voice, variants, response quality, escalation, approval, and privacy constraints.

Each path should state what the learner will be able to do at the end, prerequisite lessons, estimated effort, a capstone task, and a transparent self-assessment. Avoid claiming certification or professional proficiency simply because someone opened a set of pages.

---

## 10. Practice and assessment: learning, not an LLM product

The current Prompt Lab and workflow/evaluation features are optional supporting tools. Preserve the useful pieces, but make the learning content the primary experience.

### Practice formats, in order of value

1. **Diagnosis exercises:** choose what is missing from a prompt and explain why.
2. **Rewrite exercises:** improve a prompt against clear criteria.
3. **Technique selection:** choose an appropriate technique for a scenario, including cases where a simpler prompt is best.
4. **Failure analysis:** diagnose why a response failed a requirement.
5. **Output evaluation:** score an example answer against a declared rubric.
6. **Prompt comparison:** inspect two prompt versions and identify substantive changes.
7. **Scenario capstone:** design a prompt, define success, and create a verification plan for a realistic task.
8. **Optional local experimentation:** users may choose to run a compatible local model, but no learner should have to download model weights or use a hosted provider to finish the core course.

### Feedback without relying on AI calls

A good exercise should provide a deterministic or expert-authored explanation:
- State the criterion.
- Show the evidence in the learner's response.
- Explain what is missing or ambiguous.
- Offer a hint, then a worked example.
- Tell the learner when different answers may be valid.

Do not equate exact text match with conceptual understanding. Use exact-match checks only for exercises that truly require a specific answer. For open-ended prompt writing, use a rubric with examples and explicit criteria.

### Progress and retention

Initially keep progress, bookmarks, and preferences local to the browser. Do not introduce accounts, remote profile storage, background synchronization, or a mandatory analytics backend merely to record course completion.

Later, if real learners request cross-device progress or cohort use, evaluate the privacy, account-security, maintenance, and cost implications before implementation.

---

## 11. Editorial and research operating system

Content quality is a product capability. A large content inventory without ownership, citations, review dates, and correction workflows will become less trustworthy over time.

### Page metadata

Every article should have structured editorial metadata, either frontmatter or typed data:
- Stable content ID and canonical slug.
- Title, summary, and learning objective.
- Level, prerequisites, and estimated reading/practice time.
- Content type and primary category.
- Technique IDs, task IDs, relevant roles, and product/vendor tags.
- Author and reviewer, where known.
- Created and materially-updated dates.
- Last content verification date.
- Source list, including primary-source links.
- Evidence type: official guidance, peer-reviewed/research source, editorial synthesis, or illustrative example.
- Model/product scope and caveats if applicable.
- Related pages and a correction/feedback route.
- Review cadence or next review date.

### Editorial standards

Every substantial article must:
1. Solve a clear learner problem.
2. Define unfamiliar terms on first use.
3. Explain the “why,” not only provide a copyable prompt.
4. Include a worked example and a realistic limitation/failure mode.
5. Cite primary sources for company-specific or time-sensitive claims.
6. Separate established findings from rules of thumb and editorial recommendations.
7. Avoid fabricated examples presented as measured results.
8. Avoid unsupported percentages such as “this prompt improves accuracy by 80%.”
9. Explain privacy and review risks where the scenario warrants them.
10. Link to relevant prior/next lessons, not just an external tool.
11. Be reviewed for accessibility, reading clarity, and factual accuracy.
12. Be open to correction by readers.

### Example and benchmark integrity

If the site publishes a claim that prompt A works better than prompt B:
- Define the task and pass criteria before testing.
- Keep the input and scoring rubric fixed.
- Identify the product/model and version when known, plus test date and relevant settings.
- Include representative and edge-case inputs.
- Separate qualitative examples from measured evidence.
- Show failures as well as successes.
- Avoid generalizing from one response or one model to every provider.
- Make the experiment reproducible to the extent possible.
- Remove or qualify conclusions when the underlying product changes.

A prompt that produces a nicer-looking example is not automatically a more accurate or robust prompt.

### Review cadence

Suggested starting policy:
- Core principles: full review at least annually and when research changes materially.
- Company/product guides: review at least quarterly and when provider changes make a page materially stale.
- Security, privacy, and risk guides: review at least quarterly and when major authoritative guidance changes.
- Tutorials tied to a UI: review whenever the UI/control they describe changes.
- Glossary and taxonomy: review alongside major curriculum releases.

These are maintenance targets, not promises that every detail can be checked in real time. Display dates honestly.

---

## 12. Visual and interaction quality

The site should look and feel like a serious editorial learning product:
- Clear typography and comfortable long-form reading width.
- A deliberate hierarchy for title, key idea, example, caveat, exercise, sources, and next lesson.
- Consistent code/prompt examples with copy support that does not obscure the explanation.
- Table of contents for long pages, useful breadcrumbs, and strong related-content links.
- Keyboard-first navigation, visible focus, accessible labels, semantic headings, adequate contrast, reduced-motion support, and screen-reader testing.
- Responsive layouts for low-width mobile devices and slower connections.
- Good loading states and useful behavior without JavaScript-heavy interactions where practical.
- Print-friendly lesson views for educators and teams.
- No intrusive pop-ups, fake loading interactions, or forced sign-ups before reading.
- Ads, if later introduced, must not resemble navigation or interrupt an exercise at the moment it requires attention.

### Information architecture and rendering

Do not migrate frameworks only for fashion. First audit how the existing React/Vite site renders and how search crawlers and assistive technology access lesson content. Every public lesson needs its own stable URL, descriptive title, crawlable content, canonical URL where appropriate, internal links, sitemap coverage, and sensible not-found behavior.

If the current client-rendered architecture does not reliably deliver those requirements, evaluate static generation or pre-rendering for public lesson content. Keep dynamic practice components isolated where possible. Choose the simplest architecture that meets content, accessibility, performance, and maintenance needs.

Follow Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) for discoverability, but do not build the curriculum around keyword counts or search-volume speculation.

---

## 13. Search, discovery, and organic growth

Organic search is a distribution channel, not the editorial purpose.

### Search experience inside the site
- Search titles, summaries, main text, and tags.
- Filters for level, technique, task, role, modality, and AI product.
- Helpful empty states and suggested broader topics.
- Synonyms for ordinary language and technical terms.
- Pages for core concepts, not a separate thin page for every keyword permutation.
- A “start here” path for learners who do not know which term to search.

### Public search readiness
- Unique, human-readable URLs and titles.
- Descriptive summaries and headings.
- Semantic HTML; content must not exist only in images or decorative canvas elements.
- Internal links with useful anchor text.
- Sitemap, robots rules, canonical behavior, valid redirects, and custom not-found pages.
- Mobile usability, performance monitoring, and avoidance of unnecessary third-party scripts.
- Structured data only where accurate and supported by the actual page type; no fabricated ratings, reviews, credentials, or course completion claims.
- Search Console and privacy-respecting analytics only if they provide a clear benefit and are configured appropriately.
- An original editorial point of view, real examples, and corrections—not mass-produced paraphrases of official documentation.

See [Google's people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). It explicitly asks whether a page adds original value and satisfies its audience rather than merely summarizing other sites or producing many pages for search traffic.

### Distribution that builds a durable reputation
- Publish clear and useful beginner lessons first.
- Share specific worked examples and case studies, each linking back to the deeper lesson.
- Invite educators and practitioners to review material.
- Offer a lightweight newsletter only after a sustainable publication rhythm exists.
- Contribute useful corrections or examples to communities without spamming links.
- Build relationships with educators, developer communities, and organizations that could use the curriculum.
- Keep changelogs when guides materially change.

Do not buy traffic before measuring whether visitors learn. Do not fabricate authors, testimonials, organization logos, backlinks, or usage statistics.

---

## 14. Monetization strategy: later, carefully

The site should be worth visiting without ads. Monetization comes after the public learning experience has enough original, useful content and professional navigation.

### Stage 1 — Trust and content quality first
Before ads:
- Publish substantive foundational lessons and coherent paths.
- Complete About, Editorial Standards, Contact/Corrections, Privacy, and Terms pages appropriate to the actual site.
- Confirm ownership, HTTPS, crawlability, mobile experience, and policy compliance.
- Review copyrights, source licenses, example inputs, and any third-party assets.
- Ensure the public site does not rely on empty placeholder pages, fake course listings, or mass-generated pages.
- Check the actual requirements and state of the AdSense program before applying.

Google's [AdSense readiness guidance](https://support.google.com/adsense/answer/12176698?hl=en) states that a site needs enough valuable content, a good user experience, and navigational elements. It does not promise approval at a particular page count, and this roadmap should not invent a numerical guarantee.

### Stage 2 — Respectful advertising, if accepted
- Use only a small number of clearly identifiable placements.
- Keep ads away from buttons, lesson navigation, copy controls, quiz answers, and download links.
- Never design content to generate accidental clicks.
- Do not add ads to pages with too little original value.
- Check the current [AdSense Program policies](https://support.google.com/adsense/answer/48182?hl=en), privacy/consent requirements applicable to visitors, and the actual publisher setup.
- Measure retention and course completion as well as revenue; never optimize for clicks at the expense of learning.

### Stage 3 — Diversify only after demand is demonstrated
Possible later options:
- Paid in-depth courses or structured team learning packs.
- Clearly disclosed sponsorships for relevant educational material.
- Workshops for educators or organizations.
- Voluntary support or a paid professional resource bundle.
- Institutional training or a curriculum license, where requested and legally supported.

Do not build all of these before the core site is useful. Do not promise revenue, treat affiliate recommendations as independent editorial judgment, or put basic learning behind a paywall just to monetize early traffic.

---

## 15. Product and editorial metrics

The north-star metric should represent **successful learning**, not page views alone.

### Learner success
- Percentage of pilot learners who can complete the core path.
- Improvement between an initial prompt-diagnosis task and a comparable final task using the same rubric.
- Exercise completion and re-attempt patterns.
- Learner reports that they can explain why a prompt change was useful.
- Returns to continue a learning path.
- Helpful/unhelpful feedback and qualitative learner interviews.

For open-ended work, use a transparent rubric and human review in pilot studies. Do not claim general learning gains from a tiny or self-selected sample.

### Content quality
- Percentage of articles with sources, metadata, examples, failure modes, and review dates.
- Number of overdue company-guide reviews.
- Reader corrections and time to resolve them.
- Broken internal/external links and stale product UI instructions.
- Accessibility and mobile defects discovered and resolved.

### Product health
- Successful navigation/search to a useful lesson.
- Search queries that return no helpful results.
- Page performance and error rates.
- Lesson completion, not just page visits.
- Clear separation between learning-page analytics and optional practice-tool usage.

### Business health, only after launch
- Returning readers and direct visits.
- Search traffic quality and engaged reading.
- Newsletter opt-in/retention, if offered.
- Advertising revenue and user-experience effects, if ads are approved.
- Cost and maintenance hours per updated content cluster.

Avoid vanity dashboards. Every metric needs a decision it helps make.

---

## 16. Phased implementation roadmap and exit gates

Phases are ordered by dependencies, not promises of exact calendar dates. Do not start later phases simply because the calendar says so; move forward when the exit gate is met.

### Phase 0 — Re-center the product (first)

**Goal:** make the learning-site direction the default for every design and engineering decision.

Work:
- Audit every existing route, component, lesson, technique card, and current tool.
- Mark each item as: learning core, supporting practice, developer-only, release-critical, redundant, or defer.
- Freeze expansion of the workflow builder and generator until the learning MVP and content experience pass their gates.
- Interview a small, varied set of actual target learners; observe how they search for answers and where they get stuck.
- Test the current content with people who are genuinely new to prompting, not only the maintainer.
- Write the product promise, target audience, non-goals, and design principles into the repository.
- Make the roadmap in this document the source of truth, and move engineering-only follow-up items to a supporting technical backlog.

Deliverables:
- Content and feature inventory.
- Short research notes from learner interviews.
- Sitemap/information architecture.
- Priority list with explicit “not now” decisions.

**Exit gate:** the team can explain in a few sentences who the primary learner is, what learning outcome the site provides, and why each major existing feature supports that purpose.

### Phase 1 — Content architecture and professional information design

**Goal:** make the site easy to navigate, read, and maintain before adding breadth.

Work:
- Establish top-level navigation and URL conventions.
- Design reusable layouts for lessons, technique pages, task guides, company guides, paths, and glossary entries.
- Define the article metadata schema and editorial standards.
- Separate public content pages from optional practice tools in navigation.
- Build breadcrumbs, tables of contents, related lessons, prerequisites, level/time labels, and clear “next step” links.
- Audit responsive layouts, keyboard navigation, focus states, headings, and screen-reader semantics.
- Audit rendering/crawlability and decide whether pre-rendering/static generation is needed for the content pages.
- Create useful loading, empty, error, and not-found states.
- Keep pages fast and avoid new dependencies unless they unlock a validated requirement.

Deliverables:
- Approved sitemap and page templates.
- Reusable content metadata and validation rules.
- Accessibility checklist and initial defect list.
- Stable canonical URL and redirect plan.

**Exit gate:** a first-time learner can reach the right lesson from the homepage, navigate between lessons, and read the complete lesson on a phone and with a keyboard.

### Phase 2 — Publish a genuinely strong foundation course

**Goal:** turn the current introductory learning material into a coherent path with practical outcomes.

Work:
- Deliver Modules 1–8 in Section 6, with worked examples and practice exercises.
- Add diagnostics for common beginner problems: vague goals, missing context, conflicting requirements, unsupported facts, and unclear output format.
- Build answer explanations and feedback rubrics for knowledge checks.
- Link each module to relevant glossary concepts and technique entries.
- Run a pilot with novice learners and revise lessons from observed confusion.
- Ensure no module requires an account or a hosted model.

Deliverables:
- Complete beginner path.
- Eight lesson pages with clear exit gates.
- Practice and answer-explanation content.
- Pilot feedback report and revision changelog.

**Exit gate:** novice learners can complete the path without maintainer help and can demonstrate a measurable improvement on a defined prompt-writing task. Report the pilot's sample size and limitations.

### Phase 3 — Build the core technique encyclopedia

**Goal:** provide depth without overwhelming readers with a giant undifferentiated list.

Work:
- Start with the core technique groups in Section 5.
- Create canonical definitions and stable technique IDs.
- For every technique, write the problem it addresses, mechanism in plain language, example, trade-offs, failure modes, prerequisites, and related methods.
- Include “use this when” and “do not assume this helps when” guidance.
- Map each technique to tasks and relevant company guides.
- Check the taxonomy against [The Prompt Report](https://arxiv.org/abs/2406.06608) and current primary-source guidance.
- Merge synonyms and explain terminology disagreements rather than publishing duplicate pages for every name.
- Include advanced techniques only where evidence and learning value justify a separate page.

Suggested publication order:
1. Instruction clarity, context, constraints, output format.
2. Zero-shot, few-shot, examples, and delimiters.
3. Iteration, critique, decomposition, and chaining.
4. Grounding, citations, long context, and verification.
5. Evaluation, reliability, and prompt failure diagnosis.
6. Security and privacy.
7. Advanced research techniques and multimodal prompting.

**Exit gate:** learners can search a task or concept, find a clear explanation, and understand how the technique relates to at least one adjacent method. Every published entry meets the editorial checklist.

### Phase 4 — Launch the “By Task” library

**Goal:** support learners who arrive with a job to complete rather than a technique name to learn.

Work:
- Start with the highest-frequency tasks surfaced in learner interviews and site search.
- Publish a small set of deeply worked scenarios across writing, summarization, research, learning, analysis, and work communication.
- Add data, code, presentation, customer support, marketing, sales, project operations, and other professional task families in evidence-driven order.
- Include safe-use notes where inputs could contain personal, client, company, or regulated information.
- Build cross-links from tasks to the techniques and foundation lessons that explain the underlying principles.
- Use a common rubric for examples, not a collection of unrelated copy-paste prompts.

**Exit gate:** a learner can move from “I need to do this task” to a sound prompt, knows how to assess the output, and can find the supporting lesson.

### Phase 5 — Maintain company/product guides

**Goal:** explain how general prompting principles translate to specific AI products.

Work:
- Launch the first-tier guides for ChatGPT/OpenAI, Claude/Anthropic, Gemini/Google, Microsoft Copilot, and Perplexity.
- Build each guide from primary product documentation and label the reviewed date and relevant version/plan scope.
- Create a standard comparison matrix: context input, files, search/grounding, persistent instructions or memory, structured outputs, multimodal inputs, and documented limitations—only where current primary sources support the information.
- Mark features that differ by plan, environment, or rollout.
- Explain what transfers across tools and what is product-specific.
- Add a source-change/review process to prevent guide rot.
- Add developer and image-generation product guides only after the first-tier guides are maintained successfully.

**Exit gate:** a reader can identify a method that transfers across products and accurately recognize at least one relevant product-specific distinction. Every factual product claim is sourced and has a review owner/date.

### Phase 6 — Build the learning-path system

**Goal:** help learners progress beyond one-off page visits.

Work:
- Create paths for beginners, everyday knowledge work, students/educators, researchers/analysts, developers, and managers.
- Define prerequisites, measurable outcomes, modules, practice tasks, and a capstone for each path.
- Add consistent progress states and completion behavior.
- Keep progress local at first.
- Add review/checkpoint questions that test application rather than memorization alone.
- Offer “continue learning” and related paths without forcing registration.
- Test whether learners understand the suggested next lesson.

**Exit gate:** users can complete a path in order or enter through an individual task, understand their progress, and leave with a demonstrable artifact or skill.

### Phase 7 — Professional visual and accessibility hardening

**Goal:** ensure the experience is worthy of public use and can serve a broad audience.

Work:
- Complete keyboard, focus management, screen-reader, contrast, reduced-motion, text zoom, and mobile audits.
- Test with assistive technology and on smaller screens, not only desktop browser automation.
- Provide readable examples, code blocks, callouts, tables, and a print view.
- Check all content routes for broken links, missing metadata, layout shifts, and inaccessible components.
- Audit third-party scripts and runtime asset weight.
- Test page rendering, crawlability, metadata, sitemap, redirects, and 404 behavior.
- Provide a clear way to report errors or stale claims.

**Exit gate:** no known critical accessibility or navigation defects remain in the public core path; high-priority defects have owners and verified fixes.

### Phase 8 — Editorial credibility and safety

**Goal:** establish a durable reason to trust the site.

Work:
- Publish About, Editorial Standards, Contact/Corrections, Privacy, Terms, and any other notices appropriate to the actual deployment.
- Add citations and review-date checks to CI or the editorial workflow where practical.
- Build a source-review queue for company-specific and safety-related claims.
- Review all examples for private/sensitive data, invented citations, unsupported claims, and unsafe guidance.
- Add responsible-use coverage based on authoritative resources such as the [NIST Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence).
- Review content licensing and add the intended repository/site license before presenting the project as openly reusable.
- Keep a visible correction history for meaningful content changes.

**Exit gate:** a new visitor can tell who maintains the site, how claims are sourced, how to report a mistake, and where the limits of the educational guidance lie.

### Phase 9 — Search, discovery, and launch

**Goal:** make the best lessons findable without compromising editorial quality.

Work:
- Verify every public lesson URL and its rendered HTML.
- Add descriptive page titles, summaries, canonical URLs, internal linking, and sitemap coverage.
- Implement site search and task/technique/product filters.
- Review search-console queries and site search misses to identify real gaps.
- Publish a small number of deep, original case studies.
- Share educational work in relevant communities and invite feedback.
- Establish a realistic review/publishing cadence.
- Track learning outcomes alongside discovery metrics.

**Exit gate:** important pages are discoverable and usable; content inventory has no placeholder sections masquerading as finished guides; the publishing and correction process is sustainable.

### Phase 10 — Carefully test monetization

**Goal:** explore sustainable operation only after the learning product has clear value.

Work:
- Audit content quality, policy pages, crawlability, HTTPS, navigation, and privacy requirements.
- Review current AdSense rules and apply only when the site is genuinely ready.
- If approved, place a restrained number of ads without obstructing learning or resembling navigation.
- Monitor whether ads affect lesson completion, accessibility, returning readers, or trust.
- Test only one alternative revenue source at a time, with transparent disclosure where commercial relationships exist.
- Keep the core educational value free unless there is a specific, validated reason to add a paid offering.

**Exit gate:** monetization complies with current platform and legal requirements, does not degrade the learning experience, and shows evidence of sustainability rather than relying on speculative revenue projections.

### Phase 11 — Community, educators, and institutional use (optional)

**Goal:** expand only when learners and educators demonstrate demand.

Potential work:
- External lesson reviews and corrections.
- Educator-ready lesson packs and print materials.
- Classroom/workshop assignments.
- Team learning paths and facilitator guides.
- Carefully moderated community contributions.
- Localization of the strongest lessons into additional languages, with human review and terminology consistency.

Do not build a social network, forums, accounts, or a complicated learning-management system until a real group of users asks for it and the maintenance burden is understood.

**Exit gate:** there is evidence of repeat use and a clear ownership/moderation plan for any new community or institutional feature.

---

## 17. What to build now, next, and later

### Now — highest priority
1. Make this learning-first roadmap the shared product source of truth.
2. Audit the current learning pages and tools against the intended audience.
3. Improve the information architecture, typography, reading flow, and lesson page structure.
4. Finish and pilot the eight-part foundation course.
5. Establish the content metadata/editorial review standards.
6. Fix accessibility and crawlability issues found in the current public site.

### Next
1. Publish the core technique taxonomy with high-quality canonical lessons.
2. Build the task-first library.
3. Publish and maintain the five first-tier company/product guides.
4. Add practice exercises, rubrics, and coherent learning paths.
5. Create original worked case studies and a useful feedback loop.

### Later, when justified
- Additional developer-specific and multimodal guides.
- More elaborate local-model and workflow practice.
- Optional educator or enterprise packs.
- Community contributions and localization.
- Ads and other monetization experiments after quality/readiness review.

### Explicitly defer
- More workflow node types simply for technical sophistication.
- More AI integrations that require external keys.
- Mandatory accounts and cloud synchronization.
- Broad, automated article generation.
- Dozens of company pages without a maintenance owner.
- A certificate until assessments support a credible claim.
- Ads on pages whose content and user experience are not ready.
- Rewriting the application framework before a measured requirement shows that the current architecture cannot deliver crawlable, accessible lessons.

---

## 18. Release definition: what “professional” means

A site is not professionally ready merely because it has many pages or a polished homepage. The release bar is:

### Content
- A complete beginner path with real practice and answer explanations.
- A useful core technique library with failure modes and cross-links.
- A selected task library deep enough to serve real needs.
- Company guides that are sourced, dated, scoped, and maintained.
- No obvious placeholder pages or unsupported claims.

### Learning experience
- New learners can find a starting point and progress through a coherent path.
- Exercises explain mistakes and do not rely entirely on hosted AI generation.
- Users can navigate from a practical task into the underlying principles.
- The site describes model uncertainty, limitations, privacy, and verification honestly.

### Trust and maintenance
- Named editorial purpose, sources, review dates, corrections, privacy information, and terms.
- Clear licensing decisions for the site, content, code, and media.
- Defined maintenance ownership and a manageable update cadence.
- A documented way to report broken links, stale product details, or inaccurate explanations.

### Technical experience
- Each public lesson has a stable, discoverable URL and meaningful page metadata.
- Responsive, keyboard-accessible navigation and readable content.
- Reliable production build, automated checks, and browser tests on the exact release revision.
- Sensible performance and no unnecessary network calls or required hosted inference.
- Privacy/security review appropriate to the real deployment.

### Monetization
- Review current publisher requirements and applicable privacy obligations.
- No deceptive ad placement or interaction.
- No monetization strategy that requires publishing thin, duplicate, or unmaintainable pages.
- No guarantee of advertising approval or earnings.

---

## 19. Source register for ongoing research

Research snapshot: **24 October 2026**. These sources are starting points for continued editorial review, not a claim that every recommendation will remain current indefinitely.

### Learning resources and competitive references
- Learn Prompting, introduction: https://learnprompting.org/docs/introduction
- Learn Prompting, advanced techniques: https://learnprompting.org/docs/advanced/introduction
- Learn Prompting, learning pathways: https://learnprompting.org/learning-pathways
- Prompt Engineering Guide: https://www.promptingguide.ai/introduction
- DAIR.AI Prompt Engineering Guide repository: https://github.com/dair-ai/Prompt-Engineering-Guide
- The Prompt Report, systematic survey: https://arxiv.org/abs/2406.06608
- DataCamp, Understanding Prompt Engineering: https://www.datacamp.com/courses/understanding-prompt-engineering
- DeepLearning.AI, ChatGPT Prompt Engineering for Developers: https://www.deeplearning.ai/courses/chatgpt-prompt-eng/
- OpenAI Academy: https://academy.openai.com/
- OpenAI Academy, AI Foundations: https://academy.openai.com/public/courses/ai-foundations-juzjs?autoEnroll=true
- Microsoft Learn, effective prompting for Copilot: https://learn.microsoft.com/en-us/training/modules/write-effective-prompts-do-more-prompting/

### First-party prompting documentation
- OpenAI, prompting: https://developers.openai.com/api/docs/guides/prompting
- OpenAI, prompt engineering: https://developers.openai.com/api/docs/guides/prompt-engineering
- OpenAI Help Center, prompting best practices: https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt
- Anthropic, prompt engineering overview: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
- Google AI for Developers, prompt design strategies: https://ai.google.dev/gemini-api/docs/prompting-strategies
- Microsoft Learn, prompt module: https://learn.microsoft.com/en-us/training/modules/write-effective-prompts-do-more-prompting/

### Editorial quality, search, monetization, and risk
- Google Search Central, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Central, SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google AdSense, site readiness: https://support.google.com/adsense/answer/12176698?hl=en
- Google AdSense, Program policies: https://support.google.com/adsense/answer/48182?hl=en
- NIST, Artificial Intelligence Risk Management Framework: Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

---

## 20. Final strategic rule

**Build a learning publication first and let the tools serve the curriculum.**

The competitive edge will not come from claiming to have every prompt or adding the most features. It will come from making prompt engineering understandable, searchable, testable, honest about limitations, applicable to real work, and maintained as AI products change.

A small set of excellent, interconnected, reviewed lessons is a better foundation than hundreds of shallow pages. Expand only when learners' actual questions, task demand, research, and editorial capacity justify it.
