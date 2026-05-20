import { api } from "../lib/api";


export async function getDashboard(role: string, year?: string) {
    const res = await api.get(`dashboard/${role}`, { params: { year } });
    return res.data;
}

export async function getSummary() {
    const res = await api.get(`/dashboard/attendance-summary`);
    return res.data;
}