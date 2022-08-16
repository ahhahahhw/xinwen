import React, { useState, useEffect, useRef } from 'react'
import { Button, Table, Modal, Switch } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import UserForm from '../../../components/user-manage/UserForm'
const { confirm } = Modal

export default function UserList() {
    // 后端返回的数组
    const [dataSource, setdataSource] = useState([])
    const [isAddVisible, setisAddVisible] = useState(false)
    const [isUpdateVisible, setisUpdateVisible] = useState(false)//是否更新
    const [roleList, setroleList] = useState([])
    const [regionList, setregionList] = useState([])
    const [current, setcurrent] = useState(null)//保存更新的状态

    const addForm = useRef(null)//UserForm表单
    const updateForm = useRef(null)//UserForm表单
    const [isUpdateDisabled, setisUpdateDisabled] = useState(false)//超级管理员禁用

    const { roleId, username, region } = JSON.parse(localStorage.getItem("token"))

    // 从后台获取数据
    useEffect(() => {
        // 管理员等级
        const roleObj = {
            "1": "superadmin",
            "2": "admin",
            "3": "editor",
        }

        axios.get("http://localhost:5000/users?_expand=role").then(res => {
            // 如果没有内嵌数据，则不显示+
            const list = res.data
            // 判断是哪个级别的管理员，如果是superadmin显示全部list
            setdataSource(roleObj[roleId] === "superadmin" ? list : [
                ...list.filter(item => item.username === username),
                ...list.filter(item => item.region === region && roleObj[item.roleId] === "editor")
            ])
        })
    }, [roleId, username, region])

    useEffect(() => {
        axios.get("http://localhost:5000/regions").then(res => {
            // 如果没有内嵌数据，则不显示+
            const list = res.data
            setregionList(list)
        })
    }, [])

    useEffect(() => {
        axios.get("http://localhost:5000/roles").then(res => {
            // 如果没有内嵌数据，则不显示+
            const list = res.data
            setroleList(list)
        })
    }, [])
    // 读取需要的后台数据
    const columns = [
        {
            title: '区域',
            dataIndex: 'region',//每一列数据的region
            // filters是所有的可筛选项
            filters: [
                ...regionList.map(item => ({
                    text: item.title,
                    value: item.value
                })),
                {
                    title: "全球",
                    value: "全球"
                }
            ],

            // 筛选出filters出来的数据,如果是全球，返回空字段
            onFilter: (value, item) => {
                if (value === "全球") {
                    return item.region === ""
                }
                return item.region === value
            },

            // 加粗样式
            render: (region) => {
                // region===""?'全球':region如果为空值（超级管理员）则显示全球
                return <b>{region === "" ? '全球' : region}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'role',//渲染出role里面的roleName
            render: (role) => {
                return role?.roleName
            }
        },
        {
            title: "用户名",
            dataIndex: 'username'//每一列数据的username
        },
        {
            title: "用户状态",
            dataIndex: 'roleState',//每一列数据的username
            // 如果roleState返回的是true，则打开开关
            // disabled={item.default}如果数据为default不可更改，则禁用按钮
            render: (roleState, item) => {
                return <Switch checked={roleState}
                    disabled={item.default} onChange={() => handleChange(item)}></Switch>
            }
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />}
                        onClick={() => confirmMethod(item)} disabled={item.default} />
                    {/* 页面配置项 */}
                    <Button type="primary" shape="circle" icon={<EditOutlined />}
                        disabled={item.default} onClick={() => handleUpdate(item)} />
                </div>
            }
        }
    ];
    // 编辑更新操作用户信息
    const handleUpdate = (item) => {
        // 放在异步中，setisUpdateVisible变成同步
        setTimeout(() => {
            // 状态更新是不同步的
            setisUpdateVisible(true)
            // 如果是超级管理员，则禁用
            if (item.roleId === 1) {
                setisUpdateDisabled(true)
            } else {
                setisUpdateDisabled(false)
            }
            // setFieldsValue()把之前的值设定回去
            updateForm.current.setFieldsValue(item)
        }, 0)
        setcurrent(item)//保存更新的信息
    }

    // 修改用户状态
    const handleChange = (item) => {
        item.roleState = !item.roleState
        setdataSource([...dataSource])
        axios.patch(`http://localhost:5000/users/${item.id}`, {
            roleState: item.roleState
        })
    }

    // 弹出是否删除确认框
    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除?',
            icon: <ExclamationCircleOutlined />,
            // content: 'Some descriptions',
            onOk() {
                //   console.log('OK');
                deleteMethod(item)
            },
            onCancel() {
                //   console.log('Cancel');
            },
        });
    }
    //删除
    const deleteMethod = (item) => {
        // 当前页面同步状态+后端同步
        // 删除，过滤出与data.id不相等的数据
        setdataSource(dataSource.filter(data => data.id !== item.id))
        axios.delete(`http://localhost:5000/users/${item.id}`)
    }
    // 操作-更新用户信息
    const updateFormOK = () => {
        updateForm.current.validateFields().then(value => {
            setisUpdateVisible(false)
            setdataSource(dataSource.map(item => {
                // 如果id是相同订单，更新数据信息
                if (item.id === current.id) {
                    return {
                        ...item,
                        ...value,
                        // 修复每次需要刷新页面才能显示角色名称的bug
                        role: roleList.filter(data => data.id === value.roleId)[0]
                    }
                }
                // 否则返回原数据
                return item
            }))
            setisUpdateDisabled(!isUpdateDisabled)
            axios.patch(`http://localhost:5000/users/${current.id}`, value)
        })
    }

    // 添加用户-提交表单后
    const addFormOK = () => {
        addForm.current.validateFields().then(value => {
            // 隐藏模态框
            setisAddVisible(false)
            // 重置表单内容
            addForm.current.resetFields()

            //post到后端，生成id，再设置 datasource, 方便后面的删除和更新
            axios.post(`http://localhost:5000/users`, {
                ...value,
                "roleState": true,//用户状态，是否打开按钮
                "default": false,//是否禁用按钮
            }).then(res => {
                console.log(res.data)
                // 显示dataSource的数据，并遍历出新数据
                setdataSource([...dataSource, {
                    ...res.data,
                    // 修复每次需要刷新页面才能显示角色名称的bug
                    role: roleList.filter(item => item.id === value.roleId)[0]
                }])
            })
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div>
            <Button type="primary" onClick={() => {
                setisAddVisible(true)
            }}>添加用户</Button>
            {/* pagination={{ pageSize: 5 }}每页显示的条数,rowKey指定key值 */}
            <Table dataSource={dataSource} columns={columns}
                pagination={{
                    pageSize: 5
                }}
                rowKey={item => item.id}
            />
            {/* 点击添加用户后弹出表单 */}
            <Modal
                visible={isAddVisible}//判断添加or删除,显示or隐藏
                title="添加用户"
                okText="确定"
                cancelText="取消"
                // 弹出对话框表单
                onCancel={() => {
                    setisAddVisible(false)
                }}
                // 点击确认是调用addFormOK()
                onOk={() => addFormOK()}
            >
                {/* From组件，From.Item是每一个表单项 */}
                <UserForm regionList={regionList} roleList={roleList} ref={addForm}></UserForm>
            </Modal>
            {/* 点击操作后弹出表单 */}
            <Modal
                visible={isUpdateVisible}//判断添加or删除,显示or隐藏
                title="更新用户"
                okText="更新"
                cancelText="取消"
                // 弹出对话框表单
                onCancel={() => {
                    setisUpdateVisible(false)
                    setisUpdateDisabled(!isUpdateDisabled)//点击取消是不改变状态
                }}
                // 点击确认是调用addFormOK()
                onOk={() => updateFormOK()}
            >
                {/* From组件，From.Item是每一个表单项,isUpdate是否更新 */}
                <UserForm regionList={regionList}
                    roleList={roleList} ref={updateForm}
                    isUpdateDisabled={isUpdateDisabled} isUpdate={true}></UserForm>
            </Modal>
        </div>
    )
}
