var amqp = require('amqplib/callback_api');
var Listener = require('./codeGeneratorRabbitListener');
var Worker = require('./codeGeneratorWorker');
var Sender = require('./codeGeneratorRabbitSender');

var sender = new Sender(amqp);
var worker = new Worker(sender);
var listener = new Listener(amqp, worker);
