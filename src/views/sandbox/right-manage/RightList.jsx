import React, { useEffect, useState } from 'react'
import { Table, Tag, Button, Modal, Popover, Switch } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;

export default function RightList() {
    // 后端返回的数组
    const [dataSource, setdataSource] = useState([])
    // 从后台获取数据
    useEffect(() => {
        axios.get("http://localhost:5000/rights?_embed=children").then(res => {
            // 如果没有内嵌数据，则不显示+
            const list = res.data
            // 判断list中是否有空数组,是的话返回空字符串
            list.forEach(item => {
                if (item.children.length === 0) {
                    item.children = ""
                }
            })
            setdataSource(list)
        })
    }, [])
    // 读取需要的后台数据
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',//每一列数据的id
            // 加粗样式
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '权限名称',
            dataIndex: 'title',//每一列数据的title
        },
        {
            title: '权限路径',
            dataIndex: 'key',//每一列数据的key
            render: (key) => {
                return <Tag color="blue">{key}</Tag>
            }
        },
        {
            title: '操作',
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />}
                        onClick={() => confirmMethod(item)} />
                    {/* 页面配置项 */}
                    <Popover content={<div style={{ textAlign: "center" }}>
                        {/* checked={item.pagepermisson}如果pagepermisson=1则打开 */}
                        <Switch checked={item.pagepermisson} onChange={() => switchMethod(item)}></Switch>
                        {/* 如果item.pagepermisson === undefined则不能触发禁用配置项 */}
                    </div>} title="页面配置项" trigger={item.pagepermisson === undefined ? '' : 'click'}>
                        {/* 如果item.pagepermisson === undefined则不能禁用配置项 */}
                        <Button type="primary" shape="circle" icon={<EditOutlined />}
                            disabled={item.pagepermisson === undefined} />
                    </Popover>
                </div>
            }
        },
    ];
    // 配置项打开关闭
    const switchMethod = (item) => {
        // 如果pagepermisson=1则改为0
        item.pagepermisson = item.pagepermisson === 1 ? 0 : 1
        setdataSource([...dataSource])
        // 后端，grade如果是一级数据，则更新item.pagepermisson
        if (item.grade === 1) {
            axios.patch(`http://localhost:5000/rights/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        } else {
            axios.patch(`http://localhost:5000/children/${item.id}`, {
                pagepermisson: item.pagepermisson
            })
        }
    }

    // 弹出是否删除确认框
    const confirmMethod = (item) => {
        confirm({
            title: '您确定要删除吗?',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                deleteMethod(item)
            },
            onCancel() {
                // console.log('取消');
            },
        });
    }
    // 删除
    const deleteMethod = (item) => {
        // 当前页面同步状态+后端同步
        // 删除，过滤出与data.id不相等的数据
        // 判断是否是一级数据
        if (item.grade === 1) {
            setdataSource(dataSource.filter(data => data.id !== item.id))//前端
            axios.delete(`http://localhost:5000/rights/${item.id}`)//后端
        } else {
            let list = dataSource.filter(data => data.id === item.rightId)//检索，找到二级数据上一级的rightId
            list[0].children = list[0].children.filter(data => data.id !== item.id)//找到二级数据的id
            setdataSource([...dataSource])
            axios.delete(`http://localhost:5000/rights/children/${item.id}`)//后端

        }
    }
    return (
        <div>
            {/* pagination={{ pageSize: 5 }}每页显示的条数 */}
            <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 5 }} />
        </div>
    )
}
