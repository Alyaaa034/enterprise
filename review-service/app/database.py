
import os

from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING
from pymongo.server_api import ServerApi

load_dotenv()

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://appuser:apppassword@localhost:27017/?authSource=admin",
)
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "reviewdb")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=3000,
    connectTimeoutMS=3000,
)

db = client[MONGO_DB_NAME]
reviews_collection = db["reviews"]


def initialize_database():
    """Memastikan MongoDB dapat dijangkau dan membuat indeks review."""
    client.admin.command("ping")

    reviews_collection.create_index(
        [("user_id", ASCENDING), ("product_id", ASCENDING)],
        unique=True,
        name="user_id_1_product_id_1",
    )
    reviews_collection.create_index(
        [("product_id", ASCENDING)],
        name="product_id_1",
    )
