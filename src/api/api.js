import axios from 'axios'


const defaulturl = "http://127.0.0.1:3005/"


// 登录
export function loginapi(username, password) {
    return axios({
        url: defaulturl + "login",
        method: "post",
        data:{
            username: username,
            password: password
        }
    })
}

export function getlistapi(count,diff,userid,username) {
    return axios({
        url: defaulturl + "list",
        method: "post",
        data:{
            count:count,
            difficulty:diff,
            userid:userid,
            username:username
        }
    })
}



export function submitlistapi(list) {
    return axios({
        url: defaulturl + "sendanswer",
        method: "post",
        data:{
            list:list
        }
    })
}
