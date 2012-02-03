
/**
 * @class Base class for all form elements.
 * @name a5.cl.ui.form.UIFormElement
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.ui.UIHTMLControl',
			'a5.cl.ui.UITextField',
			'a5.cl.core.Utils',
			'a5.cl.ui.events.UIEvent')
	.Extends('a5.cl.ui.UIControl')
	.Prototype('UIFormElement', 'abstract', function(proto, im, UIFormElement){
		
		UIFormElement.customViewDefNodes = ['Label', 'Input'];
			
		this.Properties(function(){
			this._cl_element = null;
			this._cl_inputView = this.create(im.UIHTMLControl).height('auto').width('100%').clickHandlingEnabled(false);
			this._cl_labelView = this.create(im.UITextField);
			this._cl_labelViewAdded = false;
			this._cl_required = false;
			this._cl_validation = null;
			this._cl_validateOnChange = false;
			this._cl_validateOnBlur = false;
			this._cl_value = null;
			this._cl_form = null;
			this._cl_changeEvent = this.create(im.UIEvent, [im.UIEvent.CHANGE]).shouldRetain(true);
			this._cl_validationStates = [];
			this._cl_errorColor = null;
			this._cl_defaultColor = null;
		});
		
		proto.UIFormElement = function(){
			proto.superclass(this);
			
			this.addSubView(this._cl_inputView);
			this.addEventListener(im.UIEvent.CHANGE, this._cl_eChangeEventHandler, false, this);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			this._cl_labelView.isLabelFor(this);
		}
		
		proto.name = function(value){
			if(typeof value === 'string'){
				this._cl_name = value;
				return this;
			}
			return this._cl_name || this.id().replace(/[^a-z0-9_]/gi, '');
		}
		
		proto.value = function(value){
			if(value !== undefined){
				this._cl_value = value;
				return this;
			}
			return this._cl_value;
		}
		
		proto.reset = function(){
			this.value("");
			this.validityChanged(true);
		}
		
		proto.form = function(){
			return this._cl_form;
		}
		
		/**
		 * Gets or sets the validation method, or RegExp to use when validating this field.
		 * @name validation
		 * @param value {String|RegExp|Function} The validation method, or RegExp which determines if the field has valid data.
		 */
		proto.validation = function(value){
			if(typeof value === 'string')
				value = new RegExp(value);
			if(value instanceof RegExp || typeof value === 'function'){
				this._cl_validation = value;
				return this;
			}
			return this._cl_validation;
		}
		
		proto.validateOnChange = function(value){
			if(typeof value === 'boolean'){
				this._cl_validateOnChange = value;
				return this;
			}
			return this._cl_validateOnChange;
		}
		
		proto.validateOnBlur = function(value){
			if(typeof value === 'boolean'){
				this._cl_validateOnBlur = value;
				return this;
			}
			return this._cl_validateOnBlur;
		}
		
		proto.required = function(value){
			if(typeof value === 'boolean'){
				this._cl_required = value;
				return this;
			}
			return this._cl_required;
		}
		
		proto.validate = function(){
			this._cl_validationStates = [];
			var isValid = this._cl_validate();
			if(this.required() && !this._cl_validateRequired())
				isValid = false;
			this.validityChanged(isValid);
			return isValid;
		}
		
		proto._cl_validate = function(){
			var isValid = true;
			if(this._cl_validation instanceof RegExp)
				isValid = this._cl_validation.test(this.value());
			else if(typeof this._cl_validation === 'function')
				isValid = this._cl_validation.call(this, this.value());
			if(!isValid)
				this.addValidationState(im.UIValidationStates.PATTERN_MISMATCH);
			return isValid;
		}
		
		proto._cl_validateRequired = function(){
			return true;
		}
		
		proto.validityChanged = function(isValid){
			if(this._cl_labelView)
				this._cl_labelView.textColor(isValid ? '#000' : '#f00');
		}
		
		proto.validationStates = function(){
			return this._cl_validationStates.slice(0);
		}
		
		proto.addValidationState = function(state){
			this._cl_validationStates.push(state);
		}
		
		proto._cl_eChangeEventHandler = function(e){
			if(this._cl_validateOnChange)
				this.validate();
		}
		
		proto._cl_addFocusEvents = function(elem){
			var self = this;
			im.Utils.addEventListener(elem, 'focus', function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.FOCUS, e]));
			});
			im.Utils.addEventListener(elem, 'blur', function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.BLUR, e]));
				if(self._cl_validateOnBlur)
					self.validate();
			});
		}
		
		/**
		 * Sets the label for this form element.  Can either be a string, in which case a new UITextField is created and placed within this form element.  Or a UITextField, in which case the isLabelFor() method will be called, passing this form element.
		 * 
		 * @param {a5.cl.ui.UITextField|String} value Either a string to be shown as the label, or a UITextField element that should act as the label for this form element.
		 * @param {Boolean} [labelAfterInput=false] If true, the label will be added after the input, so it will appear to the right or below the input when relX or relY is set to true.  By default, the label will be added before the input.
		 * @return {String} The text value of the UITextField acting as the label for this form element.  Or null if none was specified.
		 */
		proto.label = function(value, labelAfterInput, nonBreaking){
			if (typeof value !== 'undefined') {
				if (typeof value === 'string') {
					//if a string was passed, and the label hasn't been added, do so now
					if (!this._cl_labelViewAdded) {
						if (labelAfterInput === true) 
							this.addSubView(this._cl_labelView);
						else
							this.addSubViewBelow(this._cl_labelView, this._cl_inputView);
					}
					//update the text
					this._cl_labelView.nonBreaking(nonBreaking !== false).text(value);
				} else if (value instanceof im.UITextField) {
					//if a UITextField was passed, make it a label for this item
					this._cl_labelView = value
						.isLabelFor(this)
						.nonBreaking(nonBreaking !== false);
				}
				this._cl_labelViewAdded = true;
				return this;
			}
			return this._cl_labelView ? this._cl_labelView.text() : '';
		}
		
		/**
		 * @return {a5.cl.CLViewContainer} The CLViewContainer which contains the actual form element.  The form element is nested within this view so that a label can be grouped with it.
		 */
		proto.inputView = function(){ return this._cl_inputView; }
		
		/**
		 * @return {a5.cl.ui.UITextField} The UIInputField which is acting as the label for this form element (if there is one).
		 */
		proto.labelView = function(){ return this._cl_labelView; }
		
		proto.element = function(){
			return this._cl_element;
		}
		
		
		
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.inputViewWidth = function(value){
			if(typeof value !== 'undefined'){
				this._cl_inputView.width(value);
				return this;
			}
			return this._cl_inputView.width();
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.inputViewHeight = function(value){
			if(typeof value !== 'undefined'){
				this._cl_inputView.height(value);
				return this;
			}
			return this._cl_inputView.height();
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.labelViewWidth = function(value){
			if(typeof value !== 'undefined'){
				this._cl_labelViewWidth = value;
				if(this._cl_labelView)
					this._cl_labelView.width(value);
				return this;
			}
			return this._cl_labelView ? this._cl_labelView.width() : this._cl_labelViewWidth;
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.labelViewHeight = function(value){
			if(typeof value !== 'undefined'){
				this._cl_labelViewHeight = value;
				if(this._cl_labelView)
					this._cl_labelView.height(value);
				return this;
			}
			return this._cl_labelView ? this._cl_labelView.height() : this._cl_labelViewHeight;
		}
		
		proto.labelTextColor = function(value){
			return this._cl_labelView.textColor(value);
		}
		
		proto.labelTextAlign = function(value){
			return this._cl_labelView.textAlign(value);
		}
		
		proto.labelTextDecoration = function(value){
			return this._cl_labelView.textDecoration(value);
		}
		
		proto.labelFontSize = function(value){
			return this._cl_labelView.fontSize(value);
		}
		
		proto.labelFontWeight = function(value){
			return this._cl_labelView.fontWeight(value);
		}
		
		proto.labelFontStyle = function(value){
			return this._cl_labelView.fontStyle(value);
		}
		
		proto.labelBold = function(value){
			return this._cl_labelView.bold(value);
		}
		
		proto.labelItalic = function(value){
			return this._cl_labelView.italic(value);
		}
		
		proto.labelUnderline = function(value){
			return this._cl_labelView.underline(value);
		}
		
		
		proto.focus = function(){
			this.element().focus();
		}
		
		proto.blur = function(){
			this.element().blur();
		}
		
		/*proto.width = function(value){
			var returnVal = proto.superclass().width.call(this, value);
			if(value === 'scroll' || value === 'content'){
				var inputWidth = this._cl_inputView.width(this._cl_inputView._cl_width.auto ? 'scroll' : undefined) + this._cl_inputView.x(true),
					labelWidth = this._cl_labelView ? (this._cl_labelView.width(this._cl_labelView._cl_width.auto ? 'scroll' : undefined) + this._cl_labelView.x(true)) : 0;
				return Math.max(inputWidth, labelWidth) + this._cl_calculatedOffset.width + this._cl_calculatedClientOffset.width;
			}
			return returnVal;
		}
		
		proto.height = function(value){
			var returnVal = proto.superclass().height.call(this, value);
			if(value === 'scroll' || value === 'content'){
				var inputHeight = this._cl_inputView.height(this._cl_inputView._cl_height.auto ? 'scroll' : undefined) + this._cl_inputView.y(true),
					labelHeight = this._cl_labelView ? (this._cl_labelView.height(this._cl_labelView._cl_height.auto ? 'scroll' : undefined) + this._cl_labelView.y(true)) : 0;
				return Math.max(inputHeight, labelHeight) + this._cl_calculatedOffset.height + this._cl_calculatedClientOffset.height;
			}
			return returnVal;
		}*/
		
		proto.Override.processCustomViewDefNode = function(nodeName, node, imports, defaults, rootView){
			proto.superclass().processCustomViewDefNode.apply(this, arguments);
			switch(nodeName){
				case 'Label':
				case 'Input':
					var builder = this.create(a5.cl.core.viewDef.ViewBuilder, [this._cl_controller, node.node, defaults, imports, rootView]);
					builder.build(null, null, null, nodeName === 'Label' ? this._cl_labelView : this._cl_inputView);
					break;
			}
		}
		
		proto.dealloc = function(){
			this._cl_changeEvent.cancel();
			this._cl_changeEvent.destroy();
		}
	
});