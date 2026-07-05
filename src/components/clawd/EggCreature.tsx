import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { CLAWD_BODY, CLAWD_SICK } from './constants'
import { SleepingZs, SweatDrop } from './effects'
import type { Mood } from './types'

export interface EggCreatureProps {
  mood: Mood
  color?: string
  className?: string
  style?: React.CSSProperties
}

const EGG_RECTS = [
  { x: 20, y: 8, width: 24, height: 8 },
  { x: 12, y: 16, width: 40, height: 8 },
  { x: 8, y: 24, width: 48, height: 32 },
  { x: 12, y: 56, width: 40, height: 8 },
  { x: 20, y: 64, width: 24, height: 8 },
] as const

export function EggCreature({ mood, color, className, style }: EggCreatureProps): JSX.Element {
  const [crackLevel, setCrackLevel] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCrackLevel((prev) => (prev + 1) % 4)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const isSick = mood === 'sick'
  const bodyColor = color ?? (isSick ? CLAWD_SICK : CLAWD_BODY)
  const isHappy = mood === 'happy'

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', ...style }}
      animate={
        isHappy
          ? { rotate: [-8, 8, -8], y: [0, -8, 0] }
          : { rotate: [-3, 3, -3], y: [0, -2, 0] }
      }
      transition={{
        duration: isHappy ? 0.4 : 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg width="64" height="80" viewBox="0 0 64 80">
        <ellipse cx="32" cy="76" rx="20" ry="4" fill="rgba(0,0,0,0.25)" />

        {EGG_RECTS.map(({ x, y, width, height }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} fill={bodyColor} />
        ))}

        {crackLevel > 0 && (
          <path d="M 44 24 L 40 32 L 46 40" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        )}
        {crackLevel > 1 && (
          <path d="M 20 28 L 24 36 L 18 42" stroke="#1a1a1a" strokeWidth="2" fill="none" />
        )}
        {crackLevel > 2 && (
          <>
            <rect x="24" y="44" width="6" height="8" fill="#1a1a1a" />
            <rect x="34" y="44" width="6" height="8" fill="#1a1a1a" />
          </>
        )}
      </svg>

      {mood === 'sleeping' && <SleepingZs />}
      {mood === 'sick' && <SweatDrop x={50} />}
    </motion.div>
  )
}
