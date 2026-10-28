
import logging
import os

from flask import jsonify, request
from pymongo.errors import PyMongoError

from app.database import client
from app.exceptions import (
    ProductNotFoundError,
    ProductServiceUnavailableError,
)
from app.services.review_service import (
    DuplicateReviewError,
    ReviewNotFoundError,
    ReviewValidationError,
)
from app.services import review_service

logger = logging.getLogger(__name__)
DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"


def _error_response(message, status_code, errors=None, exc=None):
    body = {"message": message}

    if errors is not None:
        body["errors"] = errors

    if DEBUG and exc is not None:
        body["error"] = str(exc)
        body["cause"] = repr(exc.__cause__) if exc.__cause__ else None

    return jsonify(body), status_code


def _handle_exception(exc):
    if isinstance(exc, DuplicateReviewError):
        return _error_response(str(exc), 409)
    
    if isinstance(exc, ReviewValidationError):
        return _error_response(str(exc), 422, errors=exc.errors)

    if isinstance(exc, ReviewNotFoundError):
        return _error_response(str(exc), 404)

    if isinstance(exc, ProductNotFoundError):
        return _error_response(
            "Data yang dikirim tidak valid",
            422,
            errors={"product_id": [str(exc)]},
        )

    if isinstance(exc, ProductServiceUnavailableError):
        logger.warning("Product Service bermasalah: %s", exc)
        return _error_response(
            "Product Service tidak dapat dihubungi",
            503,
            exc=exc,
        )

    if isinstance(exc, PyMongoError):
        logger.exception("Kesalahan database MongoDB")
        return _error_response("Terjadi kesalahan pada server", 500, exc=exc)

    logger.exception("Kesalahan tidak terduga")
    return _error_response("Terjadi kesalahan pada server", 500, exc=exc)


def health_check():
    try:
        client.admin.command("ping")
        return jsonify({"status": "healthy"}), 200
    except PyMongoError as exc:
        logger.warning("Health check gagal karena MongoDB tidak tersedia: %s", exc)
        return jsonify({"status": "unhealthy"}), 503


def list_product_reviews(product_id):
    try:
        product_id = int(product_id)
        if product_id < 1:
            return _error_response(
                "Data yang dikirim tidak valid",
                422,
                errors={
                    "product_id": [
                        "product_id harus berupa integer minimal 1"
                    ]
                },
            )

        result = review_service.get_product_reviews(product_id)
        return jsonify({
            "message": "Berhasil mengambil review produk",
            "data": result,
        }), 200
    except Exception as exc:
        return _handle_exception(exc)


def get_review(review_id):
    try:
        result = review_service.get_review(review_id)
        return jsonify({
            "message": "Berhasil mengambil review",
            "data": result,
        }), 200
    except Exception as exc:
        return _handle_exception(exc)


def create_review():
    try:
        data = request.get_json(silent=True)
        result = review_service.create_review(data)
        return jsonify({
            "message": "Berhasil membuat review",
            "data": result,
        }), 201
    except Exception as exc:
        return _handle_exception(exc)


def update_review(review_id):
    try:
        data = request.get_json(silent=True)
        result = review_service.update_review(review_id, data)
        return jsonify({
            "message": "Berhasil memperbarui review",
            "data": result,
        }), 200
    except Exception as exc:
        return _handle_exception(exc)


def delete_review(review_id):
    try:
        review_service.delete_review(review_id)
        return jsonify({"message": "Berhasil menghapus review"}), 200
    except Exception as exc:
        return _handle_exception(exc)
