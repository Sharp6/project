#!/usr/bin/env python
import pika

class CardReaderRabbitSender:
    def __init__(self):
        self.exchange = 'jukeboxExchange'

    def publish(self, message):
        connection = pika.BlockingConnection(pika.ConnectionParameters(host='127.0.0.1'))
        channel = connection.channel()
        channel.exchange_declare(exchange=self.exchange, type='topic')

        routing_key = 'card'
        channel.basic_publish(exchange=self.exchange, routing_key=routing_key, body=message)
        print(" [x] Sent %r:%r" % (routing_key, message))
        connection.close()
