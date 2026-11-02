"""Local dev server that mirrors the production cache rule in _headers.

python3 -m http.server sends no Cache-Control, so browsers cache the ES modules under
js/ heuristically and keep running stale code after an edit. This sends no-cache, so
every module is revalidated, as _headers asks of the real host.

    python3 tools/serve.py [port]   (default 4173, bound to 127.0.0.1)
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
print(f"Serving on http://127.0.0.1:{port}", flush=True)
http.server.ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
