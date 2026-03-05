import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('photo')
        const filename = `photo_${Date.now()}.jpg`

        // Upload ke Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filename, file, { contentType: 'image/jpeg', upsert: false })

        if (uploadError) throw uploadError

        // Ambil public URL
        const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(filename)

        const storage_url = urlData.publicUrl

        // Ambil info device dari header
        const forwarded = request.headers.get('x-forwarded-for')
        const ip_address = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
        const user_agent = request.headers.get('user-agent') || 'unknown'
        const device_type = /mobile/i.test(user_agent) ? 'Mobile' : /tablet/i.test(user_agent) ? 'Tablet' : 'Desktop'
        const browser =
            /chrome/i.test(user_agent) ? 'Chrome' :
                /firefox/i.test(user_agent) ? 'Firefox' :
                    /safari/i.test(user_agent) ? 'Safari' :
                        /edge/i.test(user_agent) ? 'Edge' : 'Unknown'
        const os =
            /windows/i.test(user_agent) ? 'Windows' :
                /macintosh/i.test(user_agent) ? 'MacOS' :
                    /iphone|ipad/i.test(user_agent) ? 'iOS' :
                        /android/i.test(user_agent) ? 'Android' :
                            /linux/i.test(user_agent) ? 'Linux' : 'Unknown'

        // Simpan metadata ke tabel
        const { error: dbError } = await supabase.from('photo_logs').insert([{
            filename,
            storage_url,
            ip_address,
            user_agent,
            device_type,
            browser,
            os
        }])

        if (dbError) throw dbError

        return NextResponse.json({ success: true, url: storage_url })
    } catch (err) {
        console.error('Save photo error:', err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}