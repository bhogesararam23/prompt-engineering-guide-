import { lessons } from "../data/lessons";
import { findProductGuide, productGuides, type ProductTier } from "../data/product-guides";

type Props = {
  selectedGuideId: string | null;
  onSelectGuide: (guideId: string | null) => void;
  onOpenLesson: (lessonId: string) => void;
};

const TIER_LABELS: Record<ProductTier, string> = {
  consumer: "Consumer assistants",
  developer: "Developer platforms",
  "open-weights": "Open-weights models"
};

/**
 * Learn by AI: model-specific differences only, each claim linked to first-party
 * documentation with an explicit review window. Transferable principles stay in lessons.
 */
export default function ProductGuides({ selectedGuideId, onSelectGuide, onOpenLesson }: Props) {
  const selected = selectedGuideId ? findProductGuide(selectedGuideId) : undefined;
  const tiers: ProductTier[] = ["consumer", "developer", "open-weights"];

  return (
    <>
      <div className="section-intro">
        <p className="eyebrow">LEARN BY AI</p>
        <strong>Where each tool differs — and what stays the same</strong>
        <p>
          The principles in the lessons transfer across every product below. These guides only describe
          the differences: controls the product documents, behaviours its official documentation claims,
          and the privacy terms you should read before pasting anything in. Every claim links to
          first-party documentation, and each guide carries a review window.
        </p>
      </div>

      {tiers.map((tier) => {
        const guides = productGuides.filter((guide) => guide.tier === tier);
        if (!guides.length) return null;
        return (
          <section className="product-tier" key={tier} aria-labelledby={"tier-" + tier}>
            <h2 id={"tier-" + tier}>{TIER_LABELS[tier]}</h2>
            <div className="product-grid">
              {guides.map((guide) => {
                const expanded = selected?.id === guide.id;
                const related = guide.relatedLessonIds
                  .map((id) => lessons.find((lesson) => lesson.id === id))
                  .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
                return (
                  <article className={"product-card" + (expanded ? " expanded" : "")} key={guide.id}>
                    <button
                      type="button"
                      className="product-card-trigger"
                      aria-expanded={expanded}
                      onClick={() => onSelectGuide(expanded ? null : guide.id)}
                    >
                      <span className="product-card-top">
                        <span className="product-card-vendor">{guide.vendor}</span>
                        <span className="product-card-verified">Checked {guide.lastVerified}</span>
                      </span>
                      <strong>{guide.name}</strong>
                      <p>{guide.summary}</p>
                      <span className="product-card-bottom">
                        <span>{guide.bestFor.slice(0, 2).join(" · ")}</span>
                        <span>{expanded ? "Hide guide −" : "Open guide +"}</span>
                      </span>
                    </button>
                    {expanded && selected ? (
                      <div className="product-detail">
                        <div className="product-detail-block">
                          <h3>Good for</h3>
                          <ul>
                            {selected.bestFor.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="product-detail-block">
                          <h3>What the official documentation says</h3>
                          <ul>
                            {selected.modelSpecific.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="product-detail-block">
                          <h3>Controls it documents</h3>
                          <ul>
                            {selected.controls.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="product-detail-block">
                          <h3>Caveats</h3>
                          <ul>
                            {selected.caveats.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="product-privacy">
                          <strong>Before you paste anything</strong>
                          <p>{selected.privacy}</p>
                        </div>
                        <div className="product-detail-block">
                          <h3>Practice</h3>
                          <p>{selected.practice}</p>
                          <ul className="product-checklist">
                            {selected.checklist.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="product-detail-block product-sources">
                          <h3>Official sources</h3>
                          <ul>
                            {selected.sources.map((source) => (
                              <li key={source.url}>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  hrefLang={source.lang === "zh" ? "zh" : undefined}
                                >
                                  {source.label}
                                  <span aria-hidden="true"> ↗</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                          {selected.sourceNote ? <p className="product-source-note">{selected.sourceNote}</p> : null}
                          <p className="product-review-window">
                            Sources last checked {selected.lastVerified}; review due {selected.reviewDue}.
                            Features, plans, and interfaces change often — confirm against the linked page
                            before relying on a detail.
                          </p>
                        </div>
                        {related.length ? (
                          <div className="product-detail-block">
                            <h3>Transferable principles behind this guide</h3>
                            <div className="product-lesson-links">
                              {related.map((lesson) => (
                                <button type="button" key={lesson.id} onClick={() => onOpenLesson(lesson.id)}>
                                  {lesson.title} →
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <div className="product-detail-actions">
                          <button type="button" className="button secondary" onClick={() => onSelectGuide(null)}>
                            Close guide
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
