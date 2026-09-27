import type { ReactNode } from "react";

// `modal` is the slot a venue opens into when clicked from the search results
// (see @modal/(.)[id]); everywhere else it renders nothing.
export default function VenuesLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
