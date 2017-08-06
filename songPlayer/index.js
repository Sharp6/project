var amqp = require('amqplib/callback_api');
var Listener = require('./songPlayerRabbitListener');
var Worker = require('./songPlayerWorker');

var worker = new Worker();
var listener = new Listener(amqp, worker);
