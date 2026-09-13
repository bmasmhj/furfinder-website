'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Instagram/YouTube-style top progress bar.
 * 
 * Key UX improvement: Starts IMMEDIATELY on link click (before navigation),
 * not after the new page renders. This gives instant visual feedback.
 * 
 * Uses a global DOM element + CSS animations for zero-flicker performance.
 */

const BAR_ID = '__progress_bar'

function getBar() {
  return document.getElementById(BAR_ID) as HTMLDivElement | null
}

function createBar() {
  let bar = getBar()
  if (bar) return bar

  bar = document.createElement('div')
  bar.id = BAR_ID
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #FF6B4A, #FF8A6E, #FF6B4A);
    background-size: 200% 100%;
    z-index: 99999;
    pointer-events: none;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    opacity: 0;
    box-shadow: 0 0 8px rgba(255, 107, 74, 0.4), 0 0 4px rgba(255, 107, 74, 0.3);
    animation: progressShimmer 1.5s ease infinite;
  `
  document.body.appendChild(bar)

  // Inject shimmer keyframes once
  if (!document.getElementById('__progress_keyframes')) {
    const style = document.createElement('style')
    style.id = '__progress_keyframes'
    style.textContent = `
      @keyframes progressShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `
    document.head.appendChild(style)
  }

  return bar
}

let trickleTimer: ReturnType<typeof setInterval> | null = null
let currentProgress = 0

function start() {
  if (trickleTimer) clearInterval(trickleTimer)

  const bar = createBar()
  currentProgress = 15
  bar.style.opacity = '1'
  bar.style.width = '15%'
  bar.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease'

  // Trickle: fast at first, slows down approaching 85%
  trickleTimer = setInterval(() => {
    if (currentProgress >= 85) {
      currentProgress += 0.3
    } else if (currentProgress >= 65) {
      currentProgress += 1
    } else {
      currentProgress += 3
    }
    currentProgress = Math.min(currentProgress, 92)
    bar.style.width = `${currentProgress}%`
  }, 250)
}

function done() {
  if (trickleTimer) {
    clearInterval(trickleTimer)
    trickleTimer = null
  }

  const bar = getBar()
  if (!bar) return

  currentProgress = 100
  bar.style.width = '100%'

  setTimeout(() => {
    bar.style.opacity = '0'
    setTimeout(() => {
      bar.style.width = '0%'
      currentProgress = 0
    }, 300)
  }, 200)
}

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPathRef = useRef(pathname)
  const prevSearchRef = useRef(searchParams?.toString())

  // Finish loading when route actually changes
  useEffect(() => {
    const currentSearch = searchParams?.toString()
    if (prevPathRef.current !== pathname || prevSearchRef.current !== currentSearch) {
      done()
    }
    prevPathRef.current = pathname
    prevSearchRef.current = currentSearch
  }, [pathname, searchParams])

  // Intercept all <a> clicks to start progress immediately
  const handleClick = useCallback((e: MouseEvent) => {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return

    const href = anchor.getAttribute('href')
    if (!href) return

    // Skip external links, hash links, downloads, new-tab links
    if (
      anchor.target === '_blank' ||
      anchor.rel?.includes('external') ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#') ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey
    ) {
      return
    }

    // Skip if navigating to the same page
    const url = new URL(href, window.location.origin)
    if (url.pathname === pathname && url.search === window.location.search) {
      return
    }

    // Start the progress bar immediately!
    start()
  }, [pathname])

  useEffect(() => {
    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [handleClick])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trickleTimer) clearInterval(trickleTimer)
      const bar = getBar()
      if (bar) bar.remove()
      const style = document.getElementById('__progress_keyframes')
      if (style) style.remove()
    }
  }, [])

  return null // Renders via direct DOM manipulation for zero-flicker
}
