
/**
 * @class 
 * @name a5.cl.ui.UIFrameView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Import('a5.cl.*',
			'a5.cl.CLEvent')
	.Extends('UIHTMLControl')
	.Static(function(UIFrameView){
		
		UIFrameView.ALLOW_SAME_ORIGIN = "allow-same-origin";
		
		UIFrameView.ALLOW_FORMS = "allow-forms";
		
		UIFrameView.ALLOW_SCRIPTS = "allow-scripts";
	})
	.Prototype('UIFrameView', function(proto, im){
		
		proto.UIFrameView = function(){
			proto.superclass(this);
			this._cl_iframe = document.createElement('iframe');
			this._cl_iframe.frameBorder = 0;
			this._cl_iframe.style.width = this._cl_iframe.style.height = '100%';
			this._cl_url = null;
			this._cl_iframeDoc = null;
			
			this.superclass().appendChild.call(this, this._cl_iframe);
			this.cl().addEventListener(im.CLEvent.GLOBAL_UPDATE_TIMER_TICK, this._cl_checkFrameDOM, false, this);	
		}
		
		proto.iframe = function(){
			return this._cl_iframe;
		}
		
		proto._cl_checkFrameDOM = function(){
			if(this._cl_iframe.contentDocument)
		    	this._cl_iframeDoc = this._cl_iframe.contentDocument;
			else if(this._cl_iframe.contentWindow)
				this._cl_iframeDoc = this._cl_iframe.contentWindow.document;
			else if(this._cl_iframe.document)
				this._cl_iframeDoc = this._cl_iframe.document;
			if (this._cl_iframeDoc) {
				this.cl().removeEventListener(im.CLEvent.GLOBAL_UPDATE_TIMER_TICK, this._cl_checkFrameDOM);
				this.dispatchEvent('READY');
			}		
				
		}
		
		/**
		 * 
		 * @param {String} url
		 */
		proto.url = function(url){
			this._cl_iframe.src = url;
		}
		
		proto.Override.drawHTML = function(value){
			if(typeof value !== 'string'){
				var elem = document.createElement('div');
				elem.appendChild(value);
				value = elem.innerHTML;
				elem = null;
			}
			this._cl_iframeDoc.write(value);
		}
		
		proto.sandboxSettings = function(){
			args = Array.prototype.slice.call(arguments);
			if(args.length){
				var str = '';
				for (var i = 0, l = args.length; i < l; i++) {
					str += args[i];
					if(i<l-1)
						str += ' ';
				}
				this._cl_iframe.setAttribute('sandbox', str);
			} else {
				this._cl_iframe.removeAttribute('sandbox');
			}
				
		}
		
		proto.eval = function(str){
			this._cl_iframe.contentWindow.focus();
			if(this._cl_iframe.contentWindow.execScript)
				return this._cl_iframe.contentWindow.execScript(str);
			else 
				return this._cl_iframe.contentWindow.eval(str);
		}
		
		/**
		 * 
		 * @param {Boolean} value
		 */
		proto.scrolling = function(value){
			this._cl_iframe.scrolling = value ? 'auto':'no'; 
		}
		
		proto.dealloc = function(){
			this._cl_destroyElement(this._cl_iframe);
			this._cl_iframeDoc = null;
			this._cl_iframe = null;
		}
		
});