
/**
 * @class 
 * @name a5.cl.ui.UITextField
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Extends('UIHTMLControl')
	.Prototype('UITextField', function(proto, im){
		
		proto.UITextField = function(text){
			proto.superclass(this);
			this._cl_text = "";
			this._cl_nonBreaking = false;
			this._cl_textColor = '#000';
			this._cl_textAlign = 'left';
			this._cl_textDecoration = 'none';
			this._cl_fontSize = '14px';
			this._cl_fontWeight = 'normal';
			this._cl_fontStyle = 'normal';
			this._cl_fontFamily = null;
			this._cl_formElement = null;
			this._cl_element = this.htmlWrapper();
			this.height('auto');
			this.fontFamily('Arial');
			if(typeof text === 'string')
				this.text(text);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this._cl_element.style.minHeight = '1em';
		}
		
		/**
		 * 
		 * @param {String} value
		 */
		proto.text = function(value){
			if(value !== undefined && value !== null){
				this._cl_text = String(value);
				this._cl_setText();
				return this;
			}
			return this._cl_text;
		}
		
		proto.nonBreaking = function(value){
			if(typeof value === 'boolean'){
				this._cl_nonBreaking = value;
				this._cl_setText();
				return this;
			}
			return this._cl_nonBreaking;
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.form.UIFormElement} input
		 */
		proto.isLabelFor = function(input){
			//make sure an input was passed
			if(input instanceof a5.cl.ui.form.UIFormElement){
				var inputID = null;
				inputID = input.element().id;
				this._cl_formElement = input;
				//make sure that we have a valid ID to use
				if(typeof inputID === 'string' && inputID.length > 0){
					if(this._cl_element.tagName.toUpperCase() === "LABEL"){
						//if the element is already a label, just update the 'for' param
						this._cl_element.setAttribute('for', inputID);
					} else {
						//otherwise, create a new <label> element, and copy the appropriate properties from the current element
						var label = document.createElement('label');
						label.setAttribute('for', inputID);
						label.style.cursor = 'inherit';
						label.className = this._cl_element.className;
						label.innerHTML = this._cl_element.innerHTML;
						this._cl_element.innerHTML = "";
						//add the new element
						this.appendChild(label);
						//update the element reference
						this._cl_element = label;
						label = null;
					}
				}
			}
		}
		
		proto.textColor = function(value){
			if(typeof value === 'string'){
				this._cl_textColor = this._cl_element.style.color = value;
				return this;
			}
			return this._cl_textColor;
		}
		
		proto.textAlign = function(value){
			if(typeof value === 'string'){
				this._cl_textAlign = this._cl_element.style.textAlign = value;
				return this;
			}
			return this._cl_textAlign;
		}
		
		proto.textDecoration = function(value){
			if(typeof value === 'string'){
				this._cl_textDecoration = this._cl_element.style.textDecoration = value;
				return this;
			}
			return this._cl_textDecoration;
		}
		
		proto.fontSize = function(value){
			if(typeof value === 'number')
				value = value + 'px';
			if(typeof value === 'string'){
				this._cl_fontSize = value;
				this.css('fontSize', value);
				return this;
			}
			return this._cl_fontSize;
		}
		
		proto.fontWeight = function(value){
			if(typeof value === 'string'){
				this._cl_fontWeight = value;
				this.css('fontWeight', value);
				return this;
			}
			return this._cl_fontWeight;
		}
		
		proto.fontStyle = function(value){
			if(typeof value === 'string'){
				this._cl_fontStyle = value;
				this.css('fontStyle', value);
				return this;
			}
			return this._cl_fontStyle;
		}
		
		proto.fontFamily = function(value){
			if(typeof value === 'string'){
				this._cl_fontFamily = value;
				this.css('fontFamily', value);
				return this;
			}
			return this._cl_fontFamily;
		}
		
		proto.bold = function(value){
			if(typeof value === 'boolean'){
				this.fontWeight(value ? 'bold' : 'normal');
				return this;
			}
			return this.fontWeight() === 'bold';
		}
		
		proto.italic = function(value){
			if(typeof value === 'boolean'){
				this.fontStyle(value ? 'italic' : 'normal');
				return this;
			}
			return this.fontStyle() === 'italic';
		}
		
		proto.underline = function(value){
			if(typeof value === 'boolean'){
				this.textDecoration(value ? 'underline' : 'none');
				return this;
			}
			return this.textDecoration() === 'underline';
		}
		
		/**
		 * 
		 */
		proto.element = function(){ return this._cl_element; }
		
		proto._cl_setText = function(){
			var value;
			if(this._cl_nonBreaking)
				value = this._cl_text.replace(/(\s)/gm, function(x){ return new Array(x.length + 1).join('&nbsp;') });
			else
				value = this._cl_text;
			this._cl_replaceNodeValue(this._cl_element, value);
		}
		
		proto.Override._cl_redraw = function(){
			var firstRender = !this._cl_initialRenderComplete,
				returnVal = proto.superclass()._cl_redraw.apply(this, arguments);
			if (firstRender && this._cl_text !== '' && (this._cl_width.auto || this._cl_height.auto))
				this._cl_setText(this._cl_text);
			return returnVal;
		}
		
		proto.dealloc = function(){
			if(this._cl_element !== this.htmlWrapper())
				this._cl_destroyElement(this._cl_element);
			this._cl_element = null;
		}	
});