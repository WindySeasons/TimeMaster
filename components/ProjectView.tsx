import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import { ProjectService } from '../app/services/ProjectService';

type Props = {
};
const screenWidth = Dimensions.get('window').width;
export default function ProjectView({ }: Props) {
    const [projects, setProjects] = React.useState<{ id: number; name: string; serial_number: number; description?: string }[]>([]);
    const router = useRouter();
    const debounceRef = React.useRef<any>(null); // 兼容 web/原生 setTimeout
    const handleEditProjects = React.useCallback(() => {
        if (debounceRef.current) return;
        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
        }, 800);
        router.push('/ProjectsEditPage');
    }, [router]);

    // 页面切换到 cardLibrary 时自动刷新项目数据
    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const data = await ProjectService.getAllProjects();
                setProjects(data);
            })();
        }, [])
    );

    return (

        <View style={styles.container}>
            <Card style={styles.card}>

                <Card.Content style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={[styles.chipContainer, { flexGrow: 1 }]} style={styles.scrollView} nestedScrollEnabled={true}>
                        {projects.map(project => (
                            <Chip key={project.id} mode="outlined" style={styles.chip}>{project.name}</Chip>
                        ))}
                    </ScrollView>
                </Card.Content>

                <Button icon="pencil" mode="outlined" onPress={handleEditProjects} style={styles.button} >
                    编辑预设项目
                </Button>
            </Card>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        marginVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: screenWidth * 0.9,
        alignSelf: 'center',
        paddingBottom: 32, // Increased padding to leave more space below <Card.Content>
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingBottom: 32,
        // Removed maxHeight to allow full scrolling
    },
    scrollView: {
        maxHeight: 150, // Set max height for ScrollView itself if needed
    },
    chip: {
        marginVertical: 0,
        paddingHorizontal: 0,
        paddingVertical: 0,
        height: 40, // Smaller height
        borderRadius: 100, // Adjusted for proportion
    },
    button: {
        backgroundColor: '#f9f9f9',
        //borderColor: '#EE82EE', // Bright purple border color
        //color: '#EE82EE', // Bright purple text color
        width: '60%',
        alignSelf: 'center',
        marginTop: 16,
    },
});