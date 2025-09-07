
const qs  = (sel) => document.querySelector(sel);
const qsa = (sel) => document.querySelectorAll(sel);


const shell       = qs('#chat-shell');
const chatMsgs    = qs('#chat-messages');
const chatForm    = qs('#chat-form');
const chatInput   = qs('#chat-input');
const sendBtn     = qs('#send-button');
const sendIcon    = qs('#send-icon');
const sendSpin    = qs('#send-spin');

const currentYear = (() => {
  const el = qs('#current-year');
  if (el) el.textContent = new Date().getFullYear();
})();


const autoGrow = () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 220) + 'px';
};
chatInput?.addEventListener('input', autoGrow);
autoGrow();


function addMsg(sender, text) {
  const wrap = document.createElement('div');
  wrap.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

  const bubble = document.createElement('div');
  bubble.className = `relative p-3 rounded-2xl max-w-[80%] shadow-lg
                      ${sender === 'user'
                          ? 'bg-[#8E7AEF] text-[#0B0C0E] rounded-br-none'
                          : 'bg-[#151618] text-neutral-300 rounded-bl-none'}`;
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}


function typingDots() {
  const wrap = document.createElement('div');
  wrap.className = 'flex justify-start';
  const bubble = document.createElement('div');
  bubble.className = 'typing';
  bubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  wrap.appendChild(bubble);
  return wrap;
}


function setGenerating(on) {
  shell.classList.toggle('generating', on);
  chatInput.classList.toggle('disabled', on);
  sendBtn.classList.toggle('disabled', on);
  sendIcon.classList.toggle('hidden', on);
  sendSpin.classList.toggle('hidden', !on);
}

/* --------------------------- GEMINI API CALL --------------------------- */
/**
 * IMPORTANT:
 * Do NOT expose API keys in frontend in production.
 * Proxy this request via your backend (Node/FastAPI) and keep the key server-side.
 */
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
// Put placeholder here; in production, remove and call your own backend route instead.
const GEMINI_API_KEY = ''; // <-- Replace via backend proxy or environment, not in client!

