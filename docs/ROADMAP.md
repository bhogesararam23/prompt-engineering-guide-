# Roadmap

**Product priority:** learning first. Prompt Engineering Guide is being developed as a professional learning publication that teaches people how to write, improve, evaluate, and safely adapt prompts across tasks, roles, and AI products.

## Source of truth

Read the [Learning Platform Roadmap](LEARNING_PLATFORM_ROADMAP.md) for the complete product strategy and multi-phase implementation plan. It includes representative competitive research, positioning, curriculum taxonomy, task-based learning, company-specific guides, editorial standards, accessibility, search discovery, responsible use, monetization gates, success metrics, and exit criteria.

The older implementation-focused roadmap has been preserved as the [Engineering Roadmap](ENGINEERING_ROADMAP.md). It tracks technical gates for features that already exist. It is a supporting engineering backlog, not the product strategy; it should not cause the team to prioritize more tooling over the learning experience.

## Immediate priority order

1. **Audit the current experience** — inventory lessons, techniques, navigation, practice tools, accessibility gaps, and content freshness. Distinguish shipped features from plans.
2. **Improve information architecture and presentation** — put Learn, Techniques, By Task, By Role, and AI Product Guides at the center when the relevant sections have enough content to be useful. Keep Prompt Lab and workflow features as optional Practice tools.
3. **Finish the foundational curriculum** — create a coherent eight-module learning path with worked examples, failure diagnosis, practice, rubrics, and honest limitations.
4. **Establish content operations** — standard lesson metadata, primary-source citations, review dates, correction process, page ownership, and criteria for publication.
5. **Build the cross-provider content system** — establish one reusable, source-linked guide format; publish the initial general-assistant guides; then expand to Chinese AI ecosystems (DeepSeek, Qwen, Kimi, GLM, MiniMax, ERNIE, Tencent Hunyuan) and other relevant model families such as Mistral, Llama, Grok, and Nova. Publish only when each guide meets the same quality bar.
6. **Grow through useful, discoverable learning pages** — build task-first pages around real learner questions, clear titles, internal links, structured metadata, worked examples, and trustworthy sources. Do not mass-publish near-duplicates or promise that content guarantees search/LLM recommendations.
7. **Harden before growth or monetization** — test accessibility, crawlability, mobile reading, content quality, privacy, licensing, and production reliability. Treat advertising as a later experiment, not the reason to publish shallow content.

## Phase 1 implementation checkpoint

The lesson-navigation foundation now includes a structured metadata contract for all eight lessons (learning outcomes, prerequisite IDs, related lesson IDs, and the next lesson), shareable query-based lesson URLs, section anchors/table of contents, breadcrumbs, and previous/next navigation. Catalogue and URL helpers have automated integrity tests, and the browser suite covers direct entry, table-of-contents navigation, and continuing to the next lesson.

This is a first slice of Phase 1—not a claim that the phase exit gate is complete. Remaining work includes a fuller mobile/keyboard/screen-reader audit, route-level page metadata and crawlability decisions, content review dates/ownership, and usability feedback from learners.

## Rules for prioritization

- Every new feature must improve learning, content discovery, practice, trust, accessibility, or maintainability.
- Do not add a tool merely because it is technically interesting.
- Do not publish mass-generated, duplicated, or unsourced pages to inflate page count.
- Do not describe product-specific behavior as universal; source and date changing claims.
- Do not claim a learning outcome without an appropriate, transparent evaluation.
- Do not add accounts, mandatory hosted LLM calls, or a new backend unless a validated requirement justifies the cost and privacy burden.
- Mark a phase complete only when its documented exit gate is met.

**North-star outcome:** learners can choose a suitable prompting approach for a real task, explain why it fits, assess the result against clear criteria, improve a failing prompt, and recognize when human review or a different solution is required.


## Accessibility implementation checkpoint

- Added a keyboard-visible skip link that targets the main content landmark.
- Exposed the selected workspace destination with `aria-current="page"`, rather than relying on color alone.
- Added explicit visible focus styling for primary workspace controls.
- Added a Playwright keyboard journey for skip navigation and current-page semantics.

This is a targeted first pass, not a claim of WCAG conformance. A complete screen-reader, contrast, reduced-motion, mobile keyboard, and real assistive-technology audit remains required.
