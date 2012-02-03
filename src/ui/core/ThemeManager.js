
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
			var idx = themables.indexOf(obj);
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
				if(typeof obj[prop] === 'function')
					obj[prop].apply(obj, styles[prop]);
				else if(obj.hasOwnProperty(prop))
					obj[prop] = styles[prop][0];
			}
		}
});
