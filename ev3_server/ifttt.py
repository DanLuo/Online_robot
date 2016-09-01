import subprocess

event='https://maker.ifttt.com/trigger/{ev3connect}/with/key/cfVKTzoL42iqhK79ERoxz_'

trigger=input('trigger? ')
if trigger=='y':
    message=subprocess.check_call(['curl','-X','POST',event])
    print message
elif trigger=='n':
    subprocess.check_call(['echo','no trigger'])
    #print 'no trigger'