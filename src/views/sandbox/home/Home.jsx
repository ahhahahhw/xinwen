import React, { useEffect, useState, useRef } from 'react'
import { Card, Col, Row, List, Avatar, Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios'
import *as Echarts from 'echarts'
import _ from 'lodash'
const { Meta } = Card;

export default function Home() {
    // publishState=2已发布新闻，_order倒序显示
    //用户最常浏览
    const [viewList, setviewList] = useState([])
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category&_sort=view&_order=desc&_limit=6").then(res => {
            // console.log(res.data)
            setviewList(res.data)

        })
    }, [])
    //点赞最多
    const [starList, setstarList] = useState([])
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category&_sort=star&_order=desc&_limit=6").then(res => {
            // console.log(res.data)
            setstarList(res.data)
        })
    }, [])

    // 个人信息卡片
    const { username, region, role: { roleName } } = JSON.parse(localStorage.getItem("token"))
    const barRef = useRef()//柱状图
    const pieRef = useRef()//饼状图
    const [allList, setallList] = useState([])
    // 取回所有的数据
    useEffect(() => {
        axios.get("/news?publishState=2&_expand=category").then(res => {
            // 以新闻分类来分组，调用柱状图，把item.category.title当作实参传给renderBaeView
            renderBarView(_.groupBy(res.data, item => item.category.title))
            setallList(res.data)
        })
        // 清除绑定事件，当柱状图没显示时取消响应式
        return () => {
            window.onresize = null
        }
    }, [])

    // 柱状图
    const renderBarView = (obj) => {
        // 基于准备好的dom，初始化echarts实例
        var myChart = Echarts.init(barRef.current);

        // 指定图表的配置项和数据
        var option = {
            title: {
                text: '新闻分类图示'
            },
            tooltip: {},
            legend: {
                data: ['数量']
            },
            xAxis: {
                data: Object.keys(obj),
                axisLabel: {
                    rotate: "45",//文字45°显示
                    interval: 0//强制显示所有文字
                }
            },
            yAxis: {
                minInterval: 1
            },
            series: [
                {
                    name: '数量',
                    type: 'bar',
                    data: Object.values(obj).map(item => item.length)
                }
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);

        // 柱状图响应式
        window.onresize = () => {
            myChart.resize()
        }
    }
    //饼状图
    const [pieChart, setpieChart] = useState(null)
    const renderPieView = (obj) => {
        // 数据处理工作,点击后显示当前用户访问数据
        var currentList = allList.filter(item => item.author === username)
        var groupObj = _.groupBy(currentList, item => item.category.title)
        // 遍历新闻分类和访问量
        var list = []
        for (var i in groupObj) {
            list.push({
                name: i,
                value: groupObj[i].length
            })
        }
        var myChart;
        // 判断是否是第一次点击，是则重新初始化
        if (!pieChart) {
            myChart = Echarts.init(pieRef.current)
            setpieChart(myChart)
        } else {
            myChart = pieChart
        }
        var option;
        option = {
            title: {
                text: '当前用户新闻分类图示',
                // subtext: '纯属虚构',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
            },
            series: [
                {
                    name: '发布数量',
                    type: 'pie',
                    radius: '50%',
                    data: list,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        option && myChart.setOption(option);
    }

    // 抽屉
    const [visible, setvisible] = useState(false)
    return (
        <div className="site-card-wrapper" >
            <Row gutter={16}>
                <Col span={8}>
                    <Card title="用户最常浏览" bordered={true}>
                        <List
                            size="small"
                            // bordered
                            dataSource={viewList}
                            renderItem={item => <List.Item>
                                <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
                            </List.Item>}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="用户点赞最多" bordered={true}>
                        <List
                            size="small"
                            // bordered
                            dataSource={starList}
                            renderItem={item => <List.Item>
                                <a href={`#/news-manage/preview/${item.id}`}>{item.title}</a>
                            </List.Item>}
                        />
                    </Card>
                </Col>
                {/* 柱状图 */}
                <Col span={8}>
                    <Card
                        cover={
                            <img
                                alt="example"
                                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                            />
                        }
                        actions={[
                            <SettingOutlined key="setting" onClick={() => {
                                // 放在定时器中，异步处理，使饼状图同步
                                setTimeout(() => {
                                    setvisible(true)
                                    // init初始化
                                    renderPieView()
                                }, 0)
                            }} />,
                            <EditOutlined key="edit" />,
                            <EllipsisOutlined key="ellipsis" />,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                            title={username}
                            description={
                                <div>
                                    <b>{region ? region : "全球"}</b>
                                    <span style={{ padding: "30px" }}>
                                        {roleName}</span>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>
            {/* 抽屉 closable允许关闭，setvisible点击关闭时隐藏*/}
            <Drawer width="500px" title="个人新闻分类" placement="right" closable={true}
                onClose={() => {
                    setvisible(false)
                }
                } visible={visible} >
                {/* 饼状图 */}
                < div ref={pieRef} id="main" style={{ width: "100%", height: "400px", marginTop: "30px" }}></div >
            </Drawer >
            {/* 柱状图 */}
            < div ref={barRef} id="main" style={{ width: "100%", height: "400px", marginTop: "30px" }}></div >
        </div >
    )
}
