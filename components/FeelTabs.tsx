import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';

export interface GroupedType {
    [key: number]: {
        totalDuration: number;
        projects: Record<string, number>;
    };
}

function formatDuration(seconds: number): string {
    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var result = '';
    if (days > 0) result += days + '天';
    if (hours > 0) result += hours + '时';
    if (minutes > 0 || (!days && !hours)) result += minutes + '分';
    return result;
}

interface FeelTabsProps {
    grouped: GroupedType;
}

const FeelTabs: React.FC<FeelTabsProps> = ({ grouped }) => {
    const [tab, setTab] = React.useState<number>(0); // 0:汇总 1:超赞 2:常规 3:待提升
    const tabList = [
        { label: '汇总' },
        { label: '超赞' },
        { label: '常规' },
        { label: '待提升' },
    ];
    // 汇总内容
    const summary = [
        { label: '超赞', value: grouped[3]?.totalDuration || 0 },
        { label: '常规', value: grouped[2]?.totalDuration || 0 },
        { label: '待提升', value: grouped[1]?.totalDuration || 0 },
    ];
    const screenHeight = Dimensions.get('window').height;
    // 项目内容
    const projectContent = (rating: number) => {
        const projects = grouped[rating]?.projects || {};
        const entries = Object.entries(projects);
        if (entries.length === 0) return <View style={{ padding: 12 }}><Text style={{ color: '#888' }}>暂无数据</Text></View>;
        return (
            <ScrollView style={{ height: screenHeight * 0.35, padding: 8 }}>
                {entries.map(([name, duration]) => (
                    <View key={name} style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                        <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold' }}>{name}</Text>
                        <Text style={{ color: '#666', fontSize: 15, fontWeight: 'bold' }}>{formatDuration(duration)}</Text>
                    </View>
                ))}
            </ScrollView>
        );
    };
    return (
        <View style={{ backgroundColor: '#fff', borderRadius: 12, marginTop: 12, padding: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                {tabList.map((t, i) => (
                    <Text key={t.label} onPress={() => setTab(i)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderBottomWidth: tab === i ? 2 : 0, borderColor: '#2196f3', color: tab === i ? '#2196f3' : '#888', fontWeight: tab === i ? 'bold' : 'normal', fontSize: 16 }}>{t.label}</Text>
                ))}
            </View>
            <View>
                {tab === 0 && (
                    <View style={{ padding: 8 }}>
                        {summary.map(item => (
                            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
                                <Text style={{ color: '#222', fontSize: 15, fontWeight: 'bold' }}>{item.label}</Text>
                                <Text style={{ color: '#666', fontSize: 15, fontWeight: 'bold' }}>{formatDuration(item.value)}</Text>
                            </View>
                        ))}
                    </View>
                )}
                {tab === 1 && projectContent(3)}
                {tab === 2 && projectContent(2)}
                {tab === 3 && projectContent(1)}
            </View>
        </View>
    );
};

export default FeelTabs;
