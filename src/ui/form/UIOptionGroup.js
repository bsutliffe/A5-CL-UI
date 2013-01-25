
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.events.UIEvent',
			'a5.cl.ui.mixins.UIGroupable',
			'a5.cl.core.Utils')
	.Extends('a5.EventDispatcher')
	.Prototype('UIOptionGroup', function(proto, im, UIOptionGroup){
		
		UIOptionGroup._ui_instanceRef = [];
		
		UIOptionGroup._ui_addRef = function(inst){
			UIOptionGroup._ui_instanceRef.push(inst);
		}
		
		UIOptionGroup._ui_removeRef = function(inst){
			for(var i = 0, i = UIOptionGroup._ui_instanceRef.length; i<l; i++){
				if(UIOptionGroup._ui_instanceRef[i] === inst){
					UIOptionGroup._ui_instanceRef.splice(i, 1);
					return;
				}
			}
		}
		
		UIOptionGroup.getGroupByName = function(groupName){
			for(var x = 0, y = UIOptionGroup._ui_instanceRef.length; x < y; x++){
				var thisRef = UIOptionGroup._ui_instanceRef[x];
				if(thisRef.groupName() === groupName)
					return thisRef;
			}
			return a5.Create(UIOptionGroup, [groupName]);
		}
		
		this.Properties(function(){
			this._cl_groupName = null;
			this._cl_name = null;
			this._cl_options = [];
			this._cl_selectedOption = null;
			this._cl_required = false;
			this._cl_allowMultiple = false;
		});
		
		proto.UIOptionGroup = function($groupName){
			proto.superclass(this);
			UIOptionGroup._ui_addRef(this);
			this._cl_groupName = $groupName || this.instanceUID();
		}
		
		proto.allowMultiple = function(value){
			if(typeof value === 'boolean'){
				this._cl_allowMultiple = value;
				if(value)
					this._cl_selectedOption = this._cl_selectedOption ? [this._cl_selectedOption] : [];
				else
					this._cl_selectedOption = this._cl_selectedOption.length > 0 ? this._cl_selectedOption[0] : null;
				return this;
			}
			return this._cl_allowMultiple;
		}
		
		proto.groupName = function(){
			return this._cl_groupName;
		}
		
		proto.addOption = function(option){
			var wasAdded = this._cl_addOption(option);
			if(wasAdded)
				option.optionGroup(this);
		}
		
		proto._cl_addOption = function(option){
			if(!this.hasOption(option)){
				this._cl_options.push(option);
				option.addEventListener(im.UIEvent.CHANGE, this._cl_eOptionChangedHandler, false, this);
				if(option.selected())
					this._cl_selectOption(option);
				return true;
			}
			return false;
		}
		
		proto.removeOption = function(option){
			var wasRemoved = this._cl_removeOption(option);
			if(wasRemoved)
				option.optionGroup(null);
		}
		
		proto._cl_removeOption = function(option){
			var optionIndex = a5.cl.core.Utils.arrayIndexOf(this._cl_options, option);
			if (optionIndex > -1) {
				var removed = this._cl_options.splice(optionIndex, 1);
				removed[0].removeEventListener(im.UIEvent.CHANGE, this._cl_eOptionChangedHandler);
				return true;
			}
			return false;
		}
		
		proto.hasOption = function(option){
			for(var x = 0, y = this._cl_options.length; x < y; x++){
				if(this._cl_options[x] === option)
					return true;
			}
			return false;
		}
		
		proto.selectedOption = function(value){
			if(value !== undefined){
				if(this.hasOption(value) || value === null || value === false)
					this._cl_selectOption(value);
				return this;
			}
			return this._cl_selectedOption;
		}
		
		proto.optionAtIndex = function(index){
			if(typeof index === 'number')
				return this._cl_options[index];
			return null;
		}
		
		proto.optionCount = function(){
			return this._cl_options.length;
		}
		
		proto.name = function(value){
			if(typeof value === 'string'){
				this._cl_name = value;
				return this;
			}
			return this._cl_name || this._cl_groupName;
		}
		
		proto.value = function(){
			var selOpt = this.selectedOption();
			if(this._cl_allowMultiple){
				var values = [],
					x, y, thisOption, thisValue;
				for(x = 0, y = selOpt.length; x < y; x++){
					thisOption = selOpt[x];
					thisValue = thisOption.value();
					values.push(thisValue === undefined || thisValue === null ? thisOption.name() : thisValue);
				}
				return values;
			}
			return selOpt ? (selOpt.value() || selOpt.name()) : null;
		}
		
		proto.required = function(value){
			if(typeof value === 'boolean'){
				this._cl_required = value;
				return this;
			}
			return this._cl_required;
		}
		
		proto._cl_eOptionChangedHandler = function(e){
			var target = e.target();
			if (target.doesMix(im.UIGroupable)) {
				if(target.selected())
					target.optionGroup()._cl_selectOption(target);
				else if(this._cl_allowMultiple)
					target.optionGroup()._cl_deselectOption(target);
			}
		}
		
		proto._cl_selectOption = function(option){
			if (this._cl_allowMultiple) {
				if (!im.Utils.arrayContains(this._cl_selectedOption, option)) {
					this._cl_selectedOption.push(option);
					this.dispatchEvent(new im.UIEvent(im.UIEvent.CHANGE));
				}
			} else {
				var prevSelection = this._cl_selectedOption;
				this._cl_selectedOption = null;
				for (var x = 0, y = this._cl_options.length; x < y; x++) {
					var thisOption = this._cl_options[x], selected = thisOption === option
					if (selected) 
						this._cl_selectedOption = thisOption;
					thisOption.selected(selected);
				}
				if (this._cl_selectedOption !== prevSelection) 
					this.dispatchEvent(new im.UIEvent(im.UIEvent.CHANGE));
			}
		}
		
		proto._cl_deselectOption = function(option){
			if(this._cl_allowMultiple){
				var idx = im.Utils.arrayIndexOf(this._cl_selectedOption, option);
				if(idx >= 0){
					this._cl_selectedOption.splice(idx, 1);
					this.dispatchEvent(new im.UIEvent(im.UIEvent.CHANGE));
				}
			}
		}
		
		proto.dealloc = function(){
			UIOptionGroup._ui_removeRef(this);
		}
		
});