const MAX_LEVEL = 50;
const BASE_POINTS = 25;
const POINTS_PER_LEVEL = 5;
const XP_PER_LEVEL_BASE = 100;
const XP_GAIN_MULTIPLIER = 25;

const CATEGORIES = [
    { id: 'gameplay', name: 'Gameplay', baseWeight: 1.2, unlockedAt: 1 },
    { id: 'graphics', name: 'Gráficos', baseWeight: 1.1, unlockedAt: 1 },
    { id: 'story', name: 'História', baseWeight: 1.1, unlockedAt: 1 },
    { id: 'optimization', name: 'Otimização', baseWeight: 1.3, unlockedAt: 1 },
    { id: 'marketing', name: 'Marketing', baseWeight: 1.0, unlockedAt: 1 },
    { id: 'soundtrack', name: 'Trilha Sonora', baseWeight: 1.0, unlockedAt: 5 },
    { id: 'multiplayer', name: 'Multiplayer', baseWeight: 1.2, unlockedAt: 10 },
    { id: 'openworld', name: 'Mundo Aberto', baseWeight: 1.3, unlockedAt: 15 },
    { id: 'ai', name: 'Inteligência Artificial', baseWeight: 1.1, unlockedAt: 20 },
    { id: 'postlaunch', name: 'Suporte Pós-Lançamento', baseWeight: 1.0, unlockedAt: 25 }
];

const UPGRADE_TIERS = [
    { level: 1, name: 'Dev de Quarto', perks: ['Indie only', 'Sem hype forte', 'Penalidade leve em otimização'] },
    { level: 5, name: 'Freelancer', perks: ['Multiplayer liberado', 'Pequeno hype', 'Contratar Dev Júnior'] },
    { level: 10, name: 'Micro Estúdio', perks: ['RPG, FPS, Simulador', 'Contratar Designer', 'Eventos de mídia local'] },
    { level: 15, name: 'Estúdio Regional', perks: ['Contratar Roteirista', 'Pré-venda', 'Tendência impacta mais'] },
    { level: 20, name: 'Estúdio Profissional', perks: ['Engine própria', 'Motion Capture', 'Trailer Cinemático'] },
    { level: 25, name: 'Estúdio AAA pequeno', perks: ['Especialista em otimização', 'Servidor dedicado', 'Patch pós-lançamento'] },
    { level: 30, name: 'Grande Estúdio', perks: ['Viralizar', 'Eventos internacionais', 'Streamers grandes'] },
    { level: 35, name: 'Gigante do Mercado', perks: ['Hype multiplica vendas', 'Resistência a tendências negativas', 'Fãs defendem'] },
    { level: 40, name: 'Ícone da Indústria', perks: ['Bônus GOTY', 'Reputação quase fixa', 'Pré-venda massiva'] },
    { level: 45, name: 'Lenda Viva', perks: ['Mercado favorece', 'Sorte multiplicada', 'Críticas tolerantes'] },
    { level: 50, name: 'DEV GOD MODE', perks: ['+10% todos atributos', 'Penalidade bug zero', 'Reputação nunca < 70'] }
];

const HIRING_UPGRADES = [
    { id: 'intern', name: 'Estagiário', cost: 500, effect: 'pointsPerLevel', value: 2, description: '+2 pontos por nível' },
    { id: 'junior', name: 'Dev Júnior', cost: 2000, effect: 'salesMultiplier', value: 0.05, description: '+5% de vendas' },
    { id: 'designer', name: 'Designer', cost: 5000, effect: 'reputationPerGame', value: 1, description: '+1 reputação por jogo' },
    { id: 'writer', name: 'Roteirista', cost: 10000, effect: 'xpMultiplier', value: 0.1, description: '+10% de XP ganho' },
    { id: 'manager', name: 'Gerente', cost: 20000, effect: 'maxSpendBonus', value: 5, description: '+5 no limite por jogo' },
    { id: 'marketing_head', name: 'Chefe de Marketing', cost: 15000, effect: 'hypePerGame', value: 3, description: '+3 hype por jogo' },
    { id: 'streamer', name: 'Parceria com Streamer', cost: 12000, effect: 'salesMultiplier', value: 0.1, description: '+10% de vendas' }
];

