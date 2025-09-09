       /* ----------------- HELPERS ----------------- */
const qs  = (sel) => document.querySelector(sel);
const qsa = (sel) => document.querySelectorAll(sel);

/* Elements */
const homeSection = qs('#home-section');
const myWorkersSection = qs('#my-workers-section');
const shell       = qs('#chat-shell');
const chatMsgs    = qs('#chat-messages');
const chatForm    = qs('#chat-form');
const chatInput   = qs('#chat-input');
const sendBtn     = qs('#send-button');
const sendIcon    = qs('#send-icon');
const sendSpin    = qs('#send-spin');

const workerCardsContainer = qs('#worker-cards');
const workspaceGrid       = qs('#workspace-grid-view');
const workerDetailView    = qs('#worker-detail-view');
const createModal         = qs('#create-modal');
const createForm          = qs('#create-form');
const cancelCreateButton  = qs('#cancel-create');
const myWorkersContainer = qs('#my-workers-container');


(() => {
  const el = qs('#current-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* Auto-grow input */
const autoGrow = () => {
  if (!chatInput) return;
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 220) + 'px';
};
chatInput?.addEventListener('input', autoGrow);

/* ----------------- CHAT ----------------- */
/**
 * Adds a chat message to the UI.
 * @param {string} sender - The sender of the message ('user' or 'ai').
 * @param {string} text - The content of the message.
 */
function addMsg(sender, text) {
  const wrap = document.createElement('div');
  wrap.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

  const bubble = document.createElement('div');
  bubble.className = `relative p-3 rounded-2xl max-w-[80%] shadow-lg whitespace-pre-wrap
                      ${sender === 'user'
                          ? 'bg-[#8E7AEF] text-[#0B0C0E] rounded-br-none'
                          : 'bg-[#151618] text-neutral-300 rounded-bl-none'}`;
  
  // Animation for AI messages
  if (sender === 'ai') {
    let i = 0;
    const speed = 15;
    const interval = setInterval(() => {
      bubble.textContent = text.substring(0, i);
      i++;
      if (i > text.length) clearInterval(interval);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }, speed);
  } else {
    bubble.textContent = text;
  }

  wrap.appendChild(bubble);
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

/**
 * Creates and appends a typing indicator.
 */
function typingDots() {
  const wrap = document.createElement('div');
  wrap.className = 'flex justify-start';
  const bubble = document.createElement('div');
  bubble.className = 'typing';
  bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  wrap.appendChild(bubble);
  return wrap;
}

/**
 * Toggles the "generating" state for UI elements.
 * @param {boolean} on - Whether generation is in progress.
 */
function setGenerating(on) {
  shell?.classList.toggle('generating', on);
  chatInput?.classList.toggle('disabled', on);
  chatInput.disabled = on;
  sendBtn?.classList.toggle('disabled', on);
  sendBtn.disabled = on;
  sendIcon?.classList.toggle('hidden', on);
  sendSpin?.classList.toggle('hidden', !on);
}

/* ----------------- STATE MACHINE FOR COWORKER ----------------- */
let draftWorker = {
  department: "",
  team: "",
  deliverable: "",
  workflows: [],
  tasks: [],
  systems: [],
  overview: "",
  onboarding: ""
};
let convoStep = 0;

const steps = [
  "Great! First, which department is this Worker for?",
  "Nice. Which team inside that department?",
  "Got it. What is the key deliverable this worker should own?",
  "List 2–3 workflows this worker should automate (comma separated).",
  "Perfect. What are the main tasks? (comma separated).",
  "Which core systems should it integrate with? (comma separated).",
  "Write a short overview of this worker.",
  "Finally, describe the onboarding plan briefly."
];

/* Save finished worker */
/**
 * Finalizes the draft worker and saves it to local storage.
 */
function finalizeWorker() {
  const worker = {
    id: 'custom-' + Date.now(),
    department: draftWorker.department,
    role: draftWorker.team || "Custom Role",
    deliverable: draftWorker.deliverable,
    workflows: draftWorker.workflows,
    tasks: draftWorker.tasks,
    systems: draftWorker.systems,
    overview: draftWorker.overview,
    onboarding: draftWorker.onboarding,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l2.5 2.5 4.5-4.5"/></svg>`
  };
  const arr = JSON.parse(localStorage.getItem('customWorkers') || '[]');
  arr.push(worker);
  localStorage.setItem('customWorkers', JSON.stringify(arr));
  addMsg("ai", "✅ Your Worker has been created and saved! Check it out under 'My Workers'.");
  draftWorker = {}; // reset
  convoStep = 0;
}

/* Handle chat form */
chatForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addMsg('user', text);
  chatInput.value = '';
  autoGrow();

  setGenerating(true);
  const dots = typingDots();
  chatMsgs.appendChild(dots);

  setTimeout(() => {
    dots.remove();
    switch (convoStep) {
      case 0: draftWorker.department = text; break;
      case 1: draftWorker.team = text; break;
      case 2: draftWorker.deliverable = text; break;
      case 3: draftWorker.workflows = text.split(',').map(s => s.trim()); break;
      case 4: draftWorker.tasks = text.split(',').map(s => s.trim()); break;
      case 5: draftWorker.systems = text.split(',').map(s => s.trim()); break;
      case 6: draftWorker.overview = text; break;
      case 7: draftWorker.onboarding = text; finalizeWorker(); return;
    }
    addMsg('ai', steps[convoStep]);
    convoStep++;
    setGenerating(false);
  }, 800);
});

/* ----------------- DEFAULT WORKERS ----------------- */
const defaultWorkers = [
  {
    id: "it",
    department: "IT",
    overview: "Automates IT ops, reduces ticket load, and powers self-serve support.",
    skills: ["Onboarding/Offboarding", "IAM", "Password reset", "Helpdesk Q&A"],
    workflows: ["User Provisioning", "Software License Management", "Tier-1 Ticket Resolution"],
    systems: ["Active Directory", "Jira", "ServiceNow"],
    tasks: ["Create user", "Reset password", "Assign software", "Check asset inventory"],
    onboarding: "1–3 months with a dedicated Engini engineer assigned to configure system integrations and workflows.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M12 20v-2"/></svg>`
  },
  {
    id: "hr",
    department: "HR",
    overview: "Handles repetitive HR tasks, provides instant support to employees, and helps them self-serve.",
    skills: ["Employee onboarding", "Policy Q&A", "Training", "Leave management"],
    workflows: ["New Hire Automation", "Policy Lookup", "Leave Request Processing"],
    systems: ["Workday", "SAP SuccessFactors", "Slack"],
    tasks: ["Create employee profile", "Answer policy question", "Update training record", "Process leave request"],
    onboarding: "1–2 months for initial setup, with ongoing support for new policies and procedures.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></svg>`
  },
  {
    id: "sales",
    department: "Sales",
    overview: "Automates administrative tasks across the pipeline so reps can focus on closing deals.",
    skills: ["Lead qualification", "CRM entry", "Sales reporting", "Follow-up reminders"],
    workflows: ["Automated Lead Scoring", "CRM Data Synchronization", "Sales Forecast Reporting"],
    systems: ["Salesforce", "HubSpot", "Slack", "Outreach"],
    tasks: ["Log new lead", "Update CRM record", "Generate sales report", "Send follow-up email"],
    onboarding: "2–3 months to integrate with your existing CRM and sales platforms.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>`
  },
  {
    id: "marketing",
    department: "Marketing",
    overview: "Enhances marketing efforts by automating content distribution, data analysis, and lead management.",
    skills: ["Content scheduling", "Social media management", "Campaign reporting", "Lead capture"],
    workflows: ["Social Media Content Automation", "Marketing Campaign Performance Analysis", "Lead Nurturing Sequences"],
    systems: ["Marketo", "Mailchimp", "Sprout Social"],
    tasks: ["Schedule social media post", "Track campaign metrics", "Capture lead info", "Send personalized email"],
    onboarding: "1–2 months to integrate with your marketing platforms and define content strategies.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-8h2v6h-2z" /></svg>`
  },
  {
    id: "legal",
    department: "Legal",
    overview: "Automates routine legal tasks, improving efficiency and ensuring compliance with regulations and internal policies.",
    skills: ["Contract review", "Compliance checks", "Document drafting", "NDA management"],
    workflows: ["Automated NDA Generation", "Contract Clause Review", "Regulatory Compliance Reporting"],
    systems: ["DocuSign", "Ironclad", "LegalZoom"],
    tasks: ["Draft legal document", "Review contract for key terms", "Check for compliance", "Generate report"],
    onboarding: "3–5 months for complex legal integrations and defining specific compliance workflows.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M13 2v7h7" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>`
  },
  {
    id: "support",
    department: "Support",
    overview: "Automates customer service tasks, providing quick responses and efficient ticket management to improve satisfaction.",
    skills: ["Ticket triaging", "Customer Q&A", "Issue tracking", "Knowledge base search"],
    workflows: ["Automated Ticket Triage", "Self-service Knowledge Base"],
    systems: ["Zendesk", "Freshdesk", "Intercom"],
    tasks: ["Triage support ticket", "Answer common questions", "Log issue", "Find knowledge base article"],
    onboarding: "2–3 months to integrate with your helpdesk and define support workflows.",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>`
  },
  {
    id: "create",
    department: "Create Your Own",
    overview: "Start from a blank template. Describe role, source systems, and repetitive tasks to automate.",
    isCustom: true,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
  }
];

/* ----------------- RENDER FUNCTIONS ----------------- */
/**
 * Loads custom workers from local storage.
 */
function loadCustomWorkers() {
  try {
    return JSON.parse(localStorage.getItem('customWorkers') || '[]');
  } catch {
    return [];
  }
}

/**
 * Saves a new custom worker to local storage.
 * @param {object} worker - The worker object to save.
 */
function saveCustomWorker(worker) {
  const arr = loadCustomWorkers();
  arr.push(worker);
  localStorage.setItem('customWorkers', JSON.stringify(arr));
}

/**
 * Renders the worker cards in the workspace.
 * @param {Array<Object>} workers - Optional array of workers to render.
 */
function renderCards(workers = null) {
  workerCardsContainer.innerHTML = '';
  const all = workers || [...defaultWorkers, ...loadCustomWorkers()];
  all.forEach(worker => {
    const isCustom = !!worker.isCustom;
    const card = document.createElement('div');
    card.className = "rounded-2xl border border-white/10 bg-[#151618] p-5 flex flex-col shadow-lg transition-transform hover:scale-[1.02] cursor-pointer";
    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 grid place-items-center bg-[#222326] rounded-full">${worker.icon}</div>
        <h3 class="font-poppins font-semibold text-white">${worker.department}</h3>
      </div>
      <p class="text-sm text-neutral-400 mb-3">${worker.overview || ''}</p>
      <button class="mt-auto bg-neutral-200 text-[#0B0C0E] rounded-xl px-3 py-2 w-full font-semibold">${isCustom ? 'Start Customization' : 'View Details'}</button>
    `;
    card.addEventListener("click", () => {
      if (isCustom) {
        // If it's a "Create Your Own" card, reset and start a new chat flow
        chatMsgs.innerHTML = '';
        draftWorker = {};
        convoStep = 0;
        addMsg("ai", "Let's build a new Worker together! " + steps[0]);
      } else {
        // If it's a default worker, show the detail view
        renderDetailView(worker);
      }
    });
    workerCardsContainer.appendChild(card);
  });
}

