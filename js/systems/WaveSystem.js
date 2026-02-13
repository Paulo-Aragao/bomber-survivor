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

        const phases = CONFIG ? CONFIG.balance.waves.phases : null;

        if (phases) {
            // Find current phase
            let phase = phases[phases.length - 1];
            let phaseStartMin = 0;
            for (let i = 0; i < phases.length; i++) {
                if (minutes < phases[i].endMinute) {
                    phase = phases[i];
                    phaseStartMin = i > 0 ? phases[i - 1].endMinute : 0;
                    break;
                }
                phaseStartMin = phases[i].endMinute;
            }

            const phaseMinutes = minutes - phaseStartMin;
            this.spawnRate = Math.max(phase.spawnRateMin, phase.spawnRateBase - Math.floor(phaseMinutes * phase.spawnRateScale));

            this.spawnTimer++;
            if (this.spawnTimer >= this.spawnRate) {
                this.spawnTimer = 0;
                let count;
                if (phase.countUseAbsoluteMinutes) {
                    count = phase.countBase + Math.floor(Math.min(minutes * phase.countScale, phase.countMax || 999));
                } else {
                    count = phase.countBase + Math.floor(phaseMinutes * phase.countScale);
                }

                for (let i = 0; i < count; i++) {
                    enemySystem.spawnEnemy(gameTime);
                }
            }
        } else {
            // Fallback: original hardcoded logic
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
}
