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
    email: 'alenamadame@gmail.com',
    instagram: 'martseniuk_aesthetica',
    instagram_href: 'https://www.instagram.com/martseniuk_aesthetica/',
    facebook_href: 'https://www.facebook.com/profile.php?id=61579180712391',
    whatsapp_href: 'https://wa.me/34613615142',
  },
  maps: {
    href: 'https://www.google.com/maps/place/AestheticA/@39.460555,-0.3699511,1178m/data=!3m1!1e3!4m6!3m5!1s0xd60498e46207ae1:0xc9ea27b0cef8f594!8m2!3d39.4604317!4d-0.3698608!16s%2Fg%2F11yfvmqcsv',
    embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3081.5!2d-0.3699511!3d39.460555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd60498e46207ae1%3A0xc9ea27b0cef8f594!2sAestheticA!5e0!3m2!1ses!2ses!4v1',
  },

  hours: [
    { days: 'Lun – Vie', time: '10:00 – 20:00' },
    { days: 'Sábado',    time: '10:00 – 18:00' },
    { days: 'Domingo',   time: 'Cerrado' },
  ],
} as const