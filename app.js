// Firebase Config from your console
const firebaseConfig = {
  apiKey: "AIzaSyCzc8Nsf8WSHRIhUBfGt1ezJEOuX8HUHSE",
  authDomain: "ghostcaster-32149.firebaseapp.com",
  projectId: "ghostcaster-32149",
  storageBucket: "ghostcaster-32149.firebasestorage.app",
  messagingSenderId: "588867936925",
  appId: "1:588867936925:web:cf07abb1ed735d5c45ea74",
  measurementId: "G-ET2BKRFBDP"
};

// Initialize Firebase (Compat mode)
firebase.initializeApp(firebaseConfig);

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const castStore = gun.get('ghostcaster_vFinal_prod');
let userAddr = localStorage.getItem('ghost_address');
const rendered = new Set();

if (userAddr) updateUI(userAddr);

// --- AUTH FUNCTIONS ---

async function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        userAddr = result.user.uid;
        localStorage.setItem('ghost_address', userAddr);
        updateUI(userAddr);
        toggleSidebar();
    } catch (e) { alert("Google Sign-in failed"); }
}

async function connectWallet() {
    if (window.ethereum) {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddr = accs[0];
        localStorage.setItem('ghost_address', userAddr);
        updateUI(userAddr);
    } else {
        // Deep link for mobile
        const dappUrl = window.location.href.split('//')[1];
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
    }
}

// --- UI FUNCTIONS ---

function updateUI(id) {
    const isEth = id.startsWith('0x');
    const displayId = isEth ? id.slice(0,6) : "GoogleUser";
    const pfp = `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`;
    
    document.getElementById('hdrAvatar').innerHTML = `<img src="${pfp}">`;
    document.getElementById('sidePfp').innerHTML = `<img src="${pfp}">`;
    document.getElementById('sideName').innerText = isEth ? `User ${displayId}` : "Verified Ghost";
    document.getElementById('sideHandle').innerText = `@${id.slice(-4)}`;
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('overlay').classList.toggle('hidden');
}

function openComposer() { document.getElementById('composer').classList.remove('hidden'); }
function closeComposer() { document.getElementById('composer').classList.add('hidden'); }

// --- DATA FUNCTIONS ---

document.getElementById('castBtn').onclick = () => {
    const text = document.getElementById('postText').value;
    if (!userAddr) return alert("Sign in first!");
    castStore.set({ body: text, author: userAddr, time: Date.now() });
    document.getElementById('postText').value = "";
    closeComposer();
};

castStore.map().once((data, id) => {
    if (!data || !data.body || rendered.has(id)) return;
    rendered.add(id);

    const div = document.createElement('div');
    div.className = "p-4 flex gap-3 border-b border-[#1a1a1a]";
    div.innerHTML = `
        <div class="w-11 h-11 rounded-full bg-slate-800 shrink-0 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${data.author}">
        </div>
        <div class="flex-1 min-w-0">
            <div class="font-bold text-[15px] flex items-center gap-1">
                User-${data.author.slice(0,4)} <span class="text-fc-purple">💜</span>
            </div>
            <p class="text-[15px] mt-1 text-slate-200">${data.body}</p>
        </div>`;
    document.getElementById('feed').prepend(div);
});
