// ===================== CHARACTERS =====================
// Character data is now loaded from data/characters.json via ConfigLoader.
// CHARACTERS array is populated by ConfigLoader._rebuildCharacters()
// with auto-generated apply() functions from declarative modifiers.
//
// This file provides a fallback if CONFIG hasn't loaded yet.
if (typeof CHARACTERS === 'undefined') {
    var CHARACTERS = [];
}
