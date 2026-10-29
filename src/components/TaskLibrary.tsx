import { useState } from "react";
import { lessons } from "../data/lessons";
import { taskAreas, taskGuides, type TaskArea } from "../data/task-guides";

type Props = {
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onOpenLesson: (lessonId: string) => void;
};

/**
 * Learn by task: one worked scenario per real job, showing the weak prompt,
 * the improved version, and why each change was made.
 */
export default function TaskLibrary({ selectedTaskId, onSelectTask, onOpenLesson }: Props) {
  const [area, setArea] = useState<"All" | TaskArea>("All");
  const visible = taskGuides.filter((task) => area === "All" || task.area === area);
  const selected = taskGuides.find((task) => task.id === selectedTaskId) || null;

  return (
    <>
      <div className="section-intro">
        <p className="eyebrow">LEARN BY TASK</p>
        <strong>Start from the work in front of you</strong>
        <p>
          Every scenario shows a deliberately weak prompt, a stronger version, and the reason for each
          change. The transferable principles live in the linked lesson; the scenario shows them applied
          to one real job.
        </p>
      </div>

      <div className="filter-row" role="group" aria-label="Filter scenarios by work area">
        {(["All", ...taskAreas()] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={area === item ? "selected" : ""}
            aria-pressed={area === item}
            onClick={() => setArea(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="task-scenario-grid">
        {visible.map((task, index) => {
          const lesson = lessons.find((item) => item.id === task.lessonId);
          const expanded = selected?.id === task.id;
          return (
            <article className={"task-scenario-card" + (expanded ? " expanded" : "")} key={task.id}>
              <button
                type="button"
                className="task-scenario-trigger"
                aria-expanded={expanded}
                onClick={() => onSelectTask(expanded ? null : task.id)}
              >
                <span className="task-scenario-top">
                  <span className="task-scenario-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="task-scenario-area">{task.area}</span>
                </span>
                <strong>{task.title}</strong>
                <p>{task.need}</p>
                <span className="task-scenario-bottom">
                  <span>{task.recommendation}</span>
                  <span>{expanded ? "Hide scenario −" : "Open scenario +"}</span>
                </span>
              </button>
              {expanded && selected ? (
                <div className="task-scenario-detail">
                  <p className="task-scenario-rationale">{selected.rationale}</p>
                  <div className="prompt-compare">
                    <div className="prompt-compare-column weak">
                      <small>WEAK PROMPT</small>
                      <pre>{selected.weakPrompt}</pre>
                    </div>
                    <div className="prompt-compare-column improved">
                      <small>IMPROVED PROMPT</small>
                      <pre>{selected.improvedPrompt}</pre>
                    </div>
                  </div>
                  <div className="task-scenario-block">
                    <h3>What changed and why</h3>
                    <ol>
                      {selected.changes.map((change) => (
                        <li key={change}>{change}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="task-scenario-block">
                    <h3>Common mistakes to avoid</h3>
                    <ul>
                      {selected.mistakes.map((mistake) => (
                        <li key={mistake}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="task-scenario-block practice-block">
                    <h3>Practice exercise</h3>
                    <p>{selected.practice}</p>
                  </div>
                  <div className="task-scenario-actions">
                    <button type="button" className="button primary" onClick={() => onOpenLesson(selected.lessonId)}>
                      Read the lesson: {lesson?.title} →
                    </button>
                    <button type="button" className="button secondary" onClick={() => onSelectTask(null)}>
                      Close scenario
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      {!visible.length ? <p className="muted">No scenarios in this area yet.</p> : null}
    </>
  );
}
