// ===================== CONFIG LOADER =====================
// Loads all JSON config files and exposes them as window.CONFIG
// Also provides applyModifiers() for declarative character/upgrade effects

window.CONFIG = null;

const ConfigLoader = {
    async load() {
        const [balance, characters, enemies, upgrades] = await Promise.all([
            fetch('data/balance.json').then(r => r.json()),
            fetch('data/characters.json').then(r => r.json()),
            fetch('data/enemies.json').then(r => r.json()),
            fetch('data/upgrades.json').then(r => r.json()),
        ]);

        window.CONFIG = { balance, characters, enemies, upgrades };

        // Rebuild global constants from config
        this._rebuildConstants(balance);
        // Rebuild CHARACTERS array with generated apply() functions
        this._rebuildCharacters(characters);
        // Rebuild ENEMY_TYPES from config
        this._rebuildEnemies(enemies);
        // Rebuild UPGRADES array with generated apply() functions
        this._rebuildUpgrades(upgrades);

        return window.CONFIG;
    },

    // Apply declarative modifiers to a target object (player stats)
    applyModifiers(target, modifiers) {
        for (const [key, value] of Object.entries(modifiers)) {
            if (key === 'healToMax') continue; // handled after all other modifiers

            if (typeof value === 'string') {
                if (value.startsWith('+')) {
                    target[key] = (target[key] || 0) + parseFloat(value.substring(1));
                } else if (value.startsWith('*')) {
                    target[key] = Math.floor((target[key] || 0) * parseFloat(value.substring(1)));
                } else {
                    // Direct string set (e.g. bombShape = 'circle')
                    target[key] = value;
                }
            } else if (typeof value === 'boolean') {
                target[key] = value;
            } else if (typeof value === 'number') {
                // Direct number set (e.g. vampirism = 0.3, flashBlind = 60)
                target[key] = value;
            } else if (typeof value === 'object' && value !== null) {
                // Object with add/multiply/min/max
                if ('add' in value) {
                    target[key] = (target[key] || 0) + value.add;
                }
                if ('multiply' in value) {
                    target[key] = Math.floor((target[key] || 0) * value.multiply);
                }
                if ('min' in value) {
                    target[key] = Math.max(value.min, target[key]);
                }
                if ('max' in value) {
                    target[key] = Math.min(value.max, target[key]);
                }
            }
        }

        // Handle healToMax after all other modifiers
        if (modifiers.healToMax) {
            target.hp = target.maxHp;
        }
    },

    _rebuildConstants(balance) {
        // These globals are used throughout the codebase
        window.TILE = balance.map.tile;
        window.MAP_W = balance.map.width;
        window.MAP_H = balance.map.height;
        window.WORLD_W = balance.map.width * balance.map.tile;
        window.WORLD_H = balance.map.height * balance.map.tile;
        window.MAX_PARTICLES = balance.caps.particles;
        window.MAX_ENEMIES_BASE = balance.caps.enemiesBase;
        window.ENEMY_CAP_PER_MIN = balance.caps.enemyCapPerMin;
        window.GEM_CAP = balance.caps.gems;
        window.KILL_STREAK_WINDOW = balance.juice.killStreakWindow;
        window.SPACE_HOLD_DURATION = balance.input.spaceHoldDuration;
        window.ELITE_SPAWN_INTERVAL = balance.elite.spawnInterval;
    },

    _rebuildCharacters(characters) {
        const self = this;
        window.CHARACTERS = characters.map(charDef => {
            const char = Object.assign({}, charDef);
            // Generate apply() function from declarative modifiers
            char.apply = function(p) {
                self.applyModifiers(p, charDef.modifiers);
            };
            return char;
        });
    },

    _rebuildEnemies(enemies) {
        window.ENEMY_TYPES = Object.assign({}, enemies.types);
    },

    _rebuildUpgrades(upgrades) {
        const self = this;
        window.UPGRADES = upgrades.map(upgDef => {
            const upg = {
                icon: upgDef.icon,
                name: upgDef.name,
                desc: upgDef.desc,
                category: upgDef.category,
            };
            // Generate apply() function from declarative effects
            upg.apply = function(p) {
                self.applyModifiers(p, upgDef.effects);
            };
            return upg;
        });
    }
};
