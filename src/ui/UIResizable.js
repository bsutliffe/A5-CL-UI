
/**
 * @class 
 * @name a5.cl.ui.UIResizable
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.events.*',
			'a5.cl.initializers.dom.Utils')
	.Extends('UIControl')
	.Prototype('UIResizable', function(proto, im){
		
		
		proto.UIResizable = function(coordinates){
			this._cl_contentView = new a5.cl.ui.UIControl().width('100%').height('100%');
			this._cl_handles = {};
			if(typeof coordinates == 'string'){
				this._cl_coordinates = [];
				var splitCoords = coordinates.split(',');
				for(var x = 0, y = splitCoords.length; x < y; x++){
					var thisCoord = splitCoords[x];
					if(this._cl_validateDirection(thisCoord))
						this._cl_coordinates.push(thisCoord);
				}
			} else {
				this._cl_coordinates = ['e', 'se', 's'];
			}
			this._cl_handleSize = 5;
			this._cl_resizing = false;
			this._cl_cachedWidth = 0;
			this._cl_cachedHeight = 0;
			this._cl_cachedY = 0;
			this._cl_cachedX = 0;
			this._cl_cachedMouseX = 0;
			this._cl_cachedMouseY = 0;
			this._cl_viewIsReady = false;
			this._cl_resizeEventsEnabled = false;
			
			proto.superclass(this);
			
			this.minWidth(50);
			this.minHeight(50);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			this._cl_viewIsReady = true;
			//add the content view
			a5.cl.CLViewContainer.prototype.addSubViewAtIndex.call(this, this._cl_contentView, 0);
			//make sure scrollX/scrollY are applied to the contentView and NOT the main view
			if(this.scrollXEnabled())
				this._cl_contentView.scrollXEnabled(true);
			if(this.scrollYEnabled())
				this._cl_contentView.scrollYEnabled(true);
			proto.superclass().scrollXEnabled.call(this, false);
			proto.superclass().scrollYEnabled.call(this, false);
			
			//create the handles
			this.setCoordinates(this._cl_coordinates);
		}
		
		proto.Override.childrenReady = function(){
			proto.superclass().childrenReady.apply(this, arguments);
			//move any sub-views added by the viewdef into the contentView
			for(var x = 0; x<this.subViewCount(); x++){
				var thisView = this.subViewAtIndex(x);
				var shouldMove = thisView !== this._cl_contentView;
				if(shouldMove){
					for(var prop in this._cl_handles){
						if(this._cl_handles[prop] === thisView){
							shouldMove = false;
							break;
						}
					}
				}
				if(shouldMove)
					this._cl_contentView.addSubView(thisView);
			}
			//this._cl_locked(true);
		}
		
		/**
		 * Set the directions in which this object should be resizable.
		 * 
		 * @param {Array|String} coords An array of coordinate strings, or a comma-delimited list. (n, ne, e, se, s, sw, w, nw)
		 */
		proto.setCoordinates = this.Attributes(
			["a5.Contract", {coords:'array'}, {coords:'string'}], 
			function(args){
				if(args && this._cl_viewIsReady){
					var coords = args.coords;
					if(args.overloadID === 1)
						coords = args.coords.split(',');
					this._cl_coordinates = coords;
					if (this._cl_viewIsReady) {
						var allCoords = ['n', 's', 'e', 'w', 'ne', 'se', 'sw', 'nw'];
						for (var x = 0, y = allCoords.length; x < y; x++) {
							var thisCoord = allCoords[x];
							if (a5.cl.core.Utils.arrayIndexOf(coords, thisCoord) === -1) 
								this.disableCoordinate(thisCoord);
							else this.enableCoordinate(thisCoord);
						}
					}
				}
			})
		
		/**
		 * Enable resizing for the specified direction.
		 * 
		 * @param {String} coord The direction in which to enable resizing. (n, ne, e, se, s, sw, w, nw)
		 */
		proto.enableCoordinate = function(coord){
			if(this._cl_validateDirection(coord) && !this._cl_handles[coord]){
				this._cl_createHandle(coord);
			}
		}
		
		/**
		 * Disable resizing for the specified direction
		 * 
		 * @param {String} coord The direction in which to disable resizing. (n, ne, e, se, s, sw, w, nw)
		 */
		proto.disableCoordinate = function(coord){
			if(this._cl_validateDirection(coord) && this._cl_handles[coord]){
				this.removeSubView(this._cl_handles[coord]);
				delete this._cl_handles[coord];
			}
		}
		
		proto.getHandle = function(coord){
			return this._cl_handles[coord];
		}
		
		proto._cl_createHandle = function(direction){
			//create a new button to act as the handle
			var handle = new a5.cl.ui.UIControl().clickEnabled(true);
			handle.handleDirection = direction;
			this._cl_handles[direction] = handle;
			a5.cl.CLViewContainer.prototype.addSubView.call(this, handle);
			//give it the appropriate cursor
			handle.cursor(direction + '-resize');
			//set the size and position based on the direction
			handle.width(direction.match(/e|w/) !== null ? this._cl_handleSize : '100%');//((0 - this._cl_handleSize * 2) + ''));
			handle.height(direction.match(/n|s/) !== null ? this._cl_handleSize : '100%');//((0 - this._cl_handleSize * 2) + ''));
			//handle.x(direction.match(/e|w/) !== null ? (0) : this._cl_handleSize);
			//handle.y(direction.match(/n|s/) !== null ? (0) : this._cl_handleSize);
			handle.x(0).y(0);
			handle.alignX(direction.indexOf('e') !== -1 ? 'right' : 'left');
			handle.alignY(direction.indexOf('s') !== -1 ? 'bottom' : 'top');
			
			//add event listeners
			var self = this;
			var mouseDown = function(e){
				self._cl_resizing = true;
				self._cl_cachedWidth = self.width();
				self._cl_cachedHeight = self.height();
				self._cl_cachedX = self.x();
				self._cl_cachedY = self.y();
				self._cl_cachedMouseX = e.screenX();
				self._cl_cachedMouseY = e.screenY();
				
				self.dispatchEvent(new im.UIEvent(im.UIEvent.RESIZE_STARTED));
				im.Utils.addEventListener(window, 'mousemove', mouseMove, false);
				im.Utils.addEventListener(window, 'mouseup', mouseUp, false);
				e.preventDefault();
			};
			
			var mouseUp = function(e){
				self._cl_resizing = false;
				im.Utils.removeEventListener(window, 'mousemove', mouseMove, false);
				im.Utils.removeEventListener(window, 'mouseup', mouseUp, false);
				self.dispatchEvent(new im.UIEvent(im.UIEvent.RESIZE_STOPPED));
			}
			
			var mouseMove = function(e){
				if(!e) e = window.event;
				if(handle.handleDirection.match(/e|w/) !== null)
					self.width(self._cl_cachedWidth + (e.screenX - self._cl_cachedMouseX) * (handle.handleDirection.indexOf('w') !== -1 ? -1 : 1));
				if(handle.handleDirection.match(/n|s/) !== null)
					self.height(self._cl_cachedHeight + (e.screenY - self._cl_cachedMouseY) * (handle.handleDirection.indexOf('n') !== -1 ? -1 : 1));
				if(handle.handleDirection.indexOf('n') !== -1)
					self.y(self._cl_cachedY - (self._cl_cachedMouseY - e.screenY));
				if(handle.handleDirection.indexOf('w') !== -1)
					self.x(self._cl_cachedX - (self._cl_cachedMouseX - e.screenX));
				
				self.resized.call(self);
				if(self._cl_resizeEventsEnabled)
					self.dispatchEvent(new im.UIEvent(im.UIEvent.RESIZED));
				return false;
			}
			
			handle.addEventListener(im.UIMouseEvent.MOUSE_DOWN, mouseDown);
		}
		
		/**
		 * Called each time the view is resized by dragging the mouse.
		 */
		proto.resized = function(){};
		
		proto._cl_validateDirection = function(dir){
			switch(dir){
				//TODO: make redraw more stable before enabling NW coordinates
				case 'n':
				case 'ne':
				case 'sw':
				case 'w':
				case 'nw':
				case 'e':
				case 'se':
				case 's':
					return true;
				default:
					return false;
			}
		}
		
		proto.resizeEventsEnabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_resizeEventsEnabled = value;
				return this;
			}
			return this._cl_resizeEventsEnabled;
		}
		
		proto.Override.enabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_enabled = value;
				for(var prop in this._cl_handles){
					this._cl_handles[prop].enabled(value);
				}
			}
			return this._cl_enabled;
		}
		
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		proto.Override.scrollXEnabled = function(value){
			if(this._cl_contentView)
				return this._cl_contentView.scrollXEnabled(value);
			else
				return proto.superclass().scrollXEnabled.call(this, value);
		}
		
		proto.Override.scrollYEnabled = function(value){
			if(this._cl_contentView)
				return this._cl_contentView.scrollYEnabled(value);
			else
				return proto.superclass().scrollYEnabled.call(this, value);
		}
		
		
		proto.Override.addSubView = function(){
			this._cl_contentView.addSubView.apply(this._cl_contentView, arguments);
		}
		
		proto.Override.addSubViewAtIndex = function(){
			this._cl_contentView.addSubViewAtIndex.apply(this._cl_contentView, arguments);
		}
		
		proto.Override.addSubViewBelow = function(){
			this._cl_contentView.addSubViewBelow.apply(this._cl_contentView, arguments);
		}
		
		proto.Override.addSubViewAbove = function(){
			this._cl_contentView.addSubViewAbove.apply(this._cl_contentView, arguments);
		}
});