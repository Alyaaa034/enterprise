
from pymongo.errors import DuplicateKeyError

from app.clients.product_client import get_product
from app.models import review_model
from app.schemas.review_schema import validate_review_data


class ReviewValidationError(Exception):
    def __init__(self, errors):
        self.errors = errors
        super().__init__("Data yang dikirim tidak valid")


class ReviewNotFoundError(Exception):
    pass


class DuplicateReviewError(Exception):
    """Pengguna sudah memberikan review untuk produk tersebut."""


def create_review(data):
    errors = validate_review_data(data)
    if errors:
        raise ReviewValidationError(errors)

    product_id = data["product_id"]

    # Pastikan produk tersedia sebelum membuat review.
    get_product(product_id)

    try:
        return review_model.create_review(data)
    except DuplicateKeyError as exc:
        raise DuplicateReviewError(
            "Pengguna sudah memberikan review untuk produk ini"
        ) from exc


def get_review(review_id):
    review = review_model.get_review_by_id(review_id)
    if review is None:
        raise ReviewNotFoundError("Review tidak ditemukan")
    return review


def get_product_reviews(product_id):
    return review_model.get_reviews_by_product(product_id)


def update_review(review_id, data):
    if not isinstance(data, dict):
        raise ReviewValidationError({
            "body": ["Request body harus berupa JSON object"]
        })

    errors = validate_review_data(data, partial=True)

    # Update hanya menerima rating dan comment.
    unexpected_fields = set(data) - {"rating", "comment"}
    for field in unexpected_fields:
        errors[field] = ["Field ini tidak dapat diubah"]

    if errors:
        raise ReviewValidationError(errors)

    if not data:
        raise ReviewValidationError({
            "body": ["Minimal kirim rating atau comment"]
        })

    review = review_model.update_review(review_id, data)
    if review is None:
        raise ReviewNotFoundError("Review tidak ditemukan")
    return review


def delete_review(review_id):
    deleted = review_model.delete_review(review_id)
    if not deleted:
        raise ReviewNotFoundError("Review tidak ditemukan")
