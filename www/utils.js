import { format, subDays, isSameDay, parseISO } from 'https://esm.sh/date-fns@3.3.1';

export const DateUtils = {
    getToday: () => format(new Date(), 'yyyy-MM-dd'),

    getLastNDays: (n) => {
        const dates = [];
        const today = new Date();
        for (let i = n - 1; i >= 0; i--) {
            dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
        }
        return dates;
    },

    getLast30Days: () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
        }
        return dates;
    },

    formatDisplayDate: (isoString) => {
        return format(parseISO(isoString), 'MMM d');
    },

    calculateStreak: (history) => {
        // Simple current streak calculation
        // Count backwards from today. If today is marked, streak starts at 1. 
        // If yesterday is marked, add 1... stop at first gap.
        // Exception: If today is NOT marked, check yesterday. If yesterday is marked, streak is active.
        // If yesterday is NOT marked, streak is 0.

        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

        // Rule: If neither today nor yesterday are done, streak is broken.
        if (!history[todayStr] && !history[yesterdayStr]) {
            return 0;
        }

        let streak = 0;

        // Start counting from today if done, otherwise start from yesterday
        let checkDateOffset = history[todayStr] ? 0 : 1;

        while (true) {
            const dateStr = format(subDays(today, checkDateOffset), 'yyyy-MM-dd');
            if (history[dateStr]) {
                streak++;
                checkDateOffset++;
            } else {
                break;
            }
        }

        return streak;
    }
};
