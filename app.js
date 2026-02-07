// REPLACE WITH YOUR CONFIG FROM PREVIOUS STEP
const firebaseConfig = {
  apiKey: "AIzaSyCzc8Nsf8WSHRIhUBfGt1ezJEOuX8HUHSE",
  authDomain: "ghostcaster-32149.firebaseapp.com",
  projectId: "ghostcaster-32149",
  storageBucket: "ghostcaster-32149.firebasestorage.app",
  messagingSenderId: "588867936925",
  appId: "1:588867936925:web:cf07abb1ed735d5c45ea74"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const castStore = gun.get('ghostcaster_beta_v1');

let userAddr = localStorage.getItem('ghost_address');
const rendered = new Set();

// Check for redirect result on page load
auth.getRedirectResult().then((result) => {
    if (result.user) {
        saveUser(result.user.uid);
    }
}).catch((error) => console.error("Auth Error:", error));

if (userAddr) updateUI(userAddr);

// --- AUTH ---

function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider); // Better for mobile responsiveness
}

async function connectWallet() {
    if (window.ethereum) {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        saveUser(accs[0]);
    } else {
        const dappUrl = window.location.href.split('//')[1];
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
    }
}

function saveUser(id) {
    userAddr = id;
    localStorage.setItem('ghost_address', id);
    updateUI(id);
}

// --- UI ---

function updateUI(id) {
    const isEth = id.startsWith('0x');
    const pfp = `https://api.dicebear.com/7.x/identicon/svg?seed=${id}&backgroundColor=855dcd`;
    
    document.getElementById('hdrAvatar').innerHTML = `<img src="${pfp}" class="w-full h-full">`;
    document.getElementById('sidePfp').innerHTML = `<img src="${pfp}" class="w-full h-full">`;
    document.getElementById('sideName').innerText = isEth ? "Web3 Explorer" : "Verified Ghost";
    document.getElementById('sideHandle').innerText = `@${id.slice(-5)}`;
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    const isOpen = sb.style.transform === 'translateX(0px)';
    sb.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    ov.classList.toggle('hidden');
}

function showView(v) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById('view-' + v).classList.remove('hidden');
}

function openComposer() { document.getElementById('composer').classList.remove('hidden'); }
function closeComposer() { document.getElementById('composer').classList.add('hidden'); }

// --- DATA ---

document.getElementById('castBtn').onclick = () => {
    const text = document.getElementById('postText').value;
    if (!userAddr) return alert("Please sign in first!");
    if (!text) return alert("Write something!");
    
    castStore.set({ body: text, author: userAddr, time: Date.now() });
    document.getElementById('postText').value = "";
    closeComposer();
};

castStore.map().once((data, id) => {
    if (!data || !data.body || rendered.has(id)) return;
    rendered.add(id);

    const div = document.createElement('div');
    div.className = "p-4 flex gap-3 border-b border-[#1a1a1a] animate-in fade-in duration-500";
    div.innerHTML = `
        <div class="w-11 h-11 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-[#222]">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${data.author}">
        </div>
        <div class="flex-1 min-w-0">
            <div class="font-bold text-[15px] flex items-center gap-1">
                Ghost-${data.author.slice(0,4)} <span class="text-[#855DCD] text-[10px]">●</span>
            </div>
            <p class="text-[15px] mt-0.5 text-slate-200 leading-normal">${data.body}</p>
        </div>`;
    document.getElementById('feed').prepend(div);
});
