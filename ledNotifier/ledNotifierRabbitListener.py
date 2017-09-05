#!/usr/bin/env python
import pika
from ledNotifierWorker import LedNotifierWorker

class LedNotifierRabbitListener:
    def __init__(self):
        ex = 'jukeboxExchange'
        self.ledNotifierWorker = LedNotifierWorker()

        connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        channel = connection.channel()
        channel.exchange_declare(exchange=ex, type='topic')

        result = channel.queue_declare(exclusive=True)
        queue_name = result.method.queue
        channel.queue_bind(exchange=ex, queue=queue_name, routing_key='card')

        print(' [*] LedNotifier waiting for cards.')

        channel.basic_consume(self.callback, queue=queue_name, no_ack=True)
        channel.start_consuming()

    def callback(self, ch, method, properties, body):
        print(" [x] LedNotifier %r:%r" % (method.routing_key, body))
        # BUSINESS LOGIC HERE, EEEUW! Move this to worker. TODO
        if body == "empty":
            self.ledNotifierWorker.cardLedOff()
        else:
            self.ledNotifierWorker.cardLedOn()
        

if __name__ == '__main__':
    print("Running ledNotifier rabbitlistener standalone")
    lnrl = LedNotifierRabbitListener()
