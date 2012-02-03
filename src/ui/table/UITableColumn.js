
/**
 * @class Represents a column within a UITableView. Note that UITableColumn is not a view, and will not be rendered.  It is used for accessing the properties of a column.
 * @name a5.cl.ui.table.UITableColumn
 */
a5.Package('a5.cl.ui.table')
	.Import('a5.cl.ui.*')
	
	.Prototype('UITableColumn', function(proto){
		
		proto.UITableColumn = function(){
			this._cl_resizable = true;
			this._cl_width = 'auto';
			this._cl_minWidth = 0;
		}
		
		proto.resizable = function(value){
			if(typeof value === 'boolean'){
				this._cl_resizable = value;
				return this;
			}
			return this._cl_resizable;
		}
		
		proto.width = function(value){
			if(typeof value === 'number' || typeof value === 'string'){
				this._cl_width = value;
				return this;
			}
			return this._cl_width;
		}
	});
