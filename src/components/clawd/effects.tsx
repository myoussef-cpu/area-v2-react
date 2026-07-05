import { motion } from 'framer-motion'

export interface SparkleProps {
  delay: number
  x: number
  y: number
}

export function Sparkle({ delay, x, y }: SparkleProps): JSX.Element {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#fde047',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 1.2, delay, repeat: Infinity, repeatDelay: 1.5 }}
    >
      ✦
    </motion.div>
  )
}

export interface SweatDropProps {
  x: number
}

export function SweatDrop({ x }: SweatDropProps): JSX.Element {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: 10,
        pointerEvents: 'none',
      }}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: [0, 25, 50], opacity: [1, 0.7, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
    >
      <svg width="8" height="12" viewBox="0 0 8 12">
        <ellipse cx="4" cy="8" rx="4" ry="4" fill="#60A5FA" />
        <ellipse cx="4" cy="4" rx="2" ry="4" fill="#60A5FA" />
      </svg>
    </motion.div>
  )
}

export function SleepingZs(): JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        right: -24,
        top: -16,
        pointerEvents: 'none',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            fontWeight: 'bold',
            color: '#818cf8',
            fontSize: 16 - i * 3,
            right: i * 10,
            top: i * -12,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, -15, -30], x: [0, 5, 10] }}
          transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity }}
        >
          z
        </motion.span>
      ))}
    </div>
  )
}

export function HeartBurst(): JSX.Element {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: -32,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1.25rem',
        color: '#f87171',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.8], y: [0, -20, -35] }}
      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
    >
      ♥
    </motion.div>
  )
}
