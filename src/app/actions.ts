"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createIntakeLink } from "@/lib/links";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * "Start the fact-finder" on the public page. A POST (server action), so
 * crawlers, link previews and prefetching can never create empty intakes.
 */
export async function startIntake() {
  const ip = clientIp(await headers());
  if (!rateLimit(`start:${ip}`, 15, 10 * 60 * 1000).ok) {
    redirect("/?busy=1");
  }
  const link = await createIntakeLink();
  redirect(`/intake/${link.token}`);
}
