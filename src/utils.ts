export function parseOrNull(url: string): string | null {
    try {
        const parsed = new URL(url)
        return parsed.href
    } catch {
        return null
    }
}

export function randomID(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return Array.from(crypto.getRandomValues(new Uint8Array(length))).map((n)=>chars[n%chars.length]).join('')
}

export async function fromURL(db: D1Database, url: string): Promise<D1Result<Record<string, unknown>>>{
    const queryURL = `SELECT * FROM url_data WHERE url = '${url}'`
    return db.prepare(queryURL).all()
}

export async function fromID(db: D1Database, id: string): Promise<D1Result<Record<string, unknown>>>{
    const queryURL = `SELECT * FROM url_data WHERE id = '${id}'`
    return db.prepare(queryURL).all()
}