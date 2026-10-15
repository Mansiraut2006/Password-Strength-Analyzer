
const form = document.getElementById("password-form");
const passwordInput = document.getElementById("password");
const toggleButton = document.getElementById("toggle-password");
const clearButton = document.getElementById("clear-button");
const analyzeButton = document.getElementById("analyze-button");
const statusMessage = document.getElementById("status");

const results = document.getElementById("results");
const strengthBadge = document.getElementById("strength-badge");
const meterFill = document.getElementById("meter-fill");
const meterPercent = document.getElementById("meter-percent");
const resultDescription = document.getElementById("result-description");
const scoreNumber = document.getElementById("score-number");
const suggestionsList = document.getElementById("suggestions");

const checkNames = [
    "length",
    "uppercase",
    "lowercase",
    "number",
    "special"
];

function resetResults() {
    results.hidden = true;
    statusMessage.textContent = "";
    meterFill.style.width = "0%";
    meterPercent.textContent = "0%";

    checkNames.forEach(name => {
        const icon = document.getElementById(`icon-${name}`);
        icon.textContent = "○";
        icon.classList.remove("pass");
    });

    suggestionsList.replaceChildren();
}

function displayResults(data) {
    results.hidden = false;

    const percentages = {
        Weak: 25,
        Medium: 60,
        Strong: 100
    };

    const percentage = percentages[data.strength] ?? 0;

    meterFill.style.width = `${percentage}%`;
    meterPercent.textContent = `${percentage}%`;

    strengthBadge.textContent = data.strength;
    strengthBadge.className = "strength-badge";

    if (data.strength === "Strong") {
        strengthBadge.classList.add("strong");
        resultDescription.textContent =
            "Good result based on the selected rules.";
    } else if (data.strength === "Medium") {
        strengthBadge.classList.add("medium");
        resultDescription.textContent =
            "Some security criteria need improvement.";
    } else {
        resultDescription.textContent =
            "This password needs improvement.";
    }

    scoreNumber.textContent = `${data.score}/5`;

    checkNames.forEach(name => {
        const icon = document.getElementById(`icon-${name}`);

        if (data.checks[name]) {
            icon.textContent = "✓";
            icon.classList.add("pass");
        } else {
            icon.textContent = "×";
            icon.classList.remove("pass");
        }
    });

    suggestionsList.replaceChildren();

    data.suggestions.forEach(suggestion => {
        const item = document.createElement("li");
        item.textContent = suggestion;
        suggestionsList.appendChild(item);
    });
}

toggleButton.addEventListener("click", () => {
    const show = passwordInput.type === "password";

    passwordInput.type = show ? "text" : "password";
    toggleButton.textContent = show ? "⊘" : "◉";
    toggleButton.setAttribute(
        "aria-label",
        show ? "Hide password" : "Show password"
    );
    toggleButton.setAttribute("aria-pressed", String(show));
});

form.addEventListener("submit", async event => {
    event.preventDefault();
    resetResults();

    const password = passwordInput.value;

    if (!password) {
        statusMessage.textContent =
            "Please enter a sample password.";
        return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing...";

    try {
        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to analyze the password."
            );
        }

        displayResults(data);
    } catch (error) {
        statusMessage.textContent =
            error.message || "Unable to connect to the server.";
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.innerHTML = "<span>✦</span> Analyze Password";
    }
});

clearButton.addEventListener("click", () => {
    passwordInput.value = "";
    passwordInput.type = "password";

    toggleButton.textContent = "◉";
    toggleButton.setAttribute("aria-label", "Show password");
    toggleButton.setAttribute("aria-pressed", "false");

    resetResults();
    passwordInput.focus();
});
