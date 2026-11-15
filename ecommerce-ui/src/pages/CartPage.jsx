
import { useState } from 'react'
import { useAsync } from '../hooks/useAsync'
import { getCartDetail } from '../api/aggregate'
import {
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../api/cartApi'
import { formatRupiah } from '../utils/format'
import Navbar from '../components/Navbar'
import AsyncView from '../components/AsyncView'

export default function CartPage() {
  const userId = localStorage.getItem('userId') || '1'
  const { loading, data, error, reload } = useAsync(
    () => getCartDetail(userId),
    [userId],
  )

  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState(false)

  const runAction = async (action, successMessage) => {
    if (actionLoading) return

    setActionLoading(true)
    setMessage('')
    setActionError(false)

    try {
      await action()
      await reload()
      setMessage(successMessage)
    } catch (err) {
      setActionError(true)
      setMessage(err.message || 'Aksi keranjang gagal dilakukan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdate = async (itemId, quantity) => {
    if (quantity < 1) return

    await runAction(
      () => updateCartItem(itemId, quantity),
      'Jumlah produk berhasil diperbarui.',
    )
  }

  const handleRemove = async (itemId) => {
    await runAction(
      () => removeCartItem(itemId),
      'Produk berhasil dihapus dari keranjang.',
    )
  }

  const handleClear = async () => {
    await runAction(
      () => clearCart(userId),
      'Keranjang berhasil dikosongkan.',
    )
  }

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header">
          <h1>Keranjang Belanja</h1>
          <button
            onClick={handleClear}
            disabled={loading || actionLoading || !data?.items?.length}
          >
            {actionLoading ? 'Memproses...' : 'Kosongkan Keranjang'}
          </button>
        </div>

        {message && (
          <p className={actionError ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}

        <AsyncView loading={loading} error={error}>
          {data?.items?.length ? (
            <>
              <div className="cart-list">
                {data.items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-info">
                      <h3>
                        {item.product?.name || 'Produk tidak ditemukan'}
                      </h3>

                      <p>
                        {item.product
                          ? formatRupiah(item.product.price)
                          : 'Harga tidak tersedia'}
                      </p>

                      <p>
                        Subtotal: {formatRupiah(item.subtotal)}
                      </p>
                    </div>

                    <div className="cart-item-actions">
                      <button
                        onClick={() =>
                          handleUpdate(item.id, item.quantity - 1)
                        }
                        disabled={loading || actionLoading || item.quantity <= 1}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          handleUpdate(item.id, item.quantity + 1)
                        }
                        disabled={loading || actionLoading}
                      >
                        +
                      </button>

                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={loading || actionLoading}
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cart-summary">
                <h2>
                  Total: {formatRupiah(data.totalPrice)}
                </h2>
              </div>
            </>
          ) : (
            <p className="muted">Keranjang masih kosong.</p>
          )}
        </AsyncView>
      </main>
    </>
  )
}
