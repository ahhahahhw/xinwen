// 加载组件
export const LoadingReducer = (prevState = {
    isLoading: false
}, action) => {
    let { type,payload } = action
    switch (type) {
        case "change_loading":
            // 复制旧状态
            let newstate = { ...prevState }
            // 新状态取反
            newstate.isLoading = payload
            // 返回新状态
            return newstate
        default:
            return prevState
    }
}