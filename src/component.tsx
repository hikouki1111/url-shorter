import { html } from 'hono/html'
import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <title>URL Shorter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Shorten your URL">
        <meta name="keywords" content="x.gd, url短縮, url-shorter, tinyurl, url短縮サービス, url短縮ツール">
        <meta name="format-detection" content="telephone=no,email=no,address=no">
        <link rel="canonical" href="https://0cu.icu">
        <link rel="icon" href="https://raw.githubusercontent.com/hikouki1111/url-shorter/refs/heads/image/icon.png">
        <link rel="apple-touch-icon" href="https://raw.githubusercontent.com/hikouki1111/url-shorter/refs/heads/image/icon.png">

        <!-- OGP -->
        <meta property="og:url" content="https://0cu.icu">
        <meta property="og:type" content="website">
        <meta property="og:title" content="URL Shorter">
        <meta property="og:description" content="Shorten your URL">
        <meta property="og:site_name" content="URL Shorter">
        <meta property="og:image" content="https://raw.githubusercontent.com/hikouki1111/url-shorter/refs/heads/image/icon_large.png">
        <meta property="og:locale" content="ja_JP">

        <!-- OGP X (Twitter) -->
        <meta name="x:card" content="summary_large_image">
        <meta name="x:title" content="URL Shorter">
        <meta name="x:description" content="Shorten your URL">
        <meta name="x:image" content="https://raw.githubusercontent.com/hikouki1111/url-shorter/refs/heads/image/icon_large.png">

        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="p-4 flex flex-col justify-center items-center text-center">
          <h1 class="font-bold text-4xl">URL Shorter</h1>
          ${children}
        </div>
      </body>
    </html>
  `
})

export const Result = ({ message, error }: { message: string, error: boolean }) => {
  const getColor = () => {
    if (!error) return "border-blue-500 bg-blue-100"
    else return "border-red-500 bg-red-100"
  }

  return(
    <div class={`border rounded-sm w-64 bg-opacity-50 ${getColor()}`}>
      <p>{message}</p>
    </div>
  )
}

interface ChangeEvent<T = Element> {
  target: EventTarget & T
}

export const Panel = () => {
  return(
    <div class="flex flex-col gap-4">
      <div id="result"></div>
      <form class="flex flex-col gap-4" hx-post="/shorter" hx-target="#result" _="on htmx:afterRequest reset() me">
        <input class="border-2 rounded-md w-64" name="url" type="text" />
        <button class="border-2 rounded-md w-64" type="submit" id="submit-button">Shorten</button>
      </form>
    </div>
  )
}