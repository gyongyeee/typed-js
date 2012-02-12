
function assertConstructor( Klass, Base ) {
	ok( Klass instanceof Function, 'Constructor exists' );
	raises( function() {
		Klass();
	}, 'Can not be called as function' );
	var o = new Klass();
	ok(o instanceof Klass, 'Created object is a proper instance');
	if ( Base instanceof Function ) {
		ok(o instanceof Base, 'Created object is instance of the base class');
	}
}

