// ===================== UPGRADES =====================
const UPGRADES = [
    // -- BOMB UPGRADES --
    { icon: '💣', name: '+1 BOMBA', desc: 'Coloca mais uma bomba simultânea', apply: () => { player.bombMax++; } },
    { icon: '💥', name: '+1 ALCANCE', desc: 'Explosão alcança +1 tile', apply: () => { player.bombRange++; } },
    { icon: '⏱️', name: '+1 BOMBA', desc: 'Carrega mais uma bomba', apply: () => { player.bombMax++; } },
    { icon: '🧨', name: 'PAVIO CURTO', desc: 'Bombas explodem mais rápido', apply: () => { player.bombTimer = Math.max(40, player.bombTimer - 20); } },
    { icon: '☢️', name: 'MEGA BOMBA', desc: '+2 alcance mas -velocidade', apply: () => { player.bombRange += 2; player.speed = Math.max(1.5, player.speed - 0.2); } },
    { icon: '💨', name: 'BOMBA DUPLA', desc: '+2 bombas máximas', apply: () => { player.bombMax += 2; } },
    { icon: '🔗', name: 'REAÇÃO EM CADEIA', desc: 'Bombas detonam outras bombas', apply: () => { player.chainExplosion = true; } },
    { icon: '🔥', name: 'EXPLOSÃO PERFURANTE', desc: 'Explosões causam +1 dano', apply: () => { player.piercing++; } },

    // -- BOMB SHAPE UPGRADES --
    { icon: '⭕', name: 'BOMBA CIRCULAR', desc: 'Explosão em área circular', apply: () => { player.bombShape = 'circle'; } },
    { icon: '✖️', name: 'BOMBA X', desc: 'Explosão em diagonal (X)', apply: () => { player.bombShape = 'xshape'; } },
    { icon: '⭐', name: 'BOMBA ESTRELA', desc: 'Cruz + diagonal combinadas', apply: () => { player.bombShape = 'star'; } },
    { icon: '➖', name: 'BOMBA LINHA', desc: 'Explosão em linha dupla', apply: () => { player.bombShape = 'line'; } },
    { icon: '🟥', name: 'BOMBA TOTAL', desc: 'Explosão em quadrado completo', apply: () => { player.bombShape = 'full'; } },

    // -- PLAYER UPGRADES --
    { icon: '⚡', name: '+VELOCIDADE', desc: 'Move mais rápido', apply: () => { player.speed += 0.5; } },
    { icon: '❤️', name: '+1 HP MAX', desc: 'Aumenta e recupera vida máxima', apply: () => { player.maxHp++; player.hp = player.maxHp; } },
    { icon: '💖', name: 'CURA', desc: 'Recupera toda a vida', apply: () => { player.hp = player.maxHp; } },
    { icon: '🛡️', name: 'ARMADURA', desc: 'Reduz 1 de dano recebido', apply: () => { player.armor++; } },
    { icon: '🌀', name: 'ESCUDO', desc: 'Bloqueia o próximo hit', apply: () => { player.shield++; } },
    { icon: '💚', name: 'REGENERAÇÃO', desc: 'Recupera 1 HP a cada 10s', apply: () => { player.regen++; } },
    { icon: '🏃', name: 'DASH', desc: 'Aumenta velocidade muito', apply: () => { player.speed += 1.0; } },
    { icon: '💪', name: 'TANQUE', desc: '+3 HP max, -velocidade', apply: () => { player.maxHp += 3; player.hp += 3; player.speed = Math.max(1.5, player.speed - 0.5); } },
    { icon: '🪶', name: 'FANTASMA', desc: '3s invencível ao subir de nível', apply: () => { player.invincibleOnLevelUp = 180; } },

    // -- XP & LOOT UPGRADES --
    { icon: '🧲', name: 'MAGNETISMO', desc: 'Alcance de coleta +2 tiles', apply: () => { player.magnetRange += 2; } },
    { icon: '✨', name: 'XP DUPLO', desc: '+50% XP por gem', apply: () => { player.xpMultiplier += 0.5; } },
    { icon: '🍀', name: 'SORTE', desc: 'Inimigos dropam gems extras', apply: () => { player.luckyDrop++; } },
    { icon: '🌪️', name: 'VÁCUO', desc: 'Puxa todas as gems da tela', apply: () => { gems.forEach(g => { g.lifetime = Math.max(g.lifetime, 120); const a = Math.atan2(player.y - g.y, player.x - g.x); g.vx = Math.cos(a) * 15; g.vy = Math.sin(a) * 15; }); player.magnetRange += 1; } },
    { icon: '💰', name: 'TESOURO', desc: 'Gems valem o dobro', apply: () => { player.xpMultiplier += 1.0; } },

    // -- COMBAT UPGRADES --
    { icon: '🌵', name: 'ESPINHOS', desc: 'Reflete 1 dano no contato', apply: () => { player.thorns++; } },
    { icon: '🧊', name: 'CONGELAR', desc: '30% chance de congelar inimigos', apply: () => { player.freezeChance += 0.3; } },
    { icon: '☄️', name: 'QUEIMAR', desc: 'Explosões queimam (1 dano/s)', apply: () => { player.burnDamage++; } },
    { icon: '🎯', name: 'CRÍTICO', desc: '20% chance de dano dobrado', apply: () => { player.critChance += 0.2; } },
    { icon: '💠', name: 'BOMBA AO MATAR', desc: 'Mini explosão ao matar inimigo', apply: () => { player.bombOnKill = true; } },
    { icon: '⛔', name: 'AURA DE MEDO', desc: 'Inimigos próximos ficam lentos', apply: () => { player.fearAura = (player.fearAura || 0) + 1; } },
    { icon: '🌩️', name: 'TEMPESTADE', desc: 'Raio aleatório a cada 5s', apply: () => { player.stormLevel = (player.stormLevel || 0) + 1; } },
    { icon: '💀', name: 'EXECUÇÃO', desc: 'Mata inimigos com <20% HP', apply: () => { player.execute = true; } },
    { icon: '🌟', name: 'INVENCÍVEL', desc: '5s invencível ao subir de nível', apply: () => { player.invincibleOnLevelUp = 300; } },
    { icon: '🎰', name: 'JACKPOT', desc: '+1 opção de perk no próximo level', apply: () => { player.extraChoice = (player.extraChoice || 0) + 1; } },
];

