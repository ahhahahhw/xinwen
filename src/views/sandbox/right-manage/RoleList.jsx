import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Tree } from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
const { confirm } = Modal
export default function RoleList() {
    // 后端返回的数组
    const [dataSource, setdataSource] = useState([])
    const [rightList, setRightList] = useState([])
    const [currentRights, setcurrentRights] = useState([])
    const [currentId, setcurrentId] = useState(0)//状态
    const [isModalVisible, setisModalVisible] = useState(false)//对话框
    // 读取需要的后台数据
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',//每一列数据的id
            // 加粗样式
            render: (id) => {
                return <b>{id}</b>
            }
        },
        {
            title: '角色名称',
            dataIndex: 'roleName'//每一列数据的roleName
        },
        {
            title: "操作",
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />} onClick={() => confirmMethod(item)} />
                    {/* 页面配置项 */}
                    <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => {
                        setisModalVisible(true)
                        setcurrentRights(item.rights)
                        setcurrentId(item.id)
                    }} />
                </div>
            }
        }
    ]
    // 弹出是否删除确认框
    const confirmMethod = (item) => {
        confirm({
            title: '你确定要删除?',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                deleteMethod(item)
            },
            onCancel() {
            },
        });
    }
    //删除
    const deleteMethod = (item) => {
        // 当前页面同步状态+后端同步
        // 删除，过滤出与data.id不相等的数据
        // 判断是否是一级数据
        setdataSource(dataSource.filter(data => data.id !== item.id))//删除本地数据前端
        axios.delete(`http://localhost:5000/roles/${item.id}`)//删除后端数据
    }
    // 从后台取接口数据
    useEffect(() => {
        axios.get("http://localhost:5000/roles").then(res => {
            // console.log(res.data)
            setdataSource(res.data)
        })
    }, [])
    // 从后台取接口数据
    useEffect(() => {
        axios.get("http://localhost:5000/rights?_embed=children").then(res => {
            // console.log(res.data)
            setRightList(res.data)
        })
    }, [])

    // 成功后的处理函数,同步勾选后的状态值
    const handleOk = () => {
        // 隐藏对话框
        setisModalVisible(false)
        // 同步datasource
        setdataSource(dataSource.map(item => {
            // 如果点击的id与currentId一样时，将新的rights覆盖上去
            if (item.id === currentId) {
                return {
                    ...item,//把item展开
                    rights: currentRights//替换成currentRights
                }
            }
            return item
        }))
        // patch
        axios.patch(`http://localhost:5000/roles/${currentId}`, {
            rights: currentRights
        })
    }
    // 失败后的处理函数
    const handleCancel = () => {
        // 关闭对话框
        setisModalVisible(false)
    }
    //改变选项框
    const onCheck = (checkKeys) => {
        setcurrentRights(checkKeys.checked)
    }
    return (
        <div>
            {/* rowKey={(item)=>item.id}指定key值 */}
            <Table dataSource={dataSource} columns={columns}
                rowKey={(item) => item.id}></Table>
            {/* 编辑弹出框 */}
            <Modal title="权限分配" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Tree
                    checkable
                    checkedKeys={currentRights}
                    onCheck={onCheck}//改变选项框
                    checkStrictly={true}//选中状态（区域编辑中的审核新闻）
                    treeData={rightList}
                />
            </Modal>
        </div>
    )
}
