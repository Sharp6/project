import binascii
import sys

import Adafruit_PN532 as PN532

from cardReaderRabbitSender import CardReaderRabbitSender

class CardReaderWorker:
    def __init__(self):
        self.rabbitSender = CardReaderRabbitSender()

        CS   = 16
        MOSI = 23
        MISO = 24
        SCLK = 25

        self.pn532 = PN532.PN532(cs=CS, sclk=SCLK, mosi=MOSI, miso=MISO)
        self.pn532.begin()
        print('Found PN532')

        self.pn532.SAM_configuration()

	cachedCardId = None

        while True:
            cardId = self.checkCard()

            # Situation is the same, do nothing
            if cardId == cachedCardId:
                continue

            # Situation changed!
            cachedCardId = cardId

            # New situation: Card is removed
            if cardId is None:
                self.rabbitSender.publish("empty")
                continue

            # New situation: New card found!
            self.rabbitSender.publish(cardId)

    def checkCard(self):
        uid = self.pn532.read_passive_target()
        if uid is None:
            return None
        else:
            return format(binascii.hexlify(uid))

if __name__ == '__main__':
    print("Running CardReader Worker standalone")
    crw = CardReaderWorker()
