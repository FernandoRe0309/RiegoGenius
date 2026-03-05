import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { SensorsPreview } from "@/components/landing/sensors-preview"
import { OpenSourceSection } from "@/components/landing/open-source-section"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <SensorsPreview />
        <OpenSourceSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