async function callGemini(userText) {
  const systemPrompt = `
You are a friendly and professional "CoWorker" AI expert.
Guide the user to define a new enterprise AI worker.
Ask concise follow-ups to clarify:
- Role/department
- Core systems to integrate (Salesforce, SAP, Workday, Slack, Monday)
- 3–5 repetitive tasks/workflows it should automate
Keep responses short, specific, and conversational. Do not output code.`;

  const payload = {
    contents: [{ parts: [{ text: `User: ${userText}` }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
         || "Let's clarify: which core systems should this CoWorker integrate with, and what 3–5 tasks will it own?";
}


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
  chatMsgs.scrollTop = chatMsgs.scrollHeight;

  try {
    let reply = '';
    if (!GEMINI_API_KEY) {

      await new Promise(r => setTimeout(r, 1000));
      reply = "Great—Which core systems (e.g., Salesforce, SAP, Monday, Slack) should this CoWorker connect to, and which 3–5 repetitive tasks should it take over?";
    } else {
      reply = await callGemini(text);
    }
    dots.remove();
    addMsg('ai', reply);
  } catch (err) {
    console.error(err);
    dots.remove();
    addMsg('ai', 'There was an issue contacting the AI. Please try again.');
  } finally {
    setGenerating(false);
  }
});


const workerCardsContainer = qs('#worker-cards');
const workspaceGrid       = qs('#workspace-grid-view');
const workerDetailView    = qs('#worker-detail-view');
const createModal         = qs('#create-modal');
const createForm          = qs('#create-form');
const cancelCreateButton  = qs('#cancel-create');


const defaultWorkers = [
  {
    id: 'it',
    department: 'IT',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="14" rx="2"/>
        <path d="M12 20v-2"/>
      </svg>`,
    skills: ['On/Offboarding', 'IAM', 'Password reset', 'Software provisioning', 'Helpdesk Q&A'],
    overview:
      'The IT CoWorker automates core IT operations, reduces ticket load, and powers self-serve support.',
    workflows: ['User Provisioning', 'License Management', 'Tier-1 Ticket Resolution'],
    tasks: ['Create user', 'Reset password', 'Assign license', 'Check inventory'],
    onboarding: '1–3 months with Engini engineer for integrations & flows.'
  },
  {
    id: 'procurement',
    department: 'Procurement',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7h18M6 7l1.5 12h9L18 7"/>
        <circle cx="9" cy="20" r="1"/>
        <circle cx="15" cy="20" r="1"/>
      </svg>`,
    skills: ['Vendor onboarding', 'PO tracking', 'Inventory checks', 'Approvals'],
    overview:
      'The Procurement CoWorker streamlines purchasing & vendor management and enforces policy compliance.',
    workflows: ['PO Creation', 'Vendor Verification', 'Expense Approvals'],
    tasks: ['Process PR', 'Track PO', 'Inventory check', 'Notify vendor'],
    onboarding: '2–4 months with mapping of procurement pipeline.'
  },
  {
    id: 'hr',
    department: 'HR',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="7" r="4"/>
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
      </svg>`,
    skills: ['Onboarding', 'Policy Q&A', 'Training', 'Leave mgmt'],
    overview:
      'The HR CoWorker handles repetitive HR tasks, policy lookups and helps employees self-serve.',
    workflows: ['New Hire Automation', 'Policy Lookup', 'Leave Requests'],
    tasks: ['Create employee profile', 'Answer policy', 'Update training'],
    onboarding: '1–2 months and ongoing policy updates.'
  },
  {
    id: 'sales',
    department: 'Sales',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 17 9 11 13 15 21 7"/>
        <polyline points="14 7 21 7 21 14"/>
      </svg>`,
    skills: ['Lead qual', 'CRM updates', 'Reporting', 'Follow-ups'],
    overview:
      'The Sales CoWorker automates admin across the pipeline so reps can focus on closing.',
    workflows: ['Lead Scoring', 'CRM Sync', 'Forecasting'],
    tasks: ['Log new lead', 'Update record', 'Generate report', 'Send follow-up'],
    onboarding: '2–3 months to integrate CRM & sales stack.'
  },
  {
    id: 'create-your-own',
    department: 'Create Your Own',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>`,
    skills: ['Define role', 'Select systems', 'Define tasks'],
    overview:
      'Start from a blank template. Describe role, source systems, and repetitive tasks to automate.',
    isCustom: true
  }
];


const loadCustomWorkers = () => {
  try { return JSON.parse(localStorage.getItem('customWorkers') || '[]'); }
  catch { return []; }
};
const saveCustomWorker = (w) => {
  const arr = loadCustomWorkers();
  arr.push(w);
  localStorage.setItem('customWorkers', JSON.stringify(arr));
};


function renderCards(workers = null) {
  workerCardsContainer.innerHTML = '';
  const all = workers || [...defaultWorkers, ...loadCustomWorkers()];

  all.forEach(worker => {
    const isCustom = !!worker.isCustom;

    const card = document.createElement('div');
    card.className = [
      'group relative rounded-2xl border border-white/10 bg-[#151618]',
      'hover:border-white/20 transition shadow-lg p-5 flex flex-col h-full min-h-[260px]'
    ].join(' ');

    const iconWrap = `
      <div class="w-10 h-10 rounded-full bg-[#222326] grid place-items-center border border-white/10">
        ${worker.icon}
      </div>
    `;

    const badge = `
      <span class="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full
                   bg-white/5 text-neutral-300 border border-white/10">
        AI Worker
      </span>
    `;

    const skills = (worker.skills || []).slice(0, 4)
      .map(s => `<li class="text-sm text-neutral-400">${s}</li>`)
      .join('');

    const more = (worker.skills && worker.skills.length > 4)
      ? `<li class="text-sm text-neutral-500">…</li>` : '';

    const ctaLabel = isCustom ? 'Start Customization' : 'View Details';

    card.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        ${iconWrap}
        <h3 class="font-poppins text-base font-semibold text-white">${worker.department}</h3>
      </div>
      <div class="mb-3">${badge}</div>
      <p class="text-sm text-neutral-400 line-clamp-2 mb-3">${worker.overview || ''}</p>
      <ul class="list-disc list-inside space-y-1 mb-4">${skills}${more}</ul>
      <div class="mt-auto">
        <button class="w-full text-center text-[#0F1012] bg-neutral-200 hover:bg-white font-medium
                       px-3 py-2 rounded-xl border border-black/10 transition">
          ${ctaLabel}
        </button>
      </div>
    `;

    if (isCustom) {
      card.style.borderStyle = 'dashed';
    }

    card.addEventListener('click', (e) => {
      if (isCustom) {
        createModal.classList.remove('hidden');
        createModal.classList.add('flex');
      } else {
        renderDetailView(worker);
      }
    });

    workerCardsContainer.appendChild(card);
  });
}


function renderDetailView(worker) {
  workspaceGrid.classList.add('hidden');
  workerDetailView.classList.remove('hidden');

  const iconWrap = `
    <div class="w-12 h-12 rounded-full bg-[#222326] grid place-items-center border border-white/10">
      ${worker.icon}
    </div>
  `;

  workerDetailView.innerHTML = `
    <div class="bg-[#151618] border border-white/10 rounded-2xl p-6 shadow-2xl">
      <button id="back-button"
              class="text-neutral-200 hover:text-white font-medium flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Workspace
      </button>

      <div class="flex items-center gap-4 mb-5">
        ${iconWrap}
        <div>
          <h2 class="text-2xl font-poppins font-semibold text-white">${worker.department} CoWorker</h2>
          <span class="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full
                       bg-white/5 text-neutral-300 border border-white/10 mt-1">AI Worker</span>
        </div>
      </div>

      <div class="border-b border-white/10 mb-4">
        <nav class="flex gap-3 overflow-x-auto">
          <button data-tab="overview"
                  class="tab-btn py-2 px-3 border-b-2 border-white text-white font-medium">
            Overview
          </button>
          <button data-tab="skills"
                  class="tab-btn py-2 px-3 border-b-2 border-transparent text-neutral-400 hover:text-white">
            Skills
          </button>
          <button data-tab="workflows"
                  class="tab-btn py-2 px-3 border-b-2 border-transparent text-neutral-400 hover:text-white">
            Workflows
          </button>
          <button data-tab="tasks"
                  class="tab-btn py-2 px-3 border-b-2 border-transparent text-neutral-400 hover:text-white">
            Tasks
          </button>
          <button data-tab="onboarding"
                  class="tab-btn py-2 px-3 border-b-2 border-transparent text-neutral-400 hover:text-white">
            Onboarding Plan
          </button>
        </nav>
      </div>

      <div id="tab-content" class="p-4 rounded-xl bg-[#0F1012] border border-white/10 text-neutral-200">
        <p>${worker.overview || ''}</p>
      </div>
    </div>
  `;

  qs('#back-button').addEventListener('click', () => {
    workerDetailView.classList.add('hidden');
    workspaceGrid.classList.remove('hidden');
  });

  qsa('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      qsa('.tab-btn').forEach(b => {
        b.classList.remove('border-white', 'text-white');
        b.classList.add('border-transparent', 'text-neutral-400');
      });
      e.currentTarget.classList.add('border-white', 'text-white');
      e.currentTarget.classList.remove('border-transparent', 'text-neutral-400');

      const tab = e.currentTarget.getAttribute('data-tab');
      const content = qs('#tab-content');
      let html = '';

      if (tab === 'overview') {
        html = `<p>${worker.overview || ''}</p>`;
      } else if (tab === 'skills') {
        html = `<ul class="list-disc list-inside space-y-2 text-neutral-300">
                  ${(worker.skills || []).map(s => `<li>${s}</li>`).join('')}
                </ul>`;
      } else if (tab === 'workflows') {
        html = `<ul class="list-disc list-inside space-y-2 text-neutral-300">
                  ${(worker.workflows || []).map(w => `<li>${w}</li>`).join('')}
                </ul>`;
      } else if (tab === 'tasks') {
        html = `<ul class="list-disc list-inside space-y-2 text-neutral-300">
                  ${(worker.tasks || []).map(t => `<li>${t}</li>`).join('')}
                </ul>`;
      } else if (tab === 'onboarding') {
        html = `<p>${worker.onboarding || 'Onboarding plan not defined.'}</p>`;
      }
      content.innerHTML = html;
    });
  });
}


