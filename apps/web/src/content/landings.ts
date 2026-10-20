import { PATHS, type Lang } from '@/i18n'
import type { Treatment, TreatmentCategory } from '@/types'

// ─────────────────────────────────────────────────────────────────
//  EDITA AQUÍ — textos SEO de las páginas de tratamientos.
//  Precio y duración salen de Supabase (tabla `treatments`); aquí
//  solo va el texto. `match` decide qué tratamientos se listan.
//  Reglas: un solo H1 por página, título ≤ 60 caracteres y
//  descripción ≤ 155. Sin lenguaje médico: es un estudio de estética.
// ─────────────────────────────────────────────────────────────────

export interface LandingCopy {
  title: string
  description: string
  h1: string
  intro: string[]
  sections: { h2: string; paragraphs: string[] }[]
  faqs: { q: string; a: string }[]
}

export interface Landing {
  key: string
  kind: 'category' | 'treatment'
  /** Página de categoría de la que cuelga (para las migas de pan). */
  parent?: string
  /** Nombre corto para migas de pan y enlaces. */
  label: Record<Lang, string>
  /** Ruta en castellano y en inglés; el ucraniano usa la inglesa, para no tener URLs en cirílico. */
  slug: { es: string; en: string }
  match: { categories?: TreatmentCategory[]; ids?: string[]; excludeIds?: string[] }
  copy: Record<Lang, LandingCopy>
}

