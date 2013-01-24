
a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.events.UIKeyboardEvent',
			'a5.cl.initializers.dom.Utils')
	.Mixin('UIKeyboardEventDispatcher', function(proto, im){
		
		proto.MustExtend('a5.EventDispatcher');
		
		proto.Properties(function(){
			this._cl_keyEventTarget = null;
			this._cl_keyUpEvent = null;
			this._cl_keyDownEvent = null;
			this._cl_keyPressEvent = null;
			this._cl_enterKeyEvent = null;
		})
		
		proto.UIKeyboardEventDispatcher = function(){
			//create events that will be retained and reused
			this._cl_keyUpEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.KEY_UP]).shouldRetain(true);
			this._cl_keyDownEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.KEY_DOWN]).shouldRetain(true);
			this._cl_keyPressEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.KEY_PRESS]).shouldRetain(true);
			this._cl_enterKeyEvent = this.create(im.UIKeyboardEvent, [im.UIKeyboardEvent.ENTER_KEY]).shouldRetain(true);
			
			//create the event handlers
			var self = this;
			this._cl_eKeyUpNativeHandler = function($e){
				var e = $e || window.event,
					preventDefault = proto._cl_eKeyUpHandler.call(self, e);
				if(preventDefault){
					if(e.preventDefault)
						e.preventDefault();
					if(e.stopPropagation)
						e.stopPropagation();
					return false
				}
			}
			
			this._cl_eKeyDownNativeHandler = function($e){
				var e = $e || window.event,
					preventDefault = proto._cl_eKeyDownHandler.call(self, e);
				if(preventDefault){
					if(e.preventDefault)
						e.preventDefault();
					if(e.stopPropagation)
						e.stopPropagation();
					return false
				}
			}
			
			this._cl_eKeyPressNativeHandler = function($e){
				var e = $e || window.event,
					preventDefault = proto._cl_eKeyPressHandler.call(self, e);
				if(preventDefault){
					if(e.preventDefault)
						e.preventDefault();
					if(e.stopPropagation)
						e.stopPropagation();
					return false
				}
			}
		}
		
		proto.keyboardEventTarget = function(elem){
			if(elem !== undefined){
				if(this._cl_keyEventTarget)
					this._cl_removeKeyboardEventListeners();
				this._cl_keyEventTarget = elem;
				this._cl_addKeyboardEventListeners();
				return this;
			}
			return this._cl_keyEventElement;
		}
		
		proto._cl_addKeyboardEventListeners = function(){
			im.Utils.addEventListener(this._cl_keyEventTarget, 'keyup', this._cl_eKeyUpNativeHandler);
			im.Utils.addEventListener(this._cl_keyEventTarget, 'keydown', this._cl_eKeyDownNativeHandler);
			im.Utils.addEventListener(this._cl_keyEventTarget, 'keypress', this._cl_eKeyPressNativeHandler);
		}
		
		proto._cl_removeKeyboardEventListeners = function(){
			im.Utils.removeEventListener(this._cl_keyEventTarget, 'keyup', this._cl_eKeyUpNativeHandler);
			im.Utils.removeEventListener(this._cl_keyEventTarget, 'keydown', this._cl_eKeyDownNativeHandler);
			im.Utils.removeEventListener(this._cl_keyEventTarget, 'keypress', this._cl_eKeyPressNativeHandler);
		}
		
		proto._cl_eKeyUpHandler = function(e){
			this._cl_keyUpEvent._cl_preventDefault = false;
			this._cl_keyUpEvent._cl_nativeEvent = e;
			this.dispatchEvent(this._cl_keyUpEvent);
			return this._cl_keyUpEvent._cl_preventDefault;
		}
		
		proto._cl_eKeyDownHandler = function(e){
			this._cl_keyDownEvent._cl_preventDefault = false;
			this._cl_keyDownEvent._cl_nativeEvent = e;
			this.dispatchEvent(this._cl_keyDownEvent);
			return this._cl_keyDownEvent._cl_preventDefault;
		}
		
		proto._cl_eKeyPressHandler = function(e){
			var preventPressDefault = false,
				preventEnterDefault = false;
			this._cl_keyPressEvent._cl_nativeEvent = this._cl_enterKeyEvent._cl_nativeEvent = e;
			this._cl_keyPressEvent._cl_preventDefault = this._cl_enterKeyEvent._cl_preventDefault = false;
			this.dispatchEvent(this._cl_keyPressEvent);
			if(this._cl_keyPressEvent.keyCode() === 13)
				this.dispatchEvent(this._cl_enterKeyEvent);
			return this._cl_keyPressEvent._cl_preventDefault || this._cl_enterKeyEvent._cl_preventDefault;
		}
		
		proto.dealloc = function(){
			this._cl_removeKeyboardEventListeners();
			this._cl_keyUpEvent.destroy();
			this._cl_keyDownEvent.destroy();
			this._cl_keyPressEvent.destroy();
			this._cl_enterKeyEvent.destroy();
		}
});
