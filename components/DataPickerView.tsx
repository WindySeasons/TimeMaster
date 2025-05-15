import { Button } from '@rneui/themed';
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { DatePickerModal, registerTranslation, zh } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

// Register Chinese locale
registerTranslation('zh', zh);

const screenWidth = Dimensions.get('window').width;

type DataPickerViewProps = {
    startDate: Date | null;
    endDate: Date | null;
    isVisible: boolean;
    onConfirm: ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => void;
    onDismiss: () => void;
};

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

export default function DataPickerView() {
    const [range, setRange] = useState<{ startDate: Date | null; endDate: Date | null }>({ startDate: null, endDate: null });
    const [isVisible, setIsVisible] = useState(false);

    const onConfirm = ({ startDate, endDate }: { startDate: Date | undefined; endDate: Date | undefined }) => {
        setRange({ startDate: startDate || null, endDate: endDate || null });
        setIsVisible(false);
    };

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <Button
                    title={`统计周期: ${range.startDate && range.endDate
                        ? `${range.startDate.toLocaleDateString()} - ${range.endDate.toLocaleDateString()}`
                        : "今天"
                        }`}
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