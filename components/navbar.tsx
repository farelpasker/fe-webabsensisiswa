import { useEffect, useState } from "react";
import { Saya } from "../features/auth.api";

type Role = {
    name: string;
};

type Me = {
    name: string;
    roles: Role[] | Role;
    photo?: string;
};

export default function NavBar() {
    const [me, setMe] = useState<Me | null>(null);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await Saya();
                setMe(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMe();
    }, []);

    const roleName = me?.roles
      ? (Array.isArray(me.roles) ? me.roles[0]?.name : me.roles.name)
      : "Administrator";

    return (
        <header className="sticky top-0 z-40 bg-surface flex justify-between items-center h-16 px-6 border-b border-outline-variant shadow-sm">
            <div className="flex items-center gap-6 flex-1">
                <div className="relative w-full max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
                    <input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary/20 placeholder:text-secondary/60 transition-all outline-none" placeholder="Cari siswa, kelas, atau status..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <button className="relative hover:bg-surface-container rounded-full p-2 transition-all scale-95 active:scale-90 outline-none">
                    <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
                </button>
                <div className="flex items-center gap-3 border-l border-outline-variant pl-6">
                    <div className="text-right hidden sm:block">
                        <p className="font-label-md text-on-surface">{me?.name || "Memuat..."}</p>
                        <p className="text-[10px] text-secondary uppercase tracking-tight">{roleName}</p>
                    </div>
                    {me?.photo ? (
                        <img alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-container" src={me.photo} />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold border-2 border-primary-container">
                            {me?.name?.charAt(0).toUpperCase() || "A"}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
