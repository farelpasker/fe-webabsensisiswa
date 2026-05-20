"use client";
import SideBar from "../../../components/sidebar";
import NavBar from "../../../components/navbar";
import { useState } from "react";

export default function AbsenLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen bg-surface text-on-surface overflow-hidden">
      <SideBar open={open} setOpen={setOpen} />
      <div className="ml-[280px] w-[calc(100%-280px)] flex flex-col h-screen">
        <NavBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
