module('framework');
test('arguments', function() {
	function Inner(a) {
		ok(arguments instanceof Object);
		ok(0 === arguments.length);
		ok(arguments.callee instanceof Function);
	//	ok('Inner' == arguments.callee.name);
		ok(arguments.callee.caller instanceof Function);
		ok(arguments.callee.caller.arguments instanceof Object);
		ok(1 === arguments.callee.caller.arguments.length);
		ok(42 === arguments.callee.caller.arguments[0]);
	}
	function Outer() {
		Inner();
	}
	Outer(42);
});

test('inherits', function() {
	var log = [];
	function BaseClass() {
		log.push('Base');
	}
	function SubClass() {
		log.push('Sub');
	}
	
	ok(Function.prototype.inherits instanceof Function, '"inherits" method present');
	
	BaseClass.inherits();
	ok(BaseClass.prototype.constructor === BaseClass, 'constructor field points to the constructor function');
	
	raises(function() {
		SubClass.inherits(new Function(), 42);
	},'"inherits" may have at most one parameter');
	
	SubClass.inherits(BaseClass);
	ok(SubClass.parent === BaseClass.prototype, 'parent field points to the ancestor\'s prototype');
	ok(SubClass.prototype.constructor === SubClass, 'constructor field points to the constructor function');
	deepEqual(log, [], 'Constructor not called during class setup');
	ok(new SubClass() instanceof BaseClass, 'SubClass instanceof BaseClass');
	
	log = [];
	function ChildClass() {
	}
	var Base = {};
	ChildClass.inherits(Base);
	ok(ChildClass.parent === Base, 'parent field points to the ancestor object');
	ok(ChildClass.prototype.constructor === ChildClass, 'constructor field points to the constructor function');
	deepEqual(log, [], 'Constructor not called during class setup');
	ok(ChildClass.prototype === Base, 'SubClass inherits from Base');
});

test("defval helper", function() {
	ok(typeof defval() == 'undefined');
	ok(42 === defval(undefined, 42));
	ok('value' === defval('value', 42));
});

test("constructor", function() {
	function Klass() {
		constructor(this);
	}
	raises(function() {
		Klass();
	}, 'Constructor can not be called as function');
	ok(new Klass instanceof Klass, 'Constructor creates object of its type');
});

test("type cast", function() {
	ok(!(42 instanceof Number), 'Scalar 42 is not instance of Number');
	ok(Object(42) instanceof Number, 'Object used as function');
	ok(!(Number(42) instanceof Number), 'Number can not be used as function');
	ok(new Object(42) instanceof Number, 'Object used as constructor');
	ok(new Number(42) instanceof Number, 'Number used as constructor');
	ok(Object(42) == 42, 'Number and scalar are equal');
	ok(Object(42) !== 42, 'Number and scalar are not strictly equal');
	var v = Object(42);
	ok(Object(v) == 42, 'Object function does not change value');
	ok(Object(v) === v, 'Object function does not change reference');
	ok(new Object(v) === v, 'Object constructor does not change reference');
	ok(new Number(v) !== v, 'Number constructor changes reference');
	ok(new Number(v) == 42, 'Number constructor does not change value');
	function cast(a) {
		ok(!(a instanceof Object), 'Parameter is scalar');
		arguments[0] = Object(arguments[0]);
		ok(a instanceof Object, 'Parameter typecasted to Object');
		ok(a instanceof String, 'Parameter typecasted to String');
	}
	cast("42");
	function inner(params) {
		ok(!(params[0] instanceof Object), 'Parameter is scalar');
		params[0] = Object(params[0]);
		ok(params[0] instanceof Object, 'Parameter typecasted to Object');
		ok(params[0] instanceof String, 'Parameter typecasted to String');
	}
	function outer() {
		inner(arguments);
		ok(arguments[0] instanceof String, 'Parameter typecasted to String');
	}
	outer("42");
});

