var sender = function(amqp) {
    this.amqp = amqp;

    this.send = function(key, msg) {
        this.amqp.connect('amqp://192.168.1.129', function(err, conn) {
            conn.createChannel(function(err, ch) {
                var ex = 'jukeboxExchange';

                ch.assertExchange(ex, 'topic', {durable: false});
                ch.publish(ex, key, new Buffer(msg));
                console.log(" [x] Sent %s:'%s'", key, msg);
            });

            setTimeout(function() { conn.close(); }, 500);
        });
    }.bind(this);
}

module.exports = sender;
