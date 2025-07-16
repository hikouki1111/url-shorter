import { Hono } from "hono";

interface Env {
    DB: D1Database;
    SECRET: SecretsStoreSecret;
}

const app = new Hono<{ Bindings: Env }>()

function canParse(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch {
    return false;
  }
}

function randomID(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from(crypto.getRandomValues(new Uint8Array(length))).map((n)=>chars[n%chars.length]).join('')
}

async function fromURL(db: D1Database, url: string): Promise<D1Result<Record<string, unknown>>>{
  const queryURL = `SELECT * FROM url_data WHERE url = '${url}'`
  return db.prepare(queryURL).all()
}

async function fromID(db: D1Database, id: string): Promise<D1Result<Record<string, unknown>>>{
  const queryURL = `SELECT * FROM url_data WHERE id = '${id}'`
  return db.prepare(queryURL).all()
}

app.post('/shorter', async (c) => {
  const body = await c.req.json()
  const url = body.url
  if (!url)
    return c.json({"success": false, "error": "Invalid json"}, 400)

  if (!canParse(url))
    return c.json({"success": false, "error": "Invalid URL"}, 400)
  const encoded = encodeURI(url)
  if (encoded.length > 4096)
    return c.json({"success": false, "error": "URL is too long"}, 400)

  const result = await fromURL(c.env.DB, encoded)
  const existID = result.results[0]?.id
  if (existID)
    return c.json({"success": true, "id": existID}, 200)

  let length = 5
  let id = randomID(length)
  let countAttempted = 0
  while (true) {
    const result = await fromID(c.env.DB, id)
    const dupedID = result.results.length > 0
    if (!dupedID)
      break
    id = randomID(length)
    
    countAttempted++
    if (countAttempted % 5 == 0)
      length++
  }

  const queryInsert = `INSERT INTO url_data (id, url) VALUES ('${id}', '${url}')`
  const resultInsert = await c.env.DB.prepare(queryInsert).all()
  if (resultInsert.success)
    return c.json({"success": true, "id": id})

  return c.json({"success": false, "error": "Database error"})
})

app.get('/get/:id', async (c) => {
  const id = c.req.param('id')

  const result = await fromID(c.env.DB, id)
  if (result.results.length > 0) {
    const url = result.results[0]?.url
    if (url)
      return c.json({"success": true, "url": url}, 200)
  }
  return c.json({"success": false, "error": "URL not found for this ID"}, 404)
})

export default app
