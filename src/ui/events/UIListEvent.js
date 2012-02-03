
a5.Package('a5.cl.ui.events')

	.Extends('UIEvent')
	.Static(function(UIListEvent){
		
		UIListEvent.ITEM_SELECTED = "UI_ListItemSelected";
		
		UIListEvent.ITEM_EXPANDED = "UI_ListItemExpanded";
		
		UIListEvent.ITEM_COLLAPSED = "UI_ListItemCollapsed";
	})
	.Prototype('UIListEvent', function(proto, im){
		
		proto.UIListEvent = function($type, $bubbles, $listItem){
			proto.superclass(this, [$type, null, $bubbles])
			this._cl_listItem = $listItem;
		}
		
		proto.listItem = function(){
			return this._cl_listItem;
		}
});