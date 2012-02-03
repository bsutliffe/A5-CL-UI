
a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.UIControl',
			'a5.cl.core.Utils')
	.Extends('a5.cl.CLWindow')
	.Prototype('UIContextMenuWindow', function(proto, im){
		
		proto.UIContextMenuWindow = function(){
			proto.superclass(this, arguments);
			this._cl_windowLevel = a5.cl.CLWindowLevel.CONTEXT;
			this._cl_menuView = null;
			
			var self = this;
			this._cl_globalClickHandler = function(){
				self.close();
			}
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.call(this);
			this.backgroundColor('transparent');
		}
		
		proto.menuView = function(view){
			if(view instanceof a5.cl.CLView){
				this._cl_removeMenuView();
				this.addSubView(view);
				this._cl_menuView = view;
				return this;
			} else if(view === null || view === false){
				this._cl_removeMenuView();
				return this;
			}
			return this._cl_menuView;
		}
		
		proto.open = function(mouseEvent){
			var rootView = this.cl().application().view();
			if(this._cl_menuView && mouseEvent.clientX && mouseEvent.clientY){
				var outerX = mouseEvent.clientX + this._cl_menuView.width(),
					outerY = mouseEvent.clientY + this._cl_menuView.height();
				this._cl_menuView.x(outerX > rootView.width() ? (rootView.width() - this._cl_menuView.width() - 3) : mouseEvent.clientX);
				this._cl_menuView.y(outerY > rootView.height() ? (rootView.height() - this._cl_menuView.height() - 3) : mouseEvent.clientY);
			}
			rootView.addWindow(this);
			im.Utils.addEventListener(window, 'click', this._cl_globalClickHandler);
		}
		
		proto.close = function(){
			this.cl().application().removeWindow(this, false);
			im.Utils.removeEventListener(window, 'click', this._cl_globalClickHandler);
		}
		
		proto._cl_removeMenuView = function(){
			if (this._cl_menuView)
				this.removeSubView(this._cl_menuView, false);
			this._cl_menuView = null;
		}
		
		proto._cl_eBGClickHandler = function(e){
			this.close();
		}
});
