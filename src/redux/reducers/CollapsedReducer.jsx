export const CollApsedReducer = (prevState = {
    isCollapsed: false
}, action) => {
    let { type } = action
    switch (type) {
        case "change_collapsed":
            // 复制旧状态
            let newstate = { ...prevState }
            // 新状态取反
            newstate.isCollapsed = !newstate.isCollapsed
            // 返回新状态
            return newstate
        default:
            return prevState
    }
}