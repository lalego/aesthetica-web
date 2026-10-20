# Dominio personalizado para apps/web

Dominio en uso: **`aestheticavanzada.com`**. Para el estado actual y los próximos pasos, ver el final del documento. La búsqueda de abajo es el estudio previo.

Búsqueda comprobada en directo el 2026-08-25 (Cloudflare Registrar + Namecheap), sin comprar nada, para el pendiente "Dominio personalizado en Cloudflare Pages" de `CLAUDE.md`.

## Resultado

| Dominio | `.com` | `.es` | `.org` | `.net` |
|---|---|---|---|---|
| `aesthetica` | ❌ cogido | ❌ cogido | ❌ cogido | ❌ cogido |
| `centroaesthetica` | ❌ cogido | ❌ cogido | ✅ libre — $8,50 primer año (Cloudflare) | ✅ libre — $11,86/año (Cloudflare) |
| `alenaesthetica` | ✅ libre — $10,46/año (Cloudflare) | ✅ libre — ~$19/año (Namecheap) | ✅ libre — $8,50 primer año (Cloudflare) | ✅ libre |
| `aestheticavanzada` ³ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `estudioaesthetica` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aestheticavalencia` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aestheticaruzafa` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aestheticaclinica` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aestheticamedica` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aestheticalaser` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `somosaesthetica` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aesthetica-valencia` ¹ | ✅ libre | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `clinicaaesthetica` ¹ | ❌ cogido | ✅ probablemente libre ² | ✅ libre | ✅ libre |
| `aestheticaclinic` ¹ | ❌ cogido | ✅ probablemente libre ² | ✅ libre | ✅ libre |

¹ Comprobado el 2026-10-17 vía RDAP (registro público, validado contra `aesthetica`, que sí devuelve registrado), sin consultar precios — por precio de extensión deberían rondar los mismos que las filas de arriba.
³ Comprobado de nuevo el 2026-10-18 vía RDAP (control: `aesthetica.com` devuelve registrado). Es el nombre elegido (ver Decisión).
² `.es` no tiene RDAP; el dominio no existe en DNS (NXDOMAIN), lo que casi siempre significa libre, pero confirmar en el registrador antes de comprar.

## Notas

- **`aesthetica` a secas está cogido en las 4 extensiones comprobadas** (.com/.es/.org/.net). No es viable tal cual — habría que combinarlo con otra palabra o descartarlo.
- **Cloudflare no vende dominios `.es`** en absoluto (limitación de su registrador, no de disponibilidad de un nombre en concreto). Para `.es` hay que comprarlo en otro registrador y luego apuntar el DNS a Cloudflare a mano (cambiando nameservers o gestionando el registro manualmente).
- Para `.es` específicamente, **Nominalia** (registrador español) suele salir más barato que Namecheap/GoDaddy — promociones desde ~1€ el primer año, pero ojo con el precio de renovación, que puede subir bastante. No comprobado en directo para estos nombres (pendiente si se decide ir por esa vía).
- Precio medio de mercado de un `.es` en 2026: ~8€/año.

## Decisión (2026-10-18)

Nombre elegido: **`aestheticavanzada`** (con *h*, una sola *a* en medio), en **`.com`**, comprado y gestionado en Cloudflare.

Correo: Cloudflare Email Routing (gratis), que solo recibe y reenvía, más un Gmail nuevo para la clínica con "Enviar como". Se descartaron Outlook.com (la versión gratuita ya no envía desde un dominio propio), Proton (de pago para dominio propio) y Zoho Mail Free (sería una alternativa válida si no se quiere depender de Gmail).

## Recomendación previa

**`centroaesthetica.org`** — libre en `.org` y `.net`, gestionable entero desde la misma cuenta de Cloudflare (registro + DNS + Pages) sin necesidad de un registrador externo, y es la opción más barata de todo lo comprobado.

