a5.Package('a5.cl.ui')
	.Import('a5.cl.*', 
			'a5.cl.ui.interfaces.ITabView')
	.Extends('UIControl')
	.Implements('ITabView')
	.Prototype('UIDefaultTabView', function(proto, im){
		
		proto.UIDefaultTabView = function(){
			proto.superclass(this);
			this._cl_staticWidth = false;
			this._cl_backgroundView = new im.CLView();
			this._cl_backgroundView.border(1, 'solid', '#c8c6c4').backgroundColor('#e6e4e3');
			this._cl_labelView = new im.UITextField();
			this._cl_labelView.alignY('middle');
			this._cl_labelView.textAlign('center');
			
			this.usePointer(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.addSubView(this._cl_backgroundView);
			this.addSubView(this._cl_labelView);
		}
		
		proto.label = function(value){
			if(typeof value === 'string'){
				this._cl_labelView.text(value);
				return this;
			}
			return this._cl_labelView.text();
		}
		
		proto.activated = function(){
			this._cl_backgroundView.alpha(1);
		}
		
		proto.deactivated = function(){
			this._cl_backgroundView.alpha(0.5);
		}
		
		proto.staticWidth = function(value){
			if(typeof value !== 'undefined'){
				this._cl_staticWidth = value;
				return this;
			}
			return this._cl_staticWidth;
		}
		
		proto.Override.clickEnabled = function(){
			proto.superclass().clickEnabled.apply(this, arguments);
		}
		
	});
