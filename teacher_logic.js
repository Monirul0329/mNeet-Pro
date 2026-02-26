import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ১. টিচার ড্যাশবোর্ড রেন্ডার করা (PW Style)
export async function loadTeacherDashboard(userData) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="glass p-6 rounded-[2.5rem] border-t-4 border-yellow-500 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-black text-yellow-500 italic uppercase">${userData.subject}</h2>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instructor: ${userData.name}</p>
                </div>
                <div class="text-right">
                    <p class="text-[9px] text-slate-500 uppercase font-black">Location</p>
                    <p class="text-xs font-bold text-white">${userData.city}</p>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <button onclick="window.showTeacherSection('content')" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-layer-group text-yellow-500 mb-2"></i>
                    <p class="text-[8px] font-black uppercase">Structure</p>
                </button>
                <button onclick="window.showTeacherSection('quiz')" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-images text-yellow-500 mb-2"></i>
                    <p class="text-[8px] font-black uppercase">Bulk Quiz</p>
                </button>
                <button onclick="window.showTeacherSection('video')" class="p-3 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-video text-yellow-500 mb-2"></i>
                    <p class="text-[8px] font-black uppercase">Lecture</p>
                </button>
            </div>

            <div id="teacherActionArea" class="space-y-4">
                <p class="text-center text-slate-600 text-[10px] uppercase font-bold py-10">Select an action to start managing</p>
            </div>
        </div>
    `;
}

// ২. সেকশন কন্ট্রোল
window.showTeacherSection = async (type) => {
    const area = document.getElementById('teacherActionArea');
    
    if(type === 'content') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Create New Structure</h3>
                <input type="text" id="newChap" placeholder="Enter Chapter Name" class="input-premium mb-3">
                <button onclick="window.saveChapter()" class="btn-gold py-3 text-[10px]">Add Chapter</button>
                <hr class="my-6 border-slate-800">
                <select id="chapSelect" class="input-premium mb-3"></select>
                <input type="text" id="newTopic" placeholder="Enter Topic Name" class="input-premium mb-3">
                <button onclick="window.saveTopic()" class="btn-gold py-3 text-[10px] bg-blue-600 text-white">Add Topic</button>
            </div>
        `;
        loadChapterDropdown('chapSelect');
    } 
    
    else if(type === 'quiz') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Bulk Image Quiz Upload</h3>
                <select id="quizChap" class="input-premium mb-3" onchange="window.updateQuizTopics()"></select>
                <select id="quizTopic" class="input-premium mb-3"></select>
                <div class="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-center mb-4">
                    <input type="file" id="bulkImages" multiple accept="image/*" class="hidden">
                    <label for="bulkImages" class="cursor-pointer text-slate-500 text-[10px] font-bold uppercase">
                        <i class="fas fa-cloud-upload-alt text-2xl mb-2 block"></i> Select Multiple JPEG Questions
                    </label>
                </div>
                <select id="correctAns" class="input-premium mb-4">
                    <option value="A">Correct Option: A</option>
                    <option value="B">Correct Option: B</option>
                    <option value="C">Correct Option: C</option>
                    <option value="D">Correct Option: D</option>
                </select>
                <button onclick="window.uploadBulkQuiz()" class="btn-gold py-4">Publish to Students</button>
            </div>
        `;
        loadChapterDropdown('quizChap');
    }

    else if(type === 'video') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black text-yellow-500 uppercase mb-4">Upload New Lecture</h3>
                <select id="vidChap" class="input-premium mb-3" onchange="window.updateVidTopics()"></select>
                <select id="vidTopic" class="input-premium mb-3"></select>
                <input type="text" id="vidUrl" placeholder="YouTube Embed Link" class="input-premium mb-4">
                <div class="flex items-center gap-3 p-3 bg-black rounded-xl border border-slate-800 mb-4">
                    <input type="checkbox" id="isLiveToggle" class="w-5 h-5 accent-yellow-500">
                    <label class="text-[10px] font-black text-white uppercase italic">Mark as LIVE Class</label>
                </div>
                <button onclick="window.handleVideoUpload()" class="btn-gold py-4">Publish Video</button>
            </div>
        `;
        loadChapterDropdown('vidChap');
    }
};

// ৩. ড্রপডাউন লোডার
async function loadChapterDropdown(elementId) {
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

// ৪. ভিডিও আপলোড লজিক
window.handleVideoUpload = async () => {
    const chap = document.getElementById('vidChap').value;
    const topic = document.getElementById('vidTopic').value;
    const url = document.getElementById('vidUrl').value;
    const isLive = document.getElementById('isLiveToggle').checked;
    const user = JSON.parse(localStorage.getItem('user'));

    if(!chap || !topic || !url) return alert("Fill all fields!");

    await addDoc(collection(db, "videos"), {
        subject: user.subject,
        chapter: chap,
        topic: topic,
        url: url,
        isLive: isLive,
        createdAt: serverTimestamp()
    });
    alert("Video Uploaded!");
};

// ৫. চ্যাপ্টার সেভ লজিক
window.saveChapter = async () => {
    const name = document.getElementById('newChap').value;
    const user = JSON.parse(localStorage.getItem('user'));
    await addDoc(collection(db, "structure"), {
        type: 'chapter',
        name: name,
        subject: user.subject,
        createdAt: serverTimestamp()
    });
    alert("Chapter Added!");
    showTeacherSection('content');
};
