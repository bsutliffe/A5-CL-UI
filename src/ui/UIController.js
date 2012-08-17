
a5.Package('a5.cl.ui')
	.Import('a5.cl.CLController')
	.Extends('CLController')
	.Prototype('UIController', function(proto, im){
		
		proto.UIController = function(defaultView){
			proto.superclass(this, [defaultView || this.create(a5.cl.CLWindow)]);
		}
});
