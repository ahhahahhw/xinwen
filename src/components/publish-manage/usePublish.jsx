// 自定义hooks
import { useEffect, useState } from "react"
import axios from "axios"
import { notification } from 'antd'
function usePublish(type) {
    const { username } = JSON.parse(localStorage.getItem("token"))
    const [dataSource, setdataSource] = useState([])
    useEffect(() => {
        // 请求接口，作者名称，publishState为待发布
        axios(`/news?author=${username}&publishState=${type}&_expand=category`).then(res => {
            setdataSource(res.data)
        })
    }, [username, type])

    // 待发布---点击发布
    const handlePublish = (id) => {
        setdataSource(dataSource.filter(item => item.id !== id))
        axios.patch(`/news/${id}`, {
            "publishState": 2,//已发布
            "publishTime": Date.now()//发布时间
        }).then(res => {
            // auditState=0跳转到新闻管理，auditState=1跳转到审核管理
            // 右下角通知提醒框
            notification.info({
                message: `通知`,
                description:
                    `您可以到已发布作品中查看您的新闻`,
                placement: "bottomRight",
            });
        })
    }
    // 已发布--点击下线
    const handleSunset = (id) => {
        setdataSource(dataSource.filter(item => item.id !== id))
        axios.patch(`/news/${id}`, {
            "publishState": 3,//已下线
        }).then(res => {
            // auditState=0跳转到新闻管理，auditState=1跳转到审核管理
            // 右下角通知提醒框
            notification.info({
                message: `通知`,
                description:
                    `您可以到已下线作品中查看您的新闻`,
                placement: "bottomRight",
            });
        })
    }
    // 已下线---点击删除
    const handleDelete = (id) => {
        setdataSource(dataSource.filter(item => item.id !== id))
        axios.delete(`/news/${id}`).then(res => {
            // auditState=0跳转到新闻管理，auditState=1跳转到审核管理
            // 右下角通知提醒框
            notification.info({
                message: `通知`,
                description:
                    `您已经删除了已下线的新闻`,
                placement: "bottomRight",
            });
        })
    }
    return {
        dataSource, handlePublish, handleSunset, handleDelete
    }
}

export default usePublish