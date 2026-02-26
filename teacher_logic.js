import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ১. মেইন ড্যাশবোর্ড রেন্ডার
export async function loadTeacherDashboard(userData) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="glass p-6 rounded-[2.5rem] border-t-4 border-yellow-500 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-black text-yellow-500 italic uppercase">${userData.subject}</h2>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instructor: ${userData.name}</p>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <button id="navContent" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-layer-group text-yellow-500 mb-2 pointer-events-none"></i>
                    <p class="text-[8px] font-black uppercase pointer-events-none">Structure</p>
                </button>
                <button id="navQuiz" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-images text-yellow-500 mb-2 pointer-events-none"></i>
                    <p class="text-[8px] font-black uppercase pointer-events-none">Quiz</p>
                </button>
                <button id="navVideo" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-video text-yellow-500 mb-2 pointer-events-none"></i>
                    <p class="text-[8px] font-black uppercase pointer-events-none">Lecture</p>
                </button>
            </div>

            <div id="teacherActionArea" class="space-y-4 min-h-[250px]">
                <p class="text-center text-slate-600 text-[10px] uppercase font-bold py-10">Select an action to start managing</p>
            </div>
        </div>
    `;

    // ইভেন্ট লিসেনার সেটআপ
    document.getElementById('navContent').addEventListener('click', () => renderContentSection());
    document.getElementById('navVideo').addEventListener('click', () => renderVideoSection());
    document.getElementById('navQuiz').addEventListener('click', () => alert("Quiz System is under maintenance. Use Lecture for now."));
}

// ২. স্ট্রাকচার সেকশন (Chapter & Topic)
async function renderContentSection() {
    const area = document.getElementById('teacherActionArea');
    area.innerHTML = `
        <div class="glass p-6 rounded-3xl border border-slate-800 animate-fade-in">
            <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Add New Chapter</h3>
            <input type="text" id="chapInput" placeholder="Chapter Name" class="input-premium mb-3">
            <button id="saveChapBtn" class="btn-gold py-3 text-[10px]">Save Chapter</button>
            
            <hr class="my-6 border-slate-800">
            
            <h3 class="text-xs font-black uppercase text-blue-500 mb-4">Add New Topic</h3>
            <select id="chapSelect" class="input-premium mb-3"></select>
            <input type="text" id="topicInput" placeholder="Topic Name" class="input-premium mb-3">
            <button id="saveTopicBtn" class="btn-gold py-3 text-[10px] bg-blue-600 text-white border-none">Save Topic</button>
        </div>
    `;
    
    populateDropdown('chapSelect');

    document.getElementById('saveChapBtn').onclick = async () => {
        const name = document.getElementById('chapInput').value;
        const user = JSON.parse(localStorage.getItem('user'));
        if(!name) return;
        await addDoc(collection(db, "structure"), { type:'chapter', name, subject: user.subject, createdAt: serverTimestamp() });
        alert("Chapter Added!");
        renderContentSection();
    };

    document.getElementById('saveTopicBtn').onclick = async () => {
        const chap = document.getElementById('chapSelect').value;
        const name = document.getElementById('topicInput').value;
        if(!chap || !name) return;
        await addDoc(collection(db, "structure"), { type:'topic', chapter: chap, name, createdAt: serverTimestamp() });
        alert("Topic Added!");
        renderContentSection();
    };
}

// ৩. ভিডিও সেকশন (Lecture Upload)
async function renderVideoSection() {
    const area = document.getElementById('teacherActionArea');
    area.innerHTML = `
        <div class="glass p-6 rounded-3xl border border-slate-800 animate-fade-in">
            <h3 class="text-xs font-black text-yellow-500 uppercase mb-4">Upload Video Lecture</h3>
            <select id="vidChapSelect" class="input-premium mb-3"></select>
            <input type="text" id="vidTopicInput" placeholder="Topic Name" class="input-premium mb-3">
            <input type="text" id="vidUrlInput" placeholder="YouTube URL (https://www.youtube.com/embed/...)" class="input-premium mb-4">
            
            <label class="flex items-center gap-3 mb-4 p-2">
                <input type="checkbox" id="liveCheck" class="w-4 h-4 accent-yellow-500">
                <span class="text-[10px] text-white font-bold uppercase italic">Mark as Live Class</span>
            </label>

            <button id="publishVidBtn" class="btn-gold py-4">Publish Lecture</button>
        </div>
    `;

    populateDropdown('vidChapSelect');

    document.getElementById('publishVidBtn').onclick = async () => {
        const chap = document.getElementById('vidChapSelect').value;
        const topic = document.getElementById('vidTopicInput').value;
        const url = document.getElementById('vidUrlInput').value;
        const isLive = document.getElementById('liveCheck').checked;
        const user = JSON.parse(localStorage.getItem('user'));

        if(!chap || !topic || !url) return alert("Fill all fields!");

        await addDoc(collection(db, "videos"), {
            subject: user.subject,
            chapter: chap,
            topic,
            url,
            isLive,
            createdAt: serverTimestamp()
        });
        alert("Video Published!");
        document.getElementById('vidTopicInput').value = "";
        document.getElementById('vidUrlInput').value = "";
    };
}

// ৪. ড্রপডাউন ডাটা লোড
async function populateDropdown(elementId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const q = query(collection(db, "structure"), where("subject", "==", user.subject), where("type", "==", "chapter"));
    const snap = await getDocs(q);
    const select = document.getElementById(elementId);
    if(!select) return;
    select.innerHTML = `<option value="">Select Chapter</option>`;
    snap.forEach(doc => {
        select.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`;
    });
                                               }
