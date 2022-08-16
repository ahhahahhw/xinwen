// 待发布
import React from 'react'
import NewsPubblish from '../../../components/publish-manage/NewsPublish'
import usePublish from '../../../components/publish-manage/usePublish'
import { Button } from 'antd'

export default function Unpublished() {
    // 从usePublish解构出来,1表示待发布的
    const { dataSource, handlePublish } = usePublish(1)
    return (
        <div>
            <NewsPubblish dataSource={dataSource}
                button={(id) => <Button type='primary'
                    onClick={() => handlePublish(id)}>发布</Button>}
            ></NewsPubblish>
        </div>
    )
}
