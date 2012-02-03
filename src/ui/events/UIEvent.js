
/**
 * @class 
 * @name a5.cl.ui.events.UIEvent
 */
a5.Package('a5.cl.ui.events')

	.Extends('a5.Event')
	.Static(function(UIEvent){
		
		/**
		 * @event
		 */
		UIEvent.CHANGE = 'UI_Change';
		
		/**
		 * @event
		 */
		UIEvent.CLOSE = 'UI_Close';
		
		/**
		 * @event
		 */
		UIEvent.SELECT = 'UI_Select';
		
		/**
		 * @event
		 */
		UIEvent.RESIZE_STARTED = 'UI_Resize_Started';
		
		/**
		 * @event
		 */
		UIEvent.RESIZE_STOPPED = 'UI_Resize_Stopped';
		
		/**
		 * @event
		 */
		UIEvent.RESIZED = 'UI_Resized';
		
		/**
		 * @event
		 */
		UIEvent.FOCUS = 'UI_Focus';
		
		/**
		 * @event
		 */
		UIEvent.BLUR = 'UI_Blur';

	})
	.Prototype('UIEvent', function(proto, im){
		
		proto.UIEvent = function($type, $nativeEvent, $bubbles){
			proto.superclass(this, [$type, $bubbles]);
			this._cl_nativeEvent = $nativeEvent;
			this._cl_preventDefault = false;
		}	
		
		proto.nativeEvent = function(){ 
			return this._cl_nativeEvent; 
		};
		
		proto.preventDefault = function(){
			this._cl_preventDefault = true;
		}
});