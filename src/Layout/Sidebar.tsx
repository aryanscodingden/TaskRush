import React from "react";

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 p-4">
        <div className="mb-8">
            <h1 className="text-x1 font-bold text-white">TaskRush</h1>
            <nav>
            <button className="w-full text-left px-3 py-2 rounded-md bg-zinc-800 text-white mb-1">TODAY</button>
            </nav>
        </div>
        </div>
    )
}