
a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.events.*')
	.Extends('UITextField')
	.Prototype('UILink', function(proto, im){
		
		proto.UILink = function(){
			proto.superclass(this);
			this.clickEnabled(true).usePointer(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			this.addEventListener(im.UIMouseEvent.MOUSE_OVER, this.onRollOver, false, this);
			this.addEventListener(im.UIMouseEvent.CLICK, this.onRollOut, false, this);
			this.addEventListener(im.UIMouseEvent.MOUSE_OUT, this.onRollOut, false, this);
			
			var self = this;
			this._cl_viewElement.onmouseover = function(e){
				if(self._cl_enabled)
					self.dispatchEvent(self.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_OVER, e || window.event]));
			}
			this._cl_viewElement.onmouseout = function(e){
				if(self._cl_enabled)
					self.dispatchEvent(self.create(im.UIMouseEvent, [im.UIMouseEvent.MOUSE_OUT, e || window.event]));
			}
		}
		
		proto.onRollOver = function(){
			this.underline(true);
		}
		
		proto.onRollOut = function(){
			this.underline(false);
		}
	});
