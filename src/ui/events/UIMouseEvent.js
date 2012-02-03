
/**
 * @class 
 * @name a5.cl.ui.events.UIMouseEvent
 * @extends a5.cl.ui.events.UIEvent
 */
a5.Package('a5.cl.ui.events')

	.Extends('UIEvent')
	.Static(function(UIMouseEvent){
		
		/**
		 * 
		 */
		UIMouseEvent.CLICK = 'UI_Click';
		
		UIMouseEvent.DOUBLE_CLICK = 'UI_DoubleClick';
		
		/**
		 * 
		 */
		UIMouseEvent.RIGHT_CLICK = 'UI_RightClick';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_OVER = 'UI_MouseOver';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_OUT = 'UI_MouseOut';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_UP = 'UI_MouseUp';
		
		/**
		 * 
		 */
		UIMouseEvent.MOUSE_DOWN = 'UI_MouseDown';
	})
	.Prototype('UIMouseEvent', function(proto, im){
		
		proto.UIMouseEvent = function($type, $nativeEvent){
			proto.superclass(this, arguments);
		}
		
		/**
		 * @return Number
		 */
		proto.clientX = function(){
			if(this.nativeEvent)
				return this.nativeEvent().clientX;
		};
		
		/**
		 * @return Number
		 */
		proto.clientY = function(){
			if(this.nativeEvent)
				return this.nativeEvent().clientY;
		};
		
		/**
		 * @return Number
		 */
		proto.screenX = function(){
			if(this.nativeEvent)
				return this.nativeEvent().screenX;
		};
		
		/**
		 * @return Number
		 */
		proto.screenY = function(){
			if(this.nativeEvent)
				return this.nativeEvent().screenY;
		};	
});