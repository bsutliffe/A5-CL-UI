
/**
 * @class Presents the user with a modal text dialogue.
 * @name cl.mvc.ui.modals.UIAlert
 * @extends cl.mvc.ui.modals.UIModal
 */
a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.events.UIMouseEvent',
			'a5.cl.ui.buttons.UIButton',
			'a5.cl.ui.UITextField',
			'a5.cl.ui.UIContainer',
			'a5.cl.ui.UIFlexSpace')
	.Extends('UILightBox')
	.Prototype('UIAlert', function(proto, im, UIAlert){
		
		UIAlert.open = function(message, onContinue, onCancel){
			var inst = a5.Create(UIAlert);
			inst.open(message, onContinue, onCancel);
			return inst;
		}
		
		this.Properties(function(){
			this._cl_onContinue = null;
			this._cl_onCancel = null;
			this._cl_message = '';
			this._cl_callbackScope = null;
			
			this._cl_messageField = null;
			this._cl_continueButton = null;
			this._cl_cancelButton = null;
			this._cl_buttonHolder = null;
			this._cl_flexSpace = null;
		});
		
		proto.UIAlert = function(){
			proto.superclass(this);
			
			this.userCanClose(false)
				.border(1, 'solid', '#666', 5)
				.alpha(.25)
				.contentView()
					.relY(true)
					.padding(10)
					.height('auto')
					.width('100%').maxWidth(300);
			
			this._cl_messageField = this.create(im.UITextField).width('100%').height('auto').textAlign('center');
			this._cl_continueButton = this.create(im.UIButton).label("OK");
			this._cl_cancelButton = this.create(im.UIButton).label("Cancel");
			this._cl_buttonHolder = this.create(im.UIContainer).relX(true).width('100%').height('auto').y(15);
			this._cl_flexSpace = this.create(im.UIFlexSpace);
			
			this._cl_continueButton.addEventListener(im.UIMouseEvent.CLICK, this._cl_eContinueButtonHandler, false, this);
			this._cl_cancelButton.addEventListener(im.UIMouseEvent.CLICK, this._cl_eCancelButtonHandler, false, this);
		}
		
		proto.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			this._cl_contentView.addSubView(this._cl_messageField);
			this._cl_buttonHolder.addSubView(this._cl_flexSpace);
			this._cl_buttonHolder.addSubView(this._cl_cancelButton);
			this._cl_buttonHolder.addSubView(this.create(im.UIFlexSpace));
			this._cl_buttonHolder.addSubView(this._cl_continueButton);
			this._cl_buttonHolder.addSubView(this.create(im.UIFlexSpace));
			this._cl_contentView.addSubView(this._cl_buttonHolder);
		}
		
		proto.Override.open = function(message, onContinue, onCancel){
			proto.superclass().open.call(this);
			
			if(typeof message === 'string')
				this._cl_messageField.text(message);
			if(onContinue !== undefined)
				this._cl_onContinue = onContinue;
			if(onCancel !== undefined)
				this._cl_onCancel = onCancel;
			if(this._cl_onCancel === true || typeof this._cl_onCancel === 'function'){
				if(!this._cl_buttonHolder.containsSubView(this._cl_cancelButton))
					this._cl_buttonHolder.addSubViewAtIndex(this._cl_cancelButton, 0);
				if(!this._cl_buttonHolder.containsSubView(this._cl_flexSpace))
					this._cl_buttonHolder.addSubViewAtIndex(this._cl_flexSpace, 0);
			} else {
				if(this._cl_buttonHolder.containsSubView(this._cl_flexSpace))
					this._cl_buttonHolder.removeSubView(this._cl_flexSpace);
				if(this._cl_buttonHolder.containsSubView(this._cl_cancelButton))
					this._cl_buttonHolder.removeSubView(this._cl_cancelButton);
			}
		}
		
		proto.message = function(value){
			if(value !== undefined){
				this._cl_message = value;
				return this;
			}
			return this._cl_message;
		}
		
		proto.onContinue = function(value){
			if(value !== undefined){
				this._cl_onContinue = value;
				return this;
			}
			return this._cl_onContinue;
		}
		
		proto.onCancel = function(value){
			if(value !== undefined){
				this._cl_onCancel = value;
				return this;
			}
			return this._cl_onCancel;
		}
		
		proto.continueLabel = function(value){
			if(value !== undefined){
				this._cl_continueButton.label(value);
				return this;
			}
			return this._cl_continueButton.label();
		}
		
		proto.cancelLabel = function(value){
			if(value !== undefined){
				this._cl_cancelButton.label(value);
				return this;
			}
			return this._cl_cancelButton.label();
		}
		
		proto.callbackScope = function(value){
			if(value !== undefined){
				this._cl_callbackScope = value;
				return this;
			}
			return this._cl_callbackScope;
		}
		
		proto.messageField = function(){
			return this._cl_messageField;
		}
		
		proto.continueButton = function(){
			return this._cl_continueButton;
		}
		
		proto.cancelButton = function(){
			return this._cl_cancelButton;
		}
		
		proto._cl_eContinueButtonHandler = function(e){
			this.close();
			if(typeof this._cl_onContinue === 'function')
				this._cl_onContinue.call(this._cl_callbackScope);
		}
		
		proto._cl_eCancelButtonHandler = function(e){
			this.close();
			if(typeof this._cl_onCancel === 'function')
				this._cl_onCancel.call(this._cl_callbackScope);
		}
});
