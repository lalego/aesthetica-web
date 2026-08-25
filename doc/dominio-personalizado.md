# Dominio personalizado para apps/web — búsqueda de disponibilidad

Búsqueda comprobada en directo el 2026-08-25 (Cloudflare Registrar + Namecheap), sin comprar nada, para el pendiente "Dominio personalizado en Cloudflare Pages" de `CLAUDE.md`.

## Resultado

| Dominio | `.com` | `.es` | `.org` | `.net` |
|---|---|---|---|---|
| `aesthetica` | ❌ cogido | ❌ cogido | ❌ cogido | ❌ cogido |
| `centroaesthetica` | ❌ cogido | ❌ cogido | ✅ libre — $8,50 primer año (Cloudflare) | ✅ libre — $11,86/año (Cloudflare) |
| `alenaesthetica` | ✅ libre — $10,46/año (Cloudflare) | ✅ libre — ~$19/año (Namecheap) | ✅ libre — $8,50 primer año (Cloudflare) | ✅ libre |

## Notas

- **`aesthetica` a secas está cogido en las 4 extensiones comprobadas** (.com/.es/.org/.net). No es viable tal cual — habría que combinarlo con otra palabra o descartarlo.
- **Cloudflare no vende dominios `.es`** en absoluto (limitación de su registrador, no de disponibilidad de un nombre en concreto). Para `.es` hay que comprarlo en otro registrador y luego apuntar el DNS a Cloudflare a mano (cambiando nameservers o gestionando el registro manualmente).
- Para `.es` específicamente, **Nominalia** (registrador español) suele salir más barato que Namecheap/GoDaddy — promociones desde ~1€ el primer año, pero ojo con el precio de renovación, que puede subir bastante. No comprobado en directo para estos nombres (pendiente si se decide ir por esa vía).
- Precio medio de mercado de un `.es` en 2026: ~8€/año.

## Recomendación

**`centroaesthetica.org`** — libre en `.org` y `.net`, gestionable entero desde la misma cuenta de Cloudflare (registro + DNS + Pages) sin necesidad de un registrador externo, y es la opción más barata de todo lo comprobado.

Si se prefiere mantener el nombre `aesthetica` tal cual, la única variante libre encontrada es `alenaesthetica` (cambia el nombre, no es un match exacto).

## Pendiente

- [ ] Decidir nombre final y comprarlo
- [ ] Si se elige `.es`: comprobar precio real en Nominalia para los nombres candidatos
- [ ] Conectar el dominio comprado a `apps/web` en Cloudflare Pages (Custom domains)
