import { uid_get_or_new } from "./uid.js";

const leaderboard_body = document.querySelector("#leaderboardTable tbody");
const leaderboard_prev = document.getElementById("leaderboardPrev");
const leaderboard_next = document.getElementById("leaderboardNext");
const leaderboard_page_number = document.getElementById("leaderboardPage");
const leaderboard_search = document.getElementById("leaderboardSearch");

let page_number = 0;
let search_timeout = null;

leaderboard_prev.addEventListener("click", () => {
    if (page_number > 0) {
        page_number--;
        load_leaderboard();
    }
});

leaderboard_next.addEventListener("click", () => {
    page_number++;
    load_leaderboard();
});

leaderboard_search.addEventListener("input", e => {
    clearTimeout(search_timeout);

    search_timeout = setTimeout(() => {
        page_number = 0;
        load_leaderboard();
    }, 500);
});

async function load_leaderboard() {
    console.log("started loading leaderboard")
    leaderboard_body.innerHTML = `
        <tr>
            <td colspan="2">Loading...</td>
        </tr>
    `;

    try {
        console.log("got uid and page")
        const body = {
            uid: uid_get_or_new(),
            page: page_number
        };
        console.log("page number ", page_number)

        const nickname = leaderboard_search.value.trim();

        if (nickname.length > 0) {
            body.nickname = nickname;
        }
        console.log("got nickname ", nickname)

        const response = await fetch("./api/leaderboard/get", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const rows = await response.json();
        console.log("sent request")

        leaderboard_body.innerHTML = "";

        if (!rows.length) {
            leaderboard_body.innerHTML = `
                <tr>
                    <td colspan="2">No results.</td>
                </tr>
            `;
        } else {
            rows.forEach((player, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${player.nickname}</td>
                    <td>${player.score}</td>
                `;

                leaderboard_body.appendChild(tr);
            });
        }

        leaderboard_page_number.textContent = `${page_number + 1}`;

        leaderboard_prev.disabled = (page_number == 0);
    } catch (err) {
        leaderboard_body.innerHTML = `
            <tr>
                <td colspan="2">Failed to load leaderboard.</td>
            </tr>
        `;

        console.error(err);
    }
}

load_leaderboard();
