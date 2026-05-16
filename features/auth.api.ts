import { api } from "../lib/api";

type PayloadLogin = {
    email: string;
    password: string;
}

export async function login(payload: PayloadLogin) {
    const res = await api.post("login", payload);
    return res.data;
}

export async function Saya() {
    const res = await api.get("me");
    return res.data;
}

export async function logout() {
    const res = await api.post("logout");
    return res.data;
}