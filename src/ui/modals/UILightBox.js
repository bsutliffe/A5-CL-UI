
/**
 * @class Presents the user with a modal lightbox style display overlay of content.
 * @name a5.cl.ui.UILightBox
 * @extends a5.cl.CLWindow
 */
a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.*',
			'a5.cl.*',
			'a5.cl.ui.events.UIMouseEvent')
	.Extends('UIModal')
	.Static(function(UILightBox, im){
		
		UILightBox.show = function(_inst){
			return UILightBox.open(_inst);
		}
		
		UILightBox.open = function(_inst){
			var inst = _inst instanceof UILightBox ? _inst : UILightBox.instance(true);
			inst.open();
			return inst;
		}
		
		UILightBox.close = function(_inst){
			var inst = _inst instanceof UILightBox ? _inst : UILightBox.instance(true);
			inst.close();
		}	
	})
	.Prototype('UILightBox', function(proto, im){
		
		this.Properties(function(){
			this._cl_bgView = null;
			this._cl_contentView = null;
			this._cl_userCanClose = true;
		})
		
		proto.UILightBox = function(){
			proto.superclass(this);
			
			this._cl_bgView = this.create(im.UIControl)
				.clickEnabled(true).backgroundColor('#000').alpha(.5);
			this._cl_contentView = this.create(im.CLViewContainer)
				.height('auto').width('auto').alignX('center').alignY('middle').backgroundColor('#fff');
		}
		
		proto.Override.draw = function(){
			proto.superclass().draw.apply(this, arguments);
			proto.superclass().backgroundColor.call(this, 'transparent');
		}
		
		proto.Override.viewReady = function(){
			proto.superclass().viewReady.apply(this, arguments);
			this.constrainChildren(true);
			this._cl_bgView.addEventListener(im.UIMouseEvent.CLICK, this._cl_eBGClickedHandler, false, this);
			this.addSubView(this._cl_bgView);
			this.addSubView(this._cl_contentView);
			this._cl_locked(true);
		}
		
		proto.userCanClose = function(value){
			if(typeof value === 'boolean'){
				this._cl_userCanClose = value;
				return this;
			}
			return this._cl_userCanClose;			
		}
		
		proto.setWidth = function(value){
			this._cl_contentView.width(value);
			return this;
		}
		
		proto.setHeight = function(value){
			this._cl_contentView.height(value);
			return this;
		}
		
		proto.contentView = function(){
			return this._cl_contentView;
		}
		
		proto.contentWidth = function(){ 
			if (arguments.length) {
				this._cl_contentView.width.apply(this._cl_contentView, arguments);
				return this;
			} else {
				return this._cl_contentView.width();
			}
		}
		
		proto.contentHeight = function(){ 
			if (arguments.length) {
				this._cl_contentView.height.apply(this._cl_contentView, arguments);
				return this;
			} else {
				return this._cl_contentView.height();
			}
		}
		
		proto.Override.backgroundColor = function(){ 
			if (arguments.length) {
				this._cl_bgView.backgroundColor.apply(this._cl_bgView, arguments);
				return this;
			} else {
				return this._cl_bgView.backgroundColor();
			} 
		}	
		
		proto.Override.alpha = function(){ 
			if (arguments.length) {
				this._cl_bgView.alpha.apply(this._cl_bgView, arguments);
				return this;
			} else {
				return this._cl_bgView.alpha();
			}
		}
		
		proto.Override.border = function(){ 
			if (arguments.length) {
				this._cl_contentView.border.apply(this._cl_contentView, arguments);
				return this;
			} else {
				return this._cl_contentView.border();
			}
		}
		
		proto._cl_eBGClickedHandler = function(e){
			if (this._cl_userCanClose) {
				e.cancel();
				this.close();
			}
		}
});

