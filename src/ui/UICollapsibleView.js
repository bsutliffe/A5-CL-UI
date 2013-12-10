/**
 * @class A collapsible view container.
 * @name a5.cl.ui.UICollapsibleView
 * @extends a5.cl.CLViewContainer
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.UIControl',
			'a5.cl.ui.events.UIMouseEvent')
	.Extends('a5.cl.ui.UIControl')
	.Static(function(UICollapsibleView){
		UICollapsibleView.EXPANDED = 'uiCollapsibleView_expanded';
		UICollapsibleView.COLLAPSED = 'uiCollapsibleView_collapsed';
	})
	.Prototype('UICollapsibleView', function(proto, im, UICollapsibleView){
		
		this.Properties(function(){
			this._ui_header = null;
			this._ui_content = null;
			this._ui_collapsed = false;
		});
				
		proto.UICollapsibleView = function(startCollapsed){
			proto.superclass(this);
			this.usePointer(false);
			this.width('100%').height('auto').relX(false).relY(true);
			
			this._ui_header = new im.UIControl();
			this.addSubView(this._ui_header);
			this._ui_content = new a5.cl.CLViewContainer();
			this._ui_content.width('100%').height('auto');
			this.addSubView(this._ui_content); 
			
			this._ui_header.usePointer(true).clickEnabled(true);
			this._ui_header.addEventListener(im.UIMouseEvent.CLICK, this._ui_eClickHandler, false, this);
			
			if(startCollapsed === true)
				this.collapse();
		}
		
		proto.Override.childrenReady = function(){
			proto.superclass().childrenReady.apply(this, arguments);
			
			var viewsToMove = [],
				x, y, thisView;
			for(x = 0, y = this.subViewCount(); x < y; x++){
				thisView = this.subViewAtIndex(x);
				if(thisView != this._ui_header && thisView != this._ui_content)
					viewsToMove.push(thisView);
			}
			for(x = 0, y = viewsToMove.length; x < y; x++)
				this._ui_content.addSubView(viewsToMove[x]);
		}
		
		proto.header = function(){
			return this._ui_header;
		}
		
		proto.content = function(){
			return this._ui_content;
		}
		
		proto.expand = function(){
			this.height(this._ui_header.height() + this._ui_content.height());
			this._ui_collapsed = false;
			this.dispatchEvent(UICollapsibleView.EXPANDED);
		}
		
		proto.collapse = function(){
			this.height(this._ui_header.height());
			this._ui_collapsed = true;
			this.dispatchEvent(UICollapsibleView.COLLAPSED);
		}
		
		proto.collapsed = function(){
			return this._ui_collapsed;
		}
		
		proto._ui_eClickHandler = function(e){
			if(this._ui_collapsed)
				this.expand();
			else
				this.collapse();
		}
		
});
