
def validate_review_data(data, partial=False):
    """Memvalidasi field review dan mengembalikan daftar error."""
    errors = {}

    if not isinstance(data, dict):
        return {"body": ["Request body harus berupa JSON object"]}

    if not partial or "product_id" in data:
        product_id = data.get("product_id")
        if (
            isinstance(product_id, bool)
            or not isinstance(product_id, int)
            or product_id < 1
        ):
            errors["product_id"] = [
                "product_id harus berupa integer minimal 1"
            ]

    if not partial or "user_id" in data:
        user_id = data.get("user_id")
        if (
            isinstance(user_id, bool)
            or not isinstance(user_id, int)
            or user_id < 1
        ):
            errors["user_id"] = [
                "user_id harus berupa integer minimal 1"
            ]

    if not partial or "rating" in data:
        rating = data.get("rating")
        if (
            isinstance(rating, bool)
            or not isinstance(rating, int)
            or not 1 <= rating <= 5
        ):
            errors["rating"] = ["rating harus berupa integer antara 1 dan 5"]

    if "comment" in data:
        comment = data["comment"]
        if comment is not None and not isinstance(comment, str):
            errors["comment"] = ["comment harus berupa string"]
        elif isinstance(comment, str) and len(comment) > 1000:
            errors["comment"] = ["comment maksimal 1000 karakter"]

    return errors
