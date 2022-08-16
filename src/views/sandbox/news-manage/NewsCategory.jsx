// 新闻分类
import React, { useEffect, useState, useRef, useContext } from 'react'
import { Table, Button, Modal, Form, Input } from 'antd'
import axios from 'axios'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
const { confirm } = Modal;
const EditableContext = React.createContext(null);

export default function NewsCategory() {
    // 后端返回的数组
    const [dataSource, setdataSource] = useState([])
    // 从后台获取数据
    useEffect(() => {
        axios.get("/categories").then(res => {
            setdataSource(res.data)
        })
    }, [])
    // 点击后将title和value替换为修改后的值
    const handleSave = (record) => {
        setdataSource(dataSource.map(item => {
            if (item.id === record.id) {
                return {
                    id: item.id,
                    title: record.title,
                    value: record.title
                }
            }
            return item
        }))
        axios.patch(`/categories/${record.id}`, {
            title: record.title,
            value: record.title
        })
    }
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
            title: '栏目名称',
            dataIndex: 'title',//每一列数据的title
            onCell: (record) => ({
                record,
                editable: true,
                dataIndex: 'title',
                title: '栏目名称',
                handleSave: handleSave,
            }),
        },
        {
            title: '操作',
            render: (item) => {
                return <div>
                    <Button danger shape="circle" icon={<DeleteOutlined />}
                        onClick={() => confirmMethod(item)} />
                </div>
            }
        },
    ];
    // 弹出是否删除确认框
    const confirmMethod = (item) => {
        confirm({
            title: '您确定要删除吗?',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                deleteMethod(item)
            },
            onCancel() {
                // console.log('取消');
            },
        });
    }
    // 删除
    const deleteMethod = (item) => {
        // 当前页面同步状态+后端同步
        // 删除，过滤出与data.id不相等的数据
        setdataSource(dataSource.filter(data => data.id !== item.id))//前端
        axios.delete(`/categories/${item.id}`)//后端
    }

    // 栏目名称可编辑模块
    const EditableRow = ({ index, ...props }) => {
        const [form] = Form.useForm();
        return (
            <Form form={form} component={false}>
                {/* 通过EditableContext把编辑的信息传进去 */}
                <EditableContext.Provider value={form}>
                    <tr {...props} />
                </EditableContext.Provider>
            </Form>
        );
    };
    const EditableCell = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        ...restProps
    }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef(null);
        const form = useContext(EditableContext);
        // 校验状态为真则获取焦点
        useEffect(() => {
            if (editing) {
                inputRef.current.focus();
            }
        }, [editing]);

        const toggleEdit = () => {
            setEditing(!editing);
            form.setFieldsValue({
                [dataIndex]: record[dataIndex],
            });
        };

        const save = async () => {
            try {
                const values = await form.validateFields();
                toggleEdit();
                handleSave({ ...record, ...values });
            } catch (errInfo) {
                console.log('Save failed:', errInfo);
            }
        };

        let childNode = children;

        if (editable) {
            childNode = editing ? (
                <Form.Item
                    style={{
                        margin: 0,
                    }}
                    name={dataIndex}
                    rules={[
                        {
                            required: true,
                            message: `${title} is required.`,
                        },
                    ]}
                >
                    <Input ref={inputRef} onPressEnter={save} onBlur={save} />
                </Form.Item>
            ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{
                        paddingRight: 24,
                    }}
                    onClick={toggleEdit}
                >
                    {children}
                </div>
            );
        }
        return <td {...restProps}>{childNode}</td>;
    };
    return (
        <div>
            {/* pagination={{ pageSize: 5 }}每页显示的条数 */}
            <Table dataSource={dataSource} columns={columns}
                pagination={{ pageSize: 5 }} rowKey={item => item.id}
                // 栏目名称可编辑组件
                components={{
                    body: {
                        row: EditableRow,
                        cell: EditableCell,
                    }
                }}
            />
        </div>
    )
}
