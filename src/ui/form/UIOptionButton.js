
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.*')
	.Extends('UIFormElement')
	.Mix('a5.cl.ui.mixins.UIGroupable')
	.Prototype('UIOptionButton', function(proto, im){
		proto.UIOptionButton = function(type, label, group){
			proto.superclass(this);
			this._cl_value = null;
			this._cl_defaultValue = null;
			this._cl_input = this._cl_createInput((type === 'radio') ? 'radio' : 'checkbox');
			if(label)
				this.label(label);
			if(group)
				this.optionGroup(group);
			this.height('auto').width('auto')
				.inputViewWidth(25)
				.labelViewWidth('auto')
				.relX(true);
			this._cl_labelView.y(4);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this._cl_inputView.htmlWrapper().appendChild(this._cl_input);
			this._cl_defaultValue = this.selected();
		}
		
		proto.type = function(value){
			if ((value === 'radio' || value === 'checkbox') && value !== this._cl_input.type) {
				try {
					this._cl_inputView.htmlWrapper().removeChild(this._cl_input);
				} catch(e){
					//do nothing
				}
				this._cl_input = this._cl_createInput(value);
				this._cl_inputView.htmlWrapper().appendChild(this._cl_input);
				return this;
			}
			return this._cl_input.type;
		}
		
		proto.Override.selected = function(value, suppressEvent){
			if (typeof value === 'boolean') {
				this._cl_input.checked = value;
			}
			return this.mixins().selected.call(this, value, suppressEvent === true);
		}
		
		proto.Override.label = function(value, labelAfterInput, nonBreaking){
			labelAfterInput = labelAfterInput !== false; //default to true
			return im.UIOptionButton.superclass().label.call(this, value, labelAfterInput, nonBreaking);
		}
		
		proto.Override.element = function(){
			return this._cl_input;
		}
		
		proto.Override.required = function(value){
			if(this._cl_optionGroup)
				return this._cl_optionGroup.required(value);
			else
				return proto.superclass().required.call(this, value); 
		}
		
		proto.Override.reset = function(){
			this.selected(this._cl_defaultValue === true ? true:false);
			this.validityChanged(true);
		}
		
		proto.Override.enabled = function(value){
			if(typeof value == 'boolean' && this._cl_input)
				this._cl_input.disabled = !value;
			return this.superclass().enabled.apply(this, arguments);
		}
		
		proto.Override._cl_validateRequired = function(){
			var isValid = true;
			if((this._cl_optionGroup && !this._cl_optionGroup.selectedOption()) || (!this._cl_optionGroup && !this.selected())){
				isValid = false;
				this.addValidationState(im.UIValidationStates.REQUIRED);
			}
			return isValid;
		}
		
		proto._cl_createInput = function(type, checked){
			var input = document.createElement('input');
			input.id = this.instanceUID() + '_input';
			input.type = type;
			input.name = this.instanceUID();
			input.checked = checked === true;
			input.disabled = !this._cl_enabled;
			var self = this;
			input.onchange = function(){
				self.selected(this.checked);
			}
			//If this is IE < 9, use this nice little hack to make onchange fire immediately
			if (this.DOM().clientPlatform() === 'IE' && this.DOM().browserVersion() < 9) {
				var inputOnClick = function(){
					this.blur();
					this.focus();
				}
				
				input.onclick = inputOnClick;
			}
			return input;
		}
		
		proto.dealloc = function(){
			if(this.optionGroup())
				this.optionGroup().removeOption(this);
			this._cl_destroyElement(this._cl_input);
			this._cl_input = null;
		}
	});
