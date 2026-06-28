import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { TreatmentsSection } from '@/components/sections/TreatmentsSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { BookingSection } from '@/components/sections/BookingSection'
import { ContactSection } from '@/components/sections/ContactSection'

export const Home = () => {
  const handleBookingClick = () => {
    document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <HeroSection onBookingClick={handleBookingClick} />
        <TreatmentsSection />
        <AboutSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}