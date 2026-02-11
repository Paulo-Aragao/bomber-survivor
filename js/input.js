// ===================== INPUT =====================
const keys = {};
let selectedUpgrade = 0;
let currentUpgradeChoices = [];
let selectedChar = 0;
let selectedPauseOption = 0; // 0 = Resume, 1 = Return to char select

// Space hold detection
let spaceHoldStart = 0;
const SPACE_HOLD_DURATION = 30; // frames (~0.5 seconds at 60fps)

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
        // Only ENTER to confirm (Space hold handled in update loop)
        if (e.code === 'Enter') {
            startGame();
        }
        return;
    }

    // Game over screen
    const goVisible = document.getElementById('gameover-overlay').classList.contains('active');
    if (!gameRunning && goVisible) {
        // Only ENTER to confirm (Space hold handled in update loop)
        if (e.code === 'Enter') {
            startGame();
        }
        return;
    }

    // Pause menu
    const pauseVisible = document.getElementById('pause-overlay').classList.contains('active');
    if (pauseVisible) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            selectedPauseOption = 0;
            updatePauseSelection();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            selectedPauseOption = 1;
            updatePauseSelection();
        }
        // Only ENTER to confirm (Space hold handled in update loop)
        if (e.code === 'Enter') {
            confirmPauseOption();
        }
        return;
    }

    // ESC to pause during game
    if (e.code === 'Escape' && gameRunning && !gamePaused) {
        pauseGame();
        return;
    }

    // Upgrade screen navigation
    if (gamePaused && currentUpgradeChoices.length > 0) {
        const levelUpVisible = document.getElementById('levelup-overlay').classList.contains('active');
        if (!levelUpVisible) return;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            selectedUpgrade = (selectedUpgrade - 1 + currentUpgradeChoices.length) % currentUpgradeChoices.length;
            updateUpgradeSelection();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            selectedUpgrade = (selectedUpgrade + 1) % currentUpgradeChoices.length;
            updateUpgradeSelection();
        }
        // Only ENTER to confirm (Space hold handled in update loop)
        if (e.code === 'Enter') {
            confirmUpgrade();
        }
    }
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
    // Reset hold timer when space is released
    if (e.code === 'Space') {
        spaceHoldStart = 0;
    }
});

// Handle Space hold confirmations (called from game loop)
function handleSpaceHold() {
    if (keys['Space']) {
        spaceHoldStart++;

        // Update progress bar for upgrade menu
        const levelUpVisible = document.getElementById('levelup-overlay').classList.contains('active');
        if (levelUpVisible && gamePaused && currentUpgradeChoices.length > 0) {
            updateUpgradeProgressBar();
        }

        if (spaceHoldStart >= SPACE_HOLD_DURATION) {
            // Check which menu is active
            const startVisible = !document.getElementById('start-overlay').classList.contains('hidden');
            const goVisible = document.getElementById('gameover-overlay').classList.contains('active');
            const pauseVisible = document.getElementById('pause-overlay').classList.contains('active');

            if (startVisible && !gameRunning) {
                startGame();
                spaceHoldStart = 0;
            } else if (!gameRunning && goVisible) {
                startGame();
                spaceHoldStart = 0;
            } else if (pauseVisible) {
                confirmPauseOption();
                spaceHoldStart = 0;
            } else if (gamePaused && currentUpgradeChoices.length > 0 && levelUpVisible) {
                confirmUpgrade();
                spaceHoldStart = 0;
            }
        }
    } else {
        spaceHoldStart = 0;
        // Reset progress bar when Space is released
        resetUpgradeProgressBar();
    }
}

function updateUpgradeProgressBar() {
    const cards = document.querySelectorAll('.upgrade-card');
    const selectedCard = cards[selectedUpgrade];
    if (selectedCard) {
        const progressBar = selectedCard.querySelector('.upgrade-progress-bar');
        if (progressBar) {
            const percentage = Math.min(100, (spaceHoldStart / SPACE_HOLD_DURATION) * 100);
            progressBar.style.width = `${percentage}%`;
        }
    }
}

function resetUpgradeProgressBar() {
    const progressBars = document.querySelectorAll('.upgrade-progress-bar');
    progressBars.forEach(bar => {
        bar.style.width = '0%';
    });
}

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

function updatePauseSelection() {
    const options = document.querySelectorAll('.pause-option');
    options.forEach((option, i) => {
        option.classList.toggle('selected', i === selectedPauseOption);
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

function confirmPauseOption() {
    if (selectedPauseOption === 0) {
        // Resume game
        resumeGame();
    } else {
        // Return to character select
        returnToCharSelect();
    }
}
