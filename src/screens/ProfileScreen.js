import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveProfile, getProfile } from '../utils/storage';

export default function ProfileScreen() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await getProfile();
        if (data) {
            setName(data.name || '');
            setAge(data.age?.toString() || '');
            setWeight(data.weight?.toString() || '');
            setSaved(true);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
            return;
        }

        const profile = {
            name: name.trim(),
            age: parseInt(age) || 0,
            weight: parseInt(weight) || 0,
        };

        await saveProfile(profile);
        setSaved(true);
        Alert.alert('✅ Сохранено', 'Ваш профиль успешно обновлен!');
    };

    const calculateWaterGoal = () => {
        const w = parseInt(weight);
        if (w > 0) {
            return w * 35; // 35 мл на кг веса
        }
        return 2000;
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.icon}>👤</Text>
                <Text style={styles.title}>Личный кабинет</Text>

                {/* Имя */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Ionicons name="person" size={18} /> Ваше имя
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Например: Вадим"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Возраст */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Ionicons name="calendar" size={18} /> Возраст
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Например: 25"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />
                </View>

                {/* Вес */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        <Ionicons name="fitness" size={18} /> Вес (кг)
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Например: 70"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                    />
                    {weight && parseInt(weight) > 0 && (
                        <Text style={styles.hint}>
                            💡 Рекомендуемая норма: {calculateWaterGoal()} мл в день
                        </Text>
                    )}
                </View>

                {/* Кнопка сохранения */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}>
                    <Text style={styles.saveButtonText}>
                        {saved ? '✓ Обновить профиль' : '💾 Сохранить профиль'}
                    </Text>
                </TouchableOpacity>

                {/* Информация */}
                {saved && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>📊 Ваша статистика</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Имя:</Text>
                            <Text style={styles.infoValue}>{name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Возраст:</Text>
                            <Text style={styles.infoValue}>{age || '—'} лет</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Вес:</Text>
                            <Text style={styles.infoValue}>{weight || '—'} кг</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Дневная норма:</Text>
                            <Text style={styles.infoValue}>{calculateWaterGoal()} мл</Text>
                        </View>
                    </View>
                )}

                {/* Советы */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Полезные советы</Text>
                    <Text style={styles.tip}>• Пейте воду сразу после пробуждения</Text>
                    <Text style={styles.tip}>• Держите бутылку воды всегда под рукой</Text>
                    <Text style={styles.tip}>• Установите напоминания на телефоне</Text>
                    <Text style={styles.tip}>• Норма: 30-40 мл на 1 кг веса</Text>
                </View>
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
    icon: {
        fontSize: 60,
        textAlign: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    hint: {
        marginTop: 5,
        fontSize: 14,
        color: '#27AE60',
        fontStyle: 'italic',
    },
    saveButton: {
        backgroundColor: '#4A90E2',
        padding: 18,
        borderRadius: 10,
        marginTop: 10,
    },
    saveButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoCard: {
        backgroundColor: '#F0F8FF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#4A90E2',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    tipsCard: {
        backgroundColor: '#FFF9E6',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F39C12',
    },
    tip: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
});