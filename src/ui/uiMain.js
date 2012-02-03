
/** @name a5.cl.ui 
 * @namespace UI interface controllers, windows, and views. 
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */
a5.SetNamespace('a5.cl.ui');

a5.SetNamespace('a5.cl.ui.core');

/** @name a5.cl.ui.events 
 * @namespace UI interface events
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */

/** @name a5.cl.ui.form
 * @namespace UI interface form elements
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */ 

/** @name a5.cl.ui.modals
 * @namespace UI interface modal views and controllers
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */ 

/** @name a5.cl.ui.themes
 * @namespace AirFrame CL first party UI themes
 * These are not included in the AirFrame CL deployment by default and 
 * must be included separately. 
 */
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
