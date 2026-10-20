import { useLang } from '@/i18n'
import { ABOUT_PAGE } from '@/content/pages'
import { PageLayout, PageHeader, type Crumb } from '@/components/layout/PageLayout'
import { AboutSection } from '@/components/sections/AboutSection'
import { BookingSection } from '@/components/sections/BookingSection'

interface AboutPageProps {
  crumbs: Crumb[]
}

export const AboutPage = ({ crumbs }: AboutPageProps) => {
  const c = ABOUT_PAGE[useLang()]
  return (
    <PageLayout>
      <PageHeader crumbs={crumbs} h1={c.h1} />
      <AboutSection />
      <BookingSection />
    </PageLayout>
  )
}