function showLevelUp(isChest) {
    gamePaused = true;
    selectedUpgrade = 0;
    const overlay = document.getElementById('levelup-overlay');
    overlay.classList.add('active');
    const container = document.getElementById('upgrade-options');
    container.innerHTML = '';

    const hint = document.getElementById('upgrade-hint');
    if (hint) hint.textContent = isChest ? '🎁 BAÚDE ELITE! ← → ENTER' : '← → SELECIONAR   SPACE/ENTER CONFIRMAR';

    const choiceCount = isChest ? 2 : (3 + (player.extraChoice || 0));
    if (!isChest && player.extraChoice > 0) player.extraChoice--;

    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5).slice(0, Math.min(choiceCount, UPGRADES.length));
    currentUpgradeChoices = shuffled;

    document.getElementById('levelup-title').textContent = isChest ? '🎁 ELITE CHEST!' : '⬆️ LEVEL UP!';

    shuffled.forEach((upg, idx) => {
        const card = document.createElement('div');
        card.className = 'upgrade-card' + (idx === 0 ? ' selected' : '');
        card.innerHTML = `
            <div class="upgrade-icon">${upg.icon}</div>
            <div class="upgrade-name">${upg.name}</div>
            <div class="upgrade-desc">${upg.desc}</div>
            <div class="upgrade-progress-container">
                <div class="upgrade-progress-bar"></div>
            </div>
        `;
        card.addEventListener('click', () => {
            selectedUpgrade = idx;
            updateUpgradeSelection();
            confirmUpgrade();
        });
        container.appendChild(card);
    });
}
