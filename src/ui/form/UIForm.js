
a5.Package('a5.cl.ui.form')
	.Import('a5.cl.core.Utils',
			'a5.cl.CLMVCEvent')
	.Extends('a5.cl.CLViewContainer')
	.Prototype('UIForm', function(proto, im, UIForm){
	
		this.Properties(function(){
			this._cl_elements = [];
			this._cl_action = null;
			this._cl_method = 'POST';
			this._cl_validateOnSubmit = true;
		});
		
		proto.UIForm = function(){
			this._cl_viewElementType = 'form';
			proto.superclass(this);
			
			this.addEventListener(im.CLMVCEvent.ADDED_TO_PARENT, this._cl_eChildViewHandler, false, this);
			this.addEventListener(im.CLMVCEvent.REMOVED_FROM_PARENT, this._cl_eChildViewHandler, false, this);
		}
		
		proto.validate = function(){
			var invalid = [],
				x, y, thisElem;
			for(x = 0, y = this._cl_elements.length; x < y; x++){
				thisElem = this._cl_elements[x];
				if (!thisElem.validate()) {
					if(thisElem instanceof im.UIOptionButton && thisElem.optionGroup())
						thisElem = thisElem.optionGroup();
					if(im.Utils.arrayIndexOf(invalid, thisElem) === -1)
						invalid.push(thisElem);
				}
			}
			return invalid.length === 0 ? true : invalid;
		}
		
		proto.formTarget = function(url){
			var iframe = document.createElement('iframe'),
				targetID = this.instanceUID() + '_ifrTarget';
			iframe.src = url;
			iframe.style.display = 'none';
			iframe.name = targetID;
			this._cl_parentView._cl_viewElement.insertBefore(iframe, this._cl_viewElement);
			this._cl_viewElement.action = url;
			this._cl_viewElement.method = "post";
			this._cl_viewElement.name = this.instanceUID() + "_formName";
			this._cl_viewElement.target = targetID; 
			var submitBtn = document.createElement('input');
			submitBtn.type = 'submit';
			submitBtn.style.display = 'none';
			submitBtn.id = this.instanceUID() + "_formSubmit";
			this._cl_viewElement.appendChild(submitBtn);
			
		}
		
		proto.submitFormTarget = function(){
			document.getElementById(this.instanceUID() + "_formSubmit").click();
			//this._cl_viewElement.submit();
		}
		
		proto.getData = function(){
			var data = {},
				x, y, thisElem, optGroup;
			for(x = 0, y = this._cl_elements.length; x < y; x++){
				thisElem = this._cl_elements[x];
				if (thisElem instanceof im.UIOptionButton) {
					optGroup = thisElem.optionGroup();
					if (optGroup) 
						thisElem = optGroup;
					else {
						data[thisElem.name()] = thisElem.selected();
						continue;
					}
				}
				data[thisElem.name()] = thisElem.value();
			}
			return data;
		}
		
		proto.submit = function(onSuccess, onError){
			var validity = this._cl_validateOnSubmit ? this.validate() : true,
				data = this.getData(),
				supportsFormData = "FormData" in window;
			if(validity !== true) return validity;
			if(typeof this._cl_action === 'function'){
				this._cl_action.call(this, data);
			} else if(typeof this._cl_action === 'string'){
				a5.cl.core.RequestManager.instance().makeRequest({
					url: this._cl_action,
					method: this._cl_method,
					formData: supportsFormData,
					data: data,
					isJson: !supportsFormData,
					success: typeof onSuccess === 'function' ? onSuccess : null,
					error: typeof onError === 'function' ? onError : null
				});
			}
			return true;
		}
		
		proto.reset = function(){
			for(var x = 0, y = this._cl_elements.length; x < y; x++)
				this._cl_elements[x].reset();
		}
		
		proto.elements = function(){
			return this._cl_elements.slice(0);
		}
		
		proto.validateOnSubmit = function(value){
			if(typeof value === 'boolean'){
				this._cl_validateOnSubmit = value;
				return this;
			}
			return this._cl_validateOnSubmit;
		}
		
		/**
		 * Gets or sets the action associated with this form.
		 * If a URL is specified, the submit() method will send the form's data to that URL.
		 * If a function is specified, the submit() method will pass the form's data to that function. 
		 * @name action
		 * @param {String|Function} value The URL to send the forms' data to, or the function to call when submit() is triggered.
		 */
		proto.action = function(value){
			if(typeof value === 'string' || typeof value === 'function'){
				this._cl_action = value;
				return this;
			}
			return this._cl_action;
		}
		
		/**
		 * Gets or sets the method by which to send data on submit when a URL is specified for action. (GET or POST)
		 * @name method
		 * @param {String} value
		 */
		proto.method = function(value){
			if(typeof value === 'string'){
				this._cl_method = value.toUpperCase();
				return this;
			}
			return this._cl_method;
		}
		
		proto._cl_eChildViewHandler = function(e){
			var view = e.target(), 
				index = -1;
			if(view instanceof UIForm && view !== this){
				this.throwError("UIForms cannot be nested within other UIForms.  Consider a different view structure.");
				return;
			}
			if(view instanceof im.UIFormElement) {
				if (view.includeInParentForm()) {
					switch (e.type()) {
						case im.CLMVCEvent.ADDED_TO_PARENT:
							view._cl_form = this;
							view.addOneTimeEventListener(a5.Event.DESTROYED, this._cl_eChildViewHandler, false, this);
							this._cl_elements.push(view);
							break;
						case a5.Event.DESTROYED:
						case im.CLMVCEvent.REMOVED_FROM_PARENT:
							index = im.Utils.arrayIndexOf(this._cl_elements, view);
							if (index > -1) {
								this._cl_elements.splice(index, 1);
								view._cl_form = null;
							}
							break;
					}
				}
			} else if(view instanceof a5.cl.CLViewContainer && e.type() === im.CLMVCEvent.ADDED_TO_PARENT){
				//if the child added is a container, check its children
				for(var x = 0, y = view.subViewCount(); x < y; x++){
					view.subViewAtIndex(x).dispatchEvent(new im.CLMVCEvent(im.CLMVCEvent.ADDED_TO_PARENT));
				}
			}
		}
});
