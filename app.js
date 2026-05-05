// ===== Omnitrix Mission Selector App =====

(function () {
    'use strict';

    // --- DOM ---
    const dialRing = document.getElementById('dial-ring');
    const coreIcon = document.getElementById('core-icon');
    const coreName = document.getElementById('core-name');
    const coreStatus = document.getElementById('core-status');
    const rotateLeft = document.getElementById('rotate-left');
    const rotateRight = document.getElementById('rotate-right');
    const actionBtn = document.getElementById('action-btn');
    const actionText = actionBtn.querySelector('.action-text');
    const totalCount = document.getElementById('total-count');
    const activeCountEl = document.getElementById('active-count');
    const doneCount = document.getElementById('done-count');
    const missionList = document.getElementById('mission-list');
    const emptyLog = document.getElementById('empty-log');
    const addMissionBtn = document.getElementById('add-mission-btn');
    const addForm = document.getElementById('add-form');
    const missionInput = document.getElementById('mission-input');
    const iconSelect = document.getElementById('mission-icon-select');
    const confirmAdd = document.getElementById('confirm-add');
    const cancelAdd = document.getElementById('cancel-add');
    const flash = document.getElementById('activation-flash');
    const watchEl = document.getElementById('omnitrix-watch');
    const particlesContainer = document.getElementById('particles');

    // --- State ---
    const STORAGE_KEY = 'omnitrix-missions';
    let missions = [];
    let selectedIndex = 0;

    // --- Default missions ---
    const DEFAULT_MISSIONS = [
        { name: 'RUNNING', icon: '🏃', completed: false },
        { name: 'PUSHUPS', icon: '💪', completed: false },
        { name: 'SQUATS', icon: '🦵', completed: false },
        { name: 'PLANK', icon: '🧘', completed: false },
        { name: 'JUMPING JACKS', icon: '⭐', completed: false },
        { name: 'WEIGHT LIFT', icon: '🏋️', completed: false },
        { name: 'CYCLING', icon: '🚴', completed: false },
        { name: 'SWIMMING', icon: '🏊', completed: false },
    ];

    // --- Persistence ---
    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ missions, selectedIndex }));
    }

    function load() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (data && data.missions && data.missions.length > 0) {
                missions = data.missions.map(m => ({
                    id: m.id || genId(),
                    name: m.name,
                    icon: m.icon,
                    completed: !!m.completed
                }));
                selectedIndex = data.selectedIndex || 0;
            } else {
                resetToDefaults();
            }
        } catch {
            resetToDefaults();
        }
        if (selectedIndex >= missions.length) selectedIndex = 0;
    }

    function resetToDefaults() {
        missions = DEFAULT_MISSIONS.map(m => ({ ...m, id: genId() }));
        selectedIndex = 0;
    }

    function genId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // --- Flash effect ---
    function triggerFlash() {
        flash.classList.remove('active');
        void flash.offsetWidth;
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 600);
    }

    // --- Particles ---
    function createParticles() {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (10 + Math.random() * 15) + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            particlesContainer.appendChild(p);
        }
    }

    // --- Render dial icons ---
    function renderDial() {
        dialRing.innerHTML = '';
        const count = missions.length;
        if (count === 0) {
            updateCenter(null);
            return;
        }

        const dialFace = document.querySelector('.dial-face');
        const radius = (dialFace.offsetWidth / 2) - 40;

        // Calculate rotation so selected item is at top (270 deg = top in unit-circle terms)
        const angleStep = 360 / count;

        missions.forEach((mission, i) => {
            const div = document.createElement('div');
            div.className = 'dial-icon';
            if (i === selectedIndex) div.classList.add('active-icon');
            if (mission.completed) div.classList.add('completed-icon');

            // Position each icon around the circle
            // Angle relative to selected: selected is at top (12 o'clock = -90deg)
            const relAngle = (i - selectedIndex) * angleStep;
            const angleDeg = -90 + relAngle;
            const angleRad = (angleDeg * Math.PI) / 180;

            const cx = radius * Math.cos(angleRad);
            const cy = radius * Math.sin(angleRad);

            div.style.left = `calc(50% + ${cx}px - 24px)`;
            div.style.top = `calc(50% + ${cy}px - 24px)`;
            div.textContent = mission.icon;

            // Click to select
            div.addEventListener('click', () => {
                selectedIndex = i;
                save();
                renderDial();
                renderList();
                updateCenter(missions[selectedIndex]);
            });

            // Label
            const label = document.createElement('span');
            label.className = 'dial-icon-label';
            label.textContent = mission.name;
            div.appendChild(label);

            dialRing.appendChild(div);
        });

        updateCenter(missions[selectedIndex]);
    }

    // --- Update center display ---
    function updateCenter(mission) {
        if (!mission) {
            coreIcon.textContent = '❓';
            coreName.textContent = 'NO MISSIONS';
            coreStatus.textContent = 'ADD A MISSION';
            coreStatus.className = 'core-status';
            actionBtn.className = 'action-btn btn-disabled';
            actionText.textContent = 'NO TARGET';
            return;
        }

        // Bounce animation
        coreIcon.classList.remove('bounce');
        void coreIcon.offsetWidth;
        coreIcon.classList.add('bounce');

        coreIcon.textContent = mission.icon;
        coreName.textContent = mission.name;

        if (mission.completed) {
            coreStatus.textContent = 'MISSION COMPLETE';
            coreStatus.className = 'core-status status-done';
            actionBtn.className = 'action-btn btn-complete';
            actionText.textContent = 'REACTIVATE';
        } else {
            coreStatus.textContent = 'MISSION ACTIVE';
            coreStatus.className = 'core-status status-active';
            actionBtn.className = 'action-btn';
            actionText.textContent = 'ACTIVATE MISSION';
        }
    }

    // --- Update counts ---
    function updateCounts() {
        const total = missions.length;
        const active = missions.filter(m => !m.completed).length;
        const done = total - active;

        animateVal(totalCount, total);
        animateVal(activeCountEl, active);
        animateVal(doneCount, done);
    }

    function animateVal(el, val) {
        const cur = parseInt(el.textContent) || 0;
        if (cur !== val) {
            el.textContent = val;
            el.style.transform = 'scale(1.3)';
            setTimeout(() => el.style.transform = 'scale(1)', 200);
        }
    }

    // --- Render mission list ---
    function renderList() {
        missionList.innerHTML = '';

        if (missions.length === 0) {
            emptyLog.classList.add('visible');
            return;
        }
        emptyLog.classList.remove('visible');

        missions.forEach((m, i) => {
            const li = document.createElement('li');
            li.className = 'mission-item';
            if (i === selectedIndex) li.classList.add('selected');
            if (m.completed) li.classList.add('completed-item');

            li.innerHTML = `
                <span class="mission-emoji">${m.icon}</span>
                <div class="mission-info">
                    <div class="mission-name">${escapeHtml(m.name)}</div>
                    <div class="mission-tag">${m.completed ? 'Completed' : 'Active'}</div>
                </div>
                <span class="mission-status-badge ${m.completed ? 'badge-done' : 'badge-active'}">
                    ${m.completed ? 'DONE' : 'ACTIVE'}
                </span>
                <button class="mission-delete" title="Remove mission">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            `;

            // Click to select on dial
            li.addEventListener('click', (e) => {
                if (e.target.closest('.mission-delete')) return;
                selectedIndex = i;
                save();
                renderDial();
                renderList();
            });

            // Delete
            li.querySelector('.mission-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                li.classList.add('removing');
                setTimeout(() => {
                    missions.splice(i, 1);
                    if (selectedIndex >= missions.length) selectedIndex = Math.max(0, missions.length - 1);
                    save();
                    renderAll();
                }, 300);
            });

            missionList.appendChild(li);
        });

        // scroll selected into view
        const selectedEl = missionList.querySelector('.selected');
        if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // --- Render all ---
    function renderAll() {
        renderDial();
        renderList();
        updateCounts();
    }

    // --- Rotate ---
    function rotateDial(direction) {
        if (missions.length === 0) return;
        if (direction === 'left') {
            selectedIndex = (selectedIndex - 1 + missions.length) % missions.length;
        } else {
            selectedIndex = (selectedIndex + 1) % missions.length;
        }
        save();
        renderAll();
    }

    // --- Action button (activate / reactivate) ---
    function handleAction() {
        if (missions.length === 0) return;
        const m = missions[selectedIndex];
        m.completed = !m.completed;
        triggerFlash();
        save();
        renderAll();
    }

    // --- Add mission ---
    function showAddForm() {
        addForm.classList.add('visible');
        missionInput.value = '';
        missionInput.focus();
    }

    function hideAddForm() {
        addForm.classList.remove('visible');
    }

    function addMission() {
        const name = missionInput.value.trim().toUpperCase();
        if (!name) return;
        const icon = iconSelect.value;
        missions.push({ id: genId(), name, icon, completed: false });
        selectedIndex = missions.length - 1;
        triggerFlash();
        save();
        renderAll();
        hideAddForm();
    }

    // --- Escape HTML ---
    function escapeHtml(t) {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    // --- Keyboard support ---
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.key === 'ArrowLeft') { rotateDial('left'); }
        else if (e.key === 'ArrowRight') { rotateDial('right'); }
        else if (e.key === 'Enter') { handleAction(); }
    });

    // --- Mouse wheel on watch ---
    watchEl.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY > 0) rotateDial('right');
        else rotateDial('left');
    }, { passive: false });

    // --- Touch swipe on watch ---
    let touchStartX = 0;
    watchEl.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    watchEl.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 30) {
            rotateDial(dx > 0 ? 'left' : 'right');
        }
    }, { passive: true });

    // --- Event listeners ---
    rotateLeft.addEventListener('click', () => rotateDial('left'));
    rotateRight.addEventListener('click', () => rotateDial('right'));
    actionBtn.addEventListener('click', handleAction);
    addMissionBtn.addEventListener('click', showAddForm);
    cancelAdd.addEventListener('click', hideAddForm);
    confirmAdd.addEventListener('click', addMission);
    missionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addMission();
        if (e.key === 'Escape') hideAddForm();
    });

    // --- Init ---
    load();
    createParticles();
    renderAll();

})();
