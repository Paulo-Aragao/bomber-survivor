// ===================== SPRITE SYSTEM =====================
// Universal LPC Spritesheet loader and renderer

const spriteSheets = {
    one: null,
    two: null,
    three: null
};

let spritesLoaded = false;
let spritesLoadedCount = 0;

// Load sprite sheets
function loadSprites() {
    const sheets = ['one', 'two', 'three'];

    sheets.forEach(name => {
        const img = new Image();
        img.onload = () => {
            spritesLoadedCount++;
            if (spritesLoadedCount === sheets.length) {
                spritesLoaded = true;
                console.log('✓ All sprite sheets loaded');
            }
        };
        img.onerror = () => {
            console.error(`✗ Failed to load sprite: ${name}_universal.png`);
        };
        img.src = `img/${name}_universal.png`;
        spriteSheets[name] = img;
    });
}

// Get sprite image by name
function getSpriteImage(name) {
    return spriteSheets[name];
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

// Initialize sprite loading
loadSprites();
