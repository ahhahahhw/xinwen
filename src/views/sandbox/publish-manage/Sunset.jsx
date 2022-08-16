// 已下线
import { Button } from 'antd'
import React from 'react'
import NewsPubblish from '../../../components/publish-manage/NewsPublish'
import usePublish from '../../../components/publish-manage/usePublish'

export default function Sunset() {
    // 从usePublish解构出来，3表示已下线
    const { dataSource, handleDelete } = usePublish(3)
    return (
        <div>
            <NewsPubblish dataSource={dataSource}
                button={(id) => <Button danger
                    onClick={() => handleDelete(id)}>删除</Button>}></NewsPubblish>
        </div>
    )
}
