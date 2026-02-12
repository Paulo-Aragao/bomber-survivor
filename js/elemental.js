// ===================== ELEMENTAL EFFECTS =====================
// Helper functions for elemental visuals and colors

// Get element's primary color
function getElementColor(element) {
    const colors = {
        earth: '#8B7355',
        water: '#5B9BD5',
        fire: '#FF6B3C',
        wind: '#52C77D',
        light: '#FFD700',
        dark: '#4B0082'
    };
    return colors[element] || '#2a2a2a';
}

// Get element's glow color
function getElementGlowColor(element) {
    const glows = {
        earth: '#A0826D',
        water: '#7AC5F5',
        fire: '#FF8C3C',
        wind: '#72E79D',
        light: '#FFFFCC',
        dark: '#8B008B'
    };
    return glows[element] || '#ffcc00';
}

// Get RGB values for element (for gradients)
function getElementRGB(element) {
    const rgb = {
        earth: { r: 160, g: 130, b: 109 },
        water: { r: 122, g: 197, b: 245 },
        fire: { r: 255, g: 140, b: 60 },
        wind: { r: 114, g: 231, b: 157 },
        light: { r: 255, g: 215, b: 0 },
        dark: { r: 75, g: 0, b: 130 }
    };
    return rgb[element] || { r: 255, g: 200, b: 0 };
}

// Elemental explosion effects
function createElementalExplosion(element, cx, cy) {
    switch (element) {
        case 'earth':
            // Spawn rock particles
            spawnParticles(cx, cy, '#8B7355', 8, 6);
            spawnParticles(cx, cy, '#6B5B45', 4, 4);
            break;
        case 'water':
            // Spawn water droplets
            spawnParticles(cx, cy, '#5B9BD5', 12, 5);
            spawnParticles(cx, cy, '#7AC5F5', 8, 3);
            break;
        case 'fire':
            // Spawn flames and sparks
            spawnParticles(cx, cy, '#FF6B3C', 10, 7);
            spawnParticles(cx, cy, '#FFB03C', 6, 5);
            spawnParticles(cx, cy, '#FF3C3C', 4, 4);
            break;
        case 'wind':
            // Spawn wind swirls
            spawnParticles(cx, cy, '#52C77D', 15, 4);
            spawnParticles(cx, cy, '#72E79D', 10, 3);
            break;
        case 'light':
            // Spawn light rays and sparkles
            spawnParticles(cx, cy, '#FFD700', 12, 6);
            spawnParticles(cx, cy, '#FFFFCC', 8, 5);
            spawnParticles(cx, cy, '#FFFFFF', 6, 4);
            break;
        case 'dark':
            // Spawn dark mist and shadows
            spawnParticles(cx, cy, '#4B0082', 10, 5);
            spawnParticles(cx, cy, '#8B008B', 8, 4);
            spawnParticles(cx, cy, '#2A0040', 6, 3);
            break;
        default:
            // Default explosion
            spawnParticles(cx, cy, '#ff8800', 4, 4);
            spawnParticles(cx, cy, '#ffcc44', 2, 3);
    }
}
