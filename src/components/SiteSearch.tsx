import { lessons } from "../data/lessons";
import { productGuides } from "../data/product-guides";
import { rolePaths } from "../data/roles";
import { taskGuides } from "../data/task-guides";

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenTask: (taskId: string) => void;
  onOpenRole: (roleId: string) => void;
  onOpenProduct: (guideId: string) => void;
};

type SearchResult = {
  kind: "Lesson" | "Scenario" | "Profession path" | "AI guide";
  title: string;
  detail: string;
  open: () => void;
};

/** Case-insensitive substring match over the learner-facing text of each section. */
function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

/**
 * One search box over lessons, task scenarios, profession paths, and product guides,
 * so a learner can type what they came for instead of learning the site structure first.
 */
export default function SiteSearch({ query, onQueryChange, onOpenLesson, onOpenTask, onOpenRole, onOpenProduct }: Props) {
  const needle = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  if (needle) {
    for (const lesson of lessons) {
      const haystack = [lesson.title, lesson.summary, lesson.category, ...lesson.sections.map((section) => section.heading + " " + section.body)].join(" ");
      if (matches(haystack, needle)) {
        results.push({
          kind: "Lesson",
          title: lesson.title,
          detail: lesson.category + " · " + lesson.minutes + " min · " + lesson.summary,
          open: () => onOpenLesson(lesson.id)
        });
      }
    }
    for (const task of taskGuides) {
      const haystack = [task.title, task.need, task.recommendation, task.area].join(" ");
      if (matches(haystack, needle)) {
        results.push({
          kind: "Scenario",
          title: task.title,
          detail: task.area + " · " + task.need,
          open: () => onOpenTask(task.id)
        });
      }
    }
    for (const role of rolePaths) {
      const haystack = [role.title, role.audience, role.outcome, role.capstone].join(" ");
      if (matches(haystack, needle)) {
        results.push({
          kind: "Profession path",
          title: role.title,
          detail: role.audience,
          open: () => onOpenRole(role.id)
        });
      }
    }
    for (const guide of productGuides) {
      const haystack = [guide.name, guide.vendor, guide.summary, guide.bestFor.join(" ")].join(" ");
      if (matches(haystack, needle)) {
        results.push({
          kind: "AI guide",
          title: guide.name,
          detail: guide.vendor + " · " + guide.summary,
          open: () => onOpenProduct(guide.id)
        });
      }
    }
  }

  return (
    <>
      <div className="section-intro">
        <p className="eyebrow">SEARCH THE GUIDE</p>
        <strong>Find a lesson, scenario, path, or product guide</strong>
        <p>Search runs entirely in your browser across every section of the site. Nothing is sent anywhere.</p>
      </div>

      <div className="site-search-box">
        <label htmlFor="site-search-input">SEARCH EVERYTHING</label>
        <input
          id="site-search-input"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Try: prompt injection, summarise, Claude, study…"
          autoComplete="off"
        />
      </div>

      {needle ? (
        results.length ? (
          <>
            <p className="site-search-count" role="status">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query.trim()}”
            </p>
            <div className="site-search-results">
              {results.map((result) => (
                <button type="button" className="site-search-result" key={result.kind + result.title} onClick={result.open}>
                  <span className="site-search-kind">{result.kind}</span>
                  <strong>{result.title}</strong>
                  <p>{result.detail}</p>
                  <span className="site-search-open">Open →</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">Nothing matches “{query.trim()}”. Try a shorter word, or browse the learning guide by category.</p>
        )
      ) : (
        <p className="muted">Type to search lessons, work scenarios, profession paths, and AI product guides.</p>
      )}
    </>
  );
}
