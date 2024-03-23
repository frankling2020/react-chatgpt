"""Gunicorn configuration file.

This file contains the configuration settings for the Gunicorn web server.

Attributes:
    workers (int): The number of worker processes for handling requests.
    worker_class (str): The type of worker class to use.
    bind (str): The socket to bind the server to.
"""

workers = 3
worker_class = "gevent"
bind = "0.0.0.0:8000"
