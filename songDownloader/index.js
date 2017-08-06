var amqp = require('amqplib/callback_api');
var Worker = require('./songDownloaderWorker');
var Sender = require('./songDownloaderRabbitSender');

var sender = new Sender(amqp);
var worker = new Worker(sender);