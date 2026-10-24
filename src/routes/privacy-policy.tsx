import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { seo } from "@/components/site/SiteShell";
import { privacySections } from "@/content/privacy";

export const Route = createFileRoute("/privacy-policy")({
  head: () => seo("Privacy Policy & Community Guidelines — Uppseekers", "How Uppseekers protects student and parent data, plus our community conduct standards."),
  component: () => <PolicyPage title="Privacy Policy & Community Guidelines" sections={privacySections} />,
});
