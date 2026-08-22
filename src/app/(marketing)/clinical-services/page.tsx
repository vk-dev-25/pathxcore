import { redirect } from "next/navigation";

/** Legacy URL — clinical framing retired in favor of areas of expertise. */
export default function ClinicalServicesRedirectPage() {
  redirect("/areas-of-expertise");
}
