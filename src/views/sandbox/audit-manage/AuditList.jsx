import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, Button, Tag, notification } from 'antd'

export default function AuditList(props) {
    const { username } = JSON.parse(localStorage.getItem("token"))
    const [dataSource, setdataSource] = useState([])
    // const [columns, setColumns] = useState(second)
    useEffect(() => {
        // 选出所有新闻中，作者名称和auditState审核状态不等于0，publishState_lte发布状态小于等于1的信息
        axios(`/news?author=${username}&auditState_ne=0&publishState_lte=1&_expand=category`).then(res => {
            // console.log(res.data);
            setdataSource(res.data)
        })
    }, [username])
    // 读取需要的后台数据
    const columns = [
        {
            title: '新闻标题',
            dataIndex: 'title',//每一列数据的id
            // 点击跳转到详情页
            render: (title, item) => {
                return <a href={`#/news-manage/preview/${item.id}`}>{title}</a>
            }
        },
        {
            title: '作者',
            dataIndex: 'author',//每一列数据的title
        },
        {
            title: '新闻分类',
            dataIndex: 'category',//每一列数据的key
            render: (category) => {
                return <div>{category.title}</div>
            }
        },
        {
            title: '审核状态',
            dataIndex: 'auditState',//每一列数据的key
            // 审核状态显示的文字和颜色
            render: (auditState) => {
                const colorList = ["", 'orange', 'green', 'red']
                const auditList = ["草稿箱", "审核中", "已通过", "未通过"]
                return <Tag color={colorList[auditState]}>{auditList[auditState]}</Tag>
            }
        },
        {
            title: '操作',
            render: (item) => {
                return <div>
                    {
                        item.auditState === 1 && <Button onClick={() => {
                            handleRervert(item)
                        }}>撤销</Button>
                    }
                    {
                        item.auditState === 2 && <Button danger onClick={() => { handlePublish(item) }}>发布</Button>
                    }
                    {
                        item.auditState === 3 && <Button type='primary' onClick={() => { handleUpdate(item) }}>更新</Button>
                    }
                </div>
            }
        },
    ];
    // 撤销功能,撤回到草稿箱
    const handleRervert = (item) => {
        // 把不相等的id过滤出来并删除
        setdataSource(dataSource.filter(data => data.id !== item.id))
        axios.patch(`/news/${item.id}`, {
            auditState: 0
        }).then(res => {
            notification.info({
                message: `通知`,
                description:
                    `您可以到草稿箱中查看您的新闻`,
                placement: "bottomRight"
            });
        })
    }
    // 更新功能，不通过的文章重新处理
    const handleUpdate = (item) => {
        props.history.push(`/news-manage/update/${item.id}`)
    }
    // 发布功能
    const handlePublish = (item) => {
        axios.patch(`/news/${item.id}`, {
            "publishState": 2,//已发布
            "publishTime": Date.now()//发布时间
        }).then(res => {
            // auditState=0跳转到新闻管理，auditState=1跳转到审核管理
            props.history.push('/publish-manage/published')
            // 右下角通知提醒框
            notification.info({
                message: `通知`,
                description:
                    `您可以到已发布作品中查看您的新闻`,
                placement: "bottomRight",
            });
        })
    }
    return (
        <div>
            {/* pagination={{ pageSize: 5 }}每页显示的条数 */}
            <Table dataSource={dataSource} columns={columns}
                pagination={{ pageSize: 5 }} rowKey={item => item.id} />
        </div>
    )
}