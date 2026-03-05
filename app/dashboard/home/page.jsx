'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardHome() {
    const router = useRouter()
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState(null)
    const [confirmClearAll, setConfirmClearAll] = useState(false)
    const [clearingAll, setClearingAll] = useState(false)
    const [selectedPhoto, setSelectedPhoto] = useState(null)

    useEffect(() => {
        const auth = sessionStorage.getItem('dashboard_auth')
        if (!auth) { router.push('/dashboard'); return }
        fetchPhotos()
    }, [])

    const fetchPhotos = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('photo_logs')
            .select('*')
            .order('captured_at', { ascending: false })
        if (!error) setPhotos(data || [])
        setLoading(false)
    }

    const deletePhoto = async (photo) => {
        setDeletingId(photo.id)
        await supabase.storage.from('photos').remove([photo.filename])
        await supabase.from('photo_logs').delete().eq('id', photo.id)
        setPhotos(prev => prev.filter(p => p.id !== photo.id))
        setDeletingId(null)
    }

    const clearAll = async () => {
        setClearingAll(true)
        const filenames = photos.map(p => p.filename)
        if (filenames.length > 0) await supabase.storage.from('photos').remove(filenames)
        await supabase.from('photo_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        setPhotos([])
        setClearingAll(false)
        setConfirmClearAll(false)
    }

    const formatDate = (d) => new Date(d).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    const handleLogout = () => {
        sessionStorage.removeItem('dashboard_auth')
        router.push('/')
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 px-4 py-10">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-white text-3xl font-bold">📸 PhotoBooth Dashboard</h1>
                        <p className="text-pink-300 text-sm mt-1">{photos.length} foto tersimpan</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchPhotos} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition">
                            🔄 Refresh
                        </button>
                        {photos.length > 0 && (
                            confirmClearAll ? (
                                <div className="flex gap-2">
                                    <button onClick={clearAll} disabled={clearingAll} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                                        {clearingAll ? 'Menghapus...' : '⚠️ Yakin hapus semua?'}
                                    </button>
                                    <button onClick={() => setConfirmClearAll(false)} className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm transition">
                                        Batal
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setConfirmClearAll(true)} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl text-sm transition">
                                    🗑️ Hapus Semua
                                </button>
                            )
                        )}
                        <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-xl text-sm transition">
                            Keluar
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-pink-300 py-20">
                        <div className="text-5xl animate-pulse mb-4">📸</div>
                        <p>Memuat foto...</p>
                    </div>
                ) : photos.length === 0 ? (
                    <div className="text-center text-pink-300 py-20">
                        <div className="text-5xl mb-4">🖼️</div>
                        <p>Belum ada foto masuk.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {photos.map(photo => (
                            <div key={photo.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition">
                                <img
                                    src={photo.storage_url}
                                    className="w-full cursor-pointer hover:opacity-90 transition"
                                    onClick={() => setSelectedPhoto(photo)}
                                />
                                <div className="p-3">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">{photo.device_type}</span>
                                        <span className="bg-pink-500/20 text-pink-300 text-xs px-2 py-0.5 rounded-full">{photo.os}</span>
                                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{photo.browser}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs">🌐 {photo.ip_address}</p>
                                    <p className="text-gray-500 text-xs mt-1">🕐 {formatDate(photo.captured_at)}</p>
                                    <button
                                        onClick={() => deletePhoto(photo)}
                                        disabled={deletingId === photo.id}
                                        className="mt-3 w-full bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs py-1.5 rounded-lg transition disabled:opacity-50"
                                    >
                                        {deletingId === photo.id ? 'Menghapus...' : '🗑️ Hapus'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal preview foto */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <img src={selectedPhoto.storage_url} className="w-full rounded-2xl shadow-2xl" />
                        <div className="bg-black/60 rounded-xl p-4 mt-3 text-sm text-gray-300 space-y-1">
                            <p>🌐 IP: {selectedPhoto.ip_address}</p>
                            <p>📱 {selectedPhoto.device_type} · {selectedPhoto.os} · {selectedPhoto.browser}</p>
                            <p>🕐 {formatDate(selectedPhoto.captured_at)}</p>
                        </div>
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full hover:bg-black/80 transition"
                        >✕</button>
                    </div>
                </div>
            )}
        </main>
    )
}