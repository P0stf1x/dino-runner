import { init_and_restart } from "./game.js";

const modal = document.getElementById("gameOverModal");
const final_score = document.getElementById("finalScore");
const nickname_input = document.getElementById("nicknameInput");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

let currentScore = 0;

export function showGameOver(score) {
    currentScore = score;
    final_score.textContent = score;
    nickname_input.value = "";
    modal.classList.remove("hidden");
    nickname_input.focus();
}

function hideGameOver() {
    modal.classList.add("hidden");
}

cancelButton.addEventListener("click", () => {
    hideGameOver();
});

submitButton.addEventListener("click", async () => {
    const nickname = nickname_input.value.trim();

    if (!nickname)
        return;

    await submitScore(nickname, currentScore);

    hideGameOver();
});

async function submitScore(nickname, score) {
    const response = await fetch("./api/leaderboard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname,
            score
        })
    });

    if (!response.ok) {
        alert("Failed to submit score");
    }
}
