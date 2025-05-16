import { Button } from '@rneui/themed';
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { DatePickerModal, registerTranslation, zh } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

// Register Chinese locale
registerTranslation('zh', zh);

const screenWidth = Dimensions.get('window').width;

interface DataPickerViewProps {
    startDate: Date | null;
    endDate: Date | null;
    onRangeChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
    },
    buttonStyle: {
        backgroundColor: '#f5f5f5', // 极简主义浅灰背景
        borderRadius: 3,
    },
    buttonContainer: {
        width: screenWidth * 0.9,
        marginHorizontal: 50,
        marginVertical: 10,
    },
    buttonText: {
        color: '#000', // 黑色字体
        fontSize: 14, // 调整字体大小
    },
});

export default function DataPickerView({ startDate, endDate, onRangeChange }: DataPickerViewProps) {
    const [isVisible, setIsVisible] = useState(false);
    const range = { startDate, endDate };

    const onConfirm = ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => {
        onRangeChange({ startDate: startDate || null, endDate: endDate || null });
        setIsVisible(false);
    };

    // 优化统计周期显示逻辑
    let periodLabel = '今天';
    if (range.startDate && range.endDate) {
        const startStr = range.startDate.toLocaleDateString();
        const endStr = range.endDate.toLocaleDateString();
        const todayStr = new Date().toLocaleDateString();
        if (startStr === todayStr && endStr === todayStr) {
            periodLabel = '今天';
        } else if (startStr === endStr) {
            periodLabel = startStr;
        } else {
            periodLabel = `${startStr} - ${endStr}`;
        }
    }

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <Button
                    title={`统计周期: ${periodLabel}`}
                    onPress={() => setIsVisible(true)}
                    buttonStyle={styles.buttonStyle}
                    containerStyle={styles.buttonContainer}
                    titleStyle={styles.buttonText}
                />
                <DatePickerModal
                    locale="zh"
                    mode="range"
                    visible={isVisible}
                    onDismiss={() => setIsVisible(false)}
                    startDate={range.startDate || undefined}
                    endDate={range.endDate || undefined}
                    onConfirm={onConfirm}
                />
            </View>
        </SafeAreaProvider>
    );
}