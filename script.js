let game = {
    money: 500, reputation: 1.0, level: 1, xp: 0, xpNeeded: 100, trend: "gameplay",
    staff: [], techs: [], pcLevel: 0,
    stats: { gameplay: 0, graphics: 0, optimization: 0, story: 0, marketing: 0 }
};

const statusMap = { 1: "Dev de Quarto", 10: "Freelancer", 25: "Micro Estúdio", 50: "Estúdio Indie", 100: "Lenda da Indústria" };

const techs = [
    { id: "engine", name: "Engine Própria", cost: 1500, desc: "Bugs reduzidos em 40%" },
    { id: "graphics3d", name: "Gráficos 3D", cost: 4000, desc: "Dobra valor de Gráficos" }
];

const staffPool = [
    { id: "senior", name: "Dev Senior", cost: 2500, salary: 180, type: "optimization", power: 35 },
    { id: "artist", name: "Artista Pro", cost: 1800, salary: 120, type: "graphics", power: 30 }
];

// --- ABAS ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById('btn-' + tabId).classList.add('active');
}

// --- ATRIBUTOS ---
function renderAttributes() {
    const container = document.getElementById('attrStack');
    const keys = ["gameplay", "graphics", "story", "optimization", "marketing"];
    container.innerHTML = keys.map(key => {
        if (key === 'marketing' && game.level < 5) return '';
        return `
            <div class="attr-card">
                <div class="attr-label">${key.toUpperCase()} <span>${game.stats[key]}</span></div>
                <div class="btn-group">
                    <button class="ctrl-btn sub" onclick="changeAttr('${key}', -5)">-5</button>
                    <button class="ctrl-btn" onclick="changeAttr('${key}', 1)">+1</button>
                    <button class="ctrl-btn" onclick="changeAttr('${key}', 5)">+5</button>
                    <button class="ctrl-btn" onclick="addMax('${key}')">MAX</button>
                </div>
            </div>`;
    }).join('');
}

function changeAttr(id, amt) {
    const max = 20 + (game.level * 5);
    const currentTotal = Object.values(game.stats).reduce((a, b) => a + b, 0);
    let newVal = Math.max(0, game.stats[id] + amt);
    if (amt > 0) {
        const space = max - currentTotal;
        if (amt > space) newVal = game.stats[id] + space;
    }
    game.stats[id] = newVal;
    updateUI();
}

function addMax(id) {
    const max = 20 + (game.level * 5);
    const otherTotal = Object.values(game.stats).reduce((a, b) => a + b, 0) - game.stats[id];
    game.stats[id] = max - otherTotal;
    updateUI();
}

// --- LOGICA DE JOGO ---
function publishGame() {
    let { gameplay: gp, graphics: gr, story: st, optimization: ot, marketing: mk } = game.stats;
    
    game.staff.forEach(s => { 
        if(s.type === 'optimization') ot += s.power; 
        if(s.type === 'graphics') gr += s.power; 
    });
    if(game.techs.includes('graphics3d')) gr *= 2;

    let baseScore = (gp * 3) + (gr * 1.5) + (st * 1.5);
    if(game.trend === "gameplay") baseScore *= 1.4;

    const otNeeded = (gp + gr + st) * 0.25;
    const penalty = (game.techs.includes('engine') ? ot * 1.4 : ot) < otNeeded ? 0.5 : 1.0;

    const note = Math.min(10, (baseScore / ((20 + game.level * 5) * 1.5)) * 10 * penalty).toFixed(1);
    const profit = Math.floor(note * 120 * game.reputation * (1 + mk/20));

    game.money += profit;
    game.reputation += note >= 8 ? 0.2 : (note < 4 ? -0.2 : 0.05);
    gainXP(Math.floor(note * 25));
    addLog(note, profit, penalty < 1.0);
    
    game.stats = { gameplay: 0, graphics: 0, optimization: 0, story: 0, marketing: 0 };
    updateUI();
    saveGame();
}

function gainXP(amt) {
    game.xp += amt;
    while(game.xp >= game.xpNeeded) {
        game.xp -= game.xpNeeded; game.level++; game.xpNeeded = Math.floor(game.xpNeeded * 1.3);
    }
}

function buyTech(id, cost) {
    if (game.money >= cost && !game.techs.includes(id)) {
        game.money -= cost; game.techs.push(id); updateUI(); saveGame();
    }
}

function hireStaff(id) {
    const s = staffPool.find(x => x.id === id);
    if (game.money >= s.cost && !game.staff.some(x => x.id === id)) {
        game.money -= s.cost; game.staff.push(s); updateUI(); saveGame();
    }
}

// --- UI ---
function updateUI() {
    document.getElementById('money').innerText = Math.floor(game.money);
    document.getElementById('reputation').innerText = game.reputation.toFixed(1);
    document.getElementById('level').innerText = game.level;
    
    const currentTotal = Object.values(game.stats).reduce((a, b) => a + b, 0);
    const max = 20 + (game.level * 5);
    document.getElementById('currentPoints').innerText = currentTotal;
    document.getElementById('maxPoints').innerText = max;
    document.getElementById('publishBtn').disabled = currentTotal === 0;

    document.getElementById('xpBar').style.width = `${(game.xp/game.xpNeeded)*100}%`;
    document.getElementById('xpText').innerText = `${game.xp}/${game.xpNeeded} XP`;
    
    let status = "Iniciante";
    for(let l in statusMap) if(game.level >= l) status = statusMap[l];
    document.getElementById('studioStatus').innerText = status;

    renderAttributes();
    renderUpgrades();
}

function renderUpgrades() {
    document.getElementById('techTree').innerHTML = techs.map(t => `
        <div class="upgrade-card ${game.techs.includes(t.id) ? 'owned' : ''}">
            <span><strong>${t.name}</strong><br><small>${t.desc}</small></span>
            <button onclick="buyTech('${t.id}', ${t.cost})" class="ctrl-btn" ${game.techs.includes(t.id)?'disabled':''}>$${t.cost}</button>
        </div>`).join('');

    document.getElementById('staffList').innerHTML = staffPool.map(s => `
        <div class="upgrade-card ${game.staff.some(x=>x.id===s.id) ? 'owned' : ''}">
            <span><strong>${s.name}</strong><br><small>Salário: $${s.salary}</small></span>
            <button onclick="hireStaff('${s.id}')" class="ctrl-btn" ${game.staff.some(x=>x.id===s.id)?'disabled':''}>$${s.cost}</button>
        </div>`).join('');
}

function addLog(n, p, b) {
    const log = document.getElementById('gameLog');
    const d = document.createElement('div');
    d.className = "review-item";
    d.innerHTML = `<strong>Nota: ${n}/10</strong> | Lucro: $${p}<br><small>${b ? "⚠️ Muitos bugs!" : "💎 Estável."}</small>`;
    log.prepend(d);
}

// --- SISTEMA ---
function saveGame() { localStorage.setItem('devZeroSave', JSON.stringify(game)); }
function loadGame() {
    const saved = localStorage.getItem('devZeroSave');
    if (saved) { game = JSON.parse(saved); updateUI(); }
}
function resetGame() { if(confirm("Resetar?")) { localStorage.clear(); location.reload(); } }

// --- BACKGROUND ---
const canvas = document.getElementById('bgCanvas'); const ctx = canvas.getContext('2d');
function initCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
function animate() {
    ctx.clearRect(0,0,canvas.width, canvas.height); ctx.fillStyle = "#00ffaa11";
    ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
    requestAnimationFrame(animate);
}

window.onload = () => { loadGame(); initCanvas(); animate(); updateUI(); };