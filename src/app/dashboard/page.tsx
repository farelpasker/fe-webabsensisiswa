"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Saya } from "../../../features/auth.api";

export default function DashboardIndex() {
    const router = useRouter();
    const [dashboard, setDashboard] = useState<string | null>(null);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await Saya();
                const me = res.data;
                const roles = me?.roles ? (Array.isArray(me.roles) ? me.roles.map((r: any) => r.name.toLowerCase()) : [me.roles.name.toLowerCase()]) : [];

                if (roles.includes("admin")) {
                    router.push("/dashboard/admin");
                } else if (roles.includes("teacher")) {
                    router.push("/dashboard/teacher");
                } else if (roles.includes("student")) {
                    router.push("/dashboard/student");
                } else {
                    router.push("/");
                }
            } catch (error) {
                console.error(error);
                router.push("/");
            }
        };

        checkRole();
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>progress_activity</span>
                <p className="text-secondary font-body-md">Mengalihkan ke dashboard...</p>
            </div>
        </div>
    );
}
