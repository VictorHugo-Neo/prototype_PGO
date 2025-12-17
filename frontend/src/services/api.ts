import axios from "axios";


// conect backend
export const api = axios.create({
    baseURL: 'http://localhost:8000'
})

// conect IA
export const iaService = axios.create({
    baseURL: "http://localhost:8000"
})