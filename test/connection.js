module('Connection');
test('Constructor', function() {
	assertConstructor( Connection, EventEmitter );
});

test('Events', function(){
	var log = [];
	function logger(title) {
		return function(param) {
			log.push(title);
		};
	}
	var o = new Connection( 'http://localhost/', 'uclt.cgi', new MockAjaxRequest( true ) );
	
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
	equal( o.xhr._dataSent, '', 'Commands not sent on register' );
	
	deepEqual( log, [], 'No event raised initially' );
	o.open();
	
	deepEqual( log, ['open'], 'Open event raised' );
	equal( o.opened, true, 'Connection.opened is true' );
	equal( o.xhr._dataSent, 'command1\n', 'Commands sent on open' );
	log.clear();
	
	o.registerCommand( 'command2' );
	deepEqual( o.commands, ['command1', 'command2'], 'Command registered in opened connection' );
	deepEqual( log, ['close'], '"close" event emitted' );
	equal( o.opened, false, 'Connection.opened is false' );
	QUnit.stop();
	setTimeout(function(){
		deepEqual( log, ['close', 'open'], 'Connection reopened after some delay' );
		equal( o.opened, true, 'Connection.opened is true again' );
		equal( o.xhr._dataSent, 'command1\ncommand1\ncommand2\n', 'Commands resent on reopen' );
		log.clear();
		
		o.unregisterCommand( 'command1' );
		deepEqual( log, [], 'Connection kept open on unregister' );
		equal( o.opened, true, 'Connection.opened is still true' );
		equal( o.xhr._dataSent, 'command1\ncommand1\ncommand2\n', 'Commands not resent on unregister' );
		deepEqual( o.commands, ['command2'], 'Command removed on unregister' );
		
		o.close();
		deepEqual( log, ['close'], 'Connection closed' );
		equal( o.opened, false, 'Connection.opened is false' );
		equal( o.xhr._dataSent, 'command1\ncommand1\ncommand2\n', 'Commands not resent on close' );
		
		o.open();
		deepEqual( log, ['close', 'open'], 'Connection reopened manually' );
		equal( o.opened, true, 'Connection.opened is true again' );
		equal( o.xhr._dataSent, 'command1\ncommand1\ncommand2\ncommand2\n', 'Commands resent on manual reopen' );
		log.clear();
		
		o.xhr._receive( 'line1\nline2' );
		deepEqual( log, ['data'], 'Data reception triggers the "data" event' );
		
		QUnit.start();
	}, 500);

});
