import type { ReactNode } from "react";

// `modal` is the slot a vendor opens into when clicked from the search results
// (see @modal/(.)[id]); everywhere else it renders nothing.
export default function VendorsLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
