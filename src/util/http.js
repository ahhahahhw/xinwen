import axios from "axios"
import {
    store
} from '../redux/store'
axios.defaults.baseURL = "http://localhost:5000"

// 在请求前拦截
axios.interceptors.request.use(function (config) {
    // 显示loading
    return config;
}, function (error) {
    // 显示loading
    store.dispatch({
        type: "change_loading",
        payload: true
    })
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // 隐藏loading
    store.dispatch({
        type: "change_loading",
        payload: false
    })
    return response;
}, function (error) {
    // 隐藏loading
    store.dispatch({
        type: "change_loading",
        payload: false
    })
    return Promise.reject(error);
});