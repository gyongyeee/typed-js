function xhrtest(Request, title) {
module( title );
test( "create", function() {
	ok( Request instanceof Function );
	var xhr = new Request();
	
	ok( typeof xhr != 'undefined', "XHR object is defined" );
	ok( typeof xhr.open != 'undefined', "'open' method is defined" );
	ok( typeof xhr.abort != 'undefined', "'abort' method is defined" );
	ok( typeof xhr.setRequestHeader != 'undefined', "'setRequestHeader' method is defined" );
	ok( typeof xhr.send != 'undefined', "'send' method is defined" );
	ok( typeof xhr.responseText != 'undefined', "'responseText' field is defined" );
	ok( typeof xhr.readyState != 'undefined', "'readyState' field is defined" );
	ok( typeof xhr.status != 'undefined', "'status' field is defined" );
	ok( typeof xhr.foobar == 'undefined', "'foobar' field is not defined" );
});
test( "synchronous mode" , function() {
	var xhr = new Request();
	
	var lastState = -1;
	xhr.onreadystatechange = function () {
		ok( xhr.readyState >= lastState, "Ready state is never decreasing" );
		lastState = xhr.readyState;
	}
	xhr.open( 'GET', document.location.href, AjaxRequest.MODE_SYNC );
	ok( lastState == AjaxRequest.STATE_LOADING, 'Load event raised on synchronous open' );
	xhr.send( null );
	ok( lastState == AjaxRequest.STATE_COMPLETE, 'Complete event raised after load in case of synchronous request' );
});
test( "asynchron mode" , function() {
	var xhr = new Request();
	
	var lastState = -1;
	xhr.onreadystatechange = function () {
		ok( xhr.readyState >= lastState, "Ready state is never decreasing: " + xhr.readyState );
		/**
		 * Measure loading and complete events only because of browser inconsystencies
		 */
		if ( (lastState != xhr.readyState) && ((xhr.readyState == AjaxRequest.STATE_LOADING) || (xhr.readyState == AjaxRequest.STATE_COMPLETE)) ){
			QUnit.start();
		}
		lastState = xhr.readyState;
	}
	xhr.open( 'GET', document.location.href, AjaxRequest.MODE_ASYNC );
	QUnit.stop();
	QUnit.stop();
	ok( lastState == AjaxRequest.STATE_LOADING, 'Loading event raised after opening an asynchronous request' );
	xhr.send( null );
//	ok( lastState == AjaxRequest.STATE_LOADING, 'No event raised when sending an asynchronous request' );
});
}

function MockAjaxRequest( interactive ) {
	this.responseText = "";
	this.readyState = "";
	this.status = "";
	this._interactive = ( interactive == true );
}
MockAjaxRequest.inherits(AjaxRequest);
(function(self){
	function setReadyState( obj, state ) {
		obj.readyState = state;
		if ( obj.onreadystatechange instanceof Function ) {
			obj.onreadystatechange.call( obj );
		}
	}
	
	self.open = function( method, location, async ) {
		this.async = ( async == AjaxRequest.MODE_ASYNC );
		setReadyState( this, AjaxRequest.STATE_LOADING );
	};
	self.abort = function() {};
	self.setRequestHeader = function() {};
	self.send = function() {
		if ( ! this._interactive ) {
			var obj = this;
			function change() {
				setReadyState( obj, AjaxRequest.STATE_INTERACTIVE );
				setReadyState( obj, AjaxRequest.STATE_COMPLETE );
			}
			if (this.async) {
				setTimeout(change, 100);
			} else {
				change();
			}
		}
	};
	self._receive = function( data ) {
		this.responseText += data;
		setReadyState( this, AjaxRequest.STATE_INTERACTIVE );
	};
	self._close = function( data ) {
		if (typeof data != 'undefined' )
			this.responseText += data;
		setReadyState( this, AjaxRequest.STATE_COMPLETE );
	}

})(MockAjaxRequest.prototype);

xhrtest(AjaxRequest, "AjaxRequest");
xhrtest(MockAjaxRequest, "MockAjaxRequest");

test("utility methods", function() {
	var xhr = new MockAjaxRequest( true ), log = [];
	
	xhr.onreadystatechange = function () {
		log.push( [xhr.readyState, xhr.responseText] );
	};
	
	xhr.open();
	deepEqual( log, [ [AjaxRequest.STATE_LOADING, ""] ], 'Loading event raised automatically on open' );
	log.clear();

	xhr.send();
	deepEqual( log, [ ], 'No event raised on send' );
	log.clear();
	
	xhr._receive( "message\nwith\nnewlines" );
	deepEqual( log, [ [AjaxRequest. STATE_INTERACTIVE, "message\nwith\nnewlines"] ], 'Data receiption can be emulated manually' );
	log.clear();
	
	xhr._receive( " appended " );
	deepEqual( log, [ [AjaxRequest. STATE_INTERACTIVE, "message\nwith\nnewlines appended "] ], 'responseText grows on data receiption' );
	log.clear();
	
	xhr._close( " final " );
	deepEqual( log, [ [AjaxRequest. STATE_COMPLETE, "message\nwith\nnewlines appended  final "] ], 'responseText grows on connection close' );
	log.clear();
	
});

