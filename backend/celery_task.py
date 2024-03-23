"""Celery task

This module contains the Celery task that fetches a summary fro
m OpenAI using the provided query.

Attributes:
    celery_app (Celery): The Celery instance used to create the task.
    fetch_summary_from_openai (Task): The Celery task that fetches a summary from OpenAI.
"""

from celery import Celery
from openai import OpenAI
from prompt import prompt_text, instruction_text


# Initialize Celery instance and load configuration from the celeryconfig file
celery_app = Celery("celery_task")
celery_app.config_from_object("celeryconfig")


def openai_response(api, query, stream=False):
    """Fetch a summary from OpenAI using the provided query.

    Args:
        api (str): The OpenAI API key.
        query (str): The query to send to the OpenAI model.
        stream (bool): A boolean flag to indicate whether to stream the response.

    Returns:
        dict: A dictionary containing the submitted Celery task ID.
    """
    # Create a Celery task and send the query to the task
    client = OpenAI(api_key=api)
    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": instruction_text},
            {"role": "user", "content": prompt_text + query}
        ],
        temperature=0.5,
        top_p=1,
        stream=stream
    )
    return completion


@celery_app.task
def fetch_summary_from_openai(api, query):
    """Fetch a summary from OpenAI using the provided query.

    Args:
        api (str): The OpenAI API key.
        query (str): The query to send to the OpenAI model.

    Returns:
        dict: A dictionary containing the response content, a list of sorted keywords, 
        and the Jaccard similarity score.
    """
    # Create OpenAI client and send the query to the model
    completion = openai_response(api, query)
    # Default response in case of an error
    default_response = {"content": "Success"}
    try:
        # Extract response content
        response = completion.choices[0].message.content
        # Update the default response with the extracted data
        default_response["content"] = response
    except Exception as e:
        # Handle any exceptions that may occur
        default_response.update({"content": f"Error: {e}"})
    return default_response
