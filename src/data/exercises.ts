export type LessonExercise = {
  id: string;
  lessonId: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export const exercises: LessonExercise[] = [
  {
    id: "check-anatomy",
    lessonId: "anatomy",
    question: "Which instruction is easiest to verify objectively?",
    choices: [
      "Make the answer excellent and insightful.",
      "Explain the topic in a useful way.",
      "Return exactly five bullets and include one caveat.",
      "Use a professional tone and be smart."
    ],
    correctIndex: 2,
    explanation: "A fixed count and an explicit required element can be checked directly. Tone can matter, but it is less objectively testable."
  },
  {
    id: "check-zero-shot",
    lessonId: "zero-shot",
    question: "What defines zero-shot prompting?",
    choices: [
      "A clear instruction without task examples in the prompt.",
      "A prompt containing at least ten examples.",
      "A prompt that never supplies input data.",
      "A prompt whose result is guaranteed correct."
    ],
    correctIndex: 0,
    explanation: "Zero-shot means the task is described without demonstration examples. It does not guarantee correctness."
  },
  {
    id: "check-few-shot",
    lessonId: "few-shot",
    question: "Which set of examples is most useful for few-shot prompting?",
    choices: [
      "Many duplicates of the same simple example.",
      "Only examples that match one expected answer.",
      "Examples with varied but representative cases, including meaningful edge cases.",
      "Unrelated examples written in different output formats."
    ],
    correctIndex: 2,
    explanation: "Representative examples communicate the intended pattern. Edge cases help reveal where labels or formats are ambiguous."
  },
  {
    id: "check-structured",
    lessonId: "structured-output",
    question: "How should an application handle model-generated JSON?",
    choices: [
      "Assume it is valid because the prompt requested JSON.",
      "Parse and validate it against a schema, then handle errors.",
      "Run it as code to see whether it works.",
      "Remove all punctuation and accept the remaining text."
    ],
    correctIndex: 1,
    explanation: "Instructions are not a hard guarantee. Parsing and schema validation belong in application code."
  },
  {
    id: "check-decomposition",
    lessonId: "decomposition",
    question: "Which change makes a prompt improvement experiment easier to interpret?",
    choices: [
      "Rewrite every part of the prompt and replace the test set at the same time.",
      "Change one relevant prompt component and keep representative test cases fixed.",
      "Keep only the best-looking output and discard failures.",
      "Add examples even when the failure is unrelated to missing examples."
    ],
    correctIndex: 1,
    explanation: "A specific diagnosis, one justified change, and a fixed comparison set make the effect of a revision easier to interpret."
  },
  {
    id: "check-evaluation",
    lessonId: "evaluation",
    question: "What makes a prompt comparison more reproducible?",
    choices: [
      "Changing the test cases until each prompt looks good.",
      "Keeping representative cases fixed and documenting model/configuration and scoring.",
      "Reporting only the best single output.",
      "Using subjective impressions without recording them."
    ],
    correctIndex: 1,
    explanation: "Fixed cases and recorded configurations make it possible to interpret differences between versions."
  },
  {
    id: "check-security",
    lessonId: "security",
    question: "Which is the strongest protection against prompt injection causing a privileged action?",
    choices: [
      "Put the phrase 'ignore malicious instructions' in the prompt and rely on it.",
      "Trust content if it came from a document.",
      "Hide the tool description from the user.",
      "Enforce authorization and tool permissions in application code, outside the prompt."
    ],
    correctIndex: 3,
    explanation: "Prompts can help communicate intent, but authorization must be enforced by trusted application code."
  },
  {
    id: "check-context",
    lessonId: "context",
    question: "Why preserve provenance for retrieved context?",
    choices: [
      "So users can distinguish source-backed facts from generated interpretations and verify important claims.",
      "To guarantee every generated answer is correct.",
      "To avoid ever evaluating retrieval quality.",
      "So the model can ignore the source material."
    ],
    correctIndex: 0,
    explanation: "Source provenance helps verification and clarifies which claims came from supplied material. It is not a correctness guarantee."
  }
];

export function getExerciseForLesson(lessonId: string): LessonExercise | undefined {
  return exercises.find((exercise) => exercise.lessonId === lessonId);
}

export function gradeExercise(exercise: LessonExercise, selectedIndex: number): {
  correct: boolean;
  explanation: string;
} {
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= exercise.choices.length) {
    throw new Error("Select one of the available answers before checking.");
  }
  return {
    correct: selectedIndex === exercise.correctIndex,
    explanation: exercise.explanation
  };
}
