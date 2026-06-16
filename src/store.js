import { DateUtils } from './utils.js';

const STORAGE_KEY = 'commit_app_data_v1';

export class Store {
    constructor(onLoadCallback) {
        this.data = this.getInitialState();
        this.isLoaded = false;
        this.onLoadCallback = onLoadCallback;
        this.load();
    }

    load() {
        try {
            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                const parsed = JSON.parse(localData);
                this.data = { ...this.getInitialState(), ...parsed };
            }
        } catch (e) {
            console.error('Failed to parse local data', e);
            this.data = this.getInitialState();
        } finally {
            this.isLoaded = true;
            if (this.onLoadCallback) this.onLoadCallback();
        }
    }

    save() {
        if (!this.isLoaded) return; // Prevent overwriting with empty state during load

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Failed to save to localStorage', e);
        }
    }

    getInitialState() {
        return {
            habits: [], // { id, name, history: { "YYYY-MM-DD": true } }
            tasks: [],  // { id, text, completed }
            notes: ''   // string
        };
    }

    // Habits
    getOverallActivity(days) {
        const lastDays = DateUtils.getLastNDays(days);
        const activity = {};
        lastDays.forEach(dateStr => {
            activity[dateStr] = 0;
            this.data.habits.forEach(habit => {
                if (habit.history[dateStr]) activity[dateStr]++;
            });
        });
        return { keys: lastDays, activity };
    }

    addHabit(name) {
        const id = crypto.randomUUID();
        this.data.habits.push({
            id,
            name,
            history: {}
        });
        this.save();
    }

    deleteHabit(id) {
        this.data.habits = this.data.habits.filter(h => h.id !== id);
        this.save();
    }

    toggleHabitDate(id, dateString) {
        const habit = this.data.habits.find(h => h.id === id);
        if (habit) {
            if (habit.history[dateString]) {
                delete habit.history[dateString];
            } else {
                habit.history[dateString] = true;
            }
            this.save();
        }
    }

    // Tasks
    addTask(text) {
        const id = crypto.randomUUID();
        this.data.tasks.push({ id, text, completed: false });
        this.save();
    }

    toggleTask(id) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
        }
    }

    deleteTask(id) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== id);
        this.save();
    }

    clearCompletedTasks() {
        this.data.tasks = this.data.tasks.filter(t => !t.completed);
        this.save();
    }

    // Notes
    updateNotes(content) {
        this.data.notes = content;
        this.save();
    }
}
