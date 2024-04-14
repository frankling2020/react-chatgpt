"""
This module contains the backend logic for the Gemini chatbot.
"""

import os
import re
import types
import base64
import requests
from markdown_it import MarkdownIt
import pyperclip
import streamlit as st
import google.generativeai as genai
from backend import GeminiChat, Counter

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if "google_api_key" not in st.session_state or st.session_state.google_api_key is None:
    st.session_state.google_api_key = GOOGLE_API_KEY
genai.configure(api_key=st.session_state.google_api_key)
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")


def pre_session_state():
    """Pre-session state initialization"""
    # Create the directory for uploads
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    # Initialize session state to persist user module
    if "usr_module" not in st.session_state:
        st.session_state.usr_module = types.ModuleType("user_module")
    # 'counter' object
    if "counter" not in st.session_state:
        st.session_state.counter = Counter()


def init_session_state():
    """Initialize session state"""
    reset_chat_history()
    # Initialize session state to persist chat history
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
    # Initialize Gemini Chat object
    if "gemini_chat" not in st.session_state or st.session_state.gemini_chat is None:
        st.session_state.gemini_chat = GeminiChat(st.session_state.usr_module)
    st.session_state.started = True


def reset_chat_history():
    """Reset chat history"""
    if "chat_history" in st.session_state:
        st.session_state.chat_history = []
    if "gemini_chat" in st.session_state and st.session_state.gemini_chat is not None:
        st.session_state.gemini_chat.close()
        st.session_state.gemini_chat = None
    if os.path.exists("uploads"):
        for file in os.listdir("uploads"):
            os.remove(os.path.join("uploads", file))


def dfs(tokens, level=0):
    """Depth-first search to generate Table of Contents"""
    toc = []
    for i, token in enumerate(tokens):
        if token.type in ["heading_open", "strong_open"]:
            content = tokens[i + 1].content
            anchor = re.sub(r"[^\w]+", " ", content.lower()).strip()
            anchor = anchor.replace(" ", "-")
            if token.type == "heading_open":
                content_level = level
                content = f"- [{content}](#{anchor})"
            else:
                content_level = level + 1
                content = f"- {content}"
            content = " " * content_level + content
            toc.append(content)
        elif token.type == "inline":
            toc.extend(dfs(token.children, level + 1))
    return toc


def generate_toc(markdown_content):
    """Generate Table of Contents from markdown content"""
    # Parse markdown content
    md = MarkdownIt()
    tokens = md.parse(markdown_content)
    # Generate Table of Contents
    toc = ""
    toc = dfs(tokens)
    content = "\n".join(toc)
    return content


def get_access_token(client_id, client_secret):
    """Get Spotify access token"""
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic "
        + base64.b64encode((client_id + ":" + client_secret).encode()).decode(),
    }
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, headers=headers, data=data, timeout=2)
    access_token = response.json()["access_token"]
    return access_token


def extract_detailed_info(response):
    """Extract detailed information from Spotify response"""
    detailed_info = {}
    detailed_info["artist_name"] = [
        (artist["name"], list(artist["external_urls"].values())[0])
        for artist in response["artists"]
    ]
    detailed_info["name"] = response["name"].title()
    detailed_info["url"] = list(response["external_urls"].values())[0]
    detailed_info["release_date"] = response["release_date"]
    detailed_info["image"] = response["images"][0]["url"]
    return detailed_info


def search_song(query, access_token):
    """Spotify search for a song"""
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"q": query, "type": "album"}
    response = requests.get(url, headers=headers, params=params, timeout=2).json()
    response = response["albums"]["items"][0]
    response.pop("available_markets")
    return extract_detailed_info(response)


def display_song_info(song_info):
    """Display song information with a Spotify-like format"""
    with st.container(border=True):
        st.image(song_info["image"], use_column_width=True)
        st.markdown(f"[**{song_info['name']}**]({song_info['url']})")
        st.markdown(f"**Release Date**: {song_info['release_date']}")
        st.markdown("**Artists**")
        for artist in song_info["artist_name"]:
            st.markdown(f"- [{artist[0]}]({artist[1]})")


def create_chat_history():
    """Create chat history"""
    # Display chat history
    st.subheader("Chat History")
    num_history = len(st.session_state.chat_history)
    for mid, entry in enumerate(st.session_state.chat_history):
        message = entry["response"]
        need_expanded = mid == num_history - 1
        with st.expander(f"Message {mid}", expanded=need_expanded):
            st.write(f"User: {entry['text']}")
            col1, col2 = st.columns([3, 7])
            with col1:
                st.markdown(entry["toc"], unsafe_allow_html=True)
            with col2:
                for img in entry["figure"]:
                    if img.lower().endswith(("png", "jpg", "jpeg")):
                        st.image(img, use_column_width=True)
                    elif img.lower().endswith(("mp3", "mp4")):
                        st.audio(img, format="audio/wav")
                st.markdown(message, unsafe_allow_html=True)
                copy_button_id = f"copy_button_{mid}"
                if st.button(label="📋", key=copy_button_id):
                    pyperclip.copy(message)
            for c, song_info in zip(st.columns([3, 3, 3]), entry["song_infos"]):
                with c:
                    display_song_info(song_info)


