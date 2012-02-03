
a5.Package('a5.cl.ui.modals')
	.Import('a5.cl.ui.events.UIEvent',
			'a5.cl.ui.events.UIMouseEvent',
			'a5.cl.ui.buttons.UIButton',
			'a5.cl.ui.core.UIUtils')
	.Extends('a5.cl.CLWindow')
	.Static(function(UIInputHistoryList){
		UIInputHistoryList.open = function(input){
			return UIInputHistoryList.instance(true).open(input);
		}
		
		UIInputHistoryList.close = function(){
			return UIInputHistoryList.instance(true).close();
		}
		
		UIInputHistoryList.update = function(historyArray){
			return UIInputHistoryList.instance(true).update(historyArray);
		}
		
		UIInputHistoryList.nextItem = function(){
			return UIInputHistoryList.instance(true).nextItem();
		}
		
		UIInputHistoryList.previousItem = function(){
			return UIInputHistoryList.instance(true).previousItem();
		}
		
		UIInputHistoryList.selectedItem = function(){
			return UIInputHistoryList.instance(true).selectedItem();
		}
		
		UIInputHistoryList.isOpen = function(){
			return UIInputHistoryList.instance(true).isOpen();
		}
	})
	.Class('UIInputHistoryList', 'singleton', function(self, im){
		var optionGroup = this.create(a5.cl.ui.form.UIOptionGroup, ['inputHistoryList']),
			historyArray = [],
			input = null,
			isOpen = false,
			buttonCache = {},
			maxItems = 5;
		
		self.UIInputHistoryList = function(){
			self.superclass(this);
			this._cl_windowLevel = a5.cl.CLWindowLevel.CONTEXT;
			
			optionGroup.addEventListener(im.UIEvent.CHANGE, function(e){
				self.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.CHANGE]));
			});
		}
		
		self.viewReady = function(){
			self.superclass().viewReady.apply(this, arguments);
			
			this.relY(true)
				.border(1)
				.backgroundColor('transparent')
				.height('auto');
		}
		
		self.open = function(_input){
			input = _input;
			//populate the list
			this.update(input.getHistory(true));
			
			if(!isOpen && historyArray.length > 0){
				//add the window to the view stack
				var rootView = this.cl().application().view(),
					globalPosition = im.UIUtils.getGlobalPosition(input.inputView(), rootView);
				this.x(globalPosition.left)
						.y(globalPosition.top + input.height())
						.width(input.inputView().width());
				rootView.addWindow(this);
				isOpen = true;
			}
		}
		
		self.close = function(){
			if (isOpen) {
				this.cl().application().removeWindow(this, false);
				isOpen = false;
				this.dispatchEvent(this.create(im.UIEvent, [im.UIEvent.CLOSE]));
			}
		}
		
		self.update = function(_history){
			historyArray = _history
			if (historyArray.length > 0) {
				this.removeAllSubViews(false);
				for (var x = 0, y = historyArray.length; x < y; x++) {
					this.addSubView(getListButton(historyArray[x]).data(x).selected(/*x === 0*/false));
				}
				//this.dispatchEvent(self.create(im.UIEvent, [im.UIEvent.CHANGE]));
				optionGroup.selectedOption(null);
			} else {
				this.close();
			}
		}
		
		self.nextItem = function(){
			var curIndex = optionGroup.selectedOption() ? optionGroup.selectedOption().data() : -1;
			if(curIndex < historyArray.length - 1)
				buttonCache[historyArray[curIndex + 1]].selected(true);
		}
		
		self.previousItem = function(){
			var curIndex = optionGroup.selectedOption() ? optionGroup.selectedOption().data() : 0;
			//if on first one, close
			if (curIndex === 0) 
				this.close();
			else
				buttonCache[historyArray[curIndex - 1]].selected(true);
		}
		
		self.maximumVisibleItems = function(value){
			if(typeof value === 'number'){
				maxItems = value;
				return this;
			}
			return maxItems;
		}
		
		self.selectedItem = function(){
			return optionGroup.selectedOption().label();
		}
		
		self.isOpen = function(){
			return isOpen;
		}
		
		var getListButton = function(label){
			//if there's already a button with that label, return it from teh cache
			if(buttonCache[label])
				return buttonCache[label];
			//otherwise, create a new one
			var button = self.create(im.UIButton, [label]);
			button.width('100%').height(25)
				.upBorder({top:0, right:0, left:0, bottom:1}).overBorder({bottom:1}).downBorder({bottom:1}).selectedBorder({bottom:1})
				.upColor('#fff').overColor('#aaa').downColor('#aaa').selectedColor('#aaa')
				.optionGroup(optionGroup)
				.labelView()
					.width('100%')
					.alignX('left');
			//button.addEventListener(im.UIMouseEvent.MOUSE_OVER, eButtonHandler);
			button.addEventListener(im.UIMouseEvent.MOUSE_DOWN, eButtonHandler);
			buttonCache[label] = button;
			return button;
		}
		
		var eButtonHandler = function(e){
			e.target().selected(true);
		}
		
		self.dealloc = function(){
			this.removeAllSubViews(false);
			for(var prop in buttonCache){
				buttonCache[prop].destroy();
				delete buttonCache[prop];
			}
		}

});
