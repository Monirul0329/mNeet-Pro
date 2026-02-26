import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

export async function loadTeacherDashboard(userData) {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="glass p-6 rounded-[2.5rem] border-t-4 border-yellow-500">
                <h2 class="text-2xl font-black text-yellow-500 italic uppercase">${userData.subject}</h2>
                <p class="text-[10px] text-slate-400 font-bold uppercase">Instructor: ${userData.name}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button id="btn-structure" class="p-5 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-layer-group text-yellow-500 mb-2 pointer-events-none"></i>
                    <p class="text-[10px] font-black uppercase pointer-events-none">Structure</p>
                </button>
                <button id="btn-lecture" class="p-5 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-video text-yellow-500 mb-2 pointer-events-none"></i>
                    <p class="text-[10px] font-black uppercase pointer-events-none">Upload Lecture</p>
                </button>
            </div>

            <div id="teacherActionArea" class="min-h-[300px] space-y-4">
                <p class="text-center text-slate-600 text-[10px] uppercase font-bold py-20">Click a button to start</p>
            </div>
        </div>
    `;

    // Event Listeners (Eivabe dile 100% kaj korbe)
    document.getElementById('btn-structure').onclick = () => renderStructure(userData);
    document.getElementById('btn-lecture').onclick = () => renderLecture(userData);
}

async function renderStructure(userData) {
    const area = document.getElementById('teacherActionArea');
    area.innerHTML = `
        <div class="glass p-6 rounded-3xl border border-slate-800 animate-fade-in">
            <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Add Chapter</h3>
            <input type="text" id="chapName" placeholder="Chapter Name" class="input-premium mb-3">
            <button id="saveChap" class="btn-gold py-3 text-[10px]">Save Chapter</button>
            <hr class="my-6 border-slate-800">
            <h3 class="text-xs font-black uppercase text-blue-500 mb-4">Add Topic</h3>
            <select id="chapDrop" class="input-premium mb-3"></select>
            <input type="text" id="topicName" placeholder="Topic Name" class="input-premium mb-3">
            <button id="saveTopic" class="btn-gold py-3 text-[10px] bg-blue-600 border-none">Save Topic</button>
        </div>
    `;
    loadChapters(userData.subject, 'chapDrop');

    document.getElementById('saveChap').onclick = async () => {
        const name = document.getElementById('chapName').value;
        if(!name) return alert("Enter Name");
        await addDoc(collection(db, "structure"), { type:'chapter', name, subject: userData.subject, createdAt: serverTimestamp() });
        alert("Chapter Added!");
        renderStructure(userData);
    };

    document.getElementById('saveTopic').onclick = async () => {
        const chap = document.getElementById('chapDrop').value;
        const topic = document.getElementById('topicName').value;
        if(!chap || !topic) return alert("Fill all");
        await addDoc(collection(db, "structure"), { type:'topic', chapter: chap, name: topic, createdAt: serverTimestamp() });
        alert("Topic Added!");
    };
}

async function renderLecture(userData) {
    const area = document.getElementById('teacherActionArea');
    area.innerHTML = `
        <div class="glass p-6 rounded-3xl border border-slate-800 animate-fade-in">
            <h3 class="text-xs font-black text-yellow-500 uppercase mb-4">Upload Video</h3>
            <select id="vidChap" class="input-premium mb-3"></select>
            <input type="text" id="vidTopic" placeholder="Topic Name" class="input-premium mb-3">
            <input type="text" id="vidUrl" placeholder="YouTube URL (Embed Link)" class="input-premium mb-4">
            <button id="pubVid" class="btn-gold py-4">Publish Lecture</button>
        </div>
    `;
    loadChapters(userData.subject, 'vidChap');

    document.getElementById('pubVid').onclick = async () => {
        const chap = document.getElementById('vidChap').value;
        const topic = document.getElementById('vidTopic').value;
        const url = document.getElementById('vidUrl').value;
        if(!chap || !topic || !url) return alert("Fill all");
        await addDoc(collection(db, "videos"), { subject: userData.subject, chapter: chap, topic, url, createdAt: serverTimestamp() });
        alert("Video Published!");
    };
}

async function loadChapters(subject, elementId) {
    const q = query(collection(db, "structure"), where("subject", "==", subject), where("type", "==", "chapter"));
    const snap = await getDocs(q);
    const drop = document.getElementById(elementId);
    drop.innerHTML = `<option value="">Select Chapter</option>`;
    snap.forEach(doc => { drop.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`; });
            }
