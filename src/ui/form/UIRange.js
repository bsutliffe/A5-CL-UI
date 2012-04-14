
a5.Package('a5.cl.ui.form')

	.Extends('UIFormElement')
	.Prototype('UIRange', function(proto, im){
		
		proto.UIRange = function(){
			proto.superclass(this, arguments);
			this._cl_element = document.createElement('input');
			this._cl_element.type = 'range';
			this._cl_element.min = 0;
			this._cl_element.max = 100;
			this._cl_element.style.width = '100%';
			this.inputView().appendChild(this._cl_element);
		}
		
		
		proto.minValue = function(value){
			if(value !== undefined){
				this._cl_element.min = value;
				return this;
			}
			return this._cl_element.min;
		}
		
		proto.maxValue = function(value){
			if(value !== undefined){
				this._cl_element.max = value;
				return this;
			}
			return this._cl_element.max;
		}
		
		proto.Override.value = function(value){
			proto.superclass().value.call(this, arguments);
			if(value !== undefined){
				this._cl_element.value = value;
				return this;
			}
			return this._cl_element.value;
		}		
})