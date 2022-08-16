import React from 'react'
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom'
import Login from '../views/login/Login'
import Detail from '../views/news/Detail'
import News from '../views/news/News'
import NewsSandBox from '../views/sandbox/NewsSandBox'
export default function IndexRouter() {
    return (
        <HashRouter>
            {/* 注册路由，Switch的作用：匹配到第一条之后就不再往下进行匹配 */}
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/news" component={News} />
                <Route path="/detail/:id" component={Detail} />
                {/* render渲染组件到页面中。三目运算：检查localStorage中有
                没有返回token字段，如果有则加载NewsSandBox，如果没有登录则重定向到login */}
                <Route path="/" render={() =>
                    localStorage.getItem("token") ?
                        <NewsSandBox ></NewsSandBox> :
                        <Redirect to="/login" />
                } />
            </Switch>
        </HashRouter>
    )
}
