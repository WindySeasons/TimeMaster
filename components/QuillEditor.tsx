import * as FileSystem from 'expo-file-system';
import React, { useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';

interface QuillEditorProps {
    value: string;
    onChange?: (value: string) => void;
    style?: any;
}

const quillTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
</head>
<body>
  <div id="editor"></div>
  <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
  <script>
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: [
         [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }]
           
        ]
      }
    });

    // 与React Native通信的桥接
    window.ReactNativeWebView = window.ReactNativeWebView || {
      postMessage: (data) => console.log('Fallback:', data)
    };

    quill.on('text-change', () => {
      const content = quill.root.innerHTML;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'content-change',
        content
      }));
    });
  </script>
</body>
</html>
`;

export default function QuillEditor({ value, onChange, style }: QuillEditorProps) {
    const webviewRef = useRef(null);
    const [html, setHtml] = React.useState<string | null>(null);

    useEffect(() => {
        // 读取模板内容
        (async () => {
            // Expo/React Native: 只能用 FileSystem 读取本地 html
            const templatePath = FileSystem.bundleDirectory
                ? FileSystem.bundleDirectory + 'assets/templates/quill-template.html'
                : FileSystem.documentDirectory + 'templates/quill-template.html';
            try {
                const htmlContent = await FileSystem.readAsStringAsync(templatePath);
                setHtml(htmlContent);
            } catch (e) {
                setHtml('<p>无法加载编辑器模板</p>');
            }
        })();
    }, []);

    // 向 WebView 发送内容
    useEffect(() => {
        if (webviewRef.current && value && html) {
            // 发送 setContents 消息
            (webviewRef.current as any).postMessage(JSON.stringify({ type: 'setContents', value }));
        }
    }, [value, html]);

    // 处理 WebView 消息
    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'textChange' && onChange) {
                onChange(data.value);
            }
        } catch { }
    };

    if (!html) {
        return null;
    }

    return (
        <WebView
            ref={webviewRef}
            originWhitelist={["*"]}
            source={{ html: quillTemplate }}
            style={[{ minHeight: 200, backgroundColor: '#fff' }, style]}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleMessage}
            // 允许 WebView 访问本地资源
            allowFileAccess
            allowUniversalAccessFromFileURLs
            // 禁止缩放
            scalesPageToFit={false}
        />
    );
}
