// ===================== HUD SCENE =====================
class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUD' });
    }

    create() {
        // HUD is managed via DOM elements
        // This scene just reads registry and updates DOM
    }

    update() {
        const p = this.registry.get('player');
        if (!p) return;

        const gameTime = this.registry.get('gameTime') || 0;
        const kills = this.registry.get('kills') || 0;
        const activeBombs = this.registry.get('activeBombs') || 0;

        // HP bar
        const hpBar = document.getElementById('hp-bar');
        if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;

        // XP bar
        const xpBar = document.getElementById('xp-bar');
        if (xpBar) xpBar.style.width = `${(p.xp / p.xpNeeded) * 100}%`;

        // Level
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) levelDisplay.textContent = `LV ${p.level}`;

        // Kills
        const killsDisplay = document.getElementById('kills');
        if (killsDisplay) killsDisplay.textContent = kills;

        // Timer
        const totalSeconds = Math.floor(gameTime / 60);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        const timer = document.getElementById('timer');
        if (timer) timer.textContent = `${mins}:${secs}`;

        // Bomb count
        const bombCount = document.getElementById('bomb-count');
        if (bombCount) bombCount.textContent = `💣 ${p.bombMax - activeBombs}/${p.bombMax}`;

        // Bomb cooldown bar
        const cdBar = document.getElementById('bomb-cooldown-bar');
        if (cdBar) {
            const cdPct = p.bombCooldown > 0 ? (1 - p.bombCooldown / p.bombCooldownMax) * 100 : 100;
            cdBar.style.width = `${cdPct}%`;
        }
    }
}
