import { useLang } from '@/i18n'
import { CONTACT_PAGE } from '@/content/pages'
import { PageLayout, PageHeader, type Crumb } from '@/components/layout/PageLayout'
import { ContactSection } from '@/components/sections/ContactSection'
import { BookingSection } from '@/components/sections/BookingSection'

interface ContactPageProps {
  crumbs: Crumb[]
}

export const ContactPage = ({ crumbs }: ContactPageProps) => {
  const c = CONTACT_PAGE[useLang()]
  return (
    <PageLayout>
      <PageHeader crumbs={crumbs} h1={c.h1} intro={c.intro} />
      <ContactSection />
      <BookingSection />
    </PageLayout>
  )
}
