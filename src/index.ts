import { Hono } from "hono";
import { randomID, fromURL, fromID, parseOrNull } from "./utils";
import { Panel, renderer, Result } from "./component";
import { html } from "hono/html";
import { z } from "@hono/zod-openapi"
import { zValidator } from '@hono/zod-validator'

interface Env {
    DB: D1Database;
    SECRET: SecretsStoreSecret;
}

const app = new Hono<{ Bindings: Env }>()

app.get("*", renderer)

app.post(
  '/shorter',
  zValidator(
    'form',
    z.object({
      url: z.string().refine(
        (val) => {
          return parseOrNull(val) && encodeURI(val).length <= 4096
        },
        { message: "URL is invalid or too long" }
      ).transform((val) => { return parseOrNull(val)!! })
    })
  ),
  async (c) => {
    const parsed = new URL(c.req.url)
    const appURL = `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}/`

    const { url } = c.req.valid('form')
    try {
      const res = await fetch(url)
      if (!res.ok)
        return c.html(Result({message: "Invalid URL", error: true}), 200)
    } catch {
      return c.html(Result({message: "Invalid URL", error: true}), 200)
    }

    const encoded = encodeURI(url)
    const result = await fromURL(c.env.DB, encoded)
    const existID = result.results[0]?.id
    if (existID)
      return c.html(Result({message: appURL+existID, error: false}), 200)

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
      return c.html(Result({message: appURL+id, error: false}), 200)

    return c.html(Result({message: "Database error", error: true}), 200)
})

app.get('/', async (c) => {
  return c.render(Panel())
})

app.get('/:id', async (c) => {
  const id = c.req.param('id')

  if (id) {
    const result = await fromID(c.env.DB, id)
    if (result.results.length > 0) {
      const url = result.results[0]?.url
      if (url)
        return c.render(html`
          <script>
            window.location.href = "${url}"
          </script>
        `)
    }
  }

  return c.text("Not Found", 404)
})

export default app
