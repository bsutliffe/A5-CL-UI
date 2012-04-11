
a5.Package('a5.cl.ui.modals')
	.Extends('a5.cl.CLWindow')
	.Prototype('UIModal', function(proto, im){
		
		this.Properties(function(){
			this._cl_destroyOnClose = true;
		})
			
		proto.UIModal = function(){
			proto.superclass(this);
			this._cl_windowLevel = a5.cl.CLWindowLevel.MODAL;
		}
		
		proto.open = function(){
			this.MVC().application().addWindow(this);
		}
		
		proto.Override.show = function(){
			this.open();
		}
		
		proto.close = function(){
			if(this.isOpen())
				this.MVC().application().removeWindow(this, this._cl_destroyOnClose);
		}
		
		proto.Override.hide = function(){
			this.close();
		}
		
		proto.isOpen = function(){
			return this.MVC().application().containsWindow(this);
		}
		
		proto.destroyOnClose = function(value){
			if(typeof value === 'boolean'){
				this._cl_destroyOnClose = value;
				return this;
			}
			return this._cl_destroyOnClose;			
		}
	})