import { Shield, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const categories = [
  {
    title: 'When Your Pet Goes Missing',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    tips: [
      'Search your home and neighborhood thoroughly first',
      "Contact local shelters and vets with your pet's description",
      'Post on social media and community groups immediately',
      'Put out familiar items (bed, toys) near your home',
      'Check with microchip company to ensure contact details are current',
      'Browse our Partner Network for local vets, shelters & rescue groups',
    ],
  },
  {
    title: 'If You Find a Lost Pet',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    tips: [
      'Check for tags, collar, or microchip (any vet can scan)',
      'Post in local lost & found groups with photo and location',
      'Contact local council and animal shelters to report',
      'Provide food, water, and a safe space while searching for owner',
      'Do not chase the animal - use treats to coax them close',
    ],
  },
  {
    title: 'Verify Ownership Before a Handover',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    tips: [
      'Ask the claimant for photos, records, microchip details, or distinctive features not shown publicly',
      'Arrange a microchip scan through a vet, shelter, council, or authorised registry where possible',
      'Do not reveal every identifying detail in a public post',
      'Remember that a report, message, or AI suggestion does not prove ownership',
    ],
  },
  {
    title: 'Meet Safely',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    tips: [
      'Meet in daylight at a public, well-lit location and bring another adult',
      'Prefer a vet, shelter, council facility, or police station when appropriate',
      'Keep communication in the app until you are comfortable sharing contact details',
      'Tell someone where you are going and do not enter an unfamiliar home alone',
    ],
  },
  {
    title: 'Avoid Scams and Abuse',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    tips: [
      'Do not send deposits, gift cards, cryptocurrency, verification fees, or reward money before verification',
      'Be cautious of pressure, threats, copied photos, requests for login codes, and claims that cannot be checked',
      'Never share passwords, one-time codes, or full payment-card details',
      'Block and report users who harass, threaten, impersonate, scam, or post harmful content',
    ],
  },
  {
    title: 'Emergency Guidance',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    tips: [
      'Call 000 in Australia when a person is in immediate danger',
      'Contact the nearest emergency veterinarian when an animal is injured or critically unwell',
      'Contact local police, council animal services, or an animal-welfare authority for urgent welfare concerns',
      'The Fur Finder is not an emergency or veterinary service',
    ],
  },
];

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 pb-8 pt-6 text-white">
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Shield size={20} />
          </div>
          <h1 className="text-2xl font-bold">Pet Safety Guide</h1>
          <p className="text-sm text-white/80">
            Essential tips for lost & found situations
          </p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        {categories.map((category, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-foreground">{category.title}</h2>

            <div className="space-y-2">
              {category.tips.map((tip, i) => {
                const isLink = tip.includes("Partner Network");

                return (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className={`${category.color} mt-1`} size={18} />
                    {isLink ? (
                      <Link
                        href="/partner-registration"
                        className="text-sm text-emerald-600 underline dark:text-emerald-400"
                      >
                        {tip}
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="space-y-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-center text-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Sparkles />
          </div>
          <p className="text-sm">
            AI matches are suggestions. Verify ownership and identity before relying on them.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/support" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
              Report abusive content
            </Link>
            <Link href="/terms-of-use" className="rounded-lg border border-white/50 px-4 py-2 text-sm font-semibold text-white">
              Community rules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
