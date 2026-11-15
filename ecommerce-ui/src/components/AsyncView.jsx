
import { describeError } from '../utils/format'

export default function AsyncView({
  loading,
  error,
  onRetry,
  children,
}) {
  if (loading) {
    return <p className="status">Memuat data...</p>
  }

  if (error) {
    return (
      <div>
        <p className="error">{describeError(error)}</p>

        {onRetry && (
          <button onClick={onRetry}>
            Coba Lagi
          </button>
        )}
      </div>
    )
  }

  return children
}