const INFRA_UPGRADES = [
    { id: 'pc', name: 'PC Gamer', cost: 800, effect: 'pointsPerLevel', value: 1, description: '+1 ponto por nível' },
    { id: 'server', name: 'Servidor Dedicado', cost: 3000, effect: 'salesMultiplier', value: 0.03, description: '+3% de vendas' },
    { id: 'office', name: 'Escritório', cost: 8000, effect: 'reputationPerGame', value: 2, description: '+2 reputação por jogo' },
    { id: 'engine', name: 'Engine Própria', cost: 15000, effect: 'xpMultiplier', value: 0.15, description: '+15% de XP' },
    { id: 'datacenter', name: 'Data Center', cost: 30000, effect: 'maxSpendBonus', value: 10, description: '+10 no limite por jogo' },
    { id: 'mocap', name: 'Motion Capture', cost: 25000, effect: 'qualityBonus', value: 0.2, description: '+20% na nota (multiplicador)' }
];

let player = {
    level: 1,
    xp: 0,
    money: 500,
    reputation: 10,
    hype: 0,
    basePoints: BASE_POINTS,
    gamesLaunched: 0,
    totalEarned: 0,
    maxHype: 0,
    review: 'Nenhum jogo lançado ainda.'
};

let market = {};
let purchasedUpgrades = {};

function initPurchasedUpgrades() {
    const allIds = [...HIRING_UPGRADES, ...INFRA_UPGRADES].map(u => u.id);
    allIds.forEach(id => purchasedUpgrades[id] = false);
}
initPurchasedUpgrades();

function randomMarket() {
    const attrs = CATEGORIES.map(c => c.id);
    const genres = ['FPS', 'RPG', 'Simulador'];
    market = {
        favoredAttribute: attrs[Math.floor(Math.random() * attrs.length)],
        multiplier: 1.5,
        saturatedGenre: genres[Math.floor(Math.random() * genres.length)],
        penalty: 0.7
    };
}

function save() {
    localStorage.setItem('devZeroSave', JSON.stringify({ player, market, purchasedUpgrades }));
}

function load() {
    const data = localStorage.getItem('devZeroSave');
    if (data) {
        const parsed = JSON.parse(data);
        player = parsed.player;
        market = parsed.market;
        if (parsed.purchasedUpgrades) {
            purchasedUpgrades = parsed.purchasedUpgrades;
        } else {
            initPurchasedUpgrades();
        }
    } else {
        randomMarket();
        initPurchasedUpgrades();
    }
}

function getUnlockedCategories() {
    return CATEGORIES.filter(cat => cat.unlockedAt <= player.level);
}

function getBonus(effect) {
    let total = 0;
    for (let [id, purchased] of Object.entries(purchasedUpgrades)) {
        if (!purchased) continue;
        const upgrade = [...HIRING_UPGRADES, ...INFRA_UPGRADES].find(u => u.id === id);
        if (upgrade && upgrade.effect === effect) {
            total += upgrade.value;
        }
    }
    return total;
}

function getPointsPerLevelBonus() {
    return getBonus('pointsPerLevel');
}

function getSalesMultiplier() {
    return 1 + getBonus('salesMultiplier');
}

function getReputationPerGameBonus() {
    return getBonus('reputationPerGame');
}

function getXPMultiplier() {
    return 1 + getBonus('xpMultiplier');
}

function getMaxSpendBonus() {
    return getBonus('maxSpendBonus');
}

function getHypePerGameBonus() {
    return getBonus('hypePerGame');
}

function getQualityBonus() {
    return 1 + getBonus('qualityBonus');
}

function renderCategoryInputs() {
    const container = document.getElementById('categoriesContainer');
    const unlocked = getUnlockedCategories();
    container.innerHTML = '';

    unlocked.forEach(cat => {
        const row = document.createElement('div');
        row.className = 'category-row';
        row.innerHTML = `
            <label for="${cat.id}">${cat.name}</label>
            <input type="number" id="${cat.id}" min="0" value="0">
            <div class="btn-group">
                <button class="minus" data-cat="${cat.id}" data-delta="-1">−</button>
                <button class="plus" data-cat="${cat.id}" data-delta="1">+</button>
                <button class="quick minus" data-cat="${cat.id}" data-delta="-5">-5</button>
                <button class="quick minus" data-cat="${cat.id}" data-delta="-10">-10</button>
                <button class="quick plus" data-cat="${cat.id}" data-delta="5">+5</button>
                <button class="quick plus" data-cat="${cat.id}" data-delta="10">+10</button>
            </div>
        `;
        container.appendChild(row);
    });

    document.querySelectorAll('.category-row button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const catId = btn.dataset.cat;
            const delta = parseInt(btn.dataset.delta);
            const input = document.getElementById(catId);
            let newVal = (parseInt(input.value) || 0) + delta;
            if (newVal < 0) newVal = 0;
            input.value = newVal;
        });
    });
}

