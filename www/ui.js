import { DateUtils } from './utils.js';

export function renderHabits(store) {
    const container = document.getElementById('view-habits');
    container.innerHTML = '';

    if (store.data.habits.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500 font-mono">
                <div class="w-16 h-16 bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <i data-lucide="layout-grid" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white tracking-tight">No habits found</h3>
                    <p class="text-zinc-600 text-sm">Initialize your tracking protocol.</p>
                </div>
                <button id="create-first-habit-btn" class="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-black text-sm font-bold uppercase tracking-wider transition-colors">
                    Initialize Habit
                </button>
            </div>
        `;

        const btn = document.getElementById('create-first-habit-btn');
        if (btn) {
            btn.onclick = () => {
                showInputModal('New Habit', 'e.g., READ_Documentation', (name) => {
                    store.addHabit(name);
                    renderHabits(store);
                });
            }
        }
        lucide.createIcons();
        return;
    }

    const list = document.createElement('div');
    list.className = 'space-y-4 pb-20';

    store.data.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'bg-zinc-900/20 border border-zinc-800 p-5 space-y-4';

        // Header
        const streak = DateUtils.calculateStreak(habit.history);
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between';
        header.innerHTML = `
            <h3 class="font-bold text-lg text-white tracking-tight truncate mr-4">${habit.name}</h3>
            <div class="flex items-center space-x-3 shrink-0">
                <div class="flex items-center space-x-1 ${streak > 0 ? 'text-green-500' : 'text-zinc-700'} transition-colors">
                    <span class="font-bold text-sm font-mono">[${streak > 0 ? 'STREAK:' + streak : 'INACTIVE'}]</span>
                </div>
                <button class="delete-btn text-zinc-700 hover:text-red-500 transition-colors p-1" data-id="${habit.id}">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `;

        // Delete Handler
        header.querySelector('.delete-btn').addEventListener('click', (e) => {
            if (confirm(`Delete habit "${habit.name}"?`)) {
                store.deleteHabit(habit.id);
                renderHabits(store);
            }
        });

        // Heatmap Grid
        const heatmap = document.createElement('div');
        heatmap.className = 'grid grid-cols-10 gap-1';

        const last30Days = DateUtils.getLast30Days();

        last30Days.forEach(dateStr => {
            const isDone = habit.history[dateStr];
            const isToday = dateStr === DateUtils.getToday();

            const cell = document.createElement('button');
            // Base styles
            let classes = 'w-full aspect-square rounded-md transition-all duration-200 ';

            // State styles
            if (isDone) {
                classes += 'bg-green-600';
                if (isToday) classes += ' hover:bg-green-500';
            } else {
                classes += 'bg-zinc-900 border border-zinc-800';
                if (isToday) classes += ' hover:bg-zinc-800/80';
            }

            // Today indicator
            if (isToday) {
                classes += ' ring-1 ring-white ring-inset cursor-pointer';
            } else {
                classes += ' cursor-default opacity-80';
            }

            cell.className = classes;
            cell.title = DateUtils.formatDisplayDate(dateStr);

            cell.onclick = () => {
                if (!isToday) return; // Restrict edits to today
                if (navigator.vibrate) navigator.vibrate(10);
                store.toggleHabitDate(habit.id, dateStr);
                renderHabits(store);
            };

            heatmap.appendChild(cell);
        });

        card.appendChild(header);
        card.appendChild(heatmap);
        list.appendChild(card);
    });

    container.appendChild(list);
    lucide.createIcons();
}

export function renderTasks(store) {
    const container = document.getElementById('view-tasks');
    container.innerHTML = '';

    const list = document.createElement('ul');
    list.className = 'space-y-0 border-t border-zinc-900 pb-20'; // Removed gap, added border to mimic list view

    // Sort: Pending first, then Completed
    const sortedTasks = [...store.data.tasks].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    if (sortedTasks.length === 0) {
        container.innerHTML = `
             <div class="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500 font-mono">
                <div class="w-16 h-16 bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                    <i data-lucide="check-square" class="w-8 h-8"></i>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white">No tasks pending</h3>
                    <p class="text-zinc-600 text-sm">System idle.</p>
                </div>
                 <button id="create-first-task-btn" class="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold uppercase tracking-wider transition-colors border border-zinc-700">
                    Add Task
                </button>
            </div>
        `;
        const btn = document.getElementById('create-first-task-btn');
        if (btn) {
            btn.onclick = () => {
                showInputModal('New Task', 'e.g., DEPLOY_APP', (text) => {
                    store.addTask(text);
                    renderTasks(store);
                });
            };
        }
        lucide.createIcons();
        return;
    }

    sortedTasks.forEach(task => {
        const item = document.createElement('li');
        item.className = `group flex items-center justify-between p-4 border-b border-zinc-900 bg-black hover:bg-zinc-900/30 transition-all duration-200 ${task.completed ? 'opacity-40' : ''}`;

        const left = document.createElement('div');
        left.className = 'flex items-center space-x-4 overflow-hidden';

        const checkbox = document.createElement('button');
        checkbox.className = `w-5 h-5 border flex items-center justify-center transition-colors rounded-none ${task.completed ? 'bg-green-600 border-green-600 text-black' : 'border-zinc-700 hover:border-zinc-500'}`;
        checkbox.innerHTML = task.completed ? `<i data-lucide="check" class="w-3.5 h-3.5"></i>` : '';
        checkbox.onclick = () => {
            store.toggleTask(task.id);
            renderTasks(store);
        };

        const text = document.createElement('span');
        text.className = `truncate font-mono text-sm ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}`;
        text.textContent = task.text;

        left.appendChild(checkbox);
        left.appendChild(text);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100';
        deleteBtn.innerHTML = `<i data-lucide="x" class="w-4 h-4"></i>`;
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            store.deleteTask(task.id);
            renderTasks(store);
        };

        item.appendChild(left);
        item.appendChild(deleteBtn);
        list.appendChild(item);
    });

    container.appendChild(list);
    lucide.createIcons();
}

export function renderNotes(store) {
    const container = document.getElementById('view-notes');

    if (container.querySelector('textarea')) {
        return;
    }

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'h-[calc(100vh-12rem)] flex flex-col';

    const textarea = document.createElement('textarea');
    textarea.className = 'flex-1 w-full bg-zinc-900/10 text-zinc-300 p-4 border border-zinc-800 resize-none focus:border-green-500/50 focus:ring-0 placeholder:text-zinc-700 leading-relaxed font-mono text-sm';
    textarea.placeholder = "// Daily Brain Dump...";
    textarea.value = store.data.notes || '';

    textarea.addEventListener('input', (e) => {
        store.updateNotes(e.target.value);
    });

    wrapper.appendChild(textarea);
    container.appendChild(wrapper);
}

export function updateHeaderActions(view, store) {
    const container = document.getElementById('header-actions');
    container.innerHTML = '';

    if (view === 'habits') {
        const btn = document.createElement('button');
        btn.className = 'w-9 h-9 flex items-center justify-center bg-zinc-900 text-white rounded-none hover:bg-zinc-800 transition-colors border border-zinc-800';
        btn.innerHTML = `<i data-lucide="plus" class="w-5 h-5"></i>`;
        btn.onclick = () => {
            showInputModal('New Habit', 'e.g., READ_Documentation', (name) => {
                store.addHabit(name);
                renderHabits(store);
            });
        };
        container.appendChild(btn);
    }
    else if (view === 'tasks') {
        const btn = document.createElement('button');
        btn.className = 'w-9 h-9 flex items-center justify-center bg-zinc-900 text-white rounded-none hover:bg-zinc-800 transition-colors border border-zinc-800';
        btn.innerHTML = `<i data-lucide="plus" class="w-5 h-5"></i>`;
        btn.onclick = () => {
            showInputModal('New Task', 'e.g., DEPLOY_APP', (text) => {
                store.addTask(text);
                renderTasks(store);
            });
        };
        container.appendChild(btn);
    }

    lucide.createIcons();
}

function showInputModal(title, placeholder, onConfirm) {
    let modal = document.getElementById('input-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'input-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200';

    modal.innerHTML = `
        <div class="w-full max-w-sm bg-black border border-zinc-800 rounded-none p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 font-mono">
            <h3 class="text-lg font-bold text-white tracking-tight">${title}</h3>
            <input type="text" id="modal-input" class="w-full bg-zinc-900 border border-zinc-700 rounded-none px-4 py-3 text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-green-500/50 outline-none transition-all font-mono" placeholder="${placeholder}" autocomplete="off">
            <div class="flex items-center space-x-3 pt-2">
                <button id="modal-cancel" class="flex-1 py-3 text-zinc-500 font-medium hover:text-white transition-colors border border-transparent hover:border-zinc-800 uppercase text-xs tracking-wider">Cancel</button>
                <button id="modal-confirm" class="flex-1 py-3 bg-green-600 hover:bg-green-500 text-black font-bold uppercase text-xs tracking-wider transition-colors">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#modal-input');
    const cancelBtn = modal.querySelector('#modal-cancel');
    const confirmBtn = modal.querySelector('#modal-confirm');

    input.focus();

    const close = () => {
        modal.classList.add('fade-out', 'animate-out');
        setTimeout(() => modal.remove(), 200);
    };

    const confirm = () => {
        const value = input.value.trim();
        if (value) {
            onConfirm(value);
            close();
        } else {
            input.classList.add('ring-2', 'ring-red-500/50');
            input.placeholder = 'Please enter text...';
        }
    };

    cancelBtn.onclick = close;
    confirmBtn.onclick = confirm;

    input.onkeydown = (e) => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') close();
    };

    modal.onclick = (e) => {
        if (e.target === modal) close();
    };
}

