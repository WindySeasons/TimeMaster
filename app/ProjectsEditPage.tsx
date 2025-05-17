import { BottomSheet, ButtonGroup } from '@rneui/themed';
import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ProjectInputView from '../components/ProjectInputView';
import { ProjectService } from './services/ProjectService';


const screenWidth = Dimensions.get('window').width;

export default function ProjectsEditPage() {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const buttons = ['创建', '删除', '修改', '排序'];
    const [isSheetVisible, setIsSheetVisible] = React.useState(false);
    const [name, setName] = React.useState('');
    const [desc, setDesc] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    // 打开创建弹窗
    React.useEffect(() => {
        // 页面初始 selectedIndex=0，但不弹出 ProjectInputView
        if (selectedIndex === 0 && !firstRenderRef.current) {
            setIsSheetVisible(true);
        }
    }, [selectedIndex]);

    // 首次渲染时不弹出 bottom sheet
    const firstRenderRef = React.useRef(true);
    React.useEffect(() => {
        firstRenderRef.current = false;
    }, []);

    // 仅点击“创建”按钮时弹出 ProjectInputView
    const handleButtonGroupPress = (idx: number) => {
        setSelectedIndex(idx);
        if (idx === 0) setIsSheetVisible(true);
    };

    // 提交创建
    const handleCreate = async () => {
        if (!name.trim()) {
            setError('项目名称必填');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // 查询最大 serial_number
            const projects = await ProjectService.getAllProjects();
            let maxSerial = 0;
            if (projects.length > 0) {
                maxSerial = Math.max(...projects.map(p => p.serial_number));
            }
            const newProject = await ProjectService.createProject(name.trim(), maxSerial + 1, desc.trim() || undefined);
            console.log('创建成功:', newProject);
            setIsSheetVisible(false);
            setName('');
            setDesc('');
        } catch (e) {
            setError('创建失败');
        }
        setLoading(false);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: '项目编辑',
                    headerStyle: {
                        backgroundColor: '#25292e', // 设置与页面背景相同的颜色
                    },
                    headerTintColor: '#fff', // 设置字体为白色
                }}
            />
            <View style={styles.container}>
                <ButtonGroup
                    onPress={handleButtonGroupPress}
                    selectedIndex={selectedIndex}
                    buttons={buttons}
                    containerStyle={{ marginBottom: 24, width: screenWidth * 0.95, alignSelf: 'center', borderRadius: 8 }}
                    buttonStyle={{ backgroundColor: '#25292e' }}
                    selectedButtonStyle={{ backgroundColor: '#ffd33d' }}
                    selectedTextStyle={{ color: '#25292e', fontWeight: 'bold' }}
                    textStyle={{ color: '#fff', fontSize: 16 }}
                />
                <Text style={styles.text}>项目编辑页面</Text>
                <BottomSheet isVisible={isSheetVisible} onBackdropPress={() => setIsSheetVisible(false)}>
                    <ProjectInputView
                        name={name}
                        setName={setName}
                        desc={desc}
                        setDesc={setDesc}
                        error={error}
                        loading={loading}
                        onSubmit={handleCreate}
                    />
                </BottomSheet>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
    },
});
