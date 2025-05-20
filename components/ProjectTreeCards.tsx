import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';

// 时间格式化工具
function formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0分钟';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (days > 0) result += days + '天';
    if (hours > 0) result += hours + '小时';
    if (minutes > 0) result += minutes + '分钟';
    if (!result) result = '0分钟';
    return result;
}

// 艺术性配色与icon
const COLORS = ['#ffd33d', '#90caf9', '#ffb74d', '#a5d6a7', '#ce93d8', '#ff8a65', '#b0bec5'];


interface ProjectTreeCardsProps {
    tree: any;
}

const ProjectTreeCards: React.FC<ProjectTreeCardsProps> = ({ tree }) => {
    const firstLevel = Object.entries(tree || {});
    return (
        <FlatList
            data={firstLevel}
            keyExtractor={([name]) => name}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item, index }) => {
                const [name, obj] = item as [string, any];
                const color = COLORS[index % COLORS.length];
                const sub = obj.sub || {};
                const subList = Object.entries(sub);
                return (
                    <Card style={[styles.card, { borderLeftColor: color }]} elevation={4}>
                        <View style={styles.row}>
                            <Text style={[styles.title, { color, textAlign: 'left', flex: 1 }]}>{name}</Text>
                            <Text style={[styles.titleTime]}>{formatDuration(obj.duration)}</Text>
                        </View>
                        <Card.Content>
                            {subList.length > 0 ? subList.map(([subName, subObj], i) => (
                                <View key={subName} style={styles.subRow}>
                                    <Text style={[styles.subName, { textAlign: 'left', flex: 1 }]}>{subName}</Text>
                                    <Text style={styles.subTime}>{formatDuration((subObj as any).duration)}</Text>
                                    {i !== subList.length - 1 && <Divider style={styles.divider} />}
                                </View>
                            )) : null}
                        </Card.Content>
                    </Card>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 6, // 原18/10，调小卡片间距
        borderRadius: 18,
        borderLeftWidth: 7,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 2, // 新增，减少标题上方空白
        marginBottom: 2, // 新增，减少标题下方空白
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 2,
        paddingRight: 2,
    },
    title: {
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: 'serif',
        textAlign: 'left',
        flex: 1,
    },
    titleTime: {
        fontSize: 16,
        color: '#1976d2',
        fontWeight: 'bold',
        fontFamily: 'serif',
        textAlign: 'right',
        marginLeft: 8,
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 0,
        paddingVertical: 0, // 再调小
        paddingHorizontal: 1, // 再调小
        width: '100%',
    },
    subName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        fontFamily: 'serif',
        textAlign: 'left',
        flex: 1,
    },
    subTime: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: 'bold',
        fontFamily: 'serif',
        textAlign: 'right',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginTop: 7,
    },
    empty: {
        color: '#aaa',
        fontStyle: 'italic',
        paddingVertical: 10,
        textAlign: 'center',
    },
});

export default ProjectTreeCards;
