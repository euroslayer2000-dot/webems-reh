export function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
          : "bg-[#fde8c8] text-[#9a6a00] dark:bg-warning/18 dark:text-[#f5c56a]"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
