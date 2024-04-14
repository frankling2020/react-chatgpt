"""
This module contains the backend logic for the Gemini chatbot.
"""

import google.generativeai as genai
from configuration import instruction, safety_settings


# Function to interact with OpenAI API
class GeminiChat:
    """Gemini Chat class"""

    def __init__(self, module=None):
        """Initialize Gemini Chat object with user module"""
        self.functions = {
            name: getattr(module, name)
            for name in dir(module)
            if callable(getattr(module, name))
        }
        self.model = genai.GenerativeModel(
            "models/gemini-1.5-pro-latest",
            tools=self.functions.values(),
            safety_settings=safety_settings,
            system_instruction=instruction,
        )
        self.chat_model = self.model.start_chat(enable_automatic_function_calling=True)

    def ask_response(self, prompt_content):
        """Ask response from Gemini chat model"""
        response = self.chat_model.send_message(prompt_content)
        return response.text

    def _display_history(self):
        """Display chat history"""
        for content in self.chat_model.history:
            print(
                content.role, "->", [type(part).to_dict(part) for part in content.parts]
            )
            print("-" * 80)

    def close(self):
        """Close chat model"""
        # self._display_history()
        # deprecated to avoid printing chat history
        print("Chat history is ended.")


class Counter:
    """Counter class for session state"""

    def __init__(self):
        self.count = 0

    def increment(self):
        """Increment counter"""
        self.count += 1
        print("State:", self.count)
        return self.count
