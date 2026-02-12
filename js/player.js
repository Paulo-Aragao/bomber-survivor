// ===================== CHARACTERS =====================
const CHARACTERS = [
    {
        id: 'aussa',
        icon: '🌿',
        spriteSheet: 'aussa',
        portrait: 'Aussa/portrait.png',
        element: 'earth',
        name: 'AUSSA',
        subtitle: 'Earth Charmer',
        desc: 'Cria rochas ao explodir. Terremotos atordoam.',
        stats: '+2 HP | +1 Armadura | Explosões Rochosas',
        color: '#8B7355',
        bombColor: '#8B7355',
        explosionColor: '#A0826D',
        apply: (p) => {
            p.maxHp += 2;
            p.hp += 2;
            p.armor += 1;
            p.bombShape = 'cross';
            p.bombRange += 1;
            p.element = 'earth';
            // Mecânica única: Explosões deixam rochas temporárias que bloqueiam
            p.earthRocks = true;
        }
    },
    {
        id: 'eria',
        icon: '💧',
        spriteSheet: 'eria',
        portrait: 'Eria/portrait.png',
        element: 'water',
        name: 'ERIA',
        subtitle: 'Water Charmer',
        desc: 'Congela inimigos. Explosões onduladas.',
        stats: '70% Congelar | Ondas d\'Água | +Velocidade',
        color: '#5B9BD5',
        bombColor: '#5B9BD5',
        explosionColor: '#7AC5F5',
        apply: (p) => {
            p.freezeChance = 0.7;
            p.bombShape = 'circle';
            p.speed += 0.5;
            p.element = 'water';
            // Mecânica única: Explosões deixam poças que desaceleram inimigos
            p.waterPuddles = true;
        }
    },
    {
        id: 'hiita',
        icon: '🔥',
        spriteSheet: 'hiita',
        portrait: 'Hiita/portrait.png',
        element: 'fire',
        name: 'HIITA',
        subtitle: 'Fire Charmer',
        desc: 'Queima tudo. Explosões em cadeia.',
        stats: '+3 Queimar | Pavio Curto | Trilhas de Fogo',
        color: '#E74C3C',
        bombColor: '#FF6B3C',
        explosionColor: '#FF8C3C',
        apply: (p) => {
            p.burnDamage += 3;
            p.bombCooldownMax = Math.floor(p.bombCooldownMax * 0.6);
            p.bombTimer = Math.floor(p.bombTimer * 0.65);
            p.piercing += 2;
            p.element = 'fire';
            // Mecânica única: Explosões deixam trilhas de fogo
            p.fireTrails = true;
        }
    },
    {
        id: 'wynn',
        icon: '🌪️',
        spriteSheet: 'wynn',
        portrait: 'Wynn/portrait.png',
        element: 'wind',
        name: 'WYNN',
        subtitle: 'Wind Charmer',
        desc: 'Ventania empurra inimigos. Ultra rápida.',
        stats: '+100% Velocidade | Empurrão | Magnetismo',
        color: '#52C77D',
        bombColor: '#52C77D',
        explosionColor: '#72E79D',
        apply: (p) => {
            p.speed += 2.0;
            p.bombShape = 'xshape';
            p.magnetRange += 4;
            p.windSpin = true;
            p.element = 'wind';
            // Mecânica única: Explosões empurram inimigos para longe
            p.windPushback = true;
        }
    },
    {
        id: 'lyna',
        icon: '✨',
        spriteSheet: 'lyna',
        portrait: 'Lyna/portrait.png',
        element: 'light',
        name: 'LYNA',
        subtitle: 'Light Charmer',
        desc: 'Regeneração. Aura de luz. Explosões estelares.',
        stats: '+1 HP Regen | Aura Sagrada | Estrela 8-pontas',
        color: '#FFD700',
        bombColor: '#FFD700',
        explosionColor: '#FFFFCC',
        apply: (p) => {
            p.maxHp += 1;
            p.hp += 1;
            p.bombShape = 'star'; // 8 direções
            p.element = 'light';
            p.hpRegen = 0.05; // HP regen passivo
            p.lightAura = true; // Aura de dano
            p.flashBlind = 60; // Duração do atordoamento
        }
    },
    {
        id: 'dharc',
        icon: '🌑',
        spriteSheet: 'dharc',
        portrait: 'Dharc/portrait.png',
        element: 'dark',
        name: 'DHARC',
        subtitle: 'Dark Charmer',
        desc: 'Vampirismo. Teleporte sombrio. Velocidade noturna.',
        stats: 'Vampirismo 30% | Teleporte | +Velocidade (Low HP)',
        color: '#4B0082',
        bombColor: '#4B0082',
        explosionColor: '#8B008B',
        apply: (p) => {
            p.bombShape = 'xshape'; // X diagonal
            p.element = 'dark';
            p.vampirism = 0.3; // 30% HP recovery on kill
            p.shadowTeleport = true; // Pode teleportar para bombas
            p.nightSpeed = true; // Mais rápido com low HP
            p.maxHp -= 1; // Começa mais frágil
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
        facing: 0,
        charId: 'bomber',
        charColor: '#4488ff',

        // Lyna mechanics
        hpRegen: 0,
        lightAura: false,
        flashBlind: 0,

        // Dharc mechanics
        vampirism: 0,
        shadowTeleport: false,
        nightSpeed: false,
    };

    // Apply character passive
    const char = CHARACTERS[selectedChar];
    player.charId = char.id;
    player.charColor = char.color;
    player.spriteSheet = char.spriteSheet; // Sprite sheet reference
    player.spriteRow = 10; // Start facing down (South)
    player.spriteFrame = 0; // Animation frame (0-8)
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

    // Sprite direction and animation
    if (dy < 0) { player.facing = 2; player.spriteRow = 8; } // UP
    if (dy > 0) { player.facing = 0; player.spriteRow = 10; } // DOWN
    if (dx < 0) { player.facing = 1; player.spriteRow = 9; } // LEFT
    if (dx > 0) { player.facing = 3; player.spriteRow = 11; } // RIGHT

    // Walk animation - cycle through 9 frames
    if (dx !== 0 || dy !== 0) {
        player.animTimer++;
        if (player.animTimer > 6) { // ~10 FPS animation speed
            player.animTimer = 0;
            player.spriteFrame = (player.spriteFrame + 1) % 9;
        }
    } else {
        player.spriteFrame = 0; // Idle frame
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
