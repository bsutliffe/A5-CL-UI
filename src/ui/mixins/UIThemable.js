
/**
 * @class Mixin class for themable components.  Adds the ability to apply a theme to the view.
 * @name a5.cl.ui.mixins.UIThemable
 */
a5.Package('a5.cl.ui.mixins')
	.Import('a5.cl.ui.core.ThemeManager')
	.Mixin('UIThemable', function(proto, im){
		
		this.MustExtend('a5.cl.CLView');
		
		this.Properties(function(){
			this._cl_themeVariant = null;
			this._cl_themeState = null;
		});
		
		proto.UIThemable = function(){
			im.ThemeManager.instance()._cl_registerThemable(this);
		}
		
		proto.mixinReady = function(){
			this._cl_applyTheme();
		}
		
		proto.themeVariant = function(value){
			if(value !== undefined){
				this._cl_themeVariant = value;
				this._cl_applyTheme();
				return this;
			}
			return this._cl_themeVariant;
		}
		
		proto.themeState = function(value){
			if(value !== undefined){
				this._cl_themeState = value;
				this._cl_applyTheme();
				return this;
			}
			return this._cl_themeState;
		}
		
		proto._cl_applyTheme = function(){
			im.ThemeManager.instance()._cl_applyTheme(this, this._cl_themeVariant, this._cl_themeState);
		}
		
		proto.dealloc = function(){
			im.ThemeManager.instance()._cl_deregisterThemable(this);
		}
});
