// ===================== ELEMENTAL SYSTEM =====================
class ElementalSystem {
    constructor(scene) {
        this.scene = scene;
    }

    getElementColor(element) {
        const colors = {
            earth: '#8B7355', water: '#5B9BD5', fire: '#FF6B3C',
            wind: '#52C77D', light: '#FFD700', dark: '#4B0082'
        };
        return colors[element] || '#2a2a2a';
    }

    getElementGlowColor(element) {
        const glows = {
            earth: '#A0826D', water: '#7AC5F5', fire: '#FF8C3C',
            wind: '#72E79D', light: '#FFFFCC', dark: '#8B008B'
        };
        return glows[element] || '#ffcc00';
    }

    getElementRGB(element) {
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

    getElementTint(element) {
        const rgb = this.getElementRGB(element);
        return Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b);
    }

    createElementalExplosion(element, cx, cy) {
        const juiceSystem = this.scene.juiceSystem;
        if (!juiceSystem) return;

        switch (element) {
            case 'earth':
                juiceSystem.spawnParticles(cx, cy, 0x8B7355, 8, 6);
                juiceSystem.spawnParticles(cx, cy, 0x6B5B45, 4, 4);
                break;
            case 'water':
                juiceSystem.spawnParticles(cx, cy, 0x5B9BD5, 12, 5);
                juiceSystem.spawnParticles(cx, cy, 0x7AC5F5, 8, 3);
                break;
            case 'fire':
                juiceSystem.spawnParticles(cx, cy, 0xFF6B3C, 10, 7);
                juiceSystem.spawnParticles(cx, cy, 0xFFB03C, 6, 5);
                juiceSystem.spawnParticles(cx, cy, 0xFF3C3C, 4, 4);
                break;
            case 'wind':
                juiceSystem.spawnParticles(cx, cy, 0x52C77D, 15, 4);
                juiceSystem.spawnParticles(cx, cy, 0x72E79D, 10, 3);
                break;
            case 'light':
                juiceSystem.spawnParticles(cx, cy, 0xFFD700, 12, 6);
                juiceSystem.spawnParticles(cx, cy, 0xFFFFCC, 8, 5);
                juiceSystem.spawnParticles(cx, cy, 0xFFFFFF, 6, 4);
                break;
            case 'dark':
                juiceSystem.spawnParticles(cx, cy, 0x4B0082, 10, 5);
                juiceSystem.spawnParticles(cx, cy, 0x8B008B, 8, 4);
                juiceSystem.spawnParticles(cx, cy, 0x2A0040, 6, 3);
                break;
            default:
                juiceSystem.spawnParticles(cx, cy, 0xff8800, 4, 4);
                juiceSystem.spawnParticles(cx, cy, 0xffcc44, 2, 3);
        }
    }
}
