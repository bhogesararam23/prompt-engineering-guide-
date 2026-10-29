import { lessons } from "../data/lessons";
import { findRolePath, rolePaths } from "../data/roles";
import { findTaskGuide } from "../data/task-guides";

type Props = {
  selectedRoleId: string | null;
  onSelectRole: (roleId: string | null) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenTask: (taskId: string) => void;
};

/**
 * Learn by profession: an ordered route through existing lessons for one audience,
 * plus the practices and self-checks that make the route concrete.
 */
export default function RolePaths({ selectedRoleId, onSelectRole, onOpenLesson, onOpenTask }: Props) {
  const selected = selectedRoleId ? findRolePath(selectedRoleId) : undefined;

  return (
    <>
      <div className="section-intro">
        <p className="eyebrow">LEARN BY PROFESSION</p>
        <strong>Pick the route that matches your work</strong>
        <p>
          Each path sequences the same transferable principles for one audience, then points at the
          scenarios and checks that matter most for that role. Progress is saved in this browser like
          any other lesson.
        </p>
      </div>

      <div className="role-grid">
        {rolePaths.map((role, index) => {
          const expanded = selected?.id === role.id;
          const roleLessons = role.lessonIds
            .map((id) => lessons.find((lesson) => lesson.id === id))
            .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
          const roleTasks = role.taskIds
            .map((id) => findTaskGuide(id))
            .filter((task): task is NonNullable<typeof task> => Boolean(task));
          return (
            <article className={"role-card" + (expanded ? " expanded" : "")} key={role.id}>
              <button
                type="button"
                className="role-card-trigger"
                aria-expanded={expanded}
                onClick={() => onSelectRole(expanded ? null : role.id)}
              >
                <span className="role-card-top">
                  <span className="role-card-index">PATH {String(index + 1).padStart(2, "0")}</span>
                  <span className="role-card-minutes">≈ {role.minutes} min</span>
                </span>
                <strong>{role.title}</strong>
                <p>{role.audience}</p>
                <span className="role-card-outcome">{role.outcome}</span>
                <span className="role-card-bottom">
                  <span>{role.lessonIds.length} lessons · {role.taskIds.length} scenarios</span>
                  <span>{expanded ? "Hide path −" : "Open path +"}</span>
                </span>
              </button>
              {expanded && selected ? (
                <div className="role-detail">
                  <div className="role-detail-block">
                    <h3>Your route</h3>
                    <ol className="role-route">
                      {roleLessons.map((lesson) => (
                        <li key={lesson.id}>
                          <button type="button" onClick={() => onOpenLesson(lesson.id)}>
                            {lesson.title}
                          </button>
                          <small>{lesson.minutes} min · {lesson.level}</small>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {roleTasks.length ? (
                    <div className="role-detail-block">
                      <h3>Scenarios for this role</h3>
                      <div className="role-task-links">
                        {roleTasks.map((task) => (
                          <button type="button" key={task.id} onClick={() => onOpenTask(task.id)}>
                            {task.title} →
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="role-detail-block">
                    <h3>Habits that make the difference</h3>
                    <ul>
                      {role.practices.map((practice) => (
                        <li key={practice}>{practice}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="role-detail-block role-capstone">
                    <h3>Capstone</h3>
                    <p>{role.capstone}</p>
                  </div>
                  <div className="role-detail-block">
                    <h3>Self-check</h3>
                    <ul className="role-self-check">
                      {role.selfCheck.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      {selected ? (
        <div className="role-footer">
          <button type="button" className="button secondary" onClick={() => onSelectRole(null)}>
            Close path
          </button>
        </div>
      ) : null}
    </>
  );
}
