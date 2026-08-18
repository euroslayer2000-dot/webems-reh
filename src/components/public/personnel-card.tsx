import Image from "next/image";
import { uploadUrl } from "@/lib/upload";

export type PersonnelCardData = {
  full_name: string;
  position: string | null;
  photo: string | null;
  group: { name: string } | null;
};

export function PersonnelCard({ person }: { person: PersonnelCardData }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-center shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)]">
      <div className="relative mx-auto h-[120px] w-[120px] overflow-hidden rounded-full border-4 border-surface bg-bg-soft shadow-[var(--shadow)] transition-transform hover:scale-105">
        <Image
          src={uploadUrl(person.photo, "/assets/img/person-placeholder.svg")}
          alt={person.full_name}
          fill
          sizes="120px"
          className="object-cover"
        />
      </div>
      <h3 className="mt-4 text-[1.05rem] font-bold text-text">{person.full_name}</h3>
      <p className="text-[0.88rem] font-semibold text-accent-500">{person.position || "-"}</p>
      {person.group && <p className="text-[0.8rem] text-text-muted">{person.group.name}</p>}
    </div>
  );
}
