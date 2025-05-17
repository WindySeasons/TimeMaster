import { Button, Input } from '@rneui/themed';
import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

interface ProjectInputViewProps {
    name: string;
    setName: (val: string) => void;
    desc: string;
    setDesc: (val: string) => void;
    error: string;
    loading: boolean;
    onSubmit: () => void;
}

const ProjectInputView: React.FC<ProjectInputViewProps> = ({
    name,
    setName,
    desc,
    setDesc,
    error,
    loading,
    onSubmit,
}) => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12 }}>
            <Input
                label="项目名称"
                value={name}
                onChangeText={setName}
                placeholder="请输入项目名称"
                errorMessage={error}
                autoFocus
            />
            <Input
                label="描述"
                value={desc}
                onChangeText={setDesc}
                placeholder="用于输入描述（可选）"
                multiline
                numberOfLines={6}
                inputStyle={{ minHeight: 100, textAlignVertical: 'top' }}
            />
            <Button
                title={loading ? '提交中...' : '提交'}
                onPress={onSubmit}
                loading={loading}
                disabled={loading}
                buttonStyle={{ backgroundColor: '#25292e', borderRadius: 6 }}
            />
        </View>
    </KeyboardAvoidingView>
);

export default ProjectInputView;
