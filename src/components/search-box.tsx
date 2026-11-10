"use client";

export function SearchBox({
  value,
  onChange,
  placeholder,
  className = "max-w-sm",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Width cap; the guest list's toolbar lets it fill the row. */
  className?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full ${className} rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest`}
    />
  );
}
