# backend/app.py
import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load API Key from .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("API key is missing! Set GEMINI_API_KEY in your .env file.")

genai.configure(api_key=api_key)

@app.route("/generate_response", methods=["POST"])
def generate_response():
    data = request.get_json()
    user_input = data.get("prompt")

    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    model = genai.GenerativeModel("gemini-1.5-flash")

    try:
        # Ask Gemini to correct grammar
        response = model.generate_content(f"Correct the grammar of this sentence: {user_input}")
        response_data = {"text": response.text.strip()}

        # Save response (optional)
        with open("data.json", "a") as json_file:
            json.dump(response_data, json_file, indent=4)
            json_file.write(",\n")

        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": "Failed to generate response", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
