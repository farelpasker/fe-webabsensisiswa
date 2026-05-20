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

  const [page, setPage] = useState<number>(1);
  const [kelas, setKelas] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const isMountedRef = useRef(true);

  const fetchRekapAbsensi = useCallback(
    async (currentPage: number) => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
        };
        if (kelas) params.kelas_id = kelas;
        if (status) params.status = status;
        if (month) params.month = month;
        if (year) params.year = year;

        const res = await absenRecap(params);
        if (isMountedRef.current) {
          setRekap(res);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [kelas, status, month, year],
  );

  const summaryRekap = useCallback(async () => {
    try {
      const params: any = {};
      if (kelas) params.kelas_id = kelas;
      if (status) params.status = status;
      if (month) params.month = month;
      if (year) params.year = year;

      const res = await getSummary(params);
      if (isMountedRef.current) {
        setSummary(res?.data || res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [kelas, status, month, year]);

  const fetchKelas = async () => {
    try {
      const res = await getKelasNoPaginate();
      if (isMountedRef.current) {
        // Handle jika response adalah object dengan property data
        const data = Array.isArray(res) ? res : res?.data || [];
        setKelasData(data);
      }
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        setKelasData([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchKelas();
    summaryRekap();
    fetchRekapAbsensi(1);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (page > 1 || rekap?.paginate?.current_page !== page) {
      fetchRekapAbsensi(page);
    }
  }, [page, fetchRekapAbsensi]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchRekapAbsensi(1);
    summaryRekap();
  };

  const handleResetFilters = () => {
    setKelas("");
    setStatus("");
    setMonth("");
    setYear("");
    setPage(1);

    setIsLoading(true);

    // Fetch recap dengan no filters
    absenRecap({ page: 1 })
      .then((res) => {
        if (isMountedRef.current) {
          setRekap(res);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    // Fetch summary dengan no filters
    getSummary({})
      .then((res) => {
        if (isMountedRef.current) {
          setSummary(res?.data || res);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-1">
            <label className="font-label-md text-on-surface-variant">
              Periode Waktu
            </label>
            <select
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "hari-ini") {
                  const today = new Date();
                  setMonth(String(today.getMonth() + 1));
                  setYear(String(today.getFullYear()));
                } else if (value === "bulan-ini") {
                  const today = new Date();
                  setMonth(String(today.getMonth() + 1));
                  setYear(String(today.getFullYear()));
                } else if (value === "reset") {
                  setMonth("");
                  setYear("");
                }
              }}
            >
              <option value="reset">Semua Periode</option>
              <option value="hari-ini">Hari Ini</option>
              <option value="bulan-ini">Bulan Ini</option>
            </select>
          </div>
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
          <button
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-container-high text-on-surface rounded-lg font-label-md hover:bg-surface-container-highest transition-all"
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
              {rekap?.data.length > 0 ? (
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
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-all"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-xs">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container text-xs"
              disabled={page === 2}
              onClick={() => setPage(2)}
            >
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container text-xs"
              disabled={page === 3}
              onClick={() => setPage(3)}
            >
              3
            </button>
            <span className="text-secondary mx-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container text-xs"
              disabled={page === 25}
              onClick={() => setPage(25)}
            >
              25
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container transition-all"
              disabled={page === rekap?.paginate.last_page}
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
