import { lessons } from "./lessons";
import { taskGuides } from "./task-guides";

export type RolePath = {
  id: string;
  title: string;
  audience: string;
  outcome: string;
  minutes: number;
  lessonIds: string[];
  taskIds: string[];
  practices: string[];
  capstone: string;
  selfCheck: string[];
};

/**
 * Role-based routes assembled from published lessons and task guides.
 * The role pages orient the learner; they do not replace the lessons themselves.
 */
export const rolePaths: RolePath[] = [
  {
    id: "knowledge-worker",
    title: "Knowledge worker",
    audience: "Office professionals who use AI for day-to-day writing, summaries, and documents",
    outcome: "Turn a rough request into a reviewable draft, check it against criteria, and keep confidential material out of prompts.",
    minutes: 45,
    lessonIds: ["anatomy", "zero-shot", "context", "structured-output", "evaluation"],
    taskIds: ["write-clearer", "improve-a-result", "choose-useful-context"],
    practices: [
      "Paste the requirement or rubric you were given, not just 'make this better'.",
      "Keep client, employee, and financial details out of the prompt unless you know the tool's data handling policy.",
      "Read any number, date, or citation in the draft before you send it on."
    ],
    capstone: "Take a real email, brief, or summary you already wrote and rewrite the request that would have produced it, including audience, constraints, and a five-point review checklist for the output.",
    selfCheck: [
      "I can name the four parts I put into a prompt and why each is there.",
      "I can point to the requirement that tells me a draft is good enough.",
      "I know which documents I would never paste into an AI tool."
    ]
  },
  {
    id: "student",
    title: "Student and lifelong learner",
    audience: "Learners who use AI to study, explain difficult material, and prepare for assessments",
    outcome: "Ask for explanations and practice questions at the right level without outsourcing the actual learning.",
    minutes: 40,
    lessonIds: ["anatomy", "zero-shot", "few-shot", "decomposition", "evaluation"],
    taskIds: ["write-clearer", "break-down-work", "improve-a-result"],
    practices: [
      "Ask for a hint or a walkthrough before you ask for the answer.",
      "Request practice questions with explanations, then attempt them yourself first.",
      "Check anything that looks like a fact, quotation, or citation against your course material or library sources.",
      "Follow your institution's rules on AI use and disclose assistance when required."
    ],
    capstone: "Build a revision plan for one upcoming topic: explain the concept in your own words, generate ten practice questions with answer explanations, and mark which questions you got wrong and why.",
    selfCheck: [
      "I can explain a concept from the lesson in my own words after using AI to clarify it.",
      "I know how to ask a tutor-style prompt that reveals my misunderstanding instead of hiding it.",
      "I have checked my citations against a real source."
    ]
  },
  {
    id: "educator",
    title: "Educator",
    audience: "Teachers, trainers, and instructors preparing material and feedback",
    outcome: "Draft lessons, rubrics, and feedback faster while keeping judgement, accuracy, and student privacy in your hands.",
    minutes: 45,
    lessonIds: ["anatomy", "context", "few-shot", "structured-output", "security"],
    taskIds: ["write-clearer", "match-a-style", "use-documents-safely"],
    practices: [
      "Give the year level, prior knowledge, and time available so explanations land at the right depth.",
      "Use examples of your own feedback style so drafts sound like you, then edit every one.",
      "Never paste student work or personal data into a tool you have not checked with your institution.",
      "Treat every generated reading list or citation as unverified until you open the source."
    ],
    capstone: "Design one lesson segment: objectives, a worked example, three practice questions with an answer key, and a rubric with explicit achievement descriptors.",
    selfCheck: [
      "I can state the level and audience of a prompt without ambiguity.",
      "I know which student data I am not allowed to paste into an AI tool.",
      "I verify every reference before it reaches a student."
    ]
  },
  {
    id: "researcher",
    title: "Researcher and analyst",
    audience: "People who gather evidence, compare sources, and write defensible findings",
    outcome: "Use AI for extraction and synthesis while keeping claims tied to sources and uncertainty visible.",
    minutes: 50,
    lessonIds: ["anatomy", "context", "structured-output", "evaluation", "security"],
    taskIds: ["choose-useful-context", "extract-structured", "improve-a-result"],
    practices: [
      "Supply the actual source text; never ask a model to recall a paper from memory.",
      "Ask the model to mark which statements come from the source and which are inference.",
      "Keep the boundary between discovery, synthesis, and verification in your own workflow.",
      "Record prompt versions and dates so a colleague can reproduce your steps."
    ],
    capstone: "Take two short documents, extract claims into a fixed table with a source column and an evidence column, and write a five-line synthesis that separates findings from open questions.",
    selfCheck: [
      "I can trace every claim in an AI-assisted paragraph back to a source I opened.",
      "I know which step of my workflow requires human judgement and I have not automated it.",
      "I can describe the limits of the tool to a colleague honestly."
    ]
  },
  {
    id: "developer",
    title: "Software developer",
    audience: "Programmers using AI assistants for code, tests, reviews, and documentation",
    outcome: "Ask for changes with clear acceptance criteria, give the right context, and verify results by running them.",
    minutes: 55,
    lessonIds: ["anatomy", "context", "decomposition", "structured-output", "evaluation", "security"],
    taskIds: ["break-down-work", "extract-structured", "use-documents-safely"],
    practices: [
      "State the behaviour you expect and how you will test it, not just 'fix this'.",
      "Include the surrounding code, error text, and version numbers that matter.",
      "Run the tests. A plausible patch is not evidence that it works.",
      "Treat model output and retrieved files as untrusted input in anything security-relevant."
    ],
    capstone: "Take a real bug report: reproduce it, narrow it with one question at a time, request a patch with an explicit acceptance criterion, and record the test that proves it.",
    selfCheck: [
      "I can write an acceptance criterion that a test could check.",
      "I always run code before I trust it.",
      "I know which parts of a response need a second reviewer."
    ]
  },
  {
    id: "writer",
    title: "Writer and editor",
    audience: "Writers, content editors, and communicators working on drafts and revisions",
    outcome: "Control tone, length, and structure deliberately, and revise meaning-preserving text instead of accepting generic prose.",
    minutes: 40,
    lessonIds: ["anatomy", "few-shot", "context", "decomposition", "evaluation"],
    taskIds: ["write-clearer", "match-a-style", "improve-a-result"],
    practices: [
      "Describe the reader and the change you want instead of asking for 'something engaging'.",
      "Show one or two short samples that demonstrate the voice you want.",
      "Ask for a revision against your own notes rather than a rewrite from scratch.",
      "Keep the author's voice: edit AI prose sentence by sentence, do not ship it whole."
    ],
    capstone: "Rewrite one paragraph three ways for three named readers, then justify in a line each why the wording changed.",
    selfCheck: [
      "I can describe tone with observable words rather than adjectives like 'good'.",
      "I know exactly which sentences in an AI draft I kept, changed, or removed.",
      "I check quotes and attributed facts before publication."
    ]
  },
  {
    id: "marketer",
    title: "Marketing, sales, and support",
    audience: "People producing campaign copy, product messaging, and customer responses",
    outcome: "Generate variants against an explicit brief, keep claims supportable, and route sensitive replies to a human.",
    minutes: 45,
    lessonIds: ["anatomy", "few-shot", "structured-output", "decomposition", "evaluation"],
    taskIds: ["match-a-style", "write-clearer", "improve-a-result"],
    practices: [
      "Put the audience, channel, offer, and forbidden claims in the prompt.",
      "Ask for variants against the brief, then judge each one against the brief.",
      "Verify every product claim, statistic, and comparison before it ships.",
      "Keep customer data out of prompts, and escalate anything sensitive to a person."
    ],
    capstone: "Write a one-page campaign brief, generate three variants for a named channel, and score each against a rubric you wrote before you generated them.",
    selfCheck: [
      "I can list the claims a draft made and say which are approved for use.",
      "My rubric existed before the drafts did.",
      "I know which customer messages must go to a human."
    ]
  },
  {
    id: "founder",
    title: "Founder and operator",
    audience: "Early-stage founders wearing many hats across product, ops, and communication",
    outcome: "Move faster on briefs, specs, and synthesis while keeping decisions and facts you are accountable for in your own hands.",
    minutes: 45,
    lessonIds: ["anatomy", "context", "decomposition", "evaluation", "security"],
    taskIds: ["break-down-work", "write-clearer", "improve-a-result"],
    practices: [
      "Give the constraint that actually matters: stage, budget, team size, deadline.",
      "Use AI to draft options, not to decide; record the decision yourself.",
      "Keep customer lists, contracts, and financials out of consumer chat tools.",
      "Re-run a brief when the inputs change rather than patching the output by hand."
    ],
    capstone: "Produce one decision memo: the question, the options with trade-offs, the evidence behind each, and an explicit statement of what you still do not know.",
    selfCheck: [
      "I can name the decision this memo supports and who is accountable for it.",
      "Every number in the memo has a source I checked.",
      "I know which inputs were confidential."
    ]
  },
  {
    id: "manager",
    title: "Manager and team lead",
    audience: "People preparing briefs, updates, and reviews for a team or stakeholders",
    outcome: "Turn scattered input into a structured update with explicit status, risks, and owners.",
    minutes: 40,
    lessonIds: ["anatomy", "context", "structured-output", "evaluation"],
    taskIds: ["write-clearer", "extract-structured", "improve-a-result"],
    practices: [
      "Provide the raw notes and the audience; ask for structure, not conclusions.",
      "Require a status, an owner, and a date for every item you are accountable for.",
      "Check that names, numbers, and commitments match reality before it reaches your team.",
      "Keep personnel information out of prompts entirely."
    ],
    capstone: "Convert a page of meeting notes into a status update with a fixed structure: decisions, owners, dates, risks, and open questions.",
    selfCheck: [
      "I can verify each action item against what was actually agreed.",
      "No personal or performance data went into a prompt.",
      "The update states what is unknown instead of smoothing it over."
    ]
  }
];

