import { useState, useEffect } from 'react'

const getWidth = () => typeof window !== 'undefined' ? window.innerWidth : 1024

export function useBreakpoint() {
  const [width, setWidth] = useState(getWidth)

  useEffect(() => {
    let frame: number
    const fn = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setWidth(window.innerWidth)) }
    window.addEventListener('resize', fn)
    return () => { window.removeEventListener('resize', fn); cancelAnimationFrame(frame) }
  }, [])

  return {
    isMobile: width < 640,
    isTablet: width < 1024,
    width,
  }
}
