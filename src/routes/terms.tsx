import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/site/PolicyPage";
import { seo } from "@/components/site/SiteShell";

const sections = [
  { title: "Acceptance of Terms", paragraphs: ["By accessing or using the Uppseekers platform and services, you agree to these Terms of Service."], bullets: [] },
  { title: "Services", paragraphs: ["Uppseekers provides internships, research mentorship, passion project incubation, admissions guidance and the Common Admission App diagnostic."], bullets: [] },
  { title: "Academic Disclaimer", paragraphs: ["Uppseekers does not guarantee admission to any university. Diagnostic scores, match percentages and advisor recommendations are estimates for guidance only. Admission decisions rest solely with each institution."], bullets: [] },
  { title: "Academic Integrity", paragraphs: ["All essays, research and project work must be the student's own. Uppseekers mentors guide and review; they do not write work on a student's behalf."], bullets: [] },
  { title: "Accounts", paragraphs: ["You are responsible for the accuracy of the information you submit and for keeping your login credentials secure."], bullets: [] },
  { title: "Changes", paragraphs: ["Uppseekers may update these terms. Continued use of the services confirms acceptance of the revised terms."], bullets: [] },
];

export const Route = createFileRoute("/terms")({
  head: () => seo("Terms of Service — Uppseekers", "Terms of Service and academic disclaimer for Uppseekers programs and the Common Admission App."),
  component: () => <PolicyPage title="Terms of Service" sections={sections} />,
});
