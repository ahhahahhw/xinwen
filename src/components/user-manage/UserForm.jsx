import React, { forwardRef, useEffect, useState } from 'react'
import { Form, Input, Select } from 'antd'
const { Option } = Select;
const UserForm = forwardRef((props, ref) => {
    const [isDisabled, setisDisabled] = useState(false)//是否禁用

    // 操作-更新超级管理员区域的禁用权限
    // useEffect重复执行
    useEffect(() => {
        setisDisabled(props.isUpdateDisabled)
    }, [props.isUpdateDisabled])

    const { roleId, region } = JSON.parse(localStorage.getItem("token"))
    // 管理员等级
    const roleObj = {
        "1": "superadmin",
        "2": "admin",
        "3": "editor",
    }
    // 区域
    const checkRegionDisabled = (item) => {
        // 区域--如果需要更新用户信息
        if (props.isUpdate) {
            // 判断是否是超级管理员
            if (roleObj[roleId] === "superadmin") {
                return false
            } else {
                return true
            }
        } else {//添加用户
            // 如果是超级管理员
            if (roleObj[roleId] === "superadmin") {
                return false
            } else {
                return item.value !== region
            }
        }
    }
    // 角色
    const checkRoleDisabled = (item) => {
        // 区域--如果需要更新用户信息
        if (props.isUpdate) {
            // 判断是否是超级管理员
            if (roleObj[roleId] === "superadmin") {
                return false
            } else {
                return true
            }
        } else {//添加用户
            // 如果是超级管理员
            if (roleObj[roleId] === "superadmin") {
                return false
            } else {
                return roleObj[item.id] !== "editor"
            }
        }
    }
    // props.roleList,props.regionList从UserList接收属性
    // forwardRef从UserList传数据给ref接收
    return (
        // From组件，From.Item是每一个表单项
        <Form
            ref={ref}
            layout="vertical"//垂直布局
        >
            <Form.Item
                name="username"
                label="用户名"
                // 表单校验，*
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="password"
                label="密码"
                // 表单校验，*
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="region"
                label="区域"
                // 表单校验，*,判断是否是禁用状态，如果非禁用，则为*必选项
                rules={isDisabled ? [] : [{ required: true, message: 'Please input the title of collection!' }]}
            >
                {/* 区域选择 */}
                <Select disabled={isDisabled}>
                    {
                        // 遍历后台数据regions
                        props.regionList.map(item =>
                            <Option value={item.value} key={item.id}
                                disabled={checkRegionDisabled(item)}>{item.title}</Option>
                        )}
                </Select>
            </Form.Item>
            <Form.Item
                name="roleId"
                label="角色"
                // 表单校验，*
                rules={[{ required: true, message: 'Please input the title of collection!' }]}
            >

                {/* 角色 */}
                <Select onChange={(value) => {
                    // 如果value为1，是超级管理员，则默认全选，禁用区域选择
                    if (value === 1) {
                        setisDisabled(true)
                        // 清空超级管理员的区域的value值
                        ref.current.setFieldsValue({
                            region: ""
                        })
                    } else {
                        setisDisabled(false)
                    }
                }}>
                    {
                        props.roleList.map(item =>
                            <Option value={item.id} key={item.id} disabled={checkRoleDisabled(item)}>{item.roleName}</Option>
                        )
                    }
                </Select>
            </Form.Item>
        </Form>
    )
})
export default UserForm