const searchInput = qs('#search-input');

searchInput?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const all = [...defaultWorkers, ...loadCustomWorkers()];
  const filtered = all.filter(w =>
    w.department.toLowerCase().includes(term) ||
    (w.skills || []).some(s => s.toLowerCase().includes(term))
  );
  renderCards(filtered);
});

createForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const dep    = qs('#new-department').value.trim();
  const skills = qs('#new-skills').value.split(',').map(s => s.trim()).filter(Boolean);
  const ov     = qs('#new-overview').value.trim();

  const newWorker = {
    id: 'custom-' + Date.now(),
    department: dep,
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-neutral-200" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M8 12l2.5 2.5 4.5-4.5"/>
      </svg>`,
    skills,
    overview: ov,
    isCustom: false,
    workflows: ['User-defined workflow'],
    tasks: ['User-defined task'],
    onboarding: 'Will be defined based on your requirements.'
  };

  saveCustomWorker(newWorker);
  createModal.classList.add('hidden');
  createForm.reset();
  renderCards();
});

cancelCreateButton?.addEventListener('click', () => {
  createModal.classList.add('hidden');
  createForm.reset();
});
document.addEventListener("DOMContentLoaded", () => {
  const placeholders = [
    "Craft your CoWorker...",
    "Define worker scope...",
    "Automate tasks...",
    "Integrate with systems...",
    "Build a custom workflow..."
  ];
  let i = 0, j = 0, isDeleting = false;

  const typeEffect = () => {
    const current = placeholders[i];
    const display = current.substring(0, j);
    chatInput.placeholder = display;

    if (!isDeleting && j < current.length) {
      j++;
    } else if (isDeleting && j > 0) {
      j--;
    } else {
      if (!isDeleting) {
        isDeleting = true;
        setTimeout(typeEffect, 1200); 
        return;
      } else {
        isDeleting = false;
        i = (i + 1) % placeholders.length;
      }
    }
    setTimeout(typeEffect, isDeleting ? 50 : 100);
  };

  typeEffect();
});


renderCards();