export function renderCareer(store) {
    const container = document.getElementById('view-career');
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-6 pb-20 animate-in fade-in duration-500';

    // Header Stats
    const statsContainer = document.createElement('div');
    statsContainer.className = 'grid grid-cols-2 gap-4';

    const activityData = store.getOverallActivity(90);
    const totalCompletions = Object.values(activityData.activity).reduce((a, b) => a + b, 0);

    statsContainer.innerHTML = `
        <div class="bg-zinc-900/40 border border-zinc-800 p-4 shrink-0 flex flex-col items-center justify-center">
            <span class="text-zinc-500 text-xs font-bold tracking-wider mb-1 uppercase font-mono text-center">Total<br>Completions</span>
            <span class="text-3xl font-bold text-white tracking-tighter">${totalCompletions}</span>
        </div>
        <div class="bg-zinc-900/40 border border-zinc-800 p-4 shrink-0 flex flex-col items-center justify-center">
            <span class="text-zinc-500 text-xs font-bold tracking-wider mb-1 uppercase font-mono text-center">Active<br>Habits</span>
            <span class="text-3xl font-bold text-white tracking-tighter">${store.data.habits.length}</span>
        </div>
    `;

    // Heatmap Title
    const heatTitle = document.createElement('h3');
    heatTitle.className = 'text-white font-bold tracking-tight text-lg mt-8 mb-4 flex items-center gap-2';
    heatTitle.innerHTML = '<i data-lucide="git-commit" class="w-5 h-5 text-green-500"></i> Contribution Graph (90 Days)';

    // Heatmap Container (Scrollable horizontally)
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'flex overflow-x-auto snap-x bg-zinc-900/20 border border-zinc-800 p-5 items-center hide-scrollbar';

    // We want the grid to flow top-to-bottom, left-to-right to mimic GitHub
    const grid = document.createElement('div');
    grid.className = 'grid grid-rows-7 grid-flow-col gap-[3px] mx-auto';

    // Setup 90-day activity map
    const firstDate = new Date(activityData.keys[0]);
    const dayOfWeek = firstDate.getDay();

    // Add empty padding for start of grid
    for (let i = 0; i < dayOfWeek; i++) {
        const empty = document.createElement('div');
        empty.className = 'w-3 h-3 md:w-4 md:h-4 rounded-md bg-transparent';
        grid.appendChild(empty);
    }

    activityData.keys.forEach(dateStr => {
        const count = activityData.activity[dateStr];
        const cell = document.createElement('div');

        let colorClass = 'bg-zinc-900/50 border border-zinc-800/50';
        if (count === 1) colorClass = 'bg-green-900/80 border-green-900';
        else if (count === 2) colorClass = 'bg-green-700 border-green-700';
        else if (count >= 3) colorClass = 'bg-green-500 border-green-500';

        cell.className = `w-3 h-3 md:w-4 md:h-4 rounded-md ${colorClass} transition-colors snap-center`;
        cell.title = `${count} completions on ${DateUtils.formatDisplayDate(dateStr)}`;
        grid.appendChild(cell);
    });

    scrollContainer.appendChild(grid);

    // Scroll to end (rightmost) smoothly
    setTimeout(() => {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }, 10);

    // Actions Title
    const actionsTitle = document.createElement('h3');
    actionsTitle.className = 'text-white font-bold tracking-tight text-lg mt-8 mb-4 flex items-center gap-2';
    actionsTitle.innerHTML = '<i data-lucide="settings" class="w-5 h-5 text-zinc-500"></i> Local Data Management';

    // Actions Container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'flex flex-col space-y-3';

    // Export Button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2';
    exportBtn.innerHTML = '<i data-lucide="download" class="w-4 h-4"></i> Export Data Backup';
    exportBtn.onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.data));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "commit_backup_" + DateUtils.getToday() + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // Import Button
    const importBtn = document.createElement('button');
    importBtn.className = 'w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2';
    importBtn.innerHTML = '<i data-lucide="upload" class="w-4 h-4"></i> Import Data Backup';

    // Hidden File Input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.className = 'hidden';
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.habits && importedData.tasks) {
                    store.data = importedData;
                    store.save();
                    alert('Data imported successfully!');
                    renderCareer(store);
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (err) {
                alert('Failed to parse backup file.');
                console.error(err);
            }
        };
        reader.readAsText(file);
    });

    importBtn.onclick = () => fileInput.click();

    actionsContainer.appendChild(exportBtn);
    actionsContainer.appendChild(importBtn);
    actionsContainer.appendChild(fileInput);

    wrapper.appendChild(statsContainer);
    wrapper.appendChild(heatTitle);
    wrapper.appendChild(scrollContainer);
    wrapper.appendChild(actionsTitle);
    wrapper.appendChild(actionsContainer);

    container.appendChild(wrapper);
    lucide.createIcons();
}
