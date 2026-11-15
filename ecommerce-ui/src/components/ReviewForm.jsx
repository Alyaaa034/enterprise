
import { useState } from 'react'

export default function ReviewForm({ productId, userId, onSubmit }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!comment.trim()) return

    setSubmitting(true)

    try {
      const result = await onSubmit(
        productId,
        userId,
        rating,
        comment.trim(),
      )

      if (result?.success) {
        setComment('')
        setRating(5)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Tulis Ulasan</h3>

      <label>
        Rating
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <label>
        Komentar
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Bagaimana pendapat Anda tentang produk ini?"
          required
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </form>
  )
}
