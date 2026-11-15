
// src/api/aggregate.js
// Menggabungkan data dari beberapa service untuk kebutuhan UI.

import { getProducts, getProduct } from './productApi'
import { getCart } from './cartApi'
import { getProductReviews } from './reviewApi'

export async function getProductsWithRating() {
  const products = await getProducts()

  return Promise.all(
    products.map(async (product) => {
      try {
        const reviewData = await getProductReviews(product.id)
        return { ...product, rating: reviewData.summary }
      } catch {
        return { ...product, rating: null }
      }
    }),
  )
}

export async function getProductDetail(id) {
  const [productResult, reviewResult] = await Promise.allSettled([
    getProduct(id),
    getProductReviews(id),
  ])

  if (productResult.status === 'rejected') {
    throw productResult.reason
  }

  return {
    product: productResult.value,
    reviews:
      reviewResult.status === 'fulfilled' ? reviewResult.value : null,
  }
}

export async function getCartDetail(userId) {
  const cart = await getCart(userId)

  const items = await Promise.all(
    cart.items.map(async (item) => {
      try {
        const product = await getProduct(item.product_id)
        return { ...item, product }
      } catch {
        return { ...item, product: null }
      }
    }),
  )

  const totalPrice = items.reduce(
    (total, item) =>
      total + (item.product ? Number(item.product.price) * item.quantity : 0),
    0,
  )

  return { ...cart, items, totalPrice }
}
