const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://peer.wall.org/gun']);
const castStore = gun.get('ghostcaster_vFinal_prod');
let userAddr = localStorage.getItem('ghost_address');
let currentChannel = 'all';
const rendered = new Set();

if (userAddr) updateUI(userAddr);
setTheme(localStorage.getItem('ghost-theme') || 'oled');

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('overlay').classList.toggle('hidden');
}

function showView(v) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-' + v).classList.remove('hidden');
    if(v === 'settings') updateStorageMeter();
}

function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('ghost-theme', t);
}

function updateUI(addr) {
    const pfp = `https://api.dicebear.com/7.x/identicon/svg?seed=${addr}`;
    document.getElementById('hdrAvatar').innerHTML = `<img src="${pfp}">`;
    document.getElementById('sidePfp').innerHTML = `<img src="${pfp}">`;
    document.getElementById('sideHandle').innerText = `@${addr.slice(2,8)}`;
    document.getElementById('connectBtn').innerText = "✅ Connected";
}

async function connect() {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAddr = accs[0];
    localStorage.setItem('ghost_address', userAddr);
    updateUI(userAddr);
}

document.getElementById('connectBtn').onclick = connect;
function openComposer() { document.getElementById('composer').classList.remove('hidden'); }
function closeComposer() { document.getElementById('composer').classList.add('hidden'); }

document.getElementById('castBtn').onclick = () => {
    const body = document.getElementById('postText').value;
    if (!userAddr || !body) return alert("Connect Wallet First!");
    castStore.set({ body, author: userAddr, time: Date.now(), channel: currentChannel });
    document.getElementById('postText').value = "";
    closeComposer();
};

castStore.map().once((data, id) => {
    if (!data || !data.body || rendered.has(id)) return;
    if (currentChannel !== 'all' && data.channel !== currentChannel) return;
    rendered.add(id);

    let miniApp = "";
    if (data.body.toLowerCase().includes("swap")) {
        miniApp = `<div class="mt-3 p-3 border border-[var(--border)] rounded-xl bg-purple-500/5">
            <div class="text-[10px] font-bold text-fc-purple mb-2 tracking-widest">GHOST SWAP</div>
            <button onclick="window.open('https://app.uniswap.org')" class="w-full bg-fc-purple py-2 rounded-lg text-sm font-bold text-white">Swap on Uniswap</button>
        </div>`;
    }

    const div = document.createElement('div');
    div.className = "p-4 flex gap-3 border-b border-[var(--border)]";
    div.innerHTML = `
        <div class="w-11 h-11 rounded-full bg-slate-800 shrink-0 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${data.author}">
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1">
                <span class="font-bold text-[15px]">User-${data.author.slice(2,8)}</span>
                <span class="text-fc-purple text-xs">💜</span>
            </div>
            <p class="text-[15px] mt-1 break-words">${data.body}</p>
            ${miniApp}
            <div class="flex justify-between mt-4 max-w-[250px] opacity-40 text-sm"><span>💬 0</span><span>🔁 0</span><span>❤️ 0</span></div>
        </div>`;
    document.getElementById('feed').prepend(div);
});

function updateStorageMeter() {
    let total = JSON.stringify(localStorage).length;
    let pct = ((total / (5 * 1024 * 1024)) * 100).toFixed(2);
    document.getElementById('storage-bar').style.width = pct + "%";
    document.getElementById('storage-percent').innerText = pct + "%";
}
