
/**
 * @class 
 * @name a5.cl.ui.buttons.UIButton
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.buttons')
	.Import('a5.cl.ui.events.UIMouseEvent',
			'a5.cl.ui.UITextField',
			'a5.cl.ui.form.UIOptionGroup')
	.Extends('a5.cl.ui.UIControl')
	.Mix('a5.cl.ui.mixins.UIGroupable')
	.Prototype('UIButton', function(proto, im, UIButton){
		
		UIButton.themeDefaults = {
			//width:100,
			//height:25,
			padding:5,
			backgroundColor:['#FFF', '#CCC'],
			border:[1, 'solid', '#AAA', 5],
			_states_:{
				over:{
					backgroundColor:['#CCC', '#FFF'],
					border:[1, 'solid', '#AAA', 5]
				},
				down:{
					backgroundColor:['#CCC', '#FFF'],
					border:[1, 'solid', '#AAA', 5]
				},
				selected:{
					backgroundColor:['#CCC', '#FFF'],
					border:[1, 'solid', '#666', 5]
				}
			}
		};
		
		proto.UIButton = function(label){
			proto.superclass(this);
			this._cl_labelView = new im.UITextField();
			this._cl_data = null;
			this._cl_state = 'up';
			this._cl_labelView.width('auto')
				.alignY('middle')
				.alignX('center')
				.nonBreaking(true);
			this.usePointer(true);
			this.clickEnabled(true);
			this.width(100).height(25);
			
			if(typeof label === 'string')
				this.label(label);
				
			this.themeState('up');
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.addSubView(this._cl_labelView);
			
			var self = this;
			this.addEventListener(im.UIMouseEvent.CLICK, this._cl_onMouseClick, false, this);
			this.addEventListener(im.UIMouseEvent.MOUSE_DOWN, this._cl_onMouseDown, false, this);
			this.addEventListener(im.UIMouseEvent.MOUSE_UP, this._cl_onMouseUp, false, this);
			
			this._cl_viewElement.onmouseover = function(e){
				self._cl_onMouseOver.call(self, e || window.event);
				return false;
			}
			this._cl_viewElement.onmouseout = function(e){
				self._cl_onMouseOut.call(self, e || window.event);
				return false;
			}
		}
		
		proto._cl_onMouseClick = function(e){
			if(this.optionGroup() instanceof im.UIOptionGroup)
				this.selected(true);
		}
		
		proto._cl_onMouseOver = function(e){
			if (this._cl_enabled){
				this._cl_state = 'over';
				//update the colors
				if(!this._cl_selected)
					this.themeState('over')
				//dispatch the event
				var evt = new im.UIMouseEvent(im.UIMouseEvent.MOUSE_OVER, e);
				this.dispatchEvent(evt);
			}
		}
		
		proto._cl_onMouseOut = function(e){
			//update the bg color with the up color(s)
			if (this._cl_enabled) {
				this._cl_state = 'up';
				//update the colors
				if(!this._cl_selected)
					this.themeState('up');
				//dispatch the event
				var evt = new im.UIMouseEvent(im.UIMouseEvent.MOUSE_OUT, e);
				this.dispatchEvent(evt);
			}
		}
		
		proto._cl_onMouseUp = function(e){
			//update the bg color with the up color(s)
			if (this._cl_enabled) {
				this._cl_state = 'up';
				//update the colors
				if(!this._cl_selected)
					this.themeState('up');
			}
		}
		
		proto._cl_onMouseDown = function(e){
			if (this._cl_enabled) {
				this._cl_state = 'down';
				//update the colors
				if(!this._cl_selected)
					this.themeState('down');
			}
		}
		
		proto.Override.selected = function(value){
			var returnVal = this.mixins().selected.call(this, value);
			if (typeof value === 'boolean') {
				this.themeState(value ? 'selected' : this._cl_state);
				return this;
			}
			return returnVal;
		}
		
		proto.Override.enabled = function(value){
			proto.superclass().enabled.call(this, value);
			if(typeof value === 'boolean'){
				this.themeState(value ? this._cl_state : 'disabled');
				this._cl_viewElement.style.cursor = value ? this._cl_cursor : 'default';
				return this;
			}
			return this._cl_enabled;
		}
		
		proto.element = function(){
			return this._cl_viewElement;
		}
		
		/**
		 * 
		 * @param {String} str
		 */
		proto.label = function(str){
			if(typeof str === 'string'){
				this._cl_labelView.text(str);
				return this;
			}
			return this._cl_labelView.text();
		}
		
		proto.labelView = function(){
			return this._cl_labelView;
		}
		
		proto.data = function(value){
			if(typeof value !== 'undefined'){
				this._cl_data = value;
				return this;
			}
			return this._cl_data;
		}
		
		proto.textAlign = function(value){
			return this._cl_labelView.textAlign(value);
		}
		
		proto.fontSize = function(value){
			return this._cl_labelView.fontSize(value);
		}
		
		proto.fontWeight = function(value){
			return this._cl_labelView.fontWeight(value);
		}
		
		proto.dealloc = function(){
			this._cl_viewElement.onmouseover = this._cl_viewElement.onmouseout = null;
		}	
});