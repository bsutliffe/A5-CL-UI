
a5.Package('a5.cl.ui.mixins')
	
	.Import('a5.cl.initializers.dom.Utils')
	.Mixin('UIDroppable', function(proto, im){
		
		this.Properties(function(){
			this._clui_dropHandler = null;
		})
		
		proto.UIDroppable = function(){
		}	
		
		proto.mixinReady = function(){	
			var self = this;
			im.Utils.addEventListener(this._cl_viewElement, 'ondragover', function(e){ e.preventDefault(); });
			im.Utils.addEventListener(this._cl_viewElement, 'ondrop', function(e){
				var ref = document.getElementById(e.dataTransfer.getData("instanceUID")).a5Ref,
					isValid = false;
				if (!ref._clui_dropTargets.length) {
					isValid = true;
				} else {
					for (var i = 0, l = ref._clui_dropTargets.length; i < l; i++) {
						if(self.doesExtend(ref._clui_dropTargets[i]) || self instanceof ref._clui_dropTargets[i])
							isValid = true;
							break;
					}
				}
				if (isValid && self._clui_dropHandler) {
					self._clui_dropHandler.call(self, ref);
				}
			});		
		}	
		
		proto.setDropHandler = function(handler){
			this._clui_dropHandler = handler;
		}	
});