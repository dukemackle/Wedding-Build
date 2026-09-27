// /vendors itself: no panel. Without this, following a link back to /vendors
// while a listing is open would leave the panel showing -- a soft navigation
// keeps a slot's last state unless the new URL gives it something to render.
export default function NoModal() {
  return null;
}
