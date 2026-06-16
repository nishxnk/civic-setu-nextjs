"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const adminLinks = [
  { href: "/admin", icon: "fa-tachometer-alt", label: "Dashboard" },
  { href: "/admin/complaints", icon: "fa-clipboard-list", label: "Complaints" },
  { href: "/admin/analytics", icon: "fa-chart-bar", label: "Analytics" },
  { href: "/admin/users", icon: "fa-users", label: "Users" },
  { href: "/admin/departments", icon: "fa-building", label: "Departments" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin" className="flex items-center space-x-2">
          <i className="fas fa-landmark text-blue-700 text-2xl"></i>
          <span className="text-lg font-bold text-gray-800">CivicSetu</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {adminLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition ${
                  pathname === link.href
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i className={`fas ${link.icon} w-5 text-center`}></i>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm">
            {user?.displayName?.[0] || "A"}
          </div>
          <div className="text-sm">
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-600 hover:text-red-800 flex items-center space-x-2"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
