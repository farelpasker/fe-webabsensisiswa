"use client";
import React, { useEffect, useState } from "react";
import { getDashboard } from "../../../../features/dashboard.api";
import { getTodayAdmin } from "../../../../features/attendance.api";

type DashboardData = {
    studentCount: number;
    siswaHadir: number;
    siswaTelat: number;
    siswaIzinSakit: number;
    monthlyStats: Array<{ total: number; [key: string]: string | number }>;
}

type getToday = {
    id: number,
    student_id: number,
    date: string,
    time_in: string,
    status: string,
    student: {
        id: number,
        nis: string,
        user_id: number,
        class_id: number,
        user: {
            id: number,
            name: string,
        },
        kelas: {
            id: number,
            nama: string,
        }
    },
    class: {
        id: number,
        name: string,
        created_at: string,
        updated_at: string
    }
}

export default function AdminDashboardPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [today, setToday] = useState<getToday[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        const fetchToday = async () => {
            try {
                const res = await getTodayAdmin({ page, per_page: 4, search });
                // If Laravel paginated, the array is inside res.data.data, else fallback to res.data
                setToday(res.data.data ? res.data.data : res.data);
            } catch (error) {
                setError("Gagal memuat data hari ini");
            } finally {
                setIsLoading(false);
            }
        };
        fetchToday();
    }, [page, search]);
    
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await getDashboard("admin", year);
                setDashboard(res.data);
            } catch (error) {
                setError("Gagal memuat data dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();

        const bars = document.querySelectorAll<HTMLElement>('[style*="height"]');
        bars.forEach(bar => {
            const targetHeight = bar.style.height;
            bar.style.height = '0%';
            setTimeout(() => {
                bar.style.height = targetHeight;
            }, 100);
        });

        const stats = document.querySelectorAll<HTMLElement>('.card-shadow');
        stats.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, [year]);

    return (
        <div className="p-8 space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Ringkasan Dashboard</h2>
                    <p className="font-body-md text-secondary">Selamat datang kembali, Admin. Berikut adalah statistik absensi hari ini.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-1 px-6 py-3 bg-surface-container-lowest border border-outline-variant text-primary font-label-md rounded-lg hover:bg-surface-container-low transition-all active:scale-95 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">print</span>
                        Cetak Laporan Hari Ini
                    </button>
                    <button className="flex items-center gap-1 px-6 py-3 bg-primary text-on-primary font-label-md rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Input Manual
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Siswa */}
                <div className="bg-surface-container-lowest p-6 rounded-xl card-shadow border border-outline-variant group hover:border-primary/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-1 bg-primary-container/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-[32px]">group</span>
                        </div>
                        <span className="flex items-center gap-1 text-primary text-label-sm bg-primary-fixed/30 px-2 py-1 rounded-full font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                            +12%
                        </span>
                    </div>
                    <p className="text-secondary font-label-md">Total Siswa</p>
                    <h3 className="text-headline-lg font-headline-lg text-on-surface mt-1 tracking-tighter">{dashboard?.studentCount?.toLocaleString() || 0}</h3>
                    <p className="text-body-sm text-secondary/70 mt-1">Siswa Terdaftar Aktif</p>
                </div>
                {/* Hadir Hari Ini */}
                <div className="bg-surface-container-lowest p-6 rounded-xl card-shadow border border-outline-variant group hover:border-primary/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-1 bg-primary-container/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-[32px]">check_circle</span>
                        </div>
                        <span className="flex items-center gap-1 text-primary text-label-sm bg-primary-fixed/30 px-2 py-1 rounded-full font-bold">
                            95%
                        </span>
                    </div>
                    <p className="text-secondary font-label-md">Hadir Hari Ini</p>
                    <h3 className="text-headline-lg font-headline-lg text-on-surface mt-1 tracking-tighter">{dashboard?.siswaHadir?.toLocaleString() || 0}</h3>
                    <p className="text-body-sm text-secondary/70 mt-1">Telah melakukan scan masuk</p>
                </div>
                {/* Telat Hari Ini */}
                <div className="bg-surface-container-lowest p-6 rounded-xl card-shadow border border-outline-variant group hover:border-tertiary/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-1 bg-tertiary-container/10 rounded-lg text-tertiary">
                            <span className="material-symbols-outlined text-[32px]">schedule</span>
                        </div>
                        <span className="flex items-center gap-1 text-tertiary text-label-sm bg-tertiary-fixed/30 px-2 py-1 rounded-full font-bold">
                            <span className="material-symbols-outlined text-[14px]">trending_down</span>
                            -5%
                        </span>
                    </div>
                    <p className="text-secondary font-label-md">Telat Hari Ini</p>
                    <h3 className="text-headline-lg font-headline-lg text-on-surface mt-1 tracking-tighter">{dashboard?.siswaTelat?.toLocaleString() || 0}</h3>
                    <p className="text-body-sm text-secondary/70 mt-1">Melewati jam 07.15 WIB</p>
                </div>
                {/* Izin/Sakit */}
                <div className="bg-surface-container-lowest p-6 rounded-xl card-shadow border border-outline-variant group hover:border-error/30 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-1 bg-error-container/10 rounded-lg text-error">
                            <span className="material-symbols-outlined text-[32px]">event_busy</span>
                        </div>
                        <span className="flex items-center gap-1 text-error text-label-sm bg-error-container/20 px-2 py-1 rounded-full font-bold">
                            Stable
                        </span>
                    </div>
                    <p className="text-secondary font-label-md">Izin/Sakit Hari Ini</p>
                    <h3 className="text-headline-lg font-headline-lg text-on-surface mt-1 tracking-tighter">{dashboard?.siswaIzinSakit?.toLocaleString() || 0}</h3>
                    <p className="text-body-sm text-secondary/70 mt-1">Dokumen sudah divalidasi</p>
                </div>
            </div>

            {/* Dashboard Content Layout: Bento Style */}
            <div className="grid grid-cols-12 gap-6">
                {/* Main Chart (Monthly Trends) */}
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl card-shadow border border-outline-variant">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">Tren Kehadiran Bulanan</h4>
                            <p className="text-body-sm text-secondary">Statistik kehadiran tahun {year}</p>
                        </div>
                        <select 
                            className="bg-surface border-outline-variant rounded-lg font-label-md py-1.5 px-3 text-secondary focus:ring-primary/20 outline-none"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                            <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                        </select>
                    </div>
                    {/* Modern Bar Chart Visualization (CSS/SVG) */}
                    <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2 pt-10">
                        {dashboard?.monthlyStats?.map((stat, index) => {
                            const monthKey = Object.keys(stat).find(k => k !== 'total');
                            const monthName = monthKey ? stat[monthKey] : '';
                            const total = Number(stat.total) || 0;
                            const maxTotal = Math.max(...(dashboard.monthlyStats.map(s => Number(s.total) || 0)), 1);
                            const heightPercentage = Math.max((total / maxTotal) * 100, 5);

                            return (
                                <div key={index} className="group relative flex-1 flex flex-col items-end justify-end h-full gap-2">
                                    <div className={`w-full ${total > 0 ? 'bg-primary/80 hover:bg-primary' : 'bg-primary/20 hover:bg-primary/40'} rounded-t-sm transition-all duration-700`} style={{ height: `${heightPercentage}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {total}
                                        </div>
                                    </div>
                                    <span className="w-full text-center text-label-sm text-secondary mt-2">{monthName}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Sidebar Inside Canvas (Upcoming Info) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Quick Info Card */}
                    <div className="bg-primary p-6 rounded-2xl card-shadow relative overflow-hidden group">
                        <div className="relative z-10 text-on-primary">
                            <p className="font-label-md opacity-80 mb-2">Status Sistem</p>
                            <h4 className="font-headline-sm text-headline-sm mb-3 leading-tight text-white">Server Absensi Berjalan Optimal</h4>
                            <p className="text-body-sm opacity-90 mb-6 text-white">Sinkronisasi data otomatis aktif. Backup harian terakhir: 04:00 WIB hari ini.</p>
                            <a className="inline-flex items-center gap-1 font-label-md bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-white" href="#">
                                Lihat Log Aktivitas
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <span className="material-symbols-outlined text-[160px] text-white">cloud_done</span>
                        </div>
                    </div>

                    {/* Mini Calendar/Schedule Section */}
                    <div className="bg-surface-container-lowest p-6 rounded-2xl card-shadow border border-outline-variant">
                        <h4 className="font-label-md text-on-surface mb-6 flex items-center justify-between">
                            Agenda Mendatang
                            <span className="text-primary cursor-pointer hover:underline">Lihat Kalender</span>
                        </h4>
                        <div className="space-y-3">
                            <div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                                <div className="flex flex-col items-center justify-center bg-primary-container/10 text-primary w-12 h-12 rounded-lg shrink-0">
                                    <span className="font-bold text-[18px]">17</span>
                                    <span className="text-[10px] uppercase font-bold">Agu</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-label-md truncate text-on-surface">Upacara HUT RI Ke-79</p>
                                    <p className="text-[12px] text-secondary">07:00 - 09:00 WIB</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                                <div className="flex flex-col items-center justify-center bg-tertiary-container/10 text-tertiary w-12 h-12 rounded-lg shrink-0">
                                    <span className="font-bold text-[18px]">20</span>
                                    <span className="text-[10px] uppercase font-bold">Agu</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-label-md truncate text-on-surface">Rapat Koordinasi Bulanan</p>
                                    <p className="text-[12px] text-secondary">13:30 - 15:00 WIB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Attendance Table Section */}
                <div className="col-span-12 bg-surface-container-lowest rounded-2xl card-shadow border border-outline-variant overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-outline-variant">
                        <div>
                            <h4 className="font-headline-sm text-headline-sm text-on-surface">Daftar Absensi Terbaru</h4>
                            <p className="text-body-sm text-secondary">Data real-time kehadiran siswa hari ini</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="bg-surface-container-low text-secondary border border-outline-variant px-3 py-1.5 rounded-lg text-label-sm font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                                Filter Kelas
                            </button>
                            <button className="bg-surface-container-low text-secondary border border-outline-variant px-3 py-1.5 rounded-lg text-label-sm font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Export
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-surface-container-low/50">
                                <tr>
                                    <th className="px-6 py-3 text-label-sm text-secondary font-bold uppercase tracking-wider">Nama Siswa</th>
                                    <th className="px-6 py-3 text-label-sm text-secondary font-bold uppercase tracking-wider">Kelas</th>
                                    <th className="px-6 py-3 text-label-sm text-secondary font-bold uppercase tracking-wider">Jam Masuk</th>
                                    <th className="px-6 py-3 text-label-sm text-secondary font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-label-sm text-secondary font-bold uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {/* Row 1 */}
                                {today.length > 0 ? (today.map((today)=> (
                                    <tr key={today.id} className="hover:bg-surface-container-low/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold">AB</div>
                                            <div>
                                                <p className="font-label-md text-on-surface">{today?.student?.user?.name}</p>
                                                <p className="text-[11px] text-secondary">NISN: {today?.student?.nis}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{today?.student?.kelas?.nama}</td>
                                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{today?.time_in} WIB</td>
                                    <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-primary-container/20 text-primary">
                                            {today?.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="text-secondary hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                ))) : (<tr>
                                    <td colSpan={5} className="px-6 py-4 text-center">
                                        <p className="text-body-sm text-secondary">Belum ada absensi hari ini</p>
                                    </td>
                                </tr>)}
                            </tbody>

                        </table>
                    </div>
                    <div className="p-6 bg-surface-container-low/30 border-t border-outline-variant flex justify-between items-center">
                        <p className="text-body-sm text-secondary">Menampilkan halaman {page}</p>
                        <div className="flex items-center gap-1">
                            <button 
                                className="p-1 hover:bg-surface-container rounded transition-colors text-secondary disabled:opacity-30" 
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span className="px-3 py-1 bg-primary text-on-primary rounded text-label-sm">{page}</span>
                            <button 
                                className="p-1 hover:bg-surface-container rounded transition-colors text-secondary"
                                onClick={() => setPage(page + 1)}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
