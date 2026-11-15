
import { useCallback, useEffect, useState } from 'react'

export function useAsync(asyncFunction, deps = []) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await asyncFunction()
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
    // Dependencies tambahan disediakan oleh pemanggil hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { loading, data, error, reload: execute }
}
