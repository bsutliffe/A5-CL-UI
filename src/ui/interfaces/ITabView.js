
a5.Package('a5.cl.ui.interfaces')
	.Interface('ITabView', function(cls){
		cls.label = function(){};
		cls.activated = function(){};
		cls.deactivated = function(){};
		cls.staticWidth = function(){};
		cls.clickEnabled = function(){};
	});
