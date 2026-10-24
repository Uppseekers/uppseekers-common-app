import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero, seo } from "@/components/site/SiteShell";
import { EnquiryForm } from "@/components/site/EnquiryForm";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact Us — Uppseekers", "Parents and students: share your details and an Uppseekers advisor will reach out. Enrolment is on a merit basis only."),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Contact us." subtitle="Enrolment is on a merit basis only. Share a few details and an advisor will reach out to plan the right next step." />
      <section className="mx-auto max-w-2xl px-4 py-16">
        <EnquiryForm />
      </section>
    </SiteLayout>
  );
}