Si se prefiere mantener el nombre `aesthetica` tal cual, hay muchas variantes libres en las 4 extensiones (ver tabla). La más recomendable es **`aestheticavalencia`** (`.com` y/o `.es`): mantiene el nombre de la clínica intacto y ayuda al SEO local ("estética València"). Lo ideal sería comprar `.com` + `.es` y redirigir uno al otro (~20 €/año en total); si se quiere todo dentro de Cloudflare (que no vende `.es`), basta con el `.com`.

## Estado actual (2026-10-19)

Todo en la cuenta de Cloudflare `Lalego@gmail.com`.

- **Dominio:** `aestheticavanzada.com`, comprado en Cloudflare Registrar el 2026-10-18. Caduca el 2027-10-18 y tiene la renovación automática activada. El `.com` sube de $10,46 a $11,17 desde el 2026-11-01.
- **Web:** `https://aestheticavanzada.com` y `https://www.aestheticavanzada.com` son Custom domains del proyecto de Pages `aesthetica-web`, y sirven la web (comprobado: HTTP 200). `aesthetica-web.pages.dev` sigue funcionando.
- **Buzón:** `aestheticavanzada@gmail.com`, una cuenta de Gmail gratuita de la clínica. Tiene la verificación en dos pasos activada, las funciones inteligentes desactivadas (por los datos de pacientes) y `alenamadame@gmail.com` como correo de recuperación.
- **Recibir:** Cloudflare Email Routing reenvía `info@aestheticavanzada.com` a ese Gmail. El catch-all está desactivado, así que cualquier otra dirección del dominio se descarta. En Gmail hay un filtro "Para: info@… → No marcar nunca como spam", porque el primer correo cayó en Spam.
- **Enviar:** "Enviar como" `info@aestheticavanzada.com` en Gmail, por `smtp.gmail.com:587` con la contraseña de aplicación "Enviar como info". Funciona, pero **Outlook avisa de que no puede verificar el remitente**: el correo sale firmado por `gmail.com` (DKIM) y no por `aestheticavanzada.com`. Añadir Google al SPF no lo arregla.

## Próximos pasos

- [ ] **Quitar el aviso de remitente no verificado.** Crear una cuenta en Resend (gratis, 3.000 correos/mes) y añadir allí el dominio. Después, poner en Cloudflare DNS los registros DKIM y SPF de envío que pida, más un DMARC básico (`_dmarc`, `v=DMARC1; p=none`). Por último, en Gmail → "Enviar como" → editar `info@`, cambiar el SMTP a `smtp.resend.com:587`, usuario `resend`, con una API key como contraseña.
- [ ] **SMTP propio en Supabase con ese mismo Resend.** Las invitaciones de staff saldrían desde el dominio y se podrían personalizar las plantillas. Ver la nota de `CLAUDE.md` sobre `{{ .TokenHash }}` + `/auth/confirm`.
- [x] (2026-10-20) **Datos de la web.** Cambiar `email` en `packages/shared/src/clinic.ts` (hoy `alenamadame@gmail.com`) a `info@aestheticavanzada.com`, y en `apps/web/src/pages/AvisoLegal.tsx` sustituir `aesthetica-web.pages.dev` por `aestheticavanzada.com`. Revisar también la política de privacidad y las cookies, si citan el dominio o el email.
- [ ] **Redirigir `www` y `pages.dev` al dominio principal** con una Bulk Redirect o una Redirect Rule en Cloudflare, para que no haya contenido duplicado en buscadores.
- [x] **Perfil de Empresa en Google** (ficha de Maps): la web `https://aestheticavanzada.com` ya está en "Website" (2026-10-19).
- [ ] En esa misma ficha: añadir el enlace de reservas `https://aestheticavanzada.com/#agendar` (Edit profile → Contact → Appointment links, o el botón Bookings; depende de la categoría del negocio) y dar acceso a `aestheticavanzada@gmail.com` (Business Profile settings → People and access).
- [ ] Más direcciones si hacen falta (`citas@`, `privacidad@`…): una regla nueva en Email Routing → Routing rules, y añadirla en "Enviar como" si se quiere responder desde ella.
- [ ] Subir a GitHub los commits locales pendientes: el despliegue de Pages solo se dispara con un push a `main`.
