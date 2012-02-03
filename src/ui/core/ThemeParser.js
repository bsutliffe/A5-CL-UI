
a5.Package('a5.cl.ui.core')
	.Import('a5.cl.mvc.core.XMLUtils',
			'a5.cl.core.Utils',
			'a5.cl.core.viewDef.ViewDefParser')
	.Extends('a5.cl.CLBase')
	.Class('ThemeParser', 'singleton', function(self, im, ThemeParser){
		ThemeParser._cl_ns = 'http://corelayerjs.com/';
		ThemeParser._cl_nsPrefix = 'cl';
		
		ThemeParser.getQualifiedClassName = function(classRef){
			return classRef.namespace().replace(/\./g, '_');
		}
		
		ThemeParser.getElementsByTagName = function(xml, tagName){
			return im.XMLUtils.getElementsByTagNameNS(xml, tagName, ThemeParser._cl_ns, ThemeParser._cl_nsPrefix);
		}
		
		var theme = null,
			imports = null;
		
		self.ThemeParser = function(){
			self.superclass(this);
		}
		
		self.parseTheme = function(rawTheme){
			theme = im.XMLUtils.parseXML(rawTheme);
			imports = im.ViewDefParser.getImports(theme);
			return theme;
		}
		
		/**
		 * Compile the styles for the given class, considering variant, state, and client environment.  Styles are inherited from parent classes.
		 * 
		 * @param {function|Object} classRef	The class (or instance) to build the styles for.
		 * @param {Object} modifiers	An object containing values for variant, state, environment, platform, or orientation.
		 */
		self.buildStyles = function(classRef, modifiers){
			var compiled = {},
				styleChain = [],
				ancestor = typeof classRef === 'function' ? classRef : classRef.constructor,
				x, prop, thisStyle;
			while(ancestor.isA5ClassDef && ancestor.isA5ClassDef()){
				styleChain.push(getClassStyles(ancestor, modifiers));
				ancestor = typeof ancestor.superclass === 'function' ? ancestor.superclass().constructor : false;
			}
			for(x = styleChain.length - 1; x >= 0; x--){
				thisStyle = styleChain[x];
				for(prop in thisStyle){
					compiled[prop] = thisStyle[prop];
				}
			}
			return compiled;
		}
		
		var getClassStyles = function(classRef, modifiers){
			var styles = classRef._cl_themeStyles || parseStyles(classRef),
				defaults = classRef.themeDefaults || {},
				compiled = {},
				prop, x, y, thisStyle;
			//apply the hard-coded defaults
			applyStyles(defaults, compiled);
			if(modifiers.state && defaults._states_ && defaults._states_[modifiers.state])
				applyStyles(defaults._states_[modifiers.state], compiled);
			//if we've loaded a theme, apply that
			if (theme) {
				//apply the theme-specific defaults
				applyVariant(styles._default_, compiled, modifiers);
				//if a variant was specified, and the theme has a matching variant, apply the variant styles
				if (modifiers.variant && styles[modifiers.variant]) 
					applyVariant(styles[modifiers.variant], compiled, modifiers);
			}
			return compiled;
		}
		
		var parseStyles = function(classRef){
			standardizeDefaults(classRef);
			if(!theme) return {};
			var styles = {},
				className = classRef.className(),
				matchingNodes, x, y, thisNode, variantAttr, parsedNode;
			if (imports[classRef.className()] !== classRef) 
				className = ThemeParser.getQualifiedClassName(classRef);
			matchingNodes = ThemeParser.getElementsByTagName(theme, className);
			styles['_default_'] = [];
			for(x = 0, y = matchingNodes.length; x < y; x++){
				thisNode = matchingNodes[x];
				parsedNode = parseNode(thisNode);
				variantAttr = im.XMLUtils.getNamedItemNS(thisNode.attributes, 'Variant', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix);
				if(variantAttr) {
					if(!styles[variantAttr.value])
						styles[variantAttr.value] = [];
					styles[variantAttr.value].push(parsedNode);
				} else 
					styles._default_.push(parsedNode);
			}
			classRef._cl_themeStyles = styles;
			return styles;
		}
		
		var parseNode = function(styleNode){
			var obj = {}, 
				x, y, thisAttr, states, thisState, stateName,
				environmentAttr = im.XMLUtils.getNamedItemNS(styleNode.attributes, 'Environment', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix),
				platformAttr = im.XMLUtils.getNamedItemNS(styleNode.attributes, 'Platform', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix),
				orientationAttr = im.XMLUtils.getNamedItemNS(styleNode.attributes, 'Orientation', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix);
			obj._environment_ = environmentAttr ? environmentAttr.value : '*';
			obj._platform_ = platformAttr ? platformAttr.value : '*';
			obj._orientation_ = orientationAttr ? orientationAttr.value : '*';
			for(x = 0, y = styleNode.attributes.length; x < y; x++){
				thisAttr = styleNode.attributes[x];
				if(im.XMLUtils.getPrefix(thisAttr) === null)
					obj[thisAttr.name] = im.ViewDefParser.processAttribute(thisAttr.value);
			}
			obj._states_ = {};
			states = im.ThemeParser.getElementsByTagName(styleNode, 'State');
			for(x = 0, y = states.length; x < y; x++){
				thisState = states[x];
				stateName = im.XMLUtils.getNamedItemNS(thisState.attributes, 'Name', ThemeParser._cl_ns, ThemeParser._cl_nsPrefix).value;
				obj._states_[stateName] = parseNode(thisState);
			}
			return obj;
		}
		
		var applyVariant = function(variant, obj, modifiers){
			for(x = 0, y = variant.length; x < y; x++){
				thisStyle = variant[x];
				//apply this style if it matches the client environment/platform/orientation
				if (styleMatchesEnvironment(thisStyle, modifiers.environment, modifiers.platform, modifiers.orientation)) {
					applyStyles(thisStyle, obj);
					//if a state was specified, and this style has a matching state, apply that as well
					if(modifiers.state && thisStyle._states_[modifiers.state])
						applyStyles(thisStyle._states_[modifiers.state], obj);
				}
			}
		}
		
		var applyStyles = function(styles, obj){
			for(var prop in styles){
				if(!isInternal(prop))
					obj[prop] = styles[prop];
			}
			return obj;
		}
		
		var isInternal = function(prop){
			return /^_(environment|platform|orientation|states|default)_$/.test(prop);
		}
		
		var styleMatchesEnvironment = function(style, environment, platform, orientation){
			var envMatch = !environment || style._environment_ === '*' || im.Utils.arrayContains(style._environment_.split('|'), environment),
				platMatch = !platform || style._platform_ === '*' || im.Utils.arrayContains(style._platform_.split('|'), platform),
				orMatch = !orientation || style._orientation_ === '*' || im.Utils.arrayContains(style._orientation_.split('|'), orientation);
			return envMatch && platMatch && orMatch;
		}
		
		var standardizeDefaults = function(classRef){
			var defaults = classRef.themeDefaults || {},
				prop;
			for(prop in defaults){
				if(!isInternal(prop) && !im.Utils.isArray(defaults[prop]))
					defaults[prop] = [defaults[prop]];
			}
		}
});
