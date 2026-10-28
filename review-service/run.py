
import logging
import os
from threading import Lock

from flask import Flask, jsonify, request
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException

from app.database import initialize_database
from app.routes.review_routes import review_bp

load_dotenv()

app = Flask(__name__)
app.register_blueprint(review_bp)
_database_initialization_lock = Lock()


@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Endpoint tidak ditemukan"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"message": "Method tidak diizinkan"}), 405


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    if isinstance(error, HTTPException):
        return jsonify({"message": error.description}), error.code

    logging.exception("Terjadi kesalahan yang tidak tertangani")
    response = {"message": "Terjadi kesalahan pada server"}

    if os.getenv("FLASK_DEBUG", "0") == "1":
        response["error"] = str(error)

    return jsonify(response), 500


@app.before_request
def ensure_review_database_initialized():
    if request.endpoint != "reviews.create_review":
        return

    with _database_initialization_lock:
        if app.extensions.get("review_database_initialized"):
            return

        initialize_database()
        app.extensions["review_database_initialized"] = True


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    initialize_database()
    app.extensions["review_database_initialized"] = True

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "3002"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"

    app.run(host=host, port=port, debug=debug)
