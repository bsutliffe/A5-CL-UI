
a5.Package('a5.cl.ui.form')
	
	.Import('a5.cl.ui.events.UIEvent')
	.Extends('UIFormElement')
	.Prototype('UIFileInput', function(proto, im, UIFileInput){
		
		proto.UIFileInput = function(){
			proto.superclass(this);
			this._cl_setupInput();
		}
		
		proto.Override.reset = function(){
			proto.superclass().reset.apply(this, arguments);
			this._cl_inputView.drawHTML(" ");
			this._cl_destroyElement(this._cl_element);
			this._cl_setupInput();
			this._cl_inputView.appendChild(this._cl_element);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this._cl_inputView.appendChild(this._cl_element);
		}
		
		proto.Override.value = function(value){
			if(value === undefined)
				return this._cl_element.files ? this._cl_element.files[0] : this._cl_element.value;
		}
		
		proto._cl_setupInput = function(){
			this._cl_element = document.createElement('input');
			this._cl_element.type = 'file';
			this._cl_element.id = this.instanceUID() + '_field';
			this._cl_element.style.width = '100%';
			
			var self = this;
			this._cl_element.onchange = function(){
				self.dispatchEvent(im.UIEvent.CHANGE);
			}
		}
});
