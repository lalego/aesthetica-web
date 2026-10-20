import { useId } from 'react'
import type { Lang } from '@/i18n'

interface LangFlagProps {
  lang: Lang
  className?: string
}

// Banderas en SVG y no emoji: Windows no dibuja los emoji de banderas (salen
// las letras "GB"/"ES"/"UA"). Todas se recortan al mismo marco 3:2 con `slice`.
export const LangFlag = ({ lang, className }: LangFlagProps) => {
  // useId: el Navbar pinta el selector dos veces (móvil y escritorio) y los
  // clipPath necesitan ids únicos; useId da el mismo id en el prerender y al hidratar.
  const id = useId()

  if (lang === 'uk') {
    return (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <rect width="3" height="1" fill="#0057B7" />
        <rect y="1" width="3" height="1" fill="#FFD700" />
      </svg>
    )
  }

  if (lang === 'es') {
    return (
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
        <rect width="3" height="2" fill="#AA151B" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <clipPath id={`${id}-t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}
