import DataPickerView from '@/components/DataPickerView';
import ProjectView from '@/components/ProjectView';
import TaskCard from '@/components/TaskCard';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function CardLibraryScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>

            <ProjectView>

            </ProjectView>

            <DataPickerView />
            <TaskCard
                starRating={3}
                taskName="学习学习嘻嘻嘻离开家离开家离开家"
                dueDate="2023-11-15 14:00"
                duration="90分钟"
                taskThoughts="Need to finish the state management section before moving on"
                leftContent={() => <Text>📱</Text>}
            />
            <TaskCard
                starRating={2}
                taskName="Write Documentation"
                dueDate="2023-11-20 09:30"
                duration="45分钟"
                taskThoughts="API reference needs updating with the new endpoints"
                leftContent={() => <Text>📝</Text>}
            />
            <TaskCard
                starRating={1}
                taskName="Team Meeting"
                dueDate="2023-11-10 10:00"
                duration="120分钟"
                taskThoughts="Prepare quarterly roadmap presentation"
                leftContent={() => <Text>👥</Text>}
            />

            <TaskCard
                starRating={3}
                taskName="学习学习嘻嘻嘻离开家离开家离开家"
                dueDate="2023-11-15 14:00"
                duration="90分钟"
                taskThoughts="Need to finish the state management section before moving on"
                leftContent={() => <Text>📱</Text>}
            />
            <TaskCard
                starRating={2}
                taskName="Write Documentation"
                dueDate="2023-11-20 09:30"
                duration="45分钟"
                taskThoughts="API reference needs updating with the new endpoints"
                leftContent={() => <Text>📝</Text>}
            />
            <TaskCard
                starRating={1}
                taskName="Team Meeting"
                dueDate="2023-11-10 10:00"
                duration="120分钟"
                taskThoughts="Prepare quarterly roadmap presentation"
                leftContent={() => <Text>👥</Text>}
            />
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#25292e',
    }

});

