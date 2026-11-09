// Thinking Hack Academy — 3D landing page (adapted from drill-webgi-tutorial)
// WebGI removed — no 3D model needed for a tuition business.
// Keeps Lenis smooth scroll + GSAP scroll animations for the hero aesthetic.

import "./styles.css";

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

gsap.registerPlugin(ScrollTrigger)

// Scroll-triggered reveal animations for THA sections
document.querySelectorAll('.subject').forEach((el, i) => {
  gsap.to(el, {
    y: 20,
    opacity: 0,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      end: 'bottom 60%',
      scrub: true,
    }
  })
})

document.querySelectorAll('.result').forEach((el, i) => {
  gsap.to(el, {
    y: 30,
    opacity: 0,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      end: 'bottom 60%',
      scrub: true,
    }
  })
})

// Hero CTA smooth scroll to booking section (WhatsApp)
document.querySelector('.button--hero')?.addEventListener('click', () => {
  const wa = document.querySelector('.button--wa')
  window.scrollTo({ top: wa?.getBoundingClientRect().top + window.scrollY - 100, left: 0, behavior: 'smooth' })
})

// Footer CTA — open WhatsApp
document.querySelector('.button--footer')?.addEventListener('click', () => {
  window.open('https://wa.me/6590030002', '_blank')
})
