import * as React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';

type Props = {
};
const screenWidth = Dimensions.get('window').width;
export default function ProjectView({ }: Props) {
    return (

        <View style={styles.container}>
            <Card style={styles.card}>

                <Card.Content style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={[styles.chipContainer, { flexGrow: 1 }]} style={styles.scrollView} nestedScrollEnabled={true}>
                        <Chip mode="outlined" onPress={() => console.log('Pressed')} style={styles.chip}>Example Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 1')} style={styles.chip}>Star Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 2')} style={styles.chip}>Heart Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 3')} style={styles.chip}>Alert Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 4')} style={styles.chip}>ip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 5')} style={styles.chip}>Close Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 6')} style={styles.chip}>Account Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 7')} style={styles.chip}>Email Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 8')} style={styles.chip}>Phone Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 9')} style={styles.chip}>Calendar Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 10')} style={styles.chip}>Settings Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 1')} style={styles.chip}>Star Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 2')} style={styles.chip}>Heart Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 3')} style={styles.chip}>Alert Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 4')} style={styles.chip}>ip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 5')} style={styles.chip}>Close Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 6')} style={styles.chip}>Account Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 7')} style={styles.chip}>Email Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 8')} style={styles.chip}>Phone Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 9')} style={styles.chip}>Calendar Chip</Chip>
                        <Chip mode="outlined" onPress={() => console.log('Pressed 10')} style={styles.chip}>Settings Chip</Chip>
                    </ScrollView>
                </Card.Content>

                <Button icon="pencil" mode="outlined" onPress={() => console.log('Pressed')} style={styles.button} >
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