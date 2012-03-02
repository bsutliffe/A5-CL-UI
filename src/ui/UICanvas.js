
a5.Package('a5.cl.ui')
	
	.Extends('UIHTMLControl')
	.Static(function(UICanvas){
		
		UICanvas._cl_canvasAvailable = !!document.createElement('canvas').getContext;
		
		UICanvas.canvasAvailable = function(){
			return UICanvas._cl_canvasAvailable;
		}
		
		UICanvas.supportsText = function(){
			return typeof document.createElement('canvas').getContext('2d').context.fillText == 'function';
		}		
	})
	.Prototype('UICanvas', function(proto, im, UICanvas){
		
		proto.UICanvas = function(){
			proto.superclass(this);
			this._cl_overflowHeight = 0;
			this._cl_overflowWidth = 0;
			this._cl_canvasElement = null;
			this._cl_context = null;
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			if (UICanvas.canvasAvailable) {
				this._cl_canvasElement = document.createElement('canvas');
				this.appendChild(this._cl_canvasElement);
				this._cl_context = this._cl_canvasElement.getContext('2d');
			} else {
				this.redirect(500, 'Cannot draw UICanvas element, canvas is unavailable in this browser.');
			}
		}
		
		proto.overflowHeight = function(value){ return this._cl_propGetSet('_cl_overflowHeight', value); }
		
		proto.overflowWidth = function(value){ return this._cl_propGetSet('_cl_overflowWidth', value); }
		
		proto.clear = function(){
			this._cl_canvasElement.width = this._cl_canvasElement.width;
		}
		
		proto.context = function(type){
			if (type && type !== '2d') {
				try {
					return this._cl_canvasElement.getContext(type);
				} catch(e){
					return null;
				}
			} else {
				return this._cl_context;
			}
		}
		
		proto.Override._cl_redraw = function(){
			proto.superclass()._cl_redraw.apply(this, arguments);
			this._cl_canvasElement.width = this.width('client') + this._cl_overflowWidth;
			this._cl_canvasElement.height = this.height('client') + this._cl_overflowHeight;
		}	
});