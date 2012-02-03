
a5.Package('a5.cl.ui.buttons')

	.Extends('UIButton')
	.Prototype('UIToggleButton', function(proto, im){
		
		var Private = this.PrivateProperties(function(){
			this.toggled = false;
		})
		
		proto.UIToggleButton = function(toggled){
			proto.superclass(this);
			Private(this).toggled = toggled;
		}
		
		proto.childrenReady = function(){
			this._cl_setToggle(Private(this).toggled);
			this.upColor('transparent').overColor('transparent')
				.downColor('transparent').borderWidth(0)
				.upBorder(0).overBorder(0).downBorder(0);
		}
		
		proto._cl_onMouseClick = function(e){
			this._cl_setToggle(!Private(this).toggled);
			proto.superclass()._cl_onMouseClick.call(this, e);
		}
		
		proto.toggled = function(value){
			if(value !== undefined){
				this._cl_setToggle(value);
			}
			//TODO: forced ! because events are not fired here first
			return !Private(this).toggled;
		}
		
		proto._cl_setToggle = function(value){
			Private(this).toggled = value;
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