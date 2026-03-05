'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLogin() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        const res = await fetch('/api/dashboard-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
        const data = await res.json()
        if (data.success) {
            sessionStorage.setItem('dashboard_auth', 'true')
            router.push('/dashboard/home')
        } else {
            setError('Username atau password salah.')
        }
        setLoading(false)
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center px-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 w-full max-w-sm shadow-2xl">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🔐</div>
                    <h1 className="text-white text-2xl font-bold">Dashboard</h1>
                    <p className="text-pink-200 text-sm mt-1">PhotoBooth Admin</p>
                </div>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="bg-white/10 text-white placeholder-pink-200 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-pink-400 transition"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        className="bg-white/10 text-white placeholder-pink-200 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-pink-400 transition"
                    />
                    {error && <p className="text-red-300 text-sm text-center">{error}</p>}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="bg-pink-500 hover:bg-pink-400 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                    >
                        {loading ? 'Memverifikasi...' : 'Masuk'}
                    </button>
                </div>
            </div>
        </main>
    )
}