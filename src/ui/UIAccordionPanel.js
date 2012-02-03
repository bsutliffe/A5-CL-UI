
/**
 * @class 
 * @name a5.cl.ui.UIAccordionView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.ui.events.*')
	.Extends('UIControl')
	.Prototype('UIAccordionPanel', function(proto, im){
		
		proto.UIAccordionPanel = function(){
			proto.superclass(this);
			this._cl_expanded = true;
			this._cl_expandedSize = 100;
			this._cl_collapsedSize = 30;
			this._cl_accordion = null;
			this._cl_collapsible = true;
			this.initHandle();
		}
		
		proto.initHandle = function(){
			var self = this;
			this.clickEnabled(true);
			this.addEventListener(im.UIMouseEvent.CLICK, function(e){
				self.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.SELECT]));
			});
		}
		
		proto.expanded = function(){
			
		}
		
		proto.collapsed = function(){
			
		}
		
		proto.isExpanded = function(){
			return this._cl_expanded;
		}
		
		proto.collapsible = function(value){
			if(typeof value === 'boolean'){
				this._cl_collapsible = value;
				return this;
			}
			return this._cl_collapsible;
		}
		
		proto.accordionView = function(){
			return this._cl_accordion;
		}
		
		proto.expandedSize = function(value){
			if (typeof value === 'number' || typeof value === 'string') {
				this._cl_expandedSize = value;
				return this;
			}
			return this._cl_expandedSize;
		}
		
		proto.collapsedSize = function(value){
			if (typeof value === 'number' || typeof value === 'string') {
				this._cl_collapsedSize = value;
				return this;
			}
			return this._cl_collapsedSize;
		}
		
		proto.location = function(){
			if(this._cl_accordion)
				return (this._cl_accordion.direction() === im.UIAccordionPanel.HORIZONTAL ? this.x() : this.y());
			else
				return 0;
		}
		
		
		proto.Override.width = function(value){
			if(typeof value !== 'number' || !this._cl_accordion || this._cl_accordion.direction() == a5.cl.ui.UIAccordionView.VERTICAL)
				return proto.superclass().width.call(this, value);
			else
				this._cl_expandedSize = value;
		}
		
		proto.Override.height = function(value){
			if(typeof value !== 'number' || !this._cl_accordion || this._cl_accordion.direction() == a5.cl.ui.UIAccordionView.HORIZONTAL)
				return proto.superclass().height.call(this, value);
			else
				this._cl_expandedSize = value;
		}
});