import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Calendar } from 'react-native-calendars';
import { getWaterHistory, clearHistory, getProfile } from '../utils/storage';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [goal, setGoal] = useState(2000);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const historyData = await getWaterHistory();
        const profileData = await getProfile();

        setHistory(historyData || []);

        if (profileData && profileData.weight) {
            setGoal(profileData.weight * 35);
        }
    };

    const handleClearHistory = async () => {
        await clearHistory();
        setHistory([]);
    };

    // Получить начало недели для выбранной даты
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
        return new Date(d.setDate(diff));
    };

    // Получить данные за неделю от выбранной даты
    const getWeekData = () => {
        const weekStart = getWeekStart(selectedDate);
        const weekData = [];

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(weekStart);
            currentDate.setDate(weekStart.getDate() + i);
            const dateString = currentDate.toDateString();

            // Ищем запись за этот день
            const dayRecord = history.find(
                (item) => new Date(item.date).toDateString() === dateString
            );

            weekData.push({
                date: currentDate,
                amount: dayRecord ? dayRecord.amount : 0,
                goal: dayRecord ? dayRecord.goal : goal,
            });
        }

        return weekData;
    };

    const weekData = getWeekData();

    // Подготовка данных для диаграммы
    const prepareChartData = () => {
        const labels = weekData.map((item) => {
            const day = item.date.getDate();
            const month = item.date.getMonth() + 1;
            return `${day}.${month}`;
        });

        const data = weekData.map((item) => item.amount || 0);
        const hasData = data.some((value) => value > 0);

        return { labels, data, hasData };
    };

    const chartData = prepareChartData();

    // Отметки для календаря
    const getMarkedDates = () => {
        const marked = {};

        history.forEach((item) => {
            const date = new Date(item.date);
            const dateString = date.toISOString().split('T')[0];
            const percent = (item.amount / item.goal) * 100;

            let color = '#E74C3C'; // Красный
            if (percent >= 100) color = '#27AE60'; // Зелёный
            else if (percent >= 70) color = '#F39C12'; // Оранжевый

            marked[dateString] = {
                marked: true,
                dotColor: color,
            };
        });

        // Выделяем выбранную дату
        const selectedString = selectedDate.toISOString().split('T')[0];
        marked[selectedString] = {
            ...marked[selectedString],
            selected: true,
            selectedColor: '#4A90E2',
        };

        return marked;
    };

    const getStatusIcon = (amount, goal) => {
        const percent = (amount / goal) * 100;
        if (percent >= 100) return '✅';
        if (percent >= 70) return '😊';
        if (percent >= 50) return '😐';
        return '😔';
    };

    const getStatusColor = (amount, goal) => {
        const percent = (amount / goal) * 100;
        if (percent >= 100) return '#27AE60';
        if (percent >= 70) return '#F39C12';
        return '#E74C3C';
    };

    // Форматирование даты для отображения
    const formatWeekRange = () => {
        const start = weekData[0].date;
        const end = weekData[6].date;

        const startStr = `${start.getDate()}.${start.getMonth() + 1}`;
        const endStr = `${end.getDate()}.${end.getMonth() + 1}.${end.getFullYear()}`;

        return `${startStr} - ${endStr}`;
    };

    return (
        <ScrollView style={styles.container}>
            {/* Заголовок */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📊 История потребления</Text>
                <Text style={styles.headerSubtitle}>Записей: {history.length}</Text>
            </View>

            {/* Блок с целью */}
            <View style={styles.goalCard}>
                <Ionicons name="flag" size={20} color="#FFFFFF" />
                <Text style={styles.goalText}>Цель: {goal} мл/день</Text>
            </View>

            {/* Кнопка выбора даты */}
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendar(!showCalendar)}>
                <Ionicons name="calendar" size={20} color="#4A90E2" />
                <Text style={styles.dateButtonText}>
                    Неделя: {formatWeekRange()}
                </Text>
                <Ionicons
                    name={showCalendar ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#4A90E2"
                />
            </TouchableOpacity>

            {/* Календарь */}
            {showCalendar && (
                <View style={styles.calendarContainer}>
                    <Calendar
                        current={selectedDate.toISOString().split('T')[0]}
                        onDayPress={(day) => {
                            setSelectedDate(new Date(day.dateString));
                            setShowCalendar(false);
                        }}
                        markedDates={getMarkedDates()}
                        theme={{
                            todayTextColor: '#4A90E2',
                            selectedDayBackgroundColor: '#4A90E2',
                            selectedDayTextColor: '#ffffff',
                            arrowColor: '#4A90E2',
                        }}
                    />
                    <View style={styles.legendCalendar}>
                        <View style={styles.legendCalendarItem}>
                            <View style={[styles.dot, { backgroundColor: '#27AE60' }]} />
                            <Text style={styles.legendCalendarText}>≥100%</Text>
                        </View>
                        <View style={styles.legendCalendarItem}>
                            <View style={[styles.dot, { backgroundColor: '#F39C12' }]} />
                            <Text style={styles.legendCalendarText}>70-99%</Text>
                        </View>
                        <View style={styles.legendCalendarItem}>
                            <View style={[styles.dot, { backgroundColor: '#E74C3C' }]} />
                            <Text style={styles.legendCalendarText}>&lt;70%</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Диаграмма */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>График на неделю</Text>

                {chartData.hasData ? (
                    <>
                        <View style={styles.chartWrapper}>
                            <BarChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [{ data: chartData.data }],
                                }}
                                width={screenWidth - 72}
                                height={200}
                                yAxisSuffix=" мл"
                                chartConfig={{
                                    backgroundColor: '#FFFFFF',
                                    backgroundGradientFrom: '#FFFFFF',
                                    backgroundGradientTo: '#FFFFFF',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    propsForBackgroundLines: {
                                        stroke: '#E0E0E0',
                                        strokeWidth: 1,
                                    },
                                    propsForLabels: {
                                        fontSize: 9,
                                    },
                                    barPercentage: 0.7,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                }}
                                style={styles.chart}
                                showValuesOnTopOfBars={false}
                                fromZero={true}
                                segments={3}
                            />
                        </View>

                        {/* Компактная легенда */}
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View
                                    style={[styles.legendColor, { backgroundColor: '#4A90E2' }]}
                                />
                                <Text style={styles.legendText}>Выпито</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <Text style={styles.legendText}>Цель: {goal} мл</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataIcon}>📭</Text>
                        <Text style={styles.noDataText}>Нет данных за эту неделю</Text>
                        <Text style={styles.noDataSubtext}>
                            Выберите другую дату или начните добавлять воду
                        </Text>
                    </View>
                )}
            </View>

            {/* Детальная статистика недели */}
            {chartData.hasData && (
                <View style={styles.weekStatsContainer}>
                    <Text style={styles.sectionTitle}>Детали недели</Text>
                    {weekData.map((item, index) => {
                        if (item.amount === 0) return null;

                        const percent = Math.round((item.amount / item.goal) * 100);
                        const statusColor = getStatusColor(item.amount, item.goal);
                        const dayName = item.date.toLocaleDateString('ru-RU', {
                            weekday: 'short',
                        });

                        return (
                            <View key={index} style={styles.weekStatCard}>
                                <View style={styles.weekStatHeader}>
                                    <View>
                                        <Text style={styles.weekStatDay}>{dayName}</Text>
                                        <Text style={styles.weekStatDate}>
                                            {item.date.getDate()}.{item.date.getMonth() + 1}
                                        </Text>
                                    </View>
                                    <Text style={styles.weekStatIcon}>
                                        {getStatusIcon(item.amount, item.goal)}
                                    </Text>
                                </View>

                                <View style={styles.weekStatProgress}>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${Math.min(percent, 100)}%`,
                                                    backgroundColor: statusColor,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.weekStatAmount}>
                                        {item.amount} / {item.goal} мл ({percent}%)
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Кнопка очистки */}
            {history.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearHistory}>
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text style={styles.clearButtonText}>Очистить всю историю</Text>
                </TouchableOpacity>
            )}

            {/* Пустое состояние */}
            {history.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>История пуста</Text>
                    <Text style={styles.emptySubtext}>
                        Начните отслеживать потребление воды!
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    goalCard: {
        backgroundColor: '#4A90E2',
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    dateButton: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 14,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    dateButtonText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    calendarContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legendCalendar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 12,
        backgroundColor: '#F9F9F9',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    legendCalendarItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    legendCalendarText: {
        fontSize: 11,
        color: '#666',
    },
    chartContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    chartWrapper: {
        alignItems: 'center',
        overflow: 'hidden',
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    chart: {
        marginVertical: 4,
        borderRadius: 8,
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    noDataIcon: {
        fontSize: 50,
        marginBottom: 10,
    },
    noDataText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 4,
    },
    noDataSubtext: {
        fontSize: 13,
        color: '#BBB',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 15,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 3,
        marginRight: 5,
    },
    legendText: {
        fontSize: 11,
        color: '#666',
    },
    weekStatsContainer: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    weekStatCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    weekStatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    weekStatDay: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textTransform: 'capitalize',
    },
    weekStatDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    weekStatIcon: {
        fontSize: 20,
    },
    weekStatProgress: {
        marginTop: 4,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
    },
    weekStatAmount: {
        fontSize: 12,
        color: '#666',
    },
    clearButton: {
        flexDirection: 'row',
        backgroundColor: '#E74C3C',
        marginHorizontal: 20,
        marginVertical: 20,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 70,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#BBB',
    },
});