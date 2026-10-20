import type { Lang } from '@/i18n'
import type { Treatment } from '@/types'

// ─────────────────────────────────────────────────────────────────
//  EDITA AQUÍ — nombre y descripción en inglés y ucraniano de cada
//  tratamiento, por id. La tabla `treatments` solo los tiene en
//  castellano: si añades uno en el panel y no lo pones aquí, en /en
//  y /uk sale en castellano.
// ─────────────────────────────────────────────────────────────────
const EN: Record<string, { name: string; description: string }> = {
  f1:  { name: 'Classic Facial', description: 'Deep cleansing with extraction of impurities for fresh, balanced skin.' },
  f2:  { name: 'Hydroface Plus — Advanced Deep Cleansing', description: 'Advanced facial with hydrodermabrasion for renewed, radiant skin.' },
  f3:  { name: 'Diamond-Tip Microdermabrasion', description: 'Mechanical exfoliation that removes dead skin cells and boosts cell renewal.' },
  f4:  { name: "Men's Facial with Microdermabrasion", description: "Cleansing facial adapted to men's skin, with microdermabrasion." },
  f5:  { name: 'Maria Galland [Skin]Biosis Premium Facial', description: 'High-end facial with Maria Galland professional skincare.' },
  f6:  { name: 'IPL Photorejuvenation', description: 'Latest-generation pulsed light for sun spots, redness and uneven tone.' },
  f7:  { name: 'Hollywood Laser Peel ND-YAG', description: 'Carbon peel with ND-YAG laser for refined pores and instant glow.' },
  f8:  { name: 'Radiofrequency with Vitamins', description: 'Radiofrequency combined with vitamins for firmness and radiance.' },
  f9:  { name: 'Radiofrequency with Alginate Mask', description: 'Firming radiofrequency finished with a soothing alginate mask.' },
  f10: { name: 'Hydro Kiss', description: 'Intense hydration treatment with hyaluronic acid.' },
  f11: { name: 'Myofascial Lifting Massage', description: 'Manual facial technique that works on the fascia for a lifting effect.' },
  f12: { name: 'Microneedling with Vitamin Cocktail', description: 'Stimulates skin renewal and boosts absorption of a vitamin cocktail.' },
  f13: { name: 'Dermatology Facial Peel', description: 'Professional peel that renews the skin and improves spots and texture.' },
  f14: { name: 'Enzyme Therapy', description: 'Gentle enzymatic exfoliation that purifies and renews the skin.' },
  f15: { name: 'Facial Carboxytherapy', description: 'CO₂ treatment to improve skin oxygenation and radiance.' },
  f16: { name: 'Eye Pressotherapy', description: 'Pressure massage for the eye area to reduce puffiness and bags.' },
  c1:  { name: 'Premium Therapeutic Pressotherapy', description: 'Pressure drainage for tired legs and fluid retention.' },
  c2:  { name: 'Body and Eye Pressotherapy', description: 'Combined body and eye pressotherapy session.' },
  c3:  { name: 'Full-Body Massage (60 min)', description: 'Full-body massage to release tension and relax.' },
  c4:  { name: 'Full-Body Massage (90 min)', description: 'Extended version of our full-body massage.' },
  c5:  { name: 'Relaxing Aromatherapy Massage', description: 'Gentle massage with essential oils.' },
  c6:  { name: 'Abdominal Toning — Standard', description: 'Abdominal toning treatment.' },
  c7:  { name: 'Abdominal Toning — Premium', description: 'Premium abdominal toning session.' },
  c8:  { name: 'Body Sculpture with Pressotherapy', description: 'Body contouring combined with pressotherapy.' },
  c9:  { name: 'Body Mesotherapy', description: 'Body treatment with active ingredients, without needles.' },
  c10: { name: 'Body Scrub with Hydration', description: 'Body exfoliation followed by deep hydration.' },
  l1:  { name: 'Laser Hair Removal (per area)', description: 'Diode laser hair removal by area.' },
  l2:  { name: "Diode Laser Hair Removal — Women's Full Body", description: 'Full-body diode laser hair removal session for women.' },
  l3:  { name: "Diode Laser Hair Removal — Men's Full Body", description: 'Full-body diode laser hair removal session for men.' },
  l4:  { name: 'IPL Hair Removal', description: 'Highly effective intense pulsed light hair removal.' },
  cap1: { name: 'Scalp Mesotherapy (12-session course)', description: 'Course of 12 sessions to strengthen hair.' },
  b1:  { name: 'Mum-to-Be Package', description: 'Treatment package designed for pregnancy.' },
  b2:  { name: 'Bridal Beauty Package — Standard', description: 'Complete package to look your best on your wedding day.' },
  b3:  { name: 'Bridal Beauty Package — Premium', description: 'Premium version of our bridal package.' },
  b4:  { name: 'Wellness Moment for Two', description: 'Relaxation experience for two people.' },
  b5:  { name: 'Relaxation Ritual for Two', description: 'Extended wellness ritual for two people.' },
  b6:  { name: 'Gift Card', description: 'Give a unique experience at Estudio AestheticA.' },
}

