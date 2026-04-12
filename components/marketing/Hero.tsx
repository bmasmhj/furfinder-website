import Image from 'next/image'
import Mobile from '@/assets/images/mobile.png'
import { Globe } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Decorative blobs */}
      <div className="hero-blob hero-blob--1" />
      <div className="hero-blob hero-blob--2" />

      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-x-16 relative z-10">
        <div className="flex flex-col justify-center gap-7 max-w-2xl">
          <div className="hero-pill max-w-fit">
            &#x1F1E6;&#x1F1FA; Australia&apos;s First AI-Powered Pet Recovery App
          </div>

          <h1>
            Helping bring{' '}
            <span className="accent hero-accent-glow">lost pets</span> home,{' '}
            <em className="hero-em">faster.</em>
          </h1>

          <p className="sub">
            Report a lost or found pet, let our AI scan photos for matches, and
            connect with your community — all in one app. Free to download and
            use.
          </p>

          {/* Trust indicators */}
          <div className="hero-trust-row">
            <span className="hero-trust-item">
              Free to download
            </span>
            <span className="hero-trust-item !text-[#FF6B4A] px-2">
              iOS &amp; Android
            </span>
            <span className="hero-trust-item">
              Australia-wide
            </span>
          </div>

          <div className="hero-buttons">
            <a
              href="https://apps.apple.com/app/id6759967208"
              className="btn-primary w-full md:w-auto"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download on App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.petreunite.app"
              className="btn-secondary w-full md:w-auto"
              target="_blank"
              rel="noreferrer"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Get on Google Play
            </a>
            <a href="https://app.thefurfinder.com" className="btn-secondary w-full md:w-auto hover:!text-white">
              <Globe size={18} className="btn-icon" />
              Try on Web
            </a>
          </div>
        </div>

        <div className="hero-image-wrap hidden md:flex">
          <div className="hero-phone-glow" />
          <Image
            src={Mobile}
            alt="The Fur Finder mobile app"
            width={300}
            height={580}
            className="hero-phone-img"
            priority
          />
        </div>
      </div>
    </section>
  )
}
