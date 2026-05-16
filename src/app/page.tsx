"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { login } from "../../features/auth.api";

type payload = {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [form, setForm] = useState<payload>({
    email: "",
    password: "",
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        setMousePos({ x: moveX, y: moveY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await login(form);

      localStorage.setItem("token", res.data.access_token);

      if (res.success) {
        setIsLoading(false);
        setIsSuccess(true);
      }
      router.push("/dashboard");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="h-screen flex flex-col md:flex-row bg-background text-on-background font-body-md overflow-hidden">
      {/* Left Side: Visual Area */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-primary relative overflow-hidden items-center justify-center p-16">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-black/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-start gap-6">
          {/* Branding */}
          <div className="flex items-center gap-1 mb-6">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <span className="font-headline-md text-headline-md text-white tracking-tight">
              AttendancePro
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-headline-lg text-headline-lg text-white leading-tight">
              Sistem Presensi Sekolah Modern
            </h1>
            <p className="text-white/80 font-body-lg max-w-md">
              Kelola absensi siswa dan guru dengan lebih cerdas, cepat, dan
              transparan dalam satu platform terpadu.
            </p>
          </div>

          {/* Main Illustration */}
          <div className="w-full max-w-[400px] xl:max-w-[500px] mt-8 animate-float">
            <div
              className="relative group"
              style={{
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <div className="absolute inset-0 bg-primary-container/20 blur-xl rounded-xl scale-95 group-hover:scale-100 transition-transform duration-500"></div>
              <img
                alt="Attendance System Illustration"
                className="relative w-full h-auto rounded-xl shadow-2xl object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlQd4riA_WZl4R9qleihW2p9TJC5y-asOk91K2zZnXS1l_VPNr4H8xBOx7BXieTM20cnXVUJuHWR-_w22vLHJXmNUMMY1m1F5Z_cStEhh_feaLPWkjohreK7pL2t80Y89LsGG81OZlX38TW1kQiWQYtAHbzIBC6k2TTKnv6jSKXxSM2zc7tKN1ANPoDs3bLaXSWl_tZxYS_5i1vw1R1G5HdwAQ1VmoaWY_2ambsjYk_qvuIwyDhN1MzZ47rppdQ1GQkLY5nS-N4Ko"
              />
            </div>
          </div>

          {/* Stats Floating Card */}
          <div className="glass-overlay absolute bottom-16 right-16 p-6 rounded-xl flex items-center gap-3">
            <div className="p-1 bg-white/20 rounded-full">
              <span className="material-symbols-outlined text-white">
                check_circle
              </span>
            </div>
            <div>
              <div className="text-white font-label-md">99.9% Akurasi</div>
              <div className="text-white/60 text-label-sm">
                Real-time Reporting
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-1 mb-16">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <span
                className="material-symbols-outlined text-white text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm text-primary">
              AttendancePro
            </span>
          </div>

          <div className="mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              Selamat Datang Kembali
            </h2>
            <p className="text-secondary font-body-md">
              Silakan masuk ke akun admin Anda untuk melanjutkan.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label
                className="font-label-md text-on-surface-variant block"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-6 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-outline"
                  id="email"
                  name="email"
                  placeholder="nama@sekolah.sch.id"
                  required
                  onChange={handleChange}
                  type="email"
                  value={form.email}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  className="font-label-md text-on-surface-variant block"
                  htmlFor="password"
                >
                  Kata Sandi
                </label>
                <a className="text-primary font-label-md hover:underline" href="#">
                  Lupa Password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-outline"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-primary transition-colors focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                id="remember"
                type="checkbox"
              />
              <label
                className="font-body-sm text-secondary cursor-pointer select-none"
                htmlFor="remember"
              >
                Ingat perangkat ini
              </label>
            </div>

            {/* Login Button */}
            <button
              className={`w-full py-4 text-white font-headline-sm rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 group ${
                isSuccess
                  ? "bg-on-primary-fixed-variant"
                  : "bg-primary shadow-primary/20 hover:bg-primary/90 active:scale-[0.98]"
              }`}
              type="submit"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Memproses...
                </>
              ) : isSuccess ? (
                <>
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>
                  Berhasil!
                </>
              ) : (
                <>
                  Masuk
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-16 pt-12 border-t border-outline-variant/30 text-center">
            <p className="text-label-sm text-outline">
              © 2024 AttendancePro Management System. <br className="md:hidden" />
              Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
