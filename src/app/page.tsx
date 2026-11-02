import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { StartButton } from "@/components/site/StartButton";
import { startIntake } from "./actions";

const TOPICS = [
  { title: "You and your family", detail: "Who depends on your income" },
  { title: "Income and expenses", detail: "Rough monthly figures are fine" },
  { title: "What you own", detail: "Savings, funds, property, gold" },
  { title: "What you owe", detail: "Loans, EMIs and card balances" },
  { title: "Insurance", detail: "Life and health cover you already have" },
  { title: "Your goals", detail: "What you are saving for, and by when" },
  { title: "How you think about money", detail: "14 quick multiple-choice questions" },
  { title: "Wrap-up", detail: "Anything you want to talk about" },
];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ busy?: string }> }) {
  const { busy } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:pb-24 lg:pt-24">
          <div className="max-w-xl">
            <h1 className="font-wide text-[2.5rem] font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
              Before we meet, tell us where you stand.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-brand-bodyText">
              Answer a few short questions about your money so your FINETHY advisor can prepare a personal review
              before your consultation. It takes about 10 minutes, and approximate answers are perfectly fine.
            </p>

            {busy ? (
              <p role="alert" className="mt-6 rounded-lg border border-health-yellow-line bg-health-yellow-bg px-4 py-3 text-[15px] text-health-yellow">
                Too many forms were started from this connection. Wait a few minutes, then try again.
              </p>
            ) : null}

            <form action={startIntake} className="mt-8">
              <StartButton />
            </form>

            <ul className="mt-10 space-y-3 text-[15px] text-brand-bodyText">
              <li className="flex gap-3">
                <Dot />
                Your answers save as you go, so you can stop and come back on the same device.
              </li>
              <li className="flex gap-3">
                <Dot />
                Only the FINETHY team sees what you share.
              </li>
            </ul>
          </div>

          <div className="lg:pt-3">
            <h2 className="text-lg font-semibold">What we will ask about</h2>
            <ol className="mt-5 border-t border-brand-border">
              {TOPICS.map((t, i) => (
                <li key={t.title} className="grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-brand-border py-3.5">
                  <span className="tabular font-wide text-lg font-bold text-brand-orange-deep">{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-brand-darkText">{t.title}</span>
                    <span className="block text-[15px] text-brand-mutedText">{t.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Dot() {
  return <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />;
}
