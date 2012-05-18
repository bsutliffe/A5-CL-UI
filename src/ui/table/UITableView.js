
/**
 * @class A table view, similar to an HTML table.
 * @name a5.cl.ui.table.UITableView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.CLView',
			'a5.cl.ui.*',
			'a5.cl.ui.events.UITableEvent')
	.Extends('UIControl')
	
	.Prototype('UITableView', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'table';
			this._cl_defaultDisplayStyle = '';
		})
		
		proto.UITableView = function(){
			proto.superclass(this);
			this._cl_rows = [];
			this._cl_cols = [];
			this._cl_header = null;
			this._cl_resizable = true;
			this._cl_defaultSortColumn = -1;
			this._cl_defaultSortDirection = im.UITableHeaderCell.ASCENDING;
			this._cl_defaultSortFunction = im.UITableHeaderCell.sortAlphaCaseInsensitive;
			this._cl_cellDividerColor = '#000';
			this._cl_cellDividerWidth = 1;
			
			this.border(1);
			this._cl_viewElement.style.borderCollapse = "collapse";
			
			this.width('100%').height('auto');//.relY(true);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			//listen for sort events
			this.addEventListener(im.UITableEvent.SORT_ROWS, this._cl_eSortHandler, true, this);
		}
		
		proto.Override.childrenReady = function(){
			proto.superclass().childrenReady.apply(this, arguments);
			//TODO: look for rows that were added by the ViewDef, and add them properly
			
		}
		
		proto._cl_eSortHandler = function(e){
			this.suspendRedraws(true);
			var rows = this._cl_rows.slice(this._cl_header ? 1 : 0);
			var columnIndex = e.headerCell().columnIndex();
			var sortFunction = e.headerCell().sortFunction();
			var sortDirection = e.sortDirection();
			if(this._cl_header){
				for(var x = 0, y = this._cl_header.cellCount(); x < y; x++){
					var thisCell = this._cl_header.getCellAtIndex(x);
					if(x === columnIndex)
						thisCell._cl_showSortArrow(sortDirection);
					else
						thisCell._cl_hideSortArrow();
				}
			}
			this._cl_sortRowArray(rows, sortFunction, columnIndex, sortDirection);
			this.removeAllRows(false, false);
			for(var x = 0, y = rows.length; x < y; x++){
				this.addRowAtIndex(rows[x], this._cl_rows.length);
			}
			this._cl_defaultSortColumn = columnIndex;
			this._cl_defaultSortFunction = sortFunction;
			this._cl_defaultSortDirection = sortDirection;
			this.suspendRedraws(false);
		}
		
		proto._cl_sortRowArray = function(rows, sortFunction, columnIndex, sortDirection){
			rows.sort(function(a, b){
				return sortFunction.call(
					null,
					a.getCellAtIndex(columnIndex).sortValue(),
					b.getCellAtIndex(columnIndex).sortValue()
				);
			});
			if(sortDirection === a5.cl.ui.table.UITableHeaderCell.DESCENDING)
				rows.reverse();
		}
		
		proto.Override._cl_redraw = function(force, suppressRender){
			//var redrawVals = proto.superclass()._cl_redraw.call(this, true, true);
			//this._cl_updateColumnWidths();
			proto.superclass()._cl_redraw.call(this, force, suppressRender);
			
			//im.CLView._cl_updateWH(this, this._cl_viewElement.offsetWidth, 'width', this.x(true), this._cl_minWidth, this._cl_maxWidth, this._cl_width);
			//im.CLView._cl_updateWH(this, this._cl_viewElement.offsetHeight, 'height', this.y(true), this._cl_minHeight, this._cl_maxHeight, this._cl_height);
			
			/*if(redrawVals.shouldRedraw){
				var autoHeights = false;
				for(var x = 0, xl = this._cl_rows.length; x < xl; x++){
					var thisRow = this._cl_rows[x];
					if(thisRow._cl_autoHeight){
						autoHeights = true;
						var maxRowHeight = 0;
						for(var y = 0, yl = thisRow.cellCount(); y < yl; y++){
							var cellHeight = thisRow.getCellAtIndex(y).height('scroll');
							if(cellHeight > maxRowHeight)
								maxRowHeight = cellHeight;
						}
						thisRow._cl_height.auto = thisRow._cl_height.percent = thisRow._cl_height.relative = false;
						thisRow._cl_height.value = maxRowHeight;
					}
				}
				if(autoHeights){
					for (var i = 0, l = this.subViewCount(); i < l; i++) 
						this.subViewAtIndex(i)._cl_redraw(true, true);
					proto.superclass()._cl_redraw.call(this, force, true);
				}
				
				if(suppressRender !== true) 
					this._cl_render();
			}*/
		}
		
		proto._cl_updateColumnWidths = function(){
			var defaultWidth = 100 / this._cl_cols.length + '%',
				thisCell, thisColummn, thisRow, x, xl, y, yl;
			for(x = 0, xl = this._cl_rows.length; x < xl; x++){
				thisRow = this._cl_rows[x];
				for(y = 0, yl = thisRow.cellCount(); y < yl; y++){
					thisCell = thisRow.getCellAtIndex(y);
					thisColummn = this._cl_cols[y];
					thisCell.width(defaultWidth);
					thisCell.border({top:x > 0 ? this._cl_cellDividerWidth : 0, left:y > 0 ? this._cl_cellDividerWidth : 0, right:0, bottom:0}, 'solid', this._cl_cellDividerColor);
				}
			}
		}
		
		/**
		 * Add a UITableHeader row to the table.  If a header has already been added, the existing header will be replaced with the new one.
		 * 
		 * @param {a5.cl.ui.table.UITableHeader} header The header row to add to the table.
		 */
		proto.addHeader = function(header){
			this.addRowAtIndex(header, 0);
		}
		
		/**
		 * Removes the header row from the table
		 * 
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 * @return {a5.cl.ui.table.UITableHeader} Returns the header that was removed.
		 */
		proto.removeHeader = function(shouldDestroy){
			this.removeRow(this._cl_header, shouldDestroy);
		}
		
		/**
		 * Retrieves the UITableHeader for this table.
		 * 
		 * @return {a5.cl.ui.table.UITableHeader} The current header for this table.
		 */
		proto.getHeader = function(){
			return this._cl_header;
		}
				
		/**
		 * Add a UITableRow to this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to add.
		 */
		proto.addRow = function(row){
			var index = this._cl_rows.length,
				rows, x, y;
			//if there's a default sort column, determine where to add the new row
			if(this._cl_defaultSortColumn >= 0 && (this._cl_defaultSortColumn < this._cl_cols.length || this._cl_defaultSortColumn < row.cellCount())){
				rows = this._cl_rows.slice(this._cl_header ? 1 : 0);
				rows.push(row);
				this._cl_sortRowArray(rows, this._cl_defaultSortFunction, this._cl_defaultSortColumn, this._cl_defaultSortDirection);
				for(x = 0, y = rows.length; x < y; x++){
					if(rows[x] === row){
						index = x;
						break;
					}
				}
			}
			this.addRowAtIndex(row, index);
		}
		
		/**
		 * Add a UITableRow to this table, at the specified index.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to add.
		 * @param {Number} index The index at which to add to the row.
		 */
		proto.addRowAtIndex = this.Attributes(
		["a5.Contract", {row:'a5.cl.ui.table.UITableRow', index:'number'}], 
		function(args){
			if(!args) return;
			var row = args.row,
				index = args.index;
			//add the row
			if(row instanceof a5.cl.ui.table.UITableHeader){
				var isHeader = true;
				index = 0;
			} else if(this._cl_header){
				index++;
			}
			this._cl_rows.splice(index, 0, row);
			this.addSubViewAtIndex(row, index);
			if(isHeader){
				if(this._cl_header)
					this.removeHeader();
				this._cl_header = row;
				for(var x = 0, y = row.cellCount(); x < y; x++){
					var thisCell = row.getCellAtIndex(x);
					if(thisCell.column())
						this._cl_cols.splice(x, 1, thisCell.column());
					else if(this._cl_cols[x])
						thisCell.column(this._cl_cols[x]);
					if(!this._cl_resizable)
						thisCell.resizable(false);
				}
			}
			//add any columns that are needed
			for(var x = this._cl_cols.length, y = row.cellCount(); x < y; x ++){
				var newCol = a5.Create(a5.cl.ui.table.UITableColumn);
				this.addColumn(newCol);
			}
			this._cl_updateColumnWidths();
		})
		
		/**
		 * Remove a row from this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRow = function(row, shouldDestroy){
			for(var x = 0, y = this._cl_rows.length; x < y; x++){
				var thisRow = this._cl_rows[x];
				if(thisRow === row)
					return this.removeRowAtIndex(x, shouldDestroy);
			}
		}
		
		/**
		 * Remove a row from this table, at the specified index.
		 * 
		 * @param {Number} index The index of the row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRowAtIndex = function(index, shouldDestroy){
			if(index < 0 || index >= this._cl_rows.length) return;
			
			this._cl_rows.splice(index, 1);
			this.removeViewAtIndex(index, shouldDestroy !== false);
		}
		
		/**
		 * Removes all of the rows from the table.  By default, the headers are not removed.  To remove the headers, set the removeHeaders parameter to true.
		 * 
		 * @param {Boolean} [removeHeaders=false] If set to true, the headers are removed as well.  Defaults to false.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeAllRows = function(removeHeaders, shouldDestroy){
			for(var x = this._cl_rows.length - 1, y = this._cl_header ? 1 : 0; x >= y; x--){
				this.removeRowAtIndex(x, shouldDestroy);
			}
			if(removeHeaders === true && this._cl_header){
				this.removeHeader(shouldDestroy);
			}
		}
		
		/**
		 * Add a column to this table. Note that this is purely informational, and does not actually add any cells.
		 * 
		 * @param {a5.cl.ui.table.UITableColumn} column The column to add.
		 */
		proto.addColumn = this.Attributes(
		["a5.Contract", {column:'a5.cl.ui.table.UITableColumn'}], 
		function(args){
			if (args) {
				if(this._cl_header && this._cl_header.getCellAtIndex(this._cl_cols.length))
					this._cl_header.getCellAtIndex(this._cl_cols.length).column(args.column);
				this._cl_cols.push(args.column);
			}
		})
		
		/**
		 * Remove a column from this table. This will remove the cells associated with the specified column.
		 * 
		 * @param {a5.cl.ui.table.UITableColumn} column The column to remove.
		 */
		proto.removeColumn = function(column){
			
		}
		
		/**
		 * Remove a column from this table, at the specified index. This will remove the cells associated with the specified column.
		 * 
		 * @param {Number} index The index of the column to remove.
		 */
		proto.removeColumnAtIndex = function(index){
			
		}
		
		
		/**
		 * Retrieve the row at the specified index.
		 * 
		 * @param {Number} index The index of the row to retrieve.
		 * @return {a5.cl.ui.table.UITableRow} The row that was retrieved.
		 */
		proto.getRowAtIndex = function(index){
			return this._cl_rows[index];
		}
		
		/**
		 * Retrieve the column at the specified index.
		 * 
		 * @param {Number} index The index of the column to retrieve.
		 * @return {a5.cl.ui.table.UITableColumn} The column that was retrieved.
		 */
		proto.getColumnAtIndex = function(index){
			return this._cl_cols[index];
		}
		
		/**
		 * Get the total number of rows in the table.
		 * 
		 * @return {Number} The total number of rows in the table.
		 */
		proto.rowCount = function(){
			return this._cl_rows.length;
		}
		
		/**
		 * Get the total number of columns in the table.
		 * 
		 * @return {Number} The total number of columns in the table.
		 */
		proto.columnCount = function(){
			return this._cl_cols.length;
		}
		
		/**
		 * Disables column resizing for all columns.
		 */
		proto.disableResize = function(){
			this._cl_resizable = false;
			if(this._cl_header){
				for(var x = 0, y = this._cl_header.cellCount(); x < y; x++){
					this._cl_header.getCellAtIndex(x).resizable(false);
				}
			}
			return this;
		}
		
		/**
		 * Allows columns to be resizable.  Note that this does not explicitly set resizable to true for any of the columns.
		 */
		proto.enableResize = function(){
			this._cl_resizable = true;
			return this;
		}
		
		/**
		 * Get or Set the default column index to sort on. Defaults to -1, which is no default sorting.
		 * 
		 * @param {Number} value The index of the column to sort on by default.
		 */
		proto.defaultSortColumn = function(value){
			if(typeof value === 'number'){
				this._cl_defaultSortColumn = Math.floor(value);
				return this;
			}
			return this._cl_defaultSortColumn;
		}
		
		/**
		 * Get or Set the default sort direction.  Defaults to ascending.
		 * 
		 * @param {Number} value The direction to sort by default.
		 */
		proto.defaultSortDirection = function(value){
			if(value === a5.cl.ui.table.UITableHeaderCell.ASCENDING || value === a5.cl.ui.table.UITableHeaderCell.DESCENDING){
				this._cl_defaultSortDirection = value;
				return this;
			}
			return this._cl_defaultSortDirection;
		}
		
		/**
		 * Get or Set the default sort function. Defaults to a case-insensitive alphabetical sort.
		 * 
		 * @param {Number} value The sort function to use.
		 */
		proto.defaultSortFunction = function(value){
			if(typeof value === 'function'){
				this._cl_defaultSortFunction = value;
				return this;
			}
			return this._cl_defaultSortFunction;
		}
	});