export function findRolePath(id: string): RolePath | undefined {
  return rolePaths.find((role) => role.id === id);
}

export function validateRolePaths(): string[] {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const taskIds = new Set(taskGuides.map((task) => task.id));
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const role of rolePaths) {
    if (!role.id.trim() || ids.has(role.id)) errors.push("Role IDs must be non-empty and unique: " + role.id);
    ids.add(role.id);
    if (!role.title.trim() || !role.audience.trim() || !role.outcome.trim()) {
      errors.push("Role " + role.id + " must include a title, audience, and outcome.");
    }
    if (role.lessonIds.length < 3) errors.push("Role " + role.id + " should route through at least three lessons.");
    if (new Set(role.lessonIds).size !== role.lessonIds.length) errors.push("Role " + role.id + " lists a lesson twice.");
    for (const lessonId of role.lessonIds) {
      if (!lessonIds.has(lessonId)) errors.push("Role " + role.id + " references unknown lesson " + lessonId);
    }
    for (const taskId of role.taskIds) {
      if (!taskIds.has(taskId)) errors.push("Role " + role.id + " references unknown task " + taskId);
    }
    if (role.practices.length < 2 || !role.capstone.trim() || role.selfCheck.length < 2) {
      errors.push("Role " + role.id + " needs working practices, a capstone, and a self-check.");
    }
    if (role.minutes <= 0) errors.push("Role " + role.id + " needs a positive effort estimate.");
  }
  return errors;
}
