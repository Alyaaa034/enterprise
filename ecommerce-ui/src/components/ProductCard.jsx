
import { Link } from 'react-router-dom'
import { formatRupiah } from '../utils/format'
import StarRating from './StarRating'
import ProductImage from './ProductImage'

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <ProductImage image={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <StarRating rating={product.rating} />
        <p className="price">{formatRupiah(product.price)}</p>

        <Link to={`/products/${product.id}`} className="button">
          Lihat Detail
        </Link>
      </div>
    </article>
  )
}
