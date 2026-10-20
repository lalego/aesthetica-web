import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { HeroSection } from '@/components/sections/HeroSection'
import { TreatmentsSection } from '@/components/sections/TreatmentsSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { BookingSection } from '@/components/sections/BookingSection'
import { ContactSection } from '@/components/sections/ContactSection'

export const Home = () => {
  const { hash } = useLocation()

  // Los enlaces "/#agendar" desde otras páginas llegan aquí con el ancla.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  const handleBookingClick = () => {
    document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <PageLayout>
      <div className="pt-16">
        <HeroSection onBookingClick={handleBookingClick} />
        <TreatmentsSection />
        <AboutSection />
        <BookingSection />
        <ContactSection />
      </div>
    </PageLayout>
  )
}
