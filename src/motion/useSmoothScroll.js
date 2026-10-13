import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

// One scroll clock for Lenis and ScrollTrigger. Native scroll remains in charge
// whenever the visitor asks for reduced motion.
export function useSmoothScroll() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let active = true
    let loading = false
    let gsap
    let ScrollTrigger
    let frame

    const stop = () => {
      if (!lenisRef.current) return
      lenisRef.current.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(frame)
      lenisRef.current.destroy()
      lenisRef.current = null
      ScrollTrigger.refresh()
    }

    const start = async () => {
      if (motionPreference.matches || lenisRef.current || loading) return
      loading = true
      try {
        const [gsapModule, triggerModule] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger.js'),
        ])
        if (!active || motionPreference.matches) return
        gsap = gsapModule.gsap
        ScrollTrigger = triggerModule.ScrollTrigger
        gsap.registerPlugin(ScrollTrigger)
      lenisRef.current = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false })
      lenisRef.current.on('scroll', ScrollTrigger.update)
      frame = time => lenisRef.current?.raf(time * 1000)
      gsap.ticker.add(frame)
      gsap.ticker.lagSmoothing(0)
      } finally {
        loading = false
      }
    }

    const handlePreferenceChange = () => motionPreference.matches ? stop() : start()
    start()
    motionPreference.addEventListener('change', handlePreferenceChange)

    return () => {
      active = false
      motionPreference.removeEventListener('change', handlePreferenceChange)
      stop()
    }
  }, [])

  return lenisRef
}
