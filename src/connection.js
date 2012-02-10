/**
 * @class
 */
function Connection( path, cgi ) {
	constructor( this );
	getargs( arguments, [], [ String, String ] );
	EventEmitter.apply( this, [[ 'open', 'data', 'close' ]] );
	path = defval( path, Connection.DEFAULT_PATH );
	cgi  = defval( cgi, Connection.DEFAULT_CGI );
	this.xhr = new AjaxRequest();
	this.commands = [];
	this.opened = false;
	this.autoreconnect = true;
	this.url = path + cgi;
}
Connection.DEFAULT_PATH = document.location.href;
Connection.DEFAULT_CGI = '';
Connection.REQUEST_HEADERS = {
    "Content-type": "multipart/signed; boundary=def",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "de-de,de;q=0.8,en-us;q=0.5,en;q=0.3"
};
Connection.inherits( EventEmitter );

( function( self ) {
	self.registerCommand = function( command ) {
		getargs( arguments, [ String ] );
		if ( this.opened ) {
			this.emit('close');
		}
		this.commands.push( command );
	}
	
	self.open = function() {
		getargs( arguments, [] );
		
		var processed = 0, obj = this, xhr = obj.xhr;
		
		xhr.open('POST', this.url, true);
		
		obj.on( 'close', function() {
			xhr.abort();
			if ( obj.autoreconnect ){
				obj.open();
			}
		} );
		obj.opened = true;
		
		function onreadystatechange() {
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
	
		for ( var key in Connection.REQUEST_HEADERS) {
			var value = Connection.REQUEST_HEADERS[key];
			xhr.setRequestHeader( key, value );
		}
		xhr.onreadystatechange = onreadystatechange;
		
		var data = this.commands.join( '\n' ) + '\n';
		this.emit( 'open', data );
		xhr.send( data );
	}
	
	self.close = function() {
		this.autoreconnect = false;
		this.emit( 'close' );
	}
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
