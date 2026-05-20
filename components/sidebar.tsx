import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, Saya } from "../features/auth.api";

type Role = {
    name: string;
};

type Me = {
    name: string;
    roles: Role[] | Role;
};

export default function SideBar({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const [me, setMe] = useState<Me | null>(null);
    const [isOpen, setIsOpen] = useState(open);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error(error);
      } finally {
        localStorage.removeItem("token");
        router.push('/');
      }
    }

    const menuItems = [
      {
        name: "Dashboard",
        link: "/dashboard/admin",
        icon: "dashboard",
        role: ["admin"],
      },
      {
        name: "Dashboard",
        link: "/dashboard/student",
        icon: "dashboard",
        role: ["student"],
      },
      {
        name: "Dashboard",
        link: "/dashboard/teacher",
        icon: "dashboard",
        role: ["teacher"],
      },
      {
        name: "Absensi",
        link: "/absen/admin",
        icon: "how_to_reg",
        role: ["admin"],
      },
      {
        name: "Rekap Absensi",
        link: "/absen/recap",
        icon: "assessment",
        role: ["admin"],
      },
      {
        name: "Data Siswa",
        link: "/students",
        icon: "group",
        role: ["admin"],
      },
      {
        name: "Data Guru",
        link: "/teachers",
        icon: "school",
        role: ["admin"],
      },
      {
        name: "Data Orang Tua",
        link: "/parents",
        icon: "family_restroom",
        role: ["admin"],
      },
      {
        name: "Kelas",
        link: "/kelas",
        icon: "class",
        role: ["admin"],
      },
      {
        name: "Pengajuan Izin",
        link: "/leave-requests",
        icon: "event_busy",
        role: ["admin", "teacher"],
      },
      {
        name: "Hari Libur",
        link: "/holidays",
        icon: "calendar_today",
        role: ["admin"],
      },
      {
        name: "Pengaturan",
        link: "/settings",
        icon: "settings",
        role: ["admin"],
      },
      {
        name: "Export Data",
        link: "/export",
        icon: "ios_share",
        role: ["admin"],
      },
      {
        name: "Absensi",
        link: "/absen/teacher",
        icon: "how_to_reg",
        role: ["teacher"],
      },
      {
        name: "Kelas Saya",
        link: "/my/classes",
        icon: "class",
        role: ["teacher"],
      },
      {
        name: "Absensiku",
        link: "/absen/me",
        icon: "how_to_reg",
        role: ["student"],
      },
      {
        name: "Izinku",
        link: "/students/leave-requests",
        icon: "event_busy",
        role: ["student"],
      },
    ];

    const userRoles = me?.roles
      ? (Array.isArray(me.roles) ? me.roles.map(r => r.name.toLowerCase()) : [me.roles.name.toLowerCase()])
      : [];

    const filteredMenuItems = menuItems.filter((item) =>
      item.role.some(r => userRoles.includes(r.toLowerCase()))
    );

    useEffect(() => {
      const fetchMe = async () => {
        try {
          setIsLoading(true);
          const res = await Saya();
          setMe(res.data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMe();
    }, []);

    return (
      <>
        {/* Sidebar */}
        <aside className="w-[280px] h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-green-100 p-6 z-50">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-green-700">AttendancePro</h1>
            <p className="text-xs uppercase tracking-[3px] text-gray-400 mt-1">
              {userRoles.length > 0 ? userRoles.join(", ") : "Loading..."} Management
            </p>
          </div>
          {/* Menu */}
          <nav className="flex-1 overflow-y-auto space-y-2">
            {filteredMenuItems.map((item, index) => {
               // Mengecek apakah route saat ini sama dengan link item, atau merupakan sub-route dari link tersebut
               const isActive = pathname === item.link || (item.link !== "/" && pathname?.startsWith(item.link + "/")); 
               return (
                 <a
                   key={index}
                   href={item.link}
                   className={`flex items-center gap-3 px-4 py-3 transition-all ${
                     isActive 
                       ? "rounded-r-xl border-l-4 border-green-700 bg-green-50 text-green-700 font-semibold"
                       : "rounded-xl text-gray-600 hover:bg-green-50 hover:text-green-700"
                   }`}
                 >
                   <span className="material-symbols-outlined">{item.icon}</span>
                   <span>{item.name}</span>
                 </a>
               );
            })}
          </nav>
          {/* Bottom */}
          <div className="pt-5 border-t border-green-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </aside>
      </>
    );
}