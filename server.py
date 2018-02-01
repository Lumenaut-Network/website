# Generate self-signed certificate:
#    openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout localhost.key -out localhost.crt -subj "/CN=localhost" -days 3650
#
# Run:
#    python filename.py
#
# Open:
#    https://localhost:4443

from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl

httpd = HTTPServer(('localhost', 4443), SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket (httpd.socket,
        keyfile="localhost.key",
        certfile="localhost.crt", server_side=True)

httpd.serve_forever()
