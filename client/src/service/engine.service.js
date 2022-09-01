import axios from "axios"

const url = "http://localhost:4000/"


const startEngine = () => {
    return axios.post(url + "start")
}

const sendNumber = (number) => {
    return axios.post(url + "sendNumber", {number})
}

const getNumber = () => {
    return axios.get(url + "getNumber")
}

const approval = (isNotAprroved,message) => {
    return axios.post(url + "approval", {isNotAprroved,message})
}

const isFinished = () => {
    return axios.get(url + "isFinished")
}

const service = {startEngine, sendNumber, getNumber, approval, isFinished}

export default service