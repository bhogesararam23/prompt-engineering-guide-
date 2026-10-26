import type { MouseEvent } from "react";
import type { Lesson } from "../data/lessons";
import { lessonHref, lessonSectionId } from "../lib/lesson-navigation";

type Props = {
  lesson: Lesson;
  lessons: Lesson[];
  completedLessonIds: string[];
  onNavigate: (lessonId: string) => void;
  onOpenOverview: () => void;
  position: "start" | "end";
};

function interceptLessonLink(event: MouseEvent<HTMLAnchorElement>, lessonId: string, onNavigate: (id: string) => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onNavigate(lessonId);
}

export default function LessonLearningScaffold({ lesson, lessons, completedLessonIds, onNavigate, onOpenOverview, position }: Props) {
  const getLesson = (id: string) => lessons.find((item) => item.id === id);
  const prerequisites = lesson.prerequisiteIds.map(getLesson).filter((item): item is Lesson => Boolean(item));
  const related = lesson.relatedLessonIds.map(getLesson).filter((item): item is Lesson => item !== undefined && item.id !== lesson.id);
  const next = lesson.nextLessonId ? getLesson(lesson.nextLessonId) : undefined;
  const previous = lessons.find((item) => item.nextLessonId === lesson.id);

  if (position === "start") {
    return <div className="lesson-learning-start">
      <nav className="lesson-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><button type="button" onClick={onOpenOverview}>Overview</button></li>
          <li><span>Learning guide</span></li>
          <li><span aria-current="page">{lesson.title}</span></li>
        </ol>
      </nav>

      <section className="lesson-objectives" aria-labelledby="lesson-objectives-heading">
        <div className="lesson-scaffold-heading">
          <p className="eyebrow">LEARNING OUTCOMES</p>
          <h3 id="lesson-objectives-heading">What you will learn</h3>
        </div>
        <ul>{lesson.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>
      </section>

      {prerequisites.length > 0 ? <section className="lesson-prerequisites" aria-labelledby="lesson-prerequisites-heading">
        <div className="lesson-scaffold-heading">
          <p className="eyebrow">BEFORE YOU BEGIN</p>
          <h3 id="lesson-prerequisites-heading">Recommended prerequisites</h3>
        </div>
        <ul>{prerequisites.map((item) => <li key={item.id}>
          <a href={lessonHref(item.id)} onClick={(event) => interceptLessonLink(event, item.id, onNavigate)}>{item.title}</a>
          <span className={completedLessonIds.includes(item.id) ? "lesson-prerequisite-status complete" : "lesson-prerequisite-status"}>{completedLessonIds.includes(item.id) ? "Completed" : item.minutes + " min"}</span>
        </li>)}</ul>
      </section> : <p className="lesson-no-prerequisites">No prerequisites — this lesson is a starting point.</p>}

      <nav className="lesson-toc" aria-label="On this page">
        <div className="lesson-scaffold-heading">
          <p className="eyebrow">ON THIS PAGE</p>
          <h3>Contents</h3>
        </div>
        <ol>{lesson.sections.map((section) => {
          const id = lessonSectionId(lesson.id, section.heading);
          return <li key={id}><a href={"#" + id}>{section.heading}</a></li>;
        })}</ol>
      </nav>
    </div>;
  }

  return <div className="lesson-learning-end">
    <section className="lesson-next-step" aria-labelledby="lesson-next-heading">
      <div className="lesson-next-copy">
        <p className="eyebrow">{next ? "CONTINUE LEARNING" : "CURRENT PATH"}</p>
        <h3 id="lesson-next-heading">{next ? "Next: " + next.title : "You reached the end of this sequence"}</h3>
        <p>{next ? next.summary : "Review a related lesson or revisit a prerequisite to strengthen your understanding."}</p>
        {next ? <a className="button primary" href={lessonHref(next.id)} onClick={(event) => interceptLessonLink(event, next.id, onNavigate)}>Continue to next lesson <span aria-hidden="true">→</span></a> : null}
      </div>
      {previous ? <div className="lesson-previous-link">
        <span>PREVIOUS LESSON</span>
        <a href={lessonHref(previous.id)} onClick={(event) => interceptLessonLink(event, previous.id, onNavigate)}>{previous.title}</a>
      </div> : null}
    </section>

    {related.length > 0 ? <section className="lesson-related" aria-labelledby="lesson-related-heading">
      <div className="lesson-scaffold-heading">
        <p className="eyebrow">GO DEEPER</p>
        <h3 id="lesson-related-heading">Related lessons</h3>
      </div>
      <div className="lesson-related-grid">{related.map((item) => <a className="lesson-related-card" key={item.id} href={lessonHref(item.id)} onClick={(event) => interceptLessonLink(event, item.id, onNavigate)}>
        <span>{item.category} · {item.minutes} min</span>
        <strong>{item.title}</strong>
        <p>{item.summary}</p>
        <span className="lesson-related-link">{completedLessonIds.includes(item.id) ? "Review lesson ↗" : "Explore lesson ↗"}</span>
      </a>)}</div>
    </section> : null}
  </div>;
}
