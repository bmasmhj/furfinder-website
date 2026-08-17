import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Home, ShieldCheck, MapPin, ShieldAlert, PhoneCall, Shield } from 'lucide-react';
import Reveal from '@/components/marketing/Reveal';
import Magnetic from '@/components/marketing/Magnetic';

export const metadata: Metadata = {
  title: 'Pet Safety Guide - The Fur Finder',
  description: 'Essential tips for lost and found pet situations, safe handovers, and avoiding scams.',
};

const categories = [
  {
    icon: Search,
    title: 'When Your Pet Goes Missing',
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
    icon: Home,
    title: 'If You Find a Lost Pet',
    tips: [
      'Check for tags, collar, or microchip (any vet can scan)',
      'Post in local lost & found groups with photo and location',
      'Contact local council and animal shelters to report',
      'Provide food, water, and a safe space while searching for owner',
      'Do not chase the animal - use treats to coax them close',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Verify Ownership Before a Handover',
    tips: [
      'Ask the claimant for photos, records, microchip details, or distinctive features not shown publicly',
      'Arrange a microchip scan through a vet, shelter, council, or authorised registry where possible',
      'Do not reveal every identifying detail in a public post',
      'Remember that a report, message, or AI suggestion does not prove ownership',
    ],
  },
  {
    icon: MapPin,
    title: 'Meet Safely',
    tips: [
      'Meet in daylight at a public, well-lit location and bring another adult',
      'Prefer a vet, shelter, council facility, or police station when appropriate',
      'Keep communication in the app until you are comfortable sharing contact details',
      'Tell someone where you are going and do not enter an unfamiliar home alone',
    ],
  },
  {
    icon: ShieldAlert,
    title: 'Avoid Scams and Abuse',
    tips: [
      'Do not send deposits, gift cards, cryptocurrency, verification fees, or reward money before verification',
      'Be cautious of pressure, threats, copied photos, requests for login codes, and claims that cannot be checked',
      'Never share passwords, one-time codes, or full payment-card details',
      'Block and report users who harass, threaten, impersonate, scam, or post harmful content',
    ],
  },
  {
    icon: PhoneCall,
    title: 'Emergency Guidance',
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
    <div className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-20 text-center md:py-24">
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
          <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
            <Shield className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <Reveal as="h1" className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
            Pet safety guide
          </Reveal>
          <Reveal delay={60} className="mx-auto mt-4 max-w-lg font-body text-[16px] leading-relaxed text-forest/75">
            Essential tips for lost and found situations, safe handovers, and avoiding scams.
          </Reveal>
        </div>
      </section>

      <section className="border-t border-forest/10 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-x-14">
          {categories.map((category, index) => (
            <Reveal key={category.title} delay={(index % 4) * 60}>
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
                  <category.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h2 className="font-display text-[19px] italic leading-tight text-forest">{category.title}</h2>
              </div>
              <ul className="mt-4 space-y-2.5 border-t border-forest/10 pt-4">
                {category.tips.map((tip, i) => {
                  const isLink = tip.includes('Partner Network');
                  return (
                    <li key={i} className="flex items-start gap-2.5 font-body text-[14px] leading-relaxed text-forest/75">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                      {isLink ? (
                        <a
                          href="https://partners.thefurfinder.com/partner/signup"
                          target="_blank"
                          rel="noreferrer"
                          className="text-leaf-text underline decoration-2 underline-offset-4"
                        >
                          {tip}
                        </a>
                      ) : (
                        <span>{tip}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-forest/10 bg-forest px-6 py-16 text-center text-cream md:py-20">
        <Reveal className="mx-auto max-w-lg">
          <p className="font-body text-[15px] leading-relaxed text-cream/70">
            AI matches are suggestions. Verify ownership and identity before relying on them.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <Link href="/support" className="inline-flex items-center rounded-xl bg-amber px-6 py-3 font-body text-[15px] font-bold text-forest">
                Report abusive content
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/terms-of-use" className="inline-flex items-center rounded-xl border-[1.5px] border-cream/25 px-6 py-3 font-body text-[15px] font-bold text-cream transition-colors hover:border-cream/50">
                Community rules
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
