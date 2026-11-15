
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAsync } from '../hooks/useAsync'
import { getProductDetail } from '../api/aggregate'
import { addToCart } from '../api/cartApi'
import { getProductReviews, createReview } from '../api/reviewApi'
import { formatRupiah } from '../utils/format'
import Navbar from '../components/Navbar'
import AsyncView from '../components/AsyncView'
import StarRating from '../components/StarRating'
import ReviewForm from '../components/ReviewForm'
import ProductImage from '../components/ProductImage'

export default function ProductDetailPage({ userId, onUserChange }) {
  const { id } = useParams()

  const { loading, data, error, reload } = useAsync(
    () => getProductDetail(id),
    [id],
  )

  const [quantity, setQuantity] = useState(1)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [cartError, setCartError] = useState(false)

  const [reviews, setReviews] = useState(null)
  const [reviewsError, setReviewsError] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState(false)

  const currentReviews = reviews !== null ? reviews : data?.reviews
  const currentReviewsError = reviewsError ?? data?.reviewsError

  const reloadReviews = async () => {
    setReviewsLoading(true)
    setReviewsError(null)

    try {
      const result = await getProductReviews(id)
      setReviews(result)
      setReviewsError(false)
    } catch (err) {
      setReviews(null)
      setReviewsError(err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!data?.product) return

    setCartLoading(true)
    setCartMessage('')
    setCartError(false)

    try {
      await addToCart(userId, data.product.id, quantity)
      setCartMessage('Produk berhasil ditambahkan ke keranjang.')
    } catch (err) {
      setCartError(true)
      setCartMessage(err.message || 'Gagal menambahkan produk ke keranjang.')
    } finally {
      setCartLoading(false)
    }
  }

  const handleReviewSubmit = async (
    productId,
    currentUserId,
    rating,
    comment,
  ) => {
    setReviewMessage('')
    setReviewError(false)

    try {
      await createReview(productId, currentUserId, rating, comment)
      await reloadReviews()

      setReviewMessage('Ulasan berhasil dikirim.')
      return { success: true }
    } catch (err) {
      setReviewError(true)
      setReviewMessage(
        err.message || 'Gagal mengirim ulasan. Silakan coba lagi.',
      )
      return { success: false }
    }
  }

  return (
    <>
      <Navbar userId={userId} onUserChange={onUserChange} />

      <main className="container">
        <AsyncView loading={loading} error={error} onRetry={reload}>
          {data?.product && (
            <>
              <section className="product-detail">
                <div className="product-detail-image">
                  <ProductImage
                    image={data.product.image}
                    alt={data.product.name}
                  />
                </div>

                <div className="product-detail-info">
                  <h1>{data.product.name}</h1>

                  <p className="price">
                    {formatRupiah(data.product.price)}
                  </p>

                  <p>{data.product.description}</p>

                  <p>Stok tersedia: {data.product.stock}</p>

                  <div className="cart-action">
                    <label htmlFor="product-quantity">Jumlah:</label>

                    <input
                      id="product-quantity"
                      type="number"
                      min="1"
                      max={data.product.stock}
                      value={quantity}
                      onChange={(event) => {
                        const value = Number(event.target.value)

                        setQuantity(
                          Number.isInteger(value) && value > 0
                            ? Math.min(value, Number(data.product.stock))
                            : 1,
                        )
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={
                        cartLoading || Number(data.product.stock) < 1
                      }
                    >
                      {cartLoading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                    </button>
                  </div>

                  {cartMessage && (
                    <p
                      role="status"
                      className={cartError ? 'error-message' : 'success-message'}
                    >
                      {cartMessage}
                    </p>
                  )}
                </div>
              </section>

              <section className="reviews-section">
                <h2>Ulasan Produk</h2>

                {currentReviewsError ? (
                  <div>
                    <p className="error-message">
                      Gagal memuat ulasan: {currentReviewsError.message}
                    </p>

                    <button
                      type="button"
                      onClick={reloadReviews}
                      disabled={reviewsLoading}
                    >
                      {reviewsLoading ? 'Memuat...' : 'Coba Lagi'}
                    </button>
                  </div>
                ) : (
                  <>
                    <StarRating rating={currentReviews?.summary} />

                    {currentReviews?.reviews?.length ? (
                      currentReviews.reviews.map((review) => (
                        <article className="review-card" key={review.id}>
                          <p>
                            <strong>Pengguna {review.user_id}</strong>
                          </p>
                          <p>Rating: {review.rating}/5</p>
                          <p>{review.comment}</p>
                        </article>
                      ))
                    ) : (
                      <p className="muted">Belum ada ulasan.</p>
                    )}
                  </>
                )}

                <ReviewForm
                  productId={data.product.id}
                  userId={userId}
                  onSubmit={handleReviewSubmit}
                />

                {reviewMessage && (
                  <p
                    role="alert"
                    className={reviewError ? 'error-message' : 'success-message'}
                  >
                    {reviewMessage}
                  </p>
                )}
              </section>
            </>
          )}
        </AsyncView>
      </main>
    </>
  )
}
