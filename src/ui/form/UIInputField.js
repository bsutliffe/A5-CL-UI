
/**
 * @class 
 * @name a5.cl.ui.form.UIInputField
 * @extends a5.cl.ui.form.UIFormElement
 */
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.events.*',
			'a5.cl.core.Utils',
			'a5.cl.ui.core.Keyboard',
			'a5.cl.ui.core.UIUtils',
			'a5.cl.ui.modals.UIInputHistoryList')
	.Extends('UIFormElement')
	.Mix('a5.cl.ui.mixins.UIKeyboardEventDispatcher')
	.Prototype('UIInputField', function(proto, im){
		
		this.Properties(function(){
			this._cl_element = null;
			this._cl_multiline = false;
			this._cl_defaultValue = '';
			this._cl_textColor = '#000';
			this._cl_defaultTextColor = '#666';
			this._cl_password = false;
			this._cl_imitateLabel = false;
			this._cl_historyEnabled = false;
			this._cl_dataStore = null;
			this._cl_history = null;
			this._cl_userEnteredValue = "";
			this._cl_historyInsertedValue = "";
			this._cl_minLength = 0;
			this._cl_maxLength = Infinity;
			this._cl_textAlign = 'left';
		})
		
		proto.UIInputField = function(text){
			proto.superclass(this);
			this.multiline(false, true); //creates the input element
			
			this._cl_dataStore = this.create(a5.cl.ui.form.InputFieldDataStore);
			
			this.inputView().border(1, 'solid', '#C8C6C4').backgroundColor('#fff');
			this.height('auto');//.relX(true);
			if(typeof text === 'string') this.value(text);
			
			this.addEventListener(im.UIEvent.FOCUS, this._cl_eFocusHandler, false, this);
			this.addEventListener(im.UIEvent.BLUR, this._cl_eBlurHandler, false, this);
			this.cl().addEventListener(a5.cl.CLEvent.APPLICATION_WILL_CLOSE, this._cl_persistHistory, false, this);
			
			this.addEventListener(im.UIKeyboardEvent.KEY_UP, this._cl_eKeyUpHandler, false, this);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			//add the input element to the html view
			this.inputView().htmlWrapper().appendChild(this._cl_element);
			var self = this;
			this._cl_element.onchange = function(){
				self.dispatchEvent(self._cl_changeEvent);
			}
		}
		
		proto.Override.id = function(value){
			if (typeof value === 'string')
				this._cl_dataStore.keyPrefix(value);
			return proto.superclass().id.call(this, value);
		}
		
		proto.Override._cl_validate = function(){
			var isValid = true,
				superIsValid = proto.superclass()._cl_validate.call(this),
				value = this.value();
			if (value.length < this._cl_minLength) {
				isValid = false;
				this.addValidationState(im.UIValidationStates.TOO_SHORT);
			} else if (value.length > this._cl_maxLength) {
				isValid = false;
				this.addValidationState(im.UIValidationStates.TOO_LONG);
			}
			return isValid && superIsValid;
		}
		
		proto.Override._cl_validateRequired = function(){
			if(this.value().length === 0 || /^\s$/.test(this.value())){
				this.addValidationState(im.UIValidationStates.REQUIRED);
				return false;
			}
			return true;
		}
		
		proto.minLength = function(value){
			if(typeof value === 'number'){
				this._cl_minLength = value;
				return this;
			}
			return this._cl_minLength;
		}
		
		proto.maxLength = function(value){
			if(typeof value === 'number'){
				this._cl_maxLength = value;
				return this;
			}
			return this._cl_maxLength;
		}
		
		/**
		 * 
		 * @param {String} [value]
		 */
		proto.Override.value = function(value){
			if(value !== undefined && value !== null){
				value = value + ''; //force to a string
				this._cl_element.value = value;
				this._cl_element.setAttribute('value', value);
				if(this._cl_imitateLabel)
					this.label(value);
				if(value == '' && this._cl_defaultValue)
					this._cl_eBlurHandler();
				return this;
			}
			return this._cl_element.value;
		}
		
		/**
		 * 
		 * @param {String} value
		 */
		proto.defaultValue = function(value){
			if(typeof value === 'string'){
				this._cl_defaultValue = value;
				this._cl_eBlurHandler();
				return this;
			}
			return this._cl_defaultValue;
		}
		
		/**
		 * 
		 * @param {Boolean} [value]
		 */
		proto.multiline = function(value, force){
			if(typeof value === 'boolean' && (value !== this._cl_multiline || force === true)){
				this._cl_multiline = value;
				var previousValue = this._cl_element ? this._cl_element.value : '';
				this.inputView().clearHTML();
				if(value){
					this._cl_element = document.createElement('textarea');
					this._cl_element.style.resize = 'none';
					this.inputView().height('100%');
				} else {
					this.inputView().clearHTML();
					this._cl_element = document.createElement('input');
					this._cl_element.type = this._cl_password ? 'password' : 'text';
					this.inputView().height(22);
				}
				this._cl_element.id = this.instanceUID() + '_field';
				this._cl_element.style.width = this._cl_element.style.height = '100%';
				this._cl_element.style.padding = this._cl_element.style.margin = '0px';
				this._cl_element.style.border = 'none';
				this._cl_element.style.backgroundColor = 'transparent';
				this._cl_element.style.minHeight = '1em';
				this._cl_element.style.textAlign = this._cl_textAlign;
				this._cl_addFocusEvents(this._cl_element);
				this.keyboardEventTarget(this._cl_element);
				this.inputView().appendChild(this._cl_element);
				this._cl_element.value = previousValue;
				return this;
			}
			return this._cl_multiline;
		}
		
		proto.Override.enabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_enabled = value;
				this._cl_element.readOnly = !value;
				return this;
			}
			return this._cl_enabled;
		}
		
		proto.historyEnabled = function(value){
			if(typeof value === 'boolean'){
				this._cl_historyEnabled = value;
				this._cl_history = this.getHistory();
				if (value)
					this._cl_element.setAttribute('autocomplete', 'off');
				else
					this._cl_element.removeAttribute('autocomplete');
				return this;
			}
			return this._cl_historyEnabled;
		}
		
		proto.storeValue = function(){
			var value = this.value();
			if(value != '' && this._cl_historyEnabled){
				var idx = im.Utils.arrayIndexOf(this._cl_history, value);
				if(idx > -1)
					this._cl_history.splice(idx, 1);
				this._cl_history.unshift(value);
			}
		}
		
		proto.getHistory = function(filtered){
			if(this._cl_history === null)
				this._cl_history = this._cl_dataStore.getValue('history') || [];
			return filtered === true ? this._cl_filterHistory() : this._cl_history;
		}
		
		proto.clearHistory = function(){
			return this._cl_dataStore.clearValue('history');
		}
		
		proto.imitateLabel = function(value){
			if(typeof value === 'boolean'){
				if(value !== this._cl_imitateLabel){
					if(value){
						this.relX(false).relY(false);
						this.label(this.value());
						this._cl_inputView.visible(false);
						this._cl_labelView.clickEnabled(true)
							.cursor('text')
							.addEventListener(im.UIMouseEvent.CLICK, this._cl_eLabelClickHandler, false, this);
						var self = this
						this.addEventListener(im.UIKeyboardEvent.ENTER_KEY, this._cl_eBlurHandler, false, this)
					} else {
						this._cl_inputView.visible(true);
						if (this._cl_labelView) {
							this._cl_labelView.visible(true)
								.clickEnabled(false)
								.usePointer(false);
							this._cl_labelView.removeEventListener(im.UIMouseEvent.CLICK, this._cl_eLabelClickHandler);
						}
					}
					this._cl_imitateLabel = value;
				}
				return this;
			}
			return this._cl_imitateLabel;
		}
		
		proto.Override.element = function(){
			return this._cl_element;
		}
		
		proto.textColor = function(value){
			if(typeof value !== 'undefined'){
				this._cl_textColor = value;
				if(this._cl_defaultValue)
					this._cl_element.onblur();
				else
					this._cl_element.style.color = value; 
				return this;
			}
			return this._cl_textColor;
		}
		
		proto.textAlign = function(value){
			if(typeof value === 'string'){
				this._cl_textAlign = value;
				this._cl_element.style.textAlign = value;
				return this;
			}
			return this._cl_textAlign;
		}
		
		proto.password = function(value){
			if(typeof value === 'boolean'){
				if(value !== this._cl_password){
					this._cl_password = value;
					this.multiline(this._cl_multiline, true);
				}
				return this;
			}
		}
		
		proto.defaultTextColor = function(value){
			if(typeof value !== 'undefined'){
				this._cl_defaultTextColor = value;
				if(this._cl_defaultValue && this.value() === this._cl_defaultValue)
					this._cl_element.style.color = value; 
				return this;
			}
			return this._cl_defaultTextColor;
		}
		
		proto._cl_eFocusHandler = function(e){
			if (this._cl_defaultValue && this.value() === this._cl_defaultValue) {
				this._cl_element.value = '';
				this._cl_element.style.color = this._cl_textColor;
			}
			if(this._cl_imitateLabel)
				this._cl_eLabelClickHandler();
		}
		
		proto._cl_eBlurHandler = function(e){
			if (this._cl_defaultValue && this.value() === this._cl_defaultValue) {
				this._cl_element.value = '';
				this._cl_element.style.color = this._cl_textColor;
			} else if(this._cl_imitateLabel){
				this.label(this.value());
				this._cl_inputView.visible(false);
				this._cl_labelView.visible(true);
			} else if(this._cl_historyEnabled && im.UIInputHistoryList.isOpen()){
				im.UIInputHistoryList.close();
			}
		}
		
		proto._cl_eLabelClickHandler = function(e){
			this._cl_labelView.visible(false);
			this._cl_inputView.visible(true);
			this.value(this.label());
			this.focus();
		}
		
		proto.Override._cl_eKeyUpHandler = function(e){
			if(im.Keyboard.isVisibleCharacter(e.keyCode()) || e.keyCode() === im.Keyboard.BACKSPACE || e.keyCode() === im.Keyboard.DELETE)
				this.dispatchEvent(this._cl_changeEvent);
			if(this._cl_historyEnabled && this._cl_history.length > 0){
				switch(e.keyCode()){
					case im.Keyboard.DOWN_ARROW:
						if(im.UIInputHistoryList.isOpen())
							im.UIInputHistoryList.nextItem();
						else
							this._cl_openHistoryList();
						break;
					case im.Keyboard.UP_ARROW:
						if(im.UIInputHistoryList.isOpen())
							im.UIInputHistoryList.previousItem();
						break;
					case im.Keyboard.ESCAPE:
						this.value(this._cl_userEnteredValue);
					case im.Keyboard.BACKSPACE:
					case im.Keyboard.DELETE:
						this._cl_userEnteredValue = this.value();
					case im.Keyboard.ENTER:
					case im.Keyboard.TAB:
					case im.Keyboard.RIGHT_ARROW:
						im.UIInputHistoryList.close();
						break;
					default:
						if(im.Keyboard.isVisibleCharacter(e.keyCode())){
							this._cl_userEnteredValue = this.value();
							//if(this._cl_userEnteredValue.substr(this._cl_userEnteredValue.length - this._cl_historyInsertedValue.length) === this._cl_historyInsertedValue)
							//	this._cl_userEnteredValue = this._cl_userEnteredValue.substr(0, this._cl_userEnteredValue.length - this._cl_historyInsertedValue.length);
							if(im.UIInputHistoryList.isOpen())
								im.UIInputHistoryList.update(this.getHistory(true));
							else
								this._cl_openHistoryList();
						}
				}
			}
		}
		
		proto._cl_openHistoryList = function(){
			im.UIInputHistoryList.instance().addEventListener(im.UIEvent.CHANGE, this._cl_eHistoryListChangeHandler, false, this);
			im.UIInputHistoryList.instance().addEventListener(im.UIEvent.CLOSE, this._cl_eHistoryListCloseHandler, false, this);
			im.UIInputHistoryList.open(this);
			var self = this;
			setTimeout(function(){
				var value = self.value();
				im.UIUtils.selectTextRange(value.length, value.length, self._cl_element);
			}, 0);
		}
		
		proto._cl_filterHistory = function(){
			var inputHistory = this.getHistory(),
				value = this.value(),
				filtered = [];
			for(var x = 0, y = inputHistory.length; x < y; x++){
				var thisItem = inputHistory[x];
				if(thisItem.substr(0, value.length) === value)
					filtered.push(thisItem)
			}
			return filtered;
		}
		
		proto._cl_eHistoryListChangeHandler = function(e){
			if(e.target() !== im.UIInputHistoryList.instance())
				return;
			
			var selectedOption = im.UIInputHistoryList.selectedItem();
			this.value(selectedOption);
			
			//this._cl_historyInsertedValue = selectedOption.substr(this._cl_userEnteredValue.length);
			
			// THIS IS A WORKAROUND FOR IE.  IT WON'T SELECT THE TEXT UNLESS WE BREAK OUT INTO ANOTHER THREAD
			var self = this;
			setTimeout(function(){
				//im.UIUtils.selectTextRange(self._cl_userEnteredValue.length, selectedOption.length, self._cl_element);
				im.UIUtils.selectTextRange(selectedOption.length, selectedOption.length, self._cl_element);
			}, 0);
		}
		
		proto._cl_eHistoryListCloseHandler = function(e){
			im.UIInputHistoryList.instance().removeEventListener(im.UIEvent.CHANGE, this._cl_eHistoryListChangeHandler);
			im.UIInputHistoryList.instance().removeEventListener(im.UIEvent.CLOSE, this._cl_eHistoryListCloseHandler);
		}
		
		proto._cl_persistHistory = function(){
			this._cl_dataStore.storeValue('history', this._cl_history);
		}
		
		proto.dealloc = function(){
			this.cl().removeEventListener(a5.cl.CLEvent.APPLICATION_WILL_CLOSE, this._cl_persistHistory);
			if(this._cl_historyEnabled)
				this._cl_persistHistory();
			this._cl_destroyElement(this._cl_element);
			this._cl_element = null;
			this._cl_dataStore.destroy();
		}
	});
	
a5.Package('a5.cl.ui.form').Mix('a5.cl.mixins.DataStore').Class('InputFieldDataStore', function(self){
	self.InputFieldDataStore = function(){}
});