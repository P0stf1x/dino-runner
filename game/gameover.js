import { init_and_restart } from "./game.js";

const modal = document.getElementById("gameOverModal");
const final_score = document.getElementById("finalScore");
const nickname_input = document.getElementById("nicknameInput");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

let currentScore = 0;
let current_uid = "";
let current_session_id = "";

export function showGameOver(score, uid, session_id) {
    currentScore = score;
    current_uid = uid;
    current_session_id = session_id;
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

    await submitScore(nickname, currentScore, current_uid, current_session_id);

    hideGameOver();
});

async function submitScore(nickname, score, uid, session_id) {
    const response = await fetch("./api/leaderboard/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname,
            score,
            uid,
            session_id
        })
    });

    if (!response.ok) {
        const data = await response.json();
        let error_message = data.detail;
        alert(error_message);
    }
}
