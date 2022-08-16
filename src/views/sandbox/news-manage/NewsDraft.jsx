import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, notification } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons'
const { confirm } = Modal
export default function NewsDraft(props) {
    // 后端返回的数组
    const [dataSource, setdataSource] = useState([])
    // 获取当前登录的用户名
    const { username } = JSON.parse(localStorage.getItem("token"))
    // 从后台取接口数据
    useEffect(() => {
        axios.get(`http://localhost:5000/news?author=${username}&auditState=0&_expand=category`).then(res => {
            const list = res.data
            setdataSource(list)
        })
    }, [username])
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
            title: '新闻标题',
            dataIndex: 'title',//每一列数据的title
            // 点击新闻标题跳转到NewsPreview
            render: (title, item) => {
                return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>
            }
        },
        {
            title: '作者',
            dataIndex: 'author'//每一列数据的author
        },
        {
            title: '新闻分类',
            dataIndex: 'category',//每一列数据的category里的title
            render: ((category) => {
                return category.title
            })
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
                    {/* 页面配置项 */}
                    <Button shape="circle" icon={<EditOutlined />}
                        onClick={() => {
                            props.history.push(`/news-manage/update/${item.id}`)
                        }} />
                    <Button type="primary" shape="circle" icon={<UploadOutlined />}
                        onClick={() => handleCheck(item.id)} />
                </div>
            }
        }
    ];
    const handleCheck = (id) => {
        axios.patch(`/news/${id}`, {
            auditState: 1
        }).then(res => {
            props.history.push('/audit-manage/list')
            notification.info({
                message: `通知`,
                description:
                    `您可以到${'审核列表'}中查看您的新闻`,
                placement: "bottomRight"
            });
        })
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
        setdataSource(dataSource.filter(data => data.id !== item.id))//前端
        axios.delete(`http://localhost:5000/news/${item.id}`)//后端
    }

    return (
        <div>
            {/* pagination={{ pageSize: 5 }}每页显示的条数,rowKey每一个字段都要有id */}
            <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 5 }} rowKey={item => item.id} />
        </div>
    )
}
