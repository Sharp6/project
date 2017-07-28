var Listener = function(amqp, worker) {
    this.amqp = amqp;
    this.worker = worker;

    this.amqp.connect('amqp://192.168.1.129', (err, conn) => {
        if(err) {
            console.log(err);
        }
        conn.createChannel((err, ch) => {
            if(err) {
                console.log(err);
            }
            var ex = 'jukeboxExchange';
            ch.assertExchange(ex, 'topic', {durable: false});
            
            ch.assertQueue('', {exclusive: true}, (err, q) => {
                if(err) {
                    console.log(err);
                }
                ch.bindQueue(q.queue, ex, 'card');
                ch.consume(q.queue, (msg) => {
                    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
                    this.worker.generateCode(msg.content.toString());
                }, {noAck: true});
            });
        });
    });
}

module.exports = Listener;
