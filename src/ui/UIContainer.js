
/**
 * @class Container for UIControls.  Allows for flexible spaces.  Either relX or relY must be true, so setting one will automatically toggle the other.
 * @name a5.cl.ui.UIContainer
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.CLViewContainer')
	.Extends('UIControl')
	.Prototype('UIContainer', function(proto, im){
		
		proto.UIContainer = function(){
			proto.superclass(this);
			this.relX(true);
			this.constrainChildren(false);
		}
		
		proto.Override.constrainChildren = function(){}
		
		proto.Override.relX = function(value){
			if(typeof value === 'boolean')
				proto.superclass().relY.call(this, !value);
			return proto.superclass().relX.call(this, value);
		}
		
		proto.Override.relY = function(value){
			if(typeof value === 'boolean')
				proto.superclass().relX.call(this, !value);
			return proto.superclass().relY.call(this, value);
		}
		
		proto.Override._cl_redraw = function(force, suppressRender){
			var returnVals = proto.superclass()._cl_redraw.call(this, force, true);
			if(returnVals.shouldRedraw){
				//if there are any UFlexSpaces, adjust their size
				var flexSpaces = [],
					relDimension = this._cl_relX ? 'width' : 'height',
					freeSpace = this['_cl_' + relDimension].inner,
					flexSize, x, y;
				//determine the amount of free space
				for(x = 0, y = this.subViewCount(); x < y; x++){
					var thisView = this.subViewAtIndex(x);
					if (thisView instanceof im.UIFlexSpace)
						flexSpaces.push(thisView)
					else
						freeSpace -= thisView['_cl_' + relDimension].offset;
					freeSpace -= thisView[this._cl_relX ? 'x' : 'y']();
				}
				if(flexSpaces.length > 0) {
					//set the sizes of the flex spaces
					flexSize = freeSpace > 0 ? (freeSpace / flexSpaces.length) : 0;
					for (x = 0, y = flexSpaces.length; x < y; x++) {
						im.CLViewContainer.prototype[relDimension].call(flexSpaces[x], flexSize);
						im.CLViewContainer.prototype[relDimension === 'width' ? 'height' : 'width'].call(flexSpaces[x], '100%');
					}
					//redraw again
					proto.superclass()._cl_redraw.call(this, true, suppressRender);
				} else if(suppressRender !== true) {
					this._cl_render();
				}
			}
			return returnVals;
		}
	});
