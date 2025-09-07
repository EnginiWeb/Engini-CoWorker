
  // ---------- Worker Catalog (dark cards, consistent size) ----------
  const workerCardsContainer = document.getElementById('worker-cards');
  const workspaceGrid       = document.getElementById('workspace-grid-view');
  const workerDetailView    = document.getElementById('worker-detail-view');
  const createModal         = document.getElementById('create-modal');
  const createForm          = document.getElementById('create-form');
  const cancelCreateButton  = document.getElementById('cancel-create');

  // Base workers (you can edit text/icons). Kept minimal and consistent.
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

  // Save/load custom workers
  const loadCustomWorkers = () => {
    try {
      const raw = localStorage.getItem('customWorkers');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };
  const saveCustomWorker = (w) => {
    const arr = loadCustomWorkers();
    arr.push(w);
    localStorage.setItem('customWorkers', JSON.stringify(arr));
  };

  // Render Grid Cards (dark, consistent size)
  function renderCards() {
    workerCardsContainer.innerHTML = '';
    const all = [...defaultWorkers, ...loadCustomWorkers()];

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

      const skills = (worker.skills || []).slice(0,4)
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
        card.classList.add('border-dashed');
        card.style.borderStyle = 'dashed';
      }

      card.addEventListener('click', (e) => {
        const isButton = e.target.closest('button');
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

  // Dark Detail View
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

    document.getElementById('back-button').addEventListener('click', () => {
      workerDetailView.classList.add('hidden');
      workspaceGrid.classList.remove('hidden');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('border-white', 'text-white');
          b.classList.add('border-transparent', 'text-neutral-400');
        });
        e.currentTarget.classList.add('border-white', 'text-white');
        e.currentTarget.classList.remove('border-transparent', 'text-neutral-400');

        const tab = e.currentTarget.getAttribute('data-tab');
        const content = document.getElementById('tab-content');
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

  // Modal actions
  if (createForm) {
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dep   = document.getElementById('new-department').value.trim();
      const skills= document.getElementById('new-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      const ov    = document.getElementById('new-overview').value.trim();

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
      renderCards();
      createForm.reset();
    });
  }

  if (cancelCreateButton) {
    cancelCreateButton.addEventListener('click', () => {
      createModal.classList.add('hidden');
      createForm.reset();
    });
  }

  // Initial render
  renderCards();
