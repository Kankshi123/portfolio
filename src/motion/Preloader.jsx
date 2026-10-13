import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { identity } from '../site/content'
import { motionTokens } from './tokens'
import { usePortfolio } from '../site/usePortfolioData'

const introDuration = 1900
const curtainDuration = 0.82

export function Preloader({ onReveal, onComplete }) {
  const { content } = usePortfolio()
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const exitStarted = useRef(false)
  const completed = useRef(false)
  const photographerName = content?.settings?.logoText || content?.settings?.name || identity.name
  const city = (content?.settings?.baseCity || content?.settings?.city || identity.city).toUpperCase()
  const letters = Array.from(photographerName)

  const beginExit = () => {
    if (exitStarted.current) return
    exitStarted.current = true
    setProgress(100)
    setLeaving(true)
    onReveal()
  }

  const finish = () => {
    if (completed.current) return
    completed.current = true
    onComplete()
  }

  useEffect(() => {
    let frame = 0
    let startTime
    let exitTimer

    const update = time => {
      startTime ??= time
      const amount = Math.min((time - startTime) / introDuration, 1)
      setProgress(Math.floor(amount * 100))
      if (amount < 1 && !exitStarted.current) frame = requestAnimationFrame(update)
      else exitTimer = window.setTimeout(beginExit, 180)
    }

    frame = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(exitTimer)
    }
  }, [])

  const curtainMotion = {
    duration: curtainDuration,
    ease: motionTokens.easing.luxury,
  }

  return <div className="cinematic-preloader" role="status" aria-label="Introducing the portfolio">
    <motion.div className="preloader-curtain preloader-curtain-top" animate={{ y: leaving ? '-101%' : '0%' }} transition={curtainMotion} />
    <motion.div className="preloader-curtain preloader-curtain-bottom" animate={{ y: leaving ? '101%' : '0%' }} transition={curtainMotion} onAnimationComplete={() => { if (leaving) finish() }} />
    <motion.div className="preloader-content" animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: 0.28 }}>
      <span className="preloader-name" aria-label={photographerName}>
        {letters.map((letter, index) => <motion.span aria-hidden="true" key={`${letter}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, duration: 0.55, ease: motionTokens.easing.luxury }}>{letter === ' ' ? '\u00a0' : letter}</motion.span>)}
      </span>
      <span className="preloader-caption">PHOTOGRAPHY · {city}</span>
      <div className="preloader-progress" aria-hidden="true"><motion.span animate={{ width: `${progress}%` }} transition={{ duration: 0.12, ease: 'linear' }} /></div>
      <span className="preloader-counter" aria-live="off">{String(progress).padStart(3, '0')}</span>
    </motion.div>
    <button className="preloader-skip" type="button" onClick={beginExit} disabled={leaving}>Skip intro</button>
  </div>
}
