import Link from "next/link";

import { GovtNavbar } from "@/components/shell/GovtNavbar";
import { PortalFooter } from "@/components/shell/PortalFooter";

export const metadata = {
  title: "Terms & Conditions | Online Grievance Hearing",
};

export default function HearingTermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <GovtNavbar homeHref="/" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <nav className="text-sm text-text-muted">
          <Link href="/" className="font-medium text-navy-700 hover:text-saffron hover:underline">
            Jana Samadhan
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <Link href="/hearing" className="font-medium text-navy-700 hover:text-saffron hover:underline">
            Online Grievance Hearing
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-slate-600">Terms &amp; Conditions</span>
        </nav>

        <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
          Terms &amp; Conditions - Online Grievance Hearing
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Government of Odisha ┬╖ Jana Samadhan Grievance Management Portal
        </p>

        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="text-base font-bold text-navy-800">1. Registration</h2>
            <p className="mt-2">
              By registering for an Online Grievance Hearing, you confirm that all information
              submitted (personal details, grievance description, and attachments) is true and
              accurate to the best of your knowledge. False or misleading information may lead to
              rejection of your registration or action under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-navy-800">2. Eligibility and screening</h2>
            <p className="mt-2">
              Registration does not guarantee selection for the live hearing. Registrations are
              reviewed by the Minister&apos;s Office (PS / OSD). Only approved grievances are
              assigned a serial number and invited to join the hearing via Google Meet.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-navy-800">3. Notifications</h2>
            <p className="mt-2">
              Updates-including registration confirmation, selection, serial number, and Google Meet
              link-are sent to the WhatsApp mobile number you provide, in your chosen language.
              You are responsible for ensuring the number is correct and active.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-navy-800">4. Hearing conduct</h2>
            <p className="mt-2">
              Selected citizens must join the Google Meet session at the scheduled time, preferably
              15 minutes before their serial number is called. Disruptive, abusive, or irrelevant
              conduct may result in removal from the session without further hearing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-navy-800">5. Attachments</h2>
            <p className="mt-2">
              Uploaded photos, videos, or documents must relate to your grievance and must not
              contain unlawful, offensive, or confidential third-party material. Maximum file limits
              apply as stated on the registration form.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-navy-800">6. Data use</h2>
            <p className="mt-2">
              Your data is used solely for grievance redressal under the Jana Samadhan programme,
              including routing to the concerned department and maintaining an audit trail. Data is
              handled in accordance with applicable government data protection guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-navy-800">7. Resolution</h2>
            <p className="mt-2">
              Directions given during the hearing are recorded and forwarded to the relevant
              department for action. Time frames for resolution depend on the nature of the
              grievance and departmental process. The portal will communicate material updates via
              WhatsApp where applicable.
            </p>
          </section>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          You may close this page and return to your registration form to continue.
        </p>
      </main>

      <PortalFooter />
    </div>
  );
}
