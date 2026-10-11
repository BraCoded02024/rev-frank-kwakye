import { slots, type SlotKey } from "@/lib/content/slots";

const showLabels = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDER_LABELS === "true";

export function SlotImage({ slot, className = "" }: { slot: SlotKey; className?: string }) {
  const spec = slots[slot];
  return (
    <div className={`slot ${className}`} style={{ aspectRatio: spec.aspect }} aria-hidden="true">
      <span className="slot-beam" />
      {showLabels ? (
        <span className="slot-label">
          {spec.label} · {spec.aspect}
        </span>
      ) : null}
    </div>
  );
}
