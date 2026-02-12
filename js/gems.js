// ===================== XP GEMS (with XP Closure) =====================
let gems = [];
let xpBank = 0;
const GEM_CAP = 80;

function handleGemDrop(x, y, value) {
    if (gems.length >= GEM_CAP) {
        // XP Closure: bank it instead of spawning
        xpBank += Math.floor(value * player.xpMultiplier);
        // Occasionally spawn mega gem for feedback
        if (Math.random() < 0.1) {
            spawnMegaGem(x, y);
        }
        return;
    }
    spawnGem(x, y, value);
}

function spawnGem(x, y, value) {
    gems.push({
        x, y, value,
        lifetime: 1800,
        magnet: false,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mega: false,
        size: 6,
    });
}

function spawnMegaGem(x, y) {
    gems.push({
        x, y, value: 0, // value comes from bank
        lifetime: 1800,
        magnet: false,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        mega: true,
        size: 12,
    });
}

function updateGems() {
    for (let i = gems.length - 1; i >= 0; i--) {
        const g = gems[i];
        g.lifetime--;

        g.vx *= 0.92;
        g.vy *= 0.92;
        g.x += g.vx;
        g.y += g.vy;

        const dist = Math.hypot(player.x - g.x, player.y - g.y);

        // Magnet
        if (dist < TILE * player.magnetRange) {
            const angle = Math.atan2(player.y - g.y, player.x - g.x);
            const magnetSpeed = 6;
            g.x += Math.cos(angle) * magnetSpeed;
            g.y += Math.sin(angle) * magnetSpeed;
        }

        // Collect
        if (dist < TILE * 0.6) {
            let xpGain = Math.floor(g.value * player.xpMultiplier);

            // Drain XP bank on any gem collect
            if (xpBank > 0) {
                xpGain += xpBank;
                xpBank = 0;
                // Big collect feedback
                spawnParticles(g.x, g.y, '#ffcc00', 8, 4);
                spawnDamageNumber(player.x, player.y - TILE, '💎 XP BANKED!', '#ffcc00');
            }

            player.xp += xpGain;
            spawnParticles(g.x, g.y, g.mega ? '#ffcc00' : '#44aaff', g.mega ? 8 : 4, 3);
            gems.splice(i, 1);

            // Play XP collect sound
            playXPCollectSound();

            // Level up check
            while (player.xp >= player.xpNeeded) {
                player.xp -= player.xpNeeded;
                player.level++;
                player.xpNeeded = Math.floor(player.xpNeeded * 1.4) + 2;
                if (player.invincibleOnLevelUp > 0) {
                    player.invincible = Math.max(player.invincible, player.invincibleOnLevelUp);
                    spawnParticles(player.x, player.y, '#ffff00', 10, 5);
                }

                // Play level up sound
                playLevelUpSound();
                showLevelUp();
                break; // show one level up at a time
            }
            continue;
        }

        if (g.lifetime <= 0) gems.splice(i, 1);
    }

    // Update chest drops
    for (let i = chestDrops.length - 1; i >= 0; i--) {
        const c = chestDrops[i];
        c.lifetime--;
        c.bob += 0.08;

        const dist = Math.hypot(player.x - c.x, player.y - c.y);
        if (dist < TILE * 0.8) {
            // Collect chest: show 2-perk choice
            chestDrops.splice(i, 1);
            showLevelUp(true); // chest = true for 2 perks
            triggerScreenFlash('rgba(255, 200, 0, 0.3)', 150);
            continue;
        }

        if (c.lifetime <= 0) chestDrops.splice(i, 1);
    }
}
