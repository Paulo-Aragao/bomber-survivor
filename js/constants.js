// ===================== CONSTANTS =====================
// These are now loaded from data/balance.json via ConfigLoader.
// The variables below serve as defaults before CONFIG is loaded,
// and are overwritten by ConfigLoader._rebuildConstants().
var TILE = 48;
var MAP_W = 60;
var MAP_H = 60;
var WORLD_W = MAP_W * TILE;
var WORLD_H = MAP_H * TILE;
var MAX_PARTICLES = 200;
var MAX_ENEMIES_BASE = 120;
var ENEMY_CAP_PER_MIN = 15;
var GEM_CAP = 80;
var KILL_STREAK_WINDOW = 90;
var SPACE_HOLD_DURATION = 30;
var ELITE_SPAWN_INTERVAL = 5400;
