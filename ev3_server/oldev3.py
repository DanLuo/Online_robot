# ev3dev python library for LEDs, sensors, and motors
# current functions:
#   writeLED(location,color,rgb)
#   runMotor(port,speed)
#   stopMotor(port)
#   getSensor(type,port)
#       inputs: ultrasonic, gyro, touch, IR, color
#   playSound(freq,volume)
#   stopSound()

#HAHAHAHA

import os,sys
from os import curdir,sep,listdir
import re
import json
import time



#LED SECTION
#LED path
ledpath = '/sys/class/leds/ev3-{}:{}:ev3dev/'
ledbright = ledpath +'brightness'

# turn on/off LED ex. writeLED('left1','green',20)
# *********** maybe just left/right and convert? *******
def writeLED(location,color,rgb):
    if type(rgb) != 'str':
        rgb = str(rgb)
    LED = open(ledbright.format(location,color),"w",0)
    LED.write(rgb + '\n')
    LED.close()



#MOTOR SECTION
#motor definitions
motorAttached = '/sys/class/tacho-motor/'
motorpath = '/sys/class/tacho-motor/{}/'
setMotorSpeed = motorpath + 'duty_cycle_sp'
runMotorPath = motorpath + 'command'
checkMotorPort = motorpath + 'port_name'

#Get motor port information
def getMotors():
    existingMotors = os.listdir(motorAttached)
    MOTORS = {}
    for i in range(0,len(existingMotors)):
        try:
            motorRead = open(checkMotorPort.format(existingMotors[i]))
            mo = motorRead.read()
            motorRead.close()
            MOTORS[mo[3]] = existingMotors[i]
        except IOError:
            print "no motor"
    return MOTORS

# turn motor on ex. runMotor('A',100)
def runMotor(port,speed):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    if type(speed) != "str":
        speed = str(speed)
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(setMotorSpeed.format(MOTORS[port]),"w",0)
        motor.write(speed + '\n')
        motor.close()
        motor = open(runMotorPath.format(MOTORS[port]),"w",0)
        motor.write('run-forever')
        motor.close()
    else:
        print "no motor attached to port {}".format(port)

#Stop moving motor
def stopMotor(port):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(runMotorPath.format(MOTORS[port]),"w",0)
        motor.write("stop")
        motor.close()
    else:
        print "no motor attached to port {}".format(port)

def getPortNumber(port):
    if port == "A":
        num = 0
    elif port == "B":
        num = 1
    elif port == "C":
        num = 2
    elif port == "D":
        num = 3
    else:
        num = ''
    return num

#Reset motor position value,this function will change whatever value in position file to 0
def resetmotor(port):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(runMotorPath.format(MOTORS[port]),"w",0)
        motor.write("reset")
        motor.close()
    else:
        print "no motor attached to port {}".format(port)


#Get position of the motor
def getmotorposition(port):
    position = ''
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(motorpath.format(MOTORS[port])+'position',"r",0)
        position=motor.read()
        motor.close()
    else:
        print "no motor attached to port {}".format(port)
    return position

#Run motor with specific amount position value using relative position file
def runposition(port,value,speed):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    speed=str(speed)
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(setMotorSpeed.format(MOTORS[port]),"w",0)
        motor.write(speed + '\n')
        motor.close()
        motor = open(motorpath.format(MOTORS[port])+'position_sp',"w",0)
        value=str(value)
        position=motor.write(value)
        motor.close()
    else:
        print "no motor attached to port {}".format(port)


#Run motor for given amount of time (ms)
def timerun(port,time):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(motorpath.format(MOTORS[port])+'time_sp',"w",0)
        time=str(time)
        position=motor.write(time)
        motor.close()
    else:
        print "no motor attached to port {}".format(port)


#Fast change motor speed
def fastspeedchange(port,speed):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    MOTORS = getMotors()
    speed=str(speed)
    if port in MOTORS:
        motor = open(runMotorPath.format(MOTORS[port]),"w",0)
        motor.write("run-direct")
        motor.close()
    else:
        print "no motor attached to port {}".format(port)
    changespeed=open(motorpath.format(MOTORS[port])+'duty_cycle_sp',"w",0)
    changespeed.write(speed)
    changespeed.close()


#Motor commands
def motorcommand(port,command):
    port = port.upper()
    num = getPortNumber(port)
    if num == "":
        print "please enter correct motor port"
        return
    MOTORS = getMotors()
    if port in MOTORS:
        motor = open(runMotorPath.format(MOTORS[port]),"w",0)
        motor.write(command)
        motor.close()
    else:
        print "no motor attached to port {}".format(port)






#SENSOR SECTION
#sensor definitions
sensorpath = '/sys/class/lego-sensor/{}/'
sensorValue = sensorpath + 'value0'
sensorAttached = '/sys/class/lego-sensor/'
checkSensorPort = sensorpath + 'port_name'
drivername = sensorpath + 'driver_name'


#
def getAllSensors():
    SENSORS = {}
    try:
        existingSensors = os.listdir(sensorAttached)
        for i in range(0,len(existingSensors)):
            try:
                senRead = open(checkSensorPort.format(existingSensors[i]))
                mo = senRead.read()
                senRead.close()
                SENSORS[mo[2]] = existingSensors[i]
            except IOError:
                print "no sensors"
    except IOError:
        print "no sensors"
    return SENSORS

#Get sensor info based on driver information
def sensorInfo(name):
    if name.find('lego-ev3-us') == 0 or name.find('lego-nxt-us') == 0:
        return 'ultrasonic sensor','mm'
    # gyro sensor
    elif name.find('lego-ev3-gyro') == 0:
        return 'gyro sensor','deg'
    # touch sensor
    elif name.find('lego-ev3-touch') == 0 or name.find('lego-nxt-touch') == 0:
        return 'touch sensor','boolean'
    # ir sensor
    elif name.find('lego-ev3-ir') == 0:
        return 'IR sensor','%'
    # color sensor
    elif name.find('lego-ev3-color') == 0:
        return 'color sensor','%'
    # unknown sensor
    else:
        return 'unknown sensor',''

#Get sensor value
def getSensor(port):
    SENSORS = getAllSensors()
    if type(port) != 'str':
        port = str(port)

    if port in SENSORS:
        s = open(sensorValue.format(SENSORS[port]))
        value = s.read()
        s.close()
        s = open(drivername.format(SENSORS[port]))
        sensor = s.read()
        s.close()
        name, units = sensorInfo(sensor)
        value=int(value.strip())
        sensorinfo={'type':name,'value':value,'unit':units}
        #sensorinfo=str(sensorinfo)
        #return int(value.strip()),name,units
        return sensorinfo
    else:
        name='no sensor'
        value=0
        units='N/A'
        sensorinfo={'type':name,'value':value,'unit':units}
        #sensorinfo=str(sensorinfo)
        sensorinfo=json.dumps(sensorinfo)
        #sensorinfo='No sensor on port',port
        return sensorinfo



#SOUND SECTION
#sound definitions
soundpath = '/sys/devices/platform/snd-legoev3/{}'

def playSound(freq,volume):
    s = open(soundpath.format('volume'),"w",0)
    s.write(str(volume) + '\n')
    s.close()
    s = open(soundpath.format('tone'),"w",0)
    s.write(str(freq) + '\n')
    s.close()
    time.sleep(1)
    stopSound()


def stopSound():
    s = open(soundpath.format('tone'),"w",0)
    s.write(str(0) + '\n')
