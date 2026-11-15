
import { useState } from 'react'

export default function ProductImage({ image, alt }) {
  const [imageError, setImageError] = useState(false)

  const transparentPixel =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  if (!image || image === transparentPixel || imageError) {
    return (
      <div className="image-placeholder">
        Gambar produk belum tersedia
      </div>
    )
  }

  const imageSource =
    image.startsWith('data:image/') ||
    image.startsWith('http://') ||
    image.startsWith('https://')
      ? image
      : `data:image/png;base64,${image}`

  return (
    <img
      src={imageSource}
      alt={alt}
      onError={() => setImageError(true)}
    />
  )
}
