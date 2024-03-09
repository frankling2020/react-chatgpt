"""Flask server to handle requests and responses.

This module contains the Flask server to handle requests and responses for the
OpenAI model.

Attributes:
    app (Flask): The Flask application instance.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from celery_task import fetch_summary_from_openai


app = Flask(__name__)
CORS(app)


@app.route("/submit", methods=["POST"])
def fetch_summary():
    """Fetch a summary from OpenAI using the provided query.

    Returns:
        dict: A dictionary containing the submitted Celery task ID.
    """
    api = request.json["api"]
    query = request.json["query"]
    response = fetch_summary_from_openai(api, query)
    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
