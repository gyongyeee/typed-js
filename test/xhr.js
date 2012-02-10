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

function MockAjaxRequest() {
	this.responseText = "";
	this.readyState = "";
	this.status = "";
}
MockAjaxRequest.inherits(AjaxRequest);
(function(self){

	self.open = function(method, location, async) {
		this.async = (async == AjaxRequest.MODE_ASYNC);
		this.readyState = AjaxRequest.STATE_LOADING;
		if (this.onreadystatechange instanceof Function) {
			this.onreadystatechange();
		}
	};
	self.abort = function() {};
	self.setRequestHeader = function() {};
	self.send = function() {
		var obj = this;
		function data() {
			obj.readyState = AjaxRequest.STATE_INTERACTIVE;
			if (obj.onreadystatechange instanceof Function) {
				obj.onreadystatechange();
			}
			obj.readyState = AjaxRequest.STATE_COMPLETE;
			if (obj.onreadystatechange instanceof Function) {
				obj.onreadystatechange();
			}
		}
		if (this.async) {
			setTimeout(data, 100);
		} else {
			data();
		}
	};

})(MockAjaxRequest.prototype);

xhrtest(AjaxRequest, "AjaxRequest");
xhrtest(MockAjaxRequest, "MockAjaxRequest");