const UK: Record<string, { name: string; description: string }> = {
  f1:  { name: 'Класична чистка обличчя', description: 'Глибоке очищення з видаленням забруднень для свіжої та збалансованої шкіри.' },
  f2:  { name: 'Hydroface Plus — глибоке очищення', description: 'Розширена чистка з гідродермабразією для оновленої та сяючої шкіри.' },
  f3:  { name: 'Діамантова мікродермабразія', description: 'Механічний пілінг, що видаляє відмерлі клітини та стимулює оновлення шкіри.' },
  f4:  { name: 'Чоловіча чистка обличчя з мікродермабразією', description: 'Чистка, адаптована до чоловічої шкіри, з мікродермабразією.' },
  f5:  { name: 'Преміум-догляд Maria Galland [Skin]Biosis', description: 'Догляд найвищого класу з професійною косметикою Maria Galland.' },
  f6:  { name: 'IPL-фотоомолодження', description: 'Імпульсне світло нового покоління від пігментних плям, почервонінь і нерівного тону.' },
  f7:  { name: 'Голлівудський пілінг ND-YAG', description: 'Карбоновий пілінг лазером ND-YAG: звужені пори та миттєве сяйво.' },
  f8:  { name: 'Радіочастотний ліфтинг з вітамінами', description: 'Радіочастотний ліфтинг у поєднанні з вітамінами для пружності та сяйва.' },
  f9:  { name: 'Радіочастотний ліфтинг з альгінатною маскою', description: 'Зміцнювальний радіочастотний ліфтинг із заспокійливою альгінатною маскою.' },
  f10: { name: 'Hydro Kiss', description: 'Інтенсивне зволоження з гіалуроновою кислотою.' },
  f11: { name: 'Міофасціальний ліфтинг-масаж', description: 'Мануальна техніка для обличчя, що працює з фасціями для ефекту ліфтингу.' },
  f12: { name: 'Мікронідлінг з вітамінним коктейлем', description: 'Стимулює оновлення шкіри та покращує засвоєння вітамінного коктейлю.' },
  f13: { name: 'Пілінг Dermatology для обличчя', description: 'Професійний пілінг, що оновлює шкіру та покращує плями й текстуру.' },
  f14: { name: 'Ензимотерапія', description: 'М’який ензимний пілінг, що очищає та оновлює шкіру.' },
  f15: { name: 'Карбокситерапія обличчя', description: 'Процедура з CO₂ для кращої оксигенації та сяйва шкіри.' },
  f16: { name: 'Пресотерапія для очей', description: 'Компресійний масаж зони навколо очей проти набряків і мішків.' },
  c1:  { name: 'Терапевтична пресотерапія преміум', description: 'Компресійний дренаж для втомлених ніг і затримки рідини.' },
  c2:  { name: 'Пресотерапія для тіла та очей', description: 'Комбінований сеанс пресотерапії для тіла та зони очей.' },
  c3:  { name: 'Масаж всього тіла (60 хв)', description: 'Масаж всього тіла для зняття напруги та розслаблення.' },
  c4:  { name: 'Масаж всього тіла (90 хв)', description: 'Розширена версія масажу всього тіла.' },
  c5:  { name: 'Релакс-масаж з ароматерапією', description: 'М’який масаж з ефірними оліями.' },
  c6:  { name: 'Тонус живота — стандарт', description: 'Процедура для тонусу м’язів живота.' },
  c7:  { name: 'Тонус живота — преміум', description: 'Преміум-сеанс для тонусу м’язів живота.' },
  c8:  { name: 'Body Sculpture з пресотерапією', description: 'Моделювання фігури в поєднанні з пресотерапією.' },
  c9:  { name: 'Мезотерапія тіла', description: 'Процедура для тіла з активними компонентами, без голок.' },
  c10: { name: 'Пілінг тіла зі зволоженням', description: 'Пілінг тіла з подальшим глибоким зволоженням.' },
  l1:  { name: 'Лазерна епіляція (зона)', description: 'Діодна лазерна епіляція окремої зони.' },
  l2:  { name: 'Діодна лазерна епіляція — жінки, все тіло', description: 'Сеанс діодної лазерної епіляції всього тіла для жінок.' },
  l3:  { name: 'Діодна лазерна епіляція — чоловіки, все тіло', description: 'Сеанс діодної лазерної епіляції всього тіла для чоловіків.' },
  l4:  { name: 'Епіляція імпульсним світлом (IPL)', description: 'Ефективна епіляція інтенсивним імпульсним світлом.' },
  cap1: { name: 'Мезотерапія шкіри голови (12 сеансів)', description: 'Курс із 12 сеансів для зміцнення волосся.' },
  b1:  { name: 'Пакет «Майбутня мама»', description: 'Пакет процедур, створений спеціально для вагітних.' },
  b2:  { name: 'Б’юті-пакет для нареченої — стандарт', description: 'Повний пакет, щоб виглядати чудово в день весілля.' },
  b3:  { name: 'Б’юті-пакет для нареченої — преміум', description: 'Преміум-версія пакету для нареченої.' },
  b4:  { name: 'Момент релаксу для двох', description: 'Розслаблюючий досвід для двох людей.' },
  b5:  { name: 'Ритуал релаксу для двох', description: 'Розширений ритуал релаксу для двох людей.' },
  b6:  { name: 'Подарунковий сертифікат', description: 'Подаруйте незабутні враження в Estudio AestheticA.' },
}
// ─────────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<Exclude<Lang, 'es'>, typeof EN> = { en: EN, uk: UK }

/** Nombre y descripción del tratamiento en el idioma pedido (castellano si falta la traducción). */
export const localizeTreatment = (t: Treatment, lang: Lang): Treatment => {
  const tr = lang === 'es' ? undefined : TRANSLATIONS[lang][t.id]
  return tr ? { ...t, ...tr } : t
}
