"use client";

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-sm rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
    />
  );
}
