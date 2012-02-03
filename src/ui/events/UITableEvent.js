
a5.Package('a5.cl.ui.events')
	.Import('a5.cl.ui.table.*')
	.Extends('UIEvent')
	.Static(function(UITableEvent){
		UITableEvent.SORT_ROWS = 'sortRows';
	})
	.Prototype('UITableEvent', function(proto, im){
		
		proto.UITableEvent = function(type, bubbles, headerCell, sortDirection){
			proto.superclass(this, [type, null, bubbles]);
			this._cl_headerCell = headerCell;
			this._cl_sortDirection = sortDirection;
		}
		
		proto.headerCell = function(){
			return this._cl_headerCell;
		}
		
		proto.sortDirection = function(){
			return this._cl_sortDirection;
		}
	});
