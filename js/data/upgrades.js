// ===================== UPGRADES =====================
const UPGRADES = [
    // -- BOMB UPGRADES --
    { icon: '💣', name: '+1 BOMBA', desc: 'Coloca mais uma bomba simultânea', apply: (p) => { p.bombMax++; } },
    { icon: '💥', name: '+1 ALCANCE', desc: 'Explosão alcança +1 tile', apply: (p) => { p.bombRange++; } },
    { icon: '⏱️', name: '-COOLDOWN', desc: 'Reduz o tempo entre bombas', apply: (p) => { p.bombCooldownMax = Math.max(15, p.bombCooldownMax - 12); } },
    { icon: '🧨', name: 'PAVIO CURTO', desc: 'Bombas explodem mais rápido', apply: (p) => { p.bombTimer = Math.max(40, p.bombTimer - 20); } },
    { icon: '☢️', name: 'MEGA BOMBA', desc: '+2 alcance mas +cooldown', apply: (p) => { p.bombRange += 2; p.bombCooldownMax += 20; } },
    { icon: '💨', name: 'BOMBA VELOZ', desc: '+1 bomba e -cooldown', apply: (p) => { p.bombMax++; p.bombCooldownMax = Math.max(15, p.bombCooldownMax - 8); } },
    { icon: '🔗', name: 'REAÇÃO EM CADEIA', desc: 'Bombas detonam outras bombas', apply: (p) => { p.chainExplosion = true; } },
    { icon: '🔥', name: 'EXPLOSÃO PERFURANTE', desc: 'Explosões causam +1 dano', apply: (p) => { p.piercing++; } },

    // -- BOMB SHAPE UPGRADES --
    { icon: '⭕', name: 'BOMBA CIRCULAR', desc: 'Explosão em área circular', apply: (p) => { p.bombShape = 'circle'; } },
    { icon: '✖️', name: 'BOMBA X', desc: 'Explosão em diagonal (X)', apply: (p) => { p.bombShape = 'xshape'; } },
    { icon: '⭐', name: 'BOMBA ESTRELA', desc: 'Cruz + diagonal combinadas', apply: (p) => { p.bombShape = 'star'; } },
    { icon: '➖', name: 'BOMBA LINHA', desc: 'Explosão em linha dupla', apply: (p) => { p.bombShape = 'line'; } },
    { icon: '🟥', name: 'BOMBA TOTAL', desc: 'Explosão em quadrado completo', apply: (p) => { p.bombShape = 'full'; } },

    // -- PLAYER UPGRADES --
    { icon: '⚡', name: '+VELOCIDADE', desc: 'Move mais rápido', apply: (p) => { p.speed += 0.5; } },
    { icon: '❤️', name: '+1 HP MAX', desc: 'Aumenta e recupera vida máxima', apply: (p) => { p.maxHp++; p.hp = p.maxHp; } },
    { icon: '💖', name: 'CURA', desc: 'Recupera toda a vida', apply: (p) => { p.hp = p.maxHp; } },
    { icon: '🛡️', name: 'ARMADURA', desc: 'Reduz 1 de dano recebido', apply: (p) => { p.armor++; } },
    { icon: '🌀', name: 'ESCUDO', desc: 'Bloqueia o próximo hit', apply: (p) => { p.shield++; } },
    { icon: '💚', name: 'REGENERAÇÃO', desc: 'Recupera 1 HP a cada 10s', apply: (p) => { p.regen++; } },
    { icon: '🏃', name: 'DASH', desc: 'Aumenta velocidade muito', apply: (p) => { p.speed += 1.0; } },
    { icon: '💪', name: 'TANQUE', desc: '+3 HP max, -velocidade', apply: (p) => { p.maxHp += 3; p.hp += 3; p.speed = Math.max(1.5, p.speed - 0.5); } },
    { icon: '🪶', name: 'FANTASMA', desc: '3s invencível ao subir de nível', apply: (p) => { p.invincibleOnLevelUp = 180; } },

    // -- XP & LOOT UPGRADES --
    { icon: '🧲', name: 'MAGNETISMO', desc: 'Alcance de coleta +2 tiles', apply: (p) => { p.magnetRange += 2; } },
    { icon: '✨', name: 'XP DUPLO', desc: '+50% XP por gem', apply: (p) => { p.xpMultiplier += 0.5; } },
    { icon: '🍀', name: 'SORTE', desc: 'Inimigos dropam gems extras', apply: (p) => { p.luckyDrop++; } },
    { icon: '🌪️', name: 'VÁCUO', desc: 'Puxa todas as gems da tela', apply: (p) => { p.magnetRange += 1; } },
    { icon: '💰', name: 'TESOURO', desc: 'Gems valem o dobro', apply: (p) => { p.xpMultiplier += 1.0; } },

    // -- COMBAT UPGRADES --
    { icon: '🌵', name: 'ESPINHOS', desc: 'Reflete 1 dano no contato', apply: (p) => { p.thorns++; } },
    { icon: '🧊', name: 'CONGELAR', desc: '30% chance de congelar inimigos', apply: (p) => { p.freezeChance += 0.3; } },
    { icon: '☄️', name: 'QUEIMAR', desc: 'Explosões queimam (1 dano/s)', apply: (p) => { p.burnDamage++; } },
    { icon: '🎯', name: 'CRÍTICO', desc: '20% chance de dano dobrado', apply: (p) => { p.critChance += 0.2; } },
    { icon: '💠', name: 'BOMBA AO MATAR', desc: 'Mini explosão ao matar inimigo', apply: (p) => { p.bombOnKill = true; } },
    { icon: '⛔', name: 'AURA DE MEDO', desc: 'Inimigos próximos ficam lentos', apply: (p) => { p.fearAura = (p.fearAura || 0) + 1; } },
    { icon: '🌩️', name: 'TEMPESTADE', desc: 'Raio aleatório a cada 5s', apply: (p) => { p.stormLevel = (p.stormLevel || 0) + 1; } },
    { icon: '💀', name: 'EXECUÇÃO', desc: 'Mata inimigos com <20% HP', apply: (p) => { p.execute = true; } },
    { icon: '🌟', name: 'INVENCÍVEL', desc: '5s invencível ao subir de nível', apply: (p) => { p.invincibleOnLevelUp = 300; } },
    { icon: '🎰', name: 'JACKPOT', desc: '+1 opção de perk no próximo level', apply: (p) => { p.extraChoice = (p.extraChoice || 0) + 1; } },
];
