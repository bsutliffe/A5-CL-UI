
/**
 * @class 
 * @name a5.cl.ui.list.UIListView
 * @extends a5.cl.ui.UIAccordionView
 */
a5.Package('a5.cl.ui.list')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.*')
	.Extends('UIAccordionView')
	.Prototype('UIListView', function(proto, im){
		
		proto.UIListView = function(){
			proto.superclass(this);
			this.direction(im.UIAccordionView.VERTICAL); //TODO: possibly make this an option
			this.fillView(false);
			this.singleSelection(false);
			this._cl_subListIndent = 15;
			this._cl_isSubList = false;
			this._cl_parentList = null;
			this._cl_collapsibleSubLists = true; 
			
			var self = this;
			this.addEventListener(im.UIEvent.SELECT, function(e){
				var targetItem = e.target();
				if(targetItem.subList() instanceof im.UIListView)
					self.dispatchEvent(self.create(im.UIListEvent, [targetItem.isExpanded() ? im.UIListEvent.ITEM_EXPANDED : im.UIListEvent.ITEM_COLLAPSED, true, targetItem]));
				else
					self.dispatchEvent(self.create(im.UIListEvent, [im.UIListEvent.ITEM_SELECTED, true, targetItem]));
				if(self._cl_isSubList)
					e.cancel();
			});
		}
		
		proto.Override.childrenReady = function(){
			this._cl_locked(true);
			proto.superclass().childrenReady.call(this);
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				thisPanel._cl_accordion = this;
				if(thisPanel._cl_subList)
					thisPanel._cl_subList._cl_parentList = this;
			}
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.list.UIListItem} listItem
		 */
		proto.addItem = function(listItem){
			this.addItemAtIndex(listItem, this.subViewCount());
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.list.UIListItem} listItem
		 * @param {Number} index
		 */
		proto.addItemAtIndex = function(listItem, index){
			if(listItem instanceof im.UIListItem){
				this._cl_locked(false);
				this.addPanel(listItem);
				this._cl_locked(true);
			}
		}
		
		/**
		 * 
		 * @param {a5.cl.ui.list.UIListItem} listItem
		 */
		proto.removeItem = function(listItem){
			if(listItem instanceof im.UIListItem){
				this._cl_locked(false);
				this.removeSubView(listItem);
				this._cl_locked(true);
			}
		}
		
		/**
		 * 
		 * @param {Number} index
		 */
		proto.removeItemAtIndex = function(index){
			this.removeItem(this.subViewAtIndex(index));
		}
		
		/**
		 * 
		 */
		proto.removeAllItems = function(){
			this._cl_locked(false);
			this.removeAllSubViews();
			this._cl_locked(true);
		}
		
		proto.currentHeight = function(){
			var h = 0;
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				h += thisPanel.isExpanded() ? thisPanel.expandedSize() : thisPanel.collapsedSize();
			}
			if(this._cl_isSubList)
				this.height(h);
			return h;
		}
		
		/**
		 * How much to indent sub-lists.
		 * @param {Number} value
		 */
		proto.subListIndent = function(value){
			if(typeof value === 'number'){
				this._cl_subListIndent = value;
				return this;
			}
			return this._cl_subListIndent;
		}
		
		/**
		 * Whether or not sub-lists can be collapsed.  If false, the parent list item will not show the twirldown arrow, and will be locked in the expanded position.
		 * @param {Boolean} value
		 */
		proto.collapsibleSubLists = function(value){
			if(typeof value === 'boolean'){
				this._cl_collapsibleSubLists = value;
				return this;
			}
			return this._cl_collapsibleSubLists;
		}
		
		proto.Override.expandAllPanels = function(recursive){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.expandPanelAtIndex(x, recursive);
			}
		}
		
		proto.Override.expandPanelAtIndex = function(index, recursive){
			var expandedPanel = proto.superclass().expandPanelAtIndex.call(this, index);
			if(recursive === true && expandedPanel && expandedPanel.subList())
				expandedPanel.subList().expandAllPanels(true);
		}
		
		proto.Override.collapseAllPanels = function(recursive){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.collapsePanelAtIndex(x, recursive);
			}
		}
		
		proto.Override.collapsePanelAtIndex = function(index, recursive){
			var collapsedPanel = proto.superclass().collapsePanelAtIndex.call(this, index);
			if(recursive === true && collapsedPanel && collapsedPanel.subList())
				collapsedPanel.subList().collapseAllPanels(true);
		}
		
		proto.dealloc = function(){
			
		}
});