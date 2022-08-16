// 已发布
import React from 'react'
import NewsPubblish from '../../../components/publish-manage/NewsPublish'
import usePublish from '../../../components/publish-manage/usePublish'
import { Button } from 'antd'

export default function Published() {
    // 从usePublish解构出来，2表示已发布
    const { dataSource, handleSunset } = usePublish(2)
    return (
        <div>
            <NewsPubblish dataSource={dataSource}
                button={(id) => <Button danger
                    onClick={() => handleSunset(id)}>下线</Button>}></NewsPubblish>
        </div>
    )
}
