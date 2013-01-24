
a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.events.UIEvent',
			'a5.cl.ui.form.UIOptionGroup')
	.Mixin('UIGroupable', function(proto, im){
		
		this.Properties(function(){
			this._cl_optionGroup = null;
			this._cl_selected = false;
		})
		
		proto.UIGroupable = function(){
		}
		
		proto.selected = function(value, suppressEvent){
			if(typeof value === 'boolean' && value !== this._cl_selected){
				this._cl_selected = value;
				if(suppressEvent !== true)
					this.dispatchEvent(im.UIEvent.CHANGE);
				return this;
			}
			return this._cl_selected;
		}
		
		proto.optionGroup = function(value){
			if((value instanceof im.UIOptionGroup || value === null) && value !== this._cl_optionGroup){
				if(this._cl_optionGroup)
					this._cl_optionGroup._cl_removeOption(this);
				this._cl_optionGroup = value;
				if(value) value._cl_addOption(this);
				return this;
			}
			return this._cl_optionGroup;
		}
		
		proto.groupName = function(value){
			if (typeof value === 'string' && value != "") {
				this.optionGroup(im.UIOptionGroup.getGroupByName(value));
				return this;
			}
			return this._cl_optionGroup ? this._cl_optionGroup.groupName() : null;
		}
	
});