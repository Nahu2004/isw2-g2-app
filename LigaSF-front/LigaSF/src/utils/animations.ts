/**
 * Sistema centralizado de animación y micro-interacciones (transitions.dev + GSAP).
 * Soporta ejecución tanto en React Native como en entorno web con GSAP y ScrollTrigger.
 */

import { Platform } from 'react-native';

// Constantes de Easing y Timing inspiradas en transitions.dev
export const MOTION_TOKENS = {
  duration: {
    instant: 0.15,
    quick: 0.25,
    standard: 0.35,
    deliberate: 0.5,
  },
  easing: {
    // Curvas orgánicas de desaceleración instantánea
    easeOutExpo: 'expo.out',
    easeOutBack: 'back.out(1.4)',
    easeOutCubic: 'power2.out',
    easeOutQuart: 'power3.out',
    springSnappy: 'elastic.out(1, 0.75)',
  },
  cssTransitions: {
    fast: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    normal: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

// Carga perezosa de GSAP para evitar problemas en bundling móvil
let gsapInstance: any = null;
let scrollTriggerInstance: any = null;

export const getGSAP = async () => {
  if (Platform.OS !== 'web') return null;
  if (gsapInstance) return { gsap: gsapInstance, ScrollTrigger: scrollTriggerInstance };

  try {
    const gsapModule = await import('gsap');
    const scrollTriggerModule = await import('gsap/ScrollTrigger');
    gsapInstance = gsapModule.gsap || gsapModule.default || gsapModule;
    scrollTriggerInstance = scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

    if (gsapInstance && scrollTriggerInstance) {
      gsapInstance.registerPlugin(scrollTriggerInstance);
    }
    return { gsap: gsapInstance, ScrollTrigger: scrollTriggerInstance };
  } catch (err) {
    console.warn('GSAP no disponible en este entorno:', err);
    return null;
  }
};

/**
 * Anima la entrada escalonada (stagger) de una lista de elementos HTML en web
 */
export const animateStaggeredEntrance = async (
  selectorOrElements: string | HTMLElement[] | NodeListOf<Element>,
  options?: { delay?: number; stagger?: number; yOffset?: number }
) => {
  if (Platform.OS !== 'web') return;
  const bundle = await getGSAP();
  if (!bundle?.gsap) return;

  const { delay = 0, stagger = 0.06, yOffset = 18 } = options || {};

  bundle.gsap.fromTo(
    selectorOrElements,
    { opacity: 0, y: yOffset, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: MOTION_TOKENS.duration.standard,
      ease: MOTION_TOKENS.easing.easeOutQuart,
      stagger,
      delay,
      clearProps: 'transform,opacity',
    }
  );
};

/**
 * Micro-interacción: Pulso de gol o evento destacado (feedback físico suave)
 */
export const animateGoalPulse = async (target: any) => {
  if (Platform.OS !== 'web' || !target) return;
  const bundle = await getGSAP();
  if (!bundle?.gsap) return;

  bundle.gsap.fromTo(
    target,
    { scale: 0.9 },
    {
      scale: 1,
      duration: 0.45,
      ease: MOTION_TOKENS.easing.easeOutBack,
    }
  );
};
