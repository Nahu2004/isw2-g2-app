# Design System & UI/UX Standards: "Impeccable" + "Make Interfaces Feel Better" + "transitions.dev"

Este proyecto sigue estrictamente directrices de diseño y micro-interacciones de nivel senior para evitar interfaces de "IA genérica" (fondos morados oscuros predecibles, tarjetas clónicas y animaciones sin easing orgánico).

---

## 1. Directrices Visuales "Impeccable" (Anti-Generic AI Slop)
- **Identidad Propia:** Los elementos deben reflejar la esencia de la aplicación (Liga de Fútbol Santafesino: verde césped esmeralda, azul deportivo estructurado, acentos de tarjeta amarilla/roja de alta legibilidad, fondos neutros nítidos con slate/zinc).
- **Jerarquía Tipográfica Intencional:**
  - Evitar tamaños y pesos repetitivos sin contraste.
  - Títulos con escala modular definida y tracking sutilmente negativo en tamaños grandes.
  - Subtítulos en medium/semibold con `color: #64748b` o `#475569`.
  - `tabular-nums` para cronómetros, minutos, tanteadores y dorsales para evitar saltos de layout (*layout shift*).
- **Superficies y Profundidad:**
  - Sustituir bordes gruesos o sombras negras duras por sombras multicapa sutiles (*ambient occlusion* y *key light* suave).
  - Fondos con contraste limpio: capas en `#ffffff` sobre fondos de aplicación `#f8fafc` o `#f1f5f9` (en modo claro) o grafito pizarra `#090d16` con bordes `#1e293b` (en modo oscuro focal).

---

## 2. Principios de "Make Interfaces Feel Better" (Jakub Krehel)
1. **Radio de Borde Concéntrico (Concentric Border Radius):**
   - Cuando un elemento está dentro de otro con padding:
     `radio_exterior = radio_interior + padding`
   - Evita la discordancia visual en badges, inputs y modales.
2. **Alineación Óptica (Optical Alignment):**
   - Centrado óptico de íconos, balones, flechas y badges numéricos (no meramente geométrico).
3. **Áreas de Toque Cómodas (Hit Targets):**
   - Mínimo 44x44px en controles táctiles y botones de acción rápida, utilizando `hitSlop` en móvil.
4. **Micro-detalles en Botones e Inputs:**
   - Focus ring de 2 a 3px con contraste accesible (WCAG AA).
   - Estados pressed/active con compresión de escala sutil (`scale(0.98)` o `scale(0.96)`).
   - Deshabilitados legibles sin perder el contexto visual.

---

## 3. Convenciones de Animación y Motion (transitions.dev & GSAP)
- **Tokenización Semántica:**
  - Duraciones rápidas para feedback (`150ms - 200ms`).
  - Transiciones de componentes y paneles (`250ms - 350ms`).
  - Cambios estructurales o modales (`350ms - 450ms`).
- **Curvas de Easing Físicas:**
  - Nunca usar `linear` o `ease-in` para entradas de UI.
  - Salidas y micro-interacciones: `cubic-bezier(0.16, 1, 0.3, 1)` (power3.out / expo.out) para sensación instantánea y desaceleración suave.
  - Rebote orgánico suave para badges y goles: `back.out(1.4)`.
- **Compositor Thread:**
  - Animar exclusivamente `transform` (`scale`, `translate3d`) y `opacity`.
- **Accesibilidad:**
  - Respetar `prefers-reduced-motion` reduciendo o desactivando movimientos traslacionales.

---

## 4. Integración de GSAP + ScrollTrigger
- Los hooks y utilidades de animación se centralizan en `@/utils/animations.ts` y componentes especializados para React / React Native Web.
