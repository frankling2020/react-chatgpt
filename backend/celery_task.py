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
    client = OpenAI(api_key=api)
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": instruction_text},
            {"role": "user", "content": prompt_text + query}
        ],
        temperature=0.5,
        top_p=1
    )
    # Default response in case of an error
    default_response = {"content": "Error: No response from OpenAI", "keywords": [], "jaccard": 0.0}
    try:
        # Extract response content
        response = completion.choices[0].message.content
        paragraphs = response.split("\n\n")
        raw_response = "\n\n".join(paragraphs[:-1])
        # Extract keywords from the response and sort them by length
        keywords = paragraphs[-1].split(": ")[1].split(", ")
        sorted_keywords = set(sorted(keywords, key=len, reverse=True))
        # compute how many keywords are in the query and the response
        query_keywords = set(query.split()).intersection(sorted_keywords)
        response_keywords = set(raw_response.split()).intersection(query_keywords)
        jaccard = round(len(response_keywords) / len(sorted_keywords), 3)
        # Update the default response with the extracted data
        default_response["content"] = response
        default_response["keywords"] = list(sorted_keywords)
        default_response["jaccard"] = jaccard
    except Exception as e:
        # Handle any exceptions that may occur
        default_response.update({"content": f"Error: {e}"})
    return default_response
