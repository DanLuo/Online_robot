#!/usr/bin/python

from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import socket
import SocketServer
import json
import ev3
import ast
from uuid import getnode
import time
import os
import fcntl
import struct
import thread
import threading
import subprocess
import random
import signal
import sys
#import netifaces as ni

#Obtain device information
host_name=socket.gethostname()
#host_ip=socket.gethostbyname(host_name)
#host_ip=ni.ifaddresses('eth0')[2][0]['addr']
#macAddress=getnode()
device_info={'name':host_name}
device_info=json.dumps(device_info)
#print device_info
#print type(device_info)


REGISTER=False
host_IP=''
#Global variables
breakValue=0
timeBreak=0
test_value=0
status=0
Accesscode=''
bindingAddress=''
threadLock = thread.allocate_lock()
ifttt='https://maker.ifttt.com/trigger/{ev3connect}/with/key/cfVKTzoL42iqhK79ERoxz_'



def register(message):
    data=''
    addr=''
    register_PORT=8997
    web_host_IP='192.168.0.100'
    web_host_PORT=8999
    #message='Register'
    #message='Register'
    register_socket=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
    register_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    register_socket.bind((host_IP,register_PORT))
    register_socket.sendto(message,(web_host_IP,web_host_PORT))
    data,addr=register_socket.recvfrom(1024)
    register_socket.close()
    print 'data received: ',data
    return data



def test(text):
    print text

def stateMachine():
    global breakValue
    global threadLock
    status=0
    value=0
    i=0
    while True:
        while status==0:
            while value<3:
                #threadLock.acquire()
                thread.start_new_thread(test,('Hello',))
                #threadLock.release()
                value += 1
                time.sleep(2)
                if breakValue==1:break
            status=1
        if status==1:
            #threadLock.acquire()
            thread.start_new_thread(test,(value,))
            #threadLock.release()
            status=0
            value=0
            print 'Break value=',breakValue
            if breakValue == 1: break
        if breakValue==1:break




def sensorControlMotor(sPort,sLimit,mPort,mSpeed):

    #sensor=ev3.getSensor(1)
    #global breakValue
    threadLock = thread.allocate_lock()
    status=0
    value=0
    count=10
    i=0
    while True:
        while status==0:
            while value!=sLimit:
                value = ev3.getSensor(int(sPort))['value']
                print(value)
                time.sleep(0.2)
                if breakValue==1:break
                #thread.exit()
            status=1
            count +=1
            cmd =count/2.0
        if status==1:
            print cmd
            if cmd-int(cmd)!=0:
                threadLock.acquire()
                thread.start_new_thread(ev3.runMotor,(mPort, mSpeed,))
                threadLock.release()
            else:
                threadLock.acquire()
                thread.start_new_thread(ev3.stopMotor,(mPort,))
                threadLock.release()
            status=0
            value=0
            if breakValue == 1: break
        #time.sleep(1)
        if breakValue==1:break
        print breakValue

def assign(variable,value):
    variale=value
def stopAll():
    breakValue = 1
    print breakValue
    # stop motor running
    ev3.stopMotor('A')
    ev3.stopMotor('B')
    ev3.stopMotor('C')
    ev3.stopMotor('D')


class mythread(threading.Thread):
    def __init__(self,action,target,source):
        self.action=action
        self.target=target
        self.source=source
        threading.Thread.__init__(self)
    def run(self):
        if self.action=='wait':
            time.sleep(self.source.data)


class MyTCPHandler(SocketServer.StreamRequestHandler):

    def handle(self):
        # self.rfile is a file-like object created by the handler;
        # we can now use e.g. readline() instead of raw recv() calls
        self.data = self.rfile.readline().strip()
        #print "{} wrote:".format(self.client_address[0])
        data=json.loads(self.data)
        data=ast.literal_eval(data)
        print data




