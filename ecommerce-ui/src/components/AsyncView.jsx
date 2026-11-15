
import { describeError } from '../utils/format'

export default function AsyncView({ loading, error, children }) {
  if (loading) {
    return <p className="status">Memuat data...</p>
  }

  if (error) {
    return <p className="error">{describeError(error)}</p>
  }

  return children
}
