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
  <meta charset="utf-8" name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
  <link href="file:///android_asset/quill/quill.snow.css" rel="stylesheet">
  <style>
    #editor {
      width: 100%;
      min-height: 80vh;
      box-sizing: border-box;
    }
    .ql-editor {
      height: 60vh;
      min-height: 80vh;
      max-height: 80vh;
      overflow-y: auto;
      /* 滚动条样式 */
      scrollbar-width: thin;
      scrollbar-color: #25292e #e0e0e0;
    }
    /* Webkit滚动条样式 */
    .ql-editor::-webkit-scrollbar {
      width: 8px;
      background: #e0e0e0;
      border-radius: 4px;
    }
    .ql-editor::-webkit-scrollbar-thumb {
      background:#25292e;
      border-radius: 4px;
    }
    .ql-editor::-webkit-scrollbar-thumb:hover {
      background: #25292e;
    }
  </style>
</head>
<body>
  <div id="editor"></div>
    <script src="file:///android_asset/quill/quill.js"></script>
  <style>
    /* 自定义divider按钮图标样式 */
    .ql-divider::before {
      content: '';
      display: inline-block;
      width: 20px;
      height: 2px;
      background: #444;
      margin: 0 2px 2px 2px;
      vertical-align: middle;
    }
  </style>
  <script>
    // 官方Parchment指南实现divider
    const BlockEmbed = Quill.import('blots/block/embed');
    class DividerBlot extends BlockEmbed {
      static create(value) {
        let node = super.create();
        node.setAttribute('contenteditable', false);
        return node;
      }
    }
    DividerBlot.blotName = 'divider';
    DividerBlot.tagName = 'hr';
    Quill.register(DividerBlot);

    const quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: '过去这段时间感觉怎么样...',
      modules: {
        toolbar: {
          container: [
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            ['divider']
          ],
          handlers: {
            divider: function() {
              const range = this.quill.getSelection(true);
              this.quill.insertEmbed(range.index, 'divider', true, Quill.sources.USER);
              this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
            }
          }
        }
      }
    });

    // 与React Native通信的桥接
    window.ReactNativeWebView = window.ReactNativeWebView || {
      postMessage: (data) => console.log('Fallback:', data)
    };

    // 监听来自RN的消息，设置内容
    document.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setContents') {
          quill.root.innerHTML = data.value || '';
        }
      } catch (e) {}
    });
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'setContents') {
          quill.root.innerHTML = data.value || '';
        }
      } catch (e) {}
    });

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
  const webviewRef = useRef<any>(null);
  const [html, setHtml] = React.useState<string | null>(null);
  // 新增：记录当前编辑器内容，避免重复 setContents
  const editorContentRef = React.useRef<string>('');
  // 新增：标记是否已初始化内容
  const hasInitRef = React.useRef<boolean>(false);

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

  // 只在初始加载或外部 value 变化且和编辑器内容不一致时 setContents
  useEffect(() => {
    if (webviewRef.current && html) {
      if (!hasInitRef.current || (value !== undefined && value !== editorContentRef.current)) {
        (webviewRef.current as any).postMessage(JSON.stringify({ type: 'setContents', value: value || '' }));
        hasInitRef.current = true;
      }
    }
  }, [value, html]);

  // 处理 WebView 消息
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if ((data.type === 'textChange' || data.type === 'content-change')) {
        editorContentRef.current = data.content || data.value || '';
        if (onChange) {
          onChange(editorContentRef.current);
        }
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
      style={[{ backgroundColor: '#fff' }, style]}
      javaScriptEnabled
      domStorageEnabled
      onMessage={handleMessage}
      // 允许 WebView 访问本地资源
      allowFileAccess
      allowUniversalAccessFromFileURLs
      onLoadEnd={() => {
        // WebView加载完毕后再同步一次内容，防止初始化丢失
        if (webviewRef.current) {
          (webviewRef.current as any).postMessage(JSON.stringify({ type: 'setContents', value: value || '' }));
          hasInitRef.current = true;
        }
      }}
    />
  );
}
