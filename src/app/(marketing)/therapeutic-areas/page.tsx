import { redirect } from "next/navigation";

/** Legacy URL — renamed to Areas of expertise. */
export default function TherapeuticAreasRedirectPage() {
  redirect("/areas-of-expertise");
}
