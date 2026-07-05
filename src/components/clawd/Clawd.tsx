import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Accessory } from './accessories'
import { CLAWD_BODY, CLAWD_DARK, CLAWD_SICK, CLAWD_SICK_DARK } from './constants'
import { SleepingZs, SweatDrop } from './effects'
import type { Mood } from './types'

export interface ClawdProps {
  mood: Mood
  scale?: number
  accessoryId?: number
  color?: string
  animated?: boolean
  className?: string
  style?: React.CSSProperties
}

function getBodyAnimation(mood: Mood, scale: number): Record<string, number[]> {
  switch (mood) {
    case 'happy':
      return { y: [0, -10 * scale, 0], scale: [1, 1.02, 1] }
    case 'sad':
      return { y: [0, 3 * scale, 0], scale: [1, 0.98, 1] }
    case 'sleeping':
      return { y: [0, 2 * scale, 0] }
    default:
      return { y: [0, -3 * scale, 0] }
  }
}

const LEG_OFFSETS = [
  { x: 2, delay: 0 },
  { x: 3.8, delay: 0.1 },
  { x: 9, delay: 0.2 },
  { x: 10.8, delay: 0.3 },
] as const

export function Clawd({
  mood,
  scale = 1,
  accessoryId,
  color,
  animated = true,
  className,
  style,
}: ClawdProps): JSX.Element {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (mood === 'sleeping') return
    const blink = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }
    const interval = setInterval(blink, 2000)
    return () => clearInterval(interval)
  }, [mood])

  const isSick = mood === 'sick'
  const bodyColor = color ?? (isSick ? CLAWD_SICK : CLAWD_BODY)
  const legColor = color ? bodyColor : (isSick ? CLAWD_SICK_DARK : CLAWD_DARK)

  const u = 8 * scale
  const armExtend = 1.5 * u
  const width = 14 * u + armExtend * 2
  const height = 12 * u

  const eyeHeight = isBlinking ? 0.3 * u : 2 * u

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', ...style }}
      animate={animated ? getBodyAnimation(mood, scale) : undefined}
      transition={animated ? {
        duration: mood === 'happy' ? 0.5 : 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      } : undefined}
    >
      <svg width={width} height={height} viewBox={`${-armExtend} 0 ${width} ${height}`}>
        {/* Shadow */}
        <ellipse
          cx={width / 2}
          cy={height - 0.5 * u}
          rx={4 * u}
          ry={0.5 * u}
          fill="rgba(0,0,0,0.15)"
        />

        {/* Body */}
        <rect x={1 * u} y={0} width={12 * u} height={7 * u} fill={bodyColor} />

        {/* Arm nubs */}
        <rect x={-0.5 * u} y={3.2 * u} width={1.5 * u} height={1.8 * u} fill={bodyColor} />
        <rect x={13 * u} y={3.2 * u} width={1.5 * u} height={1.8 * u} fill={bodyColor} />

        {/* Eyes */}
        {mood === 'sleeping' ? (
          <>
            <rect x={3.5 * u} y={2 * u} width={1.2 * u} height={0.3 * u} fill="#1a1a1a" />
            <rect x={9.3 * u} y={2 * u} width={1.2 * u} height={0.3 * u} fill="#1a1a1a" />
          </>
        ) : (
          <>
            <rect x={3.5 * u} y={1.5 * u} width={1 * u} height={eyeHeight} fill="#1a1a1a" />
            <rect x={9.5 * u} y={1.5 * u} width={1 * u} height={eyeHeight} fill="#1a1a1a" />
          </>
        )}

        {/* Sad eyebrows */}
        {mood === 'sad' && (
          <>
            <rect x={3 * u} y={1 * u} width={1.5 * u} height={0.3 * u} fill="#1a1a1a" transform={`rotate(-15 ${3.75 * u} ${1.15 * u})`} />
            <rect x={9.5 * u} y={1 * u} width={1.5 * u} height={0.3 * u} fill="#1a1a1a" transform={`rotate(15 ${10.25 * u} ${1.15 * u})`} />
          </>
        )}

        {/* X eyes for sick */}
        {mood === 'sick' && (
          <>
            <line x1={3.5 * u} y1={1.5 * u} x2={4.5 * u} y2={3.5 * u} stroke="#1a1a1a" strokeWidth={0.3 * u} />
            <line x1={4.5 * u} y1={1.5 * u} x2={3.5 * u} y2={3.5 * u} stroke="#1a1a1a" strokeWidth={0.3 * u} />
            <line x1={9.5 * u} y1={1.5 * u} x2={10.5 * u} y2={3.5 * u} stroke="#1a1a1a" strokeWidth={0.3 * u} />
            <line x1={10.5 * u} y1={1.5 * u} x2={9.5 * u} y2={3.5 * u} stroke="#1a1a1a" strokeWidth={0.3 * u} />
          </>
        )}

        {/* Accessory */}
        {accessoryId !== undefined && <Accessory id={accessoryId} u={u} />}

        {/* Legs */}
        {LEG_OFFSETS.map(({ x, delay }) => (
          <motion.rect
            key={x}
            x={x * u}
            y={7 * u}
            width={1.2 * u}
            height={2.5 * u}
            fill={legColor}
            animate={animated && mood === 'happy' ? { y: [0, -3, 0] } : {}}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: 'reverse', delay }}
          />
        ))}
      </svg>

      {/* Effects */}
      {mood === 'sleeping' && <SleepingZs />}
      {mood === 'sick' && (
        <>
          <SweatDrop x={-5} />
          <SweatDrop x={scale * 112} />
        </>
      )}
    </motion.div>
  )
}
