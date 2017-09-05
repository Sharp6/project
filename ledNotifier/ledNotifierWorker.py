import RPi.GPIO as GPIO

class LedNotifierWorker:
    def __init__(self):
        # self.rabbitSender = CardReaderRabbitSender()
        GPIO.setmode(GPIO.BCM)

        
        GPIO.setup(13, GPIO.OUT)
        GPIO.setup(12, GPIO.OUT)

        # The ready LED can be set high as soon as the program starts, and can stay that way
        GPIO.output(13,True)

        while True:
            # SLEEP

    def cardLedOn(self):
        GPIO.output(12,True)

    def cardLedOff(self):
        GPIO.output(12,False)

if __name__ == '__main__':
    print("Running LedNotifier Worker standalone")
    ln = LedNotifierWorker()
