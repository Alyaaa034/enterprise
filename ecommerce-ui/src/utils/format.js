
export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function describeError(error) {
  if (!error) return ''

  if (error.status === 0) {
    return error.message || 'Tidak dapat terhubung ke server'
  }

  if (error.status === 404) {
    return 'Data tidak ditemukan'
  }

  if (error.status >= 500) {
    return 'Terjadi kesalahan pada server'
  }

  return error.message || 'Terjadi kesalahan'
}
