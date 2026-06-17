import { IconMoon, IconSun } from "@tabler/icons-react";

import { useTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  buttonClassName?: string;
};

export default function ThemeToggle({ className, buttonClassName }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: typeof IconSun }[] = [
    { value: "light", label: "Light mode", icon: IconSun },
    { value: "dark", label: "Dark mode", icon: IconMoon },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-theme-border bg-theme-surface p-0.5",
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-200",
              isActive
                ? "bg-theme-icon-bg text-brand-primary shadow-sm"
                : "text-theme-muted hover:text-theme-heading hover:bg-theme-surface-muted",
              buttonClassName,
            )}
          >
            <Icon size={16} stroke={1.75} />
          </button>
        );
      })}
    </div>
  );
}
