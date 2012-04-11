
a5.Package('a5.cl.ui.list')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.*',
			'a5.cl.ui.core.UIUtils',
			'a5.cl.*')
	.Extends('a5.cl.ui.UIAccordionPanel')
	.Prototype('UIListItem', function(proto, im){
		
		this.Properties(function(){
			this._cl_data = null;
			this._cl_subList = null;
			this._cl_expandable = false;
			this._cl_expandedSize = 40;
			this._cl_collapsedSize = 40;
			this._cl_pendingSubList = null;
		})
		
		proto.UIListItem = function(label, data){
			proto.superclass(this);
		}
				
		proto.Override.initHandle = function(){
			//create the clickable handle
			this._cl_handle = this.create(im.UIControl)
				.clickEnabled(true)
				.usePointer(true)
				.backgroundColor('#FFF', '#CCC')
				.border(1, 'solid', '#AAA')
				.width('100%')
				.height(this._cl_collapsedSize);
			this.addSubView(this._cl_handle);
			
			var self = this;
			this._cl_handle.addEventListener(im.UIMouseEvent.CLICK, function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.SELECT]));
			});
			
			//add the label to the handle
			this._cl_labelView = this.create(im.UITextField).x(15).width('-15').alignY('middle').nonBreaking(true);
			this._cl_handle.addSubView(this._cl_labelView);
			
			//add the twisty arrow for expandable sections
			this._cl_arrow = this.create(im.CLHTMLView).width(6).height(6).x(5).alignY('middle');
			this._cl_handle.addSubView(this._cl_arrow);
		}
		
		proto.Override.childrenReady = function(){
			for(var x = 0, y = this.subViewCount(); x < y; x++){
				var thisView = this.subViewAtIndex(x);
				if (thisView instanceof a5.cl.ui.list.UIListView && !this.subList()) {
					if(this._cl_accordion)
						this.subList(thisView);
					else
						this._cl_pendingSubList = thisView;
				}
			}
		}
		
		proto.Override.addedToParent = function(parent){
			if(!this._cl_accordion && parent instanceof a5.cl.ui.list.UIListView)
				this._cl_accordion = parent;
			if (this._cl_pendingSubList) {
				this.subList(this._cl_pendingSubList);
				this._cl_pendingSubList = null;
			}
		}
		
		proto.Override.expanded = function(){
			this._cl_updateArrow();
			if(this._cl_accordion && this._cl_accordion._cl_isSubList)
				this._cl_accordion._cl_parentList._cl_updatePanels();
		}
		
		proto.Override.collapsed = function(){
			this._cl_updateArrow();
			if(this._cl_accordion && this._cl_accordion._cl_isSubList)
				this._cl_accordion._cl_parentList._cl_updatePanels();
		}
		
		proto.Override.collapsible = function(value){
			var returnVal = proto.superclass().collapsible.call(this, value);
			if(typeof value === 'boolean'){
				this._cl_handle.clickEnabled(value).usePointer(value);
			}
			return returnVal;
		}
		
		proto.data = function(value){
			if (typeof value !== 'undefined') {
				this._cl_data = value;
				return this;
			}
			return this._cl_data;
		}
		
		proto.subList = function(value){
			if(value instanceof a5.cl.ui.list.UIListView){
				this._cl_subList = value;
				this.addSubView(value);
				value._cl_isSubList = true;
				value._cl_parentList = this._cl_accordion;
				value.y(this._cl_collapsedSize)
					.x(this._cl_accordion._cl_subListIndent)
					.subListIndent(this._cl_accordion._cl_subListIndent);
				value.width((0 - value.x()) + '');
				value.handleSize(this._cl_collapsedSize);
				this._cl_expandedSize = null; //flag the expandedSize so it's calculated on the fly
				this.collapsible(!!this._cl_accordion._cl_collapsibleSubLists);
			} else if(value === null || value === false){
				this.removeSubView(this._cl_subList);
				this._cl_expandedSize = this._cl_collapsedSize;
				this._cl_subList = null;
			}
			this._cl_updateArrow();
			return this._cl_subList;
		}
		
		proto.label = function(value){
			if(typeof value === 'string'){
				this._cl_labelView.text(value);
				return this;
			}
			return this._cl_labelView.text();
		}
		
		proto.expandable = function(){
			return (this._cl_subList instanceof a5.cl.ui.list.UIListView);
		}
		
		proto.Override.expandedSize = function(value){
			if(typeof value !== 'undefined' || this._cl_expandedSize !== null)
				return proto.superclass().expandedSize.call(this, value);
			else
				return (this._cl_collapsedSize + this._cl_subList.currentHeight());
		}
		
		proto.Override.collapsedSize = function(value){
			if(typeof value === 'undefined' && this._cl_collapsedSize === null)
				return this.expandedSize();
			var returnVal = proto.superclass().collapsedSize.call(this, value);
			if(value){
				this._cl_handle.height(this._cl_collapsedSize);
				if (this._cl_subList) {
					this._cl_subList.y(this._cl_collapsedSize);
					this._cl_subList.handleSize(this._cl_collapsedSize);
				} else this._cl_expandedSize = this._cl_collapsedSize;
			}
			return returnVal;
		}
		
		proto.handle = function(){
			return this._cl_handle;
		}
		
		proto.labelView = function(){
			return this._cl_labelView;
		}
		
		proto._cl_updateArrow = function(){
			this._cl_arrow.clearHTML();
			if(this.expandable() && this.collapsible()){
				var direction = this._cl_expanded ? 'down' : 'right';
				var triangle = im.UIUtils.drawTriangle(direction, '#666', 6, 6);
				this._cl_arrow.appendChild(triangle);
			}
		}
		
		proto.dealloc = function(){
			if(this._cl_subList)
				this._cl_subList._cl_isSubList = false;
			this._cl_destroyElement(this._cl_arrow);
			this._cl_subList = this._cl_arrow = null;
		}	
});