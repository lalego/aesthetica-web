import { HeroSection } from '@/components/sections/HeroSection'
import { ContactSection } from '@/components/sections/ContactSection'

export const Home = () => {
  const handleBookingClick = () => {
    // Por ahora solo hacemos scroll a contacto
    // Después aquí abres el modal de agendar cita
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      <HeroSection onBookingClick={handleBookingClick} />
      <ContactSection />
    </main>
  )
}