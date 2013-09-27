
a5.Package('a5.cl.ui.mixins')
	
	.Import('a5.PropertyMutatorAttribute',
			'a5.cl.initializers.dom.Utils')
	.Mixin('UIDraggable', function(proto, im){
		
		this.Properties(function(){
			this._clui_dragData = null;
			this._clui_dropTargets = [];
			this._clui_dragActive = true;
		})
		
		proto.UIDraggable = function(){
		}
		
		proto.dragActive = function(val){
			if (val !== undefined) {
				this._clui_dragActive = val;
				return this;
			}
			return this._clui_dragActive;
		}
		
		proto.mixinReady = function(){
			if (this._clui_dragActive) {
				this._cl_viewElement.draggable = 'true';
				var self = this;
				im.Utils.addEventListener(this._cl_viewElement, 'ondragstart', function(e){
					e.dataTransfer.setData("instanceUID", self.instanceUID());
				});
			}
		}
		
		proto.dragData = function(value){
			if(value)
				this._clui_dragData = value;
			return this._clui_dragData;
		}
		
		proto.addDropTarget = function(target){
			if(!target.doesMix(im.UIDroppable))
				throw 'targets passed to addDropTarget on UIDraggable must mix UIDroppable.';
			else
				this._clui_dropTargets.push(target);
		}
});