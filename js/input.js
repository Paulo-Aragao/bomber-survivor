// ===================== INPUT =====================
const keys = {};
let selectedUpgrade = 0;
let currentUpgradeChoices = [];
let selectedChar = 0;

window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();

    // Character select screen
    const startVisible = !document.getElementById('start-overlay').classList.contains('hidden');
    if (startVisible && !gameRunning) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            selectedChar = (selectedChar - 1 + CHARACTERS.length) % CHARACTERS.length;
            updateCharSelection();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            selectedChar = (selectedChar + 1) % CHARACTERS.length;
            updateCharSelection();
        }
        if (e.code === 'Space' || e.code === 'Enter') {
            startGame();
        }
        return;
    }

    // Game over screen
    const goVisible = document.getElementById('gameover-overlay').classList.contains('active');
    if (!gameRunning && goVisible) {
        if (e.code === 'Space' || e.code === 'Enter') {
            startGame();
        }
        return;
    }

    // Upgrade screen navigation
    if (gamePaused && currentUpgradeChoices.length > 0) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            selectedUpgrade = (selectedUpgrade - 1 + currentUpgradeChoices.length) % currentUpgradeChoices.length;
            updateUpgradeSelection();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            selectedUpgrade = (selectedUpgrade + 1) % currentUpgradeChoices.length;
            updateUpgradeSelection();
        }
        if (e.code === 'Space' || e.code === 'Enter') {
            confirmUpgrade();
        }
    }
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
});

function updateCharSelection() {
    const cards = document.querySelectorAll('.char-card');
    cards.forEach((card, i) => {
        card.classList.toggle('selected', i === selectedChar);
    });
}

function updateUpgradeSelection() {
    const cards = document.querySelectorAll('.upgrade-card');
    cards.forEach((card, i) => {
        card.classList.toggle('selected', i === selectedUpgrade);
    });
}

function confirmUpgrade() {
    if (currentUpgradeChoices.length === 0) return;
    const upg = currentUpgradeChoices[selectedUpgrade];
    upg.apply();
    currentUpgradeChoices = [];
    document.getElementById('levelup-overlay').classList.remove('active');
    gamePaused = false;

    // Juice: level up burst
    triggerLevelUpBurst();
}
