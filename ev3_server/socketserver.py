import socket
import SocketServer


ip=''
port=9001

class MyTCPHandler(SocketServer.BaseRequestHandler):
    def handle(self):
        # self.rfile is a file-like object created by the handler;
        # we can now use e.g. readline() instead of raw recv() calls
        self.data =self.request.recv(1024).strip()
        # print "{} wrote:".format(self.client_address[0])
        #data = json.loads(self.data)
        #data = ast.literal_eval(data)
        print self.data

def socketSever():
    sock=SocketServer.TCPServer((ip,port),MyTCPHandler)

if __name__ == "__main__":
    sock = SocketServer.TCPServer((ip, port), MyTCPHandler)
    sock.serve_forever()