const firebaseConfig = {
  apiKey: "AIzaSyCzc8Nsf8WSHRIhUBfGt1ezJEOuX8HUHSE",
  authDomain: "ghostcaster-32149.firebaseapp.com",
  projectId: "ghostcaster-32149",
  storageBucket: "ghostcaster-32149.firebasestorage.app",
  messagingSenderId: "588867936925",
  appId: "1:588867936925:web:cf07abb1ed735d5c45ea74"
};

firebase.initializeApp(firebaseConfig);
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const castStore = gun.get('ghostcaster_2026_prod');
let userAddr = localStorage.getItem('ghost_address');

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    });
}

// 2. Auth Logic
firebase.auth().getRedirectResult().then(res => { if(res.user) saveUser(res.user.uid); });

function loginGoogle() { firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()); }

async function connectWallet() {
    if (window.ethereum) {
        const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
        saveUser(accs[0]);
    } else {
        window.location.href = `https://metamask.app.link/dapp/${window.location.href.split('//')[1]}`;
    }
}

function saveUser(id) {
    userAddr = id;
    localStorage.setItem('ghost_address', id);
    updateUI(id);
}

function updateUI(id) {
    const pfp = `https://api.dicebear.com/7.x/identicon/svg?seed=${id}&backgroundColor=855dcd`;
    document.getElementById('hdrAvatar').innerHTML = `<img src="${pfp}" class="w-full">`;
    document.getElementById('sidePfp').innerHTML = `<img src="${pfp}" class="w-full">`;
    document.getElementById('sideName').innerText = id.startsWith('0x') ? "Web3" : "Google User";
}

// 3. App Logic
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.style.transform = sb.style.transform === 'translateX(0px)' ? 'translateX(-100%)' : 'translateX(0px)';
    document.getElementById('overlay').classList.toggle('hidden');
}

function openComposer() { document.getElementById('composer').classList.remove('hidden'); }
function closeComposer() { document.getElementById('composer').classList.add('hidden'); }

document.getElementById('castBtn').onclick = () => {
    const text = document.getElementById('postText').value;
    if (!userAddr || !text) return alert("Sign in & write text!");
    castStore.set({ body: text, author: userAddr, time: Date.now() });
    document.getElementById('postText').value = "";
    closeComposer();
};

const rendered = new Set();
castStore.map().once((data, id) => {
    if (!data || !data.body || rendered.has(id)) return;
    rendered.add(id);
    const div = document.createElement('div');
    div.className = "p-4 flex gap-3 border-b border-[#1a1a1a]";
    div.innerHTML = `<div class="w-11 h-11 rounded-full bg-slate-800 overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/identicon/svg?seed=${data.author}"></div><div class="flex-1"><div class="font-bold text-[15px]">Ghost-${data.author.slice(0,4)}</div><p class="text-slate-200">${data.body}</p></div>`;
    document.getElementById('feed').prepend(div);
});