function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    container.innerHTML = '';

    UPGRADE_TIERS.forEach(tier => {
        const card = document.createElement('div');
        card.className = `upgrade-card ${tier.level <= player.level ? 'current' : ''}`;
        card.innerHTML = `
            <h4>Nível ${tier.level}: ${tier.name}</h4>
            <ul>${tier.perks.map(p => `<li>${p}</li>`).join('')}</ul>
        `;
        container.appendChild(card);
    });
}

function renderShop() {
    const container = document.getElementById('shopContainer');
    container.innerHTML = '';

    const allUpgrades = [...HIRING_UPGRADES, ...INFRA_UPGRADES];

    allUpgrades.forEach(upg => {
        const alreadyBought = purchasedUpgrades[upg.id];
        const card = document.createElement('div');
        card.className = `upgrade-card ${alreadyBought ? 'current' : ''}`;
        card.innerHTML = `
            <h4>${upg.name}</h4>
            <p>${upg.description}</p>
            <p><strong>Custo:</strong> $${upg.cost}</p>
            ${alreadyBought ? '<span style="color: #22c55e;">✅ Adquirido</span>' : ''}
        `;
        if (!alreadyBought) {
            const buyBtn = document.createElement('button');
            buyBtn.className = 'btn-primary';
            buyBtn.innerText = 'Comprar';
            buyBtn.style.marginTop = '10px';
            buyBtn.onclick = (e) => {
                e.stopPropagation();
                buyUpgrade(upg.id);
            };
            card.appendChild(buyBtn);
        }
        container.appendChild(card);
    });
}

function buyUpgrade(upgradeId) {
    const upgrade = [...HIRING_UPGRADES, ...INFRA_UPGRADES].find(u => u.id === upgradeId);
    if (!upgrade) return;

    if (purchasedUpgrades[upgradeId]) {
        alert('Você já comprou este upgrade!');
        return;
    }

    if (player.money < upgrade.cost) {
        alert('Dinheiro insuficiente!');
        return;
    }

    player.money -= upgrade.cost;
    purchasedUpgrades[upgradeId] = true;

    save();
    updateUI();
}

function updateStatsTab() {
    document.getElementById('gamesCount').innerText = player.gamesLaunched;
    document.getElementById('totalEarned').innerText = player.totalEarned;
    const avgRep = player.gamesLaunched ? (player.reputation / player.gamesLaunched).toFixed(1) : 0;
    document.getElementById('avgRep').innerText = avgRep;
    document.getElementById('maxHype').innerText = player.maxHype;
}

function updateUI() {
    document.getElementById('money').innerText = player.money;
    document.getElementById('reputation').innerText = player.reputation;
    document.getElementById('hype').innerText = player.hype;
    document.getElementById('level').innerText = player.level;
    document.getElementById('xp').innerText = player.xp;

    const xpNeeded = XP_PER_LEVEL_BASE + (player.level * 25);
    document.getElementById('xpNeeded').innerText = xpNeeded;
    const percent = Math.min(100, (player.xp / xpNeeded) * 100);
    document.getElementById('xpFill').style.width = percent + '%';

    const maxSpend = player.basePoints + getMaxSpendBonus();
    document.getElementById('maxSpend').innerText = maxSpend;

    document.getElementById('review').innerText = player.review;
    document.getElementById('marketInfo').innerHTML = `
        <strong>${market.favoredAttribute.toUpperCase()}</strong> +50% peso<br>
        <strong>${market.saturatedGenre}</strong> -30% vendas
    `;

    renderCategoryInputs();
    renderUpgrades();
    renderShop();
    updateStatsTab();
}

function calculateScore(gameValues, genre) {
    const unlocked = getUnlockedCategories();
    let weightedSum = 0;
    let maxPossibleSum = 0;

    unlocked.forEach(cat => {
        const weight = cat.baseWeight * (cat.id === market.favoredAttribute ? market.multiplier : 1);
        const value = gameValues[cat.id] || 0;
        weightedSum += value * weight;
        maxPossibleSum += value * cat.baseWeight * market.multiplier;
    });

    if (maxPossibleSum === 0) return 0;

    if (genre === market.saturatedGenre) {
        weightedSum *= market.penalty;
    }

    const optimization = gameValues.optimization || 0;
    if (optimization < 5) {
        weightedSum *= 0.8;
    }

    let score = (weightedSum / maxPossibleSum) * 10;
    score *= getQualityBonus();
    return Math.min(10, score);
}

