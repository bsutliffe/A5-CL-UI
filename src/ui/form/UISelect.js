
/**
 * @class A selection menu.
 * @name a5.cl.ui.form.UISelect
 * @extends a5.cl.ui.form.UIFormElement
 */
a5.Package('a5.cl.ui.form')
	.Extends('UIFormElement')
	.Prototype('UISelect', function(proto, im, UISelect){
		
		UISelect.customViewDefNodes = ['Option', 'Group'];
	
		proto.UISelect = function(options){
			proto.superclass(this);
			
			this._cl_select = null;
			this._cl_selectMultiple = false;
			this._cl_selectSize = null;
			this._cl_options = [];
			this._cl_minValidIndex = 0;
			
			this.height('auto');
			this.inputView().width(200).height('auto').border(1, 'solid', '#C8C6C4').backgroundColor('#fff')
			
			//if options were passed in a5.Create, add them now.
			if(options instanceof Array)
				this._cl_addOptionsFromData(options);
		}
		
		proto.Override.viewReady = function(){
			//force a redraw of the select
			this._cl_redrawSelect();
			im.UISelect.superclass().viewReady.call(this);
		}
		
		/** @private */
		proto._cl_redrawSelect = function(){
			//remove the existing select, if necessary
			var selectedIndex = -1;
			if (this._cl_select) {
				selectedIndex = this._cl_select.selectedIndex;
				this._cl_select.onchange = null;
				this.inputView().clearHTML();
			}
			//create a new select element
			var sel = document.createElement('select');
			sel.id = this.instanceUID() + '_select';
			sel.style.width = '100%';
			sel.style.border = 'none';
			sel.disabled = !this._cl_enabled ? 'disabled' : null;
			sel.style.backgroundColor = 'transparent';
			sel.multiple = this._cl_selectMultiple;
			this._cl_addFocusEvents(sel);
			if(typeof this._cl_selectSize === 'number') sel.size = this._cl_selectSize;
			//add the options to the select
			for(var x = 0, xl = this._cl_options.length; x < xl; x++){
				var item = this._cl_options[x];
				var opt;
				if(item.isGroup){
					//if this item is a group, create an optgroup
					opt = document.createElement('optgroup');
					opt.label = item.label;
					//and then loop through all of the options within the group
					for(var y = 0, yl = item.options.length; y < yl; y++){
						var grpItem = item.options[y];
						var grpOpt = document.createElement('option');
						grpOpt.innerHTML = grpItem.label;
						grpOpt.value = grpItem.value + '';
						opt.appendChild(grpOpt);
					}
				} else {
					//otherwise just create an option
					opt = document.createElement('option');
					opt.innerHTML = item.label;
					opt.value = item.value + '';
					opt.title = (item.title || item.label) + '';
					opt.disabled = item.disabled;
				}
				//add the item to the select
				sel.appendChild(opt);
				opt = null;
			}
			//add the select to the html view
			this.inputView().htmlWrapper().appendChild(sel);
			sel.selectedIndex = selectedIndex;
			var self = this;
			sel.onchange = function(e){
				self.dispatchEvent(new a5.cl.ui.events.UIEvent(a5.cl.ui.events.UIEvent.CHANGE, e || window.event));
			};
			this._cl_select = sel;
			sel = null;
		}
		
		proto._cl_findGroup = function(group){
			for(var x = 0, y = this._cl_options.length; x < y; x++){
				var item = this._cl_options[x];
				if(item.isGroup && item.label === group)
					return item;
			}
			return undefined;
		}
		
		// Manipulation Methods
		
		/**
		 * Adds multiple options from an array of objects.  The format is as follow:
		 * <br /><code>
		 * [
		 *   {isGroup:true, label:'Group 1', options:[
		 *     {label:'Option 1', value:1},
		 *     {label:'Option 2', value:2},
		 *     {label:'Option 3', value:3}
		 *   ]}
		 * ]
		 * </code>
		 * 
		 * @param {Object[]} options The options and/or groups to be added.
		 */
		proto.addOptionsFromData = function(options){
			//call the internal method
			this._cl_addOptionsFromData(options);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/** @private */
		proto._cl_addOptionsFromData = function(options){
			if(a5.cl.core.Utils.isArray(options)){
				for(var x = 0, y = options.length; x < y; x++){
					var opt = options[x];
					if(opt.isGroup !== undefined && opt.isGroup === true)
						this._cl_addGroup(opt.label, -1, opt.options);
					else
						this.addOption(opt.label, opt.value, null, opt.title, true, opt.disabled);
				}
			}
		}
		
		/**
		 * Adds an option to the UISelect, optionally within a group.
		 * 
		 * @param {String} label	The text to be displayed by the option.
		 * @param {Object} value	The value of the option.  Can be any type.
		 * @param {String} [group]	The label of the group that this option should be added to.
		 * @param {String} [title]	The tooltip to dislay when hovering over this option.
		 */
		proto.addOption = function(label, value, group, title, skipRedraw, disabled){
			//call the internal method
			this._cl_addOptionAtIndex(label, value, -1, group, title, disabled);
			//redraw the select
			if(!skipRedraw)
				this._cl_redrawSelect();
		}
		
		/**
		 * Adds an option to the UISelect at a specified index, optionally within a group.
		 * 
		 * @param {String} label	The text to be displayed by the option.
		 * @param {Object} value	The value of the option.  Can be any type.
		 * @param {Number} index	The index at which this option should be inserted (relative to the group, if one is specified).
		 * @param {String} [group]	The label of the group that this option should be added to.
		 * @param {String} [title]	The tooltip to dislay when hovering over this option.
		 */
		proto.addOptionAtIndex = function(label, value, index, group, title, disabled){
			//call the internal method
			this._cl_addOptionAtIndex(label, value, index, group, title, disabled);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/** @private */
		proto._cl_addOptionAtIndex = function(label, value, index, group, title, disabled){
			if(typeof group === 'string' && typeof index === 'number'){
				//if a group was specified, add the option to that group
				var grp = this._cl_findGroup(group);
				//if a group with that label wasn't found, create one now
				if (grp === undefined) {
					this.addGroup(group);
					grp = this._cl_options[this._cl_options.length - 1];
				}
				//validate the index
				if(index < 0 || index > grp.options.length) index = grp.options.length;
				//add the option to the group
				grp.options.splice(index, 0, {label:label, value:value});
			} else {
				//validate the index
				if(index < 0 || index > this._cl_options.length) index = this._cl_options.length;
				//add it to the array at the specified index
				this._cl_options.splice(index, 0, {label:label, value:value, title:title, disabled:!!disabled});
			}
		}
		
		/**
		 * Removes all options from the UISelect that have the specified label and value.
		 * 
		 * @param	{String} label	The label of the option to be removed.
		 * @param	{Object} value	The value of the option to be removed.
		 * @return	{Number} The number of options that were removed.
		 */
		proto.removeOption = function(label, value){
			var removed = 0;
			var toBeRemoved = [];
			//loop through each option
			for(var x = 0, xl = this._cl_options.length; x < xl; x++){
				var item = this._cl_options[x];
				if(item.isGroup){
					//if it's a group, loop through each option in the group
					var grpToBeRemoved = [];
					for(var y = 0, yl = item.options.length; y < yl; y++){
						var grpItem = item.options[y];
						//if this item matches the label and value passed, mark it for deletion 
						if(grpItem.label === label && grpItem.value === value)
							grpToBeRemoved.push(y);
					}
					//remove all of the items that were flagged
					for(var z = 0, zl = grpToBeRemoved.length; z < zl; z++){
						item.options.splice(z, 1);
						removed++;
					}
				} else {
					//if this item matches the label and value passed, mark it for deletion
					if(item.label === label && item.value === value)
						toBeRemoved.push(x);
				}
			}
			for(var x = 0, xl = toBeRemoved.length; x < xl; x++){
				this._cl_options.splice(x, 1);
				removed++;
			}
			//redraw the select
			this._cl_redrawSelect();
			//return the array of options that were removed;
			return removed;
		}
		
		/**
		 * Removes an option from the UISelect at the specified index, optionally within a specified group.
		 * 
		 * @param  {Number} index	The index of the option that should be removed.
		 * @param  {String} [group]	The label of the group that this option should be added to.
		 * @return {Object} The option that was removed.
		 */
		proto.removeOptionAtIndex = function(index, group){
			if(typeof group === 'string'){
				//if a group was specified, remove the specified option from the group
				var grp = this._cl_findGroup(group);
				if (grp === undefined) {
					return null;
				} else {
					var removed = grp.options.splice(index, 1)[0];
					this._cl_redrawSelect();
					return removed;
				}
			} else {
				//traverse the options until we hit the specified index
				var i = -1;
				for(var x = 0, xl = this._cl_options.length; x < xl; x++){
					var item = this._cl_options[x];
					if(item.isGroup){
						//if it's a group, loop through each option in the group
						for(var y = 0, yl = item.options.length; y < yl; y++){
							var grpItem = item.options[y];
							i++;
							if(i === index)
								var removed = item.options.splice(y, 1)[0];
								this._cl_redrawSelect();
								return removed;
						}
					} else {
						i++;
						if(i === index){
							var removed = this._cl_options.splice(x, 1)[0];
							this._cl_redrawSelect();
							return removed;
						}
					}
				}
			}
		}
		
		/**
		 * Removes all of the options.
		 */
		proto.removeAll = function(){
			this._cl_options = [];
			this._cl_redrawSelect();
		}
		
		/**
		 * Adds a group to the UISelect.  If an array of options are passed, those options will be added to the group.
		 * 
		 * @param {String}	 label		The text to be displayed for this group.
		 * @param {Number}	 [index]	The global index at which to add this group.
		 * @param {Object[]} [options]	An array of options to be placed within this group.
		 */
		proto.addGroup = function(label, index, options){
			//call teh internal method
			this._cl_addGroup(label, index, options);
			//redraw the select
			this._cl_redrawSelect();
		}
		
		/** @private */
		proto._cl_addGroup = function(label, index, options){
			if(typeof label === 'string'){
				//validate the index
				if(typeof index !== 'number') index = -1;
				if(index < 0 || index > this._cl_options.length) index = this._cl_options.length;
				//create the group
				var grp = {isGroup:true, label:label, options:[]};
				//add options to the group if necessary
				if(options instanceof Array){
					for(var x = 0, y = options.length; x < y; x++){
						var opt = options[x];
						grp.options.push({label:opt.label, value:opt.value});
					}
				}
				//add the group to the array
				this._cl_options.splice(index, 0, grp);
			}
		}
		
		/**
		 * Removes a group from the UISelect.  By default, the options within that group will also be removed. Pass false as a second param to keep the options.
		 * 
		 * @param  {String}		group					The label of the group to be removed
		 * @param  {Boolean}	[removeOptions=true]	If false, the options within the specified group will not be removed from the select.
		 * @return {Object[]}	Returns an array of options that were in the removed group. 
		 */
		proto.removeGroup = function(group, removeOptions){
			var grp;
			var index;
			for(var x = 0, y = this._cl_options.length; x < y; x++){
				var item = this._cl_options[x];
				if (item.isGroup && item.label === group) {
					grp = item;
					index = x;
					break;
				}
			}
			if(typeof index === 'number'){
				this._cl_options.splice(index, 1);
				if(removeOptions === false){
					for(var x = 0, y = grp.options.length; x < y; x++){
						this._cl_options.splice(index + x, 0, grp.options[x]);
					}
				}
			}
			this._cl_redrawSelect();
			return grp.options;
		}
		
		
		// Informational Methods
		
		/**
		 * Gets or sets the option that is currently selected, or null if none is selected.
		 * 
		 * @param value {Number|Object} the index of the selection or an object with 'value' and/or 'label' properties corresponding to the option that should be selected.
		 * @return {Object}	The currently selected option.
		 */
		proto.selectedOption = function(value){
			var type = typeof value,
				setting = type == 'number' || (type === 'object' && (value.hasOwnProperty('value') || value.hasOwnProperty('label'))),
				checkLabel = setting && type === 'object' && value.hasOwnProperty('label'),
				checkValue = setting && type === 'object' && value.hasOwnProperty('value'),
				checkIndex = setting && type === 'number',
				selectedIndex = this._cl_select.selectedIndex,
				i = -1,
				selectedOptions = [],
				x, xl, y, yl, item, grpItem, labelMatch, valueMatch;
				
			if(selectedIndex < 0 && !setting) return null;
			
			if(checkIndex && value < 0){
				this._cl_select.selectedIndex = -1;
				return null;
			}
			
			if(this._cl_selectMultiple){
				selectedIndex = [];
				for(x = 0, y = this._cl_select.options.length; x < y; x++){
					if(this._cl_select.options[x].selected)
						selectedIndex.push(x);
				}
			}
			
			for (x = 0, xl = this._cl_options.length; x < xl; x++) {
				item = this._cl_options[x];
				if (item.isGroup) {
					for (y = 0, yl = item.options.length; y < yl; y++) {
						i++;
						grpItem = item.options[y];
						if (setting) {
							labelMatch = checkLabel ? (grpItem.label === value.label) : true;
							valueMatch = checkValue ? (grpItem.value === value.value) : true;
							if (checkIndex ? (i === value) : (labelMatch && valueMatch)) {
								this._cl_select.selectedIndex = i;
								return this;
							}
						} else if (i === selectedIndex) {
							return grpItem;
						} else if (a5.cl.core.Utils.arrayContains(selectedIndex, i)) {
							selectedOptions.push(grpItem);
						}
					}
				} else {
					i++
					if (setting) {
						labelMatch = checkLabel ? (item.label === value.label) : true;
						valueMatch = checkValue ? (item.value === value.value) : true;
						if(checkIndex ? (i === value) : (labelMatch && valueMatch)){
							this._cl_select.selectedIndex = i;
							return this;
						}
					} else if (i === selectedIndex) {
						return item;
					} else if(a5.cl.core.Utils.arrayContains(selectedIndex, i)){
						selectedOptions.push(item);
					}
				}
			}
			if(this._cl_selectMultiple)
				return selectedOptions
			return null;
		}
		
		proto.Override.value = function(value){
			if (value === undefined) {
				var selectedOpt = this.selectedOption();
				if (!a5.cl.core.Utils.isArray(selectedOpt)) 
					return selectedOpt ? ((selectedOpt.value === undefined || selectedOpt.value === null) ? selectedOpt.label : selectedOpt.value) : null;
				var data = [], x, y;
				for (x = 0, y = selectedOpt.length; x < y; x++) {
					data.push((selectedOpt[x].value === undefined || selectedOpt[x].value === null) ? selectedOpt[x].label : selectedOpt[x].value);
				}
				return data;
			} else {
				this.selectedOption({value:value});
			}
		}
		
		proto.Override._cl_validateRequired = function(){
			if(this._cl_select.selectedIndex < this._cl_minValidIndex){
				this.addValidationState(im.UIValidationStates.REQUIRED);
				return false;
			}
			return true;
		}
		
		/**
		 * Select the option at the specified index.
		 * 
		 * @param {Number} index The index of the option to select.
		 */
		proto.selectOptionAtIndex = function(index){
			var opt = this.getOptionAtIndex(index);
			if(opt)
				this.selectedOption(opt);
			this._cl_select.onchange();
		}
		
		/**
		 * Returns the option at the specified index, or an array of options if a group is at the specified index.  Pass a group label to search within that specified group.
		 * 
		 * @param {Number} index The index of the option to retrieve.
		 * @return {Object|Object[]} The option at the specified index.
		 */
		proto.getOptionAtIndex = function(index, group){
			if(typeof group === 'string'){
				//if a group was specified, just return the index within that group
				var grp = this._cl_findGroup(group);
				if (grp === undefined)
					return null;
				else
					return grp.options[index];
			} else {
				//traverse the options until we hit the specified index
				var i = -1;
				for(var x = 0, xl = this._cl_options.length; x < xl; x++){
					var item = this._cl_options[x];
					if(item.isGroup){
						//if it's a group, loop through each option in the group
						for(var y = 0, yl = item.options.length; y < yl; y++){
							var grpItem = item.options[y];
							i++;
							if(i === index)
								return grpItem;
						}
					} else {
						i++;
						if(i === index)
							return item;
					}
				}
			}
		}
		
		/**
		 * Returns an array of options that are within the specified group. 
		 * 
		 * @param {String} group The label of the group to retrieve.
		 * @return {Object[]} An array of options that are in the specified group.
		 */
		proto.getGroup = function(group){
			var grp = this._cl_findGroup(group);
			if(grp)
				return grp.options;
			else
				return null;
		}
		
		proto.Override.reset = function(){
			this.selectOptionAtIndex(0);
			this.validityChanged(true);
		}
		
		/**
		 * Whether the UISelect should allow multiple selections.  Defaults to false.
		 * 
		 * @param {Boolean} [value] Whether the UISelect should allow multiple selections.
		 * @return {Boolean} Whether the UISelect allows multiple selections.
		 */
		proto.allowMultiple = function(value){
			if (typeof value === 'boolean') {
				if(this._cl_select) this._cl_select.multiple = value;
				this._cl_selectMultiple = value;
			}
			return this._cl_selectMultiple;
		}
		
		/**
		 * 
		 * @param {Number} value The maximum number of options to display at one time.
		 */
		proto.size = function(value){
			if(typeof value === 'number'){
				if(this._cl_select) this._cl_select.size = value;
				this._cl_selectSize = value;
			}
			return this._cl_selectSize;
		}
		
		proto.minValidIndex = function(value){
			if(typeof value === 'number'){
				this._cl_minValidIndex = value;
				return this;
			}
			return this._cl_minValidIndex;
		}
		
		proto.Override.enabled = function(value){
			if (typeof value === 'boolean') {
				if(this._cl_select) this._cl_select.disabled = !value;
				this._cl_enabled = value;
			}
			return this._cl_enabled;
		}
		
		proto.Override.element = function(){
			return this._cl_select;
		}
		
		proto.Override.processCustomViewDefNode = function(nodeName, node, imports, defaults, rootView){
			proto.superclass().processCustomViewDefNode.apply(this, arguments);
			switch(nodeName){
				case 'Option':
					this.addOption(node.label, node.value, node.group, node.title);
					break;
				case 'Group':
					this.addGroup(node.label);
					break;
			}
		}
		
		proto.dealloc = function(){
			this._cl_select.onchange = null;
			this._cl_destroyElement(this._cl_select);
			this._cl_select = null;
		}

});