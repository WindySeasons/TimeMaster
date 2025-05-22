import { Button, Input } from '@rneui/themed';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Snackbar } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import QuillEditor from '../components/QuillEditor';
import { addTask } from './services/TaskService';

export default function AdditionalTaskPage() {
    // 初始化state
    const [projectName, setProjectName] = React.useState('');
    const [endTime, setEndTime] = React.useState<number | null>(null);
    const [showDateModal, setShowDateModal] = React.useState(false);
    const [showTimeModal, setShowTimeModal] = React.useState(false);
    const [tempDate, setTempDate] = React.useState<Date | null>(null);
    const [reflection, setReflection] = React.useState('');
    const [rating, setRating] = React.useState<number>(2);
    const router = useRouter();
    const [saving, setSaving] = React.useState(false);
    const saveDebounceRef = React.useRef<any>(null);
    const [snackbarVisible, setSnackbarVisible] = React.useState(false);

    // 持续时间编辑相关
    const [durationDay, setDurationDay] = React.useState(0);
    const [durationHour, setDurationHour] = React.useState(0);
    const [durationMinute, setDurationMinute] = React.useState(0);

    function formatEndTime(ts: number | null) {
        if (!ts) return '';
        const d = new Date(ts * 1000);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${day} ${h}:${min}`;
    }

    // 保存
    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        if (saveDebounceRef.current) {
            clearTimeout(saveDebounceRef.current);
        }
        const duration = (Number(durationDay) || 0) * 86400 + (Number(durationHour) || 0) * 3600 + (Number(durationMinute) || 0) * 60;
        let start_time = Math.floor(Date.now() / 1000);
        if (endTime && duration) {
            start_time = endTime - duration;
        }
        const newTask = {
            project_name: projectName,
            end_time: endTime === null ? undefined : endTime,
            duration,
            reflection,
            rating,
            start_time, // 用结束时间-持续时间
        };
        try {
            await addTask(newTask);
            setSnackbarVisible(true);
            setTimeout(() => {
                setSnackbarVisible(false);
                router.replace('/cardLibrary');
            }, 500);
        } catch (e) {
            Alert.alert('错误', '保存失败，请重试');
        } finally {
            saveDebounceRef.current = setTimeout(() => setSaving(false), 500) as any;
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: '补充记录',
                    headerStyle: { backgroundColor: '#25292e' },
                    headerTintColor: '#fff',
                }}
            />
            <ScrollView style={styles.container} contentContainerStyle={{ padding: 0 }}>
                <Card>
                    {/* 项目名称输入框 紧凑横向 */}
                    <View style={styles.rowWrap}>
                        <RNText style={styles.label}>项目名称</RNText>
                        <Input
                            value={projectName}
                            onChangeText={setProjectName}
                            inputStyle={styles.input}
                            containerStyle={styles.inputContainer}
                            inputContainerStyle={styles.inputInner}
                            renderErrorMessage={false}
                        />
                    </View>
                    {/* 结束时间输入框，优化体验 */}
                    <View style={styles.rowWrap}>
                        <RNText style={styles.label}>结束时间</RNText>
                        <TouchableOpacity onPress={() => setShowDateModal(true)} activeOpacity={0.7} style={{ flex: 1 }}>
                            <Input
                                value={endTime ? formatEndTime(endTime) : ''}
                                editable={false}
                                placeholder="请选择结束时间"
                                inputStyle={styles.input}
                                containerStyle={styles.inputContainer}
                                inputContainerStyle={styles.inputInner}
                                renderErrorMessage={false}
                                rightIcon={endTime ? (
                                    <TouchableOpacity onPress={() => setEndTime(null)}>
                                        <RNText style={{ color: '#bbb', fontSize: 16, paddingHorizontal: 4 }}>✕</RNText>
                                    </TouchableOpacity>
                                ) : <View style={{ width: 20 }} />}
                            />
                        </TouchableOpacity>
                    </View>
                    {/* 日期时间选择器 */}
                    <DatePickerModal
                        locale="zh-CN"
                        mode="single"
                        visible={showDateModal}
                        date={endTime ? new Date(endTime * 1000) : new Date()}
                        onDismiss={() => setShowDateModal(false)}
                        onConfirm={({ date }) => {
                            setShowDateModal(false);
                            if (date) {
                                setTempDate(date as Date);
                                setShowTimeModal(true);
                            }
                        }}
                        saveLabel="确定"
                        label="选择日期"
                        animationType="slide"
                    />
                    <TimePickerModal
                        locale="zh-CN"
                        visible={showTimeModal}
                        hours={tempDate ? tempDate.getHours() : 0}
                        minutes={tempDate ? tempDate.getMinutes() : 0}
                        onDismiss={() => setShowTimeModal(false)}
                        onConfirm={({ hours, minutes }) => {
                            if (tempDate) {
                                const newDate = new Date(tempDate);
                                newDate.setHours(hours);
                                newDate.setMinutes(minutes);
                                newDate.setSeconds(0);
                                setEndTime(Math.floor(newDate.getTime() / 1000));
                            }
                            setShowTimeModal(false);
                        }}
                        label="选择时间"
                        cancelLabel="取消"
                        confirmLabel="确定"
                        animationType="fade"
                    />
                    {/* 持续时间可编辑，分段输入 */}
                    <View style={styles.rowWrap}>
                        <RNText style={styles.label}>持续时间</RNText>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Input
                                value={String(durationDay)}
                                onChangeText={v => setDurationDay(v === '' ? 0 : parseInt(v.replace(/\D/g, ''), 10) || 0)}
                                keyboardType="numeric"
                                inputStyle={[styles.input, { textAlign: 'center', width: 38 }]}
                                containerStyle={{ width: 64, marginRight: 2, marginLeft: 0, padding: 0 }}
                                inputContainerStyle={{ borderBottomWidth: 0, height: 36, margin: 0, padding: 0 }}
                                renderErrorMessage={false}
                                maxLength={3}
                            />
                            <RNText style={{ color: '#888', fontSize: 14, marginRight: 4 }}>D</RNText>
                            <Input
                                value={String(durationHour)}
                                onChangeText={v => setDurationHour(v === '' ? 0 : parseInt(v.replace(/\D/g, ''), 10) || 0)}
                                keyboardType="numeric"
                                inputStyle={[styles.input, { textAlign: 'center', width: 32 }]}
                                containerStyle={{ width: 64, marginRight: 2, marginLeft: 0, padding: 0 }}
                                inputContainerStyle={{ borderBottomWidth: 0, height: 36, margin: 0, padding: 0 }}
                                renderErrorMessage={false}
                                maxLength={2}
                            />
                            <RNText style={{ color: '#888', fontSize: 14, marginRight: 4 }}>H</RNText>
                            <Input
                                value={String(durationMinute)}
                                onChangeText={v => setDurationMinute(v === '' ? 0 : parseInt(v.replace(/\D/g, ''), 10) || 0)}
                                keyboardType="numeric"
                                inputStyle={[styles.input, { textAlign: 'center', width: 32 }]}
                                containerStyle={{ width: 64, marginRight: 2, marginLeft: 0, padding: 0 }}
                                inputContainerStyle={{ borderBottomWidth: 0, height: 36, margin: 0, padding: 0 }}
                                renderErrorMessage={false}
                                maxLength={2}
                            />
                            <RNText style={{ color: '#888', fontSize: 14 }}>M</RNText>
                        </View>
                    </View>
                    {/* 富文本编辑器 */}
                    <View style={{ marginTop: 0, paddingHorizontal: 0 }}>
                        <QuillEditor
                            value={reflection}
                            onChange={setReflection}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                marginBottom: 1,
                                minHeight: 350,
                            }}
                        />
                    </View>
                    {/* 评分功能 */}
                    <View style={styles.ratingRow}>
                        <RNText style={styles.ratingLabel}>你享受这段时间吗：</RNText>
                        {[1, 2, 3].map(star => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={{ marginHorizontal: 2, borderRadius: 12, padding: 2, backgroundColor: rating >= star ? '#ffd33d33' : 'transparent' }}
                                activeOpacity={0.7}
                            >
                                <RNText style={{ fontSize: 28, color: rating >= star ? '#ffd33d' : '#ccc', textShadowColor: rating >= star ? '#ffd33d55' : 'transparent', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                                    ★
                                </RNText>
                            </TouchableOpacity>
                        ))}
                        <RNText style={{ fontSize: 22, marginLeft: 10, fontFamily: 'serif', textShadowColor: '#ffd33d44', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                            {rating === 1 ? '🥶' : rating === 2 ? '🙂' : '😍'}
                        </RNText>
                    </View>
                </Card>
                {/* 保存按钮 */}
                <Button
                    title="保存"
                    buttonStyle={{
                        backgroundColor: saving ? '#ffe066' : '#ffd33d',
                        borderRadius: 12,
                        minHeight: 42,
                        height: 42,
                        paddingVertical: 0,
                        paddingHorizontal: 0,
                        margin: 0,
                        borderWidth: 0,
                        shadowColor: 'transparent',
                        elevation: 0,
                    }}
                    titleStyle={{
                        color: '#25292e',
                        fontWeight: '600',
                        fontSize: 18,
                        letterSpacing: 2,
                        padding: 0,
                        margin: 0,
                        fontFamily: 'serif',
                    }}
                    containerStyle={{
                        marginTop: 14,
                        marginBottom: 12,
                        marginHorizontal: 8,
                        height: 42,
                        padding: 0,
                    }}
                    onPress={handleSave}
                    disabled={saving}
                />
            </ScrollView>
            {/* 浮动艺术Snackbar，居中全屏 */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [{ translateX: -150 }, { translateY: -32 }],
                    width: 300,
                    minHeight: 64,
                    borderRadius: 18,
                    backgroundColor: 'rgba(37,41,46,0.85)',
                    zIndex: 9999,
                    elevation: 10,
                    shadowColor: '#ffd33d',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.18,
                    shadowRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 24,
                    paddingVertical: 18,
                }}
                theme={{ colors: { onSurface: '#ffd33d' } }}
                wrapperStyle={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}
            >
                <RNText style={{ color: '#ffd33d', fontSize: 20, fontWeight: 'bold', letterSpacing: 2, fontFamily: 'serif', textAlign: 'center', textShadowColor: '#fff8', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
                    添加成功
                </RNText>
            </Snackbar>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
    },
    rowWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
        width: '100%',
    },
    label: {
        color: '#000',
        fontSize: 15,
        fontWeight: 'bold',
        marginRight: 10,
        minWidth: 68,
        textAlign: 'right',
        letterSpacing: 1.5,
        fontFamily: 'serif',
        opacity: 0.92,
        paddingVertical: 0,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
    },
    input: {
        fontSize: 14,
        color: '#25292e',
        backgroundColor: '#fff',
        minHeight: 36,
        height: 36,
        margin: 0,
    },
    inputContainer: {
        flex: 1,
        alignItems: 'flex-end',
        minHeight: 36,
        height: 36,
        borderBottomWidth: 0,
    },
    inputInner: {
        minHeight: 36,
        height: 36,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 0,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'transparent',
        shadowColor: '#ffd33d',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
        gap: 6,
    },
    ratingLabel: {
        color: '#25292e',
        fontSize: 10,
        fontWeight: 'bold',
        marginRight: 8,
        fontFamily: 'serif',
        letterSpacing: 1,
    },
});
