/* 
    顶部布局
*/
import React from 'react'
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,//侧边栏开关
    UserOutlined,
} from '@ant-design/icons';
// withRouter高阶组件，返回历史数据
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
const { Header } = Layout;

function TopHeader(props) {
    // 侧边栏按钮-点击取反
    const changeCollapsed = () => {
        // 改变state的isCollapsed状态，控制侧边栏打开关闭
        props.changeCollapsed()

    }
    // 登录页跳转过来后，通过解构，获取用户名和管理权限
    const { role: { roleName }, username } = JSON.parse(localStorage.getItem("token"))
    const menu = (
        <Menu>
            <Menu.Item>
                {roleName}
            </Menu.Item>
            {/* 退出登录,replace重定向到login页面 */}
            <Menu.Item danger onClick={() => {
                localStorage.removeItem("token")
                // console.log(props.history)
                props.history.replace("/login")
            }}>退出</Menu.Item>
        </Menu>
    );


    return (
        <Header className="site-layout-background" style={{ padding: '0 16px' }}>
            {/* 三目运算符，this.state.collapsed为真，MenuUnfoldOutlined显示
            this.state.collapsed为假，MenuFoldOutlined显示。控制侧边栏是否折叠,受控与父组件 */}
            {
                props.isCollapsed ? <MenuUnfoldOutlined onClick={changeCollapsed} /> : <MenuFoldOutlined onClick={changeCollapsed} />
            }
            {/* 添加浮动 */}
            <div style={{ float: "right" }}>
                <span>欢迎<span style={{ color: "#1890ff" }}>{username}</span>回来</span>
                <Dropdown overlay={menu}>
                    <Avatar size="large" icon={<UserOutlined />} />
                </Dropdown>
            </div>
        </Header>
    )
}
/* 
    connect(
    //mapStateToProps
    //mapDispatchToProps
    )(被包装的组件)
*/
const mapStateToProps = ({ CollApsedReducer: { isCollapsed } }) => {
    // console.log(state)
    return {
        isCollapsed
    }
}
const mapDispatchToProps = {
    changeCollapsed() {
        return {
            type: "change_collapsed"
            // payload:
        }//action 
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TopHeader))