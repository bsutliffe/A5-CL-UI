
/**
 * @class 
 * @name a5.cl.ui.UISplitViewController
 * @extends a5.cl.ui.UIController
 */
a5.Package('a5.cl.ui.controllers')

	.Import('a5.cl.ui.*')
	
	.Extends('UIController')
	.Prototype('UISplitViewController', function(proto, im){
		
		proto.UISplitViewController = function(){
			this._cl_menuView;
			this._cl_contentView;
			this._cl_menuView = this.create(im.UIResizable);
			this._cl_contentView = this.create(a5.cl.CLViewContainer);
			this._cl_menuView.width(300).minWidth(150).maxWidth(500).border(1);
			this._cl_contentView.border(1);
			proto.superclass(this, arguments);
		}
		
		proto.Override.viewReady = function(){
			this.view().relX(true);
			this.view().constrainChildren(true);
			this.view().addSubView(this._cl_menuView);
			this.view().addSubView(this._cl_contentView);
			
			var self = this;
			
			//check for a menuView or contentView added via ViewDef
			var menuView = this.view().getChildView('menuView'),
				contentView = this.view().getChildView('contentView');
			//if either was found, move them into the proper parent view
			if(menuView)
				this._cl_menuView.addSubView(menuView);
			if(contentView)
				this._cl_contentView.addSubView(contentView);
			//remove all other extraneous child views
			var viewsToRemove = [];
			for(var x = 0, y = this.view().subViewCount(); x < y; x++){
				var thisView = this.view().subViewAtIndex(x);
				if(thisView !== this._cl_contentView && thisView !== this._cl_menuView)
					viewsToRemove.push(thisView);
			}
			for(x = 0, y = viewsToRemove.length; x < y; x++){
				this.view().removeSubView(viewsToRemove[x]);
			}
			viewsToRemove = null;
		}
		
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		proto.menuView = function(){
			return this._cl_menuView;
		}
});