@st.cache_resource
def create_modules(uploaded_files=None):
    """Create modules from uploaded files"""
    module = st.session_state.usr_module
    for uploaded_file in uploaded_files:
        content = uploaded_file.read().decode("utf-8")
        with st.expander(f"Uploaded File: {uploaded_file.name}"):
            st.code(content, language="python")
        # Create a module from the uploaded file
        exec(content, module.__dict__)


@st.cache_data
def video_demo():
    """Display video demo"""
    st.video("demo.mov")


def create_sidebar():
    """Create sidebar for file upload and function calling"""
    with st.sidebar:
        st.subheader("Demo Video")
        video_demo()
        with st.form("api_key_form", clear_on_submit=True):
            st.write("Upload and Call Functions")
            uploaded_files = st.file_uploader(
                "Upload Python File", type="py", accept_multiple_files=True
            )
            if uploaded_files:
                # Create a module from the uploaded file
                create_modules(uploaded_files)
                module = st.session_state.usr_module
                # Dropdown to select function to call
                function_names = [
                    name for name in dir(module) if callable(getattr(module, name))
                ]
                selected_function = st.selectbox("Select function to call:", function_names)
                # Get selected function from the module
                function_to_call = getattr(module, selected_function)
                # Button to call selected function
                if st.button("Call Function"):
                    # Call the selected function
                    result = function_to_call()
                    st.write(f"Result of {selected_function}: {result}")
            # Button to start a new session
            genai_new_key = st.text_input("Enter Google API Key", type="password")
            start_bttn = st.form_submit_button("Start New Session")
            if start_bttn:
                if genai_new_key:
                    st.session_state.google_api_key = genai_new_key
                    genai.configure(api_key=st.session_state.google_api_key)
            if st.form_submit_button("Reset Session"):
                reset_chat_history()
                st.session_state.google_api_key = None
    return start_bttn


def save_uploaded_file(uploaded_file):
    """Save uploaded file"""
    path_name = os.path.join("uploads", uploaded_file.name)
    with open(path_name, "wb") as f:
        f.write(uploaded_file.getbuffer())
    return path_name


def upload_files_to_genai(uploaded_files):
    """Upload files to Generative AI"""
    prompt_content = []
    relative_path = []
    for uploaded_file in uploaded_files:
        path_name = save_uploaded_file(uploaded_file)
        relative_path.append(path_name)
        prompt_content.append(genai.upload_file(path_name))
    return prompt_content, relative_path


def prompt_file_uploader():
    """Prompt file uploader"""
    figure_file = st.file_uploader(
        "Upload Figure or Audio File",
        type=["png", "jpg", "jpeg", "mp3", "mp4"],
        accept_multiple_files=True,
    )
    return figure_file


def extract_songs(bot_response):
    """Extract songs from bot response"""
    # song name are within <li> tags within <div id="songs">
    songs = []
    song_div = re.search(r'<div id="songs">(.+?)</div>', bot_response, re.DOTALL)
    if song_div:
        song_list = re.findall(r"<li>(.+?)</li>", song_div.group(1))
        songs = song_list
    return songs


def main():
    """Main function for Streamlit app"""
    st.image("title.jpg", use_column_width=True)
    st.title("Music Creator with Gemini")
    # Initialize session state
    pre_session_state()
    # Create sidebar to upload and call functions
    start_bttn = create_sidebar()
    if start_bttn:
        init_session_state()
    if "started" in st.session_state:
        gemini_chat = st.session_state.gemini_chat
        history = st.session_state.chat_history
        counter = st.session_state.counter
        counter.increment()
        # Text input for user prompt
        with st.form("user_input_form", clear_on_submit=True):
            user_input = st.text_area("Enter text:", "")
            # File uploader for figure
            needed_files = prompt_file_uploader()
            # Button to send the user input to Gemini Chat and display the response
            b1, b2, _ = st.columns([1, 1, 7])
            with b1:
                if st.form_submit_button("Send"):
                    uploaded_files, relative_path = upload_files_to_genai(needed_files)
                    bot_response = gemini_chat.ask_response(
                        [user_input] + uploaded_files
                    )
                    song_names = extract_songs(bot_response)
                    access_token = get_access_token(
                        SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
                    )
                    song_infos = [
                        search_song(song, access_token) for song in song_names[:3]
                    ]
                    history.append(
                        {
                            "text": user_input,
                            "toc": generate_toc(bot_response),
                            "song_infos": song_infos,
                            "figure": relative_path,
                            "response": bot_response,
                        }
                    )
            with b2:
                if st.form_submit_button("Reset"):
                    reset_chat_history()
        # Display chat history
        create_chat_history()


if __name__ == "__main__":
    main()
