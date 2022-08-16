/* 配置路由 */
import React, { useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import axios from 'axios'
import { Spin } from 'antd';
import { connect } from 'react-redux';
// 引入组件
import Home from '../../views/sandbox/home/Home'
import UserList from '../../views/sandbox/user-manage/UserList'
import RoleList from '../../views/sandbox/right-manage/RoleList'
import RightList from '../../views/sandbox/right-manage/RightList'
import Nopermission from '../../views/sandbox/nopermission/Nopermission'
import NewsAdd from '../../views/sandbox/news-manage/NewsAdd'
import NewsDraft from '../../views/sandbox/news-manage/NewsDraft'
import NewsCategory from '../../views/sandbox/news-manage/NewsCategory'
import Audit from '../../views/sandbox/audit-manage/Audit'
import AuditList from '../../views/sandbox/audit-manage/AuditList'
import Unpublished from '../../views/sandbox/publish-manage/Unpublished'
import Published from '../../views/sandbox/publish-manage/Published'
import Sunset from '../../views/sandbox/publish-manage/Sunset'
import NewsPreview from '../../views/sandbox/news-manage/NewsPreview'
import NewsUpdate from '../../views/sandbox/news-manage/NewsUpdate'
// 创建路由组件
const LocalRouterMap = {
    "/home": Home,
    // 用户
    "/user-manage/list": UserList,
    // 权限
    "/right-manage/role/list": RoleList,
    "/right-manage/right/list": RightList,
    // 新闻
    "/news-manage/add": NewsAdd,
    "/news-manage/draft": NewsDraft,
    "/news-manage/category": NewsCategory,
    "/news-manage/preview/:id": NewsPreview,
    "/news-manage/update/:id": NewsUpdate,
    // 审核
    "/audit-manage/audit": Audit,
    "/audit-manage/list": AuditList,
    // 发布
    "/publish-manage/unpublished": Unpublished,
    "/publish-manage/published": Published,
    "/publish-manage/sunset": Sunset
}

function NewsRouter(props) {
    // 后端返回的列表
    const [BackRouteList, setBackRouteList] = useState([])
    useEffect(() => {
        Promise.all([
            axios.get("http://localhost:5000/rights"),
            axios.get(["http://localhost:5000/children"]),
        ]).then(res => {
            // 获得27个页面的信息
            setBackRouteList([...res[0].data, ...res[1].data])
            console.log(res);
        })
    }, [])
    // 解构出role里面的right
    const { role: { rights } } = JSON.parse(localStorage.getItem("token"))

    // 路由开关
    // pagepermisson是否是侧边栏组件，routepermisson是否是路由组件
    const checkRoute = (item) => {
        return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
    }

    // 管理员权限
    const checkUserPermission = (item) => {
        return rights.includes(item.key)
    }

    return (
        <Spin size="large" spinning={props.isLoading}>
            {/* 注册路由，加载组件 */}
            <Switch >
                {
                    // 根据数组的长度来遍历路径，组件
                    BackRouteList.map(item =>
                    // path路径，component路径所匹配到的组件,exact严格模式，精准路径匹配
                    {
                        // 判断路由开关和管理员权限
                        if (checkRoute(item) && checkUserPermission(item)) {
                            return <Route path={item.key} key={item.key} component={LocalRouterMap[item.key]} exact />
                        }
                        return null
                    }
                    )
                }

                {/* 重定向 */}
                {/* exact：不再进行模糊匹配。如果不是上述的路由，则走NoPermission */}
                <Redirect from='/' to="/home" exact />
                {
                    // 在路径长度>0时渲染404页面，NoPermission组件404
                    // 避免页面刚刷新时出现404
                    BackRouteList.length > 0 && <Route path="*" component={Nopermission} />
                }
            </Switch >
        </Spin>
    )
}

const mapStateToProps = ({ LoadingReducer: { isLoading } }) => {
    // console.log(state)
    return {
        isLoading
    }
}
export default connect(mapStateToProps)(NewsRouter)