/**
 * Renders the detail view for a specific worker.
 * @param {object} worker - The worker object to display.
 */
function renderDetailView(worker) {
    workspaceGrid.classList.add("hidden");
    workerDetailView.classList.remove("hidden");
    workerDetailView.innerHTML = `
        <div class="bg-[#151618] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button id="back-button" class="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Back to Workspace
            </button>
            <h2 class="text-2xl font-poppins text-white mb-2">${worker.department} Worker</h2>
            <p class="text-neutral-400 mb-4">${worker.overview || ''}</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                <div class="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 class="text-white font-semibold mb-2">Systems</h3>
                    <ul class="list-disc list-inside text-neutral-300">${(worker.systems || []).map(s => `<li>${s}</li>`).join('') || '<li>Not specified</li>'}</ul>
                </div>
                <div class="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 class="text-white font-semibold mb-2">Workflows</h3>
                    <ul class="list-disc list-inside text-neutral-300">${(worker.workflows || []).map(s => `<li>${s}</li>`).join('') || '<li>Not specified</li>'}</ul>
                </div>
                <div class="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 class="text-white font-semibold mb-2">Skills</h3>
                    <ul class="list-disc list-inside text-neutral-300">${(worker.skills || []).map(s => `<li>${s}</li>`).join('') || '<li>Not specified</li>'}</ul>
                </div>
            </div>
            
            <button id="customize-button" class="bg-[#8E7AEF] text-[#0B0C0E] font-semibold px-6 py-2 rounded-xl hover:bg-[#7c6ae6]">Customize this Worker</button>
        </div>
    `;

    // Handle button to go back to the main workspace
    qs("#back-button")?.addEventListener("click", () => {
        workerDetailView.classList.add("hidden");
        workspaceGrid.classList.remove("hidden");
    });
    
    // Handle "Customize" button to start a new chat with pre-populated data
    qs("#customize-button")?.addEventListener("click", () => {
        // Pre-populate the draft worker with the template data
        Object.assign(draftWorker, worker);
        chatMsgs.innerHTML = ''; // Clear chat history for a clean start
        addMsg("ai", `Starting a new Worker based on the ${worker.department} template. ` + steps[0]);
        convoStep = 0;
        workerDetailView.classList.add("hidden");
        workspaceGrid.classList.remove("hidden");
    });
}

