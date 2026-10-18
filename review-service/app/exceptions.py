
class ProductNotFoundError(Exception):
    """Produk tidak ditemukan pada Product Service."""


class ProductServiceUnavailableError(Exception):
    """Product Service tidak dapat dihubungi atau mengalami gangguan."""
