import React from 'react'
import { Table } from 'antd'

export default function NewsPublish(props) {
    // 读取需要的后台数据
    const columns = [
        {
            title: '新闻标题',
            dataIndex: 'title',//每一列数据的id
            // 加粗样式
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
                    {props.button(item.id)}
                </div>
            }
        },
    ];
    return (
        <div>
            {/* pagination={{ pageSize: 5 }}每页显示的条数 */}
            <Table dataSource={props.dataSource} columns={columns}
                pagination={{ pageSize: 5 }} rowKey={item => item.id} />
        </div>
    )
}