/**
 * Renders the "My Workers" page with custom-created workers.
 */
function renderMyWorkers() {
  const myWorkersContainer = qs('#my-workers-container');
  const myWorkers = loadCustomWorkers();
  myWorkersContainer.innerHTML = '';
  if (!myWorkers.length) {
    myWorkersContainer.innerHTML = "<p class='text-neutral-400 text-sm'>You haven't created any digital Workers yet. Try crafting one using the assistant or a template!</p>";
    return;
  }
  myWorkers.forEach(w => {
    const card = document.createElement('div');
    card.className = 'bg-[#1a1b1e] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col transition-transform hover:scale-[1.02]';
    card.innerHTML = `
      <div class="mb-4">
        <h3 class="text-xl font-semibold text-white mb-1">${w.department || 'Unnamed Worker'}</h3>
      </div>
      <p class="text-sm text-neutral-300 mb-4">${w.overview || 'No overview provided.'}</p>
      ${w.tasks?.length ? `
        <div class="mb-4">
          <h4 class="text-sm font-semibold text-neutral-400 mb-1">Tasks:</h4>
          <ul class="list-disc list-inside text-sm text-neutral-200 space-y-1">${w.tasks.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>` : ''}
      <button class="delete-btn bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded-xl self-start">Delete</button>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      const updatedWorkers = myWorkers.filter(x => x.id !== w.id);
      localStorage.setItem('customWorkers', JSON.stringify(updatedWorkers));
      renderMyWorkers();
    });
    myWorkersContainer.appendChild(card);
  });
}

/* ----------------- INIT ----------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Initial render of the main workspace cards



  renderCards();
});


