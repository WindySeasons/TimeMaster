import { StyleSheet, View } from 'react-native';

type Props = {
    // Define any props your component will accept here
    // Example: title?: string;
};

export default function ProjectView({ }: Props) {
    return (
        <View style={styles.container}>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    // Add other styles as needed
});