a5.Package('a5.cl.ui.buttons')

	.Extends('UIButton')
	.Prototype('UIToggleButton', function(proto, im, UIToggleButton){
		
		UIToggleButton.themeDefaults = {
			padding:{left:5, right:5},
			backgroundColor:'transparent',
			border:0
		};
		
		
		this.Properties(function(){
			this._cl_toggled = false;
		})
		
		proto.UIToggleButton = function(toggled){
			proto.superclass(this);
			this._cl_toggled = toggled;
		}
		
		proto.Override.childrenReady = function(){
			this._cl_setToggle(this._cl_toggled);
		}
		
		proto.Override._cl_onMouseClick = function(e){
			this._cl_setToggle(this._cl_toggled);
			proto.superclass()._cl_onMouseClick.call(this, e);
		}
		
		proto.toggled = function(value){
			if(value !== undefined){
				this._cl_setToggle(value);
			}
			//TODO: forced ! because events are not fired here first
			return !this._cl_toggled.toggled;
		}
		
		proto._cl_setToggle = function(value){
			this._cl_toggled = value;
			this.toggledView().visible(value);
			this.untoggledView().visible(!value);
		}
		
		proto.untoggledView = function(){
			return this.subViewAtIndex(0);
		}
		
		proto.toggledView = function(){
			return this.subViewAtIndex(1);
		}
})