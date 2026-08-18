export function SectionTitle({
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-accent-500 bg-accent-50",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  eyebrowClassName?: string;
}) {
  return (
    <div className="mb-11 text-center">
      <span
        className={`mb-3 inline-block rounded-full px-3.5 py-1.5 text-[0.82rem] font-bold tracking-[0.14em] uppercase shadow-[0_2px_10px_rgba(255,107,157,0.18)] ${eyebrowClassName}`}
      >
        {eyebrow}
      </span>
      <h2 className="mt-1 text-[clamp(1.6rem,3vw,2.3rem)] font-extrabold text-text">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-xl text-text-muted">{description}</p>}
      <div className="mx-auto mt-2.5 h-1 w-[66px] rounded-full bg-[image:var(--grad-accent)]" />
    </div>
  );
}
