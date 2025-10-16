import AsyncStorage from '@react-native-async-storage/async-storage';

const WATER_KEY = '@water_data';
const PROFILE_KEY = '@profile_data';
const HISTORY_KEY = '@water_history';

// ====== ВОДА ======
export const saveWaterData = async (amount) => {
    try {
        const today = new Date().toDateString();
        await AsyncStorage.setItem(
            WATER_KEY,
            JSON.stringify({ amount, date: today })
        );
    } catch (error) {
        console.error('Error saving water data:', error);
    }
};

export const getWaterData = async () => {
    try {
        const data = await AsyncStorage.getItem(WATER_KEY);
        if (data) {
            const { amount, date } = JSON.parse(data);
            const today = new Date().toDateString();
            return date === today ? amount : 0;
        }
        return 0;
    } catch (error) {
        console.error('Error loading water data:', error);
        return 0;
    }
};

// ====== ПРОФИЛЬ ======
export const saveProfile = async (profile) => {
    try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error('Error saving profile:', error);
    }
};

export const getProfile = async () => {
    try {
        const data = await AsyncStorage.getItem(PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
};

// ====== ИСТОРИЯ ======
export const saveWaterHistory = async (amount, goal) => {
    try {
        const today = new Date().toDateString();
        const history = await getWaterHistory();

        // Проверяем есть ли уже запись за сегодня
        const existingIndex = history.findIndex(item => item.date === today);

        if (existingIndex >= 0) {
            // Обновляем существующую запись
            history[existingIndex] = { date: today, amount, goal };
        } else {
            // Добавляем новую запись
            history.unshift({ date: today, amount, goal });
        }

        // Храним только последние 30 дней
        const limitedHistory = history.slice(0, 30);

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
        console.error('Error saving water history:', error);
    }
};

export const getWaterHistory = async () => {
    try {
        const data = await AsyncStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading water history:', error);
        return [];
    }
};

export const clearHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};