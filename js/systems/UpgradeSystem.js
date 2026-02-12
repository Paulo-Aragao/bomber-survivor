// ===================== UPGRADE SYSTEM =====================
class UpgradeSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentChoices = [];
        this.selectedUpgrade = 0;
        this.spaceHoldStart = 0;
        this.isChest = false;
    }

    showLevelUp(isChest) {
        this.isChest = isChest || false;
        this.selectedUpgrade = 0;
        const p = this.scene.playerSystem.stats;

        const overlay = document.getElementById('levelup-overlay');
        overlay.classList.add('active');
        const container = document.getElementById('upgrade-options');
        container.innerHTML = '';

        const hint = document.getElementById('upgrade-hint');
        if (hint) hint.textContent = isChest ? '🎁 BAÚDE ELITE! ← → ENTER' : '← → SELECIONAR   SPACE/ENTER CONFIRMAR';

        const choiceCount = isChest ? 2 : (3 + (p.extraChoice || 0));
        if (!isChest && p.extraChoice > 0) p.extraChoice--;

        const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5).slice(0, Math.min(choiceCount, UPGRADES.length));
        this.currentChoices = shuffled;

        document.getElementById('levelup-title').textContent = isChest ? '🎁 ELITE CHEST!' : '⬆️ LEVEL UP!';

        shuffled.forEach((upg, idx) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card' + (idx === 0 ? ' selected' : '');
            card.innerHTML = `
                <div class="upgrade-icon">${upg.icon}</div>
                <div class="upgrade-name">${upg.name}</div>
                <div class="upgrade-desc">${upg.desc}</div>
                <div class="upgrade-progress-container">
                    <div class="upgrade-progress-bar"></div>
                </div>
            `;
            card.addEventListener('click', () => {
                this.selectedUpgrade = idx;
                this.updateSelection();
                this.confirmUpgrade();
            });
            container.appendChild(card);
        });
    }

    updateSelection() {
        const cards = document.querySelectorAll('.upgrade-card');
        cards.forEach((card, i) => {
            card.classList.toggle('selected', i === this.selectedUpgrade);
        });
    }

    navigateLeft() {
        if (this.currentChoices.length === 0) return;
        this.selectedUpgrade = (this.selectedUpgrade - 1 + this.currentChoices.length) % this.currentChoices.length;
        this.updateSelection();
        if (this.scene.audioSystem) this.scene.audioSystem.playUINavigate();
    }

    navigateRight() {
        if (this.currentChoices.length === 0) return;
        this.selectedUpgrade = (this.selectedUpgrade + 1) % this.currentChoices.length;
        this.updateSelection();
        if (this.scene.audioSystem) this.scene.audioSystem.playUINavigate();
    }

    confirmUpgrade() {
        if (this.currentChoices.length === 0) return;
        const upg = this.currentChoices[this.selectedUpgrade];
        const p = this.scene.playerSystem.stats;
        upg.apply(p);
        this.currentChoices = [];
        document.getElementById('levelup-overlay').classList.remove('active');

        if (this.scene.audioSystem) this.scene.audioSystem.playUIConfirm();

        // Juice
        const juice = this.scene.juiceSystem;
        if (juice) juice.triggerLevelUpBurst(p.x, p.y);

        // Resume game
        this.scene.registry.events.emit('resumeFromLevelUp');
    }

    updateProgressBar() {
        const cards = document.querySelectorAll('.upgrade-card');
        const selectedCard = cards[this.selectedUpgrade];
        if (selectedCard) {
            const progressBar = selectedCard.querySelector('.upgrade-progress-bar');
            if (progressBar) {
                const percentage = Math.min(100, (this.spaceHoldStart / SPACE_HOLD_DURATION) * 100);
                progressBar.style.width = `${percentage}%`;
            }
        }
    }

    resetProgressBar() {
        const progressBars = document.querySelectorAll('.upgrade-progress-bar');
        progressBars.forEach(bar => bar.style.width = '0%');
    }
}