class ev3Websocket(WebSocket):

    def handleMessage(self):
        global breakValue
        global threadLock
        global timeBreak
        global status
        global Accesscode
        global bindingAddress
        print self.data
        print self.address
        print type(self.data)
        data=json.loads(self.data)
        print data

        if 'service' in data:
            if data['service']==u'deviceInfo':
                self.sendMessage(u'JSON'+unicode(device_info))
                print(device_info)
                print('Message sent')
            if data['service']==u'bind':
                if status==0:
                    Accesscode1=random.randint(0,100)
                    Accesscode2=random.uniform(0,10)
                    Accesscode=str(Accesscode1*Accesscode2)
                    print type(Accesscode)
                    print Accesscode
                    message={'message':'Bind with '+host_name,'nextfire':'no','thisfire':'no','accesscode':Accesscode}
                    message=json.dumps(message)
                    self.sendMessage(u'JSON'+unicode(message))
                    print(message)
                    status=1
                    bindingAddress=self.address[0]
                else:
                    if self.address[0]==bindingAddress:
                        self.sendMessage(u'STRNYou are already connected with this ev3')
                    else:
                        self.sendMessage(u'STRNThis ev3 is busy')


                ev3.playSound('196',1)
                time.sleep(0.1)
                ev3.playSound('294',1)
                time.sleep(0.1)
                ev3.stopSound()
                # ev3.playSound('246',1)
                # time.sleep(0.1)
                # ev3.stopSound()
                # ev3.playSound('294',1)
                # time.sleep(0.1)
                # ev3.stopSound()


            if data['service']==u'release':
                message={'message':'Disconnected with '+host_name,'nextfire':'no','thisfire':'no','releasecode':Accesscode}
                message=json.dumps(message)
                self.sendMessage(u'JSON'+unicode(message))
                print(message)
                status=0
                ev3.playSound('294',1)
                time.sleep(0.1)
                #ev3.stopSound()
                ev3.playSound('196',1)
                time.sleep(0.1)
                ev3.stopSound()

            if data['service']==u'SCM':
                thread.start_new(sensorControlMotor,(data['sPort'],data['sLimit'],data['mPort'],data['mSpeed'],))
            if data['service']==u'touchSensorControl':
                thread.start_new_thread(stateMachine,())
            if data['service']==u'wait':
                thread.start_new_thread(self.wait,(float(data['time']),))
                #ev3Websocket.threads.append(waitthread)

                # time.sleep(int(data['time']))
                # message = {'message': "time's up", 'nextFire': 'yes'}
                # message = json.dumps(message)
                # self.sendMessage(u'JSON' + unicode(message))
                #print(message,'sent')
            if data['service']==u'stopAll':
                with threadLock:
                    timeBreak = 1
                #     breakValue=1
                #     self.timeBreak=1
                # ev3Websocket.sensorBreak=1
                # print breakValue
                #stop motor running
                ev3.stopMotor('A')
                ev3.stopMotor('B')
                ev3.stopMotor('C')
                ev3.stopMotor('D')
                message={'message':'Program Stopped','nextfire':'no'}
                message=json.dumps(message)
                self.sendMessage(u'JSON'+unicode(message))
                time.sleep(1)
                timeBreak=0
                print(message,'sent')
            if data['service']==u'stop':
                ev3.stopMotor('A')
                ev3.stopMotor('B')
                ev3.stopMotor('C')
                ev3.stopMotor('D')
                message={'message':'Program Stopped','nextfire':'no'}
                message=json.dumps(message)
                self.sendMessage(u'JSON'+unicode(message))
        elif 'device' in data:
            if data['device']==u'led':
               self.sendMessage(u'STRNLED updated')
            elif data['device']==u'motor':
                if data['cmd']==u'run':
                   if data['direction']==u'left':
                       data['speed']=-int(data['speed'])
                       data['speed']=str(data['speed'])
                   for port in data['port']:
                       ev3.runMotor(port,data['speed'])
                   message={'message':'Running Motor','nextfire':'yes'}
                   message=json.dumps(message)
                   self.sendMessage(u'JSON'+unicode(message))
                elif data['cmd']==u'stop':
                    for port in data['port']:
                        ev3.stopMotor(port)
                    message={'message':'Motor Stopped','nextfire':'yes'}
                    message=json.dumps(message)
                    self.sendMessage(u'JSON'+unicode(message))
                print 'motor updated'
            elif data['device']==u'sensor':
                    triggerType=data['triggerType']
                    sensorinfo = ev3.getSensor(data['port'])
                    print sensorinfo
                    print(sensorinfo['value'])
                    if triggerType=='touch':
                        if sensorinfo['value']==data['trigger']:
                            sensorinfo['nextfire'] = 'yes'
                            sensorinfo=json.dumps(sensorinfo)
                            time.sleep(data['time'])
                            self.sendMessage(u'JSON'+unicode(sensorinfo))
                            #subprocess.check_call(['curl','-k','-X', 'POST', ifttt])
                        else:
                            sensorinfo['nextfire'] = 'no'
                            sensorinfo['thisfire'] = 'yes'
                            sensorinfo=json.dumps(sensorinfo)
                            time.sleep(data['time'])
                            self.sendMessage(u'JSON'+unicode(sensorinfo))
                    elif triggerType=='GreaterThan':
                        if sensorinfo['value']>int(data['trigger']):
                            sensorinfo['nextfire'] = 'yes'
                            sensorinfo=json.dumps(sensorinfo)
                            time.sleep(data['time'])
                            self.sendMessage(u'JSON'+unicode(sensorinfo))
                        else:
                            sensorinfo['nextfire'] = 'no'
                            sensorinfo['thisfire'] = 'yes'
                            sensorinfo=json.dumps(sensorinfo)
                            time.sleep(data['time'])
                            self.sendMessage(u'JSON'+unicode(sensorinfo))
                    elif triggerType=='SmallerThan':
                        if sensorinfo['value']<int(data['trigger']):
                            sensorinfo['nextfire'] = 'yes'
                            sensorinfo=json.dumps(sensorinfo)
                            time.sleep(data['time'])
                            self.sendMessage(u'JSON'+unicode(sensorinfo))
                        else:
                            sensorinfo['nextfire'] = 'no'
                            sensorinfo['thisfire'] = 'yes'
                            sensorinfo=json.dumps(sensorinfo)
                            time.sleep(data['time'])
                            self.sendMessage(u'JSON'+unicode(sensorinfo))

    def wait(self,seconds):
        global timeBreak
        print 'timeBreak==',timeBreak
        i=0
        #ev3Websocket.breakValue
        while i<seconds:
            if timeBreak==0:
                time.sleep(1)
                i+=1
            else:
                # message = {'message': 'time is up', 'nextFire': 'no'}
                # message = json.dumps(message)
                # self.sendMessage(u'JSON' + unicode(message))
                print 'wait broken'
                timeBreak = 0
                thread.exit() #exit time wait when timeBreak is 1
        message = {'message': 'time is up', 'nextfire': 'yes'}
        message = json.dumps(message)
        self.sendMessage(u'JSON' + unicode(message))
        print (message,'sent')


