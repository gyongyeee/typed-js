
function EventEmitter(events) {
	constructor(this);
	getargs(arguments, [Array]);
	this.listeners = new Object();
	for (var i = 0; i < events.length; i++) {
		this.listeners[events[i]] = new Array();
	}
}
EventEmitter.Exception = function(message, params) {
	Exception.call(this, message, params);
};
EventEmitter.Exception.inherits(Exception);
EventEmitter.UndefinedEventException = function(event) {
	EventEmitter.Exception.call(this, 'Undefined event: {event}', {event:event});
};
EventEmitter.UndefinedEventException.inherits(EventEmitter.Exception);

EventEmitter.prototype.hasEvent = function(event) {
	getargs(arguments, [String]);
	return (typeof this.listeners[event] != 'undefined'); 
};
EventEmitter.prototype.emit = function(event, params) {
	getargs(arguments, [String], [], Object);
	if (!this.hasEvent(event)) {
		throw new EventEmitter.UndefinedEventException(event);
	}
	for (var i = this.listeners[event].length - 1; i >= 0; i--) {
		var field = this.listeners[event][i]; 
		var result = field.handler.apply(this, params);
		if (typeof result != 'undefined') {
			if (Object(result) instanceof Boolean) {
				if (!Object(result).valueOf()) {
					break;
				}
			} else {
				throw TypeError('Invalid return value ('+(typeof result)+') of handler "'+event+'"');
			}
		}
		switch (true) {
			case (field.countdown == 1):
				this.listeners[event].splice(i, 1);
			case (field.countdown > 0):
				field.countdown--;
		}
	}
};
EventEmitter.prototype.getListeners = function(event) {
	getargs(arguments, [String]);
	if (!this.hasEvent(event)) {
		throw new EventEmitter.UndefinedEventException(event);
	}
	var handlers = new Array();
	for (var i = 0; i < this.listeners[event].length; i++) {
		handlers.push(this.listeners[event][i].handler); 
	}
	return handlers;
};
EventEmitter.prototype.removeListener = function(event, handler) {
	getargs(arguments, [String, Function]);
	if (!this.hasEvent(event)) {
		throw new EventEmitter.UndefinedEventException(event);
	}
	for (var i = 0; i < this.listeners[event].length; i++) {
		if (handler === this.listeners[event][i].handler) {
			this.listeners[event].splice(i,1);
			return true;
		}
	}
	return false;
};
EventEmitter.prototype.addListener = function(event, handler, countdown) {
	getargs(arguments, [String, Function, Number]);
	if (!this.hasEvent(event)) {
		throw new EventEmitter.UndefinedEventException(event);
	}
	this.listeners[event].splice(0, 0, {handler: handler, countdown: countdown});
};
EventEmitter.prototype.on = function(event, handler) {
	getargs(arguments, [String, Function]);
	this.addListener(event, handler, 0);
};
EventEmitter.prototype.once = function(event, handler) {
	getargs(arguments, [String, Function]);
	this.addListener(event, handler, 1);
};
