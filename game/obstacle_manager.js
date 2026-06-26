import { Obstacle } from "./obstacle.js";

export class ObstacleManager {
    constructor(starting_speed, sprite) {
        this.speed = starting_speed;
        this.spawn_timer = 0;
        this.ready_to_spawn = false;

        this.sprite = sprite;
    }

    tick(dt) {
        this.spawn_timer -= dt;
        if (this.spawn_timer <= 0) {
            this.set_timer();
            this.ready_to_spawn = true;
        }
    }

    set_timer() {
        let new_time = Math.random();
        new_time *= 2;
        new_time += 1; // 1-3 seconds
        this.spawn_timer = new_time;
    }

    spawn() {
        // New obstacle or null
        if (this.ready_to_spawn) {
            this.ready_to_spawn = false;
            return (new Obstacle(575, this.speed, this.sprite));
        } else {
            return null;
        }
    }
}