class sensorHandler(WebSocket):
    def handleMessage(self):
        print self.data
        data=json.loads(self.data)
        print data

        sensorinfo = {"type": "HEHEHE", "value": 10}
        sensorinfo = json.dumps(sensorinfo)
        self.sendMessage(u'JSON' + unicode(sensorinfo))




def registration():
    data=''
    print "connecting"
    #web_host_IP='10.0.0.216'
    web_host_IP='130.64.149.72'
    web_host_PORT=8999
    message='Registered'
    while message!='Registered':
        register_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        register_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        register_socket.settimeout(2)
        register_socket.connect((web_host_IP,web_host_PORT))
        register_socket.send(message)
        data, addr = register_socket.recvfrom(1024)
        if register_socket.timeout:
            print "connection fialed"
        register_socket.close()
    print data
    return data


class EV3SocketSever(SimpleWebSocketServer):
    def close(self):
        register("Release")
        self.serversocket.close()

        for desc, conn in self.connections.items():
            conn.close()
            conn.handleClose()

def socket_server(serve_PORT):
    ev3_websocket_server = EV3SocketSever(host_IP, serve_PORT, ev3Websocket)
    try:
        #serve_PORT=9000
        signalHandler()
        server_address=(host_IP,serve_PORT)
        print 'Start Server on port: '+str(serve_PORT)
        ev3_websocket_server.serveforever()

    except KeyboardInterrupt:
        print '^C received, shutting down the web server'
        #register('Release')
        ev3_websocket_server.close()
        sys.exit(0)


def signalHandler():
    # signal.signal(signal.SIGQUIT,signal_handler)
    # signal.signal(signal.SIGTERM,signal_handler)
    # signal.signal(signal.SIGTSTP,signal_handler)
    # signal.signal(signal.SIGTTIN,signal_handler)
    # signal.signal(signal.SIGTTOU,signal_handler)
    signal.signal(signal.SIGHUP,signal_handler)



def signal_handler(signum,frame):
    register('Release')
    ev3_websocket_server.close()
    print 'from ',signum
    sys.exit(0)




if __name__ == "__main__":


   # PID=os.fork()
   # if PID==0:
   #  serve_PORT=input('Select serving port: ')
   #  socket_server(serve_PORT)
    REGISTER = False
    while REGISTER==False:
        print 'registering....'
        confirmation=register('Register')
        #time.sleep(1)
        if confirmation=='registered':
            REGISTER=True
            print 'This device is registered on the Online-Robolab Server and ready to pair to any computer'
        else:
            time.sleep(2)


    #registration()
    socket_server(9001)
