"use client";
import React, { useEffect, useState } from "react";
import { absenAdmin } from "../../../../features/attendance.api";
import { getKelasNoPaginate } from "../../../../features/kelas.api";

type AdminAbsensi = {
    data: {
        id: string;
        student_id: string;
        date: string;
        time_in: string;
        status: string;
        student: {
            id: string;
            nis: string;
            user_id: string;
            kelas_id: string;
            user: {
                id: string;
                name: string;
                avatar: string | null;
            }
            kelas: {
                id: string;
                nama: string;
            }
        }
    }[];
    summary: {
        total_student: number,
        hadir_count: number,
        tidak_hadir_count: number,
    }
    paginate: {
        total: number,
        per_page: number,
        current_page: number,
        last_page: number,
        from: number,
        to: number
    }
}

type KelasData = {
    id: string;
    nama: string;
}

export default function AdminAbsensiPage() {
    const [adminAbsensi, setAdminAbsensi] = useState<AdminAbsensi | null>(null);
    const [kelasList, setKelasList] = useState<KelasData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");
    const [kelas, setKelas] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    const fetchAdminAbsensi = async (currentPage: number = page) => {
        setIsLoading(true);
        try {
            const params: any = { page: currentPage };
            if (search) params.search = search;
            if (kelas) params.kelas_id = kelas;
            if (status) params.status = status;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;

            const res = await absenAdmin(params);
            setAdminAbsensi(res);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchKelas = async () => {
        try {
            const res = await getKelasNoPaginate();
            setKelasList(res.data || res);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchKelas();
        fetchAdminAbsensi(1);
    }, []);

    useEffect(() => {
        if (page > 1 || adminAbsensi?.paginate?.current_page !== page) {
             fetchAdminAbsensi(page);
        }
    }, [page]);

    const handleApplyFilters = () => {
        setPage(1);
        fetchAdminAbsensi(1);
    };

    const handleResetFilters = () => {
        setSearch("");
        setKelas("");
        setStatus("");
        setDateFrom("");
        setDateTo("");
        setPage(1);
        
        setIsLoading(true);
        absenAdmin({ page: 1 }).then(res => {
            setAdminAbsensi(res);
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="p-8 flex-1">
            {/* Header Section */}
            <div className="mb-12">
                <h3 className="font-headline-lg text-headline-lg text-on-surface">Daftar Absensi Siswa</h3>
                <p className="text-body-md text-on-surface-variant">Pantau dan kelola kehadiran seluruh siswa secara real-time untuk efisiensi pelaporan.</p>
            </div>

            {/* Bento Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                    <div>
                        <p className="text-label-sm text-on-surface-variant">Total Siswa</p>
                        <p className="font-headline-md text-headline-md text-on-surface">{adminAbsensi?.summary?.total_student || 0}</p>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div>
                        <p className="text-label-sm text-on-surface-variant">Hadir</p>
                        <p className="font-headline-md text-headline-md text-primary">{adminAbsensi?.summary?.hadir_count || 0}</p>
                    </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-error-container/30 flex items-center justify-center text-error">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    </div>
                    <div>
                        <p className="text-label-sm text-on-surface-variant">Tidak Hadir</p>
                        <p className="font-headline-md text-headline-md text-error">{adminAbsensi?.summary?.tidak_hadir_count || 0}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar Section */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant mb-6 flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px]">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Cari Nama / NIS</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">person_search</span>
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            placeholder="Contoh: Budi Santoso" 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full md:w-36">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Kelas</label>
                    <select 
                        className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                    >
                        <option value="">Semua Kelas</option>
                        {kelasList.map((k) => (
                            <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-36">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Status</label>
                    <select 
                        className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="hadir">Hadir</option>
                        <option value="terlambat">Terlambat</option>
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="tidak hadir">Tidak Hadir</option>
                    </select>
                </div>
                <div className="w-full md:w-40">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Dari Tanggal</label>
                    <div className="relative">
                        <input 
                            className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            type="date" 
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full md:w-40">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Sampai Tanggal</label>
                    <div className="relative">
                        <input 
                            className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm focus:border-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            type="date" 
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-surface-container-highest active:scale-95 transition-all flex items-center justify-center border border-outline-variant"
                        onClick={handleResetFilters}
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                    <button 
                        className="bg-primary text-on-primary font-label-md text-label-md px-8 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center min-w-[120px]"
                        onClick={handleApplyFilters}
                        disabled={isLoading}
                    >
                        {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Terapkan"}
                    </button>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant overflow-hidden">
                <div className="overflow-x-auto relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-surface/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
                        </div>
                    )}
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-surface-container-low">
                                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-16">Foto</th>
                                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Nama Siswa</th>
                                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">NIS</th>
                                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kelas</th>
                                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Jam Masuk</th>
                                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {adminAbsensi?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-secondary">
                                        Data tidak ditemukan
                                    </td>
                                </tr>
                            ) : (
                                adminAbsensi?.data?.map((row) => (
                                    <tr key={row.id} className="hover:bg-surface-container transition-all duration-150 hover:translate-x-1 group">
                                        <td className="px-6 py-4">
                                            {row.student.user.avatar ? (
                                                <img alt={row.student.user.name} className="w-10 h-10 rounded-full bg-surface-container object-cover" src={row.student.user.avatar} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold">
                                                    {row.student.user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-body-md text-body-md font-medium">{row.student.user.name}</td>
                                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{row.student.nis}</td>
                                        <td className="px-6 py-4 font-body-sm text-body-sm">{row.student.kelas.nama}</td>
                                        <td className="px-6 py-4 font-body-sm text-body-sm">{row.time_in !== '00:00:00' ? row.time_in : '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${
                                                row.status === 'hadir' ? 'bg-primary/10 text-primary' :
                                                row.status === 'terlambat' ? 'bg-tertiary-container/30 text-tertiary-container' :
                                                row.status === 'izin' || row.status === 'sakit' ? 'bg-surface-container-highest text-on-surface-variant' :
                                                'bg-error-container/40 text-error'
                                            }`}>
                                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                            </span>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Section */}
                <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                    <p className="text-body-sm text-on-surface-variant">
                        Menampilkan <span className="font-bold">{adminAbsensi?.paginate?.from || 0}-{adminAbsensi?.paginate?.to || 0}</span> dari <span className="font-bold">{adminAbsensi?.paginate?.total || 0}</span> data
                    </p>
                    <div className="flex items-center gap-1">
                        <button 
                            className="p-2 rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50" 
                            disabled={!adminAbsensi || adminAbsensi.paginate.current_page <= 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        
                        <span className="px-4 text-on-surface-variant text-label-md">
                            Halaman {adminAbsensi?.paginate?.current_page || 1} dari {adminAbsensi?.paginate?.last_page || 1}
                        </span>

                        <button 
                            className="p-2 rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50"
                            disabled={!adminAbsensi || adminAbsensi.paginate.current_page >= adminAbsensi.paginate.last_page}
                            onClick={() => setPage(page + 1)}
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
