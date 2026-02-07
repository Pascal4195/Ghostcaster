const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://peer.wall.org/gun']);
const castStore = gun.get('ghostcaster_v2_main_feed');
let userAddr = localStorage.getItem('ghost_address');

if (userAddr) updateUI(userAddr);

async function connect() {
    if (!window.ethereum) return alert("Use MetaMask/Brave browser!");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddr = accounts[0];
                localStorage.setItem('ghost_address', userAddr);
                    updateUI(userAddr);
                    }

                    function updateUI(addr) {
                        document.getElementById('connectBtn').innerText = addr.slice(0,6) + '...';
                            document.getElementById('userAvatar').src = `https://api.dicebear.com/7.x/identicon/svg?seed=${addr}`;
                            }

                            document.getElementById('castBtn').onclick = () => {
                                const text = document.getElementById('postText').value;
                                    if (!userAddr || !text.trim()) return alert("Connect wallet and write a cast!");
                                        castStore.set({ body: text, author: userAddr, time: Date.now() });
                                            document.getElementById('postText').value = "";
                                            };

                                            const rendered = new Set();
                                            castStore.map().once((data, id) => {
                                                if (!data || !data.body || rendered.has(id)) return;
                                                    rendered.add(id);
                                                        const div = document.createElement('div');
                                                            div.className = "p-4 flex gap-3 border-b border-slate-50";
                                                                div.innerHTML = `
                                                                        <div class="w-12 h-12 rounded-full bg-slate-100 shrink-0 overflow-hidden">
                                                                                    <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${data.author}">
                                                                                            </div>
                                                                                                    <div>
                                                                                                                <div class="flex gap-2 items-center">
                                                                                                                                <span class="font-bold text-sm">${data.author.slice(0,6)}</span>
                                                                                                                                                <span class="text-slate-400 text-xs">${new Date(data.time).toLocaleTimeString()}</span>
                                                                                                                                                            </div>
                                                                                                                                                                        <p class="text-slate-800 mt-1">${data.body}</p>
                                                                                                                                                                                </div>`;
                                                                                                                                                                                    document.getElementById('feed').prepend(div);
                                                                                                                                                                                    });

                                                                                                                                                                                    document.getElementById('connectBtn').onclick = connect;
                                                                                                                                                                                    