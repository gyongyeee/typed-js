
module('EventEmitter');
test('Constructor', function() {
	ok(EventEmitter instanceof Function, 'Constructor exists');
	raises(function() {
		EventEmitter();
	}, 'Can not be called as function');
	raises(function() {
		EventEmitter(['event']);
	}, 'Can not be called as function');
	raises(function() {
		new EventEmitter();
	}, 'Constructor requires events parameter');
	raises(function() {
		new EventEmitter(42);
	}, 'Constructor requires events parameter');
	raises(function() {
		new EventEmitter(['event'], 42);
	}, 'Constructor requires events parameter');
	var o = new EventEmitter(['event']);
	ok(o instanceof EventEmitter, 'Created object is an EventEmitter');
});

test('Manipulating listeners', function(){
	var o = new EventEmitter(['event', 'some']);
	ok(o.on instanceof Function, 'Has "on" method');
	raises(function() {
		o.on();
	}, '"on" method requires two parameters');
	raises(function() {
		o.on('event');
	}, '"on" method requires two parameters');
	raises(function() {
		o.on('event', 42);
	}, '"on" method requires "event" and "handler" parameters');
	
	var log = [];
	function handler1(a, b) {
		ok(o === this, 'Context is the emitter object');
		if (typeof a == 'undefined') {
			log.push('on1');
			return false;
		}
		log.push('on1', a.valueOf(), b.valueOf());
		if (a.valueOf()) return b;
	}
	function handler2(a, b) {
		ok(o === this, 'Context is the emitter object');
		log.push('on2', a.valueOf(), b.valueOf());
	}
	o.on('event', handler1);
	o.on('event', handler2);
	
	ok(o.emit instanceof Function, 'Has "emit" method');
	raises(function() {
		o.emit();
	}, '"emit" requires an event parameter');
	raises(function() {
		o.emit('something');
	}, 'Only registered events may be emitted');
	
	o.emit('some');
	deepEqual(log, [], 'Handler is specific for an event');
	log.clear();
	
	o.emit('event');
	deepEqual(log, ['on1'], 'Event parameter is not required');
	log.clear();
	
	o.emit('event', true, false);
	deepEqual(log, ['on1', true, false], 'Returning false stops propagation');
	log.clear();
	
	o.emit('event', true, true);
	deepEqual(log, ['on1', true, true, 'on2', true, true], 'Returning true continues propagation');
	log.clear();
	
	raises(function() {
		o.emit('event', true, o);
	}, 'Handler must return bool or undefined');
	deepEqual(log, ['on1', true, o], 'Returning non-bool throws an exception');
	log.clear();
	
	o.emit('event', false, 42);
	deepEqual(log, ['on1', false, 42, 'on2', false, 42], 'Returning undefined continues propagation');
	log.clear();
	
	ok(o.getListeners instanceof Function);
	raises(function () {
		o.getListeners();
	}, '"getListeners" requires an event name');
	raises(function () {
		o.getListeners('something');
	}, 'Undefined events has no listeners');
	deepEqual(o.getListeners('event'), [handler2, handler1], '"getListeners" returns previously added listeners');
	
	ok(o.removeListener instanceof Function);
	raises(function() {
		o.removeListener();
	}, '"removeListener" requires a registered event name and a handler');
	raises(function() {
		o.removeListener("event");
	}, '"removeListener" requires a registered event name and a handler');
	raises(function() {
		o.removeListener("invalid", handler1);
	}, '"removeListener" requires a registered event name and a handler');
	raises(function() {
		o.removeListener("event", handler1, 42);
	}, '"removeListener" requires an event name and a handler');
	ok(o.removeListener("event", handler1));
	deepEqual(o.getListeners('event'), [handler2], '"removeListener" removes previously added listener');
	ok(!o.removeListener("event", handler1));
	ok(true, 'Multiple calls of "removeListener" with the same handler are ignored');
	
	ok(o.once instanceof Function);
	raises(function() {
		o.once();
	}, '"once" requires an event name and a handler');
	raises(function() {
		o.once('event');
	}, '"once" requires an event name and a handler');
	raises(function() {
		o.once('invalid', handler1);
	}, '"once" requires an event name and a handler');
	raises(function() {
		o.once('event', handler1, 42);
	}, '"once" requires an event name and a handler');

	o.once('event', handler1);
	deepEqual(o.getListeners('event'), [handler1, handler2], '"once" adds listener');
	o.emit('event', true, false);
	deepEqual(o.getListeners('event'), [handler1, handler2], 'Listener added with "once" not removed if not invoked');
	o.emit('event', false, false);
	deepEqual(o.getListeners('event'), [handler2], 'Listener added with "once" removed after first invokation');

});
