import { redirect } from "next/navigation";

// Merch is hidden for now. The previous page is in git history (app/merch/page.tsx).
export default function Merch() {
  redirect("/shop");
}
