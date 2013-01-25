a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	.Extends('UITableCell')
	
	.Prototype('UITextCell', function(proto, im){
		
		proto.UITextCell = function(text){
			proto.superclass(this);
			this._cl_textField = new im.UITextField().width('100%').height('auto').alignY('middle');
			this._cl_textField.addEventListener('CONTENT_UPDATED', function(e){
				this.redraw();
			}, false, this);
			if(typeof text === 'string')
				this._cl_textField.text(text);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.addSubView(this._cl_textField);
		}
		
		proto.text = function(value){
			if (value !== undefined) {
				this._cl_textField.text(value + '');
				return this;
			}
			return this._cl_textField.text();
		}
		
		proto.Override.sortValue = function(){
			return this.text();
		}
		
		proto.textField = function(){
			return this._cl_textField;
		}
		
		proto.dealloc = function(){
			this._cl_textField = null;
		}
	});