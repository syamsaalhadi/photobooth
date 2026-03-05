import { NextResponse } from 'next/server'

export async function POST(request) {
    const { username, password } = await request.json()

    if (
        username === process.env.DASHBOARD_USERNAME &&
        password === process.env.DASHBOARD_PASSWORD
    ) {
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
}