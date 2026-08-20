/** Default public event-page copy for Online Grievance Hearings (rich HTML). */

const LEGACY_WHAT_TO_EXPECT = [
  "Register your grievance during the open registration window",
  "The Minister's Office screens submissions and prepares a shortlist",
  "Selected citizens receive a WhatsApp message with serial number and Google Meet details",
  "Join the Online Grievance Hearing on the scheduled date using your serial number",
  "Directions given during the hearing are recorded and forwarded to the concerned department",
].join("\n");

const LEGACY_IMPORTANT_NOTES = [
  "Registration does not guarantee selection for the live hearing",
  "Keep your registered WhatsApp number active to receive confirmation and hearing updates",
  "Incomplete or duplicate registrations may be discarded during screening",
  "Join on time with a stable internet connection; follow the serial-number admission process",
].join("\n");

export const DEFAULT_HEARING_WHAT_TO_EXPECT = `
<p><strong>Online Grievance Hearing</strong> is a virtual forum where citizens can place genuine issues before the Hon'ble Minister's Office. The process is designed to be <em>simple, transparent, and WhatsApp-led</em> from registration through hearing day.</p>
<p>After you submit your grievance, the Minister's Office reviews each case carefully. Only shortlisted citizens are invited to the live Google Meet session. Here is what typically happens:</p>
<ul>
<li><strong>Register in time</strong> - complete the online form before registration closes, with accurate personal and grievance details.</li>
<li><strong>Screening &amp; shortlist</strong> - PS/OSD teams verify submissions and prepare a shortlist for the hearing.</li>
<li><strong>WhatsApp confirmation</strong> - selected citizens receive a message with their <em>serial number</em> and Meet details.</li>
<li><strong>Join on hearing day</strong> - enter the Google Meet using your serial number and wait for your turn.</li>
<li><strong>Follow-up action</strong> - directions given in the hearing are recorded and forwarded to the concerned department.</li>
</ul>
<p>Please keep your registered WhatsApp number active throughout the process. All official updates - confirmation, selection, and hearing reminders - are sent only on WhatsApp.</p>
<p><em>Tip:</em> Have supporting documents ready (photo, PDF, or short video) if they help explain your grievance clearly during registration.</p>
`.trim();

export const DEFAULT_HEARING_IMPORTANT_NOTES = `
<p><strong>Please read these notes before you register.</strong> They help ensure a fair process for every citizen and a smooth Online Grievance Hearing.</p>
<p>Registration is open to eligible citizens, but <em>submission alone does not guarantee</em> a seat in the live hearing. Cases are screened based on completeness, relevance, and the capacity of each session.</p>
<ul>
<li><strong>Selection is not automatic</strong> - incomplete, unclear, or duplicate registrations may be discarded during screening.</li>
<li><strong>WhatsApp is mandatory</strong> - keep the number you register with switched on to receive confirmation and hearing updates.</li>
<li><strong>Join on time</strong> - use a stable internet connection and follow the serial-number admission process in Google Meet.</li>
<li><strong>Respect the hearing</strong> - speak briefly and clearly when called; follow instructions from the session hosts.</li>
</ul>
<p>If you are not shortlisted for this session, you may still pursue your grievance through the regular Jana Samadhan WhatsApp channel. Future Online Grievance Hearings will be announced on official channels.</p>
<p><em>Need help?</em> Recheck your details before submit. Once registration closes, changes to your application may not be possible for that hearing.</p>
`.trim();

function normalizeLegacy(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function isLegacyDefault(value: string, legacy: string) {
  return normalizeLegacy(value) === normalizeLegacy(legacy);
}

export function hearingWhatToExpect(value?: string | null) {
  const trimmed = (value || "").trim();
  if (!trimmed || isLegacyDefault(trimmed, LEGACY_WHAT_TO_EXPECT)) {
    return DEFAULT_HEARING_WHAT_TO_EXPECT;
  }
  return trimmed;
}

export function hearingImportantNotes(value?: string | null) {
  const trimmed = (value || "").trim();
  if (!trimmed || isLegacyDefault(trimmed, LEGACY_IMPORTANT_NOTES)) {
    return DEFAULT_HEARING_IMPORTANT_NOTES;
  }
  return trimmed;
}