function gainXP(score) {
    const xpGain = Math.floor(score * XP_GAIN_MULTIPLIER * getXPMultiplier());
    player.xp += xpGain;

    let xpNeeded = XP_PER_LEVEL_BASE + (player.level * 25);
    let leveledUp = false;
    while (player.xp >= xpNeeded && player.level < MAX_LEVEL) {
        player.xp -= xpNeeded;
        player.level++;
        player.basePoints += POINTS_PER_LEVEL + getPointsPerLevelBonus();
        player.reputation += 2;
        xpNeeded = XP_PER_LEVEL_BASE + (player.level * 25);
        leveledUp = true;
    }

    if (leveledUp) {
        alert(`🎉 PARABÉNS! Você alcançou o nível ${player.level}!\n\n🔹 Pontos por jogo aumentaram para ${player.basePoints + getMaxSpendBonus()}\n🔹 Reputação +2\n🔹 Novas categorias podem ter sido desbloqueadas!`);
    }
}

function launchGame() {
    const unlocked = getUnlockedCategories();
    const gameValues = {};
    let totalSpent = 0;

    unlocked.forEach(cat => {
        const input = document.getElementById(cat.id);
        const val = input ? Math.max(0, Math.floor(+input.value || 0)) : 0;
        gameValues[cat.id] = val;
        totalSpent += val;
    });

    const genre = document.getElementById('genre').value;

    const maxSpend = player.basePoints + getMaxSpendBonus();
    if (totalSpent > maxSpend) {
        alert(`❌ Limite por jogo: ${maxSpend} pontos!`);
        return;
    }

    const score = calculateScore(gameValues, genre);
    const luck = 0.9 + Math.random() * 0.3;
    const sales = Math.floor(score * (1 + player.reputation / 100) * luck * 1000 * getSalesMultiplier());

    player.money += sales;
    player.totalEarned += sales;
    player.reputation += Math.floor(score) + getReputationPerGameBonus();
    player.hype += (gameValues.marketing || 0) + getHypePerGameBonus();
    if (player.hype > player.maxHype) player.maxHype = player.hype;

    gainXP(score);
    player.gamesLaunched++;

    if (player.gamesLaunched % 3 === 0) {
        randomMarket();
    }

    player.review = `Nota ${score.toFixed(2)} ⭐ | Vendas: $${sales}`;

    unlocked.forEach(cat => {
        const input = document.getElementById(cat.id);
        if (input) input.value = '0';
    });

    save();
    updateUI();
}

function testGame() {
    const unlocked = getUnlockedCategories();
    const gameValues = {};

    unlocked.forEach(cat => {
        const input = document.getElementById(cat.id);
        gameValues[cat.id] = input ? Math.max(0, Math.floor(+input.value || 0)) : 0;
    });

    const genre = document.getElementById('genre').value;
    const score = calculateScore(gameValues, genre);

    const testDiv = document.getElementById('testResult');
    const scoreBar = document.getElementById('testScoreBar');
    const scoreText = document.getElementById('testScoreText');

    scoreBar.style.width = (score * 10) + '%';
    scoreText.innerText = `Nota estimada: ${score.toFixed(2)} ⭐`;

    testDiv.style.display = 'block';

    if (score >= 9) {
        scoreBar.style.background = 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    } else if (score >= 7) {
        scoreBar.style.background = 'linear-gradient(90deg, #34d399, #10b981)';
    } else if (score >= 5) {
        scoreBar.style.background = 'linear-gradient(90deg, #fbbf24, #d97706)';
    } else {
        scoreBar.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
    }
}

function resetGame() {
    localStorage.removeItem('devZeroSave');
    location.reload();
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

let canvas, ctx, particles = [];
const PARTICLE_COUNT = 80;

function initParticles() {
    canvas = document.getElementById('particlesCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
        });
    }
    animateParticles();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hue = (player.level / MAX_LEVEL) * 160 + 200;
    const color = `hsla(${hue}, 80%, 60%, 0.4)`;

    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    });

    requestAnimationFrame(animateParticles);
}

load();
updateUI();
initTabs();
initParticles();