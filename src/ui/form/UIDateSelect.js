a5.Package('a5.cl.ui.form')
	
	.Import('a5.cl.ui.form.*',
			'a5.cl.ui.events.*',
			'a5.cl.ui.buttons.UIButton',
			'a5.PropertyMutatorAttribute')
	.Extends('a5.cl.ui.form.UIFormElement')
	.Static(function(UIDateSelect){
		
		UIDateSelect.ALLOW_ALL = 'uiDateSelectAllowAll';
		
		UIDateSelect.FUTURE = 'uiDateSelectAllowFuture';
		
		UIDateSelect.PAST = 'uiDateSelectAllowPast';
		
	})
	.Prototype('UIDateSelect', function(cls, im, UIDateSelect){
		
		this.Properties(function(){
			this._cl_daySelect = null;
			this._cl_monthSelect = null;
			this._cl_yearSelect = null;
			this._cl_hourSelect = null;
			this._cl_minuteSelect = null;
			this._cl_showTime = false;
			this._cl_minYear = 1970;
			this._cl_maxYear = 2050;
			this._cl_allowDates = UIDateSelect.ALLOW_ALL;
			this._cl_showSelectNow = false;
			this._cl_showClear = false;
			this._cl_dateValue = null;
			this._cl_ready = false;
		})
		
		cls.UIDateSelect = function(){
			cls.superclass(this);
			this._cl_element = new im.UIInputField().width(380).enabled(false);
			this._cl_element.includeInParentForm(false);
			this._cl_element.element().style.fontSize = '10px';
			this._cl_element.element().style.textAlign = 'center';
		}	
		
		cls.Override.viewReady = function(){
			cls.superclass().viewReady.apply(this, arguments);
			this.relY(true).height('auto');
			this.inputView().width(0);
			var wrapper = new a5.cl.CLViewContainer();
			wrapper.relX(true).height('auto').border(1).width(380).padding(2);
			this.addSubView(this._cl_element);
			this._cl_monthSelect = new im.UISelect().label('Month').width(100).relY(true).includeInParentForm(false);
			this._cl_monthSelect.inputView().width(100);
			this._cl_monthSelect.addEventListener(im.UIEvent.CHANGE, this._cl_selectionChangeHandler, false, this);
			this._cl_daySelect = new im.UISelect().label('Day').width(50).relY(true).x(5).includeInParentForm(false);
			this._cl_daySelect.inputView().width(50);
			this._cl_daySelect.addEventListener(im.UIEvent.CHANGE, this._cl_selectionChangeHandler, false, this);
			this._cl_yearSelect = new im.UISelect().label('Year').width(100).relY(true).x(5).includeInParentForm(false);
			this._cl_yearSelect.inputView().width(100);
			this._cl_yearSelect.addEventListener(im.UIEvent.CHANGE, this._cl_selectionChangeHandler, false, this);
			wrapper.addSubView(this._cl_monthSelect);
			wrapper.addSubView(this._cl_daySelect);
			wrapper.addSubView(this._cl_yearSelect);
			if(this.showTime()){
				this._cl_hourSelect = new im.UISelect().label('Hour').width(50).relY(true).x(5).includeInParentForm(false);
				this._cl_hourSelect.inputView().width(50);
				this._cl_hourSelect.addEventListener(im.UIEvent.CHANGE, this._cl_selectionChangeHandler, false, this);
				this._cl_minuteSelect = new im.UISelect().label('Minute').width(50).relY(true).x(5).includeInParentForm(false);
				this._cl_minuteSelect.inputView().width(50);
				this._cl_minuteSelect.addEventListener(im.UIEvent.CHANGE, this._cl_selectionChangeHandler, false, this);
				wrapper.addSubView(this._cl_hourSelect);
				wrapper.addSubView(this._cl_minuteSelect);
			}
			this.addSubView(wrapper);
			var btnWrapper = new a5.cl.CLViewContainer();
			btnWrapper.relX(true).height('auto')
			if(this.showClear()){
				var clearBtn = new im.UIButton().label('Clear Date');
				clearBtn.height(20).width('auto').labelView().fontSize(10);
				clearBtn.addEventListener(im.UIMouseEvent.CLICK, this._cl_clearValues, false, this);
				btnWrapper.addSubView(clearBtn);
			}
			if(this.showSelectNow()){
				var showNowBtn = new im.UIButton().label('Set To Now');
				showNowBtn.height(20).width('auto').labelView().fontSize(10);
				showNowBtn.addEventListener(im.UIMouseEvent.CLICK, this._cl_setToNow, false, this);
				btnWrapper.addSubView(showNowBtn);
			}
			this.addSubView(btnWrapper);
			this._cl_populateValues();
			this._cl_ready = true;
			if(this._cl_dateValue)
				this._cl_applyValue();
		}
		
		cls.showTime = this.Attributes(['PropertyMutator', {property:'_cl_showTime'}]);		
		cls.minYear = this.Attributes(['PropertyMutator', {property:'_cl_minYear'}]);
		cls.maxYear = this.Attributes(['PropertyMutator', {property:'_cl_maxYear'}]);
		cls.showClear = this.Attributes(['PropertyMutator', {property:'_cl_showClear'}]);
		cls.showSelectNow = this.Attributes(['PropertyMutator', {property:'_cl_showSelectNow'}]);
		cls.allowDates = this.Attributes(['PropertyMutator', {property:'_cl_allowDates'}]);
		
		cls.Override.value = function(val){
			if(val !== undefined){
				this._cl_dateValue = new Date(val);
				if(this._cl_ready)
					this._cl_applyValue();
				return this;
			}
			return this._cl_dateValue;
		}
		
		cls._cl_clearValues = function(){
			this._cl_daySelect.selectedOption(-1);
			this._cl_monthSelect.selectedOption(-1);
			this._cl_yearSelect.selectedOption(-1);
			if (this.showTime()) {
				this._cl_hourSelect.selectedOption(-1);
				this._cl_minuteSelect.selectedOption(-1);
			}
			this._cl_dateValue = null;
			this._cl_updateSelectedDisplay();
		}
		
		cls._cl_setToNow = function(){
			this.value(new Date());
		}
		
		cls._cl_populateValues = function(){
			for(var i = 1, l= 32; i<l; i++)
				this._cl_daySelect.addOption(i, i);
			var monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			for(i = 0, l = monthArr.length; i<l; i++)
				this._cl_monthSelect.addOption(monthArr[i], i);
			for(i = this._cl_minYear, l = this.maxYear()+1; i<l; i++)
				this._cl_yearSelect.addOption(i, i);
			if(this.showTime()){
				for(i = 0, l = 25; i<l; i++)
					this._cl_hourSelect.addOption(i, i);
				for(i = 0, l = 61; i<l; i++)
					this._cl_minuteSelect.addOption(i, i);
			}
				
		}
		
		cls._cl_selectionChangeHandler = function(e){
			this._cl_updateValue();
		}
		
		cls._cl_updateValue = function(){
			var dt = new Date(),
				now = new Date();
			dt.setFullYear(this._cl_yearSelect.selectedOption() ? this._cl_yearSelect.selectedOption().value : this.minYear());			
			dt.setMonth(this._cl_monthSelect.selectedOption() ? this._cl_monthSelect.selectedOption().value : 0);	
			dt.setDate(this._cl_daySelect.selectedOption() ? this._cl_daySelect.selectedOption().value : 1);
			if(this.showTime()){
				dt.setHours(this._cl_hourSelect.selectedOption() ? this._cl_hourSelect.selectedOption().value : 0);			
				dt.setMinutes(this._cl_minuteSelect.selectedOption() ? this._cl_minuteSelect.selectedOption().value : 0);	
				dt.setSeconds(0);
			}
			if((this._cl_allowDates == UIDateSelect.FUTURE && dt < now) || this._cl_allowDates == UIDateSelect.PAST && dt > now)
				dt = now;
					
			this._cl_dateValue = dt;
			this._cl_applyValue();
		}
		
		cls._cl_updateSelectedDisplay = function(){
			if(this._cl_dateValue)
				this._cl_element.value(this._cl_dateValue.toLocaleFormat());
			else
				this._cl_element.value("");
		}
		
		cls._cl_applyValue = function(){
			if(this._cl_dateValue){
				var dt = this._cl_dateValue;
				this._cl_updateSelectedDisplay();
				this._cl_daySelect.selectedOption({value:dt.getDate()});
				this._cl_monthSelect.selectedOption({value:dt.getMonth()});
				this._cl_yearSelect.selectedOption({value:dt.getFullYear()});
				if(this.showTime()){
					this._cl_hourSelect.selectedOption({value:dt.getHours()});
					this._cl_minuteSelect.selectedOption({value:dt.getMinutes()});
				}
			}
		}
})