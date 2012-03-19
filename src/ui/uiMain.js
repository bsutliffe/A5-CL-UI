
a5.Package('a5.cl.ui')
	.Extends('a5.cl.CLAddon')
	.Class('UI', function(self, im){
		var themeManager;
		
		self.UI = function(){
			self.superclass(this);
			
			this.configDefaults({
				themeURL:null
			});
			themeManager = this.create(a5.cl.ui.core.ThemeManager);
		}
		
		self.Override.initializePlugin = function(){
			var themeURL = self.pluginConfig().themeURL;
			if(themeURL)
				a5.cl.ui.core.ThemeManager.instance().loadTheme(themeURL);
		}
				
})
