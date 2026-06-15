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
  btn: "theme-btn",
  btnPrimary: "theme-btn theme-btn-primary",
  btnSecondary: "theme-btn theme-btn-secondary",
  btnSuccess: "theme-btn theme-btn-success",
  btnDanger: "theme-btn theme-btn-danger",
  field: "theme-field",
  diffAdded: "theme-diff-added",
  diffRemoved: "theme-diff-removed",
  alertError: "theme-alert-error",
  badgeWarn: "theme-badge-warning",
  toggleActive: "theme-toggle-active",
  toggleInactive: "theme-toggle-inactive",
} as const;
