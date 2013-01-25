/**
 * @class Acts as a cell within a UITableHeader.
 * @name a5.cl.ui.table.UITableHeaderCell
 * @extends a5.cl.ui.UIResizable
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.*')
	.Extends('a5.cl.ui.table.UITableCell')
	.Static(function(UITableHeaderCell){
		UITableHeaderCell.ASCENDING = 'asc';
		UITableHeaderCell.DESCENDING = 'desc';
		
		UITableHeaderCell.sortAlpha = function(a, b){
			if(a === null || typeof a === 'undefined') a = "";
			if(b === null || typeof b === 'undefined') b = "";
			a = a + '';
			b = b + '';
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		};
		
		UITableHeaderCell.sortAlphaCaseInsensitive = function(a, b){
			if(a === null || typeof a === 'undefined') a = "";
			if(b === null || typeof b === 'undefined') b = "";
			a = (a + '').toLowerCase();
			b = (b + '').toLowerCase();
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		};
		
		UITableHeaderCell.sortNumeric = function(a, b){
			var returnVal = a - b;
			return (isNaN(returnVal) ? -1 : returnVal);
		}
	})
	.Prototype('UITableHeaderCell', function(proto, im, UITableHeaderCell){
		
		proto.UITableHeaderCell = function(label){
			this._cl_viewElementType = 'th';
			proto.superclass(this);
			this._cl_resizable = true;
			this._cl_sortable = false;
			this._cl_sortFunction = UITableHeaderCell.sortAlpha;
			this._cl_sortDirection = UITableHeaderCell.ASCENDING;
			this._cl_textField = new im.UITextField();
			this._cl_sortArrow = new a5.cl.CLHTMLView().width(8).height(8).alignX('right').alignY('middle').visible(false);
			this._cl_column = null;
			this._cl_columnIndex = 0;
			
			this.backgroundColor('#ddd').minWidth(5).minHeight(0).padding(3);
			
			this._cl_textField.width('100%').height('auto').alignY('middle').textAlign('center');
			this._cl_textField.addEventListener('CONTENT_UPDATED', function(e){
				this.redraw();
			}, false, this);
			if(typeof label === 'string')
				this._cl_textField.text(label);
				
			this.addSubView(this._cl_textField);
			this.addSubView(this._cl_sortArrow);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			//this.setCoordinates(['e']);
			
			this.addEventListener(im.UIMouseEvent.CLICK, function(e){
				//If we're already sorting on this column, flip the sort direction
				if(this._cl_sortArrow.visible())
					this._cl_sortDirection = (this._cl_sortDirection === UITableHeaderCell.ASCENDING ? UITableHeaderCell.DESCENDING : UITableHeaderCell.ASCENDING);
				this.dispatchEvent(new im.UITableEvent(im.UITableEvent.SORT_ROWS, false, this, this._cl_sortDirection));
			}, false, this);
		}
		
		proto._cl_showSortArrow = function(direction){
			var arrowElement = a5.cl.ui.core.UIUtils.drawTriangle(direction === UITableHeaderCell.ASCENDING ? 'up' : 'down', '#aaa', 8, 8);
			this._cl_sortArrow.clearHTML().appendChild(arrowElement);
			this._cl_sortArrow.visible(true);
			this._cl_textField.width('-5');
		}
		
		proto._cl_hideSortArrow = function(){
			this._cl_sortArrow.visible(false);
			this._cl_textField.width('100%');
		}
		
		/**
		 * Gets or sets the column associated with this header cell.
		 * 
		 * @param {a5.cl.ui.table.UITablecolumn} value The column associated with this header cell.
		 */
		proto.column = function(value){
			if(value instanceof im.UITableColumn){
				this._cl_column = value;
				return this;
			}
			return this._cl_column;
		}
		
		/**
		 * Get or set the text label for this header cell.
		 * 
		 * @param {String} value The text label for this header cell.
		 */
		proto.label = function(value){
			if(typeof value === 'string'){
				this._cl_textField.text(value);
				return this;
			}
			return this._cl_textField.text();
		}
		
		/**
		 * Get or set the function used for sorting.
		 * <br />This function follows the same rules as sort functions for Array.sort(), but should always sort in ascending order.
		 * <br />The function takes two parameters, representing two items.
		 * If the first item should come before the second, return a number >= 1.
		 * If the first item should come after the second, return a number <= -1.
		 * If the order of these items is irrelevant, return 0.
		 * 
		 * @param {Function} value The function used for sorting
		 */
		proto.sortFunction = function(value){
			if(typeof value === 'function'){
				this._cl_sortFunction = value;
				return this;
			}
			return this._cl_sortFunction;
		}
		
		/**
		 * Get or set the direction in which this column is being sorted.
		 * <br /> Possible values are a5.cl.ui.table.UITableHeaderCell.ASCENDING and a5.cl.ui.table.UITableHeaderCell.DESCENDING.
		 * 
		 * @param {string} value The direction to sort in.  Possible values are a5.cl.ui.table.UITableHeaderCell.ASCENDING and a5.cl.ui.table.UITableHeaderCell.DESCENDING.
		 */
		proto.sortDirection = function(value){
			if(value === UITableHeaderCell.ASCENDING || value === UITableHeaderCell.DESCENDING){
				this._cl_sortDirection = value;
				return this;
			}
			return this._cl_sortDirection;
		}
		
		/**
		 * Get or set whether this header cell is user-resizable.
		 * 
		 * @param {Boolean} value If true, the user can resize the column associated with this header.
		 */
		proto.resizable = function(value){
			if(typeof value === 'boolean'){
				this._cl_resizable = value;
				//proto.superclass().enabled.call(this, value);
				return this;
			}
			return this._cl_resizable;
		}
		
		/**
		 * Get or set whether this header cell allows sorting.
		 * 
		 * @param {Boolean} value If true, the user can sort the table rows by clicking on this cell.
		 */
		proto.sortable = function(value){
			if(typeof value === 'boolean'){
				this._cl_sortable = value;
				this.usePointer(value).clickEnabled(value);
				return this;
			}
			return this._cl_sortable;
		}
		
		/**
		 * Retrieves the index of the column for which this cell is a header.
		 */
		proto.Override.columnIndex = function(){
			return this._cl_columnIndex;
		}
		
		proto.Override._cl_render = function(){
			proto.superclass()._cl_render.call(this);
		}
		
		proto.Override.backgroundColor = function(value){
			return this._cl_contentWrapper.backgroundColor(value);
		}
		
		proto.dealloc = function(){
			this._cl_sortFunction = this._cl_textField = null;
		}
	});