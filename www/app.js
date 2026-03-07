import { Store } from './store.js';
import { renderHabits, renderTasks, renderNotes, renderCareer, updateHeaderActions } from './ui.js';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
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

    // Show loading state initially
    const habitsContainer = document.getElementById('view-habits');
    habitsContainer.classList.remove('hidden');
    habitsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-500 font-mono">
            <i data-lucide="loader-2" class="w-8 h-8 text-green-500 animate-spin"></i>
            <p class="text-zinc-500 text-sm tracking-wider uppercase">Syncing with cloud...</p>
        </div>
    `;
    lucide.createIcons();

    const store = new Store(() => {
        // Callback fired when data is loaded from Supabase
        switchView(currentView, store);
    });

    // Event Listeners
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView(btn.dataset.target, store);
        });
    });
});
