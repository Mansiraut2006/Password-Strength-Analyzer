
from flask import Flask, render_template, request, jsonify
import re

app = Flask(__name__)

# A small demonstration list of common passwords.
# This is not a complete compromised-password database.
COMMON_PASSWORDS = {
    "password", "password123", "12345678",
    "qwerty123", "admin123", "letmein"
}


def analyze_password(password):
    """Analyze password characteristics without saving the password."""

    if not isinstance(password, str):
        return {
            "error": "Please enter a valid password."
        }, 400

    if not password:
        return {
            "error": "Please enter a password to analyze."
        }, 400

    if len(password) > 1024:
        return {
            "error": "Please use a password of 1024 characters or fewer."
        }, 400

    checks = {
        "length": len(password) >= 12,
        "uppercase": bool(re.search(r"[A-Z]", password)),
        "lowercase": bool(re.search(r"[a-z]", password)),
        "number": bool(re.search(r"[0-9]", password)),
        "special": bool(re.search(r"[^A-Za-z0-9]", password)),
    }

    score = sum(checks.values())
    suggestions = []

    if len(password) < 12:
        suggestions.append(
            "Use at least 12 characters; a longer passphrase is better."
        )

    if not checks["uppercase"]:
        suggestions.append("Consider including an uppercase letter.")

    if not checks["lowercase"]:
        suggestions.append("Consider including a lowercase letter.")

    if not checks["number"]:
        suggestions.append("Consider including a number.")

    if not checks["special"]:
        suggestions.append("Consider including a special character.")

    if password.lower() in COMMON_PASSWORDS:
        strength = "Weak"
        suggestions.append(
            "This password matches a common example. Choose a unique one."
        )
    elif len(password) < 8 or score <= 2:
        strength = "Weak"
    elif len(password) >= 16 and score >= 4:
        strength = "Strong"
    elif len(password) >= 12 and score >= 4:
        strength = "Strong"
    else:
        strength = "Medium"

    if strength == "Strong":
        suggestions.insert(
            0,
            "Good result. Make sure the password is unique to this account."
        )

    if not suggestions:
        suggestions.append(
            "Consider using a longer, unique passphrase."
        )

    return {
        "strength": strength,
        "score": score,
        "checks": checks,
        "suggestions": suggestions
    }, 200


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request. Please try again."
        }), 400

    result, status = analyze_password(data.get("password"))
    return jsonify(result), status


if __name__ == "__main__":
    # Local development only. Do not use Flask's debug server in production.
    app.run(host="127.0.0.1", port=5000, debug=False)
