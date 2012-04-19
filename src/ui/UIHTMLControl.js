
/**
 * @class Base class for UI controls that extend CLHTMLView.
 * @name a5.cl.ui.UIHTMLControl
 * @extends a5.cl.CLHTMLView
 */
a5.Package('a5.cl.ui')
	.Extends('a5.cl.CLHTMLView')
	.Mix('a5.cl.ui.mixins.UIInteractable',
		 'a5.cl.ui.mixins.UIThemable')
	.Prototype('UIHTMLControl', function(proto, im){
		
		proto.UIHTMLControl = function(){
			proto.superclass(this);
			this.usePointer(false).width('auto').height('auto').clickHandlingEnabled(false);
		}
		
});