import { Store } from './store.js';
import { renderHabits, renderTasks, renderNotes, renderCareer, updateHeaderActions } from './ui.js';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // A little easter egg for anyone peeking under the hood
    console.log("%c Commit_ loaded. Time to build something great.", "color: #39ff14; font-family: monospace; font-size: 14px; font-weight: bold;");

    // Initialize Icons
    lucide.createIcons();

    // State
    let currentView = 'habits';

    // Navigation Logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view-section');

    function switchView(viewName, store) {
        // Update State
        currentView = viewName;

        // Update UI Tabs
        navButtons.forEach(btn => {
            const isActive = btn.dataset.target === viewName;
            btn.dataset.active = isActive;
            if (isActive) {
                btn.classList.add('text-green-500');
                btn.classList.remove('text-zinc-500');
            } else {
                btn.classList.remove('text-green-500');
                btn.classList.add('text-zinc-500');
            }
        });

        // Show/Hide Views
        views.forEach(view => {
            if (view.id === `view-${viewName}`) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });

        // Trigger Render for specific view if store is loaded
        if (store && store.isLoaded) {
            if (viewName === 'habits') renderHabits(store);
            if (viewName === 'tasks') renderTasks(store);
            if (viewName === 'notes') renderNotes(store);
            if (viewName === 'career') renderCareer(store);
            updateHeaderActions(viewName, store);
        }
    }

    const store = new Store(() => {
        // Callback fired when data is loaded
        switchView(currentView, store);
    });

    // Event Listeners
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.target, store);
        });
    });
});
