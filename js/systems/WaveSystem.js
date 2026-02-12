// ===================== WAVE SYSTEM =====================
class WaveSystem {
    constructor(scene) {
        this.scene = scene;
        this.spawnTimer = 0;
        this.spawnRate = 90;
    }

    update(gameTime) {
        const minutes = gameTime / 3600;
        const enemySystem = this.scene.enemySystem;
        if (!enemySystem) return;

        // Difficulty curve
        if (minutes < 3) {
            this.spawnRate = Math.max(40, 90 - Math.floor(minutes * 10));
        } else if (minutes < 6) {
            this.spawnRate = Math.max(20, 60 - Math.floor((minutes - 3) * 10));
        } else if (minutes < 10) {
            this.spawnRate = Math.max(12, 30 - Math.floor((minutes - 6) * 4));
        } else {
            this.spawnRate = Math.max(15, 20 - Math.floor((minutes - 10) * 0.5));
        }

        this.spawnTimer++;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            let count;
            if (minutes < 3) {
                count = 1 + Math.floor(minutes * 0.3);
            } else if (minutes < 6) {
                count = 2 + Math.floor((minutes - 3) * 0.5);
            } else {
                count = 3 + Math.floor(Math.min(minutes * 0.3, 6));
            }

            for (let i = 0; i < count; i++) {
                enemySystem.spawnEnemy(gameTime);
            }
        }
    }
}
