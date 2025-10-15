import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import re

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
        
        # Enhanced prompt with clearer instructions
        prompt = f"""
Please analyze and correct this sentence: "{user_input}"

Provide your response in this exact format:

CORRECTED_SENTENCE: [The corrected version of the sentence]
GRAMMAR_EXPLANATION: [Brief explanation of corrections made]
SUGGESTIONS: [Suggestion 1], [Suggestion 2], [Suggestion 3]
ALTERNATIVE_WORDS: [Word1], [Word2], [Word3], [Word4], [Word5]
OVERALL_ASSESSMENT: [Brief quality assessment]

Important: 
- Return ONLY the above format with these exact headers
- Do not add any extra text before or after
- For CORRECTED_SENTENCE, provide only the corrected sentence
- For SUGGESTIONS and ALTERNATIVE_WORDS, use comma separation
"""

        response = model.generate_content(prompt)
        analysis_text = response.text.strip()

        print("🔍 Raw AI Response:", analysis_text)  # Debug log
        
        # Parse the response to extract different components
        result = parse_analysis_response(analysis_text)
        
        # Ensure we always have a corrected sentence
        if not result.get("corrected_sentence"):
            result["corrected_sentence"] = user_input  # Fallback to original
        
        return jsonify({
            "corrected_sentence": result.get("corrected_sentence", user_input),
            "grammar_explanation": result.get("grammar_explanation", "No explanation provided."),
            "suggestions": result.get("suggestions", ["No suggestions available."]),
            "alternative_words": result.get("alternative_words", ["No alternatives available."]),
            "overall_assessment": result.get("overall_assessment", "No assessment available."),
            "full_analysis": analysis_text  # Include full response for debugging
        })

    except Exception as e:
        print("🔥 Error in generate_response:", e)
        return jsonify({"error": "Failed to generate response", "details": str(e)}), 500

def parse_analysis_response(text):
    """Parse the AI response to extract structured data"""
    result = {
        "corrected_sentence": "",
        "grammar_explanation": "",
        "suggestions": [],
        "alternative_words": [],
        "overall_assessment": ""
    }
    
    try:
        # More flexible parsing using regex
        corrected_match = re.search(r'CORRECTED_SENTENCE:\s*(.*?)(?=\n[A-Z_]|$)', text, re.IGNORECASE | re.DOTALL)
        explanation_match = re.search(r'GRAMMAR_EXPLANATION:\s*(.*?)(?=\n[A-Z_]|$)', text, re.IGNORECASE | re.DOTALL)
        suggestions_match = re.search(r'SUGGESTIONS:\s*(.*?)(?=\n[A-Z_]|$)', text, re.IGNORECASE | re.DOTALL)
        words_match = re.search(r'ALTERNATIVE_WORDS:\s*(.*?)(?=\n[A-Z_]|$)', text, re.IGNORECASE | re.DOTALL)
        assessment_match = re.search(r'OVERALL_ASSESSMENT:\s*(.*?)(?=\n[A-Z_]|$)', text, re.IGNORECASE | re.DOTALL)
        
        if corrected_match:
            result["corrected_sentence"] = corrected_match.group(1).strip()
        
        if explanation_match:
            result["grammar_explanation"] = explanation_match.group(1).strip()
        
        if suggestions_match:
            suggestions_text = suggestions_match.group(1).strip()
            # Split by commas and clean up
            result["suggestions"] = [s.strip() for s in suggestions_text.split(',') if s.strip()]
        
        if words_match:
            words_text = words_match.group(1).strip()
            # Split by commas and clean up
            result["alternative_words"] = [w.strip() for w in words_text.split(',') if w.strip()]
        
        if assessment_match:
            result["overall_assessment"] = assessment_match.group(1).strip()
        
        # Fallback: if no corrected sentence found, try to extract it differently
        if not result["corrected_sentence"]:
            result["corrected_sentence"] = extract_corrected_sentence_fallback(text)
            
    except Exception as e:
        print("Error parsing analysis response:", e)
        result["corrected_sentence"] = extract_corrected_sentence_fallback(text)
    
    return result

def extract_corrected_sentence_fallback(text):
    """Fallback method to extract corrected sentence if parsing fails"""
    # Remove common prefixes and try to find the first meaningful line
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if line and not any(header in line.upper() for header in ['CORRECTED_SENTENCE', 'GRAMMAR_EXPLANATION', 'SUGGESTIONS', 'ALTERNATIVE_WORDS', 'OVERALL_ASSESSMENT']):
            # Clean up the line
            clean_line = re.sub(r'^[^a-zA-Z"]*', '', line)  # Remove leading non-alphabet characters
            clean_line = re.sub(r'["\*]', '', clean_line)  # Remove quotes and asterisks
            if clean_line and len(clean_line) > 5:  # Ensure it's a meaningful sentence
                return clean_line.strip()
    
    # If all else fails, return the first 100 characters
    return text[:100].strip() if text else "No correction available"

# Simple grammar correction endpoint as backup
@app.route("/simple_correct", methods=["POST"])
def simple_correct():
    """Simple endpoint that just returns the corrected sentence"""
    try:
        data = request.get_json()
        user_input = data.get("prompt")
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        model = genai.GenerativeModel(VALID_MODEL_ID)
        response = model.generate_content(
            f"Please correct the grammar and punctuation of this sentence without changing its meaning. "
            f"Return only the corrected sentence without any extra text:\n\n{user_input}"
        )

        corrected_text = response.text.strip()
        
        # Clean up common prefixes
        if corrected_text.lower().startswith("the corrected sentence is:"):
            corrected_text = corrected_text[len("the corrected sentence is:"):].strip()
        if corrected_text.startswith("**") and corrected_text.endswith("**"):
            corrected_text = corrected_text[2:-2].strip()

        return jsonify({"corrected_sentence": corrected_text})

    except Exception as e:
        print("🔥 Error in simple_correct:", e)
        return jsonify({"error": "Failed to generate correction", "details": str(e)}), 500

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