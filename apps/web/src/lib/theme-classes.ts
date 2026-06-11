/**
 * Semantic theme class helpers.
 *
 * Source of truth for colors lives in `src/styles.css` under `:root` and `.dark`
 * (`--theme-*` variables). Update those once to restyle the entire app.
 */
export const themeClasses = {
  page: "bg-theme-page text-theme-heading",
  heading: "text-theme-heading",
  body: "text-theme-body",
  muted: "text-theme-muted",
  surface: "bg-theme-surface",
  card: "theme-card theme-card-hover",
  border: "border-theme-border",
  panel: "theme-panel",
  iconBadge: "bg-theme-icon-bg group-hover:bg-theme-icon-bg-hover",
  input: "bg-theme-input-bg border-theme-border text-theme-heading",
  code: "bg-theme-code-bg text-theme-code-text",
} as const;
