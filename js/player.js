// ===================== CHARACTERS =====================
const CHARACTERS = [
    {
        id: 'bomber',
        icon: '🧨',
        name: 'BOMBER',
        desc: 'Equilibrado. Mais bombas, fuse rápido.',
        stats: '+1 Bomba | -10% Fuse',
        color: '#4488ff',
        apply: (p) => {
            p.bombMax = 2;
            p.bombTimer = Math.floor(p.bombTimer * 0.9);
        }
    },
    {
        id: 'wind',
        icon: '🌪️',
        name: 'WIND ALCHEMIST',
        desc: 'Explosão X giratória, dano dobrado.',
        stats: 'Forma X | +100% Dano | -20% Alcance',
        color: '#44ddaa',
        apply: (p) => {
            p.bombShape = 'xshape';
            p.piercing += 1;
            p.bombRange = Math.max(1, p.bombRange - 1);
            p.windSpin = true;
        }
    },
    {
        id: 'gravity',
        icon: '🧲',
        name: 'GRAVITY NUN',
        desc: 'Bombas puxam inimigos antes de explodir.',
        stats: 'Gravity Pull | Setup & Combo',
        color: '#aa44ff',
        apply: (p) => {
            p.gravityBombs = true;
            p.bombTimer = Math.floor(p.bombTimer * 1.15);
        }
    }
];

// ===================== PLAYER =====================
let player = {};

function initPlayer() {
    player = {
        x: WORLD_W / 2,
        y: WORLD_H / 2,
        w: TILE * 0.7,
        h: TILE * 0.7,
        speed: 3.2,
        hp: 5,
        maxHp: 5,
        bombMax: 1,
        bombRange: 2,
        bombCooldown: 0,
        bombCooldownMax: 90,
        bombTimer: 120,
        bombShape: 'cross',
        invincible: 0,
        level: 1,
        xp: 0,
        xpNeeded: 5,
        magnetRange: 3,
        armor: 0,
        xpMultiplier: 1,
        thorns: 0,
        regen: 0,
        regenTimer: 0,
        shield: 0,
        piercing: 0,
        luckyDrop: 0,
        burnDamage: 0,
        freezeChance: 0,
        critChance: 0,
        bombOnKill: false,
        chainExplosion: false,
        invincibleOnLevelUp: 0,
        gravityBombs: false,
        windSpin: false,
        animFrame: 0,
        animTimer: 0,
        facing: 0,
        charId: 'bomber',
        charColor: '#4488ff',
    };

    // Apply character passive
    const char = CHARACTERS[selectedChar];
    player.charId = char.id;
    player.charColor = char.color;
    if (char.apply) char.apply(player);
}

function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) { dy = -1; player.facing = 2; }
    if (keys['KeyS'] || keys['ArrowDown']) { dy = 1; player.facing = 0; }
    if (keys['KeyA'] || keys['ArrowLeft']) { dx = -1; player.facing = 1; }
    if (keys['KeyD'] || keys['ArrowRight']) { dx = 1; player.facing = 3; }

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    player.x += dx * player.speed;
    player.y += dy * player.speed;
    player.x = Math.max(player.w / 2, Math.min(WORLD_W - player.w / 2, player.x));
    player.y = Math.max(player.h / 2, Math.min(WORLD_H - player.h / 2, player.y));

    // Walk animation
    if (dx !== 0 || dy !== 0) {
        player.animTimer++;
        if (player.animTimer > 8) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }
    } else {
        player.animFrame = 0;
        player.animTimer = 0;
    }

    // Bomb placement
    if (keys['Space'] && !gamePaused) placeBomb();

    if (player.bombCooldown > 0) player.bombCooldown--;
    if (player.invincible > 0) player.invincible--;
    if (damageFlash > 0) damageFlash--;

    // Regeneration
    if (player.regen > 0) {
        player.regenTimer++;
        if (player.regenTimer >= 600) {
            player.regenTimer = 0;
            const healAmt = player.regen;
            player.hp = Math.min(player.maxHp, player.hp + healAmt);
            spawnDamageNumber(player.x, player.y - TILE * 0.5, '+' + healAmt, '#44ff44');
            spawnParticles(player.x, player.y, '#44ff44', 5, 2);
        }
    }
}
