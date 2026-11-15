
import { useAsync } from '../hooks/useAsync'
import { getProductsWithRating } from '../api/aggregate'
import Navbar from '../components/Navbar'
import AsyncView from '../components/AsyncView'
import ProductCard from '../components/ProductCard'

export default function ProductListPage({ userId, onUserChange }) {
  const { loading, data, error, reload } = useAsync(
    getProductsWithRating,
    [],
  )

  return (
    <>
      <Navbar userId={userId} onUserChange={onUserChange} />

      <main className="container">
        <div className="page-header">
          <div>
            <h1>Daftar Produk</h1>
            <p className="muted">Temukan produk yang Anda butuhkan.</p>
          </div>

          <button onClick={reload} disabled={loading}>
            Muat Ulang
          </button>
        </div>

        <AsyncView loading={loading} error={error} onRetry={reload}>
          <div className="product-grid">
            {data?.length ? (
              data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="muted">Belum ada produk tersedia.</p>
            )}
          </div>
        </AsyncView>
      </main>
    </>
  )
}