export const LANDINGS: Landing[] = [
  // ── Categorías ────────────────────────────────────────────────
  {
    key: 'faciales',
    label: { es: 'Faciales', en: 'Facials', uk: 'Обличчя' },
    kind: 'category',
    slug: { es: 'faciales', en: 'facials' },
    match: { categories: ['facial'], excludeIds: ['f11'] },
    copy: {
      es: {
        title: 'Tratamientos Faciales en Valencia (Ruzafa) | AestheticA',
        description: 'Limpiezas faciales, Hydroface Plus, Hollywood Peeling, radiofrecuencia y fotorejuvenecimiento en Ruzafa, Valencia. Valoración personalizada.',
        h1: 'Tratamientos faciales en Valencia',
        intro: [
          'En nuestro estudio de Ruzafa diseñamos cada tratamiento facial a partir de una valoración de tu piel: tipo, sensibilidad, manchas, poros o pérdida de firmeza. Así combinamos la técnica adecuada en lugar de aplicar un protocolo estándar.',
          'Trabajamos con aparatología de estética avanzada (hidrodermabrasión, láser ND-YAG, luz pulsada y radiofrecuencia) y con cosmética profesional.',
        ],
        sections: [
          {
            h2: 'Limpieza facial profunda en Ruzafa',
            paragraphs: [
              'La limpieza facial es la base de cualquier rutina: elimina impurezas, desobstruye poros y prepara la piel para que los activos penetren mejor. Desde la limpieza básica hasta Hydroface Plus, con hidrodermabrasión, o la microdermabrasión con punta de diamante.',
            ],
          },
          {
            h2: 'Rejuvenecimiento facial sin agujas',
            paragraphs: [
              'Para la firmeza, las líneas finas y la luminosidad usamos radiofrecuencia, Hollywood Peeling con láser y fotorejuvenecimiento con luz pulsada. Son técnicas no invasivas, sin agujas, que te permiten seguir con tu día al salir del estudio.',
            ],
          },
          {
            h2: '¿Qué tratamiento facial necesito?',
            paragraphs: [
              'Depende de tu piel y de tu objetivo. En la primera visita valoramos la piel y te proponemos un plan con número de sesiones y precio cerrado, sin compromiso.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Cada cuánto conviene hacerse una limpieza facial?',
            a: 'Como orientación, una vez al mes o cada seis semanas, que es lo que tarda la piel en renovarse. En pieles grasas o con tendencia acneica puede convenir con más frecuencia.',
          },
          {
            q: '¿Los tratamientos faciales dejan marcas?',
            a: 'Los tratamientos de nuestro estudio no son invasivos. Algunos pueden dejar un ligero enrojecimiento que desaparece en pocas horas.',
          },
        ],
      },
      en: {
        title: 'Facial Treatments in Valencia (Ruzafa) | AestheticA',
        description: 'Deep cleansing facials, Hydroface Plus, Hollywood Peel, radiofrequency and photorejuvenation in Ruzafa, Valencia. Personalised skin assessment.',
        h1: 'Facial treatments in Valencia',
        intro: [
          'At our studio in Ruzafa every facial starts with a skin assessment: skin type, sensitivity, pigmentation, pores or loss of firmness. That way we combine the right techniques instead of applying a one-size-fits-all protocol.',
          'We work with advanced aesthetic devices (hydrodermabrasion, ND-YAG laser, intense pulsed light and radiofrequency) and professional skincare.',
        ],
        sections: [
          {
            h2: 'Deep cleansing facials in Ruzafa',
            paragraphs: [
              'A facial cleanse is the foundation of any skincare routine: it removes impurities, unclogs pores and helps active ingredients absorb better. From our classic facial to Hydroface Plus with hydrodermabrasion or diamond-tip microdermabrasion.',
            ],
          },
          {
            h2: 'Needle-free facial rejuvenation',
            paragraphs: [
              'For firmness, fine lines and radiance we use radiofrequency, the Hollywood laser peel and IPL photorejuvenation. They are non-invasive, needle-free treatments, so you can carry on with your day afterwards.',
            ],
          },
          {
            h2: 'Which facial is right for me?',
            paragraphs: [
              'It depends on your skin and your goals. At your first visit we assess your skin and suggest a plan with the number of sessions and a fixed price, with no obligation.',
            ],
          },
        ],
        faqs: [
          {
            q: 'How often should I get a facial?',
            a: 'As a rule of thumb, once a month or every six weeks, which is roughly how long skin takes to renew. Oily or acne-prone skin may benefit from more frequent sessions.',
          },
          {
            q: 'Will a facial leave marks?',
            a: 'Our treatments are non-invasive. Some may cause slight redness that fades within a few hours.',
          },
        ],
      },
      uk: {
        title: 'Догляд за обличчям у Валенсії (Руссафа) | AestheticA',
        description: 'Чистка обличчя, Hydroface Plus, голлівудський пілінг, RF-ліфтинг і фотоомолодження в Руссафі, Валенсія. Індивідуальна консультація.',
        h1: 'Процедури для обличчя у Валенсії',
        intro: [
          'У нашій студії в Руссафі кожна процедура для обличчя починається з оцінки шкіри: тип, чутливість, пігментація, пори чи втрата пружності. Так ми поєднуємо потрібні техніки замість стандартного протоколу.',
          'Ми працюємо з апаратами естетичної косметології (гідродермабразія, лазер ND-YAG, імпульсне світло та радіочастотний ліфтинг) і професійною косметикою.',
        ],
        sections: [
          {
            h2: 'Глибока чистка обличчя в Руссафі',
            paragraphs: [
              'Чистка обличчя — основа будь-якого догляду: вона видаляє забруднення, очищає пори й допомагає активним компонентам краще проникати. Від класичної чистки до Hydroface Plus з гідродермабразією чи діамантової мікродермабразії.',
            ],
          },
          {
            h2: 'Омолодження обличчя без голок',
            paragraphs: [
              'Для пружності, дрібних зморшок і сяйва ми використовуємо радіочастотний ліфтинг, голлівудський лазерний пілінг і фотоомолодження імпульсним світлом. Це неінвазивні процедури без голок, тож після них можна одразу повертатися до своїх справ.',
            ],
          },
          {
            h2: 'Яка процедура мені підходить?',
            paragraphs: [
              'Це залежить від вашої шкіри та мети. На першому візиті ми оцінюємо шкіру й пропонуємо план із кількістю сеансів і фіксованою ціною, без зобов’язань.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Як часто варто робити чистку обличчя?',
            a: 'Орієнтовно раз на місяць або раз на шість тижнів — приблизно стільки триває оновлення шкіри. Для жирної шкіри чи шкіри, схильної до акне, може знадобитися частіше.',
          },
          {
            q: 'Чи залишають процедури сліди?',
            a: 'Наші процедури неінвазивні. Деякі можуть спричинити легке почервоніння, яке минає за кілька годин.',
          },
        ],
      },
    },
  },
  {
    key: 'depilacion-laser',
    label: { es: 'Depilación láser', en: 'Laser hair removal', uk: 'Лазерна епіляція' },
    kind: 'category',
    slug: { es: 'depilacion-laser', en: 'laser-hair-removal' },
    match: { categories: ['laser'] },
    copy: {
      es: {
        title: 'Depilación Láser Diodo en Valencia (Ruzafa) | AestheticA',
        description: 'Depilación láser diodo para mujer y hombre en Ruzafa, Valencia. Por zonas o cuerpo completo. Valoración previa y precios claros.',
        h1: 'Depilación láser diodo en Valencia',
        intro: [
          'Despídete de la cuchilla y la cera. En nuestro estudio de Ruzafa hacemos depilación láser de diodo para mujer y hombre, por zonas o de cuerpo completo, y también depilación con luz pulsada (LPL).',
          'Antes de la primera sesión revisamos tu tipo de piel y de vello para ajustar los parámetros y decirte cuántas sesiones vas a necesitar.',
        ],
        sections: [
          {
            h2: '¿Cómo funciona el láser de diodo?',
            paragraphs: [
              'El láser emite una luz que absorbe la melanina del vello. Ese calor llega al folículo y reduce su capacidad de volver a producir pelo. Por eso funciona mejor con vello oscuro, y por eso hacen falta varias sesiones: solo actúa sobre el vello que está en fase de crecimiento.',
            ],
          },
          {
            h2: 'Sesiones y resultados',
            paragraphs: [
              'Lo habitual son entre 6 y 10 sesiones, separadas varias semanas según la zona. Desde las primeras sesiones el vello sale más fino y en menor cantidad. Te damos un calendario orientativo en la valoración.',
            ],
          },
          {
            h2: 'Depilación láser para hombre en Valencia',
            paragraphs: [
              'Tenemos bonos de cuerpo completo para hombre y zonas habituales como espalda, pecho o barba. El protocolo se adapta a un vello más denso.',
            ],
          },
          {
            h2: 'Antes y después de la sesión',
            paragraphs: [
              'Rasura la zona el día anterior, no uses cera ni pinzas durante el tratamiento y evita el sol o los autobronceadores en los días previos y posteriores. Después, usa protector solar en las zonas expuestas.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿La depilación láser duele?',
            a: 'Se nota un calor o un pequeño pinchazo, según la zona. El cabezal enfría la piel durante la sesión, así que la mayoría de clientas lo tolera sin problema.',
          },
          {
            q: '¿Funciona con el vello rubio o canoso?',
            a: 'El láser necesita melanina para actuar, así que en el vello muy claro, pelirrojo o blanco es poco eficaz. Lo valoramos contigo antes de empezar.',
          },
          {
            q: '¿Se puede hacer en verano?',
            a: 'Sí, siempre que no tomes el sol en las zonas tratadas y uses protección solar. Si tienes la piel muy bronceada, esperamos a que baje el bronceado.',
          },
          {
            q: '¿Qué diferencia hay entre láser de diodo y luz pulsada?',
            a: 'El diodo emite una sola longitud de onda muy concentrada y suele necesitar menos sesiones. La luz pulsada (LPL) abarca un espectro más amplio y es una alternativa para zonas pequeñas o determinados tipos de piel.',
          },
        ],
      },
      en: {
        title: 'Laser Hair Removal in Valencia (Ruzafa) | AestheticA',
        description: 'Diode laser hair removal for women and men in Ruzafa, Valencia. Single areas or full body. Prior assessment and clear prices.',
        h1: 'Diode laser hair removal in Valencia',
        intro: [
          'Say goodbye to razors and wax. At our studio in Ruzafa we offer diode laser hair removal for women and men, for single areas or full body, as well as IPL hair removal.',
          'Before your first session we check your skin and hair type to adjust the settings and tell you how many sessions you will need.',
        ],
        sections: [
          {
            h2: 'How does diode laser work?',
            paragraphs: [
              'The laser emits light that is absorbed by the melanin in the hair. The heat reaches the follicle and reduces its ability to grow new hair. That is why it works best on dark hair, and why several sessions are needed: it only acts on hair in its growth phase.',
            ],
          },
          {
            h2: 'Sessions and results',
            paragraphs: [
              'Most people need between 6 and 10 sessions, a few weeks apart depending on the area. From the first sessions hair grows back finer and sparser. We give you an estimated schedule at your assessment.',
            ],
          },
          {
            h2: 'Laser hair removal for men in Valencia',
            paragraphs: [
              'We offer full-body packages for men and common areas such as back, chest or beard. The protocol is adapted to denser hair.',
            ],
          },
          {
            h2: 'Before and after your session',
            paragraphs: [
              'Shave the area the day before, do not wax or pluck during the course of treatment, and avoid sun exposure or self-tanners in the days before and after. Afterwards, use sunscreen on exposed areas.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Does laser hair removal hurt?',
            a: 'You feel warmth or a slight snap depending on the area. The handpiece cools the skin during the session, so most clients find it very tolerable.',
          },
          {
            q: 'Does it work on blonde or grey hair?',
            a: 'The laser needs melanin to work, so it is not very effective on very light, red or white hair. We assess this with you before starting.',
          },
          {
            q: 'Can I do it in summer?',
            a: 'Yes, as long as you avoid sun exposure on treated areas and use sunscreen. If your skin is very tanned, we wait for the tan to fade.',
          },
          {
            q: 'What is the difference between diode laser and IPL?',
            a: 'Diode laser emits a single, highly concentrated wavelength and usually needs fewer sessions. IPL covers a broader spectrum and is an alternative for small areas or certain skin types.',
          },
        ],
      },
      uk: {
        title: 'Лазерна епіляція у Валенсії (Руссафа) | AestheticA',
        description: 'Діодна лазерна епіляція для жінок і чоловіків у Руссафі, Валенсія. Окремі зони або все тіло. Попередня консультація та зрозумілі ціни.',
        h1: 'Діодна лазерна епіляція у Валенсії',
        intro: [
          'Забудьте про бритву та віск. У нашій студії в Руссафі ми робимо діодну лазерну епіляцію для жінок і чоловіків — окремих зон або всього тіла, а також епіляцію імпульсним світлом (IPL).',
          'Перед першим сеансом ми оцінюємо тип вашої шкіри та волосся, щоб налаштувати параметри й сказати, скільки сеансів знадобиться.',
        ],
        sections: [
          {
            h2: 'Як працює діодний лазер?',
            paragraphs: [
              'Лазер випромінює світло, яке поглинає меланін волосини. Тепло досягає фолікула й зменшує його здатність знову виробляти волосся. Тому лазер найкраще працює на темному волоссі, і тому потрібно кілька сеансів: він діє лише на волосся у фазі росту.',
            ],
          },
          {
            h2: 'Сеанси та результати',
            paragraphs: [
              'Зазвичай потрібно від 6 до 10 сеансів з інтервалом у кілька тижнів залежно від зони. Уже після перших сеансів волосся стає тоншим і рідшим. Орієнтовний графік ми складемо на консультації.',
            ],
          },
          {
            h2: 'Лазерна епіляція для чоловіків у Валенсії',
            paragraphs: [
              'Ми пропонуємо пакети на все тіло для чоловіків і популярні зони: спина, груди чи борода. Протокол адаптується до густішого волосся.',
            ],
          },
          {
            h2: 'До і після сеансу',
            paragraphs: [
              'Поголіть зону напередодні, не використовуйте віск чи пінцет протягом курсу та уникайте сонця й автозасмаги кілька днів до і після сеансу. Після процедури наносьте сонцезахисний крем на відкриті ділянки.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Чи болить лазерна епіляція?',
            a: 'Відчувається тепло або легке поколювання залежно від зони. Насадка охолоджує шкіру під час сеансу, тому більшість клієнток переносять процедуру без проблем.',
          },
          {
            q: 'Чи діє лазер на світле або сиве волосся?',
            a: 'Лазеру потрібен меланін, тому на дуже світлому, рудому чи сивому волоссі він малоефективний. Ми оцінимо це разом з вами перед початком.',
          },
          {
            q: 'Чи можна робити епіляцію влітку?',
            a: 'Так, якщо не засмагати на оброблених зонах і користуватися сонцезахисним кремом. Якщо шкіра дуже засмагла, краще зачекати, поки засмага зійде.',
          },
          {
            q: 'Чим відрізняється діодний лазер від імпульсного світла?',
            a: 'Діодний лазер випромінює одну дуже концентровану довжину хвилі й зазвичай потребує менше сеансів. Імпульсне світло (IPL) має ширший спектр і є альтернативою для невеликих зон або певних типів шкіри.',
          },
        ],
      },
    },
  },
  {
    key: 'corporales',
    label: { es: 'Corporales', en: 'Body', uk: 'Тіло' },
    kind: 'category',
    slug: { es: 'corporales', en: 'body' },
    match: { categories: ['corporal', 'capilar'], excludeIds: ['c3', 'c4', 'c5'] },
    copy: {
      es: {
        title: 'Tratamientos Corporales en Valencia (Ruzafa) | AestheticA',
        description: 'Presoterapia, Body Sculpture, tonificación abdominal, mesoterapia sin agujas y peeling corporal en Ruzafa, Valencia.',
        h1: 'Tratamientos corporales en Valencia',
        intro: [
          'Tratamientos para piernas cansadas, retención de líquidos, tonificación y cuidado de la piel del cuerpo. Combinamos aparatología y técnicas manuales según tu objetivo.',
        ],
        sections: [
          {
            h2: 'Presoterapia y drenaje',
            paragraphs: [
              'La presoterapia aplica presión de forma secuencial para favorecer la circulación de retorno. Es uno de los tratamientos más demandados para la sensación de piernas pesadas y la retención de líquidos.',
            ],
          },
          {
            h2: 'Modelado y tonificación',
            paragraphs: [
              'Body Sculpture y Abdomen de Acero combinan tecnologías de estética avanzada para trabajar la firmeza y el contorno. También hacemos mesoterapia corporal y capilar sin agujas.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Cuántas sesiones necesito?',
            a: 'Depende del tratamiento y del objetivo. Los corporales funcionan mejor en bonos con sesiones regulares, y en la valoración te proponemos un plan concreto.',
          },
        ],
      },
      en: {
        title: 'Body Treatments in Valencia (Ruzafa) | AestheticA',
        description: 'Pressotherapy, Body Sculpture, abdominal toning, needle-free mesotherapy and body scrub in Ruzafa, Valencia.',
        h1: 'Body treatments in Valencia',
        intro: [
          'Treatments for tired legs, fluid retention, toning and body skincare. We combine devices and manual techniques depending on your goal.',
        ],
        sections: [
          {
            h2: 'Pressotherapy and lymphatic drainage',
            paragraphs: [
              'Pressotherapy applies sequential pressure to support venous and lymphatic return. It is one of our most popular treatments for heavy legs and fluid retention.',
            ],
          },
          {
            h2: 'Body contouring and toning',
            paragraphs: [
              'Body Sculpture and our abdominal toning sessions combine advanced aesthetic technologies to work on firmness and contour. We also offer needle-free body and scalp mesotherapy.',
            ],
          },
        ],
        faqs: [
          {
            q: 'How many sessions will I need?',
            a: 'It depends on the treatment and your goal. Body treatments work best as a course of regular sessions, and we suggest a specific plan at your assessment.',
          },
        ],
      },
      uk: {
        title: 'Процедури для тіла у Валенсії (Руссафа) | AestheticA',
        description: 'Пресотерапія, Body Sculpture, тонус живота, безголкова мезотерапія та пілінг тіла в Руссафі, Валенсія.',
        h1: 'Процедури для тіла у Валенсії',
        intro: [
          'Процедури для втомлених ніг, затримки рідини, тонусу та догляду за шкірою тіла. Ми поєднуємо апаратні й мануальні техніки залежно від вашої мети.',
        ],
        sections: [
          {
            h2: 'Пресотерапія та дренаж',
            paragraphs: [
              'Пресотерапія послідовно створює тиск, щоб покращити венозний і лімфатичний відтік. Це одна з найпопулярніших процедур при відчутті важкості в ногах і затримці рідини.',
            ],
          },
          {
            h2: 'Моделювання та тонус',
            paragraphs: [
              'Body Sculpture і сеанси для тонусу живота поєднують технології естетичної косметології, щоб працювати з пружністю та контурами тіла. Також ми робимо безголкову мезотерапію тіла та шкіри голови.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Скільки сеансів мені потрібно?',
            a: 'Це залежить від процедури та мети. Процедури для тіла найкраще працюють курсом із регулярними сеансами, і на консультації ми запропонуємо конкретний план.',
          },
        ],
      },
    },
  },
  {
    key: 'masajes',
    label: { es: 'Masajes', en: 'Massage', uk: 'Масаж' },
    kind: 'category',
    slug: { es: 'masajes', en: 'massages' },
    match: { ids: ['c3', 'c4', 'c5', 'f11'] },
    copy: {
      es: {
        title: 'Masajes en Ruzafa, Valencia | AestheticA',
        description: 'Masaje relajante con aromaterapia, masaje integral de 60 o 90 minutos y lifting facial miofascial en Ruzafa, Valencia.',
        h1: 'Masajes en Ruzafa, Valencia',
        intro: [
          'Un momento para desconectar en pleno Ruzafa. Masaje integral de cuerpo completo, masaje relajante con aceites esenciales y masaje lifting miofascial para el rostro.',
        ],
        sections: [
          {
            h2: 'Masaje relajante y masaje integral',
            paragraphs: [
              'Adaptamos la presión y las zonas a lo que necesites ese día: descargar espalda y cuello, aliviar tensión o, simplemente, relajarte. Elige entre 60 y 90 minutos.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Puedo regalar un masaje?',
            a: 'Sí. Tenemos tarjeta regalo y experiencias de bienestar para dos personas.',
          },
        ],
      },
      en: {
        title: 'Massage in Ruzafa, Valencia | AestheticA',
        description: 'Aromatherapy relaxing massage, 60 or 90 minute full-body massage and myofascial facial lifting massage in Ruzafa, Valencia.',
        h1: 'Massage in Ruzafa, Valencia',
        intro: [
          'Time to unwind in the heart of Ruzafa. Full-body massage, relaxing aromatherapy massage and myofascial lifting massage for the face.',
        ],
        sections: [
          {
            h2: 'Relaxing and full-body massage',
            paragraphs: [
              'We adapt pressure and focus areas to what you need that day: releasing neck and back tension, easing stress or simply relaxing. Choose 60 or 90 minutes.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Can I give a massage as a gift?',
            a: 'Yes. We offer gift cards and wellness experiences for two.',
          },
        ],
      },
      uk: {
        title: 'Масаж у Руссафі, Валенсія | AestheticA',
        description: 'Розслаблюючий масаж з ароматерапією, масаж всього тіла 60 або 90 хвилин і міофасціальний ліфтинг-масаж обличчя в Руссафі, Валенсія.',
        h1: 'Масаж у Руссафі, Валенсія',
        intro: [
          'Час розслабитися в самому серці Руссафи. Масаж всього тіла, розслаблюючий масаж з ефірними оліями та міофасціальний ліфтинг-масаж для обличчя.',
        ],
        sections: [
          {
            h2: 'Розслаблюючий масаж і масаж всього тіла',
            paragraphs: [
              'Ми підбираємо силу натиску та зони під те, що вам потрібно сьогодні: зняти напругу в шиї та спині, позбутися стресу чи просто відпочити. Оберіть 60 або 90 хвилин.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Чи можна подарувати масаж?',
            a: 'Так. У нас є подарункові сертифікати та релакс-програми для двох.',
          },
        ],
      },
    },
  },
  {
    key: 'novias-y-regalos',
    label: { es: 'Novias y regalos', en: 'Bridal & gifts', uk: 'Наречені та подарунки' },
    kind: 'category',
    slug: { es: 'novias-y-regalos', en: 'bridal-and-gifts' },
    match: { categories: ['bienestar'] },
    copy: {
      es: {
        title: 'Packs para Novias y Tarjetas Regalo en Valencia | AestheticA',
        description: 'Pack de belleza para novias, bono futura mamá, experiencias de bienestar para dos y tarjeta regalo en Ruzafa, Valencia.',
        h1: 'Packs para novias, futuras mamás y regalos',
        intro: [
          'Packs pensados para momentos especiales: preparar la piel antes de la boda, cuidarte durante el embarazo o regalar una experiencia de bienestar.',
        ],
        sections: [
          {
            h2: 'Pack de belleza para novias en Valencia',
            paragraphs: [
              'Lo ideal es empezar unas semanas antes de la boda para que la piel llegue en su mejor momento. Combinamos tratamientos faciales y corporales en un calendario hecho a tu medida.',
            ],
          },
          {
            h2: 'Tarjeta regalo',
            paragraphs: [
              'Regala cualquiera de nuestros tratamientos o una experiencia para dos. Escríbenos por WhatsApp y te la preparamos.',
            ],
          },
        ],
        faqs: [],
      },
      en: {
        title: 'Bridal Beauty Packages & Gift Cards in Valencia | AestheticA',
        description: 'Bridal beauty packages, mum-to-be package, wellness experiences for two and gift cards in Ruzafa, Valencia.',
        h1: 'Bridal, mum-to-be and gift packages',
        intro: [
          'Packages designed for special moments: getting your skin ready for the wedding, looking after yourself during pregnancy or giving someone a wellness experience.',
        ],
        sections: [
          {
            h2: 'Bridal beauty package in Valencia',
            paragraphs: [
              'Ideally you start a few weeks before the wedding so your skin is at its best on the day. We combine facial and body treatments in a schedule tailored to you.',
            ],
          },
          {
            h2: 'Gift cards',
            paragraphs: [
              'Give any of our treatments or an experience for two. Message us on WhatsApp and we will prepare it for you.',
            ],
          },
        ],
        faqs: [],
      },
      uk: {
        title: 'Пакети для наречених і сертифікати у Валенсії | AestheticA',
        description: 'Б’юті-пакет для нареченої, пакет «Майбутня мама», релакс для двох і подарункові сертифікати в Руссафі, Валенсія.',
        h1: 'Пакети для наречених, майбутніх мам і подарунки',
        intro: [
          'Пакети для особливих моментів: підготувати шкіру до весілля, подбати про себе під час вагітності чи подарувати комусь релакс.',
        ],
        sections: [
          {
            h2: 'Б’юті-пакет для нареченої у Валенсії',
            paragraphs: [
              'Найкраще почати за кілька тижнів до весілля, щоб у цей день шкіра була в найкращій формі. Ми поєднуємо процедури для обличчя й тіла за графіком, складеним саме для вас.',
            ],
          },
          {
            h2: 'Подарункові сертифікати',
            paragraphs: [
              'Подаруйте будь-яку з наших процедур або програму для двох. Напишіть нам у WhatsApp, і ми все підготуємо.',
            ],
          },
        ],
        faqs: [],
      },
    },
  },

  // ── Tratamientos estrella ─────────────────────────────────────
  {
    key: 'hydroface-plus',
    label: { es: 'Hydroface Plus', en: 'Hydroface Plus', uk: 'Hydroface Plus' },
    kind: 'treatment',
    parent: 'faciales',
    slug: { es: 'hydroface-plus', en: 'hydroface-plus' },
    match: { ids: ['f2'] },
    copy: {
      es: {
        title: 'Hydroface Plus: Limpieza Facial Profunda en Valencia',
        description: 'Limpieza facial avanzada con hidrodermabrasión en Ruzafa, Valencia. Piel limpia, hidratada y luminosa desde la primera sesión.',
        h1: 'Hydroface Plus, limpieza facial profunda en Valencia',
        intro: [
          'Hydroface Plus es nuestra limpieza facial más completa. Usa hidrodermabrasión, una exfoliación con agua y succión controlada, para limpiar los poros en profundidad y aportar hidratación en la misma sesión.',
        ],
        sections: [
          {
            h2: '¿En qué consiste?',
            paragraphs: [
              'Empezamos con una limpieza y una exfoliación suave. Después el cabezal de hidrodermabrasión extrae impurezas y puntos negros mientras infunde sérums hidratantes. Terminamos con activos adaptados a tu piel y protección.',
            ],
          },
          {
            h2: '¿Para quién está indicado?',
            paragraphs: [
              'Para casi todo tipo de pieles: apagadas, deshidratadas, con poros dilatados o puntos negros. Es un buen tratamiento antes de un evento, porque no deja marcas.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Es lo mismo que un hydrafacial?',
            a: 'Es un tratamiento de hidrodermabrasión de la misma familia. HydraFacial es una marca registrada de otro fabricante. Hydroface Plus es nuestro protocolo propio.',
          },
          {
            q: '¿Cada cuánto puedo hacerlo?',
            a: 'Una vez al mes es una buena frecuencia de mantenimiento.',
          },
        ],
      },
      en: {
        title: 'Hydroface Plus Deep Cleansing Facial in Valencia',
        description: 'Advanced hydrodermabrasion facial in Ruzafa, Valencia. Clean, hydrated, glowing skin from the very first session.',
        h1: 'Hydroface Plus deep cleansing facial in Valencia',
        intro: [
          'Hydroface Plus is our most complete facial. It uses hydrodermabrasion, an exfoliation with water and controlled suction, to deep-clean pores and hydrate the skin in the same session.',
        ],
        sections: [
          {
            h2: 'What does it involve?',
            paragraphs: [
              'We start with a cleanse and gentle exfoliation. Then the hydrodermabrasion tip extracts impurities and blackheads while infusing hydrating serums. We finish with actives suited to your skin and sun protection.',
            ],
          },
          {
            h2: 'Who is it for?',
            paragraphs: [
              'Almost every skin type: dull, dehydrated, with enlarged pores or blackheads. It is a great pre-event treatment because it leaves no marks.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Is it the same as a HydraFacial?',
            a: 'It is a hydrodermabrasion treatment from the same family. HydraFacial is a registered trademark of another manufacturer; Hydroface Plus is our own protocol.',
          },
          {
            q: 'How often can I have it?',
            a: 'Once a month is a good maintenance frequency.',
          },
        ],
      },
      uk: {
        title: 'Hydroface Plus: глибока чистка обличчя у Валенсії',
        description: 'Чистка обличчя з гідродермабразією в Руссафі, Валенсія. Чиста, зволожена та сяюча шкіра вже після першого сеансу.',
        h1: 'Hydroface Plus — глибока чистка обличчя у Валенсії',
        intro: [
          'Hydroface Plus — наша найповніша чистка обличчя. Вона використовує гідродермабразію — пілінг водою з контрольованим вакуумом, щоб глибоко очистити пори й зволожити шкіру за один сеанс.',
        ],
        sections: [
          {
            h2: 'Як проходить процедура?',
            paragraphs: [
              'Ми починаємо з очищення та м’якого пілінгу. Потім насадка для гідродермабразії видаляє забруднення та чорні цятки, водночас вводячи зволожувальні сироватки. Завершуємо активними компонентами для вашого типу шкіри та сонцезахистом.',
            ],
          },
          {
            h2: 'Кому підходить?',
            paragraphs: [
              'Майже всім типам шкіри: тьмяній, зневодненій, з розширеними порами чи чорними цятками. Це чудова процедура перед подією, бо не залишає слідів.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Це те саме, що HydraFacial?',
            a: 'Це процедура гідродермабразії з тієї ж родини. HydraFacial — зареєстрована торгова марка іншого виробника; Hydroface Plus — наш власний протокол.',
          },
          {
            q: 'Як часто можна робити?',
            a: 'Раз на місяць — хороша частота для підтримки результату.',
          },
        ],
      },
    },
  },
  {
    key: 'hollywood-peeling',
    label: { es: 'Hollywood Peeling', en: 'Hollywood Peel', uk: 'Голлівудський пілінг' },
    kind: 'treatment',
    parent: 'faciales',
    slug: { es: 'hollywood-peeling', en: 'hollywood-peeling' },
    match: { ids: ['f7'] },
    copy: {
      es: {
        title: 'Hollywood Peeling Láser en Valencia (Ruzafa) | AestheticA',
        description: 'Peeling de carbono con láser ND-YAG en Ruzafa, Valencia. Poros más cerrados, menos brillo y piel luminosa, sin tiempo de recuperación.',
        h1: 'Hollywood Peeling en Valencia',
        intro: [
          'El Hollywood Peeling, o peeling de carbono, combina una mascarilla de carbón con el láser ND-YAG. Es conocido como el tratamiento de las alfombras rojas, porque deja la piel luminosa y uniforme sin tiempo de recuperación.',
        ],
        sections: [
          {
            h2: '¿Cómo funciona el peeling de carbono?',
            paragraphs: [
              'Aplicamos una fina capa de carbón que se adhiere a los poros y a la grasa de la superficie. El láser la elimina en varias pasadas y, con ella, células muertas e impurezas. El calor suave estimula la piel.',
            ],
          },
          {
            h2: 'Beneficios',
            paragraphs: [
              'Poros visiblemente más cerrados, menos brillo, una textura más fina y un tono más uniforme. Es ideal para pieles grasas o mixtas y antes de un evento.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Duele el Hollywood Peeling?',
            a: 'No. Se nota un leve cosquilleo y calor.',
          },
          {
            q: '¿Cuántas sesiones se recomiendan?',
            a: 'Una sola sesión ya da un efecto flash. Para mejorar poros y textura, se suele hacer una serie de varias sesiones separadas unas semanas.',
          },
        ],
      },
      en: {
        title: 'Hollywood Laser Peel in Valencia (Ruzafa) | AestheticA',
        description: 'Carbon laser peel with ND-YAG in Ruzafa, Valencia. Refined pores, less shine and glowing skin, with no downtime.',
        h1: 'Hollywood laser peel in Valencia',
        intro: [
          'The Hollywood Peel, or carbon laser peel, combines a carbon mask with an ND-YAG laser. It is known as the red-carpet treatment because it leaves skin radiant and even with no downtime.',
        ],
        sections: [
          {
            h2: 'How does a carbon peel work?',
            paragraphs: [
              'We apply a thin layer of carbon that binds to pores and surface oil. The laser removes it in several passes, along with dead cells and impurities, while gentle heat stimulates the skin.',
            ],
          },
          {
            h2: 'Benefits',
            paragraphs: [
              'Visibly refined pores, less shine, smoother texture and a more even tone. Ideal for oily or combination skin and before an event.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Does the Hollywood Peel hurt?',
            a: 'No. You feel a slight tingling and warmth.',
          },
          {
            q: 'How many sessions are recommended?',
            a: 'A single session gives an instant glow. To improve pores and texture, a course of several sessions a few weeks apart is usually recommended.',
          },
        ],
      },
      uk: {
        title: 'Голлівудський лазерний пілінг у Валенсії | AestheticA',
        description: 'Карбоновий пілінг лазером ND-YAG у Руссафі, Валенсія. Звужені пори, менше блиску та сяюча шкіра без періоду відновлення.',
        h1: 'Голлівудський пілінг у Валенсії',
        intro: [
          'Голлівудський, або карбоновий, пілінг поєднує вугільну маску з лазером ND-YAG. Його називають процедурою червоних доріжок, бо він робить шкіру сяючою та рівною без періоду відновлення.',
        ],
        sections: [
          {
            h2: 'Як працює карбоновий пілінг?',
            paragraphs: [
              'Ми наносимо тонкий шар вугільної маски, який проникає в пори та зв’язує шкірне сало. Лазер видаляє його за кілька проходів разом із відмерлими клітинами й забрудненнями, а м’яке тепло стимулює шкіру.',
            ],
          },
          {
            h2: 'Переваги',
            paragraphs: [
              'Помітно звужені пори, менше блиску, гладкіша текстура та рівніший тон. Ідеально для жирної чи комбінованої шкіри та перед важливою подією.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Чи болить голлівудський пілінг?',
            a: 'Ні. Відчувається легке поколювання й тепло.',
          },
          {
            q: 'Скільки сеансів рекомендується?',
            a: 'Один сеанс дає миттєве сяйво. Щоб покращити пори та текстуру, зазвичай роблять курс із кількох сеансів з інтервалом у кілька тижнів.',
          },
        ],
      },
    },
  },
  {
    key: 'fotorejuvenecimiento',
    label: { es: 'Fotorejuvenecimiento', en: 'Photorejuvenation', uk: 'Фотоомолодження' },
    kind: 'treatment',
    parent: 'faciales',
    slug: { es: 'fotorejuvenecimiento', en: 'photorejuvenation' },
    match: { ids: ['f6'] },
    copy: {
      es: {
        title: 'Fotorejuvenecimiento con Luz Pulsada en Valencia | AestheticA',
        description: 'Fotorejuvenecimiento LPL en Ruzafa, Valencia, para manchas solares, rojeces y tono irregular. Valoración personalizada de tu piel.',
        h1: 'Fotorejuvenecimiento facial en Valencia',
        intro: [
          'El fotorejuvenecimiento con luz pulsada (LPL) mejora las manchas solares, las rojeces y el tono irregular de la piel, y le devuelve luminosidad sin agujas y sin tiempo de recuperación.',
        ],
        sections: [
          {
            h2: '¿Cómo actúa la luz pulsada?',
            paragraphs: [
              'La luz pulsada emite destellos de luz que actúan sobre el pigmento de las manchas y sobre las pequeñas rojeces. A la vez, el calor estimula la renovación de la piel.',
            ],
          },
          {
            h2: 'La mejor época para hacerlo',
            paragraphs: [
              'Otoño e invierno son ideales, porque hay menos exposición al sol. Durante el tratamiento es imprescindible usar protección solar alta.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Cuántas sesiones hacen falta?',
            a: 'Normalmente entre 3 y 5 sesiones, separadas unas semanas. Lo ajustamos según el tipo de mancha y de piel.',
          },
          {
            q: '¿Puedo hacerlo con la piel bronceada?',
            a: 'No es recomendable. Lo mejor es esperar a que la piel recupere su tono natural.',
          },
        ],
      },
      en: {
        title: 'IPL Photorejuvenation in Valencia | AestheticA',
        description: 'IPL photorejuvenation in Ruzafa, Valencia, for sun spots, redness and uneven skin tone. Personalised skin assessment.',
        h1: 'IPL photorejuvenation in Valencia',
        intro: [
          'Photorejuvenation with intense pulsed light (IPL) improves sun spots, redness and uneven tone, bringing back radiance without needles or downtime.',
        ],
        sections: [
          {
            h2: 'How does IPL work?',
            paragraphs: [
              'IPL emits flashes of light that target the pigment in sun spots and small areas of redness, while the heat stimulates skin renewal.',
            ],
          },
          {
            h2: 'Best time of year',
            paragraphs: [
              'Autumn and winter are ideal because there is less sun exposure. High-factor sunscreen is essential during the course of treatment.',
            ],
          },
        ],
        faqs: [
          {
            q: 'How many sessions are needed?',
            a: 'Usually between 3 and 5 sessions, a few weeks apart. We adjust this to your type of pigmentation and skin.',
          },
          {
            q: 'Can I have it with tanned skin?',
            a: 'It is not recommended. It is best to wait until your skin returns to its natural tone.',
          },
        ],
      },
      uk: {
        title: 'IPL-фотоомолодження у Валенсії | AestheticA',
        description: 'Фотоомолодження імпульсним світлом у Руссафі, Валенсія: пігментні плями, почервоніння та нерівний тон. Індивідуальна оцінка шкіри.',
        h1: 'Фотоомолодження обличчя у Валенсії',
        intro: [
          'Фотоомолодження інтенсивним імпульсним світлом (IPL) зменшує пігментні плями від сонця, почервоніння та нерівний тон і повертає шкірі сяйво без голок і без періоду відновлення.',
        ],
        sections: [
          {
            h2: 'Як діє імпульсне світло?',
            paragraphs: [
              'Імпульсне світло випромінює спалахи, які діють на пігмент плям і дрібні почервоніння, а тепло стимулює оновлення шкіри.',
            ],
          },
          {
            h2: 'Найкращий час для процедури',
            paragraphs: [
              'Осінь і зима ідеальні, бо сонця менше. Протягом курсу обов’язковий сонцезахисний крем з високим SPF.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Скільки сеансів потрібно?',
            a: 'Зазвичай від 3 до 5 сеансів з інтервалом у кілька тижнів. Ми підбираємо курс залежно від типу пігментації та шкіри.',
          },
          {
            q: 'Чи можна робити на засмаглій шкірі?',
            a: 'Не рекомендується. Краще зачекати, поки шкіра повернеться до природного відтінку.',
          },
        ],
      },
    },
  },
  {
    key: 'radiofrecuencia-facial',
    label: { es: 'Radiofrecuencia facial', en: 'Facial radiofrequency', uk: 'RF-ліфтинг обличчя' },
    kind: 'treatment',
    parent: 'faciales',
    slug: { es: 'radiofrecuencia-facial', en: 'facial-radiofrequency' },
    match: { ids: ['f8', 'f9'] },
    copy: {
      es: {
        title: 'Radiofrecuencia Facial en Valencia (Ruzafa) | AestheticA',
        description: 'Radiofrecuencia facial con vitaminas o mascarilla de alginato en Ruzafa, Valencia. Más firmeza y luminosidad sin agujas.',
        h1: 'Radiofrecuencia facial en Valencia',
        intro: [
          'La radiofrecuencia facial es uno de los tratamientos más eficaces para la flacidez y las líneas finas sin pasar por agujas. Te ofrecemos dos versiones: con vitaminas o con mascarilla de alginato.',
        ],
        sections: [
          {
            h2: '¿Qué hace la radiofrecuencia?',
            paragraphs: [
              'Calienta de forma controlada las capas profundas de la piel. Ese calor estimula la producción de colágeno y elastina, las fibras que dan firmeza al rostro.',
            ],
          },
          {
            h2: 'Resultados',
            paragraphs: [
              'Desde la primera sesión se nota un efecto tensor y la piel más luminosa. La mejora de la firmeza es progresiva, con una serie de sesiones regulares.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿La radiofrecuencia es dolorosa?',
            a: 'No, es un tratamiento agradable. Se siente un calor suave, parecido a un masaje caliente.',
          },
          {
            q: '¿A partir de qué edad se recomienda?',
            a: 'Como prevención, a partir de los 30. Para tratar la flacidez, en cualquier edad en la que aparezca.',
          },
        ],
      },
      en: {
        title: 'Facial Radiofrequency in Valencia (Ruzafa) | AestheticA',
        description: 'Facial radiofrequency with vitamins or alginate mask in Ruzafa, Valencia. Firmer, more radiant skin without needles.',
        h1: 'Facial radiofrequency in Valencia',
        intro: [
          'Facial radiofrequency is one of the most effective needle-free treatments for sagging skin and fine lines. We offer two versions: with vitamins or with an alginate mask.',
        ],
        sections: [
          {
            h2: 'What does radiofrequency do?',
            paragraphs: [
              'It gently heats the deeper layers of the skin in a controlled way. This heat stimulates collagen and elastin, the fibres that keep the face firm.',
            ],
          },
          {
            h2: 'Results',
            paragraphs: [
              'You notice a tightening effect and more radiant skin from the first session. Firmness improves progressively over a course of regular sessions.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Is radiofrequency painful?',
            a: 'No, it is a pleasant treatment. It feels like a warm massage.',
          },
          {
            q: 'From what age is it recommended?',
            a: 'From around 30 as prevention, and at any age once skin starts to lose firmness.',
          },
        ],
      },
      uk: {
        title: 'RF-ліфтинг обличчя у Валенсії (Руссафа) | AestheticA',
        description: 'Радіочастотний ліфтинг обличчя з вітамінами або альгінатною маскою в Руссафі, Валенсія. Пружніша та сяюча шкіра без голок.',
        h1: 'Радіочастотний ліфтинг обличчя у Валенсії',
        intro: [
          'Радіочастотний (RF) ліфтинг — одна з найефективніших процедур без голок проти втрати пружності та дрібних зморшок. Ми пропонуємо два варіанти: з вітамінами або з альгінатною маскою.',
        ],
        sections: [
          {
            h2: 'Що робить радіочастотний ліфтинг?',
            paragraphs: [
              'Він контрольовано прогріває глибокі шари шкіри. Це тепло стимулює вироблення колагену й еластину — волокон, які відповідають за пружність обличчя.',
            ],
          },
          {
            h2: 'Результати',
            paragraphs: [
              'Уже після першого сеансу відчувається ефект підтягнутості, а шкіра стає сяючою. Пружність покращується поступово, протягом курсу регулярних сеансів.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Чи боляче робити RF-ліфтинг?',
            a: 'Ні, це приємна процедура. Відчувається м’яке тепло, схоже на теплий масаж.',
          },
          {
            q: 'З якого віку рекомендується?',
            a: 'Для профілактики — приблизно з 30 років, а для корекції — у будь-якому віці, коли шкіра починає втрачати пружність.',
          },
        ],
      },
    },
  },
  {
    key: 'presoterapia',
    label: { es: 'Presoterapia', en: 'Pressotherapy', uk: 'Пресотерапія' },
    kind: 'treatment',
    parent: 'corporales',
    slug: { es: 'presoterapia', en: 'pressotherapy' },
    match: { ids: ['c1', 'c2', 'c8', 'f16'] },
    copy: {
      es: {
        title: 'Presoterapia en Valencia (Ruzafa) | AestheticA',
        description: 'Presoterapia corporal y ocular en Ruzafa, Valencia. Alivio de piernas cansadas y retención de líquidos. Sesiones y bonos.',
        h1: 'Presoterapia en Valencia',
        intro: [
          'La presoterapia es un drenaje por presión que alivia la sensación de piernas pesadas y ayuda con la retención de líquidos. Es relajante, no invasiva y se puede combinar con otros tratamientos corporales.',
        ],
        sections: [
          {
            h2: '¿Cómo es una sesión?',
            paragraphs: [
              'Te colocas unas botas o un traje con cámaras de aire que se inflan y desinflan en secuencia, de los pies hacia arriba, siguiendo el sentido de la circulación de retorno. Solo tienes que relajarte.',
            ],
          },
          {
            h2: 'Presoterapia ocular',
            paragraphs: [
              'También tenemos una versión para el contorno de ojos, pensada para las bolsas y la hinchazón. Se puede hacer sola o combinada con la corporal.',
            ],
          },
          {
            h2: 'Contraindicaciones',
            paragraphs: [
              'No es adecuada en casos como trombosis, problemas cardíacos o varices importantes. Por eso hacemos siempre una valoración previa.',
            ],
          },
        ],
        faqs: [
          {
            q: '¿Cuántas sesiones de presoterapia se recomiendan?',
            a: 'Para notar resultados mantenidos, lo habitual es una serie de sesiones una o dos veces por semana. Por eso trabajamos con bonos.',
          },
        ],
      },
      en: {
        title: 'Pressotherapy in Valencia (Ruzafa) | AestheticA',
        description: 'Body and eye pressotherapy in Ruzafa, Valencia. Relief for heavy, tired legs and fluid retention. Single sessions and packages.',
        h1: 'Pressotherapy in Valencia',
        intro: [
          'Pressotherapy is a pressure-based drainage treatment that relieves heavy legs and helps with fluid retention. It is relaxing, non-invasive and combines well with other body treatments.',
        ],
        sections: [
          {
            h2: 'What is a session like?',
            paragraphs: [
              'You wear boots or a suit with air chambers that inflate and deflate in sequence, from the feet upwards, following the direction of venous return. All you have to do is relax.',
            ],
          },
          {
            h2: 'Eye pressotherapy',
            paragraphs: [
              'We also offer a version for the eye area, designed for puffiness and bags. It can be done on its own or combined with body pressotherapy.',
            ],
          },
          {
            h2: 'Contraindications',
            paragraphs: [
              'It is not suitable in cases such as thrombosis, heart conditions or severe varicose veins, so we always carry out an assessment first.',
            ],
          },
        ],
        faqs: [
          {
            q: 'How many pressotherapy sessions are recommended?',
            a: 'For lasting results, a course of sessions once or twice a week is typical, which is why we offer packages.',
          },
        ],
      },
      uk: {
        title: 'Пресотерапія у Валенсії (Руссафа) | AestheticA',
        description: 'Пресотерапія для тіла та зони очей у Руссафі, Валенсія. Полегшення для втомлених ніг і при затримці рідини. Окремі сеанси та пакети.',
        h1: 'Пресотерапія у Валенсії',
        intro: [
          'Пресотерапія — це дренаж за допомогою тиску, який полегшує відчуття важкості в ногах і допомагає при затримці рідини. Вона розслаблює, неінвазивна та добре поєднується з іншими процедурами для тіла.',
        ],
        sections: [
          {
            h2: 'Як проходить сеанс?',
            paragraphs: [
              'Ви вдягаєте чоботи або костюм із повітряними камерами, які послідовно надуваються й здуваються від стоп угору — у напрямку венозного відтоку. Вам потрібно лише розслабитися.',
            ],
          },
          {
            h2: 'Пресотерапія для очей',
            paragraphs: [
              'Також є версія для зони навколо очей — проти набряків і мішків. Її можна робити окремо або разом із пресотерапією тіла.',
            ],
          },
          {
            h2: 'Протипоказання',
            paragraphs: [
              'Процедура не підходить, наприклад, при тромбозі, захворюваннях серця чи вираженому варикозі, тому ми завжди спершу проводимо консультацію.',
            ],
          },
        ],
        faqs: [
          {
            q: 'Скільки сеансів пресотерапії рекомендується?',
            a: 'Для стійкого результату зазвичай роблять курс сеансів один-два рази на тиждень, тому ми пропонуємо пакети.',
          },
        ],
      },
    },
  },
]
// ─────────────────────────────────────────────────────────────────

export const landingPath = (landing: Landing, lang: Lang) =>
  `${PATHS.treatments[lang]}/${lang === 'es' ? landing.slug.es : landing.slug.en}`

export const findLanding = (key: string) => LANDINGS.find((l) => l.key === key)

export const matchTreatments = (landing: Landing, treatments: Treatment[]) => {
  const { categories, ids, excludeIds } = landing.match
  return treatments.filter(
    (t) =>
      (categories?.includes(t.category) || ids?.includes(t.id)) &&
      !excludeIds?.includes(t.id),
  )
}

/** Página propia de un tratamiento: primero la de tratamiento estrella, si no la de su categoría. */
export const landingForTreatment = (treatment: Treatment) =>
  LANDINGS.find((l) => l.kind === 'treatment' && l.match.ids?.includes(treatment.id)) ??
  LANDINGS.find((l) => l.kind === 'category' && matchTreatments(l, [treatment]).length > 0)
