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
            p.bombShape = 'star';
            p.element = 'light';
            p.hpRegen = 0.05;
            p.lightAura = true;
            p.flashBlind = 60;
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
            p.bombShape = 'xshape';
            p.element = 'dark';
            p.vampirism = 0.3;
            p.shadowTeleport = true;
            p.nightSpeed = true;
            p.maxHp -= 1;
        }
    }
];
