var SongConverterWorker = function() {
    this.convertSong = function(card) {
        exec('avconv ' + __dirname + '/' + card + ' -o ' + __dirname + '/' + card + '.wav', (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });
    }
}

module.exports = SongConverterWorker;