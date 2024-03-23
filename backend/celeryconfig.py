"""Celery configuration file

This file contains the configuration settings for the Celery task queue.

Attributes:
    broker_url (str): The URL of the message broker.
    result_backend (str): The URL of the result backend.
    task_serializer (str): The serialization format for task messages.
    result_serializer (str): The serialization format for result messages.
    accept_content (list): A list of accepted content types for messages.
"""

import os

broker_url = os.getenv("CELERY_BROKER_URL")
result_backend = os.getenv("CELERY_RESULT_BACKEND")

task_serializer = 'json'
result_serializer = 'json'
accept_content = ['json']
