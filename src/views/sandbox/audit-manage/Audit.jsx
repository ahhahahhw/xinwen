import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, Button, notification } from 'antd'
export default function Audit() {
    const [dataSource, setdataSource] = useState([])
    const { roleId, username, region } = JSON.parse(localStorage.getItem("token"))
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
            title: '操作',
            render: (item) => {
                return <div>
                    <Button type='primary' onClick={() => handleAudit(item, 2, 1)}>通过</Button>
                    <Button danger onClick={() => handleAudit(item, 3, 0)}>驳回</Button>
                </div >
            }
        },
    ];
    // 操作功能
    const handleAudit = (item, auditState, publishState) => {
        // 不管审核通过还是驳回，都删除该记录
        setdataSource(dataSource.filter(data => data.id !== item.id))
        // 点击通过时，把auditState改为2，publishState改为1
        // 点击驳回时，把auditState改为3，publishState改为0
        axios.patch(`/news/${item.id}`, {
            auditState,
            publishState
        }).then(res => {
            // 右下角通知提醒框
            notification.info({
                message: `通知`,
                description:
                    `您可以到审核列表中查看您的新闻的审核状态`,
                placement: "bottomRight",
            });
        })
    }
    useEffect(() => {
        // 管理员等级
        const roleObj = {
            "1": "superadmin",
            "2": "admin",
            "3": "editor",
        }
        // 获取待审核状态
        axios.get(`/news?auditState=1&_expand=category`).then(res => {
            // 如果没有内嵌数据，则不显示+
            const list = res.data
            // 判断是哪个级别的管理员，如果是superadmin显示全部list
            setdataSource(roleObj[roleId] === "superadmin" ? list : [
                ...list.filter(item => item.author === username),
                ...list.filter(item => item.region === region && roleObj[item.roleId] === "editor")
            ])
        })
    }, [roleId, username, region])
    return (
        <div>
            <Table dataSource={dataSource} columns={columns}
                pagination={{ pageSize: 5 }} rowKey={item => item.id} />
        </div>
    )
}
