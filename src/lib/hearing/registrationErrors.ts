import { ApiError } from "@/lib/api/client";

export type HearingLang = "en" | "hi" | "or";

export function normalizeHearingLang(value: string | undefined): HearingLang {
  if (value === "en" || value === "hi" || value === "or") return value;
  return "or";
}

function alreadyRegisteredMessage(lang: HearingLang, reference: string): string {
  const ref = reference || "-";
  if (lang === "hi") {
    return `आप पहले ही इस सुनवाई के लिए पंजीकरण कर चुके हैं। आपकी संदर्भ ID ${ref} है। कृपया WhatsApp पर अपडेट देखें - दोबारा पंजीकरण करने की जरूरत नहीं है।`;
  }
  if (lang === "or") {
    return `ଆପଣ ଏହି ଶୁଣାଣି ପାଇଁ ପୂର୍ବରୁ ପଞ୍ଜିକରଣ କରିସାରିଛନ୍ତି । ଆପଣଙ୍କ ସନ୍ଦର୍ଭ ID ${ref} । ଦୟାକରି WhatsApp ରେ ଅପଡେଟ୍ ଦେଖନ୍ତୁ - ପୁନଃ ପଞ୍ଜିକରଣ ଆବଶ୍ୟକ ନୁହେଁ ।`;
  }
  return `You have already registered for this hearing. Your reference ID is ${ref}. Please check WhatsApp for updates - you do not need to register again.`;
}

function registrationClosedMessage(lang: HearingLang): string {
  if (lang === "hi") {
    return "इस सुनवाई के लिए पंजीकरण बंद है। कृपया बाद में पुनः प्रयास करें या अन्य सुनवाई देखें।";
  }
  if (lang === "or") {
    return "ଏହି ଶୁଣାଣି ପାଇଁ ପଞ୍ଜିକରଣ ବନ୍ଦ ଅଛି । ଦୟାକରି ପରେ ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ କିମ୍ବା ଅନ୍ୟ ଶୁଣାଣି ଦେଖନ୍ତୁ ।";
  }
  return "Registration is closed for this hearing. Please try again later or check for another hearing.";
}

function networkErrorMessage(lang: HearingLang): string {
  if (lang === "hi") {
    return "इंटरनेट कनेक्शन में समस्या है। कृपया कनेक्शन जांचें और पुनः प्रयास करें।";
  }
  if (lang === "or") {
    return "ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗରେ ସମସ୍ୟା ଅଛି । ଦୟାକରି ସଂଯୋଗ ଯାଞ୍ଚ କରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ । ";
  }
  return "Could not reach the server. Please check your internet connection and try again.";
}

function genericFailureMessage(lang: HearingLang): string {
  if (lang === "hi") {
    return "पंजीकरण पूरा नहीं हो सका। कृपया विवरण जांचें और पुनः प्रयास करें।";
  }
  if (lang === "or") {
    return "ପଞ୍ଜିକରଣ ସମ୍ପୂର୍ଣ୍ଣ ହୋଇପାରିଲା ନାହିଁ । ଦୟାକରି ବିବରଣୀ ଯାଞ୍ଚ କରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ ।";
  }
  return "Registration could not be completed. Please check your details and try again.";
}

export function formatHearingSubmitError(err: unknown, lang: HearingLang): string {
  if (err instanceof ApiError) {
    const reference =
      typeof err.details?.reference_number === "string"
        ? err.details.reference_number
        : "";

    if (
      reference ||
      err.message.toLowerCase().includes("already registered")
    ) {
      return alreadyRegisteredMessage(lang, reference || "-");
    }

    if (err.status === 0) {
      return networkErrorMessage(lang);
    }

    const mapped = mapKnownApiMessage(err.message, lang);
    if (mapped) return mapped;

    if (err.message && err.message !== "Request failed") {
      return err.message;
    }
  }

  return genericFailureMessage(lang);
}

export function termsNotAcceptedMessage(lang: HearingLang): string {
  if (lang === "hi") return "कृपया सबमिट करने के लिए नियम और शर्तें स्वीकार करें।";
  if (lang === "or") return "ଦୟାକରି ଦାଖଲ କରିବାକୁ ନିୟମ ଏବଂ ସର୍ତ୍ତାବଳୀ ସ୍ୱୀକାର କରନ୍ତୁ ।";
  return "Please accept the Terms & Conditions to submit your registration.";
}

export function orgRequiredMessage(lang: HearingLang): string {
  if (lang === "hi") return "कृपया कम से कम एक संगठन चुनें।";
  if (lang === "or") return "ଦୟାକରି ଅତି କମରେ ଗୋଟିଏ ସଂସ୍ଥା ବାଛନ୍ତୁ ।";
  return "Please select at least one organization.";
}

export function invalidPhoneMessage(lang: HearingLang): string {
  if (lang === "hi") return "कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।";
  if (lang === "or") return "ଦୟାକରି ସଠିକ୍ 10 ଅଙ୍କର ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ ।";
  return "Enter a valid 10-digit mobile number.";
}

export function missingFieldsMessage(lang: HearingLang, labels: string[]): string {
  const joined = labels.join(", ");
  if (lang === "hi") {
    return `आवश्यक जानकारी अधूरी है: ${joined}। कृपया सभी चरण पूरे करें।`;
  }
  if (lang === "or") {
    return `ଆବଶ୍ୟକ ସୂଚନା ଅସମ୍ପୂର୍ଣ୍ଣ: ${joined} । ଦୟାକରି ସମସ୍ତ ପଦକ୍ଷେପ ପୂରଣ କରନ୍ତୁ ।`;
  }
  return `Missing required information: ${joined}. Please go back and complete all steps.`;
}

function mapKnownApiMessage(message: string, lang: HearingLang): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("already registered")) return null;
  if (lower.includes("registration is closed")) return registrationClosedMessage(lang);
  if (lower.includes("pincode")) {
    if (lang === "hi") return "पिनकोड 6 अंकों का होना चाहिए।";
    if (lang === "or") return "ପିନକୋଡ୍ 6 ଅଙ୍କର ହେବା ଉଚିତ ।";
    return "Pincode must be a 6-digit number.";
  }
  if (lower.includes("mobile") || lower.includes("phone")) {
    return invalidPhoneMessage(lang);
  }
  if (lower.includes("attach") || lower.includes("upload") || lower.includes("file")) {
    return message;
  }
  return null;
}
