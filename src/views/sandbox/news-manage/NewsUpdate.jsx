import React, { useEffect, useState, useRef } from 'react'
import { PageHeader, Steps, Button, Form, Input, Select, message, notification } from 'antd'
import style from './News.module.css'
import axios from 'axios'
import NewsEditor from '../../../components/news-manage/NewsEditor'
const { Step } = Steps
const { Option } = Select

export default function NewsUpdate(props) {
    /* 
        categoryId新闻分类
        roleId角色ID
        auditState审核状态,0未审核，1正在审核，2已通过,3未通过
        publishState发布状态
        star点赞数量
        view查看数量
    */
    const [current, setCurrent] = useState(0)//下一步上一步按钮
    const [categoryList, setCategoryList] = useState([])

    const [formInfo, setformInfo] = useState({})
    const [content, setContent] = useState("")//内容

    // const User = JSON.parse(localStorage.getItem("token"))
    const handleNext = () => {
        // 如果是在第一步，判断是否填写完毕,没有写完不能跳转下一步
        if (current === 0) {
            NewsForm.current.validateFields().then(res => {
                setformInfo(res)
                setCurrent(current + 1)
            }).catch(error => {
                console.log(error);
            })
        } else {
            // 如果收到的是空字符串，则不能跳转下一步
            if (content === "" || content.trim() === "<p></p>") {
                message.error("新闻内容不能为空")
            } else {
                setCurrent(current + 1)
            }
        }
    }
    const handlePrevious = () => {
        setCurrent(current - 1)
    }

    const NewsForm = useRef(null)
    useEffect(() => {
        axios.get("http://localhost:5000/categories").then(res => {
            setCategoryList(res.data)
        })
    }, [])

    // 编辑更新内容
    useEffect(() => {
        // 获取该发布id下的新闻信息
        axios.get(`/news/${props.match.params.id}?_expand=category&_expand=role`).then(res => {
            // 从data中解构出title, categoryId,content
            let { title, categoryId, content } = res.data
            NewsForm.current.setFieldsValue({
                title,
                categoryId,
            })
            setContent(content)
        })
    }, [props.match.params.id])

    const handleSave = (auditState) => {
        axios.patch(`/news/${props.match.params.id}`, {
            ...formInfo,
            "content": content,
            "auditState": auditState,
        }).then(res => {
            // auditState=0跳转到新闻管理，auditState=1跳转到审核管理
            props.history.push(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')

            // 右下角通知提醒框
            notification.info({
                message: `通知`,
                description:
                    `您可以到${auditState === 0 ? '草稿箱' : '审核列表'}中查看您的新闻`,
                placement: "bottomRight",
            });
        })
    }
    // labelCol和wrapperCol为2：1
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    }
    return (
        <div>
            {/* 页头 */}
            <PageHeader
                className="site-page-header"
                title="更新新闻"
                // 点击后跳转回上一页
                onBack={() => {
                    props.history.goBack()
                }}
            />
            <Steps current={current}>
                <Step title="基本信息" description="新闻标题，新闻分类" />
                <Step title="新闻内容" description="新闻主体内容" />
                <Step title="新闻提交" description="保存草稿或者提交审核" />
            </Steps>

            <div style={{ marginTop: "50px" }}>
                <div className={current === 0 ? '' : style.active}>
                    <Form
                        {...layout}
                        name="basic"
                        ref={NewsForm}//校验
                    >
                        <Form.Item
                            label="新闻标题"
                            name="title"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="新闻分类"
                            name="categoryId"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Select>
                                {
                                    // 下拉菜单
                                    categoryList.map(item =>
                                        <Option value={item.id} key={item.id}>{item.title}</Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
                {/* 富文本编辑器 */}
                {/* content={content}把更新后的content渲染到富文本组件中 */}
                <div className={current === 1 ? '' : style.active}>
                    <NewsEditor getContent={(value) => {
                        // console.log(value)
                        setContent(value)
                    }} content={content}></NewsEditor>
                </div>
                <div className={current === 2 ? '' : style.active}></div>
            </div>
            <div style={{ marginTop: "50px" }}>
                {
                    current === 2 && <span>
                        {/* handleSave=0保存草稿箱，handleSave=1提交审核 */}
                        <Button type='primary' onClick={() => handleSave(0)}>保存草稿箱</Button>
                        <Button danger onClick={() => handleSave(1)}>提交审核</Button>
                    </span>
                }
                {
                    current < 2 && <Button type='primary' onClick={handleNext}>下一步</Button>
                }
                {
                    current > 0 && <Button onClick={handlePrevious}>上一步</Button>
                }
            </div>

        </div>
    )
}