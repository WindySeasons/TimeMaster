import * as React from 'react';
import { useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';

const LeftContent = (props: any) => <Avatar.Icon {...props} icon="folder" />;

type Props = {
    leftContent?: (props: any) => React.ReactNode;
    taskName: string;
    dueDate: string;
    starRating: number; // 1 to 3
    taskThoughts: string;
    duration: string; // New prop for task duration
};

const screenWidth = Dimensions.get('window').width;

export default function TaskCard({ leftContent = LeftContent, taskName, dueDate, starRating, taskThoughts, duration }: Props) {
    const [modalVisible, setModalVisible] = useState(false);
    const displayName = taskName.length > 6 ? `${taskName.substring(0, 6)}...` : taskName;

    return (
        <Card style={styles.card}>
            <Card.Content>
                <IconButton
                    icon="pencil"
                    onPress={() => console.log('Edit pressed')}
                    style={[styles.editIcon, { position: 'absolute', right: 0, top: 0 }]}
                />
                <View style={styles.topRow}>
                    <View style={styles.chip}>
                        <Text variant="bodyMedium" style={styles.chipText}>{dueDate}</Text>
                    </View>
                    <View style={styles.chip}>
                        <Pressable onPress={() => setModalVisible(true)}>
                            <Text variant="bodyMedium" style={styles.chipText}>
                                {displayName} {duration}
                            </Text>
                        </Pressable>
                    </View>
                    <Text variant="bodyMedium" style={styles.rating}>{"★".repeat(starRating)}</Text>
                </View>
                <Text variant="bodyMedium" style={styles.thoughts}>{taskThoughts}</Text>
            </Card.Content>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>{taskName}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Card>
    );
}

const styles = StyleSheet.create({
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
        paddingBottom: 32,
    },
    thoughts: {
        marginTop: 8,
        fontSize: 14,
        color: '#555',
    },
    rating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffcc00',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    chip: {
        backgroundColor: '#e0f7fa',
        flexShrink: 1,
        paddingHorizontal: 4,
        height: 24,
        marginRight: 4,
    },
    chipText: {
        color: '#0288d1',
        fontSize: 10,
    },
    editIcon: {
        transform: [{ scale: 0.8 }],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalText: {
        fontSize: 16,
        color: 'black',
    },
});


