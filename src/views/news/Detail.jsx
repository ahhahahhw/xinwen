import React, { useEffect, useState } from 'react'
import { PageHeader, Descriptions } from 'antd'
import axios from 'axios'
import { HeartTwoTone } from '@ant-design/icons';
// 格式化创建时间
import monment from 'moment'

export default function Detail(props) {
    const [newsInfo, setnewsInfo] = useState(null)
    useEffect(() => {
        // 获取该发布id下的新闻信息
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`).then(res => {
            setnewsInfo({
                ...res.data,
                view: res.data.view + 1
            })
            // 同步后端
            return res.data
        }).then(res => {
            axios.patch(`/news/${props.match.params.id}`, {
                view: res.view + 1
            })
        })
    }, [props.match.params.id])
    const handleStar = () => {
        setnewsInfo({
            ...newsInfo,
            star: newsInfo.star + 1
        })
        axios.patch(`/news/${props.match.params.id}`, {
            star: newsInfo.star + 1
        })
    }
    return (
        <div>
            {
                newsInfo && <div>
                    <PageHeader
                        onBack={() => window.history.back()}
                        title={newsInfo.title}//新闻标题
                        subTitle={<div>
                            {newsInfo.category.title}
                            <HeartTwoTone twoToneColor="#eb2f96" onClick={() => handleStar()} />
                        </div>}//分类
                    >
                        <Descriptions size="small" column={3}>
                            <Descriptions.Item label="创建者">{newsInfo.author}</Descriptions.Item>

                            {/* 如果文章发布了就显示发布时间 */}
                            <Descriptions.Item label="发布时间">{
                                newsInfo.publishTime ? monment(newsInfo.createTime).format("YYYY/MM/DD HH:mm:ss") : "-"}
                            </Descriptions.Item>

                            <Descriptions.Item label="区域">{newsInfo.region}</Descriptions.Item>

                            <Descriptions.Item label="访问数量">{newsInfo.view}</Descriptions.Item>
                            <Descriptions.Item label="点赞数量">{newsInfo.star}</Descriptions.Item>
                            <Descriptions.Item label="评论数量">0</Descriptions.Item>
                        </Descriptions>
                    </PageHeader>
                    {/* 显示新闻内容去掉html标签 */}
                    <div dangerouslySetInnerHTML={{
                        __html: newsInfo.content
                    }} style={{
                        margin: "0 24px",
                        border: "1px solid gray"
                    }}>
                    </div>
                </div>
            }
        </div>
    )
}
