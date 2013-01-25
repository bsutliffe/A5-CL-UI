
/**
 * @class Mixin class for all UI controls.  Primarily adds mouse interaction.
 * @name a5.cl.ui.mixins.UIInteractable
 */
a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.events.UIMouseEvent')
	.Mixin('UIInteractable', function(proto, im){
		
		this.MustExtend('a5.cl.CLView');
		
		this.Properties(function(){
			this._cl_enabled = true;
			this._cl_clickEnabled = false;
			this._cl_usePointer = false;
			this._cl_contextMenuWindow = null;
			this._cl_preventRightClick = false;
		})
		
		proto.UIInteractable = function(){
			
		}
		
		/**
		 * 
		 * @param {Boolean} [value]
		 */
		proto.usePointer = function(value){
			if (typeof value === 'boolean') {
				this.cursor(value ? 'pointer' : '');
				return this;
			}
			return this._cl_usePointer;
		}
		
		proto.cursor = function(value){
			if(typeof value === 'string'){
				this._cl_cursor = value;
				this._cl_viewElement.style.cursor = value;
				return this;
			}
			return this._cl_viewElement.style.cursor;
		}
		
		/**
		 * 
		 * @param {Boolean} value
		 */
		proto.clickEnabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_clickEnabled = value;
				var self = this;
				this._cl_viewElement.onclick = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eClickHandler.call(self, e);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				this._cl_viewElement.ondblclick = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eDoubleClickHandler.call(self, e);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				this._cl_viewElement.onmousedown = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eMouseDownHandler.call(self, e || window.event);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				this._cl_viewElement.onmouseup = !value ? null : function($e){
					var e = $e || window.event,
						preventDefault = proto._cl_eMouseUpHandler.call(self, e || window.event);
					if(preventDefault){
						if(e.preventDefault)
							e.preventDefault();
						if(e.stopPropagation)
							e.stopPropagation();
						return false
					}
				}
				return this;
			}
			return this._cl_clickEnabled;
		}
		
		proto.preventRightClick = function(value){
			if(typeof value === 'boolean'){
				this._cl_preventRightClick = value;
				return this;
			}
			return this._cl_preventRightClick;
		}
		
		proto.contextMenu = function(view){
			if(view instanceof a5.cl.CLView || view === null || view === false){
				if(!this._cl_contextMenuWindow)
					this._cl_contextMenuWindow = new a5.cl.ui.modals.UIContextMenuWindow();
				this._cl_contextMenuWindow.menuView(view);
				if(view)
					this.addEventListener(im.UIMouseEvent.RIGHT_CLICK, proto._cl_showContextMenu, false, this);
				else
					this.removeEventListener(im.UIMouseEvent.RIGHT_CLICK, proto._cl_showContextMenu);
			}
			return this._cl_contextMenuWindow.menuView();
		}
		
		proto._cl_showContextMenu = function(e){
			e.preventDefault();
			this._cl_contextMenuWindow.open(e.nativeEvent());
		}
		
		proto._cl_eClickHandler = function(e){
			if(this.enabled()){
				var isRightClick = e.button === 2;
				if(!isRightClick){
					var evt = new im.UIMouseEvent(im.UIMouseEvent.CLICK, e);
					evt.shouldRetain(true);
					this.dispatchEvent(evt);
					var preventDefault = evt._cl_preventDefault;
					evt.destroy();
					return preventDefault;
				}
				return this._cl_preventRightClick;
			}
		}
		
		proto._cl_eDoubleClickHandler = function(e){
			if(this.enabled()){
				var evt = new im.UIMouseEvent(im.UIMouseEvent.DOUBLE_CLICK, e);
				evt.shouldRetain(true);
				this.dispatchEvent(evt);
				var preventDefault = evt._cl_preventDefault;
				evt.destroy();
				return preventDefault;
			}
		}
		
		proto._cl_eMouseDownHandler = function(e){
			if(this.enabled()){
				var evt = new im.UIMouseEvent(im.UIMouseEvent.MOUSE_DOWN, e);
				evt.shouldRetain(true);
				this.dispatchEvent(evt);
				var preventDefault = evt._cl_preventDefault;
				evt.destroy();
				return preventDefault;
			}
		}
		
		proto._cl_eMouseUpHandler = function(e){
			if (this.enabled()) {
				var isRightClick = e.button === 2,
					evt = new im.UIMouseEvent(isRightClick ? im.UIMouseEvent.RIGHT_CLICK : im.UIMouseEvent.MOUSE_UP, e);
				evt.shouldRetain(true);
				this.dispatchEvent(evt);
				var preventDefault = evt._cl_preventDefault;
				evt.destroy();
				return preventDefault || (isRightClick && this._cl_preventRightClick);
			}
		}
		
		/**
		 * 
		 * @param {Boolean} [value]
		 * @type Boolean
		 * @return
		 */
		proto.enabled = function(value){
			//Override this to add custom enable/disable functionality
			if (typeof value === 'boolean') {
				this._cl_enabled = value;
				this.alpha(value ? 1:.5);
				return this;
			}
			return this._cl_enabled;
		}
		
		proto.dealloc = function(){
			this._cl_viewElement.onclick = this._cl_viewElement.onmouseup = this._cl_viewElement.onmousedown = null;
		}
});
