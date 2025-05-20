import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import ProjectTreeCards from '../components/ProjectTreeCards';

export default function TimeChartPage() {
    const params = useLocalSearchParams();
    const tasks = params.tasks ? JSON.parse(params.tasks as string) : [];
    const dateRangeTitle = params.dateRangeTitle ? String(params.dateRangeTitle) : '';

    // 统计两级项目的总时长
    function getProjectDurationTree(tasks: any[]) {
        const result: any = {};
        for (const task of tasks) {
            if (!task.project_name || typeof task.duration !== 'number') continue;
            const parts = (task.project_name as string).split('/').map((s: string) => s.trim()).filter(Boolean);
            if (parts.length == 0) continue;
            const first = parts[0];
            const second = parts[1] || null;
            if (!result[first]) {
                result[first] = { sub: {}, duration: 0 };
            }
            if (second) {
                if (!result[first].sub[second]) {
                    result[first].sub[second] = { duration: 0 };
                }
                // 无论有多少级，全部加到二级和一级
                result[first].sub[second].duration += task.duration;
                result[first].duration += task.duration;
            } else {
                // 没有二级，直接加到一级
                result[first].duration += task.duration;
            }
        }

        // 对一级和二级都按duration从大到小排序
        // 先排序一级
        const sortedFirst = Object.entries(result)
            .sort((a, b) => (b[1] as any).duration - (a[1] as any).duration)
            .map(([k, v]) => [k, v as any]);
        const sortedResult: any = {};
        for (const [first, obj] of sortedFirst) {
            // 排序二级
            const sub = (obj.sub || {}) as Record<string, any>;
            const sortedSub = Object.entries(sub)
                .sort((a, b) => (b[1] as any).duration - (a[1] as any).duration)
                .map(([k, v]) => [k, v as any]);
            const newSub: any = {};
            for (const [second, subObj] of sortedSub) {
                newSub[second] = subObj;
            }
            sortedResult[first] = { ...obj, sub: newSub };
        }
        return sortedResult;
    }

    // 统计一级项目名和duration
    function getPieDataFromTree(tree: any) {
        const data: { name: string; value: number }[] = [];
        let total = 0;
        for (const key in tree) {
            if (tree[key] && typeof tree[key].duration === 'number') {
                data.push({ name: key, value: tree[key].duration });
                total += tree[key].duration;
            }
        }
        return { data, total };
    }

    // 生成tree
    const tree = getProjectDurationTree(tasks);
    const { data: pieData, total } = getPieDataFromTree(tree);

    // 构造 ECharts HTML，标题为 dateRangeTitle
    const chartHtml = `
<!DOCTYPE html>
<html style='background:#fff;' >
<head>
<meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no'>
<style>
html,body{height:100%;margin:0;padding:0;background:#fff;overflow:hidden !important;}
#main{width:100vw;height:340px;max-width:340px;max-height:340px;margin:0 auto 0 auto;background:#fff;overflow:hidden !important;}
h4{color:#222;text-align:center;margin:12px 0 0 0;}
</style>
</head>
<body>
<h4 style="margin-top: 10px;">${dateRangeTitle}</h4>
<div id='main'></div>
<script src='file:///android_asset/echarts/echarts.min.js'></script>
<script>
(function(){
var data = ${JSON.stringify(pieData.map(item => ({
        name: (item.name.length > 3 ? item.name.slice(0, 3) + '...' : item.name) + ' ' + (total ? ((item.value / total * 100).toFixed(1) + '%') : '0%'),
        value: item.value
    })))}
var chart = echarts.init(document.getElementById('main'));
var option = {
  backgroundColor: '#fff',
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      var seconds = Number(params.value) || 0;
      var days = Math.floor(seconds / 86400);
      var hours = Math.floor((seconds % 86400) / 3600);
      var minutes = Math.floor((seconds % 3600) / 60);
      var result = '';
      if (days > 0) result += days + '天';
      if (hours > 0) result += hours + '小时';
      if (minutes > 0) result += minutes + '分钟';
      if (!result) result = '0分钟';
      return params.name + '<br/>' + result;
    }
  },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'], // 缩小半径，留出label空间
    center: ['50%', '55%'], // 向下偏移，避免标题遮挡
    avoidLabelOverlap: false,
    label: {
      show: true,
      formatter: '{b}',
      color: '#222',
      fontSize: 14,
      overflow: 'break',
      alignTo: 'edge',
      edgeDistance: 10
    },
    labelLine: { show: true, length: 18, length2: 18, maxSurfaceAngle: 80, lineStyle: { color: '#888', width: 1.2 } },
    data: data.length ? data : [{name:'暂无数据',value:1}]
  }]
};
chart.setOption(option);
window.addEventListener('resize', function(){chart.resize();});
})();
</script>
</body>
</html>
`;

    React.useEffect(() => {
        console.log('TimeChartPage tasks:', tasks);
        const tree = getProjectDurationTree(tasks);
        console.log('项目时长树:', JSON.stringify(tree, null, 2));
    }, []);

    return (
        <>
            <Stack.Screen options={{
                title: '统计',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerTintColor: '#fff',
            }} />
            <View style={styles.container}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: chartHtml }}
                    style={{ backgroundColor: '#fff', borderRadius: 16, maxWidth: 400, maxHeight: '100%' }}
                    javaScriptEnabled
                    domStorageEnabled
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scalesPageToFit={false}
                />
                <View style={{ flex: 1, maxHeight: 320 }}>
                    <ProjectTreeCards tree={tree} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
    },
    text: {
        color: '#fff',
    },
});