// ===================== UPGRADES =====================
// Upgrade data is now loaded from data/upgrades.json via ConfigLoader.
// UPGRADES array is populated by ConfigLoader._rebuildUpgrades()
// with auto-generated apply() functions from declarative effects.
//
// This file provides a fallback if CONFIG hasn't loaded yet.
if (typeof UPGRADES === 'undefined') {
    var UPGRADES = [];
}
