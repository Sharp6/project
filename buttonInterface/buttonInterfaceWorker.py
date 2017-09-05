from time import sleep
from subprocess import call
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)

GPIO.setup(5, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(6, GPIO.IN, pull_up_down=GPIO.PUD_UP)
  
def volumeUp(channel):  
    print "Button interface sending volume up command"
    call(["amixer sset PCM 5%+"])
  
def volumeDown(channel):  
    print "Button interface sending volume down command"
    call(["amixer sset PCM 5%-"])

GPIO.add_event_detect(5, GPIO.FALLING, callback=volumeUp, bouncetime=300)  
GPIO.add_event_detect(6, GPIO.FALLING, callback=volumeDown, bouncetime=300)  
  
while True:
    sleep(60)
GPIO.cleanup()
