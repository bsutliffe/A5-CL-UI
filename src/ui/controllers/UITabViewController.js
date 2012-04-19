
/**
 * @class 
 * @name a5.cl.ui.UITabViewController
 * @extends a5.cl.ui.UIController
 */
a5.Package('a5.cl.ui.controllers')
	.Import('a5.cl.ui.*',
			'a5.cl.ui.events.UIMouseEvent',
			'a5.cl.*')
	.Extends('UIController')
	.Static(function(UITabViewController){
		UITabViewController.customViewDefNodes = ['Tab'];
	})
	.Prototype('UITabViewController', function(proto, im){
		
		this.Properties(function(){
			this._cl_tabBarView = null;
			this._cl_tabBarBG = null;
			this._cl_tabBarWrapper = null;
			this._cl_contentView = null;
			this._cl_tabs = [];
			this._cl_tabViewClass = im.UIDefaultTabView;
			this._cl_activeTab = -1;
			this._cl_tabBarLocation = 'top';
			this._cl_pendingTabs = 0;
		})
		
		proto.UITabViewController = function(def){
			this._cl_tabBarView = this.create(im.CLViewContainer);
			this._cl_tabBarBG = this.create(im.CLViewContainer);
			this._cl_tabBarWrapper = this.create(im.CLViewContainer);
			this._cl_contentView = this.create(a5.cl.ui.UIFlexSpace);
			
			this._cl_tabBarWrapper.height(25);
			this._cl_tabBarView.relX(true);
			this._cl_contentView.height('-25');
			proto.superclass(this, [def || this.create(a5.cl.ui.UIContainer)]);
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.view().relY(true);
			this._cl_tabBarWrapper.addSubView(this._cl_tabBarBG);
			this._cl_tabBarWrapper.addSubView(this._cl_tabBarView);
			this.view().addSubView(this._cl_tabBarWrapper);
			this.view().addSubView(this._cl_contentView);
			this._cl_viewReady();
			/*
			var self = this;
			this.view().childrenReady = function(initial){
				//Check for views that were added by a view definition, and create tabs for them
				var viewsToMove = [];
				for(var x = 0, y = this.subViewCount(); x < y; x++){
					var thisView = this.subViewAtIndex(x);
					if (thisView !== self._cl_tabBarWrapper && thisView !== self._cl_contentView) {
						viewsToMove.push(thisView);
					}
				}
				for(var x = 0, y = viewsToMove.length; x < y; x++){
					self.addTab(viewsToMove[x]);
				}
				
				self.tabsReady(initial);
			}
			
			//override removeSubView on contentView to allow the ViewDefParser to manipulate the tabs
			this._cl_contentView.removeSubView = function(view){
				self.removeTab(view);
			}
			*/
		}
		
		proto.Override._cl_viewReady = function(){
			//TODO: This may not be the most reliable way to listen for the tabs to be added.  This should be extensively tested.
			if(this._cl_viewReadyPending)
				proto.superclass()._cl_viewReady.call(this);
			else if(this._cl_pendingTabs <= 0 && this._cl_view._cl_pendingChildren <= 0)
				this.tabsReady();
		}
		
		proto.tabsReady = function(){
			
		}
		
		proto._cl_eTabClickHandler = function(e){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.tabView === e.target())
					return this.activateTabAtIndex(x);
			}
		}
		
		/**
		 * Appends a tab.
		 * 
		 * @param {a5.cl.CLView} contentView The view to display when this tab is activated.
		 * @param {String} [tabLabel] The label for this tab. Defaults to the 'tabLabel' property on the contentView, or the string "Tab #", where # is the current number of tabs.
		 * @param {a5.cl.ui.interfaces.ITabView} [tabView] A view instance to use as the tab. (must implement ITabView). Defaults to a new instance of of this.tabViewClass().
		 */
		proto.addTab = function(contentView, tabLabel, tabView){
			this.addTabAtIndex(contentView, this.tabCount(), tabLabel, tabView);
		}
		
		/**
		 * Appends a tab at the specified index.
		 * 
		 * @param {a5.cl.CLView} contentView contentView The view to display when this tab is activated.
		 * @param {Number} index The index at which to place this tab.
		 * @param {String} [tabLabel] The label for this tab. Defaults to the 'tabLabel' property on the contentView, or the string "Tab #", where # is the current number of tabs.
		 * @param {a5.cl.ui.interfaces.ITabView} [tabView] A view instance to use as the tab. (must implement ITabView). Defaults to a new instance of of this.tabViewClass().
		 */
		proto.addTabAtIndex = this.Attributes(
		["a5.Contract", { contentView:'a5.cl.CLView', index:'number', tabLabel:'string=""', tabView:'a5.cl.ui.interfaces.ITabView=null'}], 
		function(args){	
			if(args){
				//create or get the tab
				var newTab = args.tabView || this.create(this._cl_tabViewClass);
				//keep a reference to the views
				this._cl_tabs.splice(args.index, 0, {
					tabView: newTab,
					contentView: args.contentView
				});
				//set up the tab
				newTab.label(args.tabLabel || (typeof args.contentView.tabLabel === 'string' ? args.contentView.tabLabel : ('Tab ' + this._cl_tabs.length)));
				if (newTab.staticWidth()) {
					newTab.width(newTab.staticWidth());
				} else {
					//divide the tabs evenly across the width of the tabBarView
					for(var x = 0, y = this._cl_tabs.length; x < y; x++){
						var thisTab = this._cl_tabs[x].tabView;
						thisTab.width((100 / this._cl_tabs.length) + '%');
					}
				}
				newTab.deactivated();
				newTab.clickEnabled(true);
				newTab.usePointer(true);
				newTab.addEventListener(im.UIMouseEvent.CLICK, this._cl_eTabClickHandler, false, this);
				this._cl_tabBarView.addSubViewAtIndex(newTab, args.index);
				//add the content view
				args.contentView.visible(false);
				this._cl_contentView.addSubViewAtIndex(args.contentView, args.index);
				//if no tab is active, activate this one
				if(this._cl_activeTab === -1)
					this.activateTabAtIndex(0);
			}
		})
		
		/**
		 * Removes the tab with the specified view as its content.
		 * 
		 * @param {a5.cl.CLView} contentView The content view of the tab to remove.
		 */
		proto.removeTab = function(contentView){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.contentView === contentView)
					return this.removeTabAtIndex(x);
			}
			return null;
		}
		
		/**
		 * Removes the tab at the specified index
		 * 
		 * @param {Number} index The index of the tab to remove.
		 * @param {Boolean} destroy Whether the views should be destroyed once they're removed. Defaults to true.
		 * @return {Object} Returns an object with a tabView property, and a contentView property.
		 */
		proto.removeTabAtIndex = function(index, destroy){
			if(this._cl_activeTab === index)
				this._cl_activeTab = -1;
			var dyingTab = this._cl_tabs.splice(index, 1)[0];
			dyingTab.tabView.removeEventListener(im.UIMouseEvent.CLICK, this._cl_eTabClickHandler);
			this._cl_contentView.removeSubView(dyingTab.contentView, destroy !== false);
			this._cl_tabBarView.removeSubView(dyingTab.tabView, destroy !== false);
			return destroy === false ? dyingTab : null;
		}
		
		/**
		 * Activate the tab with the specified content view.
		 * 
		 * @param {a5.cl.CLView} contentView The content view of the tab to activate.
		 * @return {a5.cl.CLView} Returns the contentView of the tab that is active after executing this method. If this doesn't match the view that was passed in, then no corresponding tab was found for that view.
		 */
		proto.activateTab = function(contentView){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.contentView === contentView)
					return this.activateTabAtIndex(x);
			}
		}
		
		/**
		 * Activate the tab at the specified index.
		 * 
		 * @param {Number} index The index of the tab to activate.
		 * @return {a5.cl.CLView} Returns the contentView of the tab that was selected, or null if an invalid index was specified.
		 */
		proto.activateTabAtIndex = function(index){
			if(index < 0 || index >= this._cl_tabs.length) return null;
			
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				var isActive = x === index;
				thisTab.contentView.visible(isActive);
				thisTab.contentView.suspendRedraws(!isActive);
				if (isActive) {
					thisTab.tabView.activated();
					this._cl_activeTab = x;
				} else {
					thisTab.tabView.deactivated();
				}
			}
			this.view().redraw();
			return this._cl_tabs[this._cl_activeTab].contentView;
		}
		
		/**
		 * Gets a reference to the tab at the specified index.
		 * 
		 * @param {Number} index The index of the tab to retrieve.
		 * @param {Boolean=false} [getTabView] If true, the tabView and the contentView are returned.  Otherwise, just the contentView is returned.
		 * @return {a5.cl.CLView|Object} If getTabView is true, an object with contentView and tabView properties is returned, otherwise the contentView instance is returned.
		 */
		proto.getTabAtIndex = function(index, getTabView){
			if(index < 0 || index >= this._cl_tabs.length) return null;
			return getTabView === true ? this._cl_tabs[index].tabView : this._cl_tabs[index].contentView;
		}
		
		proto.getTabByLabel = function(label, getTabView){
			for(var x = 0, y = this._cl_tabs.length; x < y; x++){
				var thisTab = this._cl_tabs[x];
				if(thisTab.tabView.label() === label)
					return getTabView === true ? thisTab.tabView : thisTab.contentView;
			}
			return null;
		}
		
		/**
		 * The location of the tab bar.  Acceptable values are 'top' and 'bottom'. The default is 'top'.
		 * 
		 * @param {String} [value] Where to place the tab bar ('top' or 'bottom').
		 * @return {String|a5.cl.ui.controllers.UITabViewController} Returns the current value of tabBarLocation if no value is specified.  Otherwise, returns this instance to allow chaining.
		 */
		proto.tabBarLocation = function(value){
			if(typeof value === 'string'){
				if((value === 'top' || value === 'bottom') && value !== this._cl_tabBarLocation){
					if(value === 'bottom')
						this._cl_tabBarWrapper.toTop();
					else
						this._cl_tabBarWrapper.toBottom();
				}
				return this;
			}
			return this._cl_tabBarLocation;
		}
		
		/**
		 * The height of the tab bar.
		 * 
		 * @param {Number|String} [value] The value to set the height of the tab bar to.
		 */
		proto.tabBarHeight = function(value){
			if(typeof value === 'number' || typeof value === 'string'){
				this._cl_tabBarWrapper.height(value);
				return this;
			}
			return this._cl_tabBarWrapper.height();
		}
		
		/**
		 * Returns the contentView of the currently active tab, or null if no tab is currently active.
		 */
		proto.activeContentView = function(){
			return this._cl_activeTab >= 0 ? this._cl_tabs[this._cl_activeTab].contentView : null;
		}
		
		/**
		 * Returns the total number of tabs.
		 */
		proto.tabCount = function(){
			return this._cl_tabs.length;
		}
		
		/**
		 * Returns the view which holds the content views.
		 */
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		/**
		 * Returns the view which holds the tab views.
		 */
		proto.tabBar = function(){
			return this._cl_tabBarWrapper;
		}
		
		proto.tabBarBG = function(){
			return this._cl_tabBarBG;
		}
		
		/**
		 * The class to use when creating new tab views.  This class must implement ITabView.  The default is UIDefaultTabView.
		 * @param {function} [value] The class to use when creating new tab views.
		 */
		proto.tabViewClass = function(value){
			if(typeof value === 'function'){
				this._cl_tabViewClass = value;
				return this;
			}
			return this._cl_tabViewClass;
		}
		
		/**
		 * Shortcut to this.contentView().scrollXEnabled().
		 */
		proto.scrollXEnabled = function(){
			this._cl_contentView.scrollXEnabled.apply(this._cl_contentView, arguments);
		}
		
		/**
		 * Shortcut to this.contentView().scrollYEnabled().
		 */
		proto.scrollYEnabled = function(){
			this._cl_contentView.scrollYEnabled.apply(this._cl_contentView, arguments);
		}
		
		/**
		 * @private
		 */
		proto.Override.processCustomViewDefNode = function(nodeName, node, imports, defaults, rootView){
			if(nodeName === 'Tab'){
				var children = a5.cl.mvc.core.XMLUtils.children(node.node);
				if(children.length > 0) {
					var builder = this.create(a5.cl.core.viewDef.ViewBuilder, [this, children[0], defaults, imports, rootView]),
						targetIndex = this.tabCount();
					this._cl_pendingTabs++;
					builder.build(function(view){
						this.addTabAtIndex(view, targetIndex, node.label);
						this._cl_pendingTabs--;
					}, null, this);
				}
			} else
				proto.superclass().processCustomViewDefNode.apply(this, arguments);
		}
});
