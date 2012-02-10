/*
Function.prototype.bind = function( obj ) {
    var method = this;
    return function() {
        return method.apply( obj, arguments );
    }
}
*/

function AjaxRequest() {
	constructor( this );
	var http_request;
	try {
		if (window.ActiveXObject) { // IE
			http_request = new ActiveXObject( 'Microsoft.XMLHTTP' );
		} else if (window.XMLHttpRequest) { // Mozilla, Safari,...
			http_request = new XMLHttpRequest();
		} else return null;
		
		if (http_request.overrideMimeType) {
			// set type accordingly to anticipated content type
			http_request.overrideMimeType('text/plain');
		}
		return http_request;
	} catch ( _ ) {
		return null;
	}
}

// AjaxRequest.STATE_UNINITIALIZED = 0;
AjaxRequest.STATE_LOADING = 1;
// AjaxRequest.STATE_LOADED = 2;
AjaxRequest.STATE_INTERACTIVE = 3;
AjaxRequest.STATE_COMPLETE = 4;

AjaxRequest.MODE_SYNC = false;
AjaxRequest.MODE_ASYNC = true;
