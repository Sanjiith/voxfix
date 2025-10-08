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

# Optional: list available models to verify
try:
    available_models = genai.list_models()
    print("Available models and their methods:")
    for m in available_models:
        print(m.model, m.supported_methods)
except Exception as e:
    print("Error listing models:", e)

# Choose a valid model from your available list
VALID_MODEL_ID = "gemini-2.5-flash"  # <-- replace with an available model that supports generate_content
#gemini-2.5-pro
# VALID_MODEL_ID = "gemini-2.5-flash"

@app.route("/generate_response", methods=["POST"])
def generate_response():
    try:
        data = request.get_json()
        print("Received data:", data)

        user_input = data.get("prompt")
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        model = genai.GenerativeModel(VALID_MODEL_ID)

        response = model.generate_content(
            f"Please correct the grammar and punctuation of this sentence without changing its meaning:\n\n{user_input}"
        )

        print("Gemini response:", response.text)
        return jsonify({"text": response.text.strip()})

    except Exception as e:
        print("🔥 Error in generate_response:", e)
        return jsonify({
            "error": "Failed to generate response",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
