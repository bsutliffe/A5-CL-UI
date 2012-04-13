
a5.Package('a5.cl.ui.core')
	
	.Import('a5.cl.core.Utils')
	.Extends('a5.cl.CLBase')
	.Class('ThemeManager', 'singleton', function(self, im, ThemeManager){
		var currentTheme = null,
			themables = [],
			parser;
		
		self.ThemeManager = function(){
			self.superclass(this);
			parser = this.create(im.ThemeParser);
		}
		
		self.loadTheme = function(url){
			self.cl().include(a5.cl.core.Utils.makeAbsolutePath(url), eThemeLoaded);
		}
		
		var eThemeLoaded = function(data){
			currentTheme = parser.parseTheme(data);
			for(var x = 0, y = themables.length; x < y; x++){
				themables[x]._cl_applyTheme();
			}
		}
		
		self._cl_registerThemable = function(obj){
			if(im.Utils.arrayIndexOf(themables, obj) === -1)
				themables.push(obj);
		}
		
		self._cl_deregisterThemable = function(obj){
			var idx = im.Utils.arrayIndexOf(themables, obj)
			if(idx > -1)
				themables.splice(idx, 1);
		}
		
		self._cl_applyTheme = function(obj, variant, state){
			var styles = parser.buildStyles(obj.constructor, {
				variant: variant,
				state: state,
				environment: this.cl().clientEnvironment(),
				platform: this.cl().clientPlatform(),
				orientation: this.cl().clientOrientation()
			}), prop;
			for(prop in styles){
				var spl = prop.split('_'),
					checkedProp,
					checkedObj = obj;
				if (spl.length > 1) {
					checkedProp = spl.pop();
					for (var i = 0, l = spl.length; i < l; i++) {
						if(spl[i].substr(0, 5) === 'CHILD'){
							checkedObj = checkedObj.getChildView(spl[i].substr(5));
						} else
							checkedObj = checkedObj[spl[i]]();
					}
				} else {
					checkedProp = spl[0];
				}
				if (checkedObj) {
					if (typeof checkedObj[checkedProp] === 'function') 
						checkedObj[checkedProp].apply(checkedObj, styles[prop]);
					else if (checkedObj.hasOwnProperty(checkedProp)) 
						checkedObj[checkedProp] = styles[prop][0];
				}
			}
		}
});
