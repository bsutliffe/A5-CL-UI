
/**
 * @class A view that can only be added to UIContainer.  It will fill up any empty space not occupied by a non-UIFlexSpace view.  If multiple UIFlexSpaces are added to a UIControl, the remaining space will be divided evenly among them.
 * @name a5.cl.ui.UIFlexSpace
 * @description If the UIContainer is relX, the width of this view will be adjusted to fill any remaining space.  Likewise for height if the UIContainer is relY.  Whichever dimension is not relative will always be 100%.
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Extends('UIControl')
	.Prototype('UIFlexSpace', function(proto, im){
		
		/**#@+
	 	 * @memberOf a5.cl.ui.UIFlexSpace#
	 	 * @function
		 */
		
		proto.UIFlexSpace = function(){
			proto.superclass(this);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			proto.superclass().width.call(this, '100%');
			proto.superclass().height.call(this, '100%');
		}
		
		proto.Override.addedToParent = function(parentView){
			if(parentView instanceof a5.cl.ui.UIContainer)
				proto.superclass().addedToParent.apply(this, arguments);
			else
				this.redirect(500, 'Error: UIFlexSpace can only be added to a UIContainer view.');
		}
		
		/**
		 * The width of a UIFlexSpace cannot be set.  If its UIContainer is relX, the width will be calculated on the fly, otherwise it will always be 100%.
		 * @name width 
		 */
		proto.Override.width = function(value){
			if(value === undefined || value === 'scroll' || value === 'inner' || value === 'client' || value === 'value')
				return proto.superclass().width.apply(this, arguments);
			else
				return this;
		}
		
		/**
		 * The height of a UIFlexSpace cannot be set.  If its UIContainer is relY, the height will be calculated on the fly, otherwise it will always be 100%.
		 * @name height 
		 */
		proto.Override.height = function(value){
			if(value === undefined || value === 'scroll' || value === 'inner' || value === 'client' || value === 'value')
				return proto.superclass().height.apply(this, arguments);
			else
				return this;
		}
	});