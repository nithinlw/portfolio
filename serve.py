"""Tiny dev server for the portfolio: serves ./site with caching disabled.
Usage:  python serve.py [port]      then open http://localhost:5173"""
import http.server, os, sys, functools

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, *a):
        pass

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")
    handler = functools.partial(NoCache, directory=root)
    print(f"Serving {root} at http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
