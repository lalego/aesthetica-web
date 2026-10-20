import { Link } from 'react-router-dom'
import { useLang } from '@/i18n'
import { HUB_PAGE } from '@/content/pages'
import { LANDINGS, landingPath } from '@/content/landings'
import { PageLayout, PageHeader, type Crumb } from '@/components/layout/PageLayout'
import { TreatmentsSection } from '@/components/sections/TreatmentsSection'
import { BookingSection } from '@/components/sections/BookingSection'

interface TreatmentsHubProps {
  crumbs: Crumb[]
}

export const TreatmentsHub = ({ crumbs }: TreatmentsHubProps) => {
  const lang = useLang()
  const c = HUB_PAGE[lang]

  return (
    <PageLayout>
      <PageHeader crumbs={crumbs} h1={c.h1} intro={c.intro}>
        <ul className="flex flex-wrap gap-2 pt-2">
          {LANDINGS.filter((l) => l.kind === 'category').map((l) => (
            <li key={l.key}>
              <Link
                to={landingPath(l, lang)}
                className="inline-block px-5 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:border-gold-300 hover:text-gold-500 transition-colors"
              >
                {l.label[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </PageHeader>
      <TreatmentsSection />
      <BookingSection />
    </PageLayout>
  )
}
