import { DateUtils } from './utils.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://blidygzaqnmhkymiitof.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsaWR5Z3phcW5taGt5bWlpdG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NDc4NTQsImV4cCI6MjA4ODAyMzg1NH0.LUcxhipAILLRAmAsCMGi5gJWOwRWtdCSGXW4r7-W07c';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const USER_ID = 'default_user'; // For a single-user personal app

export class Store {
    constructor(onLoadCallback) {
        this.data = this.getInitialState();
        this.isLoaded = false;
        this.onLoadCallback = onLoadCallback;
        this.load();
    }

    async load() {
        try {
            const { data, error } = await supabase
                .from('app_data')
                .select('data')
                .eq('id', USER_ID)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows found in cloud. Try to migrate from local storage!
                    const oldLocalData = localStorage.getItem('commit_app_data_v1');
                    if (oldLocalData) {
                        try {
                            const parsed = JSON.parse(oldLocalData);
                            if (parsed && parsed.habits) {
                                console.log("Migrating old local data to cloud...");
                                this.data = { ...this.getInitialState(), ...parsed };
                            }
                        } catch (e) {
                            console.error("Failed to parse old local data during migration", e);
                            this.data = this.getInitialState();
                        }
                    } else {
                        // Truly new user
                        this.data = this.getInitialState();
                    }
                    this.isLoaded = true; // MUST be true before we save!
                    await this.save();
                } else {
                    console.error('Error loading data:', error);
                }
            } else if (data && data.data) {
                // Ensure all fields exist
                this.data = { ...this.getInitialState(), ...data.data };
            }
        } catch (e) {
            console.error('Failed to connect to Supabase', e);
        } finally {
            this.isLoaded = true;
            if (this.onLoadCallback) this.onLoadCallback();
        }
    }

    async save() {
        if (!this.isLoaded) return; // Prevent overwriting with empty state during load

        try {
            const { error } = await supabase
                .from('app_data')
                .upsert({ id: USER_ID, data: this.data });

            if (error) console.error('Error saving data:', error);
        } catch (e) {
            console.error('Failed to save to Supabase', e);
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
