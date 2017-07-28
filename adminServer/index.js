var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');

var io = require('socket.io')(server);
var amqp = require('amqplib/callback_api');

server.listen(1804);

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function (socket) {
  socket.emit('message', { system: 'Connected to socket.io server' });
});

amqp.connect('amqp://192.168.1.129', function(err, conn) {
  conn.createChannel(function(err, ch) {
    if(err) {
        return console.log(err);
    }
    var ex = 'jukeboxExchange';

    ch.assertExchange(ex, 'topic', {durable: false});
    ch.assertQueue('', {exclusive: true}, function(err, q) {
        if(err) {
            return console.log(err);
        }
      ch.bindQueue(q.queue, ex, '#');

      ch.consume(q.queue, function(msg) {
        var message = {};
        message[msg.fields.routingKey] = msg.content.toString();
        io.sockets.emit('message', message);
      }, {noAck: true});
    });
  });
});
