
/**
 * @class The header row within a UITableView.  This is like a UITableRow, but can only contain UITableHeaderCells.
 * @name a5.cl.ui.table.UITableHeader
 * @extends a5.cl.ui.table.UITableRow
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	.Extends('UITableRow')
	
	.Prototype('UITableHeader', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'thead';
		})
		
		proto.UITableHeader = function(){
			proto.superclass(this);
		}
		
		proto.Override.toHTML = function(){
			var thead = document.createElement('thead');
			for(var x = 0, y = this._cl_cells.length; x < y; x++){
				var th = document.createElement('th'),
					thisCell = this._cl_cells[x];
				th.innerHTML = thisCell.label();
				th.style.backgroundColor = "#ddd";
				thead.appendChild(th);
			}
			return thead;
		}
		
		/**
		 * Add a header cell to the end of this header row.
		 * 
		 * @param {a5.cl.ui.list.UITableHeaderCell} cell The header cell to add.
		 */
		proto.Override.addCell = function(cell){
			this.addCellAtIndex(cell, this._cl_cells.length);
		}
		
		/**
		 * Add a header cell to this header row, at the specified index.
		 * 
		 * @param {a5.cl.ui.list.UITableHeaderCell} cell The header cell to add.
		 * @param {Number} index The index at which to add the header cell.
		 */
		proto.Override.addCellAtIndex = this.Attributes(
		["a5.Contract", {cell:'a5.cl.ui.table.UITableHeaderCell', index:'number'}], 
		function(args){
			if(args){
				this._cl_cells.splice(args.index, 0, args.cell);
				this.addSubViewAtIndex(args.cell, args.index);
				args.cell._cl_columnIndex = args.index;
			}
		})
	});