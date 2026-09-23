/**
 * Placeholder — Fase 2 implementará la escena Three.js completa.
 * Por ahora solo confirma que el módulo ES carga correctamente
 * y oculta el loader.
 */

const loader = document.getElementById('loader');
const hero = document.querySelector('.hero');

// Oculta el loader inmediatamente en este placeholder
if (loader) {
  loader.classList.add('hidden');
}

// Revela el texto si GSAP está disponible, si no, animación CSS fallback
if (typeof gsap !== 'undefined' && hero) {
  gsap.to(hero, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out', delay: 0.3 });
} else if (hero) {
  hero.style.opacity = '1';
}
