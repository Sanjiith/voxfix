# import os
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from dotenv import load_dotenv
# import google.generativeai as genai

# app = Flask(__name__)
# CORS(app)

# # Load API key
# load_dotenv()
# api_key = os.getenv("GEMINI_API_KEY")

# if not api_key:
#     raise ValueError("API key is missing! Set GEMINI_API_KEY in your .env file.")

# genai.configure(api_key=api_key)

# # Optional: list available models to verify
# try:
#     available_models = genai.list_models()
#     print("Available models and their methods:")
#     for m in available_models:
#         print(m.model, m.supported_methods)
# except Exception as e:
#     print("Error listing models:", e)

# # Choose a valid model from your available list
# VALID_MODEL_ID = "gemini-2.5-flash"  # <-- replace with an available model that supports generate_content

# @app.route("/generate_response", methods=["POST"])
# def generate_response():
#     try:
#         data = request.get_json()
#         print("Received data:", data)

#         user_input = data.get("prompt")
#         if not user_input:
#             return jsonify({"error": "No input provided"}), 400

#         model = genai.GenerativeModel(VALID_MODEL_ID)
#         response = model.generate_content(
#             f"Please correct the grammar and punctuation of this sentence without changing its meaning. Return only the corrected sentence without any Markdown or extra text:\n\n{user_input}"
#         )

#         corrected_text = response.text.strip()

#         # Remove any leading/trailing ** (Markdown bold)
#         if corrected_text.startswith("**") and corrected_text.endswith("**"):
#             corrected_text = corrected_text[2:-2].strip()

#         # Optional: remove "The corrected sentence is:" if model still adds it
#         if corrected_text.lower().startswith("the corrected sentence is:"):
#             corrected_text = corrected_text[len("the corrected sentence is:"):].strip()

#         print("Gemini response:", corrected_text)
#         return jsonify({"text": corrected_text})

#     except Exception as e:
#         print("🔥 Error in generate_response:", e)
#         return jsonify({
#             "error": "Failed to generate response",
#             "details": str(e)
#         }), 500
    
# if __name__ == "__main__":
#     app.run(debug=True, port=5001)


import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Load API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("API key is missing! Set GEMINI_API_KEY in your .env file.")

genai.configure(api_key=api_key)

# Use a valid model
VALID_MODEL_ID = "gemini-2.5-flash"

@app.route("/generate_response", methods=["POST"])
def generate_response():
    try:
        data = request.get_json()
        user_input = data.get("prompt")
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        model = genai.GenerativeModel(VALID_MODEL_ID)
        response = model.generate_content(
            f"Please correct the grammar and punctuation of this sentence without changing its meaning. "
            f"Return only the corrected sentence:\n\n{user_input}"
        )

        corrected_text = response.text.strip()
        if corrected_text.startswith("**") and corrected_text.endswith("**"):
            corrected_text = corrected_text[2:-2].strip()
        if corrected_text.lower().startswith("the corrected sentence is:"):
            corrected_text = corrected_text[len('the corrected sentence is:'):].strip()

        return jsonify({"text": corrected_text})

    except Exception as e:
        print("🔥 Error in generate_response:", e)
        return jsonify({"error": "Failed to generate response", "details": str(e)}), 500


# 🗣️ New Route: Generate a 5-minute speech
@app.route("/generate_speech", methods=["POST"])
def generate_speech():
    try:
        data = request.get_json()
        topic = data.get("topic")

        if not topic:
            return jsonify({"error": "No topic provided"}), 400

        model = genai.GenerativeModel(VALID_MODEL_ID)
        response = model.generate_content(
            f"Write a detailed, inspiring, and natural-sounding speech on the topic: '{topic}'. "
            f"The speech should be suitable for a 5-minute delivery (around 600–700 words). "
            f"Make it engaging, with an introduction, body, and conclusion. Avoid Markdown or formatting symbols."
        )

        speech_text = response.text.strip()
        return jsonify({"speech": speech_text})

    except Exception as e:
        print("🔥 Error in generate_speech:", e)
        return jsonify({"error": "Failed to generate speech", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
