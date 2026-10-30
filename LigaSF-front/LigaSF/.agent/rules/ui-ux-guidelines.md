# Reglas de UI/UX y Estándares Frontend para LigaSF

## Principios Obligatorios:
1. **Evitar UI de IA genérica:**
   - Prohibidos los fondos monocromáticos oscuros con degradados morados/fucsias aleatorios.
   - Usar paletas de color con propósito deportivo santafesino: Slate/Zinc pulido, Verde esmeralda (#10b981 / #059669) para estado EN JUEGO y goles, Azul corporativo limpio (#0284c7) para controles, Ámbar (#f59e0b) para advertencias y tarjetas amarillas, Rojo rubí (#ef4444) para tarjetas rojas.
2. **Make Interfaces Feel Better:**
   - Radios concéntricos: `R_outer = R_inner + padding`.
   - Micro-interacciones: retroalimentación táctil/visual en hover y active (scale 0.98, transitions orgánicas).
   - Tipografía con números tabulares (`fontVariant: ['tabular-nums']` / `font-variant-numeric: tabular-nums`) en marcadores, minutos y dorsales.
3. **transitions.dev & GSAP:**
   - Usar easing no lineal: `power2.out`, `power3.out` o `expo.out` para entradas inmediatas.
   - No usar `linear` o `ease-in` en aperturas de modales o cards.
   - En web, aprovechar GSAP y ScrollTrigger para transiciones suaves de lista y paneles.
