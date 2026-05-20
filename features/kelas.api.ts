import { api } from "../lib/api";

export async function getKelasNoPaginate() {
    const res = await api.get("/kelas/no-paginate");
    return res.data;
}
