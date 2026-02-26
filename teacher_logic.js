import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ১. টিচার ড্যাশবোর্ড লোড করা
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
                <button id="btnContent" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-layer-group text-yellow-500 mb-2"></i>
                    <p class="text-[8px] font-black uppercase">Structure</p>
                </button>
                <button id="btnQuiz" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-images text-yellow-500 mb-2"></i>
                    <p class="text-[8px] font-black uppercase">Bulk Quiz</p>
                </button>
                <button id="btnVideo" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-video text-yellow-500 mb-2"></i>
                    <p class="text-[8px] font-black uppercase">Lecture</p>
                </button>
            </div>

            <div id="teacherActionArea" class="space-y-4 min-h-[200px]">
                <p class="text-center text-slate-600 text-[10px] uppercase font-bold py-10">Select an action to start</p>
            </div>
        </div>
    `;

    // বাটনগুলোতে ইভেন্ট লিসেনার যোগ করা (অ্যাভান্সড মেথড)
    document.getElementById('btnContent').onclick = () => renderSection('content');
    document.getElementById('btnQuiz').onclick = () => renderSection('quiz');
    document.getElementById('btnVideo').onclick = () => renderSection('video');
}

// ২. সেকশন রেন্ডার করা
async function renderSection(type) {
    const area = document.getElementById('teacherActionArea');
    const user = JSON.parse(localStorage.getItem('user'));

    if (type === 'content') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Add Chapter</h3>
                <input type="text" id="newChap" placeholder="Chapter Name" class="input-premium mb-3">
                <button id="saveChapBtn" class="btn-gold py-3 text-[10px]">Save Chapter</button>
                <hr class="my-6 border-slate-800">
                <h3 class="text-xs font-black uppercase text-blue-500 mb-4">Add Topic</h3>
                <select id="chapSelect" class="input-premium mb-3"></select>
                <input type="text" id="newTopic" placeholder="Topic Name" class="input-premium mb-3">
                <button id="saveTopicBtn" class="btn-gold py-3 text-[10px] bg-blue-600">Save Topic</button>
            </div>
        `;
        setupDropdown('chapSelect');
        document.getElementById('saveChapBtn').onclick = saveChapter;
        document.getElementById('saveTopicBtn').onclick = saveTopic;
    }

    if (type === 'video') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black text-yellow-500 uppercase mb-4">Upload Lecture</h3>
                <select id="vidChap" class="input-premium mb-3"></select>
                <input type="text" id="vidTopic" placeholder="Topic Name" class="input-premium mb-3">
                <input type="text" id="vidUrl" placeholder="YouTube Embed URL" class="input-premium mb-4">
                <button id="uploadVidBtn" class="btn-gold py-4">Publish Video</button>
            </div>
        `;
        setupDropdown('vidChap');
        document.getElementById('uploadVidBtn').onclick = uploadVideo;
    }
}

// ৩. ড্রপডাউন সেটআপ
async function setupDropdown(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    const q = query(collection(db, "structure"), where("subject", "==", user.subject), where("type", "==", "chapter"));
    const snap = await getDocs(q);
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">Select Chapter</option>`;
    snap.forEach(d => select.innerHTML += `<option value="${d.data().name}">${d.data().name}</option>`);
}

// ৪. ডাটা সেভ ফাংশনগুলো
async function saveChapter() {
    const name = document.getElementById('newChap').value;
    const user = JSON.parse(localStorage.getItem('user'));
    if(!name) return alert("Enter Name!");
    await addDoc(collection(db, "structure"), { type:'chapter', name, subject: user.subject, createdAt: serverTimestamp() });
    alert("Chapter Saved!");
    renderSection('content');
}

async function saveTopic() {
    const chap = document.getElementById('chapSelect').value;
    const name = document.getElementById('newTopic').value;
    if(!chap || !name) return alert("Fill all fields!");
    await addDoc(collection(db, "structure"), { type:'topic', chapter: chap, name, createdAt: serverTimestamp() });
    alert("Topic Saved!");
    renderSection('content');
}

async function uploadVideo() {
    const chap = document.getElementById('vidChap').value;
    const topic = document.getElementById('vidTopic').value;
    const url = document.getElementById('vidUrl').value;
    const user = JSON.parse(localStorage.getItem('user'));
    if(!chap || !topic || !url) return alert("Fill all!");
    await addDoc(collection(db, "videos"), { subject: user.subject, chapter: chap, topic, url, createdAt: serverTimestamp() });
    alert("Video Uploaded!");
        }
    
