# Sistema de diseño de Turno

Sistema propio para el clon de Homebase. Reproduce los patrones de uso, no la
apariencia de Homebase: no se pudo medir el original (la red de la sesión
bloquea su sitio) y no se usa su logo, colores, textos ni ilustraciones.

| archivo | qué es |
| --- | --- |
| `tokens.json` | la fuente única: colores por función, tipografía, espacios, bordes, sombras, animación, medidas |
| `build_tokens.py` | genera `tokens.css`, `tailwind.preset.js` (web) y `theme.ts` (app Expo) |
| `components.md` | 22 componentes: variantes, estados, accesibilidad y en qué pantalla se usan |
| `preview.html` | los componentes dibujados con los tokens; capturas en `preview-desktop.png` y `preview-mobile.png` |

- El azul `#3451c7` es provisional; `/replica-brand` pone tus colores.
- Contraste: 34 combinaciones, ninguna falla el nivel AA de WCAG.
- Fuente Inter y los íconos de Lucide son gratuitos y libres. Los mapas usan
  OpenStreetMap, sin llave de pago.
- Si cambias colores: corre `build_tokens.py` y luego la revisión de contraste.
