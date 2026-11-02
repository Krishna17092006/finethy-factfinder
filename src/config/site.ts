/**
 * Business details shown across the site, emails and PDF.
 * Single source of truth. Taken from https://finethy.co (confirmed by the owner).
 */
export const SITE = {
  name: "FINETHY",
  legalName: "FINETHY LLP",
  tagline: "Plan. Protect. Prosper.",
  website: "https://finethy.co",
  phoneDisplay: "+91 89040 56464",
  phoneHref: "tel:+918904056464",
  whatsappNumber: "918904056464",
  email: "SUPPORT@FINETHY.CO",
  emailHref: "mailto:support@finethy.co",
  addressLines: [
    "Shop No. 288, II Floor,",
    "100ft Outer Ring Road,",
    "Kathriguppe IV Phase,",
    "Banashankari III Stage,",
    "Bengaluru, Karnataka 560085",
  ],
  arn: "ARN-28883",
  euin: "EUIN E045709",
  regulatoryLine: "AMFI-registered Mutual Fund Distributor",
  riskDisclaimer:
    "Mutual Fund investments are subject to market risks. Read all scheme related documents carefully.",
} as const;
