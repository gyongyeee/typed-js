/**
 * @class Connection
 */
function Connection( path, cgi, xhr ) {
	constructor( this );
	getargs( arguments, [], [ String, String, AjaxRequest ] );
	EventEmitter.apply( this, [[ 'open', 'data', 'close' ]] );
	path = defval( path, Connection.DEFAULT_PATH );
	cgi  = defval( cgi, Connection.DEFAULT_CGI );
	if ( typeof xhr == 'undefined' )
		xhr  = new AjaxRequest();
	this.xhr = xhr;
	this.commands = [];
	this.opened = false;
	this.autoreconnect = true;
	this.url = path + cgi;
	
	var obj = this, xhr = obj.xhr, processed = 0;
	xhr.onreadystatechange = function() {
		// Extract unprocessed data
		if ( xhr && xhr.responseText && xhr.responseText.length && ( processed < xhr.responseText.length ) ) {
			var data = xhr.responseText.substring( processed );
			obj.emit( 'data', data );
			processed = xhr.responseText.length;
		}
		// connection was closed
		if ( xhr.readyState == 4 )
			obj.emit( 'close' );
	};
	obj.on( 'open', function() {
		processed = 0;
		obj.opened = true;
	});
	obj.on( 'close', function() {
		obj.xhr.abort();
		obj.opened = false;
		if ( obj.autoreconnect ){
			setTimeout( function(){ 
				obj.open(); 
			}, Connection.AUTO_RECONNECT_DELAY );
		}
	} );
}
Connection.AUTO_RECONNECT_DELAY = 100;
Connection.DEFAULT_PATH = document.location.href;
Connection.DEFAULT_CGI = '';
Connection.REQUEST_HEADERS = {
    "Content-type": "multipart/signed; boundary=def",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-de,de;q=0.8,en-us;q=0.5,en;q=0.3"
};
Connection.inherits( EventEmitter );

( function( self ) {
	/**
	 * Add a command to the list of registered commands.
	 * Since commands are sent when opening a connection, 
	 * close the connection if it is already opened.
	 * 
	 * @param String command
	 */
	self.registerCommand = function( command ) {
		getargs( arguments, [ String ] );
		if ( this.opened ) {
			this.emit('close');
		}
		this.commands.push( command.valueOf() );
	};
	/**
	 * Remove a command from the list of registered commands.
	 * Does not affect the opened state of the connection.
	 * 
	 * @param String command
	 */
	self.unregisterCommand = function( command ) {
		getargs( arguments, [ String ] );
		var pos = this.commands.indexOf( command.valueOf() );
		if ( pos > -1 ) {
			this.commands.splice( pos, 1 );
		}
	};

	/**
	 * Opens the connection
	 */
	self.open = function() {
		getargs( arguments, [] );
		var processed = 0, obj = this, xhr = obj.xhr;
		if ( obj.opened ) return;
		xhr.open('POST', this.url, true);
		
		for ( var key in Connection.REQUEST_HEADERS) {
			var value = Connection.REQUEST_HEADERS[key];
			xhr.setRequestHeader( key, value );
		}
		
		var data = this.commands.join( '\n' ) + '\n';
		this.emit( 'open', data );
		xhr.send( data );
	};
	
	/**
	 * Closes the connection
	 */
	self.close = function() {
		this.autoreconnect = false;
		this.emit( 'close' );
	};
} )( Connection.prototype );
/**
 * Open the connection, send data through it, process answer and close
 * 
 * @param data
 */
Connection.prototype.sendQuery = function( data ) {
	getargs( arguments, [ String ] );
	/**
	 * Send a query to the Universal Commandline Tool and process the results.
	 * 
	 * @param string query
	 * @param function callback
	 */
	console.log( 'Sent: ' + query );
	$.post( path + cgi, query, function( data ) {
		console.log( 'Received for ' + query, data );
		obj.parseBlock( data );
		if ( typeof callback == 'function' )
			callback( data );
	} );
}
