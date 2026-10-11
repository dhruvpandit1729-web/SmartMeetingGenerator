from flask import Flask, request, jsonify
from flask_cors import CORS

from nlp_engine import process_meeting


app = Flask(__name__)

CORS(app)


@app.route("/")
def home():

    return jsonify({
        "message":
        "Smart Meeting Notes Generator API is running"
    })


@app.route("/api/test", methods=["GET"])
def test_api():

    return jsonify({
        "status": "success",
        "message":
        "Flask backend is connected"
    })


@app.route("/api/process-text", methods=["POST"])
def process_text():

    data = request.get_json()

    transcript = data.get(
        "transcript",
        ""
    ).strip()

    if not transcript:

        return jsonify({
            "status": "error",
            "message":
            "No transcript provided"
        }), 400

    try:

        result = process_meeting(
            transcript
        )

        return jsonify({
            "status": "success",
            "message":
            "Meeting processed successfully",
            "analysis": result
        })

    except Exception as error:

        print(
            "NLP processing error:",
            error
        )

        return jsonify({
            "status": "error",
            "message":
            "NLP processing failed",
            "error": str(error)
        }), 500


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )