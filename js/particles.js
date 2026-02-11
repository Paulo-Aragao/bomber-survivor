// ===================== PARTICLES =====================
let particles = [];
let damageNumbers = [];

function spawnParticles(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
        // Enforce particle cap
        if (particles.length >= MAX_PARTICLES) {
            particles.shift(); // recycle oldest
        }
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * speed;
        particles.push({
            x, y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 30 + Math.random() * 30,
            maxLife: 60,
            color,
            size: 2 + Math.random() * 4,
        });
    }
}

function spawnDamageNumber(x, y, text, color) {
    damageNumbers.push({
        x, y, text, color: color || '#fff',
        life: 45,
        vy: -2,
        scale: 1.5, // start big, shrink
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function updateDamageNumbers() {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const d = damageNumbers[i];
        d.y += d.vy;
        d.vy *= 0.97; // decelerate
        d.life--;
        d.scale = Math.max(1, d.scale * 0.95); // shrink to normal
        if (d.life <= 0) damageNumbers.splice(i, 1);
    }
}
