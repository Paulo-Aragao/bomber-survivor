// ===================== RENDER =====================
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Camera
    let camX = player.x - canvas.width / 2;
    let camY = player.y - canvas.height / 2;

    // Screen shake
    if (screenShake > 0.5) {
        camX += (Math.random() - 0.5) * screenShake * 2;
        camY += (Math.random() - 0.5) * screenShake * 2;
    }

    ctx.save();
    ctx.translate(-camX, -camY);

    // -- Ground (offscreen culled) --
    const startTileX = Math.max(0, Math.floor(camX / TILE));
    const startTileY = Math.max(0, Math.floor(camY / TILE));
    const endTileX = Math.min(MAP_W, Math.ceil((camX + canvas.width) / TILE) + 1);
    const endTileY = Math.min(MAP_H, Math.ceil((camY + canvas.height) / TILE) + 1);

    for (let ty = startTileY; ty < endTileY; ty++) {
        for (let tx = startTileX; tx < endTileX; tx++) {
            const x = tx * TILE;
            const y = ty * TILE;
            const isDark = (tx + ty) % 2 === 0;
            ctx.fillStyle = isDark ? '#151520' : '#1a1a28';
            ctx.fillRect(x, y, TILE, TILE);
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.strokeRect(x, y, TILE, TILE);
            if ((tx * 7 + ty * 13) % 37 === 0) {
                ctx.fillStyle = 'rgba(255,255,255,0.02)';
                ctx.fillRect(x + TILE * 0.3, y + TILE * 0.3, TILE * 0.15, TILE * 0.15);
            }
        }
    }

    // Map border
    ctx.strokeStyle = '#ff440044';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, WORLD_W, WORLD_H);
    ctx.lineWidth = 1;

    // -- Bomb explosion preview --
    for (const b of bombs) {
        const urgency = 1 - (b.timer / b.maxTimer);
        const baseAlpha = 0.03 + urgency * 0.35;
        const pulse = Math.sin(gameTime * (0.06 + urgency * 0.3)) * 0.5 + 0.5;
        const alpha = baseAlpha + pulse * urgency * 0.15;

        const previewTiles = getExplosionTiles(b.gx, b.gy, b.range, b.shape);
        for (const t of previewTiles) {
            if (t.gx === b.gx && t.gy === b.gy) continue;
            const tx = t.gx * TILE;
            const ty = t.gy * TILE;
            const dist = Math.abs(t.gx - b.gx) + Math.abs(t.gy - b.gy);
            const distFade = 1 - (dist - 1) * 0.08;
            const tileAlpha = alpha * Math.max(0.3, distFade);
            const red = 255;
            const green = Math.floor(180 - urgency * 130);
            const blue = Math.floor(50 - urgency * 50);
            ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${tileAlpha})`;
            ctx.fillRect(tx + 3, ty + 3, TILE - 6, TILE - 6);
            if (urgency > 0.3) {
                ctx.strokeStyle = `rgba(${red}, ${Math.floor(green * 0.7)}, 0, ${tileAlpha * 1.5})`;
                ctx.lineWidth = urgency > 0.7 ? 2 : 1;
                ctx.strokeRect(tx + 3, ty + 3, TILE - 6, TILE - 6);
                ctx.lineWidth = 1;
            }
        }

        // Gravity pull visual
        if (b.gravity && b.timer < b.maxTimer * 0.4) {
            const bx = b.gx * TILE + TILE / 2;
            const by = b.gy * TILE + TILE / 2;
            const pullAlpha = 0.1 + Math.sin(gameTime * 0.2) * 0.05;
            ctx.strokeStyle = `rgba(180, 100, 255, ${pullAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bx, by, TILE * (b.range + 1), 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    }

    // -- Gems --
    for (const g of gems) {
        // Offscreen cull
        if (g.x < camX - TILE || g.x > camX + canvas.width + TILE || g.y < camY - TILE || g.y > camY + canvas.height + TILE) continue;

        const alpha = g.lifetime < 60 ? g.lifetime / 60 : 1;
        const bob = Math.sin(gameTime * 0.1 + g.x) * 3;
        ctx.globalAlpha = alpha;

        if (g.mega) {
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = '#44ccff';
            ctx.shadowColor = '#44ccff';
            ctx.shadowBlur = 10;
        }

        const gx = g.x;
        const gy = g.y + bob;
        const gs = g.size;
        ctx.beginPath();
        ctx.moveTo(gx, gy - gs);
        ctx.lineTo(gx + gs, gy);
        ctx.lineTo(gx, gy + gs);
        ctx.lineTo(gx - gs, gy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    // -- Chest drops --
    for (const c of chestDrops) {
        if (c.x < camX - TILE || c.x > camX + canvas.width + TILE || c.y < camY - TILE || c.y > camY + canvas.height + TILE) continue;

        const bob = Math.sin(c.bob) * 4;
        const glow = 0.5 + Math.sin(gameTime * 0.08) * 0.3;
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(255, 200, 0, ${glow})`;
        ctx.fillRect(c.x - 12, c.y - 10 + bob, 24, 20);
        ctx.fillStyle = '#aa6600';
        ctx.fillRect(c.x - 12, c.y - 10 + bob, 24, 4);
        ctx.fillStyle = '#ffee88';
        ctx.fillRect(c.x - 3, c.y - 4 + bob, 6, 6);
        ctx.shadowBlur = 0;
    }

    // -- Explosions (Elemental Enhanced) --
    for (const e of explosions) {
        // Offscreen cull
        const ex = e.gx * TILE;
        const ey = e.gy * TILE;
        if (ex < camX - TILE * 2 || ex > camX + canvas.width + TILE * 2 || ey < camY - TILE * 2 || ey > camY + canvas.height + TILE * 2) continue;

        const progress = 1 - e.timer / 30;
        const alpha = e.timer / 30;

        // Get elemental colors
        const rgb = e.element ? getElementRGB(e.element) : { r: 255, g: 180, b: 50 };
        const glowColor = e.element ? getElementGlowColor(e.element) : '#ffaa00';

        // Radial gradient explosion (elemental colors)
        const cx = ex + TILE / 2;
        const cy = ey + TILE / 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, TILE * 0.7);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        grad.addColorStop(0.3, `rgba(${rgb.r}, ${Math.floor(rgb.g * 1.2)}, ${rgb.b}, ${alpha * 0.7})`);
        grad.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${Math.floor(rgb.r * 0.8)}, ${Math.floor(rgb.g * 0.8)}, ${Math.floor(rgb.b * 0.8)}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(ex - TILE * 0.2, ey - TILE * 0.2, TILE * 1.4, TILE * 1.4);

        // Shockwave ring (elemental color)
        if (e.timer > 20 && e.isCenter) {
            const ring = 1 + progress * 2;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha * 0.5})`;
            ctx.lineWidth = 3 - progress * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, TILE * ring * 0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;
        }

        // Spawn elemental particles on first frame
        if (e.timer === 29 && e.element) {
            createElementalExplosion(e.element, cx, cy);
        }
    }

    // -- Bombs (Elemental) --
    for (const b of bombs) {
        const x = b.gx * TILE + TILE / 2;
        const y = b.gy * TILE + TILE / 2;
        const pulse = 1 + Math.sin(b.pulseAnim) * 0.1;
        const isUrgent = (b.timer / b.maxTimer) < 0.25;
        const urgencyScale = isUrgent ? 1 + Math.sin(b.pulseAnim * 3) * 0.15 : 0;

        // Get elemental colors
        const bombColor = b.element ? getElementColor(b.element) : '#2a2a2a';
        const glowColor = b.element ? getElementGlowColor(b.element) : '#ffcc00';

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y + TILE * 0.3, TILE * 0.25, TILE * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body (elemental colored)
        const bombSize = TILE * 0.35 * pulse;
        if (isUrgent) {
            ctx.fillStyle = glowColor;
        } else {
            ctx.fillStyle = bombColor;
        }
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, bombSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(x - bombSize * 0.25, y - bombSize * 0.25, bombSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Fuse spark (elemental)
        const sparkX = x + Math.cos(b.pulseAnim * 2) * 3;
        const sparkY = y - bombSize - 2 + Math.sin(b.pulseAnim * 3) * 2;
        ctx.fillStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 3 + (isUrgent ? 2 : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Timer ring (elemental color)
        const timerProgress = b.timer / b.maxTimer;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, bombSize + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * timerProgress);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    // -- Enemies (offscreen culled) --
    for (const en of enemies) {
        // Offscreen cull
        if (en.x < camX - TILE * 2 || en.x > camX + canvas.width + TILE * 2 || en.y < camY - TILE * 2 || en.y > camY + canvas.height + TILE * 2) continue;

        const type = ENEMY_TYPES[en.type];
        const s = TILE * en.size * 0.5;

        // Elite glow aura
        if (en.isElite) {
            const glowSize = s * 1.2 + Math.sin(en.eliteGlow || 0) * 3;
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = `rgba(255, 200, 0, ${0.4 + Math.sin(en.eliteGlow || 0) * 0.2})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(en.x, en.y, glowSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;

            // Crown above elite
            ctx.font = `${Math.floor(s * 0.6)}px serif`;
            ctx.textAlign = 'center';
            ctx.fillText('👑', en.x, en.y - s * 1.1);
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(en.x, en.y + s * 0.8, s * 0.6, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body - SPRITE OR PROCEDURAL FALLBACK
        const sprite = getEnemySprite(en.spriteId);
        const size = TILE * en.size;

        if (sprite && sprite.complete) {
            // SPRITE RENDERING
            ctx.shadowBlur = 0;

            // Apply effects
            if (en.flash > 0) {
                ctx.globalAlpha = 0.5;
                ctx.filter = 'brightness(2)';
            }
            if (en.frozen > 0) {
                ctx.filter = 'hue-rotate(180deg) brightness(1.3)';
            }

            // Draw sprite
            ctx.drawImage(
                sprite,
                en.x - size / 2,
                en.y - size / 2,
                size,
                size
            );

            // Reset effects
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
        } else {
            // PROCEDURAL FALLBACK
            ctx.fillStyle = en.flash > 0 ? '#ffffff' : type.color;
            ctx.shadowColor = type.color;
            ctx.shadowBlur = en.flash > 0 ? 15 : 5;

            if (en.type === 'slime') {
                const squish = 1 + Math.sin(gameTime * 0.08 + en.x) * 0.1;
                ctx.beginPath();
                ctx.ellipse(en.x, en.y + s * 0.1, s * squish, s / squish, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.fillRect(en.x - s * 0.3, en.y - s * 0.15, s * 0.2, s * 0.2);
                ctx.fillRect(en.x + s * 0.1, en.y - s * 0.15, s * 0.2, s * 0.2);
                ctx.fillStyle = '#111';
                ctx.fillRect(en.x - s * 0.25, en.y - s * 0.1, s * 0.1, s * 0.15);
                ctx.fillRect(en.x + s * 0.15, en.y - s * 0.1, s * 0.1, s * 0.15);
            } else if (en.type === 'bat') {
                const flap = Math.sin(gameTime * 0.2 + en.x) * 0.3;
                ctx.beginPath(); ctx.moveTo(en.x, en.y);
                ctx.lineTo(en.x - s * 1.2, en.y - s * 0.5 + flap * s);
                ctx.lineTo(en.x - s * 0.5, en.y + s * 0.2); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(en.x, en.y);
                ctx.lineTo(en.x + s * 1.2, en.y - s * 0.5 - flap * s);
                ctx.lineTo(en.x + s * 0.5, en.y + s * 0.2); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.arc(en.x, en.y, s * 0.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ff0';
                ctx.fillRect(en.x - s * 0.2, en.y - s * 0.15, 3, 3);
                ctx.fillRect(en.x + s * 0.05, en.y - s * 0.15, 3, 3);
            } else if (en.type === 'skeleton') {
                ctx.beginPath(); ctx.arc(en.x, en.y - s * 0.2, s * 0.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillRect(en.x - s * 0.15, en.y + s * 0.1, s * 0.3, s * 0.5);
                ctx.fillStyle = '#111';
                ctx.fillRect(en.x - s * 0.2, en.y - s * 0.3, s * 0.15, s * 0.15);
                ctx.fillRect(en.x + s * 0.05, en.y - s * 0.3, s * 0.15, s * 0.15);
            } else if (en.type === 'ghost') {
                ctx.globalAlpha = 0.7;
                const wave = Math.sin(gameTime * 0.05 + en.x) * 3;
                ctx.beginPath();
                ctx.arc(en.x, en.y + wave - s * 0.2, s * 0.5, Math.PI, 0);
                ctx.lineTo(en.x + s * 0.5, en.y + s * 0.4 + wave);
                ctx.lineTo(en.x + s * 0.25, en.y + s * 0.2 + wave);
                ctx.lineTo(en.x, en.y + s * 0.4 + wave);
                ctx.lineTo(en.x - s * 0.25, en.y + s * 0.2 + wave);
                ctx.lineTo(en.x - s * 0.5, en.y + s * 0.4 + wave);
                ctx.closePath(); ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(en.x - s * 0.15, en.y - s * 0.2 + wave, s * 0.1, 0, Math.PI * 2);
                ctx.arc(en.x + s * 0.15, en.y - s * 0.2 + wave, s * 0.1, 0, Math.PI * 2);
                ctx.fill();
            } else if (en.type === 'demon') {
                ctx.beginPath(); ctx.arc(en.x, en.y, s * 0.55, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.moveTo(en.x - s * 0.3, en.y - s * 0.4);
                ctx.lineTo(en.x - s * 0.5, en.y - s * 0.9); ctx.lineTo(en.x - s * 0.1, en.y - s * 0.5);
                ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(en.x + s * 0.3, en.y - s * 0.4);
                ctx.lineTo(en.x + s * 0.5, en.y - s * 0.9); ctx.lineTo(en.x + s * 0.1, en.y - s * 0.5);
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ff0';
                ctx.fillRect(en.x - s * 0.25, en.y - s * 0.15, s * 0.15, s * 0.1);
                ctx.fillRect(en.x + s * 0.1, en.y - s * 0.15, s * 0.15, s * 0.1);
            }
        }

        ctx.shadowBlur = 0;

        // HP bar for multi-hp enemies
        if (en.maxHp > 1) {
            const barW = TILE * en.size * 0.6;
            const barH = en.isElite ? 5 : 3;
            const bx = en.x - barW / 2;
            const by = en.y - TILE * en.size * 0.5 - 6;
            ctx.fillStyle = '#300';
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = en.isElite ? '#ffcc00' : '#f44';
            ctx.fillRect(bx, by, barW * Math.max(0, en.hp / en.maxHp), barH);
        }

        // Frozen indicator
        if (en.frozen && en.frozen > 0) {
            ctx.strokeStyle = '#88ddff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(en.x, en.y, s * 0.7, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
            ctx.beginPath(); ctx.arc(en.x, en.y, s * 0.7, 0, Math.PI * 2); ctx.fill();
        }

        // Burning indicator
        if (en.burning && en.burning > 0) {
            const flickerR = 255;
            const flickerG = 80 + Math.random() * 120;
            ctx.fillStyle = `rgba(${flickerR}, ${flickerG}, 0, ${0.2 + Math.random() * 0.15})`;
            ctx.beginPath(); ctx.arc(en.x, en.y, s * 0.8, 0, Math.PI * 2); ctx.fill();
        }
    }

    // -- Player (LPC Sprite) --
    {
        const px = player.x;
        const py = player.y;

        // Invincibility blink effect
        if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) {
            // Skip rendering (blink)
        } else {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(px, py + TILE * 0.4, TILE * 0.3, TILE * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw sprite
            const spriteScale = TILE / 48; // Scale sprite to fit game (64px -> ~42px)
            drawSprite(ctx, player.spriteSheet, player.spriteRow, player.spriteFrame, px, py, spriteScale);
        }
    }

    // -- Particles --
    for (const p of particles) {
        if (p.x < camX - 20 || p.x > camX + canvas.width + 20 || p.y < camY - 20 || p.y > camY + canvas.height + 20) continue;
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        const sz = p.size * (alpha > 0.5 ? 1 : alpha * 2);
        ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;

    // -- Damage Numbers --
    for (const d of damageNumbers) {
        if (d.x < camX - 100 || d.x > camX + canvas.width + 100) continue;
        const alpha = d.life / 45;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = d.color;
        const fontSize = Math.floor(14 * (d.scale || 1));
        ctx.font = `bold ${fontSize}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // -- Damage flash overlay --
    if (damageFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash / 30})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // -- Update HUD --
    updateHUD();
}
