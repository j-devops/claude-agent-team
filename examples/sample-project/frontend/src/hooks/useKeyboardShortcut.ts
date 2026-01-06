import { useEffect } from 'react'

type KeyHandler = (event: KeyboardEvent) => void

export function useKeyboardShortcut(
  key: string,
  handler: KeyHandler,
  modifiers: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  } = {}
) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const ctrlMatch = !modifiers.ctrl || event.ctrlKey
      const shiftMatch = !modifiers.shift || event.shiftKey
      const altMatch = !modifiers.alt || event.altKey
      const metaMatch = !modifiers.meta || event.metaKey

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch &&
        metaMatch
      ) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [key, handler, modifiers])
}
