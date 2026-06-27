export const DEBUG = false;

import { Player } from "./player.js";
import { Obstacle } from "./obstacle.js";
import { ObstacleManager } from "./obstacle_manager.js";
import { bboxs_intersect } from "./bbox.js";
import { showGameOver } from "./gameover.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

ctx.textAlign = "center";
ctx.fillStyle = "#535353";

// This is awful way of loading sprites, but I'm not a JS dev, and making a good game isn't really it's end goal
const player_sprite_still = new Image();
const player_sprite_run1 = new Image();
const player_sprite_run2 = new Image();
const player_sprite_dead = new Image();
const obstacleImage = new Image();

let assetsLoaded = 0;

function assetLoaded() {
    assetsLoaded++;

    if (assetsLoaded === 5) {
        canvas.addEventListener("pointerdown", clicked);

        if (DEBUG) {
            console.log("Assets loaded. Changing state to WAITING");
        }
        state = game_state.WAITING;

        init_and_restart();
    }
}

player_sprite_still.onload = assetLoaded;
player_sprite_run1.onload = assetLoaded;
player_sprite_run2.onload = assetLoaded;
player_sprite_dead.onload = assetLoaded;
obstacleImage.onload = assetLoaded;

player_sprite_still.src = "./assets/dino/still.webp";
player_sprite_run1.src = "./assets/dino/run1.webp";
player_sprite_run2.src = "./assets/dino/run2.webp";
player_sprite_dead.src = "./assets/dino/dead.webp";
obstacleImage.src = "./assets/obstacle/0.webp";

let player = new Player(130, 600, player_sprite_still, player_sprite_run1, player_sprite_run2, player_sprite_dead);
let obstacle_manager = new ObstacleManager(200, obstacleImage)
let obstacles = [];
let score = 0;
let tutorial_timer = 0;

export const game_state = Object.freeze({
    LOADING:  0,
    WAITING:  1,
    TUTORIAL: 2,
    PLAYING:  3,
    FINISHED: 4,
});

if (DEBUG) {
    console.log("Starting game. Changing state to LOADING");
}
export let state = game_state.LOADING;

let lastFrameTime = performance.now();

export function init_and_restart() {
    obstacles = [];
    state = game_state.WAITING;
    lastFrameTime = performance.now();
    score = 0;
    tutorial_timer = 0;
    player.init();
    player.relative_y = 0;

    requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
    const dt = (currentTime - lastFrameTime) / 1000;

    lastFrameTime = currentTime;

    if (state == game_state.TUTORIAL || state == game_state.PLAYING) {
        update(dt);
    }
    if (state >= game_state.WAITING) {
        render();
    }

    requestAnimationFrame(gameLoop);
}

function clicked() {
    if (state == game_state.FINISHED) {
        if (DEBUG) {
            console.log("Restarting. Changing state to WAITING");
        }
        state = game_state.WAITING;
        init_and_restart();
        return;
    }
    if (state == game_state.WAITING) {
        if (DEBUG) {
            console.log("Pressed jump. Changing state to TUTORIAL");
        }
        state = game_state.TUTORIAL;
    }
    player.jump(750);
}

function update(dt) {
    player.tick(dt);
    let player_bbox = player.bbox();

    obstacles.forEach(obstacle => {
        obstacle.set_speed(score);
        obstacle.tick(dt);
        if (bboxs_intersect(player_bbox, obstacle.bbox())) {
            gameover();
        }
    });

    let i = 0;
    while (i < obstacles.length) {
        if (obstacles[i].is_outside()) {
            // swap i and last
            let temp = obstacles[i];
            obstacles[i] = obstacles[obstacles.length-1];
            obstacles[obstacles.length-1] = temp;

            // remove last
            obstacles.pop();
        } else {
            i += 1;
        }
    }

    if (state >= game_state.PLAYING) {
        obstacle_manager.tick(dt);
    }

    let new_obstacle = obstacle_manager.spawn();
    if (new_obstacle != null) {
        obstacles.push(new_obstacle);
    }

    score += (dt*10);
    tutorial_timer += dt;
    if (state == game_state.TUTORIAL && tutorial_timer >= 5) {
        if (DEBUG) {
            console.log("Tutorial time-out finished. Changing state to PLAYING");
        }
        state = game_state.PLAYING;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#535353";
    ctx.fillRect(0, 650, 1000, 4);

    obstacles.forEach(obstacle => {
        obstacle.render(ctx);
    });

    player.render(ctx);

    ctx.font = "48px 'Press Start 2P'";
    ctx.fillText(score.toFixed(0), canvas.width / 2, 200);

    if (state == game_state.WAITING) {
        ctx.font = "24px 'Press Start 2P'";
        ctx.fillText("Press left mouse button to jump", canvas.width / 2, 400);
    }

    if (state == game_state.FINISHED) {
        ctx.font = "24px 'Press Start 2P'";
        ctx.fillText("Press left mouse button to restart", canvas.width / 2, 400);
    }
}

function gameover() {
    if (DEBUG) {
        console.log("Hit obstacle. Changing state to FINISHED");
    }
    state = game_state.FINISHED;

    showGameOver(score.toFixed(0));
}