test("getargs helper", function() {
	ok(ArgException instanceof Function, '"ArgException" class is defined');
	ok(new ArgException instanceof Error, '"ArgException" class is defined');
	
	
	function NoArgs() {
		getargs(arguments);
		ok(true, 'Function body called');
	}
	raises(function() {
		NoArgs(1);
	}, ArgException, "Extra arguments not allowed");
	NoArgs();
	
	function ReqArgs(a, b) {
		getargs(arguments, [String, Number]);
		ok(a instanceof String, 'Parameter typecasted');
		ok(b instanceof Number, 'Parameter typecasted');
	};
	raises(function() {
		ReqArgs();
	}, ArgException, 'Required arguments must present');
	raises(function() {
		ReqArgs('s');
	}, ArgException, 'Required arguments must present');
	raises(function() {
		ReqArgs('s', '42');
	}, ArgException, 'Required arguments must have the correct type');
	raises(function() {
		ReqArgs('s', 42, 3);
	}, ArgException, 'Extra argument is not allowed');
	ReqArgs('s', 42);
	
	function OptArgs(a, b) {
		getargs(arguments, [], [String, Number]);
		ok((typeof a == 'undefined') || (a instanceof String), 'Argument is typecasted if present');
		ok((typeof b == 'undefined') || (b instanceof Number), 'Argument is typecasted if present');
	}
	raises(function() {
		OptArgs(42);
	}, ArgException, 'Optional arguments must have the correct type');
	raises(function() {
		OptArgs('s', 's');
	}, ArgException, 'Optional arguments must have the correct type');
	raises(function() {
		OptArgs('s', 42, 3);
	}, ArgException, 'Extra argument is not allowed');
	OptArgs();
	OptArgs('s');
	OptArgs('s', 42);
	
	function ReqOptArgs(a, b) {
		getargs(arguments, [String], [Number]);
		ok(a instanceof String, 'Required argument typecasted');
		ok((typeof b == 'undefined') || (b instanceof Number), 'Optional argument is typecasted if present');
	}
	raises(function() {
		ReqOptArgs();
	}, ArgException, 'Required arguments must present');
	raises(function() {
		ReqOptArgs(42);
	}, ArgException, 'Required arguments must have the correct type');
	raises(function() {
		ReqOptArgs('s', 42, 3);
	}, ArgException, 'Optional arguments must have the correct type');
	ReqOptArgs('s');
	ReqOptArgs('s', 42);
	
	function VarArgs(a, b, rest, useless) {
		var count = arguments.length;
		ok(true, 'Info: '+ count + ' parameters used');
		getargs(arguments, [String], [Number], RegExp);
		ok(a instanceof String, 'Required argument typecasted');
		ok((typeof b == 'undefined') || (b instanceof Number), 'Optional argument typecasted');
		ok((typeof rest == 'undefined') || rest instanceof Array, 'Last variable collects extra parameters if any into an array');
		if (rest && rest.length)
		for (var i = 0; i < rest.length; i++) {
			ok(rest[i] instanceof RegExp, 'Extra parameters typecasted');
		}
	}
	raises(function() {
		VarArgs();
	}, ArgException, 'Required arguments must present');
	raises(function() {
		VarArgs(42);
	}, ArgException, 'Required arguments must have the correct type');
	raises(function() {
		VarArgs('s', / /);
	}, ArgException, 'Optional arguments must have the correct type');
	raises(function() {
		VarArgs('s', 42, 42);
	}, ArgException, 'Variable arguments must have the correct type');
	VarArgs('s');
	VarArgs('s', 42);
	VarArgs('s', 42, /2/);
	VarArgs('s', 42, /2/, /3/);
	VarArgs('s', 42, /2/, /3/, /4/);
});

test('overload', function() {
	ok(overload instanceof Function);
	raises(function() {
		overload();
	}, '"overload" requires at least two function parameters');
	raises(function() {
		overload(new Function, 42);
	}, '"overload" requires at least two function parameters');
	
	var log = [];
	var func = overload(function(n, s) {
		log.push(1);
		getargs(arguments, [Number, String]);
		log.push(s+':'+n);
		return 1;
	}, function(s, n) {
		log.push(2);
		getargs(arguments, [String, Number]);
		log.push(s+':'+n);
		return 2;
	});
	
	equal(1, func(42, 'Answer'), 'function called based on signature'); 
	equal(2, func('Answer', 42), 'function called based on signature');
	deepEqual([1, 'Answer:42', 1, 2, 'Answer:42'], log, 'functions tried in order');
});

test("toString", function() {
	var o = {toString: function() {
		return "value";
	}};
	ok("value" == o.toString());
	ok("value" == ("" + o));
});

test("array clear", function() {
	var a = [1, 2, 3, 4];
	ok( a.clear instanceof Function, "Array.clear is defined");
	ok( a === a.clear(), "Array.clear returns the array itself");
	deepEqual( [], a, "The array is empty after calling clear()");
});

test("array indexOf", function() {
	var a = ["a", "b", "b", "a", "b"];
	ok( a.indexOf instanceof Function, "Array.indexOf is defined");
	equal( a.indexOf("a"), 0, "Finds the first element" );
	equal( a.indexOf("b"), 1, "Finds any element" );
	equal( a.indexOf("c"), -1, "Returns -1 for non-element" );
	equal( a.indexOf("b", 2), 2, "Second parameter is the starting position" );
	equal( a.indexOf("b", 6), -1, "Too big position results -1" );
	equal( a.indexOf("a", -2), 3, "Negative position counts from the end" );
	equal( a.indexOf("a", -1), -1, "Negative position counts from the end" );
	equal( a.indexOf("b", -1), 4, "Finds the last element" );
	
});