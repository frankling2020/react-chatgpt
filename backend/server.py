"""Flask server to handle requests and responses.

This module contains the Flask server to handle requests and responses for the
OpenAI model.

Attributes:
    app (Flask): The Flask application instance.
"""

from flask import Flask, request, jsonify, stream_with_context
from flask_cors import CORS
from celery.result import AsyncResult
from celery_task import fetch_summary_from_openai, openai_response
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


@app.route("/stream", methods=["POST"])
def fetch_stream_summary():
    """Fetch a streamed summary from OpenAI using the provided query.

    Returns:
        Response: A streamed response containing the summary.
    """
    api = request.json["api"]
    query = request.json["query"]
    stream = openai_response(api, query, stream=True)
    def generate():
        for chunk in stream:
            chunk_data = chunk.choices[0].delta.content
            if chunk_data:
                yield chunk_data
    return app.response_class(stream_with_context(generate()))


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
