import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { saveWaterData, getWaterData, getProfile, saveWaterHistory } from '../utils/storage';

export default function WaterScreen() {
    const [current, setCurrent] = useState(0);
    const [goal, setGoal] = useState(2000);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const waterData = await getWaterData();
        const profileData = await getProfile();

        setCurrent(waterData || 0);
        setProfile(profileData);

        // Расчет нормы воды по весу (30-40 мл на кг)
        if (profileData && profileData.weight) {
            const calculatedGoal = profileData.weight * 35;
            setGoal(calculatedGoal);
        }
    };

    const addWater = async (amount) => {
        const newAmount = current + amount;
        setCurrent(newAmount);
        await saveWaterData(newAmount);
        await saveWaterHistory(newAmount, goal);

        // Проверка достижения цели
        if (current < goal && newAmount >= goal) {
            Alert.alert('🎉 Поздравляем!', 'Вы выполнили дневную норму воды!');
        }
    };

    const reset = async () => {
        if (current < goal) {
            Alert.alert(
                '😔 Норма не выполнена',
                `Вы выпили только ${Math.round((current / goal) * 100)}% от нормы. Попробуйте завтра!`,
                [
                    { text: 'Отмена', style: 'cancel' },
                    {
                        text: 'Сбросить',
                        onPress: async () => {
                            setCurrent(0);
                            await saveWaterData(0);
                        }
                    }
                ]
            );
        } else {
            setCurrent(0);
            await saveWaterData(0);
        }
    };

    const percentage = Math.min((current / goal) * 100, 150);

    // Определяем цвет и сообщение
    const getStatus = () => {
        const percent = (current / goal) * 100;

        if (percent < 50) {
            return {
                color: '#E74C3C',
                message: '⚠️ Пейте больше воды!',
                icon: '😰'
            };
        } else if (percent < 100) {
            return {
                color: '#F39C12',
                message: '💪 Почти у цели!',
                icon: '😊'
            };
        } else if (percent <= 120) {
            return {
                color: '#27AE60',
                message: '✅ Отлично! Норма выполнена!',
                icon: '🎉'
            };
        } else {
            return {
                color: '#E74C3C',
                message: '⚠️ Не переусердствуйте!',
                icon: '😅'
            };
        }
    };

    const status = getStatus();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                {/* Приветствие */}
                {profile && profile.name && (
                    <Text style={styles.greeting}>
                        Привет, {profile.name}! 👋
                    </Text>
                )}

                <Text style={styles.title}>Выпито сегодня</Text>

                {/* Статус */}
                <View style={[styles.statusCard, { backgroundColor: status.color + '20' }]}>
                    <Text style={styles.statusIcon}>{status.icon}</Text>
                    <Text style={[styles.statusMessage, { color: status.color }]}>
                        {status.message}
                    </Text>
                </View>

                {/* Прогресс */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${percentage}%`,
                                    backgroundColor: status.color
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressText, { color: status.color }]}>
                        {current} / {goal} мл ({Math.round((current / goal) * 100)}%)
                    </Text>
                </View>

                {/* Большая иконка */}
                <Text style={styles.waterIcon}>💧</Text>
                <Text style={styles.currentAmount}>{current} мл</Text>

                {/* Кнопки быстрого добавления */}
                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.waterButton, { backgroundColor: status.color }]}
                        onPress={() => addWater(100)}>
                        <Text style={styles.buttonText}>+100 мл</Text>
                        <Text style={styles.buttonSubtext}>Полстакана</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.waterButton, { backgroundColor: status.color }]}
                        onPress={() => addWater(200)}>
                        <Text style={styles.buttonText}>+200 мл</Text>
                        <Text style={styles.buttonSubtext}>Стакан</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonsRow}>
                    <TouchableOpacity
                        style={[styles.waterButton, { backgroundColor: status.color }]}
                        onPress={() => addWater(250)}>
                        <Text style={styles.buttonText}>+250 мл</Text>
                        <Text style={styles.buttonSubtext}>Кружка</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.waterButton, { backgroundColor: status.color }]}
                        onPress={() => addWater(500)}>
                        <Text style={styles.buttonText}>+500 мл</Text>
                        <Text style={styles.buttonSubtext}>Бутылка</Text>
                    </TouchableOpacity>
                </View>

                {/* Кнопка сброса */}
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={reset}>
                    <Text style={styles.resetButtonText}>🔄 Сбросить день</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    card: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4A90E2',
        marginBottom: 10,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    statusCard: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 40,
        marginBottom: 5,
    },
    statusMessage: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBar: {
        height: 30,
        backgroundColor: '#E0E0E0',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
    },
    progressText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    waterIcon: {
        fontSize: 80,
        textAlign: 'center',
        marginTop: 10,
    },
    currentAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#4A90E2',
        marginBottom: 20,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    waterButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonSubtext: {
        color: 'white',
        fontSize: 12,
        marginTop: 3,
        opacity: 0.9,
    },
    resetButton: {
        backgroundColor: '#95A5A6',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    resetButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
});