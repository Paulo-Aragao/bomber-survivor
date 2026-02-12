// ===================== AUDIO SYSTEM =====================
// Procedural sound effects using Web Audio API

// Audio context (lazy init)
let audioContext = null;
let masterVolume = 0.3; // Global volume

// Initialize audio context on first user interaction
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === ELEMENTAL BOMB PLACE SOUNDS ===
function playBombPlaceSound(element) {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Different frequencies per element
    const frequencies = {
        earth: 80,   // Low, rumbling
        water: 200,  // Mid, bubbly
        fire: 300,   // High, crackling
        wind: 400    // Highest, airy
    };

    const freq = frequencies[element] || 150;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.1);

    gain.gain.setValueAtTime(masterVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
}

// === ELEMENTAL EXPLOSION SOUNDS ===
function playExplosionSound(element) {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();

    // Different filter frequencies per element
    const filterFreqs = {
        earth: 150,  // Deep rumble
        water: 400,  // Splashy
        fire: 800,   // Crackling
        wind: 1200   // Whooshing
    };

    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(filterFreqs[element] || 400, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(50, now + 0.25);

    noiseGain.gain.setValueAtTime(masterVolume * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    // Bass thump
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bass.type = 'sine';
    bass.frequency.setValueAtTime(60, now);
    bass.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    bassGain.gain.setValueAtTime(masterVolume * 0.5, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Connect
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    bass.connect(bassGain);
    bassGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);
    bass.start(now);
    bass.stop(now + 0.15);
}

// === UI SOUNDS ===
function playUIClick() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(masterVolume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
}

function playUIConfirm() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Two-tone confirmation
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(600, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(masterVolume * 0.2, now);
    gain.gain.setValueAtTime(masterVolume * 0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.05);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.15);
}

function playUINavigate() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);

    gain.gain.setValueAtTime(masterVolume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
}

// === PLAYER SOUNDS ===
function playHitSound() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harsh noise hit
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(masterVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.1);
}

function playXPCollectSound() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(masterVolume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
}

function playLevelUpSound() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Ascending arpeggio
    const frequencies = [523, 659, 784, 1047]; // C-E-G-C

    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const time = now + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(masterVolume * 0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.15);
    });
}

function playGameOverSound() {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Descending sad tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);

    gain.gain.setValueAtTime(masterVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
}
