export const CLINIC = {
  name: 'Aesthetica',
  legal_name: 'Clínica Aesthetica S.L.',
  cif: 'B-00000000', // reemplazar con el CIF real

  address: {
    street: 'C/ dels Centelles, 1',
    district: "L'Eixample",
    zip: '46006',
    city: 'València',
    province: 'Valencia',
    country: 'España',
    full: "C/ dels Centelles, 1, Ruzafa, 46006 València, España",
  },

  contact: {
    phone: '+34 613 61 51 42',
    phone_href: 'tel:+34613615142',
    email: '', // añadir cuando esté disponible
    instagram: '',              // ej: 'clinicaaesthetica'
    instagram_href: '',         // ej: 'https://instagram.com/clinicaaesthetica'
  },

  hours: [
    { days: 'Lun – Vie', time: '10:00 – 20:00' },
    { days: 'Sábado',    time: '10:00 – 18:00' },
    { days: 'Domingo',   time: 'Cerrado' },
  ],
} as const