import { redirect } from "next/navigation";

/**
 * Older "Start Fact-Finder" links pointed here and created a form on every visit.
 * Starting a form is now an explicit button on the home page.
 */
export default function IntakeIndex() {
  redirect("/");
}
