import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/config/site";

/** One footer for the whole site, with the details from finethy.co. */
export function SiteFooter() {
  return (
    <footer id="contact" className="mt-auto border-t-4 border-brand-orange bg-brand-footerBg text-[#c9d1de]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-wide text-2xl font-bold tracking-tight text-white">
            FINETHY<span className="text-brand-orange">.</span>
          </p>
          <p className="max-w-sm text-[15px] leading-relaxed">
            {SITE.legalName} is an {SITE.regulatoryLine}.
          </p>
          <p className="text-sm">
            {SITE.arn}
            <br />
            {SITE.euin}
          </p>
        </div>

        <address className="space-y-2 not-italic">
          <p className="flex items-center gap-2 font-semibold text-white">
            <MapPin className="h-4 w-4 text-brand-orange" aria-hidden /> Visit us
          </p>
          <p className="pl-6 text-[15px] leading-relaxed">
            {SITE.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </address>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="flex items-center gap-2 font-semibold text-white">
              <Phone className="h-4 w-4 text-brand-orange" aria-hidden /> Call us
            </p>
            <a href={SITE.phoneHref} className="block pl-6 text-[15px] hover:text-white">
              {SITE.phoneDisplay}
            </a>
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-2 font-semibold text-white">
              <Mail className="h-4 w-4 text-brand-orange" aria-hidden /> Email us
            </p>
            <a href={SITE.emailHref} className="block pl-6 text-[15px] hover:text-white">
              {SITE.email}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-[13px] sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>{SITE.riskDisclaimer}</p>
          <p>
            © {new Date().getFullYear()} {SITE.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
