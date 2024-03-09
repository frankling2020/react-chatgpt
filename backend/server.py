"""Flask server to handle requests and responses.

This module contains the Flask server to handle requests and responses for the
OpenAI model.

Attributes:
    app (Flask): The Flask application instance.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from celery.result import AsyncResult
from celery_task import fetch_summary_from_openai
import socket


app = Flask(__name__)
CORS(app)


@app.route("/result/<task_id>", methods=["GET"])
def get_result_task(task_id):
    """Get the result of a Celery task.

    Args:
        task_id (str): The ID of the Celery task.

    Returns:
        dict: A dictionary containing the result of the Celery task.
    """
    result = AsyncResult(task_id).get()
    return jsonify(result)


@app.route("/submit", methods=["POST"])
def fetch_summary():
    """Fetch a summary from OpenAI using the provided query.

    Returns:
        dict: A dictionary containing the submitted Celery task ID.
    """
    api = request.json["api"]
    query = request.json["query"]
    task = fetch_summary_from_openai.delay(api, query)
    hostname = socket.gethostname()
    host_ip = socket.gethostbyname(hostname)
    return {"task_id": task.id, "host_ip": host_ip, "hostname": hostname}


if __name__ == "__main__":
    app.run()
