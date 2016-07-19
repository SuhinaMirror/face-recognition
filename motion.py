import sys
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
PIR_PIN = 14
GPIO.setup(PIR_PIN, GPIO.IN)

def MOTION(PIR_PIN):
	print "MOTION"
	sys.stdout.flush()

try:
	GPIO.add_event_detect(PIR_PIN, GPIO.RISING, callback=MOTION)
	while 1:
		time.sleep(1)

except KeyboardInterrupt:
	GPIO.cleanup()
