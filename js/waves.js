// ===================== WAVE SYSTEM =====================
let spawnTimer = 0;
let spawnRate = 90;

function updateWaves() {
    const minutes = gameTime / 3600;

    // Difficulty curve from GDD2
    // 0-3 min: easy, 3-6: pressure, 6-10: dense, 10-15: test, 15+: survival
    if (minutes < 3) {
        spawnRate = Math.max(40, 90 - Math.floor(minutes * 10));
    } else if (minutes < 6) {
        spawnRate = Math.max(20, 60 - Math.floor((minutes - 3) * 10));
    } else if (minutes < 10) {
        spawnRate = Math.max(12, 30 - Math.floor((minutes - 6) * 4));
    } else {
        // Post-10: stabilize, scale HP not count
        spawnRate = Math.max(15, 20 - Math.floor((minutes - 10) * 0.5));
    }

    spawnTimer++;
    if (spawnTimer >= spawnRate) {
        spawnTimer = 0;
        let count;
        if (minutes < 3) {
            count = 1 + Math.floor(minutes * 0.3);
        } else if (minutes < 6) {
            count = 2 + Math.floor((minutes - 3) * 0.5);
        } else {
            count = 3 + Math.floor(Math.min(minutes * 0.3, 6));
        }

        for (let i = 0; i < count; i++) {
            spawnEnemy();
        }
    }
}
