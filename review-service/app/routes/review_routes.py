
from flask import Blueprint

from app.controllers import review_controller

review_bp = Blueprint("reviews", __name__)


@review_bp.route("/reviews/product/<int:product_id>", methods=["GET"])
def list_product_reviews(product_id):
    return review_controller.list_product_reviews(product_id)


@review_bp.route("/reviews/<review_id>", methods=["GET"])
def get_review(review_id):
    return review_controller.get_review(review_id)


@review_bp.route("/reviews", methods=["POST"])
def create_review():
    return review_controller.create_review()


@review_bp.route("/reviews/<review_id>", methods=["PUT"])
def update_review(review_id):
    return review_controller.update_review(review_id)


@review_bp.route("/reviews/<review_id>", methods=["DELETE"])
def delete_review(review_id):
    return review_controller.delete_review(review_id)
