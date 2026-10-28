
from datetime import datetime, timezone

from bson import ObjectId

from app.database import reviews_collection


def _serialize_review(review):
    """Mengubah dokumen MongoDB menjadi dictionary yang siap dikirim."""
    if review is None:
        return None

    review["id"] = str(review.pop("_id"))
    return review


def create_review(data):
    now = datetime.now(timezone.utc).isoformat()

    document = {
        "product_id": data["product_id"],
        "user_id": data["user_id"],
        "rating": data["rating"],
        "comment": data.get("comment"),
        "created_at": now,
        "updated_at": now,
    }

    result = reviews_collection.insert_one(document)
    document["_id"] = result.inserted_id

    return _serialize_review(document)


def get_review_by_user_and_product(user_id, product_id):
    review = reviews_collection.find_one(
        {"user_id": user_id, "product_id": product_id}
    )
    return _serialize_review(review)


def get_review_by_id(review_id):
    if not ObjectId.is_valid(review_id):
        return None

    review = reviews_collection.find_one({"_id": ObjectId(review_id)})
    return _serialize_review(review)


def get_reviews_by_product(product_id):
    reviews = [
        _serialize_review(review)
        for review in reviews_collection.find({"product_id": product_id})
        .sort("created_at", -1)
    ]

    total_reviews = len(reviews)
    average_rating = (
        round(sum(review["rating"] for review in reviews) / total_reviews, 1)
        if total_reviews
        else 0.0
    )

    return {
        "product_id": product_id,
        "summary": {
            "average_rating": average_rating,
            "total_reviews": total_reviews,
        },
        "reviews": reviews,
    }


def update_review(review_id, data):
    if not ObjectId.is_valid(review_id):
        return None

    updates = {
        key: data[key]
        for key in ("rating", "comment")
        if key in data
    }

    if not updates:
        return get_review_by_id(review_id)

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    reviews_collection.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": updates},
    )

    return get_review_by_id(review_id)


def delete_review(review_id):
    if not ObjectId.is_valid(review_id):
        return False

    result = reviews_collection.delete_one({"_id": ObjectId(review_id)})
    return result.deleted_count > 0
