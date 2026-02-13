// ===================== ENEMY TYPES =====================
// Enemy data is now loaded from data/enemies.json via ConfigLoader.
// ENEMY_TYPES object is populated by ConfigLoader._rebuildEnemies().
//
// This file provides a fallback if CONFIG hasn't loaded yet.
if (typeof ENEMY_TYPES === 'undefined') {
    var ENEMY_TYPES = {};
}
