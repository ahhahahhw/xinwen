import React, { useEffect, useState } from 'react'
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs';

export default function NewsEditor(props) {
    // 
    useEffect(() => {
        // 将html对象转换成draf,去掉html标签
        const html = props.content
        if (html === undefined) return
        const contentBlock = htmlToDraft(html);
        if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const editorState = EditorState.createWithContent(contentState);
            setEditorState(editorState)
        }
    }, [props.content])
    const [editorState, setEditorState] = useState("")

    return (
        // 第二步，聊天框
        <Editor
            // editorState和onEditorStateChange，让editor组件成为受控组件
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            onEditorStateChange={(editorState) => setEditorState(editorState)}

            // 当getCurrentContent失去焦点后，转换为html标签,传给父组件<NewsEditor/>
            onBlur={() => {
                props.getContent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
            }}
        />
    )
}
