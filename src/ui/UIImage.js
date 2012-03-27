a5.Package('a5.cl.ui')
	.Static('UIScaleMode', function(UIScaleMode){
		UIScaleMode.CLIP = 'clip';
		UIScaleMode.MAINTAIN = 'maintain';
		UIScaleMode.FILL = 'fill';
		UIScaleMode.STRETCH = 'stretch';
});

/**
 * @class 
 * @name a5.cl.ui.UIImage
 * @extends a5.cl.ui.UIHTMLControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.*',
			'a5.cl.core.Utils')
	.Extends('UIHTMLControl')
	.Prototype('UIImage', function(proto, im, UIImage){
		
		this.Properties(function(){
			this._cl_isBG = false;
			this._cl_imgElement = null;
			this._cl_src = null;
			this._cl_imgHeight = 0;
			this._cl_imgWidth = 0;
			this._cl_nativeWidth = 0;
			this._cl_nativeHeight = 0;
			this._cl_scaleMode = im.UIScaleMode.CLIP;
			this._cl_imageAlignX = 'left';
			this._cl_imageAlignY = 'top';
			this._cl_imgLoaded = false;
			this._cl_pendingImgSize = false;
			this._cl_pendingFirstDraw = false;		
			this.skipViewDefReset = ['src'];
		})
		
		proto.UIImage = function(src, isBG){
			proto.superclass(this);
			if (isBG !== undefined) {
				this._cl_isBG = isBG;
			} else {
				this.width('auto').height('auto');
				this._cl_imgElement = new Image();
			}
			if(src !== undefined)
				this.src(src);
		}
		
		proto._cl_applySrc = function(){
			var self = this,
				onLoad = function(){
					self._cl_nativeWidth = self._cl_imgElement.naturalWidth || self._cl_imgElement.width;
					self._cl_nativeHeight = self._cl_imgElement.naturalHeight || self._cl_imgElement.height;
					self._cl_imgLoaded = true;
					self._cl_pendingFirstDraw = true;
					self._cl_updateImgSize();
					self._cl_imgElement.onload = self._cl_imgElement.onerror = null;
					self.drawHTML(self._cl_imgElement);
					self.redraw();
				},
				onError = function(e){
					//self.redirect(500, "UIImage Error: Error loading image at url " + self._cl_src);
					self._cl_imgElement.onload = self._cl_imgElement.onerror = null;
				};
			this._cl_imgLoaded = false;
			if (!this._cl_isBG) {
				this._cl_imgElement.style.visibility = 'hidden';
				this._cl_imgElement.style.position = 'relative';
				this._cl_imgElement.onload = onLoad;
				this._cl_imgElement.onerror = onError;
				this._cl_imgElement.src = this._cl_src ? im.Utils.makeAbsolutePath(this._cl_src) : null;
			} else {
				//console.log("url('" + this._cl_src + "')");
				this._cl_css('backgroundImage', "url('" + this._cl_src + "')");
			}
		}
		
		proto._cl_updateImgSize = function(){
			if(!this._cl_imgLoaded) return;
			var imgWidth = 0, imgHeight = 0,
				thisWidth = this.width(),
				thisHeight = this.height();
			switch(this._cl_scaleMode){
				case im.UIScaleMode.CLIP:
					imgWidth = this._cl_nativeWidth;
					imgHeight = this._cl_nativeHeight;
					break;
				case im.UIScaleMode.STRETCH:
					this._cl_imgElement.style.width = this._cl_imgElement.style.height = '100%';
					break;
				case im.UIScaleMode.MAINTAIN:
				case im.UIScaleMode.FILL:
					//if the width or height is zero, wait until next redraw
					if(thisWidth <= 0 || thisHeight <= 0){
						this._cl_pendingImgSize = true;
						return;
					}	
					var viewAspect = thisWidth / thisHeight,
						nativeAspect = this._cl_nativeWidth / this._cl_nativeHeight;
					if(isNaN(nativeAspect) || nativeAspect === Infinity)
						nativeAspect = 1;
					if(this.height('value') === 'auto' || (this._cl_scaleMode === im.UIScaleMode.FILL && viewAspect > nativeAspect && !this._cl_width.auto) || (this._cl_scaleMode === im.UIScaleMode.MAINTAIN && viewAspect < nativeAspect && !this._cl_width.auto)){
						imgWidth = thisWidth;
						imgHeight = this._cl_nativeHeight / this._cl_nativeWidth * thisWidth;
					} else {
						imgHeight = thisHeight;
						imgWidth = nativeAspect * thisHeight;
					}
					break;
			}
			if(imgWidth > 0 && imgHeight > 0){
				this._cl_imgElement.style.width = imgWidth + 'px';
				this._cl_imgElement.style.height = imgHeight + 'px';
				
				switch(this._cl_imageAlignX){
					case 'left':
						this._cl_imgElement.style.left = 0;
						break;
					case 'center':
						this._cl_imgElement.style.left = (thisWidth / 2 - imgWidth / 2) + 'px';
						break;
					case 'right':
						this._cl_imgElement.style.right = 0;
						break;
				}
				
				switch(this._cl_imageAlignY){
					case 'top':
						this._cl_imgElement.style.top = 0;
						break;
					case 'middle':
						this._cl_imgElement.style.top = (thisHeight / 2 - imgHeight / 2) + 'px';
						break;
					case 'bottom':
						this._cl_imgElement.style.bottom = 0;
						break;
				}
			}
			this._cl_pendingImgSize = false;
			//this.redraw();
		}
		
		/**
		 * 
		 * @param {String} url
		 */
		proto.src = function(src){
			if(typeof src === 'string' || src === null){
				var didChange = src !== this._cl_src;
				this._cl_src = src;
				if(didChange)
					this._cl_applySrc();
				return this;
			}
			return this._cl_src;
		}
		
		proto.tileMode = function(value){ 
			if (typeof value === 'string') {
				this._cl_css('backgroundRepeat', value);
				return this;
			}
			//return this._cl_getCSS('background-repeat');
		}
		
		proto.scaleMode = function(value){
			if(typeof value === 'string'){
				this._cl_scaleMode = value;
				this._cl_updateImgSize();
				return this;
			}
			return this._cl_scaleMode;
		}
		
		proto.imageAlignX = function(value){
			if(typeof value === 'string'){
				if(this._cl_imageAlignX !== value){
					this._cl_imageAlignX = value;
					this._cl_updateImgSize();
				}
				return this;
			}
			return this._cl_imageAlignX;
		}
		
		proto.imageAlignY = function(value){
			if(typeof value === 'string'){
				if(this._cl_imageAlignY !== value){
					this._cl_imageAlignY = value;
					this._cl_updateImgSize();
				}
				return this;
			}
			return this._cl_imageAlignY;
		}
		
		proto.nativeWidth = function(){
			return this._cl_nativeWidth;
		}
		
		proto.nativeHeight = function(){
			return this._cl_nativeHeight;
		}
		
		proto.Override.alignX = function(value){
			var returnVal = proto.superclass().alignX.apply(this, arguments);
			if(typeof value === 'string')
				this.css('textAlign', value);
			return returnVal;
		}
		
		proto.Override.width = function(value){
			var returnVal = proto.superclass().width.call(this, value);
			if((typeof value === 'number' || typeof value === 'string') && value !== 'client' && value !== 'inner' && value !== 'value' && value !== 'scroll' && value !== 'content')
				this._cl_updateImgSize();
			else if(!this._cl_isBG && value === 'scroll' || value === 'content')
				return this._cl_imgElement.scrollWidth;
				//return this._cl_width.auto ? this._cl_nativeWidth : this._cl_imgElement.scrollWidth;
			return returnVal; 
		}
		
		proto.Override.height = function(value){
			var returnVal = proto.superclass().height.call(this, value);
			if((typeof value === 'number' || typeof value === 'string') && value !== 'client' && value !== 'inner' && value !== 'value' && value !== 'scroll' && value !== 'content')
				this._cl_updateImgSize();
			else if(!this._cl_isBG && value === 'scroll' || value === 'content')
				return this._cl_imgElement.scrollHeight;
				//return this._cl_height.auto ? this._cl_nativeHeight : this._cl_imgElement.scrollHeight;
			return returnVal;
		}
		
		proto.Override._cl_redraw = function(){
			var initialRenderComplete = this._cl_initialRenderComplete,
				returnVal = proto.superclass()._cl_redraw.apply(this, arguments),
				dynamicScale = (this._cl_scaleMode === im.UIScaleMode.FILL || this._cl_scaleMode === im.UIScaleMode.MAINTAIN), 
				relativeSize = (this._cl_width.percent !== false || this._cl_height.percent !== false || this._cl_width.relative !== false || this._cl_height.relative !== false);
			if(this._cl_pendingImgSize || !initialRenderComplete || (returnVal.shouldRedraw && dynamicScale && relativeSize))
				this._cl_updateImgSize();
			if(this._cl_pendingFirstDraw)
				this._cl_imgElement.style.visibility = 'visible';
			return returnVal;
		}
		
		proto.dealloc = function(){
			this._cl_destroyElement(this._cl_imgElement);
			this._cl_imgElement = null;
		}
});
