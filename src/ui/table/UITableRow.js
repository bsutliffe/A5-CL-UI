
/**
 * @class Represents a row of cells within a UITableView.
 * @name a5.cl.ui.table.UITableRow
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	.Extends('UIControl')
	
	.Prototype('UITableRow', function(proto, im){
		
		this.Properties(function(){
			this._cl_viewElementType = 'tr';
			this._cl_defaultDisplayStyle = '';
		})
		
		proto.UITableRow = function(){
			proto.superclass(this);
			this._cl_cells = [];
			this.height('auto').relX(true);
			this._cl_autoHeight = true;
			
			this._cl_viewElement.style.position = 'relative';
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
		}
		
		proto.toHTML = function(){
			var tr = document.createElement('tr');
			for(var x = 0, y = this._cl_cells.length; x < y; x++){
				var td = document.createElement('td'),
					thisCell = this._cl_cells[x];
				if(thisCell instanceof a5.cl.ui.table.UITextCell)
					td.innerHTML = thisCell.text();
				tr.appendChild(td);
			}
			return tr;
		}
		
		proto.staticHeight = function(value){
			if(typeof value !== 'undefined')
				this._cl_autoHeight = value === 'auto';
			return proto.superclass().height.call(this, value);
		}
		
		/**
		 * Add a cell to the end of this row.
		 * 
		 * @param {a5.cl.ui.list.UITableCell} cell The cell to add.
		 */
		proto.addCell = function(cell){
			this.addCellAtIndex(cell, this._cl_cells.length);
		}
		
		/**
		 * Add a cell to this row, at the specified index.
		 * 
		 * @param {a5.cl.ui.list.UITableCell} cell The cell to add.
		 * @param {Number} index The index at which to add the cell.
		 */
		proto.addCellAtIndex = this.Attributes(
		["a5.Contract", {cell:'a5.cl.ui.table.UITableCell', index:'number'}], 
		function(args){
			if(args){
				this._cl_cells.splice(args.index, 0, args.cell);
				this.addSubViewAtIndex(args.cell, args.index);
			}
		})
		
		/**
		 * Remove a cell from this row.
		 * 
		 * @param {a5.cl.ui.list.UITableCell} cell The cell to remove.
		 * @return {a5.cl.ui.table.UITableCell} Returns the cell that was removed.
		 */
		proto.removeCell = function(cell){
			for(var x = 0, y = this._cl_cells.length; x < y; x++){
				var thisCell = this._cl_cells[x];
				if(thisCell === cell)
					return this.removeCellAtIndex(x);
			}
			return null;
		}
		
		/**
		 * Remove the cell at the specified index.
		 * 
		 * @param {Number} index The index of the cell to be removed.
		 * @return {a5.cl.ui.table.UITableCell} Returns the cell that was removed.
		 */
		proto.removeCellAtIndex = function(index){
			this.removeSubView(this._cl_cells[index]);
			return this._cl_cells.splice(index, 1)[0];
		}
		
		/**
		 * Retrieve the cell at the specified index.
		 * 
		 * @param {Number} index The index of the cell to retrieve.
		 */
		proto.getCellAtIndex = function(index){
			if(index < 0 || index >= this._cl_cells.length) return;
			return this._cl_cells[index];
		}
		
		/**
		 * Returns the total number of cells that are in this row.
		 */
		proto.cellCount = function(){
			return this._cl_cells.length;
		}
		
		proto.Override.addedToParent = function(parentView){
			proto.superclass().addedToParent.apply(this, arguments);
			if(!(parentView instanceof im.UITableView))
				throw 'Error: instances of UITableRow must not be added to a parent view other than an instance of UITableView.';
		}
		
		proto.Override._cl_render = function(){
			//proto.superclass()._cl_render.call(this);
			this._cl_currentViewElementProps = this._cl_pendingViewElementProps;
			this._cl_pendingViewElementProps = {};
			this.viewRedrawn();
		}
	});