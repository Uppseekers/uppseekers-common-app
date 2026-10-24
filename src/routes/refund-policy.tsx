import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { seo } from "@/components/site/SiteShell";

const sections = [
  { title: "Cohort Transfers", paragraphs: ["Because each track is limited to 9 participants per month, enrolled students may request a transfer to a later cohort, subject to seat availability."], bullets: [] },
  { title: "Cancellations", paragraphs: ["Cancellation requests must be sent in writing to team@uppseekers.com. Eligibility for any refund depends on when the request is received relative to the cohort start date."], bullets: [] },
  { title: "After Program Start", paragraphs: ["Once mentorship sessions have begun, fees are generally non-refundable, as mentor time is reserved exclusively for each participant."], bullets: [] },
  { title: "Processing", paragraphs: ["Approved refunds are returned to the original payment method through our payment gateway."], bullets: [] },
];

export const Route = createFileRoute("/refund-policy")({
  head: () => seo("Refund & Cohort Transfer Policy — Uppseekers", "Cohort transfer and cancellation policy for Uppseekers programs."),
  component: () => <PolicyPage title="Refund & Cohort Transfer Policy" sections={sections} />,
});
