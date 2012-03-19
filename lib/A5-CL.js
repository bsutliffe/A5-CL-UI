//A5, Copyright (c) 2011, Jeff dePascale & Brian Sutliffe. http://www.jeffdepascale.com
(function( window, undefined ) {//A5, Copyright (c) 2011, Jeff dePascale & Brian Sutliffe. http://www.jeffdepascale.com
(function( window, undefined ) {(function(){
	
	var windowItemList = null,
	
	GetNamespace = function(namespace, imports, allowGenericReturns){
		var splitNM, i, l, context;
		if(!namespace)
			return null;
		allowGenericReturns = allowGenericReturns || false;
		if(typeof namespace === 'object')
			return namespace;
		splitNM = namespace.split('.');
		context = window;
		if(splitNM.length === 1 && imports && imports[namespace])
			return imports[namespace];
		for(i= 0, l=splitNM.length; i<l; i++){
			context = context[splitNM[i]];
			if(context === undefined) return null;
		}
		if(allowGenericReturns || context.namespace !== undefined)
			return context;
		return null;
	},
	SetNamespace = function(namespace, arg1, arg2){
		var hasBool = typeof arg1 === 'boolean',
			autoCreate = hasBool ? arg1:false,
			splitNM,
			placedObject = (hasBool ? arg2:arg1) || {},
			splitNM = namespace.split('.'),
			property = splitNM.pop(),
			object;
		if(!namespace.match(/^[A-Za-z0-9.]*$/))
			return a5.ThrowError(100, null, {namespace:namespace});
		object = splitNM.length ? _af_objectQualifier(splitNM) : window
		
		if (object[property] !== undefined)
			return object[property]; 
		return object[property] = autoCreate ? new placedObject() : placedObject;
	},	
	
	_af_objectQualifier = function(nmArr){
		var context = window,
			i, l;
		for(i = 0, l=nmArr.length; i<l; i++){
			if(!context[nmArr[i]]) context[nmArr[i]] = {};
			context = context[nmArr[i]];
		}
		return context;
	},
	
	TrackWindowStrays = function(){
		windowItemList = {};
		for(var prop in window)
			windowItemList[prop] = '';
	},
	
	GetWindowStrays = function(purge){
		if(!windowItemList)
			a5.ThrowError(101);
		else {
			var retList = [], prop
			for(prop in window)
				if(windowItemList[prop] === undefined)
					retList.push(prop);
			if(purge === true)
				TrackWindowStrays();
			return retList;
		}	
	}
	
	/**
	 * @name a5
	 * @namespace Houses all classes and OOP methods in the A5 model. 
	 */
	window.a5 = {
		/**#@+
	 	 * @memberOf a5
	 	 * @function
		 */
		
		/**
		 * @name version
		 * @type String
		 * @returns The version number of A5.
		 */
		version:function(){
			return  '0.5.{BUILD_NUMBER}';
		},
		/**
		 * @name buildDate
		 * @type String
		 * @returns The build date of the release of A5.
		 */
		buildDate:function(){
			return '{BUILD_DATE}';
		},
		
		/**
		 * @name isStableRelease
		 * @type String
		 * @returns The build date of the release of A5.
		 */
		isStableRelease:function(){
			return false;
		},
		
		/**
		 * @name releaseType
		 * @type String
		 * @returns Release type of A5.
		 */
		releaseType:function(){
			return 'alpha';
		},
		
		/**
		 * @name isPublicRelease
		 * @type Boolean
		 * @returns Whether the build is a public release or ongoing development build.
		 */
		isPublicRelease:function(){
			return false;
		},
		
		/**
		 * @name versionInfo
		 * @type String
		 * @returns A string containing version info for A5, comprised of all version related release properties.
		 */
		versionInfo:function(){
			return ('A5 - version ' + this.version() + ', ' + this.releaseType() + ', ' + this.buildDate() + '. ' + (this.isPublicRelease() ? 'Public release':'Development build') + '. ' + (this.isStableRelease() ? 'Stable release':'Unstable release') + '.');
		},
		
		/**
		 * Returns a class declaration for a given namespace string.
		 * @name GetNamespace
		 * @param {String} namespace
		 */
		GetNamespace:GetNamespace,
		
		/**
		 * Places a function or object in the specified namespace. If the namespace does not exist it is created.
		 * @name SetNamespace
		 * @param {String} namespace
		 * @param {Object|Function} placedObject
		 */
		SetNamespace:SetNamespace,
		
		TrackWindowStrays:TrackWindowStrays,
		
		GetWindowStrays:GetWindowStrays,
		
		/**
		 * @name CreateGlobals
		 */
		CreateGlobals:function(){
			window.Create = a5.Create;
			window.Package = a5.Package;
			window.GetNamespace = a5.GetNamespace;
			window.SetNamespace = a5.SetNamespace;
			window.ThrowError = a5.ThrowError; 
		}
	}
})();


a5.SetNamespace('a5.core.reflection', true, function(){
	
	var proxyMethods = {
		getName:function(){	return this._a5_methodName;	},
		getClass:function(){ return this._a5_ownerClass; },
		getClassInstance:function(){ return this._a5_ownerInstance; },
		getAttributes:function(){ return this._a5_attributes ? this._a5_attributes : null; }
	},
	
	setReflection = function(cls, clsInstance, method, obj){
		obj = obj || clsInstance[method];
		obj._a5_ownerInstance = clsInstance;
		obj._a5_ownerClass = cls;
		obj._a5_methodName = method;
		obj.getName = proxyMethods.getName;
		obj.getClass = proxyMethods.getClass;
		obj.getClassInstance = proxyMethods.getClassInstance;
		obj.getAttributes = proxyMethods.getAttributes;
	}
	
	return {
		setReflection:setReflection
	}
});


a5.SetNamespace('a5.core.attributes', true, function(){
	
	createAttribute = function(scope, args){
		var attributes = Array.prototype.slice.call(args),
			method, i, j, k, l, t,
			attrObj = {};
		if(!attributes.length)
			return a5.ThrowError(305);
		method = typeof attributes[attributes.length-1] === 'function' ? attributes.pop() : null;
		if(method !== null && typeof method !== 'function')
			return a5.ThrowError(300);
		if (!attributes.length)
			return a5.ThrowError(301);
		for(i = 0, l = attributes.length; i<l; i++){
			var attrDef = attributes[i];
			if(Object.prototype.toString.call(attrDef) !== '[object Array]')
				return a5.ThrowError(302);
			for(j = 0, k = attrDef.length; j <k; j++){
				var attr = attrDef[j],
					t = typeof attr;
				if(j == 0){
					var isError = false;
					if(t !== 'string'){
						if(t === 'function'){
							if(!attr.isA5 || !attr.doesExtend(a5.Attribute))
								isError = true;
						} else
							isError = true;
					} else {
						var cls = a5.GetNamespace(attr, scope.imports());
						if(!cls)
							cls = a5.GetNamespace(attr + 'Attribute', scope.imports());
						if(cls)
							attrDef[j] = cls;
						else
							isError = true;
					}
					if(isError)
						return a5.ThrowError(303);
				} else {
					if(t !== 'object' || Object.prototype.toString.call(attr) === '[object Array]')
						return a5.ThrowError(304);
				}
				//validate all arrays, length at least one, first is string, all remaining are objects, not arrays
			}
		}
		for (i = 0, l = attributes.length; i < l; i++) {
			var arr = attributes[i],
				vals = [];
			for(var j = 1, k = arr.length; j<k; j++)
				vals.push(arr[j]);
			attributes[i] = [arr[0], vals];
			attrObj[arr[0].className()] = vals;
		}
		attrObj.wrappedMethod = method;
			
		var proxyFunc = function(){
			var callOriginator,
				prop,
				attrClasses = [], 
				executionScope = this,
				callOriginator,
				count = 0;
			if(method)
				for(var prop in proxyFunc)
					method[prop] = proxyFunc[prop];
			if (proxyFunc.caller.getClassInstance !== undefined)
				callOriginator = proxyFunc.caller;
			for(var i = 0, l = attributes.length; i<l; i++){
				var cls = attributes[i][0],
					clsInst = cls.instance(true),
					props = attributes[i][1];
				attrClasses.push({cls:clsInst, props:props});
			}
			
			var processCB = function(args, isPost, preArgs){
				processAttribute(count, args, isPost, preArgs);
			},
			
			processAttribute = function(id, args, isPost, preArgs){
				if (args) {
					if (Object.prototype.toString.call(args) !== '[object Array]') 
						args = [args];
				} else {
					args = [];
				}
				if(!preArgs)
					preArgs = args;
				if (id >= attrClasses.length) {
					if (isPost) {
						return args[0];
					} else 						
						return processPost(args, preArgs);
				}
				var ret, 
					isPost = isPost || false,
					isAsync = false,
					callback = function(_args){
						processCB.call(this, _args || args, isPost, preArgs);	
					}	
					ret = attrClasses[id].cls["method" + (isPost ? "Post" : "Pre")](attrClasses[id].props, args, executionScope, proxyFunc, callback, callOriginator, preArgs);
				if (ret !== null && ret !== undefined) {
					switch(ret){
						case a5.Attribute.SUCCESS:
							ret = args;
							break;
						case a5.Attribute.ASYNC:
							isAsync = true;
							break;
						case a5.Attribute.RETURN_NULL:
							ret = null;
							break;
						case a5.Attribute.FAILURE:
							return;
					}
				} else
					return a5.ThrowError(308, null, {prop:prop, method:isPost ? 'methodPost' : 'methodPre'});
				count = id+1;
				if(!isAsync)
					return processAttribute(count, ret, isPost, args, preArgs);
			},
			
			processPost = function(args, preArgs){
				count = 0;
				var postRet = method ? method.apply(executionScope, args) : args.length ? args[0] : undefined;
				return processAttribute(0, postRet, true, preArgs);
			},		
			
			preRet = processAttribute(count, Array.prototype.slice.call(arguments));
			return preRet;
		}
		proxyFunc._a5_attributes = attrObj;
		return proxyFunc;
	},
	
	createAttribs = function(){
		for(i = 0, l=a5.Attribute._extenderRef.length; i<l; i++)
			a5.Create(a5.Attribute._extenderRef[i]);
	},
	
	processInstance = function(cls){
		var attrs = cls.getClass().getAttributes();
		//process instanceProcess, return
		return cls;
	}
	
	return {
		createAttribute:createAttribute,
		processInstance:processInstance
	}
});


a5.SetNamespace('a5.core.classBuilder', true, function(){
	
	var packageQueue = [],
		delayProtoCreation = false,
		queuedPrototypes = [],
		queuedImplementValidations = [],
		prop;
	
	Create = function(classRef, args){
		var ref, retObj;
		if (typeof classRef === 'string'){
			ref = a5.GetNamespace(classRef);
			if (ref === null)
				return a5.ThrowError(207, null, {className:classRef});
		} else
			ref = classRef;
		if (typeof ref !== 'function')
			return a5.ThrowError(207, null, {className:classRef});
		if(ref.isInterface())
			return a5.ThrowError(208, null, {nm:ref.namespace()});
		try {
			retObj = new ref();
		}catch (e){
			return a5.ThrowError(209, null, {nm:typeof classRef === 'string' ? classRef:(classRef.namespace ? classRef.namespace():''), errorStr:e});
		}
		if (ref._a5_clsDef) 
			processDeclaration(ref._a5_clsDef, retObj, retObj, ref.imports(), ref)
		//else
			//TODO: throw error, invalid class declaration
		retObj._a5_initialize(args);
		return retObj;
	},
	
	processDeclaration = function(owner, scope, obj, imports, stRef, isProto){
		if (isProto) {
			scope.Properties = function(propFunc){
				obj.constructor._a5_protoProps = propFunc;
			}
			scope.PrivateProperties = function(propFunc){
				obj.constructor._a5_protoPrivateProps = propFunc;
				return function(instance){
					return instance._a5_privatePropsRef[obj.namespace()];
				}
			}
		}
		scope.Attributes = function(){
			return a5.core.attributes.createAttribute.call(obj, scope, arguments);
		}
		obj.Override = {};
		obj.Final = {};
		owner.call(scope, obj, imports, stRef);
		a5.core.mixins.initializeMixins(obj);
		processMethodChangers(obj);
		for (prop in obj) {
			if (({}).hasOwnProperty.call(obj, prop) && typeof obj[prop] === 'function' && a5.core.classProxyObj[prop] === undefined) {
				if (prop === obj.className()) {
					obj.constructor._a5_instanceConst = obj[prop];
					a5.core.reflection.setReflection(stRef, obj, prop, obj.constructor._a5_instanceConst);
					delete obj[prop];
				} else {
					a5.core.reflection.setReflection(stRef, obj, prop);
				}
			}
		}
		delete obj.Final;
		delete obj.Override;
		delete scope.Attributes;
		
		if(isProto){
			delete scope.Properties;
			delete scope.PrivateProperties;
		}
	},
	
	processMethodChangers = function(obj){
		var sc = obj.superclass(),
			mixinRef = obj.constructor._a5_mixedMethods;
		if(!sc)
			sc = {};
		for(prop in obj){
			if(obj.hasOwnProperty(prop) && typeof obj[prop] === 'function'){
				if (prop !== 'Final' && prop !== 'Override' && prop !== 'constructor' && prop !== 'prototype' && prop !== 'dealloc' && prop !== '_a5_initialized') {
					if (sc[prop] && sc[prop].toString().indexOf('[native code]') === -1){
						if(sc[prop].Final == true)
							return a5.ThrowError(201, null, {prop:prop, namespace:obj.namespace()});
						return a5.ThrowError(200, null, {prop:prop, namespace:obj.namespace()});
					} else {
						var mixMethod = mixinRef[prop];
						if (mixinRef[prop] !== undefined && mixMethod !== obj[prop]) {
							return a5.ThrowError(220, null, {
								prop: prop,
								namespace: obj.namespace()
							});
						}
					}
				}
			}
		}
		for(prop in obj.Override){
			if(sc[prop] === undefined && mixinRef[prop] === undefined)
				return a5.ThrowError(202, null, {prop:prop, namespace:obj.namespace()});
			if(sc[prop] && sc[prop].Final === true || mixinRef[prop] && mixinRef[prop].Final === true)
				return a5.ThrowError(203, null, {prop:prop, namespace:obj.namespace()});
			obj[prop] = obj.Override[prop];
		}
		for(prop in obj.Final){
			obj[prop] = obj.Final[prop];
			obj[prop].Final = true;
		}
	},
	
	Package = function(pkg){
		var imports, clsName, 
		cls, base, type, proto, 
		implement, mixins,
		staticMethods = false,
		isMixin = false, 
		isInterface = false, 
		enumDeclaration = false,
		isProto = false,
		
		process = function(){
			var im = _a5_processImports(imports, pkg),
			pkgObj = {	pkg:pkg, 
						imports:imports, 
						clsName:clsName, 
						cls:cls, 
						base:base, 
						type:type, 
						proto:proto, 
						implement:implement,
						mixins:mixins,
						staticMethods:staticMethods,
						isInterface:isInterface,
						isMixin:isMixin,
						enumDeclaration:enumDeclaration,
						isProto:isProto},
			validationResult = a5.core.verifiers.validateClassDependencies(base, im, mixins, implement, isInterface, isMixin);
			if (validationResult === true) 
				processClass(pkgObj);
			else 
				packageQueue.push({pkg:pkgObj, reason:validationResult.reason, reasonNM:validationResult.reasonNM});
			process = Import = Extends = Implements = Static = Interface = Class = Prototype = Mixin = Mix = Enum = null;
		},
		
		Import = function(){
			imports = Array.prototype.slice.call(arguments);
			return {Prototype:Prototype, Static:Static, Mixin:Mixin, Mix:Mix, Extends:Extends, Implements:Implements, Interface:Interface,  Class:Class};
		},
		
		Extends = function(str){
			base = str;
			return {Prototype:Prototype, Static:Static, Import:Import, Mix:Mix, Implements:Implements, Interface:Interface, Class:Class};
		},
		
		Mix = function(){
			mixins = Array.prototype.slice.call(arguments);
			return {Prototype:Prototype, Static:Static, Extends:Extends, Implements:Implements, Interface:Interface,  Class:Class};
		},
		
		Implements = function(arr){
			implement = Array.prototype.slice.call(arguments);
			return {Prototype:Prototype, Static:Static, Mix:Mix, Import:Import, Extends:Extends, Class:Class};
		},
		
		Static = function(name, func){
			if(typeof name === 'string'){
				clsName = name;
				staticMethods = func;
				process();
			} else {
				staticMethods = name;
				return {Prototype:Prototype, Implements:Implements, Mix:Mix, Mixin:Mixin, Import:Import, Extends:Extends, Class:Class};
			}
		},
		
		Interface = function(str, $cls){
			clsName = str;
			cls = $cls;
			isInterface = true;
			process();
		},
		
		Mixin = function(str, $cls){
			clsName = str;
			cls = $cls,
			isMixin = true;
			process();
		},
		
		Enum = function(name, func){
			clsName = name;
			enumDeclaration = func;
			process();			
		},
		
		Class = function(str, $cls, $prop3){
			clsName = str;
			var hasType = (typeof $cls === 'string');
			cls = hasType ? $prop3:$cls;
			type = hasType ? $cls:undefined;
			process();
		},
		
		Prototype = function(str, $cls, $prop3){
			isProto = true;
			clsName = str;
			var hasType = (typeof $cls === 'string');
			proto = hasType ? $prop3:$cls;
			type = hasType ? $cls:undefined;
			process();
		}
		
		a5.SetNamespace(pkg);
		
		return {Enum:Enum, Static:Static, Import:Import, Extends:Extends, Mixin:Mixin, Mix:Mix, Implements:Implements, Class:Class, Prototype:Prototype, Interface:Interface};
	},
	
	Extend = function(namespace, base, clsDef, type, isInterface, isProto, imports, mixins){
		if(isInterface){
			if (base && !base.isInterface())
				return a5.ThrowError('Interface "' + namespace + '" cannot extend "' + base.namespace() + '", base class is not an interface.');
			base = null;		
		}
		var genBaseFunc = function(){},
			isFinal = isProto === false || false,
			isSingleton = false,
			isAbstract = false,
			superclass = null,
			nmi = namespace.lastIndexOf('.'),
			pkg = nmi > -1 ? namespace.substring(0, nmi):"",
			clsName = nmi > -1 ? namespace.substring(nmi+1):namespace,
			typeSplit,
			extender,
			eProto,
			eProtoConst, i, l;

		
		
		if (!base || base === undefined) base = genBaseFunc;
		extender = function(){};
		
		if (type) {
			typeSplit = type.split(/[ |]/);
			for (i = 0, l = typeSplit.length; i<l; i++) {
				if (typeSplit[i] == 'final') isFinal = true;
				else if (typeSplit[i] == 'singleton') isSingleton = true;
				else if (typeSplit[i] == 'abstract') isAbstract = true;
			}
		}
		if (a5.core.verifiers.checkNamespaceValid(namespace)) {
			if (!base.isFinal || (base.isFinal() != true)) {
				if(base === Error){
					var proxy = {};
					proxy.prototype = new base();
					extender.prototype = proxy;
					proxy = null;	
				} else
					extender.prototype = new base();			
				superclass = base;
			} else
				return a5.ThrowError('Cannot extend ' + base.namespace() + ', class marked as final.');
		} else
			return a5.ThrowError('Cannot create new class in namespace ' + namespace + ', definition already exists.');
		
		eProto = extender.prototype;
		eProtoConst = eProto.constructor = extender;
		if (base.prototype.constructor._extenderRef)
			base.prototype.constructor._extenderRef.push(extender);
		eProtoConst._a5_superclass = superclass;
		eProtoConst._a5_pkg = pkg;
		eProtoConst._a5_clsDef = clsDef;
		eProtoConst._a5_clsName = clsName;
		eProtoConst._a5_namespace = namespace;
		eProtoConst._a5_imports = imports;
		eProtoConst._a5_isFinal = isFinal;
		eProtoConst._a5_isAbstract = isAbstract;
		eProtoConst._a5_isSingleton = isSingleton;
		eProtoConst._a5_isInterface = isInterface;
		eProtoConst._a5_isPrototype = isProto || false;
		eProtoConst._mixinRef = base.prototype.constructor._mixinRef ? base.prototype.constructor._mixinRef.slice(0) : [];
		eProtoConst._implementsRef =  base.prototype.constructor._implementsRef ? base.prototype.constructor._implementsRef.slice(0) : [];
		eProtoConst._a5_mixedMethods = {};
		eProtoConst._a5_instance = null;
		eProtoConst._instanceCount = 0;
		eProtoConst._extenderRef = [];
		eProto._a5_initialized = false;
			
		for(prop in a5.core.classProxyObj.construct)
			eProtoConst[prop] = a5.core.classProxyObj.construct[prop];
		if (base.namespace === undefined) {
			for (prop in a5.core.classProxyObj.instance) 
				eProto[prop] = a5.core.classProxyObj.instance[prop];
		}
		if(mixins)
			a5.core.mixins.applyMixins(eProto, mixins, imports);
		
		return a5.SetNamespace(namespace, extender);
	},
	
	processQueue = function(){
		var shouldReprocess = false, i, l;
		for(i = 0; i < packageQueue.length; i++){
			var pkgObj = packageQueue[i].pkg,
				im = _a5_processImports(pkgObj.imports, pkgObj.pkg),
				validationResult = a5.core.verifiers.validateClassDependencies(pkgObj.base, im, pkgObj.mixins, pkgObj.implement);		
			if (validationResult === true){
				processClass(pkgObj, true);
				packageQueue.splice(i, 1);
				i--;
				shouldReprocess = true;
			} else {
				packageQueue[i].reason = validationResult.reason;
				packageQueue[i].reasonNM = validationResult.reasonNM;
			}
		}	
		if(shouldReprocess) processQueue();
	},
	
	processProtoClass = function(queued){
		var obj = queued.obj,
			pkgObj = queued.pkgObj;
		processDeclaration(pkgObj.proto, obj, obj.prototype, obj.imports(), obj, true)
	},
	
	processClass = function(pkgObj, $fromQueue){
		var imports = function(){ return _a5_processImports(pkgObj.imports, pkgObj.pkg); },
			base = (typeof pkgObj.base === 'function') ? pkgObj.base : a5.GetNamespace(pkgObj.base, imports()),
			obj = Extend(pkgObj.pkg + '.' + pkgObj.clsName, base, pkgObj.cls, pkgObj.type, pkgObj.isInterface, pkgObj.isProto, imports, pkgObj.mixins),
			fromQueue = $fromQueue || false,
			isValid = true, i, l;
		if(pkgObj.staticMethods)
			pkgObj.staticMethods(obj, imports());
		if (pkgObj.proto && delayProtoCreation) {
			queuedPrototypes.push({obj:obj, pkgObj:pkgObj});
			if(pkgObj.implement)
				queuedImplementValidations.push({pkgObj:pkgObj, obj:obj});
		} else {
			if(pkgObj.proto)
				processProtoClass({obj:obj, pkgObj:pkgObj});
			if(pkgObj.implement)
				isValid = a5.core.verifiers.validateImplementation(pkgObj, obj);
		}	
		if(!isValid)
			return;
		if(pkgObj.enumDeclaration){
			var index = 0,
				values = [];
			pkgObj.enumDeclaration({
				startIndex:function(value){
					index = value;
				},
				addValue:function(value){
					values.push(value);
				}
			})
			
			for (i = 0, l = values.length; i < l; i++)
				obj[values[i]] = index++;
				
			obj.addValue = function(value){
				if (obj[value] === undefined) 
					obj[value] = index++;
			}
			obj.getValue = function(id){
				for (prop in obj) 
					if (obj[prop] === id) 
						return prop;
				return null;
			}
		}
		if (pkgObj.isInterface) {
			obj.interfaceVals = {};
			if (pkgObj.base !== null && pkgObj.base !== undefined) {
				var cls = a5.GetNamespace(pkgObj.base, obj.imports());
				if (cls.isInterface()) {
					for (prop in cls.interfaceVals) 
						if(obj.interfaceVals[prop] === undefined)
							obj.interfaceVals[prop] = cls.interfaceVals[prop];
				} else
					a5.ThrowError(204, null, {objNM:obj.namespace(), clsNM:cls.namespace()});
			}
			pkgObj.cls.call(obj.interfaceVals, obj.interfaceVals);
		}
		if(pkgObj.isMixin){
			obj._mixinDef = {
				Properties: function(propFunc){
					obj.prototype.constructor._a5_mixinProps = propFunc;
				},
				Contract:function(contract, method){
					return a5.core.contracts.createContract(contract, method);
				},
				MustExtend:function(){
					obj.prototype.constructor._a5_mixinMustExtend = arguments;
				},
				MustMix:function(){
					obj.prototype.constructor._a5_mixinMustMix = arguments;
				}
			}
			pkgObj.cls.call(obj._mixinDef, obj._mixinDef, obj.imports(), obj);
			if(typeof obj._mixinDef[obj.className()] === 'function'){
				obj._a5_instanceConst = obj._mixinDef[obj.className()];
				delete obj._mixinDef[obj.className()];
			} else
				a5.ThrowError(205, null, {nm:obj.namespace()});
			delete obj._mixinDef.Properties;
			delete obj._mixinDef.Contract;
			delete obj._mixinDef.MustExtend;
			delete obj._mixinDef.MustMix;
		}
		if (!fromQueue) processQueue();
	},
	
	_a5_processImports = function(array, pkg, $isRebuild){
		return (function(array, pkg){
			var retObj = {},
				isRebuild = $isRebuild || false,
				rebuildArray = [],
				i, l,
			
			processObj = function(procObj){
				var obj;
				for (prop in procObj) {
					obj = procObj[prop];
					if (typeof obj === 'function' && obj.namespace != undefined && retObj[prop] === undefined) retObj[prop] = obj;
				}
			};
			
			retObj.rebuild = function(){
				if (rebuildArray.length) {
					var returnObj = {}, 
						importObj = _a5_processImports(rebuildArray, null, true), 
						newObj = importObj.retObj, 
						newRebuildArray = importObj.rebuildArray;
					
					for (prop in retObj) 
						returnObj[prop] = retObj[prop];
					for (prop in newObj) 
						if (returnObj[prop] === undefined) 
							retObj[prop] = returnObj[prop] = newObj[prop];
					rebuildArray = newRebuildArray;
					return returnObj;
				} else
					return retObj;
			}
			if(pkg) 
				processObj(a5.GetNamespace(pkg, null, true));
			if (array) {
				var str, pkg, clsName;
				for (i = 0, l = array.length; i < l; i++) {
					str = array[i], isWC = false, dotIndex = str.lastIndexOf('.');
					if (str.charAt(str.length - 1) == '*') isWC = true;
					if (isWC) {
						pkg = a5.GetNamespace(str.substr(0, str.length - 2), null, true);
						processObj(pkg);
					} else {
						clsName = dotIndex > -1 ? str.substr(dotIndex + 1) : str;
						var obj = a5.GetNamespace(str);
						if (obj) {
							if (retObj[clsName] === undefined)
								retObj[clsName] = obj;
						} else
							rebuildArray.push(str);	
					}
				}
			}
			if(isRebuild)
				return {retObj:retObj, rebuildArray:rebuildArray};
			return retObj;
		})(array, pkg);
	},
	
	_a5_verifyPackageQueueEmpty = function(){
		if(packageQueue.length){
			var clsString = '', i, l;
			for(i = 0, l = packageQueue.length; i < l; i++)
				clsString += '"' + packageQueue[i].pkg.pkg + '.' + packageQueue[i].pkg.clsName + '", ' + packageQueue[i].reason  + ' class missing: "' + packageQueue[i].reasonNM + '"' + (packageQueue.length > 1 && i < packageQueue.length-1 ? ', \n':'');
			a5.ThrowError(206, null, {classPlural:packageQueue.length == 1 ? 'class':'classes', clsString:clsString});
		}
	},
	
	_a5_delayProtoCreation = function(value){
		delayProtoCreation = value;
	},
	
	_a5_createQueuedPrototypes = function(){
		for (var i = 0, l = queuedPrototypes.length; i < l; i++)
			processProtoClass(queuedPrototypes[i]);
		queuedPrototypes = [];
		for(i = 0, l = queuedImplementValidations.length; i<l; i++)
			a5.core.verifiers.validateImplementation(queuedImplementValidations[i].pkgObj, queuedImplementValidations[i].obj); 
		queuedImplementValidations = [];
	}
	
	return {
		Create:Create,
		Package:Package,
		_a5_processImports:_a5_processImports,
		_a5_processImports:_a5_processImports,
		_a5_verifyPackageQueueEmpty:_a5_verifyPackageQueueEmpty,
		_a5_delayProtoCreation:_a5_delayProtoCreation,
		_a5_createQueuedPrototypes:_a5_createQueuedPrototypes
	}
})

/**
* @name Create
* Instantiates a new instance of an object defined by {@link cl.Package}
* @type Object
* @param {Object} classRef
* @param {Object} args
*/
a5.Create = a5.core.classBuilder.Create;
/**
* @name Package
* @param {Object} pkg
*/
a5.Package = a5.core.classBuilder.Package;

a5._a5_processImports = a5.core.classBuilder._a5_processImports;
a5._a5_verifyPackageQueueEmpty = a5.core.classBuilder._a5_verifyPackageQueueEmpty;
a5._a5_delayProtoCreation = a5.core.classBuilder._a5_delayProtoCreation;
a5._a5_createQueuedPrototypes = a5.core.classBuilder._a5_createQueuedPrototypes;


/**
 * @name TopLevel
 * @namespace  
 */
a5.SetNamespace('a5.core.classProxyObj',{
	
	construct:{
		classPackage:function(getObj){ return getObj ? a5.GetNamespace(this._a5_pkg, null, true) : this._a5_pkg; },
		className:function(){ return this._a5_clsName; },
		namespace:function(){return this._a5_namespace; },
		imports:function(){ return this._a5_imports ? this._a5_imports():{}; },
		doesImplement:function(cls){ return a5.core.verifiers.checkImplements(this, cls); },
		doesExtend:function(cls){ return a5.core.verifiers.checkExtends(this, cls); },
		doesMix:function(cls){ return a5.core.verifiers.checkMixes(this, cls); },
		getAttributes:function(){ return this._a5_attributes; },
		instance:function(autoCreate){
			if (autoCreate === true)
				return this._a5_instance || a5.Create(this);
			else
				return this._a5_instance;
		},
		superclass:function(scope, args){
			if (scope !== undefined){
				if (typeof scope === 'object' && scope.isA5 === true) {
					if (typeof args !== 'object') 
						args = [];
					if (!this._a5_superclass.className)
						return a5.ThrowError(210);
					var sclConst = this._a5_superclass.prototype.constructor._a5_instanceConst;
					if (sclConst) 
						sclConst.apply(scope, args);
					else a5.ThrowError(211, null, {nm:this._a5_superclass.className()});
				} else {
					a5.ThrowError(212, null, {nm:this.namespace()});
				}	
			} else {
				return this._a5_superclass.prototype;
			}	
		},
		instanceCount:function(){ return this._instanceCount; },
		isInterface:function(){ return this._a5_isInterface; },
		isFinal:function(){ return this._a5_isFinal; },
		isSingleton:function(){	return this._a5_isSingleton; },
		isAbstract:function(){ return this._a5_isAbstract; },
		isPrototype:function(){ return this._a5_isPrototype; },
		isA5ClassDef:function(){ return true },
		isA5:true
	},
	instance:{
		/**#@+
 		 * @memberOf TopLevel#
 		 * @function
	 	 */
		isA5:true,
		isA5ClassDef:function(){ return false },
		
		getStatic:function(){
			return this.constructor;
		},
		
		autoRelease:function(value){
			if(value !== undefined){
				var id = new Date().getTime(),
					self = this;
				this._a5_ar[id] = value;
				return function(){
					return self._a5_ar[id];
				}
			}
		},
		
		/**
		 * Returns a reference to the parent class of the object. Returns null if calling class is final parent.
		 * @name superclass
		 * @param {Object} scope
		 * @param {Object} args
		 */
		superclass:function(scope, args){ 
			return this.constructor.superclass(scope, args); 
		},	
		
		mixins:function(namespace){
			if (namespace !== undefined)
				return GetNamespace(namespace, this.imports());
			else
				return this.constructor._a5_mixedMethods;
		},
		
		mix:function(cls){
			a5.core.mixins.applyMixins(this, cls, this.imports(), this);
		},
		
		getMethods:function(includeInherited, includePrivate){
			var retArray = [];
			for(var prop in this)
				if((includeInherited || ({}).hasOwnProperty.call(this, prop)) && 
					typeof(this[prop]) === 'function' && 
					a5.core.classProxyObj.instance[prop] === undefined && 
					prop.substr(0, 4) !== '_a5_' &&
					(includePrivate || prop.substr(0, 1) !== '_'))
						retArray.push(prop);
			return retArray;
		},
		getProperties:function(includeInherited, includePrivate){
			var retArray = [],
			checkInAncestor = function(obj, prop){
				var descenderRef = obj;
				while (descenderRef !== null) {
					if (descenderRef.constructor._a5_protoProps !== undefined) {
						var ref = {};
						descenderRef.constructor._a5_protoProps.call(ref);
						if (ref[prop] !== undefined)
							return true;
					}
					descenderRef = descenderRef.constructor.superclass && 
									descenderRef.constructor.superclass().constructor.namespace ? 
									descenderRef.constructor.superclass() : null;
				}
				return false;
			}
			for(var prop in this)
				if((includeInherited || !checkInAncestor(this, prop)) && 
					typeof(this[prop]) !== 'function' && 
					a5.core.classProxyObj.instance[prop] === undefined && 
					prop.substr(0, 4) !== '_a5_' &&
					(includePrivate || prop.substr(0, 1) !== '_'))
						retArray.push(prop);
			return retArray;
		},
		
		/**
		 * @name classPackage
		 */
		classPackage:function(){ return this.constructor.classPackage(); },
		
		/**
		 * @name className
		 */
		className:function(){ return this.constructor.className(); },
		
		/**
		 * @name getClass
		 */			
		getClass:function(){ return this.constructor; },
		
		/**
		 * Returns the namespace of the class.
		 * @name namespace
		 * @type String
		 */
		namespace:function(){return this.constructor.namespace(); },
		
		/**
		 * @name doesImplement
		 * @param {Object} cls
		 */
		doesImplement:function(cls){ return this.constructor.doesImplement(cls) },
		
		/**
		 * @name doesExtend
		 * @param {Object} cls
		 */
		doesExtend:function(cls){ return this.constructor.doesExtend(cls) },
		
		/**
		 * @name doesMix
		 * @param {Object} cls
		 */
		doesMix:function(cls){ return this.constructor.doesMix(cls) },
		
		/**
		 * @name imports
		 */
		imports:function(){ return this.constructor.imports() },
		
		/**
		 * Called automatically upon {@link TopLevel#destroy} being called. This method should be implemented on the class level to properly deallocate.
		 * @name dealloc
		 */
		dealloc:function(){ },
		
		/**
		 * Returns the number of instances of the object.
		 * @name instanceCount
		 */
		instanceCount:function(){ return this.constructor.instanceCount(); },
		
		/**
		 * @name isInterface
		 */
		isInterface:function(){ return this.constructor.isInterface(); },
		
		/**
		 * @name isFinal
		 */
		isFinal:function(){ return this.constructor.isFinal();	},
		
		/**
		 * @name isSingleton
		 */
		isSingleton:function(){	return this.constructor.isSingleton(); },
		
		/**
		 * @name isAbstract
		 */
		isAbstract:function(){ return this.constructor.isAbstract(); },
		
		/**
		 * @name isPrototype
		 */
		isPrototype:function(){ return this.constructor.isAbstract(); },
		
		/**
		 * Returns a unique identifier for the class instance comprised of the namespace and the instanceCount for the class instance.
		 * @name instanceUID
		 */
		instanceUID:function(){
			return this._a5_instanceUID;
		},
		
		/**
		 * Destroys an instance of an object and removes it from its ancestor instance chains and fires the destroy chain through the instances prototype chain {@link TopLevel#dealloc} methods. This method should not be overriden.
		 * @name destroy
		 */
		destroy:function(){
			if (this._a5_initialized === true) {
				if ((this.namespace() === 'a5.cl.CL' || this.classPackage().indexOf('a5.cl.core') !== -1) && !this.classPackage() === 'a5.cl.core.viewDef') {
					a5.ThrowError(215, null, {nm:this.namespace()});
					return;
				}
				this._a5_initialized = false;
				var descenderRef = this,
					instanceRef,
					nextRef,
					mixinRef,					prop,
					i, l;
				while (descenderRef !== null) {
					mixinRef = descenderRef.constructor._mixinRef;
					if(mixinRef && mixinRef.length){
						for (i = 0, l = mixinRef.length; i < l; i++)
							if(mixinRef[i]._mixinDef.dealloc != undefined)
								mixinRef[i]._mixinDef.dealloc.call(this);
					}
					if (descenderRef.constructor.namespace) {
						nextRef = descenderRef.constructor.superclass ? descenderRef.constructor.superclass() : null;
						if (nextRef && nextRef.dealloc !== descenderRef.dealloc) descenderRef.dealloc.call(this);
						descenderRef = nextRef;
					} else {
						descenderRef = null;
					}
				}
				if(this.constructor._a5_instance === this)
					this.constructor._a5_instance = null;
				for(prop in this._a5_ar)
					delete this._a5_ar[prop];
				for (prop in this) 
					if(({}).hasOwnProperty.call(this, prop) 
					&& typeof this.constructor.prototype[prop] === 'undefined' 
					&& prop !== '_a5_initialized'
					&& prop !== '_a5_instanceUID') 
						this[prop] = null;
			}
		},
		_a5_initialize: function(args){
			if (!this._a5_initialized) {
				if (this.constructor.isAbstract() && this._a5_initialize.caller.caller !== Extend)
					return a5.ThrowError(216, null, {nm:this.constructor.namespace()});
				this._a5_initialized = true;
				if (this.constructor.isSingleton() && this.constructor._a5_instance !== null)
					return a5.ThrowError(217, null, {nm:this.constructor.namespace()});	
				this._a5_instanceUID = this.namespace().replace(/\./g, '_') + '__' + this.constructor.instanceCount();
				if(this.instanceCount() === 0)
					this.constructor._a5_instance = this;
				this.constructor._instanceCount++;	
				this._a5_ar = {};				
				var self = this,
					descenderRef = this,
					_args = args || [],
					protoPropRef = [],
					cs, i, l, mixinRef;
				
				this._a5_privatePropsRef = {};
				if (typeof this.constructor._a5_instanceConst !== 'function')
					return a5.ThrowError(218, null, {clsName:this.className()});
				while (descenderRef !== null) {
					if (descenderRef.constructor._a5_protoPrivateProps !== undefined) {
						this._a5_privatePropsRef[descenderRef.namespace()] = {};
						descenderRef.constructor._a5_protoPrivateProps.call(this._a5_privatePropsRef[descenderRef.namespace()]);
					}
					if(descenderRef.constructor._a5_protoProps !== undefined)
						protoPropRef.unshift(descenderRef.constructor._a5_protoProps);
						
					descenderRef = descenderRef.constructor.superclass && 
									descenderRef.constructor.superclass().constructor.namespace ? 
									descenderRef.constructor.superclass() : null;
				}
				//a5.core.mixins.initializeMixins(this);
				for(i = 0, l = protoPropRef.length; i<l; i++)
					protoPropRef[i].call(this);
				this.constructor._a5_instanceConst.apply(this, _args);
				a5.core.mixins.mixinsReady(this);
				return true;
			} else
				return null; 
		},
		
		/**
		 * @name create
		 * @see a5.Create
		 */
		create:a5.Create,
		
		throwError: function(){
			return a5.ThrowError.apply(this, arguments);
		},

		
		/**
		 * @name assert
		 * @param {Object} exp
		 * @param {Object} err
		 */
		assert:function(exp, err){
			if (exp !== true)
				throw this.create(a5.AssertException, [err]);
		}
	}
	
	/**#@-*/
})


a5.SetNamespace('a5.core.verifiers', {
	namespaceArray:[],
	validateImplementation:function(pkgObj, obj){
		var i, l, prop, implNM, testInst, impl, hasProp,
			compareObjs = function(obj1, obj2){
				for(var prop in obj1)
					if(obj1[prop] !== obj2[prop])
						return false;
				return true;
			};
		for (i = 0, l = pkgObj.implement.length; i<l; i++) {
			implNM = pkgObj.implement[i];
			try {
				testInst = new obj;
				testInst.Override = {};
				testInst.Final = {};
				testInst.Attributes = function(){
					var args = Array.prototype.slice.call(arguments);
					var func = args.pop();
					for(var i = 0, l = args.length; i<l; i++){
						var attr = args[i][0];
						if(attr === 'Contract' || attr === 'ContractAttribute' || attr === ar.ContractAttribute)
							func.attributes = args[i];
					}
					return func;
				}
				impl = a5.GetNamespace(implNM, obj.imports());
				if(obj._a5_clsDef)
					obj._a5_clsDef.call(testInst, testInst, obj.imports(), obj);
			} 
			catch (e) {
				throw e;
				return false;
			}
			if (!impl.isInterface())
				return a5.ThrowError(213, null, {implNM:impl.namespace(), objNM:obj.namespace()});
			for (prop in impl.interfaceVals) {
				hasProp = testInst[prop] !== undefined;
				var intProp = impl.interfaceVals[prop],
					testInstProp = testInst[prop];
				if(hasProp && 
					typeof intProp === 'object' && 
					testInstProp.attributes && 
					(testInstProp.attributes[0] === 'Contract' || 
						testInstProp.attributes[0] === 'ContractAttribute' || 
							testInstProp.attributes[0] === a5.ContractAttribute)){
					var isValid = true;
					for (var i = 0, l = intProp.length; i < l; i++)
						isValid = isValid && testInstProp.attributes.length >=(i+1) ? compareObjs(intProp[i], testInstProp.attributes[i+1]) : false;
					if(!isValid)
						return a5.ThrowError(601, null, {intNM:impl.namespace(), implNM:obj.namespace(), method:prop});
				}else if (!hasProp || (hasProp && typeof impl.interfaceVals[prop] !== typeof testInst[prop]))
					return a5.ThrowError(214, null, {implNM:impl.namespace(), objNM:obj.namespace()});
			}
			obj._implementsRef.push(impl);
			testInst.destroy();
		}
		return true;
	},
	
	checkNamespaceValid:function(namespace){
		for(var i = 0, l=this.namespaceArray.length; i<l; i++)
			if(this.namespaceArray[i] == namespace) 
				return false;
		this.namespaceArray.push(namespace);
		return true;
	},
	
	checkImplements:function(cls, implement){
		if(typeof implement === 'string')
			implement = a5.GetNamespace(implement);
		var imRef = cls._implementsRef, i, j, k, l;
		while (imRef) {
			for (i = 0, l = imRef.length; i < l; i++) 
				if (imRef[i] === implement) 
					return true;
			imRef = cls.superclass() ? cls.superclass().getStatic()._implementsRef : null;
		}
		return false;
	},
	
	checkExtends:function(cls, extend){
		var clsCheck = cls._a5_superclass && cls._a5_superclass.prototype.className ? cls._a5_superclass : null;
		if(!clsCheck) return false;
		var extendCheck = (typeof extend === 'string') ? a5.GetNamespace(extend) : extend;
		if(!extendCheck) return false;
		while(clsCheck){
			if(clsCheck === extendCheck) return true;
			clsCheck = clsCheck._a5_superclass && clsCheck._a5_superclass.prototype.className ? clsCheck._a5_superclass : null;
		}
		return false;
	},
	
	checkMixes:function(cls, mix){
		if(typeof mix === 'string')
			mix = a5.GetNamespace(mix);
		if(!mix)
			return false;
		for(var i = 0, l = cls._mixinRef.length; i<l; i++)
			if(cls._mixinRef[i] === mix)
				return true;
		return false;
	},
	
	validateClassDependencies:function(base, im, mixins, implement, isInterface, isMixin){
		var canCreate,
			reason,
			reasonNM,
			baseCls = null,
			prop, m, nm, i;
		if (base !== undefined) {
			if(typeof base === 'function') baseCls = base;
			else baseCls = a5.GetNamespace(base, im);
		}
		canCreate = true;
		if(base !== undefined && !baseCls){
			canCreate = false;
			reason = 'base';
			reasonNM = base;
		} 
		if(canCreate && mixins !== undefined){
			for(prop in mixins){
				m = mixins[prop];
				if(typeof m === 'string')
					nm = a5.GetNamespace(m, im);
				if (typeof nm !== 'function') {
					canCreate = false;
					reason = 'mixin';
					reasonNM = m;
				}
			}	
		}
		if(canCreate && implement !== undefined){
			for(prop in implement){
				i = implement[prop];
				if(typeof i === 'string')
					nm = a5.GetNamespace(i, im);
				if (typeof nm !== 'function') {
					canCreate = false;
					reason = 'interface';
					reasonNM = i;
				}
			}
		}	
		return canCreate ? true : {reason:reason, reasonNM:reasonNM};
	}
})


a5.SetNamespace('a5.core.mixins', {
	
	initializeMixins:function(inst){
		var scope = inst,
			mixinRef = inst.constructor._mixinRef,
			i, l, prop, cls;
		if(mixinRef.length){
			for (i = mixinRef.length - 1, l = -1; i > l; i--) {
				if(mixinRef[i]._a5_mixinMustExtend !== undefined){
					for (prop in mixinRef[i]._a5_mixinMustExtend) {
						cls = mixinRef[i]._a5_mixinMustExtend[prop];
						if (!inst.doesExtend(a5.GetNamespace(cls, inst.imports())))
							return a5.ThrowError(400, null, {nm:mixinRef[i].namespace()});
					}
				}
				if (mixinRef[i]._a5_mixinProps !== undefined) 
					mixinRef[i]._a5_mixinProps.call(scope);
			}						
			for(i = 0, l = mixinRef.length; i<l; i++)
				mixinRef[i]._a5_instanceConst.call(scope);
		}	
	},
	
	mixinsReady:function(scope){
		var mixinRef = scope.constructor._mixinRef,
			i, l, prop, cls;
		if (mixinRef.length) {
			for (i = mixinRef.length - 1, l = -1; i > l; i--) {
				if(mixinRef[i]._a5_mixinMustMix !== undefined){
					for (prop in mixinRef[i]._a5_mixinMustMix) {
						cls = mixinRef[i]._a5_mixinMustMix[prop];
						if (!inst.doesMix(a5.GetNamespace(cls)))
							return a5.ThrowError(401, null, {nm:mixinRef[i].namespace(), cls:cls});
					}
				}
				if (typeof mixinRef[i].mixinReady === 'function') 
					mixinRef[i].mixinReady.call(scope);
			}
		}
	},
	
	applyMixins:function(sourceObj, mixins, imports, inst){
		var usedMethods = {},
			mixins = typeof mixins === 'string' ? [mixins] : mixins,
			mixinInsts = [],
			i, l, mixin;
			
		for (i = 0, l = mixins.length; i < l; i++) {
			mixin = a5.GetNamespace(mixins[i], typeof imports === 'function' ? imports() : imports);
			if(!mixin)
				return a5.ThrowError(404, null, {mixin:mixins[i]});
			mixinInsts.push(mixin);
			for (i = 0; i < sourceObj.constructor._mixinRef.length; i++)
				if (sourceObj.constructor._mixinRef[i] === mixin)
					return a5.ThrowError(402, null, {nm:mixin.namespace()});
			for (var method in mixin._mixinDef) {
				if (method !== 'dealloc' && method !== 'Properties' && method !== 'mixinReady' && method !== 'MustExtend' && method !== 'Contract') {
					if (usedMethods[method] === undefined) {
						if(inst === undefined)
							sourceObj.constructor._a5_mixedMethods[method] = mixin._mixinDef[method];
						sourceObj[method] = mixin._mixinDef[method];
						usedMethods[method] = 'mixed';
					} else
						return a5.ThrowError(403, null, {method:method});
				}
			}
			if(inst)
				a5.core.mixins.initializeMixins(inst, mixinInsts, inst);
			else
				sourceObj.constructor._mixinRef.push(mixin);
		}
	}
})


a5.SetNamespace('a5.core.errorHandling', true, function(){
	
	var thrownError = null;
	
	this.ThrowError = function(error, type, replacements){
		var t = typeof error,
			errorStr;
		if (t === 'string')
			errorStr = error;			
		else if (t === 'number'){
			if (a5.GetNamespace('a5.ErrorDefinitions', null, true)) {
				var errorStr = a5.ErrorDefinitions[error];
				if(!errorStr)
					errorStr = 'Invalid error id ' + error + ' thrown: error not defined.';
			} else
				errorStr = 'Error id ' + error + ' thrown. Include a5.ErrorDefinitions for verbose information.';
			error = a5.Create(type || a5.Error, [errorStr, a5.Error.FORCE_CAST_ERROR]);
		}
		if(errorStr)
			error = a5.Create(type || a5.Error, [(replacements ? runReplacements(errorStr, replacements) : errorStr), a5.Error.FORCE_CAST_ERROR]);
		thrownError = error;
		throw error;
	}
	
	this._a5_getThrownError = function(){
		var err = thrownError;
		thrownError = null;
		return err;
	}
	
	var runReplacements = function(str, replacements){
		for(var prop in replacements)
			str = str.replace(new RegExp('{' + prop + '}', 'g'), replacements[prop]);
		return str;
	}
})

/**
 * @name ThrowError
 */
a5.ThrowError = a5.core.errorHandling.ThrowError;
a5._a5_getThrownError = a5.core.errorHandling._a5_getThrownError;

a5.Package('a5')

	.Prototype('Attribute', 'singleton', function(proto, im, Attribute){
		
		Attribute.RETURN_NULL = '_a5_attributeReturnsNull';
		Attribute.SUCCESS = '_a5_attributeSuccess';
		Attribute.ASYNC = '_a5_attributeAsync';
		Attribute.FAILURE = '_a5_attributeFailure';
		
		Attribute.processInstance = function(cls){
			return a5.core.attributes.processInstance(cls);
		}
		
		this.Properties(function(){
			this.target = a5.AttributeTarget.ALL;
		});
		
		proto.Attribute = function($target){
			if($target)
				this.target = $target;
		}
		
		proto.instanceCreate = function(rules, instance){ return Attribute.SUCCESS; }
		
		proto.instanceDestroy = function(rules, instance){ return Attribute.SUCCESS; }
		
		proto.instanceProcess = function(rules, instance){ return Attribute.SUCCESS; }
		
		proto.methodPre = function(){ return Attribute.SUCCESS; }
		
		proto.methodPost = function(scope, method){ return Attribute.SUCCESS; }

})

a5.Package('a5')

	.Static('AttributeTarget', function(AttributeTarget){
		
		AttributeTarget.ALL = '_a5_attTargAll';
		AttributeTarget.METHOD = '_a5_attTargMethod';
		AttributeTarget.CLASS = '_a5_attTargClass';
			
})	


a5.Package('a5')

	.Extends('Attribute')
	.Class('ContractAttribute', function(cls, im, Contract){
		
		cls.ContractAttribute = function(){
			cls.superclass(this);
		}
		
		cls.Override.methodPre = function(typeRules, args, scope, method, callback){
			var retObj = null,
				foundTestRule = false,
				processError = function(error){
					error.message = 'Contract type failure on method "' + method.getName() + '" ' + error.message;
					return error;
				}
				
			//TODO: validate structure of passed rules. 
			//checkIsValid for datatypes, default vals should still fail out via error
			if(typeRules.length > 1){
				for (i = 0, l = typeRules.length; i < l; i++) {
					retObj = runRuleCheck(typeRules[i], args);
					if (retObj instanceof a5.ContractException) {
						cls.throwError(processError(retObj));
						return a5.Attribute.FAILURE;
					}
					if (retObj !== false) {
						foundTestRule = true;
						retObj.overloadID = i;
						break;
					}
				}
			} else {
				foundTestRule = true;
				retObj = runRuleCheck(typeRules[0], args, true);
				if (retObj instanceof a5.ContractException) {
					cls.throwError(processError(retObj));
					return a5.Attribute.FAILURE;
				}
			}
			if (!foundTestRule || retObj === false) {
				cls.throwError(processError(cls.create(a5.ContractException, ['no matching overload found'])));
				return a5.Attribute.FAILURE;
			} else {
				return retObj;
			}
		}
		
		var runRuleCheck = function(rule, args){
			var retObj = {},
				count = 0,
				testResult,
				prop, type;
			for (prop in rule) {
				type = rule[prop];
				testResult = validate((count < args.length ? args[count] : undefined), type, count);
				if(testResult instanceof a5.ContractException)
					return testResult;
				retObj[prop] = testResult;
				count++;
			}
			if(args.length > count)
				return false;
			if(args.length === 0){
				if(count === 0) return retObj;
				return false;
			}
			return retObj;
		},	
		
		validate = function(arg, type, count){
			var kind = 'type',
				foundOptionals = false,
				defaultVal = null,
				split, clsDef;
			if(type.indexOf('=') != -1){
				split = type.split('=');
				type = split[0];
				foundOptionals = true;
				defaultVal = split[1];
			} else {
				if(foundOptionals)
					return cls.create(a5.ContractException, ['for argument ' + count + ', required values cannot be defined after optional values']);
			}
			if(type.indexOf('.') !== -1) kind = 'class';
			if(type === 'array') kind = 'array';
			if(type === 'object') kind = 'object';
			if(kind !== 'class') type = type.toLowerCase();
			if (arg === undefined) {
				if (foundOptionals) arg = discernDefault(type, kind, defaultVal, count);
				else return cls.create(a5.ContractException, ['for argument ' + count + ', missing required argument of type "' + type + '"']);
			}
	
			if (arg !== undefined && arg !== null) {
				switch (kind) {
					case 'class':
						clsDef = a5.GetNamespace(type);
						if(clsDef.isInterface()){
							if(!(arg.doesImplement(clsDef)))
								return cls.create(a5.ContractException, ['for argument ' + count + ', must implement interface ' + type]);
						} else {
							if (!(arg instanceof clsDef))
								return cls.create(a5.ContractException, ['for argument ' + count + ', must be an instance of type ' + type]);
						}
						break;
					case 'type':
						if(arg !== null && typeof arg !== type)
							return cls.create(a5.ContractException, ['for argument ' + count + ', must be of type ' + type]);
						break;
					case 'array':
						if (Object.prototype.toString.call(arg) !== '[object Array]')
							return cls.create(a5.ContractException, ['for argument ' + count + ', must be an array']);
						break;
					case 'object':
						if(arg._a5_initialized !== undefined || typeof arg !== 'object' || arg instanceof Array)
							return cls.create(a5.ContractException, ['for argument ' + count + ', must be a generic object']);
						break;
				}
			}
			return arg;
		},
		
		discernDefault = function(type, kind, defaultVal, count){
			var retVal, invalid = false;
			if (type === 'string') {
				var zChar = defaultVal.charAt(0);
				if (zChar === defaultVal.charAt(defaultVal.length - 1)) {
					if(zChar === '"' || zChar === "'") retVal = defaultVal.substr(1, defaultVal.length - 2);
					else invalid = true;
				} else
					invalid = true;
			} else if (type === 'number'){
				if(!isNaN(defaultVal))
					retVal = parseInt(defaultVal);
				else
					invalid = true;
			} else if (kind === 'class'){
				if(defaultVal === 'null')
					retVal = null;
				else 
					invalid = true;
			} else if(	type === 'boolean' 	|| 
						type === 'array' 	|| 
						type === 'function' ||
						type === 'object'){
				switch (defaultVal){
					case '{}':
						if(type === 'object')
							retVal = {};
						else 
							invalid = true;
						break;
					case '[]':
						if(type === 'array')
							retVal = [];
						else 
							invalid = true;
						break;
					case 'null':
						retVal = null;
						break;
					case 'true':
						if(type === 'boolean')
							retVal = true;
						else 
							invalid = true;
						break;
					case 'false':
						if(type === 'boolean')
							retVal = false;
						else
							invalid = true;
						break;
					default:
						invalid = true;
				}
			} else
				invalid = true;
			if(invalid)
				return cls.create(a5.ContractException, ['for argument ' + count + ', invalid default value for data type "' + type + '"']);
			 else 
			 	return retVal;
		}

})

a5.Package('a5')

	.Extends('Attribute')
	.Class('PropertyMutatorAttribute', function(cls){
		
		cls.PropertyMutatorAttribute = function(){
			cls.superclass(this);
		}
		
		cls.Override.methodPre = function(typeRules, args, scope, method, callback, callOriginator){
			if(args.length){
				var typeVal = typeRules[0].validate,
					isCls = false;
				if(typeVal){
					if (typeVal.indexOf('.') !== -1) {
						isCls = true;
						var typeVal = a5.GetNamespace(typeVal);
						if(!typeVal)
							return a5.Attribute.FAILURE;
					}
					var isValid = isCls ? (args[0] instanceof typeVal) : (typeof args[0] === typeVal);
					if(!isValid)
						return a5.Attribute.FAILURE;
				}
				scope[typeRules[0].property] = args[0];
				return a5.Attribute.SUCCESS;
			}
			var retVal = scope[typeRules[0].property];
			return retVal === null ? a5.Attribute.RETURN_NULL : retVal;
		}	
		
		cls.Override.methodPost = function(typeRules, args, scope, method, callback, callOriginator, preArgs){
			if (preArgs.length) 
				return scope;
			else 				
				return a5.Attribute.SUCCESS;
		}
})


/**
 * @class 
 * @name a5.Event
 */
a5.Package('a5')

	.Static(function(Event){
		
		/**#@+
	 	 * @memberOf a5.Event
		 */
		
		/**
		 * @name DESTROYED
		 * @constant
		 */
		Event.DESTROYED = 'Destroyed';
		
		/**#@-*/
	})
	.Prototype('Event', function(proto){
		
		/**#@+
	 	 * @memberOf a5.Event#
	 	 * @function
		 */
		
		
		proto.Event = function($type, $bubbles, $data){
			this._a5_type = $type;
			this._a5_data = $data;
			this._a5_target = null;
			this._a5_currentTarget = null;
			this._a5_phase = 1;
			this._a5_bubbles = $bubbles !== false;
			this._a5_canceled = false;
			this._a5_cancelPending = false;
			this._a5_shouldRetain = false;
		}
		
		
		/**
		 * Cancels the propagation of the event. Once this method is called, any event listeners that have not yet processed this event instance will be ignored.
		 * #name cancel
		 * @param {Object} finishCurrentPhase If true, the event is allowed to finish dispatching in the current phase, but will be cancelled before the next phase begins.
		 */
		proto.cancel = function(finishCurrentPhase){
			if(finishCurrentPhase === true)
				this._a5_cancelPending = true;
			else
				this._a5_canceled = true;
		}
		
		/**
		 * The object that dispatched this event.
		 * @name target
		 * @return {Object} The object that dispatched this event.
		 */
		proto.target = function(){ return this._a5_target; };
		
		/**
		 * The object that is currently processing this event.
		 * @name currentTarget
		 * @return {Object} The object that is currently processing this event.
		 */
		proto.currentTarget = function(){ return this._a5_currentTarget; };
		
		/**
		 * The event type.
		 * @name type
		 * @return {String} The event type.
		 */
		proto.type = function(){ return this._a5_type; };
		
		/**
		 * @name data
		 * @return {Object}
		 */
		proto.data = function(){ return this._a5_data; };
		
		/**
		 * The phase this event is currently in. (a5.Event.CAPTURING, a5.Event.AT_TARGET, or a5.Event.BUBBLING)
		 * @name phase
		 * @return {Number} The phase this event is currently in.
		 */
		proto.phase = function(){ return this._a5_phase; };
		
		
		/**
		 * Whether this event should use the bubbling phase.  All events use capture and target phases.
		 * @name bubbles
		 */
		proto.bubbles = function(){ return this._a5_bubbles; };
		
		/**
		 * When shouldRetain is set to true, the event instance will not be destroyed after it has finished being dispatched.
		 * Thsi defaults to false, and it is highly recommended that you do NOT set this to true unless the same event is being
		 * dispatched on a timer, and the instance can be reused.
		 * 
		 * @name shouldRetain
		 * @param {Boolean} [value=false] If set to true, the event instance will not be destroyed after it has finished being dispatched.
		 */
		proto.shouldRetain = function(value){
			if(typeof value === 'boolean'){
				this._a5_shouldRetain = value;
				return this;
			}
			return this._a5_shouldRetain;
		}
		
		proto.dealloc = function(){
			this._a5_target = this._a5_currentTarget = null;
		}
		
		/**#@-*/
});

/**
 * @class 
 * @name a5.EventPhase
 */
a5.Package('a5')

	.Static('EventPhase', function(EventPhase){
		
		/**#@+
	 	 * @memberOf a5.EventPhase
		 */
		
		/**
		 * @name CAPTURING
		 * @constant
		 */
		EventPhase.CAPTURING = 1;
		
		/**
		 * @name AT_TARGET
		 * @constant
		 */
		EventPhase.AT_TARGET = 2;
		
		/**
		 * @name BUBBLING
		 * @constant
		 */
		EventPhase.BUBBLING = 3;
});


/**
 * @class 
 * @name a5.Error
 */
a5.Package('a5')

	.Extends(Error)
	.Prototype('Error', function(proto, im, Error){
		
		Error.FORCE_CAST_ERROR = '_a5_forceCastError';
		
		/**#@+
	 	 * @memberOf a5.Error#
	 	 * @function
		 */
		this.Properties(function(){
			this.stack = [];
			this.message = "";
			this._a5_isWindowError = false;
			this.name = this.type = this.className();
		})
		
		proto.Error = function(message, error) {
			if(error === false)
				this._a5_isWindowError = true;
			if(typeof message === 'string')
				this.message = message;
			else
				error = message;
			if(error instanceof Error){
				if(error.stack)
					this.stack = error.stack.split('\n');
				this.line = error.lineNumber;
				this.url = error.fileName;
				if(error.message && this.message === "")
					this.message = error.message;
			} else if(error !== false){
				try{ 
					__undefined__();
				} catch(e) {
					if (e.stack) {
						var hasAtHttp = e.stack.indexOf('@http') !== -1;
						this.stack = e.stack.split('\n');
						this.stack = this.stack.splice(4);
						if (hasAtHttp) 
							for (var i = 0; i < this.stack.length; i++)
								this.stack[i] = this.stack[i].substr(this.stack[i].indexOf('@http'));
					} else {
						var usedFuncs = [];
						try {
							var i = 0, context = this.init.caller.caller.caller;
							do {
								for (i = 0, l = usedFuncs.length; i < l; i++)
									if (usedFuncs[i] === context) context = null;
								if (context) {
									if(context.toString().indexOf(Error.FORCE_CAST_ERROR) === -1)
										this.stack.push(context.toString().replace(/;/g, ';<br/>').replace(/{/g, '{<br/>').replace(/}/g, '}<br/>') + '<br/><br/>');
									usedFuncs.push(context)
									context = context.caller;
									i++;
								}
							} while (context && i <= 50);
						} catch (e) {}
					}
				}
			}
		}
		
		proto.isWindowError = function(){
			return this._a5_isWindowError;
		}
		
		/**
		 * @name toString
		 */
		proto.Override.toString = function () {
		  return this.type + ': ' + this.message;
		}
})


/**
 * @class 
 * @name a5.AssertException
 * @extends a5.Error
 */
a5.Package('a5')
	.Extends('Error')
	.Prototype('AssertException', function(proto){
		
		proto.AssertException = function(){
			proto.superclass(this, arguments);
			this.type = 'AssertException';
		}
		
});

/**
 * @class 
 * @name a5.ContractException
 * @extends a5.Error
 */
a5.Package('a5')
	.Extends('Error')
	.Prototype('ContractException', function(proto){
		
		proto.ContractException = function(){
			proto.superclass(this, arguments);
			this.type = 'ContractException';
		}
		
});


/**
 * @class The EventDispatcher class defines a prototype object for handling listeners and dispatching events.
 * <br/><b>Abstract</b>
 * @name a5.EventDispatcher
 */
a5.Package("a5")

	.Prototype('EventDispatcher', 'abstract', function(proto){
		
		/**#@+
	 	 * @memberOf a5.EventDispatcher#
	 	 * @function
		 */
		
		this.Properties(function(){
			this._a5_autoPurge = false;
			this._a5_listeners = {};
		})
		
		proto.EventDispatcher = function(){
			
		}
		
		proto.autoPurge = function(value){
			if(typeof value === 'boolean'){
				this._a5_autoPurge = value;
				return this;
			}
			return this._a5_autoPurge;
		}
		
		/**
		 * Adds an event listener to the parent object.
		 * @name addEventListener
		 * @param {String} type The event type to be added.
		 * @param {Object} method The associated listener method to be added.
		 * @param {Boolean} [useCapture=false] If set to true, the listener will process the event in the capture phase.  Otherwise, it will process the event bubbling or target phase.
		 * @param {Boolean} [scope=null]
		 */
		proto.addEventListener = function(type, method, useCapture, scope){
			this._a5_addEventListener(type, method, useCapture, scope);
		}
		
		/**
		 * Adds an event listener to the parent object that fires only once, then is removed.
		 * @name addOneTimeEventListener
		 * @param {String} type The event type to be added.
		 * @param {Object} method The associated listener method to be added.
		 * @param {Boolean} [useCapture=false] If set to true, the listener will process the event in the capture phase.  Otherwise, it will process the event bubbling or target phase.
		 * @param {Boolean} [scope=null]
		 */
		proto.addOneTimeEventListener = function(type, method, useCapture, scope){
			this._a5_addEventListener(type, method, useCapture, scope, true);
		}
		
		/**
		 * @name hasEventListener
		 * @param {String} type
		 * @param {Object} [method]
		 */
		proto.hasEventListener = function(type, method){
			var types = type.split('|'),
				scope = this.cl(),
				i, l, listArray, j, m;
			for (i = 0, l = types.length; i < l; i++) {
				listArray = this._a5_getListenerArray(types[i]);
				if (listArray) {
					for (j = 0, m = listArray.length; j < m; j++) 
						if (listArray[j].type == types[i] && (typeof method === 'function' ? (listArray[j].method == method) : true))
							return true;
				}
			}
			return false;
		}
		
		/**
		 * Remove a listener from the parent object.
		 * @name removeEventListener
		 * @param {String} type The event type to be removed.
		 * @param {Object} method The associated listener method to be removed.
		 * @param {Boolean} [useCapture=false] Whether the listener to remove is bound to the capture phase or the bubbling phase.
		 */
		proto.removeEventListener = function(type, method, useCapture){
			var types = type.split('|'),
				i, l, listArray, j, m;
			useCapture = useCapture === true;
			for (i = 0, l = types.length; i < l; i++) {
				listArray = this._a5_getListenerArray(types[i]);
				if (listArray) {
					for (j = 0, m = listArray.length; j < m; j++) {
						if (listArray[j].method == method && listArray[j].type == types[i] && listArray[j].useCapture === useCapture) {
							listArray.splice(j, 1);
							m = listArray.length;
						}
					}
					this.eListenersChange({
						type: types.length > 1 ? types:types[0],
						method: method,
						useCapture: useCapture,
						changeType: 'REMOVE'
					});
				}
			}
		}
		
		/**
		 * @name removeAllListeners
		 */
		proto.removeAllListeners = function(){
			if(this._a5_listeners)
				this._a5_listeners = {};
		}
		
		/**
		 * Returns the total number of listeners attached to the parent object.
		 * @name getTotalListeners
		 */
		proto.getTotalListeners = function(type){
			if (typeof type === 'string') {
				var arr = this._a5_getListenerArray(type);
				if(arr)
					return arr.length;
				else
					return 0;
			} else {
				var count = 0;
				for(var prop in this._a5_listeners)
					count += this._a5_listeners[prop].length;
				return count;
			}
		} 
		
		/**
		 * Sends an event object to listeners previously added to the event chain. By default an event object with a target property is sent pointing to the sender. If a custom object is sent with a target property, this property will not be overridden.
		 * @name dispatchEvent
		 * @param {String|a5.Event} event The event object to dispatch.  Or, if a string is passed, the 'type' parameter of the event to dispatch. 
		 */
		proto.dispatchEvent = function(event, data, bubbles){
			var e = this._a5_createEvent(event, data, bubbles);
			//target phase only
			e._a5_phase = a5.EventPhase.AT_TARGET;
			this._a5_dispatchEvent(e);
			if(!e.shouldRetain()) e.destroy();
			e = null;
		}
		
		/**
		 * Override this method to be notified of listener addition or removal.
		 * @name eListenersChange
		 * @param {Object} e The event object
		 * @param {String} e.type - The event type associated with the change.
		 * @param {Object} e.method - The listener method associated with the change.
		 * @param {String} e.changeType - Specifies what the type the change was, either 'ADD' or 'REMOVE'. 
		 */
		proto.eListenersChange = function(e){}
		
		//private methods
		
		proto._a5_addEventListener = function(type, method, useCapture, $scope, $isOneTime){
			var scope = $scope || null,
				types = type.split('|'),
				isOneTime = $isOneTime || false,
				shouldPush = true,
				i, l, listArray, j, m;
			if (types.length != 0 && method != undefined) {
				for (i = 0, l = types.length; i < l; i++) {
					listArray = this._a5_getListenerArray(types[i], true);
					for (j = 0, m = listArray.length; j < m; j++) {
						if (listArray[j].method === method && listArray[j].type === types[i] && listArray[j].useCapture === useCapture) {
							shouldPush = false;
							break;
						}
					}
					if (shouldPush) {
						listArray.push({
							type: types[i],
							method: method,
							scope: scope,
							useCapture: useCapture === true,
							isOneTime:isOneTime
						});
					}
				}
				this.eListenersChange({
					type: types.length > 1 ? types : types[0],
					method: method,
					changeType: 'ADD'
				});
			} else
				throw 'invalid listener: type- ' + type + ', method- ' + method;
		}
		
		proto._a5_createEvent = function(event, data, bubbles){
			//if event was passed as a string, create a new Event object
			var e = (typeof event === 'string') ? a5.Create(a5.Event, [event, bubbles]) : event;
			if(e instanceof a5.Event || e.doesExtend && e.doesExtend(a5.Error)){
				e._a5_target = this;
				if(data)
					e._a5_data = data;
				return e;
			}
			throw 'Invalid event type.';
		}
		
		proto._a5_dispatchEvent = function(e){
			e._a5_currentTarget = this;
			if (this._a5_listeners) {
				var typeArray = this._a5_getListenerArray(e.type()),
					i, l, thisListener, validPhase;
				if (typeArray) {
					for (i = 0, l = typeArray.length; i < l; i++) {
						thisListener = typeArray ? typeArray[i] : null;
						if (e._a5_canceled || !thisListener) return; //if the event has been canceled (or this object has been destroyed), stop executing
						validPhase = (e.phase() === a5.EventPhase.CAPTURING && thisListener.useCapture) || (e.phase() !== a5.EventPhase.CAPTURING && !thisListener.useCapture), validListener = typeof thisListener.method === 'function' && (thisListener.scope && thisListener.scope.namespace ? thisListener.scope._a5_initialized : true);
						if (validPhase && validListener) thisListener.method.call(thisListener.scope, e);
						if (thisListener.isOneTime === true || (!validListener && this._a5_autoPurge)) {
							typeArray.splice(i, 1);
							i--;
							l--;
						}							
					}
				}
			}
		}
		
		proto._a5_getListenerArray = function(type, create){
			if (this._a5_listeners[type] === undefined) {
				if (create === true) {
					this._a5_listeners[type] = [];
					return this._a5_listeners[type];
				}
				return null;
			}
			return this._a5_listeners[type];
		}
		
		proto.dealloc = function(){
			this.dispatchEvent(a5.Create(a5.Event, [a5.Event.DESTROYED]));
			this.removeAllListeners();
			this._a5_listeners = null;
		}
		
});

a5.SetNamespace('a5.ErrorDefinitions', {
	//100: root level
	100:'invalid namespace "{namespace}", namespaces must contain only letters, numbers, or periods.',
	101:'TrackWindowStrays must be called prior to GetWindowStrays.',
	//200: class processing
	200:'Invalid attempt to define new method "{prop}" in class "{namespace}", without calling override, method exists in superclass.',
	201:'Invalid attempt to override method "{prop}" in class "{namespace}", method marked as Final in superclass.',
	202:'Invalid attempt to override method "{prop}" in class "{namespace}", method not defined in superclass.',
	203:'Invalid attempt to override method "{prop}" in class "{namespace}", method marked as Final in superclass.',
	204:'Interface "{objNM}" cannot extend the non interface class "{clsNM}"',
	205:'Mixin "{nm}" doesn not specify a constructor.',
	206:'Class definitions not found for the following expected {classPlural}: \n {clsString}',
	207:'Error creating new class instance: cannot find object {className}.',
	208:'Cannot instantiate class {nm} , interfaces must be associated by the Implements directive.',
	209:'Error creating class instance {nm} ({errorStr})',
	210:'Superclass called on an object without a superclass.',
	211:'Constructor not defined on class "{nm}"',
	212:'invalid scope argument passed to superclass constructor on class "{nm}".',
	213:'Cannot implement "{implNM}" on class "{objNM}", class is not an interface.',
	214:'Invalid implementation of interface "{implNM}" , on class "{objNM}".',
	215:'Destroy called on core object "{nm}"',
	216:'Cannot directly instantiate class "{nm}", class marked as abstract.',
	217:'Cannot create new instance of class "{nm}", class marked as singleton already exists.',
	218:'Constructor not defined on class "{clsName}"',
	219:'Class "{currClass}" requires "{checkedClass}"',
	220:'Invalid attempt to define new method "{prop}" in class "{namespace}", without calling override, method exists in mixin.',
	
	//300: attributes
	300:'Invalid attribute definition: "Attributes" call must take a function as its last parameter.',
	301:'Invalid attribute definition: No attributes were defined.',
	302:'Attribute error: Attributes call accepts only arrays as attribute annotations.',
	303:'Attribute error: First parameter must be a reference to a class that extends a5.Attribute.',
	304:'Attribute error: invalid parameter specified for Attribute, params must be key/value pair objects.',
	305:'Attribute error: no parameters passed to Attribute call.',
	308:'Error processing attribute "{prop}", "{method}" must return a value.',
	
	//400: mixins
	400:'invalid scope argument passed to superclass constructor on class "{nm}".',
	401:'Mixin "{nm}" requires owner class to mix "{cls}".',
	402:'Mixin "{nm}" already mixed into ancestor chain.',
	403:'Invalid mixin: Method "{method}" defined by more than one specified mixin.',
	404:'Invalid mixin: Mixin "{mixin}" does not exist.',
	
	//600: Contract
	601:'Invalid implementation of Contract on interace {intNM} in class {implNM} for method {method}.'
})



})(this);


/** @name a5.cl
 * @namespace Framework classes.
 */
a5.SetNamespace('a5.cl'); 

/**
 * @function
 * @type a5.cl.CL
 * @returns Shortcut to the instance of the A5 CL application.
 */
a5.cl.instance = function(){
	return a5.cl.CL.instance();
}

/**
 * @function
 * Initializes an instance of the A5 CL framework.
 * @param {Object|String} props
 * @param {String} [props.applicationPackage]
 * @param {String|a5.cl.CLApplication} [props.application]
 * @param {String} [props.rootController]
 * @param {String} [props.rootViewDef]
 * @param {String} [props.environment]
 * @param {String} [props.clientEnvironment]
 * @type Function
 * @returns A function that returns the singleton instance of the application framework.
 */
a5.cl.CreateApplication = function(props, callback){
	if (!a5.cl.instance()) {
		if(typeof props === 'function'){
			callback = props;
			props = undefined;
		}
		props = (props === undefined ? {}:((typeof props === 'object') ? props : {applicationPackage:props}));
		if(callback && typeof callback === 'function')
			a5.CreateCallback(callback);
		
		var initialized = false,

		onDomReady = function(){
			if (!props && a5.cl.CLMain._extenderRef.length === 0) {
				var str = 'CreateApplication requires at least one parameter:\n\na5.cl.CreateApplication("app"); or a class that extends a5.cl.CLMain.';
				a5.cl.core.Utils.generateSystemHTMLTemplate(500, str, true);
				throw str;
			} else {
				if (!initialized) {
					a5.Create(a5.cl.CL, [props])
					initialized = true;
					for(var i = 0, l = a5.cl._cl_createCallbacks.length; i<l; i++)
						a5.cl._cl_createCallbacks[i](a5.cl.instance());
					a5.cl._cl_createCallbacks = null;
				}
			}
		},
	
		domContentLoaded = function(){
			if (document.addEventListener) {
				document.removeEventListener( "DOMContentLoaded", domContentLoaded, false);
				onDomReady();
			} else if ( document.attachEvent ) {
				if ( document.readyState === "complete" ) {
					document.detachEvent("onreadystatechange", domContentLoaded);
					onDomReady();
				}
			}
		}
		
		if (document.readyState === "complete") {
			onDomReady();
		} else if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", domContentLoaded, false);
		} else if (document.attachEvent) {
			document.attachEvent("onreadystatechange", domContentLoaded);
		}
		return function(){
			return a5.cl.CL.instance();
		}
	} else {
		throw "Error: a5.cl.CreateApplication can only be called once.";
	}
}

a5.cl._cl_createCallbacks = [];

a5.cl.CreateCallback = function(callback){
	a5.cl._cl_createCallbacks.push(callback);
}




/**
 * @class Base class for all classes in the AirFrame CL MVC framework. 
 * <br/><b>Abstract</b>
 * @name a5.cl.CLBase
 * @extends a5.CLEventDispatcher
 */
a5.Package('a5.cl')

	.Extends('a5.EventDispatcher')
	.Prototype('CLBase', function(proto){
		
		/**#@+
	 	 * @memberOf a5.cl.CLBase#
	 	 * @function
		 */	
		this.Properties(function(){
			this._cl_mvcName = null;
		})
		
		proto.CLBase = function(){
			proto.superclass(this);
		}
		
		/**
		 * @name cl
		 * @return
		 * @type a5.cl.MVC#
		 */
		proto.cl = function(){
			return a5.cl.instance();
		}
		
		/**
		 * Returns an instance of the class defined by the following parameters:
		 * @name getClassInstance
		 * @param {String} type One of 'Domain', 'Service', or 'Controller'
		 * @param {String} className The functional name of the class. For example, if you class is called 'FooController', the className value would be 'Foo'. 
		 */
		proto.getClassInstance = function(type, className){
			return this.cl()._core().instantiator().getClassInstance(type, className);
		}
		
		/**
		 * @name log
		 */
		proto.log = function(value){
			var plgn = this.plugins().getRegisteredProcess('logger');
			if (plgn) 
				return plgn.log.apply(this, arguments);
			else
				if ('console' in window) 
					console.log.apply(console, arguments);
		}
		
		proto.warn = function(value){
			var plgn = this.plugins().getRegisteredProcess('logger');
			if (plgn) 
				return plgn.warn.apply(this, arguments);
			else
				if ('console' in window) 
					console.warn.apply(console, arguments);
		}
		
		proto.Override.throwError = function(error){
			proto.superclass().throwError(error, a5.cl.CLError);
		}
		
		/**
		 * Returns the configuration object.
		 * @name config
		 */
		proto.config = function(){
			return this.cl().config();
		}
		
		/**
		 * @name plugins
		 */
		proto.plugins = function(){
			return this.cl().plugins();
		}
		
		/**
		 * Returns the appParams object as specified in the config object
		 * @name appParams
		 */
		proto.appParams = function(){
			return this.cl().appParams();
		}
});




a5.Package('a5.cl')

	.Extends('a5.Error')
	.Prototype('CLError', function(proto, im){
		
		proto.CLError = function(){
			proto.superclass(this, arguments);
			this.type = 'CLError';
		}
})



/**
 * @class Worker class instance, performs a task on a worker thread when available or in the browser thread when not.
 * <br/><b>Abstract</b>
 * @name a5.cl.CLWorker
 * @extends a5.CLEventDispatcher
 */
a5.Package('a5.cl')
	
	.Extends('CLBase')
	.Prototype('CLWorker', 'abstract', function(proto, im){
		
		/**#@+
	 	 * @memberOf a5.cl.CLWorker#
	 	 * @function
		 */
		
		proto.CLWorker = function(isWorker){
			proto.superclass(this);
			if(this.isSingleton())
				this.throwError("Workers cannot be singletons.");
			this._cl_communicator = null;
			this._cl_JSON = a5.cl.core.JSON || JSON;
			this._cl_isWorker = (isWorker === '_cl_isWorkerInitializer');
			if (!this._cl_isWorker) 
				this.workerInit.apply(this, arguments);
		}
		
		proto.workerInit = function(){}
		
		proto.defineWorkerMethods = function(func){
			//call func, passing worker obj and data
		}		
		
		/**
		 * @name JSON
		 */
		proto.JSON = function(){
			return this._cl_JSON;
		}
		
		/**
		 * @name createWorker
		 * @param {Object} props
		 */
		proto.createWorker = function(data){
			if (!this._cl_isWorker) {
				data = data || {};
				var self = this,
				workerURL = this.config().workersPath,
				includes = this.config().workersIncludes,
				handleMessages = function(obj){
					if (obj.log) {
						self.log(obj.log);
					} else if (obj.error) {
						self.throwError(obj.error);
					} else {
						var method = null;
						try {
							method = self[obj.action];
						} catch (e) {
							throw 'a5.cl.CLWorkerOwner Error: invalid action ' + obj.action + ' on class ' + self.namespace();
						}
						if (method) method.apply(null, obj.id || []);
					}
				}
				if (workerURL && 'Worker' in window) {
					this._cl_communicator = new Worker(workerURL);
					this._cl_communicator.onmessage = function(e){
						handleMessages(self._cl_JSON.parse(e.data));
					}
				} else {
					var runInstance;
					this._cl_communicator = {
						postMessage: function(e){
							e = self._cl_JSON.parse(e);
							if (e.init) {
								runInstance = a5.Create(e.init, ['_cl_isWorkerInitializer']);
								runInstance._cl_setCommunicator({
									postMessage: function(obj){
										obj = self._cl_JSON.parse(obj);
										handleMessages(obj);
									}
								});
								runInstance.defineWorkerMethods(runInstance, data);
							} else if (e.destroy) {
								//Do nothing in main thread
							} else {
								runInstance[e.action].apply(self, e.id);
							}
						}
					}
				}
				this._cl_postMessage({
					init: this.namespace(),
					includes: includes,
					data: data
				});
			} else {
				self.throwError('Cannot call createWorker from worker methods.');
			}
		}
		
		/**
		 * @name callMethod
		 * @param {String} action
		 * @param {Array} [id]
		 */
		proto.callMethod = function(action, id){
			this._cl_postMessage({action:action, id:id});
		}
		
		/**
		 * @name log
		 * @param {String} value
		 */
		proto.Override.log = function(value){
			if(this._cl_isWorker)
				this._cl_postMessage({log:value});
			else 
				proto.superclass().log.apply(this, arguments);
		}
		
		/**
		 * @name throwError
		 * @param {Object|String} value
		 */
		proto.Override.throwError = function(error){
			//TODO: get stack from worker thread before passing along
			if(this._cl_isWorker)
				proto.throwError(error, false, this.throwError.caller.arguments);
			else
				proto.superclass().throwError.apply(this, arguments);
		}
		
		proto._cl_setCommunicator = function(communicator){
			if(this._cl_isWorker)
				this._cl_communicator = communicator;
		}
		
		proto._cl_postMessage = function(message){
			this._cl_communicator.postMessage(this._cl_JSON.stringify(message));
		}
		
		proto.dealloc = function(){
			if(!this._cl_isWorker)
				this.callMethod('destroy');
		}			
});


a5.Package('a5.cl')

	.Enum('CLLaunchState', function(cls){
		
		cls.addValue('APPLICATION_INITIALIZING');
		cls.addValue('DEPENDENCIES_LOADING');
		cls.addValue('DEPENDENCIES_LOADED');
		cls.addValue('AUTO_INSTANTIATION_COMPLETE');
		cls.addValue('PLUGINS_LOADED');
		cls.addValue('LAUNCH_INTERCEPTED');
		cls.addValue('APPLICATION_WILL_LAUNCH');
		cls.addValue('APPLICATION_LAUNCHED');
})


/**
 * @class 
 * @name a5.cl.CLEvent
 */
a5.Package('a5.cl')
	
	.Extends('a5.Event')
	.Static(function(CLEvent){
		
		/**
		 * @event
		 * @param {Boolean} online Specifies whether the browser is currently online.
		 * @description Dispatched when a change in the online status of the application occurs (HTML5 only).
		 */
		CLEvent.ONLINE_STATUS_CHANGE = 'onlineStatusChange';
		
		CLEvent.ERROR_THROWN = 'errorThrown';
		
		/**
		 * @event
		 * @description Dispatched when the dom has completely loaded, the framework has been successfully loaded to the dom, and the framework is starting instatiation. 
		 * */
		CLEvent.APPLICATION_INITIALIZING = "applicationInitializing";
		
		/**
		 * @event
		 * @param {Number} count
		 * @param {Number} total
		 * @description Dispatched while dependencies are loading to the DOM.
		 */
		CLEvent.DEPENDENCIES_LOADING = "dependenciesLoading";
		
		/**
		 * @event
		 * @description Dispatched when all dependencies specified in the configuration file have been successfully loaded to the DOM.
		 */
		CLEvent.DEPENDENCIES_LOADED = 'dependenciesLoaded';
		
		/**
		 * @event
		 * @description Dispatched when auto detected classes have been successfully instantiated.
		 */
		CLEvent.AUTO_INSTANTIATION_COMPLETE = 'autoInstantiationComplete';
		
		/**
		 * @event
		 * @description Dispatched when all plugins have successfully loaded, if any.
		 */
		CLEvent.PLUGINS_LOADED = 'pluginsLoaded';
		
		/**
		 * @event
		 * @param {a5.cl.interfaces.ILaunchInterceptor} e.interceptor The plugin that has intercepted the launch.
		 * @description Dispatched when the application launch has been intercepted by a plugin that has registered to stall the application launch.
		 */
		CLEvent.LAUNCH_INTERCEPTED = 'launchIntercepted';
		
		/**
		 * @event
		 * @description Dispatched when the application is ready to initialize.
		 */
		CLEvent.APPLICATION_WILL_LAUNCH = 'applicationWillLaunch';
		
		/**
		 * @event
		 * @description Dispatched when the application has successfully initialized.
		 */
		CLEvent.APPLICATION_LAUNCHED = 'applicationLaunched';
		
		/**
		 * @event
		 * @description Dispatched when the window is about to be closed.
		 */
		CLEvent.APPLICATION_WILL_CLOSE = 'applicationWillClose';
		
		/**
		 * @event
		 * @description Dispatched when the window is closing.
		 */
		CLEvent.APPLICATION_CLOSED = 'applicationClosed';
		
		/**
		 * @event
		 * @param {Number} width
		 * @param {Number} height
		 * @description Dispatched when the window is resized.
		 */
		CLEvent.WINDOW_RESIZED = 'windowResized';
		
		/**
		 * @event
		 * @param {Array} parsedLinks
		 * @description Dispatched when the address bar hash changes
		 */
		CLEvent.HASH_CHANGE = 'hashChange';
		
		/**
		 * @event
		 * @description Dispatched when the application is about to relaunch.
		 */
		CLEvent.APPLICATION_WILL_RELAUNCH = 'applicationWillRelaunch';
		
		
		/**
		 * @event
		 * @description Dispatched repeatedly at the specified update rate from {@link a5.cl.CLConfig#globalUpdateTimerInterval}.
		 */
		 CLEvent.GLOBAL_UPDATE_TIMER_TICK = 'globalUpdateTimerTick';
		
		/**
		 * @event
		 * @description Dispatched when async service requests start
		 */
		CLEvent.ASYNC_START = 'asyncStart';
		
		/**
		 * @event
		 * @description Dispatched when async service requests complete
		 */
		CLEvent.ASYNC_COMPLETE = 'asyncComplete';
		
		 /**
		 * @event
		 * @description Dispatched when the client orientation has changed. This is only dispatched for mobile or tablet client environments.
		 */
		CLEvent.ORIENTATION_CHANGED = 'orientationChanged';
		
		/**
		 * @event
		 * @description Dispatched when the client environment has switched. This is only relevant when the configuration flag 'clientEnvironmentOverrides' is set to true.
		 */
		CLEvent.CLIENT_ENVIRONMENT_UPDATED = 'clientEnvironmentUpdated';
		 /**
		 * @event
		 * @param {Number} errorType
		 * @description Dispatched when an application error occurs.
		 * 
		 */
		CLEvent.APPLICATION_ERROR = 'applicationError';
		
		/**
		 * @event
		 * @description Dispatched when the render() method is called on a mappable controller.
		 * @param {a5.cl.CLController} controller
		 */
		CLEvent.RENDER_CONTROLLER = 'renderController';
		
		/**
		 * @event
		 * @description Dispatched by CLViews when they are added to a parent view.  This event is useful for detecting when children are added to a specific branch of the view tree.
		 */
		CLEvent.ADDED_TO_PARENT = 'addedToParent';
		
		/**
		 * @event
		 * @description Dispatched by CLViews when they are added to a parent view.  This event is useful for detecting when children are added to a specific branch of the view tree.
		 */
		CLEvent.REMOVED_FROM_PARENT = 'removedFromParent';
	})
	.Prototype('CLEvent', function(proto, im){
		
		proto.CLEvent = function(){
			proto.superclass(this, arguments);
		}	
});


a5.Package('a5.cl.interfaces')

	.Interface('IHTMLTemplate', function(cls){
		
		cls.populateTemplate = function(){}
})




a5.Package('a5.cl.interfaces')

	.Interface('ILogger', function(cls){
		
		cls.log = function(){}
})




a5.Package('a5.cl.interfaces')

	.Interface('IServiceURLRewriter', function(cls){
		
		cls.rewrite = function(){}
})



a5.Package('a5.cl.interfaces')
	.Interface('IDataStorage', function(IDataStorage){
		
		IDataStorage.isCapable = function(){};
		IDataStorage.storeValue = function(){};
		IDataStorage.getValue = function(){};
		IDataStorage.clearValue = function(){};
		IDataStorage.clearScopeValues = function(){};
		
});



a5.Package('a5.cl.interfaces')
	
	.Interface('IBindableReceiver', function(cls){
		
		cls.receiveBindData = function(){}
});


a5.Package('a5.cl.core')

	.Extends('a5.cl.CLBase')
	.Class('PluginManager', 'singleton final', function(self){
	
		var plugins = [],
			addOns = [],
			processes = {
				animation:null,
				htmlTemplate:null,
				serviceURLRewriter:null,
				logger:null,
				dataStorage:null,
				launchInterceptor:null,
				presentationLayer:null
			}
		
		this.PluginManager = function(){
			self.superclass(this);
			self.plugins()['getRegisteredProcess'] = this.getRegisteredProcess;
		}
		
		this.instantiatePlugins = function(){
			var classes = [], i, l, plugin, pi, cfg, obj;
			for(i = 0, l=a5.cl.CLPlugin._extenderRef.length; i<l; i++)
				if(a5.cl.CLPlugin._extenderRef[i] !== a5.cl.CLAddon)
					classes.push(a5.cl.CLPlugin._extenderRef[i]);
			for (i = 0, l = a5.cl.CLAddon._extenderRef.length; i < l; i++) {
				addOns.push(a5.cl.CLAddon._extenderRef[i]);
				classes.push(a5.cl.CLAddon._extenderRef[i]);
			}
			for(i = 0, l=classes.length; i<l; i++){
				plugin = classes[i];
				if (!plugin.isAbstract()) {
					pi = plugin.instance(true);
					cfg = pi._cl_sourceConfig(); 
					obj = a5.cl.core.Utils.mergeObject(cfg || {}, pi.configDefaults());
					pi._cl_isFinal = pi._cl_isSingleton = true;
					if (!a5.cl.core.Utils.testVersion(pi.requiredVersion())) {
						throw 'Error - plugin "' + plugin.className() + '" requires at least CL version ' + pi.requiredVersion();
						return;
					}
					if (pi.maxVerifiedVersion() && !self.config().allowUntestedPlugins && !a5.cl.core.Utils.testVersion(pi.maxVerifiedVersion(), true)) {
						throw 'Error - untested version';
						return;
					}
					pi._cl_pluginConfig = obj;
					
					if (pi instanceof a5.cl.CLAddon) {
						if (a5.cl.CLBase.prototype[plugin.className()] === undefined) {
							a5.cl.CLBase.prototype[plugin.className()] = function(){
								var p = pi;
								return function(){
									return p;
								}
							}()
							
						}
					} else {
						if (self.plugins()[plugin.className()] == undefined) {
							self.plugins()[plugin.className()] = function(){
								var p = pi;
								return function(){
									return p;
								}
							}()
						}
					}
					plugins.push(pi);
				}
			}
			for(var i = 0, l=plugins.length; i<l; i++){
				var checkResult = checkRequires(plugins[i]);
				if(checkResult){
					throw 'Error: plugin "' + plugins[i].className() + '" requires plugin "' + checkResult;
					return;
				}
				plugins[i].initializePlugin();
					
			}
			a5.cl.PluginConfig = function(){
				self.throwError(self.create(a5.cl.CLError, ['Invalid call to MVC pluginConfig method: method must be called prior to plugin load.']));
			}
		}
		
		this.defineRegisterableProcess = function(process){
			processes[process] = null;
		}
		
		this.registerForProcess = function(type, instance){
			var val = processes[type];
			if(val === null)
				processes[type] = instance;
			else if (val === undefined)
				self.redirect(500, "Error registering process for type '" + type + "', type does not exist.");
			else
				self.warn("Multiple plugins trying to register for process '" + type + "'.");
		}
		
		this.getRegisteredProcess = function(type){
			return processes[type];
		}
		
		this.processAddons = function(callback){
			var count = 0,
			processAddon = function(){
				if (count >= addOns.length) {
					callback();
					return;
				} else {
					var addOn = addOns[count].instance(),
						isAsync = addOn.initializeAddOn() === true;
					count++;
					if (isAsync) addOn.addOneTimeEventListener(a5.cl.CLAddon.INITIALIZE_COMPLETE, processAddon);
					else processAddon();
				}
			} 
			processAddon();
		}
		
		var checkRequires = function(plugin){
			var r = plugin._cl_requires;
			for(var i = 0, l = r.length; i<l; i++){
				if(!a5.GetNamespace(r[i]))
					return r[i];	
			}
			return false;
		}
});


a5.Package('a5.cl.core')

	.Import('a5.cl.CLEvent')
	.Extends('a5.cl.CLBase')
	.Class("EnvManager", 'singleton final', function(self, im){
	
		var _supportsCanvas,
		_isOnline,
		_clientEnvironment,
		_clientPlatform,
		_clientOrientation,
		_browserVersion,
		_environment,
		_isBB,
		_isLocal,
		_appPath,
		_appRoot;
		
		this.environment = function(){		return _environment;}		
		this.clientPlatform = function(){	return _clientPlatform;	}
		this.clientOrientation = function(){return _clientOrientation;	}
		this.clientEnvironment = function(){return _clientEnvironment;	}
		this.browserVersion = function(){ return _browserVersion; }	
		this.isOnline = function(){	return _isOnline;}		
		this.isLocal = function(){ return _isLocal; }
		this.appPath = function(root){ return root ? _appRoot:_appPath; }	
		
		this.EnvManager = function($environment, $clientEnvironment){
			self.superclass(this);
			_isOnline = true;
			_supportsCanvas = !!document.createElement('canvas').getContext;
			_clientOrientation = getOrientation();
			if($clientEnvironment) _clientEnvironment = $clientEnvironment;
			else if(self.config().clientEnvironment)_clientEnvironment = self.config().clientEnvironment;
			else _clientEnvironment = testForClientEnvironment();
			testClientPlatform();
			testBrowserVersion();
			if($environment) _environment = $environment;
			else _environment = self.config().environment;
			var envObj = checkConfigProp(_environment, self.config().environments); 
			if(envObj) a5.cl.core.Utils.mergeObject(envObj, self.config(), true);
			var cEnvObj = checkConfigProp(_clientEnvironment, self.config().clientEnvironments);
			if(cEnvObj) a5.cl.core.Utils.mergeObject(cEnvObj, self.config(), true);
			_isLocal = window.location.protocol == 'file:';
			setAppPath();
		}
		
		this.initialize = function(){
			setupWindowEvents();
			try{
				 document.body.addEventListener('online', update);
				 document.body.addEventListener('offline', update);
			} catch(e){}
		}
		
		var update = function(){
			if(navigator.onLine !== undefined){
				var newVal = navigator.onLine;
				if(newVal != _isOnline){
					_isOnline = newVal;
					a5.cl.instance().dispatchEvent(im.CLEvent.ONLINE_STATUS_CHANGE, {online:self.isOnline()});
				}
			}
		}
	
		var testForClientEnvironment = function(){
			if('runtime' in window){
				return 'AIR';
			} else if('connection' in window && 'notification' in window && 'contacts' in window){
				return 'PHONEGAP';
			}else {
				var isMobile = mobileTest(),
				isTablet = isMobile && screen.width >= self.config().mobileWidthThreshold;
				_isBB = window.blackberry != undefined;
				if(_isBB) isMobile = true;
				if(isTablet) return 'TABLET';
				else if (isMobile) return 'MOBILE';
				else return 'DESKTOP';	
			}	
		}
		
		var mobileTest = function(){
			if(window.orientation !== undefined)
				return true;
			var propArray = ['ontouchstart'];
			var elem = document.createElement('div');
			for (var i = 0, l = propArray.length; i<l; i++){
				elem.setAttribute(propArray[i], 'return;');
				if(typeof elem[propArray[i]] === 'function')
					return true;
			}
			elem = null;
			if(navigator.userAgent.toLowerCase().match(/mobile/i))
				return true;
			return false;
		}
		
		var testClientPlatform = function(){
			if(_isBB){
				if(_supportsCanvas) _clientPlatform = 'BB6';
				else _clientPlatform = 'BB';
			} else {
				if(navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) _clientPlatform = 'IOS';
				else if(navigator.userAgent.match(/Android/i)) _clientPlatform = 'ANDROID';
				else if(navigator.userAgent.match(/IEMobile/i)) _clientPlatform = 'WP7';
				else if(window.ActiveXObject) _clientPlatform = 'IE';
				// _clientPlatform = 'OSX';
			}
			if(!_clientPlatform) _clientPlatform = 'UNKNOWN';
		}
		
		var getOrientation = function(){
			if(typeof window.orientation !== 'undefined')
				return (window.orientation == 0 || window.orientation === 180) ? 'PORTRAIT' : 'LANDSCAPE';
			else
				return 'UNKNOWN';
		}
		
		var checkConfigProp = function(checkProp, obj){
			var foundProps = [], prop, propArray, isPositiveCase, envProp, i, l, canPush, isValidForNeg, retProp = null;
			for(prop in obj){
				isPositiveCase = true;
				envProp = prop;
				if (envProp.charAt(0) === '_') {
					isPositiveCase = false;
					envProp = envProp.substr(1);
				}
				propArray = envProp.split('_');
				canPush = false;
				isValidForNeg = true;
				for(i = 0, l=propArray.length; i<l; i++){
					if(isPositiveCase){
						 if (propArray[i] === checkProp) {
						 	canPush = true;
							break;
						 }
					} else {
						if(propArray[i] === checkProp)
							isValidForNeg = false;
							break;
					}
				}
				if((isPositiveCase && canPush) ||
				   (!isPositiveCase && isValidForNeg))
						foundProps.push(obj[prop]);
			}
			if(foundProps.length)
				retProp = foundProps[0];
			if(foundProps.length >1)
				for(i = 1, l=foundProps.length; i<l; i++)
					a5.cl.core.Utils.mergeObject(foundProps[i], retProp, true);
			return retProp;
		}
		
		var testBrowserVersion = function(){
			_browserVersion = 0;
			if (document.body.style.scrollbar3dLightColor!=undefined) {
				if (document.body.style.opacity!=undefined) { _browserVersion = 9; }
				else if (!self.config().forceIE7 && document.body.style.msBlockProgression!=undefined) { _browserVersion = 8; }
				else if (document.body.style.msInterpolationMode!=undefined) { _browserVersion = 7; }
				else if (document.body.style.textOverflow!=undefined) { _browserVersion = 6; }
				else {_browserVersion = 5.5; }
			}
		}
		
		var setAppPath = function(){
			var pathname = window.location.pathname;
			if(pathname.indexOf('.') != -1) pathname = pathname.substr(0, pathname.lastIndexOf('/') + 1);
			_appRoot = window.location.protocol + '//' + window.location.host;
			_appPath = _appRoot + pathname;
			if(_appPath.charAt(_appPath.length-1) != '/') _appPath += '/';
		}
		
		var setupWindowEvents = function(){
			window.onbeforeunload = function(){
				/* need close interceptor in mvc
				var val = self.cl().application().applicationWillClose();
				if (typeof val == 'string') return val;
				*/
				self.cl().dispatchEvent(im.CLEvent.APPLICATION_WILL_CLOSE);
			}
			window.onunload = function(){
				self.cl().dispatchEvent(im.CLEvent.APPLICATION_CLOSED);
			}
			if (self.config().trapErrors === true){
				window.onerror = function(e, url, line){
					e = e || window.error;
					if(e === 'Script error.')
						e = "Cannot discern error data from window.onerror - Possible cause is loading A5 from a cross domain source.\nTry disabling trapErrors to use the console or load a local copy of A5.";
					var clErr = a5._a5_getThrownError();
					if(clErr && e !== "" && e.indexOf(clErr.toString()) !== -1)
						e = clErr;
					else
						e = a5.Create(a5.Error, [e, false]);
					if(url) e.url = url;
					if(line) e.line = line;
					self.dispatchEvent(im.CLEvent.ERROR_THROWN, e);			
					return true;
				};
			}
			var orientationEvent = ("onorientationchange" in window) ? "onorientationchange" : "onresize";
			window[orientationEvent] = function() {
				self.cl().dispatchEvent(im.CLEvent.WINDOW_RESIZED);
			    var newOrientation = getOrientation();
				if(newOrientation !== _clientOrientation){
					_clientOrientation = newOrientation;
					if (_clientEnvironment === 'MOBILE' || _clientEnvironment === 'TABLET')
						self.cl().dispatchEvent(im.CLEvent.ORIENTATION_CHANGED);
				}
			}
			if (orientationEvent !== 'onresize') {
				window.onresize = function(){
					self.cl().dispatchEvent(im.CLEvent.WINDOW_RESIZED);
				}
			}
		}
		
})


a5.Package('a5.cl.core')
	
	.Import('a5.cl.CLEvent')
	.Extends('a5.cl.CLBase') 
	.Class('Instantiator', 'singleton final', function(self, im){
	
		var applicationPackage,
		_applicationPackageInstance,
		namespaceArray = [['services', [a5.cl.CLService, a5.cl.CLSocket, a5.cl.CLAjax]]];
		
		this.Instantiator = function($applicationPackage){
			self.superclass(this);
			applicationPackage = $applicationPackage;
			_applicationPackageInstance = a5.SetNamespace(applicationPackage);
		}
		
		this.applicationPackage = function(returnString){
			if(returnString) return applicationPackage;
			else return _applicationPackageInstance;
		}
		
		this.registerAutoInstantiate = function(name, clsArray){
			namespaceArray.push([name, clsArray]);
		}
		
		this.Override.getClassInstance = function(type, className, instantiate){
			var instance = null,
			namespace = null;
			if(className.indexOf('.') !== -1)
				namespace = a5.GetNamespace(className);
			else 
				namespace = getClassNamespace(type, className);
			if(namespace)
				instance = namespace.instance(!!instantiate);
			return instance;
		}
		
		this.createClassInstance = function(clsName, type){
			var cls = getClassNamespace(type, clsName),
			instance,
			clsPath = null;
			if (cls) {
				var clsInstance;
				clsInstance = (cls._a5_instance === null) ? this.create(cls) : cls.instance();
				clsInstance._cl_setMVCName(clsName);
				return clsInstance;
			} else {
				return null;
			}
		}
		
		this.instantiateConfiguration = function(){
			var retObj = a5.cl.CLMain._cl_storedCfgs.config;
			var plgnArray = a5.cl.CLMain._cl_storedCfgs.pluginConfigs;
			for (var i = 0; i < plgnArray.length; i++) {
				var obj = {};
				var split = plgnArray[i].nm.split('.'),
					lastObj = obj;
				for(var j = 0; j< split.length; j++)
					lastObj = lastObj[split[j]] = j == split.length-1 ? plgnArray[i].obj:{};
				retObj.plugins = a5.cl.core.Utils.mergeObject(retObj.plugins, obj)
			}
			return retObj;
		}
		
		this.beginInstantiation = function(){
			for(var i = 0, l=namespaceArray.length; i<l; i++){
				var liveNamespace = a5.GetNamespace(applicationPackage + '.' + namespaceArray[i][0], null, true);
				if(liveNamespace && typeof liveNamespace == 'object'){
					for (var prop in liveNamespace) 
						if (typeof liveNamespace[prop] === 'function') {
							var instance = self.create(liveNamespace[prop]);
							liveNamespace[prop]._cl_isFinal = true;
							if (namespaceArray[i][0] === 'domains') {
								instance._name = prop;
								liveNamespace[prop]._a5_isSingleton = true;
							} else {
								instance._name = prop.substr(0, prop.toLowerCase().indexOf(namespaceArray[i][0].substr(0, namespaceArray[i][0].length - 1)));
							}
							var isValid = false;
							for(var j = 0, m=namespaceArray[i][1].length; j<m; j++)
								if(instance instanceof namespaceArray[i][1][j])
									isValid = true;
							if(!isValid)
								self.redirect(500, 'Error instantiating ' + namespaceArray[i][0] + ' class ' + instance.namespace() + ', must extend ' + namespaceArray[i][1].namespace());
						}
				}
			}
			self.cl().dispatchEvent(im.CLEvent.AUTO_INSTANTIATION_COMPLETE);
		}
		
		this.createConfig = function(userConfig){
			return userConfig ? a5.cl.core.Utils.mergeObject(userConfig, a5.cl.CLConfig):a5.cl.CLConfig;
		}
		
		var getClassNamespace = function(type, clsName){							   
			return a5.GetNamespace(applicationPackage + '.' + type.toLowerCase() + 's.' + clsName + (type == 'domain' ? '':(type.substr(0, 1).toUpperCase() + type.substr(1))));
		}
})


/**
 * @class Sets properties for the application.
 * @name a5.cl.CLConfig
 */
a5.SetNamespace("a5.cl.CLConfig", {	
	
	/**
	 * @field
	 * @type  Boolean 
	 * @name a5.cl.CLConfig#allowUntestedPlugins
	 * @default false
	 */
	allowUntestedPlugins:false,
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#appName
	 * @default an empty string
	 */
	appName:'',
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#applicationPackage
	 * @default an empty string
	 */
	applicationPackage:'',
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#applicationViewPath
	 * @default 'views/'
	 */
	applicationViewPath:'views/',
	
	/**
	 * @field
	 * @type  Boolean 
	 * @name a5.cl.CLConfig#cacheEnabled
	 * @default true
	 */
	cacheEnabled:true,
	
	/**
	 * @field
	 * @type Array
	 * @name a5.cl.CLConfig#cacheTypes
	 */
	cacheTypes:[],
	
	/**
	 * @field
	 * @type  String
	 * @name a5.cl.CLConfig#clientEnvironment
	 * @see a5.cl.MVC#clientEnvironment
	 * @default null
	 */
	clientEnvironment:null,
	
	/**
	 * @field
	 * @type  Object 
	 * @name a5.cl.CLConfig#clientEnvironments
	 * @default an empty object
	 */
	clientEnvironments: {},
	
	/**
	 * Specifies whether browser dimension changes are allowed to trigger redraws to different client environment settings. 
	 * @field
	 * @type Boolean
	 * @name a5.cl.CLConfig#environmentOverrides
	 * @default false
	 */
	clientEnvironmentOverrides:false,
	
	/**
	 * Specifies a default view container target for render calls. Defaults to the root window of the application. 
	 * @field
	 * @type a5.cl.CLViewContainer
	 * @name a5.cl.CLConfig#defaultRenderTarget
	 * @default null
	 */
	defaultRenderTarget:null,
	
	/**
	 * @field
	 * @type  Array 
	 * @name a5.cl.CLConfig#dependencies
	 * @default an empty array
	 */
	dependencies: [],
	
	/**
	 * @field
	 * @type  String
	 * @name a5.cl.CLConfig#environment
	 * @see a5.cl.MVC#environment
	 * @default 'DEVELOPMENT'
	 */
	environment:'DEVELOPMENT',
	
	/**
	 * @field
	 * @type  Object 
	 * @name a5.cl.CLConfig#environments
	 * @default an empty object
	 */
	environments: {},
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#faviconPath
	 * @default an empty string
	 */
	faviconPath:'',
	
	/**
	 * @field
	 * @type  Boolean 
	 * @name a5.cl.CLConfig#forceIE7
	 * @default true
	 */
	forceIE7:true,
	
	/**
	 * @field
	 * @type Number
	 * @name a5.cl.CLConfig#globalUpdateTimerInterval
	 * @default 100
	 */
	globalUpdateTimerInterval:10,
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#hashDelimiter
	 * @default '#!'
	 */
	hashDelimiter:'#!',
	
	/**
	 * Specifies a browser width value for triggering mobile vs desktop (or tablet) rendering. 
	 * @field
	 * @type Number
	 * @name a5.cl.CLConfig#mobileWidthThreshold
	 * @default 768
	 */
	mobileWidthThreshold:768,
	
	/**
	 * @field
	 * @type Boolean
	 * @name a5.cl.CLConfig#persistORMData
	 * @default false
	 */
	persistORMData:false,

	plugins:{},
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#requestDefaultContentType
	 * @default 'application/json'
	 */
	requestDefaultContentType:'application/json',
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#requestDefaultMethod
	 * @default 'POST'
	 */
	requestDefaultMethod:'POST',
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#rootController
	 * @default null
	 */
	rootController:null,
	
	/**
	 * @field
	 * @type  XML 
	 * @name a5.cl.CLConfig#rootViewDef
	 * @default null
	 */
	rootViewDef:null,
	
	/**
	 * @field
	 * @type  String 
	 * @name a5.cl.CLConfig#rootWindow
	 * @default null
	 */
	rootWindow:null,
	
	/**
	 * @field
	 * @type Number
	 * @name a5.cl.CLConfig#schemaBuild
	 * @default 0
	 */
	schemaBuild:0,
	
	/**
	 * If true, the ASYNC_START and ASYNC_COMPLETE events will not be dispatched by includes.
	 * @field
	 * @type Boolean,
	 * @name a5.cl.CLConfig#silentIncludes
	 * @default false
	 */
	silentIncludes:false,
	
	staggerDependencies:true,
	/**
	 * Specifies the character delimiter to use when setting the address bar with an append value.
	 * @field
	 * @type String
	 * @name a5.cl.CLConfig#titleDelimiter
	 * @default ': '
	 */
	titleDelimiter:': ',
	
	/**
	 * @field
	 * @type Boolean
	 * @name a5.cl.CLConfig#trapErrors
	 * @default false
	 */
	trapErrors:false,
	
	/**
	 * @field
	 * @type  Array 
	 * @name a5.cl.CLConfig#viewDependencies
	 * @default an empty array
	 */
	viewDependencies:[],
	
	/**
	 * @field
	 * @type String
	 * @name a5.cl.CLConfig#workersPath
	 * @default null
	 */
	workersPath:null,
	
	/**
	 * @field
	 * @type Array
	 * @name a5.cl.CLConfig#workersIncludes
	 * @default an empty array
	 */
	workersIncludes:[],
	
	/**
	 * @field
	 * @type Boolean
	 * @name a5.cl.CLConfig#xhrDependencies
	 * @default false
	 */
	xhrDependencies:false
});



a5.Package('a5.cl.core')
	.Static('Utils', function(Utils){
		Utils.vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
		Utils.jsVendorPrefixes = ['Webkit', 'Moz', 'ms', 'o'];
		Utils.jsVendorMethodPrefixes = ['webkit', 'moz', 'ms', 'o'];
		
		Utils.purgeBody = function(){
			var body = document.getElementsByTagName('body')[0];
			body.innerHTML = '';
			body.style.margin = '0px';
		}
		
		Utils.trim = function(str){
			if(!str) return str;
			return str.replace(/(^\s+)|(\s+$)/g, "").replace(/\s{2,}/, " ");
		}
		
		Utils.getParameterByName = function(name){
		    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		}
		
		Utils.mergeObject = function(mergeObj, sourceObj, $setSourceObj){
			var setSourceObj = $setSourceObj || false,
				retObj, prop;
			if(mergeObj == null) return sourceObj;
			if(sourceObj == null) return mergeObj;
			function recursiveMerge(sourceObj, mergeObj){
				for(prop in mergeObj){
					if(prop !== 'prototype' && prop !== 'constructor'){
						if (sourceObj[prop] !== undefined && sourceObj[prop] !== null && sourceObj[prop] !== sourceObj) {
							if (typeof sourceObj[prop] === 'object') {
								if (Object.prototype.toString.call(sourceObj[prop]) === '[object Array]') {
									if (Object.prototype.toString.call(mergeObj[prop]) === '[object Array]') 
										sourceObj[prop] = sourceObj[prop].concat(mergeObj[prop]);
								} else {
									sourceObj[prop] = recursiveMerge(sourceObj[prop], mergeObj[prop]);
								}
							} else {
								sourceObj[prop] = mergeObj[prop];
							}
						}  else {
							sourceObj[prop] = mergeObj[prop];
						}
					}
				}
				return sourceObj;
			}
			retObj = recursiveMerge(sourceObj, mergeObj);
			if(setSourceObj) sourceObj = retObj;
			return retObj;
		}
		
		Utils.deepClone = function(obj){
		    if (typeof obj !== 'object' || obj == null) {
		        return obj;
		    }
		    var c = obj instanceof Array ? [] : {};
		    for (var i in obj) {
		        var prop = obj[i];
		        if (typeof prop == 'object') {
		           if (prop instanceof Array) {
		               c[i] = [];
		               for (var j = 0, l=prop.length; j < l; j++) {
		                   if (typeof prop[j] != 'object') c[i].push(prop[j]);
		                   else c[i].push(obj[prop[j]]);
		               }
		           } else {
		               c[i] = obj[prop];
		           }
		        } else {
		           c[i] = prop;
		        }
		    }
		    return c;
		}
		
		Utils.initialCap = function(str){
			return str.substr(0, 1).toUpperCase() + str.substr(1);
		}
		
		Utils.isAbsolutePath = function(url){
			return (url.indexOf('://') !== -1 || url.substr(0, 1) == '/');
		}
		
		Utils.makeAbsolutePath = function(url){
			return a5.cl.core.Utils.isAbsolutePath(url) ? (url.substr(0, 1) == '/' ? a5.cl.instance().appPath(true) + url:url):(a5.cl.instance().appPath() + url);
		}
		
		Utils.validateHexColor = function(color){
			return /^#(([a-fA-F0-9]){3}){1,2}$/.test(color);
		}
		
		Utils.expandHexColor = function(color){
			if(a5.cl.core.Utils.validateHexColor(color)){
				if(color.length === 4)
					return '#' + color.substr(1, 1) + color.substr(1, 1) + color.substr(2, 1) + color.substr(2, 1) + color.substr(3, 1) + color.substr(3, 1);
				else
					return color;
			} else {
				return '#000000';
			}
		}
		
		Utils.arrayIndexOf = function(array, value){
			for(var x = 0, y = array.length; x < y; x++){
				if(array[x] === value) return x;
			}
			return -1;
		}
		
		Utils.arrayContains = function(array, value){
			return Utils.arrayIndexOf(array, value) !== -1;
		}
		
		Utils.isArray = function(array){
			return Object.prototype.toString.call(array) === '[object Array]';
		}
		
		Utils.generateSystemHTMLTemplate = function(type, str, replBody){
			var retHtml = '<div style="margin:0px auto;text-align:center;font-family:Arial;"><h1>A5 CL: ' + type + ' Error</h1>\
				<div style="text-align:left;margin-bottom:50px;">' + str + '</div></div>';
			if (replBody) {
				var body = document.getElementsByTagName('body')[0];
				if(body) body.innerHTML = retHtml;
				else throw str;
			}
			return retHtml;
		}
		
		Utils.addEventListener = function(target, type, listener, useCapture){
			var type = type.indexOf('on') === 0 ? type.substr(2) : type,
				useCapture = useCapture || false;
			if(typeof target.addEventListener === 'function')
				target.addEventListener(type, listener, useCapture);
			else
				target.attachEvent('on' + type, listener);
		}
		
		Utils.removeEventListener = function(target, type, listener, useCapture){
			var type = type.indexOf('on') === 0 ? type.substr(2) : type;
			if(typeof target.addEventListener === 'function')
				target.removeEventListener(type, listener, useCapture);
			else
				target.detachEvent('on' + type, listener);
		}
		
		Utils.getVendorWindowMethod = function(type){
			var retVal = null,
				i, l, thisProp,
				regex = /-/g;
			while(regex.test(type)){
				type = type.substring(0, regex.lastIndex - 1) + type.substr(regex.lastIndex, 1).toUpperCase() + type.substr(regex.lastIndex + 1);
				regex.lastIndex = 0;
			}
		    for (i = 0, l = Utils.jsVendorMethodPrefixes.length; i <= l; i++) {
				thisProp = i === l ? type : (Utils.jsVendorMethodPrefixes[i] + type.substr(0, 1).toUpperCase() + type.substr(1));
				if(typeof window[thisProp] === "function"){
					retVal = window[thisProp];
					break;
				}
			}
			return retVal;
		}
		
		Utils.getCSSProp = function(type){
			var elem = document.createElement('div'),
				retVal = null,
				i, l, thisProp,
				regex = /-/g;
			while(regex.test(type)){
				type = type.substring(0, regex.lastIndex - 1) + type.substr(regex.lastIndex, 1).toUpperCase() + type.substr(regex.lastIndex + 1);
				regex.lastIndex = 0;
			}
		    for (i = 0, l = Utils.jsVendorPrefixes.length; i <= l; i++) {
				thisProp = i === l ? type : (Utils.jsVendorPrefixes[i] + type.substr(0, 1).toUpperCase() + type.substr(1));
				if(retVal === null && typeof elem.style[thisProp] === "string"){
					retVal = thisProp;
					break;
				}
			}
			//a5.cl.core.GarbageCollector.instance().destroyElement(elem);
			elem = null;
			return retVal;
		}
		
		/**
		 * Get the vendor-specific value for a CSS property.  For example, display:box should become something like display:-moz-box.
		 * @param {Object} prop The CSS property to use.
		 * @param {Object} value The standards-compliant value. (without a vendor prefix)
		 */
		Utils.getVendorCSSValue = function(prop, value){
			var elem = document.createElement('div'),
				returnVal = value,
				x, y, prefixedValue;
			for(x = 0, y = Utils.vendorPrefixes.length; x <= y; x++){
				prefixedValue = (x === 0 ? '' : Utils.vendorPrefixes[x - 1]) + value;
				elem.style[prop] = prefixedValue;
				if (elem.style[prop] === prefixedValue) {
					returnVal =  prefixedValue;
					break;
				}
			}
			//a5.cl.core.GarbageCollector.instance().destroyElement(elem);
			elem = null;
			return returnVal;
		}
		
		Utils.setVendorCSS = function(elem, prop, value, prefixValue){
			prefixValue = prefixValue === true; 
			elem.style.setProperty(prop, value, null);
			for(var x = 0, y = Utils.vendorPrefixes.length; x < y; x++){
				elem.style.setProperty((prefixValue ? '' : Utils.vendorPrefixes[x]) + prop, (prefixValue ? Utils.vendorPrefixes[x] : '') + value, null);
			}
		}
		
		Utils.testVersion = function(val, isMax){
			var parseVersionString = function(val) {
			    val = val.split('.');
			    return {
			        major: parseInt(val[0]) || 0,
			        minor: parseInt(val[1]) || 0,
			        build: parseInt(val[2]) || 0
			    }
			}
			
			isMax = isMax || false;
			var versionVal = parseVersionString(a5.version()),
			testVal = parseVersionString(String(val));
			if (versionVal.major !== testVal.major)
		        return isMax ? (versionVal.major < testVal.major) : (versionVal.major > testVal.major);
		    else if (versionVal.minor !== testVal.minor)
	            return isMax ? (versionVal.minor < testVal.minor) : (versionVal.minor > testVal.minor);
	        else if (versionVal.build !== testVal.build)
                return isMax ? (versionVal.build < testVal.build) : (versionVal.build > testVal.build);
            else
                return true;
		}
		
		Utils.elementInDocument = function(elem){
			while(elem){
				if(elem === document)
					return true;
				elem = elem.parentNode;
			}
			return false;
		}
		
		Utils.viewInStack = function(view){
			var appView = a5.cl.mvc.core.AppViewContainer.instance();
			while(view){
				if(view === appView)
					return true;
				view = view.parentView();
			}
			return false;
		}
});



/**
 * @class Handles all xhr/ajax requests.
 * @name a5.cl.core.RequestManager
 */
a5.Package('a5.cl.core')
	
	.Import('a5.cl.CLEvent')
	.Extends("a5.cl.CLBase")
	.Class("RequestManager", 'final', function(self, im){
		
		var defaultContentType,
			defaultMethod,
			reqArray,
			reqCount;
	
		this.RequestManager = function(){
			self.superclass(this, arguments);
			reqArray = [];
			reqCount = 0;
			defaultContentType = self.config().requestDefaultContentType;
			defaultMethod = self.config().requestDefaultMethod;
		}

		this.processItem = function(props, reqID){
			var req;
			try {	
				var reqComplete = function($req){
					var req = this;
					if (req.readyState == 4) {
						var response,
						retData,
						status = req.status;
						if (status !== 500) {
							if (props.isJson) {
								response = req.responseText;
								
								if (a5.cl.core.Utils.trim(response) !== "") {
									try {
										response = a5.cl.core.JSON.parse(response);
										retData = (props.dataProp && props.dataProp !== undefined) ? response[props.dataProp] : response;
									} catch (e) {
										status = 500;
										retData = "Error parsing JSON response from url: " + props.url + "\nresponse: " + response;
									}
								}
							} else if (props.isXML && req.responseXML) {
								response = req.responseXML;
							} else {
								response = req.responseText;
							}
							if (retData === undefined) 
								retData = response;
						}
						if (status == 200 || (status == 0)) {
							self.success(reqID, retData);
						} else {
							self.onError(reqID, status, retData || req.responseText);
						}
						self.reqComplete(reqID);
					}
				},
				
				updateProgress = function(e){
					self.updateProgress(reqID, e);
				},
				
				onError = function(e){
					self.onError(reqID, req.status, e);
				},
				
				createAppend = function(data, isGet){
					var retString = isGet ? '?':'';
					for(var prop in data)
						retString += prop + '=' + data[prop] + '&';
					return retString.substr(0, retString.length-1);
				},
				
				contentType = null;
					req = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('MSXML2.XMLHTTP.3.0');
				if (req !== undefined) {
					var method = props.method || defaultMethod,
						data = props.data || null,
						urlAppend = method == "GET" ? createAppend(props.data, true) : '';
					if (data) {
						if (props.isJson) {
							data = a5.cl.core.JSON.stringify(data);
						} else if (props.formData === true) {
							var fd = new FormData();
							for (var prop in data) 
								fd.append(prop, data[prop])
							data = fd;
						} else {
							contentType = 'application/x-www-form-urlencoded';
							data = createAppend(data, false);
						}
					}
					if(contentType === null)
						 contentType = defaultContentType;
					if(props.contentType)
						contentType = props.contentType;
					props.isJson = props.isJson !== undefined ? props.isJson:(contentType && contentType.toLowerCase().indexOf('json') != -1 ? true : false);
					props.isXML = (!props.isJson && contentType.toLowerCase().indexOf('xml')) != -1 ? true : false;
					props.charSet = props.charSet || null;
					if (req.addEventListener != undefined) req.addEventListener("progress", updateProgress, false);
					if (XMLHttpRequest) req.onerror = onError;
					req.onreadystatechange = reqComplete;
					req.open(method, props.url + urlAppend, true);
					if(props.formData !== true)
						req.setRequestHeader("Content-type", contentType);
					if (props.charSet) req.setRequestHeader("charset", props.charSet);
					req.send(data);
				} else {
					if (props.error) props.error('client does not support XMLHTTPRequests');
				}
			} catch (e) {
				req = null;
				self.throwError(e);
			}
		}
		
		this.abortRequest = function(id){
			for (var i = 0; i < reqArray.length; i++) {
				if (reqArray[i].id === id) {
					reqArray[i].abort();
					reqArray.splice(i, 1);
					return;
				}
			}
			self.redirect(500, 'Cannot abort request; invalid identifier sent to abortRequest method.');
		}
		
		/**
		 * @function
		 * @name a5.cl.core.RequestManager#makeRequest
		 */
		this.makeRequest = function(props){
			if((reqArray.length === 0 || isSilent()) && props.silent !== true)
				self.cl().dispatchEvent(im.CLEvent.ASYNC_START);
			var reqID = reqCount++;
			props.url = a5.cl.core.Utils.makeAbsolutePath(props.url);
			var obj = {props:props,
				id:reqID,
				abort:function(){
						self.abortRequest(this.id);
					}
				};
			reqArray.push(obj);
			self.processItem(props, reqID);
			return obj;
		}
		
		this.success = function(id, data){
			var props = getPropsForID(id);
			if(props.success) props.success.call(self, data);
		}
		
		this.reqComplete = function(id){
			var wasSilent = isSilent();
			unqueueItem(id);
			if((reqArray.length === 0 || isSilent()) && !wasSilent)
				self.cl().dispatchEvent(im.CLEvent.ASYNC_COMPLETE);
		}
		
		this.updateProgress = function(id, e){
			var props = getPropsForID(id);
			if(props.progress) props.progress.call(self, e);
		}
		
		this.onError = function(id, status, errorObj){
			if (status != 200 && status != 0) {
				var props = getPropsForID(id);
				if (props && props.error) props.error.call(self, status, errorObj);
				else this.throwError(errorObj);
			}
		}
		
		var getPropsForID = function(id){
			for(var i = 0, l=reqArray.length; i<l; i++)
				if(reqArray[i].id == id)
					return reqArray[i].props;
		}
		
		var unqueueItem = function(value){
			var isNumber = typeof value == 'number';
			for (var i = 0, l=reqArray.length; i < l; i++) {
				if ((isNumber && reqArray[i].id == value) || reqArray[i] == value) {
					reqArray.splice(i, 1);
					return;
				}
			}
		}
		
		var isSilent = function(){
			for (var i = 0, l = reqArray.length; i < l; i++) {
				if(reqArray[i].props.silent === true)
					return true;
			}
			return false;
		}
	
});


a5.Package('a5.cl.core')

	.Extends('a5.cl.CLBase')
	.Class('ManifestManager', 'singleton final', function(self){
	
		var _isOfflineCapable,
		appCache,
		_manifestBuild = null,
		manifestHref;
		
		this.ManifestManager = function(){
			self.superclass(this);
			manifestHref = document.getElementsByTagName('html')[0].getAttribute('manifest');
			appCache = window.applicationCache;
			_isOfflineCapable = appCache && manifestHref ? true:false;
			if(_isOfflineCapable) 
				initialize();
		}
		
		this.manifestBuild = function(){	return _manifestBuild; }
		this.isOfflineCapable = function(){	return _isOfflineCapable;}
		
		this.purgeApplicationCache = function($restartOnComplete){
			var restartOnComplete = ($restartOnComplete == false ? false:true);
			var updateReady = function(){
				appCache.swapCache();
				if(restartOnComplete) 
					self.cl().relaunch(true);
			}
			if (appCache.status == 1) {
				appCache.addEventListener('updateready', updateReady, false);
				appCache.update();
			} else {
				throw 'Cannot purge application cache, appCache status is ' + appCache.status;
			}
		}
		
		var initialize = function(){
			checkManifestBuild(manifestHref);
			appCache.addEventListener('error', onerror, false);
		}
		
		var checkManifestBuild = function(manifestHref){
			var resourceCache = a5.cl.core.ResourceCache.instance(), 
			result;
			self.cl().include(manifestHref, function(data){
				result = data.match(/#build\b.[0-9]*/);
				if(result){
					result = result[0];
					result = result.split('#build')[1];
					result = parseInt(a5.cl.core.Utils.trim(result));
					if(!isNaN(result)) _manifestBuild = result;
				}
			})
		}
		
		var onerror = function(e){
			self.redirect(500, 'Error loading manifest');
		}
})



/**
 * @class An implementation of JSON2 by Douglas Crockford 
 * @see <a href="http://www.json.org">www.json.org</a>
 * @name a5.cl.core.JSON
 */
a5.cl.core.JSON = function(){
		
	var self = this;
		
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = { // table of character substitutions
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		'\\': '\\\\'
	}, rep;
	
	var init = function(){
		if (typeof Date.prototype.toJSON !== 'function') {
			Date.prototype.toJSON = function(key){
				return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
				f(this.getUTCMonth() + 1) +
				'-' +
				f(this.getUTCDate()) +
				'T' +
				f(this.getUTCHours()) +
				':' +
				f(this.getUTCMinutes()) +
				':' +
				f(this.getUTCSeconds()) +
				'Z' : null;
			};
			String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key){
				return this.valueOf();
			};
		}
	}
	
	/**
	 * @memberOf a5.cl.core.JSON
	 * @param {Object} value
	 * @param {Object} replacer
	 * @param {Object} space
	 */
	var stringify = function(value, replacer, space){
		var i;
		gap = '';
		indent = '';
		
		if (typeof space === 'number') {
			for (i = 0; i < space; i += 1) {
				indent += ' ';
			}
		}
		else 
			if (typeof space === 'string') {
				indent = space;
			}
		
		rep = replacer;
		if (replacer && typeof replacer !== 'function' &&
		(typeof replacer !== 'object' ||
		typeof replacer.length !== 'number')) {
			a5.cl.instance().redirect(500, 'JSON stringify error.');
		}
		return str('', {
			'': value
		});
	};
	
	/**
	 * @memberOf a5.cl.core.JSON
	 * @param {Object} text
	 * @param {Object} reviver
	 */
	var parse = function(text, reviver){
		var j;
		function walk(holder, key){
			var k, v, value = holder[key];
			if (value && typeof value === 'object') {
				for (k in value) {
					if (Object.hasOwnProperty.call(value, k)) {
						v = walk(value, k);
						if (v !== undefined) {
							value[k] = v;
						}
						else {
							delete value[k];
						}
					}
				}
			}
			return reviver.call(holder, key, value);
		}
		
		text = String(text);
		cx.lastIndex = 0;
		if (cx.test(text)) {
			text = text.replace(cx, function(a){
				return '\\u' +
				('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			});
		}
		if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
			j = eval('(' + text + ')');
			return typeof reviver === 'function' ? walk({
				'': j
			}, '') : j;
		}
		a5.cl.instance().redirect(500, new SyntaxError('JSON.parse'));
	};
	
	var f = function(n){
		return n < 10 ? '0' + n : n;
	}
	
	function quote(string){
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' +
		string.replace(escapable, function(a){
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) +
		'"' : '"' + string + '"';
	}
	
	function str(key, holder){
		var i, k, v, length, mind = gap, partial, value = holder[key];
		
		if (value && typeof value === 'object' &&
		typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}
		
		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}
		
		switch (typeof value) {
			case 'string':
				return quote(value);
			case 'number':
				return isFinite(value) ? String(value) : 'null';
			case 'boolean':
			case 'null':
				return String(value);
			case 'object':
				if (!value) {
					return 'null';
				}
				gap += indent;
				partial = [];
				if (Object.prototype.toString.apply(value) === '[object Array]') {
					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || 'null';
					}
					v = partial.length === 0 ? '[]' : gap ? '[\n' + gap +
					partial.join(',\n' + gap) +
					'\n' +
					mind +
					']' : '[' + partial.join(',') + ']';
					gap = mind;
					return v;
				}
				if (rep && typeof rep === 'object') {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						k = rep[i];
						if (typeof k === 'string') {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}
				else {
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}
				v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
				mind +
				'}' : '{' + partial.join(',') + '}';
				gap = mind;
				return v;
		}
	}
	
	init();
	
	return {
		stringify:stringify,
		parse:parse			
	}
}();



a5.Package("a5.cl.core")
	.Static(function(DataCache){
		DataCache.cacheExists = function(){
			return DataCache.instance().cacheExists();
		}
		
		DataCache.isAvailable = function(){
			return DataCache.instance().isAvailable();
		}
		
		DataCache.storeValue = function(key, value){
			return DataCache.instance().storeValue(key, value);
		}
		
		DataCache.getValue = function(key){
			return DataCache.instance().getValue(key);
		}
		
		DataCache.clearValue = function(key){
			return DataCache.instance().clearValue(key);
		}
		
		DataCache.clearScopeValues = function(scope, exceptions){
			return DataCache.instance().clearScopeValues(scope, exceptions);
		}
		
		DataCache.validateCacheKeyPrefix = function(key){
			return DataCache.instance().validateCacheKeyPrefix(key);
		}
		
		DataCache.removeCacheKeyPrefix = function(key){
			return DataCache.instance().removeCacheKeyPrefix(key);
		}
	})
	.Extends("a5.cl.CLBase")
	.Class("DataCache", 'singleton final', function(self, im){
		
		var _enabled,
			_capable,
			_hadCacheAtLaunch,
			cacheKeys;
		
		this.DataCache = function(){
			self.superclass(this); 
			_enabled = a5.cl.instance().config().cacheEnabled;
			_capable = window.localStorage != undefined;
			_hadCacheAtLaunch = (this.isAvailable() && localStorage.length) ? true:false;
			cacheKeys = [];
		}
		
		this.isAvailable = function(){
			var plugin = getDataPlugin();
			if(plugin)
				_capable = plugin.isCapable.call(plugin);
			return _enabled && _capable;
		}
		
		this.cacheExists = function(){
			if(this.isAvailable()) return _hadCacheAtLaunch;
			else return false;
		}
		
		this.storeValue = function(key, value){
			var plugin = getDataPlugin();
			if(plugin)
				return plugin.storeValue.apply(plugin, arguments);
			
			if (self.isAvailable() && checkCacheKey(key)) {
				var stringVal = a5.cl.core.JSON.stringify(value),
				value = localStorage.setItem(key, stringVal);
				return value;
			} else {
				return false;
			}
		}
		
		this.getValue = function(key){
			var plugin = getDataPlugin();
			if(plugin)
				return plugin.getValue.apply(plugin, arguments);
			
			if (self.isAvailable() && checkCacheKey(key)) {
				try {
					var retValue = localStorage.getItem(key);
					return a5.cl.core.JSON.parse(retValue);
				} catch (e) {
					return null;
				}
			} else {
				return null;
			}
		}
		
		this.clearValue = function(key){
			var plugin = getDataPlugin();
			if(plugin)
				return plugin.clearValue.apply(plugin, arguments);
			
			if (self.isAvailable() && checkCacheKey(key)) {
				try {
					return localStorage.removeItem(key);
				} 
				catch (e) {
					return false;
				}
			} else {
				return false;
			}
		}
		
		this.clearScopeValues = function(scope, $exceptions){
			var plugin = getDataPlugin();
			if(plugin)
				return plugin.clearScopeValues.apply(plugin, arguments);
			
			var exceptions = $exceptions || [], i, j;
			for(var i = 0, l=localStorage.length; i<l; i++){
				var key =localStorage.key(i);
				if (key.indexOf(scope) == 0) {
					var cacheItemName = key.split(scope)[1].substr(1),
					isExcepted = false;
					for (j = 0, m=exceptions.length; j < m; j++) {
						if(cacheItemName == exceptions[j]) isExcepted = true;
					}
					if(!isExcepted){
						localStorage.removeItem(key);
						i--;
						l=localStorage.length;
					}
				}
			}
		}
		
		this.validateCacheKeyPrefix = function(key){
			for (var i=0, l=cacheKeys.length; i<l; i++)
				if(cacheKeys[i] == key)
					return false;
			cacheKeys.push(key);
			return true;
		}
		
		this.removeCacheKeyPrefix = function(key){
			for (var i=0, l=cacheKeys.length; i<l; i++){
				if(cacheKeys[i] == key){
					cacheKeys.splice(i, 1);
					return;
				}
			}
		}
		
		var checkCacheKey = function(key){
			var isInCache = false;
			for (var i=0, l=cacheKeys.length; i<l; i++){
				if (key.substr(cacheKeys[i]) != -1) {
					isInCache = true;
					break;
				}
			}
			return isInCache;
		}
		
		var getDataPlugin = function(){
			return self.plugins().getRegisteredProcess('dataStorage');
		}
	
	
});


a5.Package('a5.cl.core')
	.Extends('a5.cl.CLBase')
	.Mix('a5.cl.mixins.DataStore')
	.Static(function(ResourceCache){
		
		ResourceCache.BROWSER_CACHED_ENTRY = 'clResourceCacheBrowserCacheEntry';
		
		ResourceCache.COMBINED_DEPENDENCY = 'clResourceCacheCombinedDependcy';
		
		ResourceCache._cl_delimiterOpen = '<!--CL:';
		ResourceCache._cl_delimiterClose = ':CL-->';
	})
	.Class('ResourceCache', 'singleton final', function(self, im, ResourceCache){
			
		var resources,
			dataCache,
			shouldUseCache,
			requestManager,
			cacheTypes = [
				{type:'html', extension:'html'},
				{type:'html', extension:'htm'},
				{type:'js', extension:'js'},
				{type:'image', extension:'jpg'},
				{type:'image', extension:'gif'},
				{type:'image', extension:'png'},
				{type:'css', extension:'css'},
				{type:'xml', extension:'xml'}
			];
		
		
		this.ResourceCache = function(){
			this.superclass(this);
			requestManager = a5.cl.core.RequestManager.instance();
			cacheTypes = cacheTypes.concat(this.config().cacheTypes);
			resources = {};
		}
		
		this.initStorageRules = function(){
			var manifestBuild = this.cl().manifestBuild(),
				storedBuild = this.getValue('build') || -1;
			shouldUseCache = (this.cl().isOfflineCapable() && this.cl().environment() === 'PRODUCTION');
			if(manifestBuild && manifestBuild > storedBuild) this.clearScopeValues();
			if(shouldUseCache) this.storeValue('build', manifestBuild);
			else this.clearScopeValues();
		}
		
		this.include = function(value, callback, itemCallback, onerror, asXHR){
			var urlArray = [],
			retValue,
			loadCount = 0,
			totalItems, 
			percentPer, 
			asXHR = asXHR || false,
			elem;
			if (typeof value == 'string') {
				urlArray.push(value);
				retValue = null;
			} else {
				urlArray = value;
				retValue = [];
			}
			a5._a5_delayProtoCreation(true);
			totalItems = urlArray.length;
			percentPer = 100 / totalItems;
			if (self.config().staggerDependencies || self.config().xhrDependencies || asXHR) {	
				fetchURL(urlArray[loadCount]);
			} else {
				for(var i = 0, l = urlArray.length; i<l; i++)
					fetchURL(urlArray[i]);
			}
			
			function fetchURL(urlObj){
				var url = null;
				var type = null;
				if (urlObj != undefined) {
					if (typeof urlObj == 'string') {
						url = urlObj;
						type = discernType(url);
					} else {
						url = urlObj[0];
						type = urlObj[1];
					}
				}
				url = a5.cl.core.Utils.makeAbsolutePath(checkReplacements(url));
				
				function completeLoad(retValue){
					a5._a5_createQueuedPrototypes();
					a5._a5_verifyPackageQueueEmpty();
					a5._a5_delayProtoCreation(false);
					if (callback) 
						callback(retValue);
				}
				
				function continueLoad(data){
					loadCount++;
					var percent = Math.floor((loadCount / totalItems) * 100);
					if (itemCallback) itemCallback({
						loadCount: loadCount,
						totalItems: totalItems,
						data:data,
						itemURL: url,
						itemType: type,
						percent: percent
					});
					if(totalItems == 1) retValue = data;
					else retValue.push(data);
					if (self.config().staggerDependencies || self.config().xhrDependencies || asXHR) {
						if (loadCount == totalItems) {
							completeLoad(retValue);
						} else {
							fetchURL(urlArray[loadCount]);
						}
					} else {
						if (loadCount === urlArray.length) {
							completeLoad(retValue);
						}
					}
				}
				if (type) {
					var cacheValue = checkCache(url);
					if (!cacheValue) {
						if (type === 'css') {
							var cssError = function(){
								if (onerror) onerror(url);
								else self.throwError('Error loading css resource at url ' + url);
							},
							headID = document.getElementsByTagName("head")[0],
							elem = document.createElement('link');
							elem.onerror = cssError;
							elem.href =  url;
							elem.rel = 'stylesheet';
							elem.media = 'screen';
							headID.appendChild(elem);
							updateCache(url, type, ResourceCache.BROWSER_CACHED_ENTRY);
							continueLoad();
							elem = headID = null;
						} else if (type === 'image'){
							var imgObj = new Image(),
							clearImage = function(){
								a5.cl.mvc.core.GarbageCollector.instance().destroyElement(imgObj);
								imgObj = null;
								updateCache(url, type, ResourceCache.BROWSER_CACHED_ENTRY);
								continueLoad();
							},
							imgError = function(){
								if (onerror) onerror(url);
								else self.redirect(500, 'Error loading image resource at url ' + url);
							};
												
							imgObj.onload = clearImage;
							imgObj.onerror = imgError;
							imgObj.src = data;
						} else if (type === 'js' && self.config().xhrDependencies === false && asXHR == false){
							var insertElem = function(){
								head.insertBefore(include, head.firstChild);
							}
							var head = document.getElementsByTagName("head")[0], include = document.createElement("script");
							include.type = "text/javascript";		
							include.src = url;
							if(include.readyState){
								include.onreadystatechange = function(){
									if (this.readyState == 'loaded' || this.readyState == 'complete') continueLoad();
								}
							} else {
								include.onload = continueLoad;
							}
							insertElem();
						} else {
							var reqObj = {
								url: url,
								method: 'GET',
								contentType: 'text/plain',
								success: function(data){
									data = updateCache(url, type, data);
									processData(url, data, type, function(){
										continueLoad(data);
									});
								},
								error: function(){
									if (onerror) onerror(url);
									else self.redirect(500, 'Error loading resource at url ' + url);
								}
							}
							if (typeof itemCallback === 'function') {
								reqObj.progress = function(e){
									itemCallback({
										loadCount: loadCount,
										totalItems: totalItems,
										itemURL: url,
										itemType: type,
										percent: Math.floor(percentPer * loadCount + percentPer * Math.floor(e.loaded / e.total))
									});
								}
							}
							reqObj.silent = self.config().silentIncludes === true;
							requestManager.makeRequest(reqObj)
						}
					} else {
						if(cacheValue === ResourceCache.BROWSER_CACHED_ENTRY)
							continueLoad(null);
						else
							continueLoad(cacheValue);
					}
				} else {
					throw 'Unknown include type for included file "' + url + '".';
				}			
			}
		}
		
		this.getCachedHTML = function(id, callback){
			var obj = resources[id];
			if (obj && obj.isID && obj.type === 'html') {
				var docFrag = document.createDocumentFragment();
				docFrag.innerHTML = obj.data;
				return docFrag;
			}
			return null;
		}
		
		this.purgeAllCaches = function($restartOnComplete){
			//orm integration?
			if(window.localStorage !== undefined) localStorage.clear();
			self.cl().purgeApplicationCache($restartOnComplete);
		}
		
		this.combineMarkupResources = function(){
			var combined = "";
			for(var prop in resources){
				var thisResource = resources[prop];
				if(thisResource.type === 'xml' || thisResource.type === 'html'){
					combined += ResourceCache._cl_delimiterOpen + ' ';
					combined += (thisResource.isID ? 'id=' : 'url=') + prop;
					combined += ' type=' + thisResource.type;
					combined += ' ' + ResourceCache._cl_delimiterClose + '\n\n';
					combined += thisResource.data + '\n\n';
				}
			}
			return combined;
		}
		
		var checkCache = function(url){
			var value = resources[url],
				cached = (typeof value === 'object');
			if(!value && shouldUseCache && value !== ResourceCache.BROWSER_CACHED_ENTRY && value !== ResourceCache.COMBINED_DEPENDENCY)
				value = self.getValue(url);
			return (cached ? value.data : null);
		}
		
		var updateCache = function(url, type, value, fromStorage, isID){
			value = a5.cl.core.Utils.trim(value);
			var regex = new RegExp(ResourceCache._cl_delimiterOpen + '.*?' + ResourceCache._cl_delimiterClose, 'g');
			if(regex.test(value)){
				if (value.indexOf(ResourceCache._cl_delimiterOpen) !== 0) {
					self.throwError('Error parsing combined resource: ' + url + '\n\nCombined XML and HTML resources must start with a delimiter');
					return;
				}
				//if the loaded content is a combined file, uncombine it and store each piece
				var result, delimiters = [];
				//find all of the delimiters
				regex.lastIndex = 0;
				while(result = regex.exec(value))
					delimiters.push({index:regex.lastIndex, match:a5.cl.core.Utils.trim(result[0])});
				//loop through each delimiter
				for(var x = 0, xl = delimiters.length; x < xl; x++){
					var thisDelimiter = delimiters[x],
						//get the content associated with this delimiter
						dataSnippet = value.substring(thisDelimiter.index, (x < xl - 1) ? delimiters[x + 1].index : value.length).replace(regex, ""),
						//remove the delimiter open and close tags to get the params
						paramString = thisDelimiter.match.replace(ResourceCache._cl_delimiterOpen, '').replace(ResourceCache._cl_delimiterClose, ''),
						//split the params into an array
						paramList = a5.cl.core.Utils.trim(paramString).split(' '),
						params = {};
					//process each parameter into a name/value pair
					for(var y = 0, yl = paramList.length; y < yl; y++){
						var splitParam = paramList[y].split('='),
							paramName = splitParam.length > 1 ? splitParam[0] : 'url',
							paramValue = splitParam.pop();
						params[paramName] = paramValue;
					}
					if(params.url)
						params.url = a5.cl.core.Utils.makeAbsolutePath(params.url);
					updateCache(params.url || params.id, params.type || type, dataSnippet, false, !params.url);
				}
				updateCache(url, type, ResourceCache.COMBINED_DEPENDENCY);
				return null;
			} else {
				resources[url] = {
					type: type,
					data: value,
					isID: isID === true
				};
				if(shouldUseCache && !fromStorage)
					self.storeValue(url, value);
				return value;
			}
		}
		
		var discernType = function(url){
			var urlArray = url.split('.'),
				extension = urlArray[urlArray.length-1].replace(/\?.*$/, ''); //the replace() removes querystring params
			for (var i = 0, l=cacheTypes.length; i < l; i++) {
				if (typeof cacheTypes[i] != 'object' ||
				cacheTypes[i].extension == undefined ||
				cacheTypes[i].type == undefined) {
					throw 'Improper config cacheType specified: ' + cacheTypes[i].toString();
				} else if (extension == cacheTypes[i].extension) {
					return cacheTypes[i].type;
				}
			}
			return null;
		}
		
		var processData = function(url, data, type, callback){
			switch (type){
				case 'js':
					try {
						var insertElem = function(){
							head.insertBefore(include, head.firstChild);
						}
						var head = document.getElementsByTagName("head")[0], include = document.createElement("script");
						include.type = "text/javascript";					
						try {
							include.appendChild(document.createTextNode(data));
						} catch (e) {
							include.text = data;
						} finally {
							insertElem();
							callback();
						}
					} catch (e) {
						self.throwError(e);
					} finally {
						include = head = null;
					}
					break;
				case 'html':
				case 'xml':
				default:
					callback();
			}
		}
		
		var checkReplacements = function(url){
			return url.replace('{CLIENT_ENVIRONMENT}', a5.cl.instance().clientEnvironment()).replace('{ENVIRONMENT}', a5.cl.instance().environment());
		}
	
})


a5.Package("a5.cl.core")

	.Import('a5.cl.CLEvent')
	.Extends("a5.cl.CLBase")
	.Class("GlobalUpdateTimer", 'singleton final', function(self, im){

		var timer,
		clInstance,
		interval,
		evtInstance = a5.Create(im.CLEvent, [im.CLEvent.GLOBAL_UPDATE_TIMER_TICK]);
		
		this.GlobalUpdateTimer = function(){
			self.superclass(this);
			interval = self.config().globalUpdateTimerInterval;
			clInstance = self.cl();
			evtInstance.shouldRetain(true);
		}
		
		this.startTimer = function(){
			if(!timer)
				timer = setInterval(update, interval);
		}
		
		this.stopTimer = function(){
			this._cl_killTimer();
		}
		
		var update = function(){
			clInstance.dispatchEvent(evtInstance);
		}
		
		this._cl_killTimer = function(){
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}		
});


a5.Package('a5.cl.core')
	
	.Import('a5.cl.CLEvent', 'a5.cl.CLLaunchState')
	.Extends('a5.cl.CLBase')
	.Class("Core", 'singleton final', function(self, im){
	
		var _cache,
		_requestManager,
		_envManager,
		_globalUpdateTimer,
		_resourceCache,
		_instantiator,
		_pluginManager,
		_launchState,
		_manifestManager;
		
		this.Core = function($applicationPackage){
			self.superclass(this); 
			_instantiator = self.create(a5.cl.core.Instantiator, [$applicationPackage]);
		}
			
		this.resourceCache = function(){ return _resourceCache; }	
		this.instantiator = function(){ return _instantiator; }			
		this.cache = function(){	return _cache;	}
		this.envManager = function(){ return _envManager; }	
		this.manifestManager = function(){ return _manifestManager; }
		this.requestManager = function(){ return _requestManager;	}	
		this.pluginManager = function(){ return _pluginManager; }			
		this.globalUpdateTimer = function(){return _globalUpdateTimer;}
		this.launchState = function(){ return _launchState; }
		
		this.relaunch = function(){
			self.cl().dispatchEvent(im.CLEvent.APPLICATION_WILL_RELAUNCH);
			window.location.reload();
		}
		
		this.initializeCore = function($environment, $clientEnvironment){
			updateLaunchStatus('APPLICATION_INITIALIZING');
			_globalUpdateTimer = self.create(a5.cl.core.GlobalUpdateTimer);
			_manifestManager = self.create(a5.cl.core.ManifestManager);
			_requestManager = self.create(a5.cl.core.RequestManager);
			_envManager = self.create(a5.cl.core.EnvManager, [$environment, $clientEnvironment]);
			_resourceCache = self.create(a5.cl.core.ResourceCache);
			_pluginManager = self.create(a5.cl.core.PluginManager);
			_cache = self.create(a5.cl.core.DataCache);
			_resourceCache.initStorageRules();
			var loadPaths = self.config().dependencies;
			if(loadPaths.length) _resourceCache.include(loadPaths, dependenciesLoaded, function(e){
				updateLaunchStatus('DEPENDENCIES_LOADING', e);
			});
			else dependenciesLoaded();	
		}
		
		var dependenciesLoaded = function(){
			updateLaunchStatus('DEPENDENCIES_LOADED');
			_pluginManager.instantiatePlugins();
			updateLaunchStatus('PLUGINS_LOADED');
			_envManager.initialize();
			_instantiator.beginInstantiation();
			var plgn = _pluginManager.getRegisteredProcess('launchInterceptor');
			if(plgn){
				var intercept = plgn.interceptLaunch(launchApplication);
				if(intercept) updateLaunchStatus('LAUNCH_INTERCEPTED', {interceptor:plgn});
				else launchApplication();
			} else {
				launchApplication();
			}
		}
		
		var launchApplication = function(){		
			_pluginManager.processAddons(addOnsLoaded);		
		}
		
		var addOnsLoaded = function(){
			updateLaunchStatus('APPLICATION_WILL_LAUNCH');
			updateLaunchStatus('APPLICATION_LAUNCHED');	
		}
		
		var updateLaunchStatus = function(type, e){
			_launchState = im.CLLaunchState[type];
			self.cl().dispatchEvent(im.CLEvent[type], e);
		}
});



/**
 * @class Mixin class for providing data storage hooks. DataStore applies a uniqe ID prefix on key values, removing the need to assure uniqueness of keys in your application. Key prefixes are unique to the class in which they are referenced.
 * <br/><b>Abstract</b>
 * @name a5.cl.mixins.DataStore
 * @extends a5.cl.CLBase
 */
a5.Package('a5.cl.mixins')
	.Import('a5.cl.core.DataCache')
	.Mixin('DataStore', function(proto, im, DataStore){

		/**#@+
	 	 * @memberOf a5.cl.mixins.DataStore#
	 	 * @function
		 */	
		
		proto.DataStore = function(){
			this._cl_cacheKeyValidated = false;
			this._cl_prefix = null;
			this._cl_validatedPrefix = null;
		}
		
		/**
		 * Returns whether caching has previously been set by the application on the client and values are available for retrieval.
		 * @name cacheExists
		 * @returns {Boolean}
		 */
		proto.cacheExists = function(){
			return im.DataCache.cacheExists();
		}
		
		/**
		 * Stores a value uniquely keyed in the localStorage cache. 
		 * @name storeValue
		 * @returns {Boolean} success
		 */
		proto.storeValue = function(key, value){
			if(im.DataCache.isAvailable() && value !== undefined) 
				return im.DataCache.storeValue(this._cl_createCacheKey(key), value);
			else return false;
		}
		
		proto.keyPrefix = function(value){
			if(typeof value === 'string'){
				this._cl_prefix = value;
				return this;
			}
			return this._cl_prefix;
		}
		
		/**
		 * Retrieves a value for the specified key from the client data store.
		 * @name getValue
		 * @returns {*} False if failure
		 */
		proto.getValue = function(key){
			if(im.DataCache.isAvailable()) 
				return im.DataCache.getValue(this._cl_createCacheKey(key));
			else return false;
		}
		
		/**
		 * Removes the value for the specified key from the client data store.
		 * @name clearValue
		 */
		proto.clearValue = function(key){
			if(im.DataCache.isAvailable()) 
				return im.DataCache.clearValue(this._cl_createCacheKey(key));
			else return false;
		}
		
		/**
		 * Clears all key/value pairs associated with the class in which the method is called.
		 * @name clearScopeValues
		 * @param {Array} [exceptions] An array of keys to leave untouched when clearing.
		 */
		proto.clearScopeValues = function(exceptions){
			if(im.DataCache.isAvailable()) 
				im.DataCache.clearScopeValues(this.instanceUID(), exceptions);
			else 
				return false;
		}
		
		proto._cl_createCacheKey = function(key){
			if (!this._cl_cacheKeyValidated || !this._cl_validatedPrefix) {
				var prefix = (this._cl_prefix || (this.id ? this.id() : false) || this.instanceUID());
				this._cl_cacheKeyValidated = im.DataCache.validateCacheKeyPrefix(prefix)
				if(!this._cl_cacheKeyValidated){
					a5.ThrowError("Error: Duplicate cache key prefix: " + prefix);
					return;
				}
				this._cl_validatedPrefix = prefix;
			}
			return this._cl_validatedPrefix + '_' + key;
		}
		
		proto.dealloc = function(){
			im.DataCache.removeCacheKeyPrefix(this._cl_validatedPrefix);
		}
});	


a5.Package('a5.cl.mixins')
	.Mixin('BindableSource', function(mixin, im){
		
		mixin.BindableSource = function(){
			this._cl_receivers = [];
			this._cl_bindParamType = null;
			this._cl_bindParamRequired = false;
			this._cl_bindParamCallback = null;
		}
		
		mixin.bindParamProps = function(type, required, callback){
			this._cl_bindParamType = type;
			if(required !== undefined) this._cl_bindParamRequired = required;
			if(callback !== undefined) this._cl_bindParamCallback = callback;
			return this;
		}
		
		mixin.bindParamType = function(){
			return this._cl_bindParamType;
		}
		
		mixin.bindParamRequired = function(){
			return this._cl_bindParamRequired;
		}
		
		mixin.notifyReceivers = function(data){	
			for (var i = 0, l = this._cl_receivers.length; i < l; i++) {
				var r = this._cl_receivers[i];
				if(this._cl_bindParamRequired || (!data && this._cl_bindParamCallback !== null))
					data = this._cl_bindParamCallback.call(this, r.params);
				if(data !== null)
					r.receiver.receiveBindData.call(r.scope || r.receiver, this._cl_modifyBindData(data, r.mapping));
			}
		}
		
		mixin._cl_attachReceiver = function(receiver, params, mapping, scope){
			this._cl_receivers.push({receiver:receiver, params:params, mapping:mapping, scope:scope});
			this.notifyReceivers();
		}
		
		mixin._cl_detachReceiver = function(receiver){
			for(var i = 0, l = this._cl_receivers.length; i<l; i++){
				var r = this._cl_receivers[i];
				if(r.receiver === receiver){
					this._cl_receivers.splice(i, 1);
					break;
				}
			}
		}

		mixin._cl_modifyBindData = function(dataSource, mapping){
			var data,
				isQuery = false;
			//TODO - needs to move to ORM implementation
			if(dataSource instanceof a5.cl.CLQueryResult)
				isQuery = true;
			if(isQuery)
				data = dataSource._cl_data;
			else 
				data = dataSource;
			if(mapping){
				var dataSet = [],
					skipProps = {};
				for (var i = 0, l = data.length; i < l; i++) {
					var dataRow = {};
					for (var prop in mapping) {
						dataRow[prop] = data[i][mapping[prop]];
						skipProps[mapping[prop]] = prop;
					}
					for(var prop in data[i])
						if(skipProps[prop] === undefined)
							dataRow[prop] = data[i][prop];
					dataSet.push(dataRow);
				}
				if (isQuery) {
					dataSource._cl_data = dataSet;
					return dataSource;
				} else {
					return dataSet;
				}
			} else {
				return dataSource;
			}
		}
				
});



a5.Package('a5.cl.mixins')
	.Mixin('Binder', function(mixin, im){
		
		mixin.Binder = function(){
			this._cl_bindingsConnected = true;
			this._cl_bindings = [];
		}
		
		mixin.setBindingEnabled = function(value){
			if (value !== this._cl_bindingsConnected) {
				for (var i = 0, l = this._cl_bindings.length; i < l; i++) {
					var b = this._cl_bindings[i];
					if (b.persist !== true) {
						if (value) 
							b.source._cl_attachReceiver(b.receiver, b.params, b.mapping, b.scope);
						else b.source._cl_detachReceiver(b.receiver);
					}
				}
				this._cl_bindingsConnected = value;
			}
		}
		
		mixin.bindingsConnected = function(){
			return this._cl_bindingsConnected;
		}
		
		mixin.bind = function(source, receiver, params, mapping, scope, persist){
			if(!this._cl_checkBindExists(source, receiver, params)){
				if(source.isA5ClassDef())
					source = source.instance();
				if (!source.doesMix('a5.cl.mixins.BindableSource'))
					return this.throwError('source "' + source.className() + '" of bind call must mix a5.cl.mixins.BindableSource.');
				if(receiver.isA5ClassDef())
					receiver = receiver.instance();
				if (!receiver.doesImplement('a5.cl.interfaces.IBindableReceiver'))
					return this.throwError('receiver "' + receiver.className() + '" of call bind must implement a5.cl.interfaces.IBindableReceiver.');
				var hasParams = params !== undefined && params !== null,
					isNM = false,
					pType = null;
				if(source.bindParamRequired() || params){
					var isValid = true;
				 	if (!hasParams){
						isValid = false;
					} else if (source.bindParamType() !== null){
						pType = source.bindParamType();
						if(typeof pType === 'string' && pType.indexOf('.') !== -1)
							pType = a5.GetNamespace(pType);
						if(pType.namespace){
							isNM = true;
							var nmObj = pType.namespace();
							if(!(params instanceof pType))
								isValid = false;
						} else {
							if(typeof params !== source.bindParamType())
								isValid = false; 
						}
					}
					if(!isValid){
						this.throwError('params required for binding source "' + source.namespace() + '"' + (pType !== null ? ' must be of type "' + (isNM ? pType.namespace() : pType) + '"' : ''));
						return;
					}
				}
				this._cl_bindings.push({source:source, scope:scope, receiver:receiver, mapping:mapping, params:params, persist:persist})
				if(this.bindingsConnected())
					source._cl_attachReceiver(receiver, params, mapping, scope);
			}
		}
		
		mixin.unbind = function(source, receiver){
			var found = false;
			for(var i = 0, l = this._cl_bindings.length; i<l; i++){
				var obj = this._cl_bindings[i];
				if(obj.source === source && obj.receiver === receiver){
					this._cl_bindings.splice(i, 1);
					found = true;
					break;
				}
			}
			if(found)
				source._cl_detachReceiver(receiver);
			else
				this.throwError('cannot unbind source "' + source.namespace() + '" on controller "' + this.namespace() + '", binding does not exist.');
		}
		
		mixin._cl_checkBindExists = function(source, receiver, params){
			for(var i = 0, l = this._cl_bindings.length; i<l; i++){
				var b = this._cl_bindings[i];
				if(b.source === source && b.receiver === receiver && b.params === params)
					return true;
			}
			return false;
		}
});


/**
 * @class Base class for service handlers in the AirFrame CL framework.
 * <br/><b>Abstract</b>
 * @name a5.cl.CLService
 * @extends a5.cl.CLBase
 */
a5.Package('a5.cl')

	.Extends('CLBase')
	.Prototype('CLService', 'abstract', function(proto, im){
		
		/**#@+
	 	 * @memberOf a5.cl.CLService#
	 	 * @function
		 */		
		
		proto.CLService = function(){
			proto.superclass(this);
			this._cl_url = null;
			this._cl_isJson = true;
		}
		

		proto.initialize = function(url){
			this._cl_url = url;
		}
		
		/**
		 * @name url
		 */
		proto.url = function(){
			var plgn = this.plugins().getRegisteredProcess('serviceURLRewriter');
			if(plgn)
				return plgn.rewrite(this._cl_url);
			return this._cl_url;
		}
		
		/**
		 * @name isJson
		 * @param {Boolean} [value]
		 */
		proto.isJson = function(value){
			if(value !== undefined) this._cl_isJson = value;
			return this._cl_isJson;
		}
		
});

a5.Package('a5.cl')

	.Extends('a5.Attribute')
	.Class('SerializableAttribute', 'abstract', function(cls){
		
		cls.SerializableAttribute = function(){
			
		}
		
		cls.Override.instanceProcess = function(rules, instance){
		
		}
})


/**
 * @class Base class for web sockets in the AirFrame CL framework.
 * <br/><b>Abstract</b>
 * @name a5.cl.CLSocket
 * @extends a5.cl.CLService
 */
a5.Package('a5.cl')

	.Extends('CLService')
	.Prototype('CLSocket', 'abstract', function(proto, im, CLSocket){
		
		CLSocket.supportsSockets = function(){
			return 'WebSocket' in window ? true : false;
		}
		
		/**#@+
	 	 * @memberOf a5.cl.CLSocket#
	 	 * @function
		 */		
		
		proto.CLSocket = function(){
			proto.superclass(this);
			this._cl_socket = null;
			var self = this;
			this._cl_socketOnMessage = function(e){
				var data = self.isJson() ? a5.cl.core.JSON.parse(e.data):e.data;
				self.dataReceived(data);
			}
		}
		
		/**
		 * 
		 * @name initialize
		 * @param {String} url
		 * @return {Boolean} success
		 */
		proto.Override.initialize = function(url){
			if (this.supportsSockets()){
				this._cl_socket = new WebSocket(url);
				return true;
			} else {
				return false;
			}
		}
		
		/**
		 * Performs a call on the socket. createSocket must be called first.
		 * @name send
		 * @param {String} message The message to send to the socket.
		 * @param {Function} [callback] A function to pass returned results to.
		 */
		proto.send = function(m, callback){
			if (this.supportsSockets()) {
				var self = this;
				self._cl_socket.onmessage = self._cl_socketOnMessage;
				var sendMsg = function(){
					self._cl_socket.onopen = null;
					if (callback) {
						self._cl_socket.onmessage = function(e){
							var data = self.isJson() ? a5.cl.core.JSON.parse(e.data) : e.data;
							callback(data);
							self._cl_socket.onmessage = self._cl_socketOnMessage;
						}
					}
					self._cl_socket.send(m);
					return null;
				}
				switch (this._cl_socket.readyState) {
					case 0:
						this._cl_socket.onopen = sendMsg;
						break;
					case 1:
						sendMsg();
						break;
					case 2:
						this._cl_socket.onopen = sendMsg;
						this._cl_socket.connect();
						break;
				}
			} else {
				throw 'Error sending data to socket ' + this.mvcName() + ', Web Sockets are not supported in this browser.';
			}
		}
		
		
		/**
		 * @name dataReceived
		 * @param {String}Object} message
		 */
		proto.dataReceived = function(data){
			
		}
		
		/**
		 * @name supportsSockets
		 */
		proto.supportsSockets = function(){
			return CLSocket.supportsSockets;
		}
		
		/**
		 * @name close
		 */
		proto.close = function(){
			if(this._cl_socket) this._cl_socket.close();
		}	
		
		proto.dealloc = function(){
			if(this._cl_socket && this._cl_socket.readyState === 2) this.closeSocket();
		}
});


/**
 * @class Base class for Ajax handlers.
 * <br/><b>Abstract</b>
 * @name a5.cl.CLAjax
 * @extends a5.cl.CLService
 */
a5.Package('a5.cl')

	.Extends('CLService')
	.Mix('a5.cl.mixins.BindableSource')
	.Prototype('CLAjax', 'abstract', function(proto, im){
		
		/**#@+
	 	 * @memberOf a5.cl.CLAjax#
	 	 * @function
		 */	
		
		proto.CLAjax = function(){
			proto.superclass(this);
			this._cl_ajaxStruct = null;
			this._cl_silent = false;
		}
		
		/**
		 * Defines the default properties for the service endpoint.
		 * @name initialize
		 * @param {String} url The service endpoint without a method specified, used as a prefix to all method values passed in call method.
		 * @param {Object} props Properties object, see {@link a5.cl.CLAjax#call} for more info.
		 */
		proto.Override.initialize = function(url, props){
			proto.superclass().initialize.call(this, url);
			this._cl_ajaxStruct = props;
		}
				
		/**
		 * Performs a call on the service. initialize must be called first.
		 * @name call
		 * @type Number
		 * @returns The request ID.
		 * @param {String} method The method to call on the endpoint. An empty string or null may be passed to call services that do not define methods.
		 * @param {Object} [data] A data object to pass as JSON. 
		 * @param {Function} [callback] A function to pass returned results to.
		 * @param {Object} [props] Call props object.
		 */
		proto.call = function(m, data, callback, props){
			//TODO: enforceContract to allow overload with no method, or no data
			var callObj = this._cl_ajaxStruct ? a5.cl.core.Utils.deepClone(this._cl_ajaxStruct):{};
			if (props) {
				for (var prop in callObj) 
					if (props[prop] == undefined) props[prop] = callObj[prop];
			} else {
				props = callObj;
			}
			if (data) {
				if(data.isA5Class)
					props.data = a5.Attribute.processInstance(data);
				props.data = data;
			}
			props.isJson = this.isJson();
			props.success = callback;
			if(this._cl_silent)
				props.silent = true;
			if(m){
				if(m.charAt(0) !== '/')
					m = '/' + m;
			} else {
				m = '';
			}
			props.url = this.url() + m;
			return a5.cl.core.RequestManager.instance().makeRequest(props);
		}
		
		/**
		 * Aborts all calls associated with the service.
		 * @name abort
		 * @param {Number} [id] A specific request ID to abort instead of aborting all pending requests.
		 */
		proto.abort = function(id){
			return a5.cl.core.RequestManager.instance().abort(id);
		}
		
		/**
		 * Gets or sets the silent property.  When set to true, requests will not trigger ASYNC_START and ASYNC_COMPLETE events.
		 * @param {Object} value
		 */
		proto.silent = function(value){
			if(typeof value === 'boolean'){
				this._cl_silent = value;
				return this;
			}
			return this._cl_silent;
		}
});

a5.Package('a5.cl')

	.Extends('a5.Attribute')
	.Class('AjaxCallAttribute', function(cls, im, AjaxCallAttribute){
		
		AjaxCallAttribute.CANCEL_CYCLE	= 'ajaxCallAttributeCancelCycle';
		
		var cycledCalls = {};
		
		cls.AjaxCallAttribute = function(){
			cls.superclass(this);
			
		}
		
		cls.Override.methodPre = function(rules, args, scope, method, callback){
			args = Array.prototype.slice.call(args);
			var data = null,
				rules = rules.length ? rules[0] : {},
				propObj = null;
			if (rules.takesData === true && args.length)
				data = args.shift();
			var executeCall = function(){
				scope.call(method.getName(), data, function(response){
					args.unshift(response);
					callback(args);
				}, (rules && rules.length ? rules[0] : null));
			}
			if (args[0] === AjaxCallAttribute.CANCEL_CYCLE) {
				if (method._cl_cycleID) {
					clearInterval(method._cl_cycleID);
					delete method._cl_cycleID;
				}
				return a5.Attribute.ASYNC;
			}
			if (rules.cycle) {
				if (!method._cl_cycleID) {
					method._cl_cycleID = setInterval(function(){
						method.apply(scope, args);
					}, rules.cycle);
					executeCall();
				} else {
					executeCall();
				}
			} else {
				executeCall();
			}
			return a5.Attribute.ASYNC;
		}	
})

a5.Package('a5.cl')

	.Extends('a5.Attribute')
	.Class('BoundAjaxReturnAttribute', function(cls){
		
		cls.BoundAjaxReturnAttribute = function(){
			cls.superclass(this);
		}
		
		cls.Override.methodPost = function(rules, args, scope, method, callback){
			if (rules.length && rules[0].receiverMethod !== undefined) {
				var method = rules[0].receiverMethod;
				method.call(null, args[0]);
			} else {
				scope.notifyReceivers(args[0]);
			}
			return a5.Attribute.SUCCESS;
		}
	})



/**
 * @class 
 * @name a5.cl.CLPlugin
 * @extends a5.cl.CLBase
 */
a5.Package('a5.cl')

	.Extends('CLBase')
	.Prototype('CLPlugin', 'abstract', function(proto, im){
		
		/**#@+
	 	 * @memberOf a5.cl.CLPlugin#
	 	 * @function
		 */		
		
		proto.CLPlugin = function(){
			proto.superclass(this);
			this._cl_pluginConfig = null;
			this._cl_configDefaults = {};
			this._cl_requiredVersion = '0';
			this._cl_maxVerifiedVersion = null;
			this._cl_requires = [];
		}
		
		/**
		 * @name pluginConfig
		 */
		proto.pluginConfig = function(){
			return this._cl_pluginConfig;
		}
		
		/**
		 * @name requires
		 * @param {Object} val
		 */
		proto.requires = function(val){
			this._cl_requires.push(val);
		}
		
		/**
		 * @name requiredVersion
		 * @param {Object} value
		 */
		proto.requiredVersion = function(value){
			if(value !== undefined) this._cl_requiredVersion = value;
			return this._cl_requiredVersion;
		}
		
		/**
		 * @name maxVerifiedVersion
		 * @param {Object} value
		 */
		proto.maxVerifiedVersion = function(value){
			if(value !== undefined) this._cl_maxVerifiedVersion = value;
			return this._cl_maxVerifiedVersion;
		}
		
		/**
		 * @name configDefaults
		 */
		proto.configDefaults = function(value){
			 if(value !== undefined)
			 	this._cl_configDefaults = value;
			return this._cl_configDefaults;
		}
		
		
		/**
		 * @name initializePlugin
		 */
		proto.initializePlugin = function(){}
		
		/**
		 * @name registerForProcess
		 * @param {Object} type
		 */
		proto.registerForProcess = function(type){
			this.cl()._core().pluginManager().registerForProcess(type, this);
		}
		
		proto._cl_sourceConfig = function(){
			var cfg = a5.cl.CLMain._cl_storedCfgs.pluginConfigs;
			var pkg = this.classPackage();
			if(String(pkg[pkg.length-1]).toLowerCase() != this.className().toLowerCase())
						pkg = pkg + '.' + this.constructor.className();
			for (var prop in cfg){
				var pluginCfg = cfg[prop];
				 if(pluginCfg.nm && (pluginCfg.nm === pkg || pluginCfg.nm === this.constructor.className()))
				 	return pluginCfg.obj;
			}
			return {};
		}
	
});


/**
 * @class 
 * @name a5.cl.CLAddon
 * @extends a5.cl.CLPlugin
 */
a5.Package('a5.cl')

	.Extends('CLPlugin')
	.Prototype('CLAddon', 'abstract', function(proto, im, CLAddon){
		
		CLAddon.INITIALIZE_COMPLETE = 'clAddonInitializeComplete';
		
		/**#@+
	 	 * @memberOf a5.cl.CLAddon#
	 	 * @function
		 */		
		
		proto.CLAddon = function(){
			proto.superclass(this);
		}
		
		proto.getCreateParams = function(){
			return a5.cl.instance()._cl_createParams();
		}
		
		proto.initializeAddOn = function(){
			return false;
		}
		
		proto.createMainConfigMethod = function(type){
			a5.cl.CLMain.prototype['set' + type.substr(0, 1).toUpperCase() + type.substr(1)] = function(){
				a5.cl.CLMain._cl_storedCfgs[type] = Array.prototype.slice.call(arguments);
			}
		}
		
		proto.getMainConfigProps = function(type){
			return a5.cl.CLMain._cl_storedCfgs[type];
		}
		
		proto.registerAutoInstantiate = function(){
			a5.cl.core.Instantiator.instance().registerAutoInstantiate.apply(null, arguments);
		}
		
		proto.defineRegisterableProcess = function(process){
			this.cl()._core().pluginManager().defineRegisterableProcess(process);
		}
	
});


a5.Package("a5.cl")

	.Extends('CLBase')
	.Mix('a5.cl.mixins.Binder')
	.Class("CL", 'singleton', function(self, im){
		/**#@+
	 	 * @memberOf a5.cl.CL#
	 	 * @function
		 */
	
		var _params,
			_config,
			_main,
			core;
		
		this._cl_plugins = {};

		this.CL = function(params){
			self.superclass(this);
			_params = params;
			if(a5.cl.CLMain._extenderRef.length)
				_main = self.create(a5.cl.CLMain._extenderRef[0], [self]);
			if(!params.applicationPackage)
				params.applicationPackage = _main.classPackage();
			core = self.create(a5.cl.core.Core, [params.applicationPackage]);
			_config = a5.cl.core.Utils.mergeObject(core.instantiator().instantiateConfiguration(), params);
			_config = core.instantiator().createConfig(_config);
			core.initializeCore((params.environment || null), (params.clientEnvironment || null));
		}
		
		this.launchState = function(){ return core.launchState(); }
		
		/**
		 *
		 * @param {Boolean} [returnString]
		 */
		this.applicationPackage = function(){ return core.instantiator().applicationPackage.apply(this, arguments); };
		
		/**
		 *
		 */
		this.Override.appParams = function(){	return a5.cl.CLMain._cl_storedCfgs.appParams; }

		/**
		 *
		 * @type String
		 * @param {Boolean} [root]
		 */
		this.appPath = function(root){ return core.envManager().appPath(root); }
		
		/**
		 *
		 * @type Number
		 */
		this.browserVersion = function(){	return core.envManager().browserVersion();	}
		
		/**
		 * Defines A5 CL client environment types. One of 'DESKTOP', 'MOBILE', or 'TABLET'.
		 *
		 * @type String
		 */
		this.clientEnvironment = function(){	return core.envManager().clientEnvironment.apply(null, arguments);	}
		
		/**
		 * Defines A5 CL client platform types.<br/>
		 * Values:<br/>
		 * 'BB6' - BlackBerry OS 6<br/>
		 * 'BB' - BlackBerry OS 5 and under<br/>
		 * 'IOS' - Apple iOS<br/>
		 * 'ANDROID' - Google Android<br/>
		 * 'IE' - Internet Explorer<br/>
		 * 'UNKNOWN' - Unknown platform.<br/>
		 *
		 * @type String
		 */
		this.clientPlatform = function(){		return core.envManager().clientPlatform();	}
		
		/**
		 * 
		 */
		this.clientOrientation = function(){ return core.envManager().clientOrientation(); }
		
		/**
		 *
		 */
		this.Override.config = function(){		return _config; }		
		
		/**
		 * Defines AirFrame CL development environment types. One of 'DEVELOPMENT', 'TEST', or 'PRODUCTION'.
		 *
		 * @type String
		 */
		this.environment = function(){	return core.envManager().environment();	}
		
		
		/**
		 * Includes external content into the application.
		 *
		 * @param {String} value
		 * @param {function} callback
		 * @param {function} [itemCallback]
		 * @param {Boolean} [allowReplacements=true]
		 * @param {function} [onError]
		 */
		this.include = function(){ return core.resourceCache().include.apply(this, arguments); }	
		
		/**
		 * Returns whether the client environment supports manifest caching.
		 *
		 */
		this.isOfflineCapable = function(){		return core.manifestManager().isOfflineCapable();	}
		
		/**
		 * Returns whether the application is running on http:// or file://
		 *
		 */
		this.isLocal = function(){ return core.envManager().isLocal(); }
		
		/**
		 * Returns the current online state of the client browser, where supported.
		 *
		 */
		this.isOnline = function(){	return core.envManager().isOnline();	}	
		
		/**
		 *
		 */
		this.manifestBuild = function(){ return core.manifestManager().manifestBuild();	}
		
		/**
		 *
		 */
		this.Override.plugins = function(){ return this._cl_plugins; }
		
		/**
		 * @param {Boolean} [restartOnComplete] Restarts the application after purging the cache.
		 */
		this.purgeAllCaches = function(restartOnComplete){ core.resourceCache().purgeAllCaches(restartOnComplete); }
		
		/**
		 * Purges the manifest cache data in applicationStorage, if applicable.
		 *
		 * @param {Boolean} [restartOnComplete] Restarts the application after purging the cache.
		 */
		this.purgeApplicationCache = function(restartOnComplete){ core.manifestManager().purgeApplicationCache(restartOnComplete); }
		
		/**
		 * Restarts the application.
		 */
		this.relaunch = function(){ core.relaunch(); }
		
		this._core = function(){		return core; }
		
		this._cl_createParams = function(){ return _params; }
		
		this.Override.eListenersChange = function(e){
			var ev = a5.cl.CLEvent.GLOBAL_UPDATE_TIMER_TICK;
			if(e.type === ev){
				if(this.getTotalListeners(ev) > 0)
					core.globalUpdateTimer().startTimer();
				else
					core.globalUpdateTimer().stopTimer();
			}	
		}
	
});


a5.Package('a5.cl')

	.Extends('CLBase')
	.Static(function(CLMain){
		CLMain._cl_storedCfgs = {config:[], appParams:{}, pluginConfigs:[]};
	})
	.Prototype('CLMain', 'abstract', function(proto, im, CLMain){
		
		proto.CLMain = function(){
			proto.superclass(this);
			if(CLMain._extenderRef.length > 1)
				return proto.throwError(proto.create(a5.cl.CLError, ['Invalid class "' + this.namespace() + '", a5.cl.CLMain must only be extended by one subclass.']))
			if(this.getStatic().instanceCount() > 1)
				return proto.throwError(proto.create(a5.cl.CLError, ['Invalid duplicate instance of a5.cl.CLMain subclass "' + this.getStatic().namespace() + '"']));
			proto.cl().addOneTimeEventListener(im.CLEvent.APPLICATION_WILL_RELAUNCH, this.applicationWillRelaunch);
			proto.cl().addEventListener(im.CLEvent.ONLINE_STATUS_CHANGE, this.onlineStatusChanged);
			proto.cl().addOneTimeEventListener(im.CLEvent.APPLICATION_CLOSED, this.applicationClosed);
			proto.cl().addOneTimeEventListener(im.CLEvent.PLUGINS_LOADED, this.pluginsLoaded);
			proto.cl().addOneTimeEventListener(im.CLEvent.AUTO_INSTANTIATION_COMPLETE, this.autoInstantiationComplete);
			proto.cl().addOneTimeEventListener(im.CLEvent.APPLICATION_WILL_LAUNCH, this.applicationWillLaunch);
			proto.cl().addOneTimeEventListener(im.CLEvent.APPLICATION_LAUNCHED, this.applicationLaunched);
		}
		
		/**
		 * 
		 * @param {Object} obj
		 */
		proto.setAppParams = function(obj){ CLMain._cl_storedCfgs.appParams = obj; }
		
		/**
		 * 
		 * @param {Object} obj
		 */
		proto.setConfig = function(obj){ CLMain._cl_storedCfgs.config = obj; }
		
		/**
		 * 
		 * @param {string} namespace
		 * @param {Object} obj
		 */
		proto.setPluginConfig = function(namespace, obj){ CLMain._cl_storedCfgs.pluginConfigs.push({nm:namespace, obj:obj}); }
		
		/**
		 * 
		 */
		proto.pluginsLoaded = function(){}
		/**
		 * @name onlineStatusChanged
		 * @description Called by the framework when the browser's online status has changed. This is equivalent to listening for {@link a5.cl.MVC.event:ONLINE_STATUS_CHANGE}.
		 */
		proto.onlineStatusChanged = function(isOnline){}
		
		/**
		 * @name autoInstantiationComplete 
		 * @description Called by the framework when auto detected classes have been successfully instantiated.
		 */
		proto.autoInstantiationComplete = function(){}
		
		/**
		 * @name applicationWillLaunch 
		 * @description Called by the framework when the application is about to launch.
		 */
		proto.applicationWillLaunch = function(){}
		
		/**
		 * @name applicationLaunched 
		 * @description Called by the framework when the application has successfully launched.
		 */
		proto.applicationLaunched = function(){}
		
		/**
		 * @name applicationWillClose
		 * @description Called by the framework when the window is about to be closed. This method is tied to
		 * the onbeforeunload event in the window, and as such can additionally return back a custom string value to throw in a confirm
		 * dialogue and allow the user to cancel the window close if desired.
		 */
		proto.applicationWillClose = function(){
			
		}
		
		/**
		 * @name applicationClosed
		 * @description Called by the framework when the window is closing.
		 */
		proto.applicationClosed = function(){}
		
		/**
		 * @name applicationWillRelaunch
		 * @description Called by the framework when the application is about to relaunch.
		 */
		proto.applicationWillRelaunch = function(){}
})	



})(this);