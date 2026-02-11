// ===================== JUICE SYSTEM =====================
let hitStopFrames = 0;
let killStreak = 0;
let killStreakTimer = 0;
const KILL_STREAK_WINDOW = 90; // frames to chain kills

function triggerHitStop(frames) {
    hitStopFrames = Math.max(hitStopFrames, frames);
}

function triggerWhiteFlash() {
    const flash = document.getElementById('white-flash');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 50);
}

function triggerScreenFlash(color, duration) {
    const flash = document.getElementById('white-flash');
    flash.style.background = color;
    flash.classList.add('active');
    setTimeout(() => {
        flash.classList.remove('active');
        flash.style.background = '#fff';
    }, duration || 60);
}

function addKillStreak() {
    killStreak++;
    killStreakTimer = KILL_STREAK_WINDOW;

    if (killStreak >= 3) {
        const display = document.getElementById('streak-display');
        let text = '';
        if (killStreak >= 20) text = `☠️ MASSACRE ×${killStreak}!`;
        else if (killStreak >= 10) text = `🔥 UNSTOPPABLE ×${killStreak}!`;
        else if (killStreak >= 5) text = `💥 RAMPAGE ×${killStreak}!`;
        else text = `⚡ COMBO ×${killStreak}!`;

        display.textContent = text;
        display.classList.remove('active');
        void display.offsetWidth; // force reflow
        display.classList.add('active');
        setTimeout(() => display.classList.remove('active'), 800);
    }
}

function updateKillStreak() {
    if (killStreakTimer > 0) {
        killStreakTimer--;
        if (killStreakTimer <= 0) killStreak = 0;
    }
}

function triggerLevelUpBurst() {
    // Golden particle explosion
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 5;
        particles.push({
            x: player.x, y: player.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 40 + Math.random() * 30,
            maxLife: 70,
            color: Math.random() > 0.5 ? '#ffcc00' : '#ff8800',
            size: 3 + Math.random() * 5,
        });
    }
    screenShake = 8;
    triggerScreenFlash('rgba(255, 200, 0, 0.3)', 150);
}

function triggerCritFlash() {
    triggerScreenFlash('rgba(255, 100, 255, 0.15)', 80);
}
