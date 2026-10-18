
import os

import requests

from app.exceptions import (
    ProductNotFoundError,
    ProductServiceUnavailableError,
)

PRODUCT_SERVICE_URL = os.getenv(
    "PRODUCT_SERVICE_URL",
    "http://localhost:3000",
)


def get_product(product_id):
    """Mengambil detail produk dari Product Service."""
    url = f"{PRODUCT_SERVICE_URL.rstrip('/')}/products/{product_id}"

    try:
        response = requests.get(url, timeout=3)
    except requests.RequestException as exc:
        raise ProductServiceUnavailableError(
            "Product Service tidak dapat dihubungi"
        ) from exc

    if response.status_code == 404:
        raise ProductNotFoundError(
            f"Produk dengan id {product_id} tidak ditemukan"
        )

    if response.status_code != 200:
        raise ProductServiceUnavailableError(
            f"Product Service mengembalikan status {response.status_code}"
        )

    try:
        return response.json()
    except ValueError as exc:
        raise ProductServiceUnavailableError(
            "Respons Product Service bukan JSON yang valid"
        ) from exc
