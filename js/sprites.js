// ===================== SPRITE SYSTEM =====================
// Universal LPC Spritesheet loader and renderer

const spriteSheets = {
    aussa: null,
    eria: null,
    hiita: null,
    wynn: null,
    lyna: null,
    dharc: null
};

const portraits = {
    aussa: null,
    eria: null,
    hiita: null,
    wynn: null,
    lyna: null,
    dharc: null
};

// Enemy sprites (48 total)
const enemySprites = {};

let spritesLoaded = false;
let spritesLoadedCount = 0;
let portraitsLoadedCount = 0;
let enemySpritesLoadedCount = 0;

// Load sprite sheets
function loadSprites() {
    const sheets = [
        { name: 'aussa', path: 'Aussa/sprite_universal.png' },
        { name: 'eria', path: 'Eria/sprite_universal.png' },
        { name: 'hiita', path: 'Hiita/sprite_universal.png' },
        { name: 'wynn', path: 'Wynn/sprite_universal.png' },
        { name: 'lyna', path: 'Lyna/sprite_universal.png' },
        { name: 'dharc', path: 'Dharc/sprite_universal.png' }
    ];

    sheets.forEach(sheet => {
        const img = new Image();
        img.onload = () => {
            spritesLoadedCount++;
            if (spritesLoadedCount === sheets.length) {
                spritesLoaded = true;
                console.log('✓ All sprite sheets loaded (Charmers)');
            }
        };
        img.onerror = () => {
            console.error(`✗ Failed to load sprite: img/${sheet.path}`);
        };
        img.src = `img/${sheet.path}`;
        spriteSheets[sheet.name] = img;
    });
}

// Load portrait images
function loadPortraits() {
    const portraitPaths = [
        { name: 'aussa', path: 'Aussa/portrait.png' },
        { name: 'eria', path: 'Eria/portrait.png' },
        { name: 'hiita', path: 'Hiita/portrait.png' },
        { name: 'wynn', path: 'Wynn/portrait.png' },
        { name: 'lyna', path: 'Lyna/portrait.png' },
        { name: 'dharc', path: 'Dharc/portrait.png' }
    ];

    portraitPaths.forEach(p => {
        const img = new Image();
        img.onload = () => {
            portraitsLoadedCount++;
            if (portraitsLoadedCount === portraitPaths.length) {
                console.log('✓ All portraits loaded');
            }
        };
        img.onerror = () => {
            console.error(`✗ Failed to load portrait: img/${p.path}`);
        };
        img.src = `img/${p.path}`;
        portraits[p.name] = img;
    });
}

// Load enemy sprites (48 total)
function loadEnemySprites() {
    for (let i = 1; i <= 48; i++) {
        const img = new Image();
        img.onload = () => {
            enemySpritesLoadedCount++;
            if (enemySpritesLoadedCount === 48) {
                console.log('✓ All 48 enemy sprites loaded');
            }
        };
        img.onerror = () => {
            console.error(`✗ Failed to load enemy sprite: img/Enemys/Icon${i}.png`);
        };
        img.src = `img/Enemys/Icon${i}.png`;
        enemySprites[i] = img;
    }
}

// Get portrait image by character ID
function getPortrait(charId) {
    return portraits[charId];
}

// Get sprite image by name
function getSpriteImage(name) {
    return spriteSheets[name];
}

// Get enemy sprite by ID (1-48)
function getEnemySprite(id) {
    return enemySprites[id] || null;
}

// LPC sprite sheet structure:
// - Frame size: 64x64 pixels
// - Walking animations are on rows 8-11:
//   Row 8: Walk UP (North)
//   Row 9: Walk LEFT (West)
//   Row 10: Walk DOWN (South)
//   Row 11: Walk RIGHT (East)
// - Each walk cycle has 9 frames

const LPC_FRAME_WIDTH = 64;
const LPC_FRAME_HEIGHT = 64;

// Direction to sprite row mapping
const SPRITE_DIRECTIONS = {
    UP: 8,
    LEFT: 9,
    DOWN: 10,
    RIGHT: 11
};

// Draw a specific frame from the sprite sheet
function drawSprite(ctx, spriteSheet, row, frame, x, y, scale = 1) {
    const img = getSpriteImage(spriteSheet);

    if (!img || !img.complete) {
        // Fallback: draw a colored circle if sprite not loaded
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    const sx = frame * LPC_FRAME_WIDTH;
    const sy = row * LPC_FRAME_HEIGHT;

    const drawW = LPC_FRAME_WIDTH * scale;
    const drawH = LPC_FRAME_HEIGHT * scale;

    // Draw sprite centered at position
    ctx.drawImage(
        img,
        sx, sy, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT,
        x - drawW / 2, y - drawH / 2, drawW, drawH
    );
}

// Initialize sprite and portrait loading
loadSprites();
loadPortraits();
loadEnemySprites();
