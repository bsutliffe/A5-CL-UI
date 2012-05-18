/**
 * @class A view representing a single cell within a table.
 * @name a5.cl.ui.table.UITableCell
 * @extends a5.cl.CLViewContainer
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.*',
			'a5.cl.ui.*')
	.Extends('UIControl')
	.Prototype('UITableCell', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'td';
			this._cl_defaultDisplayStyle = '';
			this._cl_contentWrapper = this.create(im.CLViewContainer);
		})
		
		proto.UITableCell = function(){
			proto.superclass(this);
			this._cl_rowIndex = -1;
			this._cl_columnIndex = -1;
			
			//TODO: add spanning
			this._cl_rowSpan = 1;
			this._cl_colSpan = 1;
			
			this._cl_viewElement.style.padding = '0';
			this._cl_contentWrapper.width('100%').height('auto');
			//this._cl_contentWrapper._cl_defaultDisplayStyle = '';
			this._cl_viewElement.style.position = this._cl_contentWrapper._cl_viewElement.style.position = 'relative';
			this.addSubView(this._cl_contentWrapper);
			this._cl_childViewTarget = this._cl_contentWrapper;
		}
		
		proto.rowIndex = function(){
			return this._cl_rowIndex;
		}
		
		proto.columnIndex = function(){
			return this._cl_columnIndex;
		}
		
		proto.sortValue = function(){
			return 0; //default cell cannot be sorted.  Override this to enable sorting.
		}
		
		/*proto.Override.width = function(value, duration, ease){
			if(value === undefined || value === null)
				value = 'offset';
			var tempValue;
			switch(value){
				case 'offset':
					this._cl_contentWrapper._cl_viewElement.style.display = "none";
					tempValue = this._cl_viewElement.offsetWidth;
					this._cl_contentWrapper._cl_viewElement.style.display = "block";
					return tempValue;
				case 'client':
				case 'inner':
				case 'content':
					this._cl_contentWrapper._cl_viewElement.style.display = "none";
					tempValue = this._cl_viewElement.clientWidth;
					this._cl_contentWrapper._cl_viewElement.style.display = "block";
					return tempValue;
				case 'value':
					return 'auto';
				default:
					return proto.superclass().width.call(this, arguments);
			}
		}*/
		
		/*
		proto.Override._cl_render = function(){
			proto.superclass()._cl_render.call(this);
			//this._cl_viewElement.style.width = "auto";
		}*/
		
		proto.Override.padding = function(value){
			if (value !== undefined) {
				this._cl_contentWrapper.padding(value);
				return this;
			}
			return proto.superclass().padding.call(this, value);
		}
		
		/*proto.Override._cl_redraw = function(force, suppressRender){
			proto.superclass()._cl_redraw.apply(this, arguments);
		}*/
	});