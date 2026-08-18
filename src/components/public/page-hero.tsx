import { Container } from "./container";

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative overflow-hidden bg-[image:var(--grad-hero)] py-7 text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,107,157,0.3), transparent 45%)" }}
      />
      <Container className="relative z-[2]">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">{subtitle}</p>}
      </Container>
    </div>
  );
}
