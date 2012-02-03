
a5.Package('a5.cl.ui.events')
	.Extends('UIEvent')
	.Static(function(UIKeyboardEvent){
		UIKeyboardEvent.KEY_UP = 'UI_KeyUp';
		UIKeyboardEvent.KEY_DOWN = 'UI_KeyDown';
		UIKeyboardEvent.KEY_PRESS = 'UI_KeyPress';
		UIKeyboardEvent.ENTER_KEY = 'UI_EnterKey';
	})
	.Prototype('UIKeyboardEvent', function(proto, im, UIKeyboardEvent){
		proto.UIKeyboardEvent = function(type, nativeEvent, bubbles){
			proto.superclass(this, arguments);
		}
		
		proto.keyCode = function(){
			return this.nativeEvent().keyCode;// || this.nativeEvent().which;
		}
		
		proto.keyCharacter = function(){
			var charCode = this.nativeEvent().charCode || this.keyCode();
			return charCode > 0 ? String.fromCharCode(charCode) : "";
		}
});
	
