
/**
 * @class Base class for UI controls that extend CLViewContainer.
 * @name a5.cl.ui.UIControl
 * @extends a5.cl.CLViewContainer
 */
a5.Package('a5.cl.ui')
	.Extends('a5.cl.CLViewContainer')
	.Mix('a5.cl.ui.mixins.UIInteractable',
		 'a5.cl.ui.mixins.UIThemable')
	.Prototype('UIControl', function(proto, im){
		
		proto.UIControl = function(){
			proto.superclass(this);
			this.usePointer(false)
			this.width('auto').height('auto');
		}
		
});