/**
 * Wren's planning interview: the things a good planner asks at the first
 * meeting, before giving any advice. Answers are stored per question id in
 * wedding_preferences.answers, so adding, reordering or rewording a question
 * needs no migration -- just don't reuse an old id for a different question.
 */
export type PlanningQuestion = {
  id: string;
  question: string;
  /** Tappable answers. The couple can also type their own. */
  options: string[];
  /** How many options can be picked. 1 = pick one. */
  max: number;
  /** How the answer reads to Wren in its context, e.g. "Top priorities". */
  label: string;
};

export const PLANNING_QUESTIONS: PlanningQuestion[] = [
  {
    id: "ceremony",
    question: "Let's start with the ceremony. What are you picturing?",
    options: ["Religious", "Civil / friend officiating", "Cultural traditions", "Not sure yet"],
    max: 1,
    label: "Ceremony",
  },
  {
    id: "traditions",
    question: "Any faith, cultural or family traditions you want to include?",
    options: ["None in particular", "Still deciding"],
    max: 1,
    label: "Traditions",
  },
  {
    id: "vibe",
    question: "How should the day feel? Pick up to two.",
    options: ["Relaxed & casual", "Classic & elegant", "Rustic / outdoors", "Modern & minimal", "Big party", "Small & intimate"],
    max: 2,
    label: "Vibe",
  },
  {
    id: "priorities",
    question: "What matters most to you both? Pick your top three.",
    options: ["Food & drink", "Photos & video", "Music & dancing", "The venue", "Flowers & decor", "Attire", "Guest comfort"],
    max: 3,
    label: "Top priorities",
  },
  {
    id: "save_on",
    question: "And where would you happily spend less?",
    options: ["Food & drink", "Photos & video", "Music & dancing", "The venue", "Flowers & decor", "Attire", "Stationery"],
    max: 3,
    label: "Happy to save on",
  },
  {
    id: "budget_comfort",
    question: "How firm is your budget?",
    options: ["Hard ceiling", "Some wiggle room", "Flexible for the right things", "We haven't talked about it"],
    max: 1,
    label: "Budget",
  },
  {
    id: "paying",
    question: "Who's paying for the wedding?",
    options: ["Just us", "Family is helping", "Mostly family"],
    max: 1,
    label: "Who's paying",
  },
  {
    id: "guest_list",
    question: "Anything tricky about the guest list? Pick any that apply.",
    options: ["Divorced parents", "People to keep apart", "Kids or no kids", "Plus-one pressure", "Nothing tricky"],
    max: 5,
    label: "Guest-list sensitivities",
  },
  {
    id: "planning_style",
    question: "Last one: how do you want me to help?",
    options: ["Hand me a plan", "Give me options to choose from", "Just keep us on track"],
    max: 1,
    label: "How they want help",
  },
  {
    id: "must_haves",
    question: "Anything that's a must-have or a hard no? Type it, or skip.",
    options: [],
    max: 1,
    label: "Must-haves / hard nos",
  },
];

export type PlanningProfile = {
  answers: Record<string, string[]>;
  skipped: string[];
};

/** The next question the couple hasn't answered or skipped, if any. */
export function nextQuestion(profile: PlanningProfile): PlanningQuestion | null {
  return (
    PLANNING_QUESTIONS.find(
      (q) => !profile.answers[q.id]?.length && !profile.skipped.includes(q.id),
    ) ?? null
  );
}

/** The profile as lines for Wren's context. Empty when nothing's answered. */
export function profileLines(profile: PlanningProfile): string[] {
  return PLANNING_QUESTIONS.filter((q) => profile.answers[q.id]?.length).map(
    (q) => `${q.label}: ${profile.answers[q.id].join(", ")}`,
  );
}
