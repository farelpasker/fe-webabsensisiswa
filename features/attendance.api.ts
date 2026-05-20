import { api } from "../lib/api";


export type AttendanceParams = {
    page?: number;
    per_page?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    kelas_id?: string;
    month?: number;
    year?: number;
}

export async function getTodayAdmin(params?: AttendanceParams) {
    const res = await api.get("/absen/today", { params });
    return res.data;
}

export async function absenAdmin(params?: AttendanceParams) {
    const res = await api.get("/absen/admin", { params });
    return res.data;
}

export async function absenRecap(params?: AttendanceParams) {
    const res = await api.get("/absen/recap", { params });
    return res.data;
}

