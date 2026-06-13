"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, MapPin, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { partnershipsEmail } from "@/components/marketing/site-content";
import { isSafeHttpsUrl } from "@/lib/external-url";
import { cn } from "@/lib/utils";

type PartnerType = "vet_clinic" | "shelter" | "rescue" | "council" | "community" | "other";
type CoverageType = "local" | "regional" | "statewide" | "national";
type CaseLoadType = "under_10" | "10_30" | "31_75" | "76_plus";

type PartnerFormState = {
  partnerType: PartnerType | "";
  organisationName: string;
  website: string;
  suburb: string;
  stateOrRegion: string;
  coverage: CoverageType | "";
  monthlyCases: CaseLoadType | "";
  goals: string[];
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const partnerTypeOptions: Array<{ value: PartnerType; label: string; help: string }> = [
  { value: "vet_clinic", label: "Veterinary clinic", help: "General and emergency vet teams." },
  { value: "shelter", label: "Shelter", help: "Animal shelters and pounds." },
  { value: "rescue", label: "Rescue group", help: "Foster-based and registered rescues." },
  { value: "council", label: "Council service", help: "Council and ranger teams." },
  { value: "community", label: "Community organisation", help: "Local welfare organisations and networks." },
  { value: "other", label: "Other", help: "Any partner not listed above." },
];

const coverageOptions: Array<{ value: CoverageType; label: string }> = [
  { value: "local", label: "Single suburb/city" },
  { value: "regional", label: "Regional area" },
  { value: "statewide", label: "State-wide" },
  { value: "national", label: "National" },
];

const caseLoadOptions: Array<{ value: CaseLoadType; label: string }> = [
  { value: "under_10", label: "Under 10 pets/month" },
  { value: "10_30", label: "10-30 pets/month" },
  { value: "31_75", label: "31-75 pets/month" },
  { value: "76_plus", label: "76+ pets/month" },
];

const goalOptions = [
  "Publish your organisation in the partner directory",
  "Speed up lost/found matching for animals in your care",
  "Get referral resources for your staff or volunteers",
  "Coordinate better with local community reports",
  "Explore organisation-level account and workflow support",
];

const steps = [
  { id: "organisation", title: "Organisation", subtitle: "Tell us who you are.", icon: Building2 },
  { id: "operations", title: "Operations", subtitle: "Tell us how you work.", icon: MapPin },
  { id: "contact", title: "Contact", subtitle: "Tell us who we should reach out to.", icon: UserRound },
  { id: "review", title: "Review", subtitle: "Confirm details and submit.", icon: Send },
];

const initialForm: PartnerFormState = {
  partnerType: "",
  organisationName: "",
  website: "",
  suburb: "",
  stateOrRegion: "",
  coverage: "",
  monthlyCases: "",
  goals: [],
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildEmailBody(form: PartnerFormState) {
  const lines = [
    "Hi The Fur Finder team,",
    "",
    "We are interested in becoming a partner. Here are our intake details:",
    "",
    `Organisation type: ${form.partnerType ? titleCase(form.partnerType) : "Not provided"}`,
    `Organisation name: ${form.organisationName || "Not provided"}`,
    `Website: ${form.website || "Not provided"}`,
    `Suburb/City: ${form.suburb || "Not provided"}`,
    `State/Region: ${form.stateOrRegion || "Not provided"}`,
    `Coverage area: ${form.coverage ? titleCase(form.coverage) : "Not provided"}`,
    `Monthly lost/found case volume: ${form.monthlyCases ? titleCase(form.monthlyCases) : "Not provided"}`,
    `Partnership goals: ${form.goals.length > 0 ? form.goals.join("; ") : "Not provided"}`,
    "",
    "Primary contact:",
    `- Name: ${form.contactName || "Not provided"}`,
    `- Role: ${form.contactRole || "Not provided"}`,
    `- Email: ${form.contactEmail || "Not provided"}`,
    `- Phone: ${form.contactPhone || "Not provided"}`,
    "",
    `Additional notes: ${form.notes || "None"}`,
    "",
    "Thanks,",
    form.organisationName || form.contactName || "Partner applicant",
  ];

  return lines.join("\n");
}

export default function PartnerInterestFunnel() {
  const [form, setForm] = useState<PartnerFormState>(initialForm);
  const [stepIndex, setStepIndex] = useState(0);

  const step = steps[stepIndex];
  const stepProgress = ((stepIndex + 1) / steps.length) * 100;

  const canContinue = useMemo(() => {
    if (stepIndex === 0) {
      return (
        form.partnerType.length > 0 &&
        form.organisationName.trim().length > 1 &&
        (!form.website.trim() || isSafeHttpsUrl(form.website))
      );
    }

    if (stepIndex === 1) {
      return (
        form.suburb.trim().length > 1 &&
        form.stateOrRegion.trim().length > 1 &&
        form.coverage.length > 0 &&
        form.monthlyCases.length > 0
      );
    }

    if (stepIndex === 2) {
      return form.contactName.trim().length > 1 && isValidEmail(form.contactEmail);
    }

    return true;
  }, [form, stepIndex]);

  const mailtoHref = useMemo(() => {
    const subject = `Partner Interest - ${form.organisationName || "New organisation"}`;
    const body = buildEmailBody(form);
    return `mailto:${partnershipsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [form]);

  const setField = <K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGoal = (goal: string) => {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((existing) => existing !== goal)
        : [...prev.goals, goal],
    }));
  };

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="overflow-hidden rounded-[30px] border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 p-7 md:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Partner interest funnel
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                For veterinary clinics, shelters, and rescue organisations across Australia. Complete this short intake and we will follow up within 2 business days.
              </p>
            </div>
            <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-600 dark:text-teal-400">
              Step {stepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal-500 transition-all"
              style={{ width: `${stepProgress}%` }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = index === stepIndex;
              const complete = index < stepIndex;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left",
                    active
                      ? "border-primary bg-primary/5"
                      : complete
                        ? "border-teal-500/40 bg-teal-500/5"
                        : "border-border bg-background"
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em]">
                    {complete ? (
                      <CheckCircle2 className="h-4 w-4 text-teal-500" />
                    ) : (
                      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                    )}
                    <span className={cn(active ? "text-primary" : "text-muted-foreground")}>{item.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8 p-7 md:p-9">
          {step.id === "organisation" && (
            <div className="space-y-7">
              <div>
                <Label className="mb-3 block">Organisation type</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {partnerTypeOptions.map((option) => {
                    const selected = form.partnerType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setField("partnerType", option.value)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left transition",
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/30"
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{option.help}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="organisation-name" className="mb-2 block">
                    Organisation name
                  </Label>
                  <Input
                    id="organisation-name"
                    value={form.organisationName}
                    onChange={(event) => setField("organisationName", event.target.value)}
                    placeholder="Example: Northern Beaches Animal Shelter"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="mb-2 block">
                    Website (optional)
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    inputMode="url"
                    value={form.website}
                    onChange={(event) => setField("website", event.target.value)}
                    placeholder="https://"
                  />
                  {form.website && !isSafeHttpsUrl(form.website) ? (
                    <p className="mt-2 text-xs text-red-500">
                      Use a valid public https:// address. Other schemes and private-network links are not accepted.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {step.id === "operations" && (
            <div className="space-y-7">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="suburb" className="mb-2 block">
                    Suburb or city
                  </Label>
                  <Input
                    id="suburb"
                    value={form.suburb}
                    onChange={(event) => setField("suburb", event.target.value)}
                    placeholder="Example: Brisbane"
                  />
                </div>
                <div>
                  <Label htmlFor="state-region" className="mb-2 block">
                    State or region
                  </Label>
                  <Input
                    id="state-region"
                    value={form.stateOrRegion}
                    onChange={(event) => setField("stateOrRegion", event.target.value)}
                    placeholder="Example: QLD"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="coverage" className="mb-2 block">
                    Coverage area
                  </Label>
                  <select
                    id="coverage"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.coverage}
                    onChange={(event) => setField("coverage", event.target.value as CoverageType | "")}
                  >
                    <option value="">Select coverage</option>
                    {coverageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="case-load" className="mb-2 block">
                    Lost/found case volume
                  </Label>
                  <select
                    id="case-load"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.monthlyCases}
                    onChange={(event) => setField("monthlyCases", event.target.value as CaseLoadType | "")}
                  >
                    <option value="">Select monthly volume</option>
                    {caseLoadOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Partnership goals (optional)</Label>
                <div className="grid gap-2.5">
                  {goalOptions.map((goal) => {
                    const checked = form.goals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={cn(
                          "flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition",
                          checked
                            ? "border-teal-500/40 bg-teal-500/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-teal-500/30"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 h-4 w-4 rounded border",
                            checked ? "border-teal-500 bg-teal-500" : "border-muted-foreground/40"
                          )}
                        />
                        <span>{goal}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step.id === "contact" && (
            <div className="space-y-7">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contact-name" className="mb-2 block">
                    Contact name
                  </Label>
                  <Input
                    id="contact-name"
                    value={form.contactName}
                    onChange={(event) => setField("contactName", event.target.value)}
                    placeholder="Example: Priya Sharma"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-role" className="mb-2 block">
                    Role (optional)
                  </Label>
                  <Input
                    id="contact-role"
                    value={form.contactRole}
                    onChange={(event) => setField("contactRole", event.target.value)}
                    placeholder="Example: Operations Manager"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="contact-email" className="mb-2 block">
                    Contact email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => setField("contactEmail", event.target.value)}
                    placeholder="name@organisation.org.au"
                  />
                  {form.contactEmail && !isValidEmail(form.contactEmail) ? (
                    <p className="mt-2 text-xs text-red-500">Please enter a valid email address.</p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="contact-phone" className="mb-2 block">
                    Phone number (optional)
                  </Label>
                  <Input
                    id="contact-phone"
                    value={form.contactPhone}
                    onChange={(event) => setField("contactPhone", event.target.value)}
                    placeholder="Example: +61 4xx xxx xxx"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                  placeholder="Share anything useful for onboarding, integrations, or response timing."
                />
              </div>
            </div>
          )}

          {step.id === "review" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm">
                <h3 className="font-semibold text-foreground">Intake summary</h3>
                <dl className="mt-4 grid gap-3 text-muted-foreground md:grid-cols-2">
                  <div>
                    <dt className="font-medium text-foreground">Organisation type</dt>
                    <dd>{form.partnerType ? titleCase(form.partnerType) : "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Organisation name</dt>
                    <dd>{form.organisationName || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Location</dt>
                    <dd>
                      {[form.suburb, form.stateOrRegion].filter(Boolean).join(", ") || "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Coverage</dt>
                    <dd>{form.coverage ? titleCase(form.coverage) : "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Monthly case volume</dt>
                    <dd>{form.monthlyCases ? titleCase(form.monthlyCases) : "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Primary contact</dt>
                    <dd>{form.contactName || "Not provided"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5">
                <h3 className="font-semibold text-foreground">What happens next</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Submitting will open your email app with the completed intake details. Send it through and our partnerships team will reply within 2 business days.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Prefer direct email? Send the same details to <a className="font-semibold text-primary hover:underline" href={`mailto:${partnershipsEmail}`}>{partnershipsEmail}</a>.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="outline"
              className="min-w-[130px]"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="text-sm font-semibold text-muted-foreground transition hover:text-primary"
              >
                Need help first?
              </Link>

              {stepIndex < steps.length - 1 ? (
                <Button
                  type="button"
                  className="min-w-[130px]"
                  disabled={!canContinue}
                  onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button asChild className="min-w-[180px]">
                  <a href={mailtoHref}>
                    Submit via email
                    <Send className="ml-1.5 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
