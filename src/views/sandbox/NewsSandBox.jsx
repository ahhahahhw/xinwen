import React, { useEffect } from 'react'
// 进度条
import NProgress from 'nprogress'
import SideMenu from '../../components/sandbox/SideMenu'
import TopHeader from '../../components/sandbox/TopHeader'
import NewsRouter from '../../components/sandbox/NewsRouter'
// css
import './NewsSandBox.css'
import 'nprogress/nprogress.css'
// antd
import { Layout } from 'antd'

const { Content } = Layout

export default function NewsSandBox() {
    // 当路由路径切换，显示进度条
    NProgress.start()
    // 渲染完成后消失
    useEffect(() => {
        NProgress.done()
    })
    return (
        <Layout>
            {/* 左侧边栏 */}
            <SideMenu></SideMenu>
            <Layout className="site-layout">
                {/* 导航栏 */}
                <TopHeader></TopHeader>

                {/* 显示加载部分 */}
                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        overflow: "auto"//滚动条
                    }}
                >
                    <NewsRouter></NewsRouter>
                </Content>
            </Layout>
        </Layout >
    )
}