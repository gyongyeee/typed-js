module('Connection');
test('Constructor', function() {
	assertConstructor( Connection, EventEmitter );
});
/*
test('Events', function(){
	var log = [];
	function logger(title) {
		return function(param) {
			log.push(title);
		};
	}
	var o = new Connection( 'http://localhost/', 'uclt.cgi' );
	o.xhr = new MockAjaxRequest();
	
	deepEqual( o.commands, [], 'No commands registered by default' );
	equal( o.opened, false, 'New connection is not opened automatically' );
	equal( o.autoreconnect, true, 'Autoreconnect is enabled by default' );
	
	ok(o.on instanceof Function, 'Has "on" method');
	o.on('open', logger('open'));
	o.on('data', logger('data'));
	o.on('close', logger('close'));
	
	o.registerCommand( 'command1' );
	deepEqual( o.commands, ['command1'], 'Command registered in closed connection' );
	equal( o.opened, false, 'Connection is still not opened' );
	
	deepEqual( log, [], 'No event raised initially' );
	o.open();
	
	deepEqual( log, ['open', 'command1\n'], 'Open event raised' );
	console.log(log);
	
	o.registerCommand( 'command2' );

	console.log(log);
	deepEqual( o.commands, ['command1', 'command2'], 'Command registered in opened connection' );
	deepEqual( log, ['open', 'command1\n', 'close', 'open', 'command2\n'], 'Connection closed and reopened' );

});
//*/