import { useMemo, useState } from "react";
import { techniqueCategories, techniques, type Technique } from "../data/techniques";

type Props = {
  onUseInPrompt: (technique: Technique) => void;
  onOpenWorkflows: (technique: Technique) => void;
};

export default function TechniqueLibrary({ onUseInPrompt, onOpenWorkflows }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("iterative-refinement");
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return techniques.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const haystack = [item.title, item.summary, item.category, ...item.tags, ...item.whenToUse].join(" ").toLocaleLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [query, category]);

  return <section className="technique-library">
    <header className="page-heading">
      <div>
        <p className="eyebrow">ADVANCED PROMPTING</p>
        <h1>Techniques Library</h1>
        <p>Practical patterns from provider documentation and research, with trade-offs and source links. The catalog does not call hosted LLMs.</p>
      </div>
      <span className="local-indicator"><i /> Source-linked · provider-neutral</span>
    </header>

    <div className="technique-intro">
      <strong>Two similar names, two different ideas</strong>
      <p><b>Graph workflow prompting</b> is this product's visual orchestration feature. <b>Graph of Thoughts</b> is a distinct research framework. Neither label implies that all providers use the same terminology or endorse this application.</p>
    </div>

    <div className="technique-toolbar">
      <label className="technique-search-label" htmlFor="technique-search">SEARCH TECHNIQUES</label>
      <input id="technique-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. self-correction, routing, evaluation…" />
      <div className="technique-categories" aria-label="Filter techniques by category">
        {techniqueCategories.map((item) => <button type="button" key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <span className="technique-result-count">{visible.length} of {techniques.length} techniques</span>
    </div>

    <div className="technique-grid">
      {visible.map((item, index) => {
        const expanded = expandedId === item.id;
        return <article className={"technique-card" + (expanded ? " expanded" : "")} key={item.id}>
          <button className="technique-card-trigger" type="button" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : item.id)}>
            <span className="technique-card-top"><span className="technique-index">{String(index + 1).padStart(2, "0")}</span><span className="technique-category">{item.category}</span></span>
            <strong>{item.title}</strong>
            <span className="technique-summary">{item.summary}</span>
            <span className="technique-card-bottom"><span>{item.level}</span><span>{expanded ? "Hide details −" : "Read details +"}</span></span>
          </button>
          {expanded && <div className="technique-details">
            <div><h3>When to use it</h3><ul>{item.whenToUse.map((line) => <li key={line}>{line}</li>)}</ul></div>
            <div><h3>Trade-offs and failure modes</h3><ul>{item.tradeoffs.map((line) => <li key={line}>{line}</li>)}</ul></div>
            <div><h3>Suggested process</h3><ol>{item.steps.map((line) => <li key={line}>{line}</li>)}</ol></div>
            <div className="technique-example"><div className="eyebrow">WORKED EXAMPLE</div><pre>{item.example}</pre></div>
            <div className="technique-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="technique-sources"><h3>Sources</h3>{item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer noopener">{source.label} ↗</a>)}</div>
            <div className="technique-actions">
              <button type="button" className="button primary" onClick={() => onUseInPrompt(item)}>Use in Prompt Lab</button>
              <button type="button" className="button secondary" onClick={() => onOpenWorkflows(item)}>Open workflow builder</button>
            </div>
          </div>}
        </article>;
      })}
      {visible.length === 0 && <div className="empty-state"><h2>No matching techniques</h2><p>Try another term or change the category filter.</p></div>}
    </div>
  </section>;
}
