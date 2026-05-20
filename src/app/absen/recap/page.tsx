"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { absenRecap } from "../../../../features/attendance.api";
import { getSummary } from "../../../../features/dashboard.api";
import { getKelasNoPaginate } from "../../../../features/kelas.api";

type recap = {
  data: {
    siswa_id: string;
    siswa_name: string;
    siswa_nis: string;
    kelas_name: string;
    hadir: number;
    terlambat: number;
    izindansakit: number;
    alpha: number;
  }[];
  paginate: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};

type summary = {
  total_student?: number;
  total_siswa?: number;
  total_hadir: number;
  total_terlambat: number;
  total_izin_sakit: number;
  total_tidak_hadir?: number;
  total_alpa?: number;
  total_terabsensi?: number;
  rasio_kehadiran: string | number;
};

type KelasData = {
  id: string;
  nama: string;
};

export default function RekapAbsensiPage() {
  const [rekap, setRekap] = useState<recap | null>(null);
  const [summary, setSummary] = useState<summary>();
  const [kelasData, setKelasData] = useState<KelasData[]>([]);
  const [loading, setIsLoading] = useState(false);

  // States for input controls in the UI
  const [search, setSearch] = useState<string>("");
  const [kelas, setKelas] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // State to hold the applied filters that trigger API fetches
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    kelas: "",
    status: "",
  });

  const [page, setPage] = useState<number>(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setAppliedFilters((prev) => {
        if (prev.search === search) return prev;
        setPage(1);
        return { ...prev, search };
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch rekap absensi data when page or appliedFilters change
  useEffect(() => {
    let active = true;
    const fetchRecap = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page,
        };
        if (appliedFilters.kelas) params.kelas_id = appliedFilters.kelas;
        if (appliedFilters.status) params.status = appliedFilters.status;
        if (appliedFilters.search) params.search = appliedFilters.search;

        const res = await absenRecap(params);
        if (active) {
          setRekap(res);
        }
      } catch (error) {
        console.error("Gagal memuat rekap absensi:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchRecap();

    return () => {
      active = false;
    };
  }, [page, appliedFilters]);

  // Load initial static data (kelas list and static summary stats)
  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const resKelas = await getKelasNoPaginate();
        if (active) {
          const data = Array.isArray(resKelas) ? resKelas : resKelas?.data || [];
          setKelasData(data);
        }

        const resSummary = await getSummary();
        if (active) {
          setSummary(resSummary?.data || resSummary);
        }
      } catch (error) {
        console.error("Gagal memuat data awal:", error);
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({
      search,
      kelas,
      status,
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setKelas("");
    setStatus("");
    setPage(1);
    setAppliedFilters({
      search: "",
      kelas: "",
      status: "",
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Rekapitulasi Kehadiran
          </h2>
          <p className="font-body-md text-secondary">
            Kelola dan ekspor data kehadiran siswa secara periodik.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest border border-outline text-primary rounded-lg font-label-md hover:bg-primary/5 transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[20px]">
              picture_as_pdf
            </span>
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-all shadow-md active:scale-95">
            <span className="material-symbols-outlined text-[20px]">
              description
            </span>
            Export Excel
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-1">
            <label className="font-label-md text-on-surface-variant">
              Pilih Kelas
            </label>
            <select
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {Array.isArray(kelasData) &&
                kelasData.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-on-surface-variant">
              Status Kehadiran
            </label>
            <select
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary"
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
          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-container-high text-on-surface border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-highest transition-all active:scale-95"
              onClick={handleResetFilters}
            >
              <span className="material-symbols-outlined text-[18px]">
                restart_alt
              </span>
              Reset Filter
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md hover:brightness-110 transition-all active:scale-95 shadow-md"
              onClick={handleApplyFilters}
            >
              {loading ? (
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  autorenew
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  filter_list
                </span>
              )}
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Hadir */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-primary/30 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                how_to_reg
              </span>
            </div>
            <span className="font-label-sm text-primary bg-primary-fixed flex items-center px-2 py-0.5 rounded-full">
              +12.5%{" "}
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-secondary font-label-md">Total Hadir</p>
            <h3 className="font-headline-md text-headline-md mt-1">
              {summary?.total_hadir || 0}{" "}
              <span className="text-body-sm text-secondary font-normal">
                Siswa
              </span>
            </h3>
          </div>
        </div>

        {/* Total Terlambat */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-error/30 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-error/10 rounded-lg">
              <span
                className="material-symbols-outlined text-error"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                alarm_off
              </span>
            </div>
            <span className="font-label-sm text-error bg-error-container flex items-center px-2 py-0.5 rounded-full">
              -2.4%{" "}
              <span className="material-symbols-outlined text-[14px]">
                trending_down
              </span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-secondary font-label-md">Total Terlambat</p>
            <h3 className="font-headline-md text-headline-md mt-1">
              {summary?.total_terlambat || 0}{" "}
              <span className="text-body-sm text-secondary font-normal">
                Siswa
              </span>
            </h3>
          </div>
        </div>

        {/* Total Izin/Sakit */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-tertiary/30 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-tertiary/10 rounded-lg">
              <span
                className="material-symbols-outlined text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                medical_services
              </span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-secondary font-label-md">Total Izin/Sakit</p>
            <h3 className="font-headline-md text-headline-md mt-1">
              {summary?.total_izin_sakit || 0}{" "}
              <span className="text-body-sm text-secondary font-normal">
                Siswa
              </span>
            </h3>
          </div>
        </div>

        {/* Total Alpa/Tidak Hadir */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-error/30 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-error-container/30 rounded-lg">
              <span
                className="material-symbols-outlined text-error"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                person_off
              </span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-secondary font-label-md">Total Alpa</p>
            <h3 className="font-headline-md text-headline-md mt-1">
              {summary?.total_tidak_hadir ?? summary?.total_alpa ?? 0}{" "}
              <span className="text-body-sm text-secondary font-normal">
                Siswa
              </span>
            </h3>
          </div>
        </div>

        {/* Rasio Kehadiran Visual */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="z-10">
            <p className="text-secondary font-label-md">Rasio Kehadiran</p>
            <h3 className="font-headline-md text-headline-md mt-1">
              {summary?.rasio_kehadiran !== undefined
                ? typeof summary.rasio_kehadiran === "string"
                  ? summary.rasio_kehadiran
                  : `${Number(summary.rasio_kehadiran).toFixed(1)}%`
                : "0.0%"}
            </h3>
          </div>
          <div className="flex items-end gap-1.5 h-12 mt-4 z-10">
            <div
              className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all"
              style={{ height: "60%" }}
            ></div>
            <div
              className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all"
              style={{ height: "80%" }}
            ></div>
            <div
              className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all"
              style={{ height: "45%" }}
            ></div>
            <div
              className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all"
              style={{ height: "90%" }}
            ></div>
            <div
              className="flex-1 bg-primary rounded-t-sm"
              style={{ height: "95%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex items-center justify-between border-b border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm">
            Daftar Rekap Kehadiran
          </h3>
          <div className="flex gap-2">
            <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary mr-2">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-body-sm w-40 outline-none"
                placeholder="Cari nama..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">
                  Nama Siswa
                </th>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider text-center">
                  Hadir
                </th>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider text-center">
                  Telat
                </th>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider text-center">
                  Izin/Sakit
                </th>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider text-center">
                  ALPA/TIDAK HADIR
                </th>
                <th className="px-6 py-4 font-label-sm text-secondary uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {/* Row 1 */}
              {rekap && rekap.data && rekap.data.length > 0 ? (
                rekap.data.map((item) => (
                  <tr
                    className="hover:bg-surface-container/30 transition-colors"
                    key={item.siswa_id}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                          AS
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface">
                            {item.siswa_name}
                          </p>
                          <p className="text-xs text-secondary">
                            NIS: {item.siswa_nis}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-sm">
                      {item.kelas_name}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-center font-medium">
                      {item.hadir}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-center text-error">
                      {item.terlambat}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-center">
                      {item.izindansakit}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-center">
                      {item.alpha}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">
                          visibility
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-body-sm text-secondary"
                  >
                    Tidak ada data yang tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-6 bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-body-sm text-secondary">
            Menampilkan <span className="font-bold">{rekap?.paginate.from || 0}-{rekap?.paginate.to || 0}</span> dari{" "}
            <span className="font-bold">{rekap?.paginate.total || 0}</span> data
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-all disabled:opacity-50"
              disabled={!rekap || page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            
            <span className="px-4 text-secondary text-label-md">
              Halaman {rekap?.paginate.current_page || 1} dari {rekap?.paginate.last_page || 1}
            </span>

            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-all disabled:opacity-50"
              disabled={!rekap || page >= rekap.paginate.last_page}
              onClick={() => setPage((prev) => Math.min(prev + 1, rekap?.paginate.last_page || 1))}
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
