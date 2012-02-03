
a5.Package('a5.cl.ui')

	.Extends('UIControl')
	.Prototype('UIControlBar', function(proto, im){
		
		proto.UIControlBar = function(){
			proto.superclass(this);
		}
});