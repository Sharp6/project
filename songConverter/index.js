var amqp = require('amqplib/callback_api');
var Listener = require('./songConverterRabbitListener');
var Worker = require('./songConverterWorker');

var worker = new Worker();
var listener = new Listener(amqp, worker);