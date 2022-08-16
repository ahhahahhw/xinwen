/* 
    左侧边栏
*/
import React, { useEffect, useState } from 'react'
import { Layout, Menu } from 'antd';
import './index.css'
import axios from 'axios';
import { connect } from 'react-redux';
// withRouter高阶组件，返回历史数据
import { withRouter } from 'react-router-dom'
// 引入图标
import { UserOutlined, HomeOutlined, SettingOutlined, ProfileOutlined, InsertRowBelowOutlined, AuditOutlined } from '@ant-design/icons';
const { Sider } = Layout;
const { SubMenu } = Menu

//模拟数据，根据路径，取侧边栏图标
const iconList = {
    "/home": <HomeOutlined />,
    "/user-manage": <UserOutlined />,//用户管理一级菜单栏
    "/right-manage": <SettingOutlined />,//权限管理
    "/news-manage": <ProfileOutlined />,//新闻管理
    "/audit-manage": <AuditOutlined />,//审核管理
    "/publish-manage": <InsertRowBelowOutlined />,//发布管理
}

function SideMenu(props) {

    // 将后台数据渲染到页面中
    const [menu, setMenu] = useState([])
    // 获取db.json服务器数据，?_embed=children：向下关联与rights绑定的children
    useEffect(() => {
        axios.get("http://localhost:5000/rights?_embed=children").then(res => {
            // console.log(res.data)
            setMenu(res.data)
        })
    }, [])

    // 登录页跳转过来后，通过解构，获取用户名和管理权限
    const { role: { rights } } = JSON.parse(localStorage.getItem("token"))
    // pagepermisson:从后台数据中选择pagepermisson=1的作为内嵌菜单栏
    const checkPagePermisson = (item) => {
        // 当前登录用户的权限列表，根据不同管理员权限，显示不同页面信息
        return item.pagepermisson && rights.includes(item.key)
    }

    // 渲染menuList菜单
    const renderMenu = (menuList) => {
        return menuList.map(item => {
            // 判断是否有内嵌菜单，判断pagepermisson=1
            // item.children?.length > 0，es6链式判断，如果item.children为假，就不会继续执行
            if (item.children?.length > 0 && checkPagePermisson(item)) {
                return <SubMenu key={item.key} icon={iconList[item.key]} title={item.title}>
                    {/* 递归 */}
                    {renderMenu(item.children)}
                </SubMenu>
            }
            // 判断pagepermisson=1
            return checkPagePermisson(item) && <Menu.Item key={item.key} icon={iconList[item.key]} onClick={() => {
                //  console.log(props)
                // 路由传递props对象，跳转页面
                props.history.push(item.key)
            }}>{item.title}</Menu.Item>
        })
    }
    // 刷新页面后依旧显示当前路径
    const selectKeys = [props.location.pathname]
    // ["/" + props.location.pathname.split("/")[1]拼接截取一级菜单栏key，刷新页面后当前菜单栏显示高亮
    const openKeys = ["/" + props.location.pathname.split("/")[1]]

    return (
        // collapsible:可折叠的;collapsed通过返回值判断侧边栏是否折叠
        <Sider trigger={null} collapsible collapsed={props.isCollapsded} >
            {/* 样式：侧边栏滚动条 */}
            <div style={{ display: "flex", height: "100%", "flexDirection": "column" }}>
                <div className="logo" >全球新闻发布管理系统</div>
                <div style={{ flex: 1, "overflow": "auto" }}>
                    {/* theme主题，mode侧边栏竖直显示，selectedKeys（受控组件，重定向后仍会根据新的值重新选中）菜单栏key */}
                    {/* defaultOpenKeys初始展开菜单栏 */}
                    <Menu theme="dark" mode="inline" selectedKeys={selectKeys} className="aaaaaaa" defaultOpenKeys={openKeys}>
                        {renderMenu(menu)}
                    </Menu>
                </div>
            </div>
        </Sider>
    )
}
const mapStateToProps = ({ CollApsedReducer: { isCollapsed } }) => ({
    isCollapsed
})
// 用高阶组件包裹低阶组件，将低阶组件包装成高阶组件，从而获得props.history
export default connect(mapStateToProps)(withRouter(SideMenu))