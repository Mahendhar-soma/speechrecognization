"use client";

export type OutputMode = "plain" | "notice" | "wish" | "card";

const OPTIONS: Array<{ id: OutputMode; label: string }> = [
  { id: "plain", label: "సాధారణం" },
  { id: "notice", label: "నోటీసు" },
  { id: "wish", label: "శుభాకాంక్షలు" },
  { id: "card", label: "కార్డ్" },
];

type FormatPickerProps = {
  value: OutputMode;
  onChange: (value: OutputMode) => void;
  disabled?: boolean;
};

export default function FormatPicker({ value, onChange, disabled }: FormatPickerProps) {
  return (
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      {OPTIONS.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 ${
              selected
                ? "bg-orange-100 text-orange-900"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
