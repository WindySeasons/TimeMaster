import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import FeelTabs from '../components/FeelTabs';

export default function FeelChartPage() {
    const params = useLocalSearchParams();
    const tasks = params.tasks ? JSON.parse(params.tasks as string) : [];
    const dateRangeTitle = params.dateRangeTitle ? String(params.dateRangeTitle) : '';

    // 按 rating 分类并累加同名项目的 duration，统计每个 rating 的总 duration，并排序
    function groupTasksByRating(tasks: any[]) {
        const result: Record<number, { totalDuration: number; projects: Record<string, number> }> = {};
        for (const task of tasks) {
            if (!task.project_name || typeof task.duration !== 'number' || typeof task.rating !== 'number') continue;
            const rating = task.rating;
            const name = task.project_name;
            if (!result[rating]) result[rating] = { totalDuration: 0, projects: {} };
            if (!result[rating].projects[name]) result[rating].projects[name] = 0;
            result[rating].projects[name] += task.duration;
            result[rating].totalDuration += task.duration;
        }
        // 对每个 rating 内部 projects 按 duration 降序排序
        const sortedResult: Record<number, { totalDuration: number; projects: Record<string, number> }> = {};
        for (const rating in result) {
            const { totalDuration, projects } = result[rating];
            const entries = Object.entries(projects);
            entries.sort((a, b) => b[1] - a[1]);
            const sortedProjects: Record<string, number> = {};
            for (const [name, duration] of entries) {
                sortedProjects[name] = duration;
            }
            sortedResult[rating] = { totalDuration, projects: sortedProjects };
        }
        return sortedResult;
    }

    // 统计分组
    const grouped = groupTasksByRating(tasks);
    // 构造 ECharts 饼图数据
    const pieData = [1, 2, 3].map(rating => ({
        name: rating === 1 ? '待提升' : rating === 2 ? '常规' : '超赞',
        value: grouped[rating]?.totalDuration || 0
    }));
    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    console.log(pieData, total);
    // 构造 ECharts HTML
    const chartHtml = `
<!DOCTYPE html>
<html style='background:#fff;'>
<head>
<meta charset='utf-8'>
<meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no'>
<style>
html,body{height:100%;margin:0;padding:0;background:#fff;overflow:hidden !important;}
#main{width:100vw;height:340px;max-width:340px;max-height:340px;margin:0 auto;background:#fff;overflow:hidden !important;}
h4{color:#222;text-align:center;margin:12px 0 0 0;}
</style>
</head>
<body>
<h4 style="margin-top: 10px;">${dateRangeTitle}</h4>
<div id='main'></div>
<script src='file:///android_asset/echarts/echarts.min.js'></script>
<script>
(function(){
var data = ${JSON.stringify(pieData)};
var total = ${total};

var chart = echarts.init(document.getElementById('main'));
var option = {
  backgroundColor: '#fff',
  tooltip: {
    trigger: 'item',
    formatter: function(params) {
      var percent = total ? ((params.value / total * 100).toFixed(1) + '%') : '0%';
      var seconds = params.value;
      var days = Math.floor(seconds / 86400);
      var hours = Math.floor((seconds % 86400) / 3600);
      var minutes = Math.floor((seconds % 3600) / 60);
      var result = '';
      if (days > 0) result += days + '天';
      if (hours > 0) result += hours + '时';
      if (minutes > 0 || (!days && !hours)) result += minutes + '分';
      return params.name + '     ' + result;
    }
  },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    center: ['50%', '45%'],
    avoidLabelOverlap: false,
    label: {
      show: true,
      formatter: '{b}',
      color: '#222',
      fontSize: 15,
      overflow: 'break',
      alignTo: 'edge',
      edgeDistance: 10
    },
    labelLine: { show: true, length: 18, length2: 18, maxSurfaceAngle: 80, lineStyle: { color: '#888', width: 1.2 } },
    data: (data && data.some(d => d.value > 0)) ? [
      { ...data[0], itemStyle: { color: '#bdbdbd' } }, // 待提升（灰色）
      { ...data[1], itemStyle: { color: '#2196f3' } }, // 常规
      { ...data[2], itemStyle: { color: '#ffd600' } }  // 超赞（黄色）
    ] : [{name:'暂无数据',value:1,itemStyle:{color:'#eee'}}]
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
        const grouped = groupTasksByRating(tasks);
        console.log('按rating分组统计结果:', grouped);
    }, []);

    return (
        <>
            <Stack.Screen
                options={{
                    title: '体验',
                    headerStyle: {
                        backgroundColor: '#25292e', // 设置与页面背景相同的颜色
                    },
                    headerTintColor: '#fff', // 设置字体为白色
                }}
            />
            <View style={styles.container}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: chartHtml }}
                    style={{ backgroundColor: '#fff', borderRadius: 16, width: 400, height: '100%' }}
                    javaScriptEnabled
                    domStorageEnabled
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    scalesPageToFit={false}
                />

                <View style={{ flex: 1, maxHeight: 450 }}>
                    <FeelTabs grouped={grouped} />
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e', // 页面背景颜色
    },
    text: {
        color: '#fff'
    },
});

