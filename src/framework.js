/**
 * General utilities
 * @todo new Class(name, {
 * 		field: object // its constructor defines the type
 *		method: function
 *	});
 */

/**
 * @param baseClass Function Constructor to inherit from
 */
Function.prototype.inherits = function(baseClass) {
	var subClass = this;
	getargs(arguments, [], [Object]);
	if (baseClass instanceof Function) {
		function inheritance() {
		}
		inheritance.prototype = baseClass.prototype;

		subClass.prototype = new inheritance();
		subClass.parent = baseClass.prototype;
	} else {
		subClass.prototype = Object(baseClass);
		subClass.parent = subClass.prototype;
	}
	subClass.prototype.constructor = subClass;
	return subClass;
};

/**
 * Call this in a constructor to avoid using it as a simple function
 * @param obj Object Scope of the calling constructor
 */
function constructor(obj) {
	var subClass = arguments.callee.caller;
	if (!(obj instanceof subClass)) {
		throw new TypeError(subClass.name
				+ ' is a constructor, new operator must be used');
	}
}
/**
 * @param variable used if defined
 * @param value used if variable is undefined
 * @returns value if variable is undefined, variable otherwise
 */
function defval(variable, value) {
	return (typeof variable != 'undefined' ? variable : value);
}
String.format = function(template, params) {
if (params instanceof Object)
	for (var i in params)
		template = template.replace('{'+i+'}', params[i]);
	return template;
};
function Exception(message, params) {
	constructor(this);
	Error.call(this, String.format(message, params));
}
Exception.inherits(Error);

function ArgException(message, params) {
	Exception.call(this, message, params);
}
ArgException.inherits(Exception);

/**
 * Check whether the given arguments match the specified signature.
 * 
 * @param params Object Arguments of the called function
 * @param required Array Class names of required parameters
 * @param optional Array Class names of optional parameters
 * @param variable Function Class name of the rest of parameters 
 */
function getargs(params, required, optional, variable) {
	var callerfn = arguments.callee.caller;
	if (callerfn != arguments.callee) {
		getargs(arguments, [Object], [Array, Array, Function]);
	}
	// Setting defaults
	required = defval(required, []);
	optional = defval(optional, []);
	
	var name = callerfn.name || 'function';
	if (params.length < required.length) {
		throw new ArgException('{function} requires {count} arguments', {'function': name, 'count': required.length});
	}
	var last = required.length + optional.length;
	var rest = [];
	for ( var i = 0; i < params.length; i++) {
		params[i] = Object(params[i]);
		switch (true) {
		case (i < required.length):
			if (!(params[i] instanceof required[i])) {
				throw new ArgException('Argument {index} of {function} must be a {class}', {'index': i + 1,  'function': name,  'class': required[i].name});
			}
			break;
		case (i < last):
			var j = i - required.length;
			if (!(params[i] instanceof optional[j])) {
				throw new ArgException('Argument {index} of {function} must be a {class} if present', {'index': i + 1,  'function': name,  'class': optional[j].name});
			}
			break;
		default:
			if (variable) {
				if (!(params[i] instanceof variable)) {
					throw new ArgException('Argument {index} of {function} must be a {class} if present', {'index': i + 1,  'function': name,  'class': variable.name});
				}
				rest.push(params[i]);
			} else
			if (i) {
				throw new ArgException('{function} does not support more than {count} arguments', {'function': name, 'count': i});
			} else {
				throw new ArgException('{function} does not support any arguments', {'function': name});
			}
			break;
		}
	}
	if ( variable && params[last] ) {
		params[last] = rest;
	}
}
/**
 * Specify different functions with different signatures with the same name
 * 
 * @param functions Variable number of function parameters (at least two)
 * @returns {Function}
 */
function overload(functions) {
	getargs(arguments, [Function, Function], [], Function);
	funcs = arguments;
	return function() {
		for (var i = 0; i < funcs.length; i++) {
			try {
				return funcs[i].apply(this, arguments);
			} catch (e) {
				if ((i == funcs.length-1) || !(e instanceof ArgException)) {
					throw e;
				}
			}
		}
	};
}

/**
 * Remove all elements from an array
 */
if (!Array.prototype.clear)
Array.prototype.clear = function() {
	[].splice.call( this, 0, this.length );
	return this;
};

/**
 * Find the position of an element in the array
 * 
 * @param Object elt Element to search for
 * @param Number from Index to start search from, negative values count from the end of the array 
 * @return Number Index of the element or -1
 */
if (!Array.prototype.indexOf)
Array.prototype.indexOf = function(elt, from) {
	getargs( arguments, [ Object ], [ Number ] );
    var len = this.length;
    // Start from the beginning by default
    from = defval( from,  0 );
    // Can not search after the end
    if ( from >= len ) return -1;
    // Only integer indices are allowed
    from = ( ( from < 0 ) ? Math.ceil( from ) : Math.floor( from ) );
    // Negative position counts from the end 
    if ( from < 0 ) from += len;
    // There are no elements before the first
    if ( from < 0 ) from = 0;

    for ( ; from < len; from++ ) {
      if ( from in this && this[from] == elt )
        return from;
    }
    return -1;
  };
