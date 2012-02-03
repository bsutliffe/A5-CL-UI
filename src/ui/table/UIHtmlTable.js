
a5.Package('a5.cl.ui.table')
	.Extends('a5.cl.ui.UIHTMLControl')
	.Prototype('UIHtmlTable', function(proto, im){
		
		proto.UIHtmlTable = function(){
			proto.superclass(this);
			this._cl_rows = [];
			this._cl_cols = [];
			this._cl_header = null;
			this._cl_cellDividerColor = '#000';
			this._cl_cellDividerWidth = 1;
			this._cl_table = document.createElement('table');
			this._cl_table.setAttribute('border', '1');
			this._cl_table.style.borderCollapse = "collapse";
			
			this.width('auto').height('auto');//.border(1, 'solid', '#000');
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			
			this.appendChild(this._cl_table);
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
			this.addRowAtIndex(row, this._cl_rows.length);
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
			//add the row
			if(args.row instanceof a5.cl.ui.table.UITableHeader){
				var isHeader = true;
				args.index = 0;
			} else if(this._cl_header){
				args.index++;
			}
			var rowElement = args.row.toHTML();
			if(args.index < this._cl_rows.length)
				this._cl_table.insertBefore(rowElement, this._cl_rows[args.index]);
			else
				this._cl_table.appendChild(rowElement);
			this._cl_rows.splice(args.index, 0, rowElement);
			
			this._cl_replaceNodeValue(this._cl_viewElement, this._cl_table);
		})
		
		/**
		 * Remove a row from this table.
		 * 
		 * @param {a5.cl.ui.table.UITableRow} row The row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRow = function(row){
			for(var x = 0, y = this._cl_rows.length; x < y; x++){
				var thisRow = this._cl_rows[x];
				if(thisRow === row)
					return this.removeRowAtIndex(x);
			}
		}
		
		/**
		 * Remove a row from this table, at the specified index.
		 * 
		 * @param {Number} index The index of the row to remove.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeRowAtIndex = function(index){
			if(index < 0 || index >= this._cl_rows.length) return;
			
			var removedRow = this._cl_rows.splice(index, 1)[0];
			this._cl_table.removeChild(removedRow);
		}
		
		/**
		 * Removes all of the rows from the table.  By default, the headers are not removed.  To remove the headers, set the removeHeaders parameter to true.
		 * 
		 * @param {Boolean} [removeHeaders=false] If set to true, the headers are removed as well.  Defaults to false.
		 * @param {Boolean} [shouldDestroy=true] If set to false, the rows will not be destroyed after they're removed.
		 */
		proto.removeAllRows = function(removeHeaders){
			for(var x = this._cl_rows.length - 1, y = this._cl_header ? 1 : 0; x >= y; x--){
				this.removeRowAtIndex(x);
			}
			if(removeHeaders === true && this._cl_header){
				this.removeHeader();
			}
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
		 * Get the total number of rows in the table.
		 * 
		 * @return {Number} The total number of rows in the table.
		 */
		proto.rowCount = function(){
			return this._cl_rows.length;
		}
});
