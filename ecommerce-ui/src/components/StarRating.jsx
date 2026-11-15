
export default function StarRating({ rating }) {
  if (!rating || !rating.total_reviews) {
    return <span className="muted">Belum ada ulasan</span>
  }

  const average = Number(rating.average_rating).toFixed(1)

  return (
    <span className="rating">
      Rating: {average} ({rating.total_reviews} ulasan)
    </span>
  )
}
