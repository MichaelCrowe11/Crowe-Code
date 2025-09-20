"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth/signin"
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">
            {session.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-400">{session.user?.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
            <div className="p-4 border-b border-gray-700">
              <p className="text-sm font-medium text-white">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {session.user?.email}
              </p>
              {session.user?.role && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-900/50 text-blue-400 rounded">
                  {session.user.role}
                </span>
              )}
            </div>

            <div className="p-2">
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
            </div>

            <div className="p-2 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}