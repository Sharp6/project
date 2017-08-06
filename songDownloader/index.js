var Worker = require('./songDownoaderWorker');
var Sender = require('./songDownloaderRabbitSender');

var sender = new Sender();
var worker = new SongDownloaderWorker(sender);