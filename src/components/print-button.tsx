"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
    >
      Print
    </button>
  );
}
