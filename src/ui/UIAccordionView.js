
/**
 * @class 
 * @name a5.cl.ui.UIAccordionView
 * @extends a5.cl.ui.UIControl
 */
a5.Package('a5.cl.ui')
	.Extends('UIControl')
	.Static(function(UIAccordionView){
		UIAccordionView.HORIZONTAL = 0;
		UIAccordionView.VERTICAL = 1;
	})
	.Prototype('UIAccordionView', function(proto, im){
		proto.UIAccordionView = function(){
			proto.superclass(this);
			this._cl_direction = 1;
			this.relY(true);
			this._cl_handleSize = null;
			this._cl_singleSelection = false;
			this._cl_fillView = false;
			this._cl_panels = null;
			this._cl_expandedPanels = [];
			this._cl_expandDuration = 0;
			this._cl_collapseDuration = 0;
			this.width('100%');
			
			var self = this;
			this.addEventListener(a5.cl.ui.events.UIEvent.SELECT, function(e){
				var targetPanel = e.target();
				if(targetPanel.isExpanded() && !self._cl_fillView)
					self.collapsePanel(targetPanel);
				else
					self.expandPanel(targetPanel);
			});
		}

		proto.Override.childrenReady = function(){
			this.build();
		}
		
		/**
		 * Builds (or re-builds) the accordion view.
		 */
		proto.build = function(){
			this._cl_panels = [];
			for(var x = 0, y = this.subViewCount(); x < y; x++){
				var thisView = this.subViewAtIndex(x);
				if(thisView._cl_initialized && thisView instanceof a5.cl.ui.UIAccordionPanel){
					thisView._cl_accordion = this;
					//add this view to the array of panels
					this._cl_panels.push(thisView);
				}
			}
			//expand the panels that were expanded before building
			this._cl_updatePanels();
		}
		
		proto._cl_updatePanels = function(){
			var x, y, thisPanel, prevPanel, size, shouldExpand, didExpand, didCollapse, targetSize, duration;
			for(x = 0, y = this._cl_panels.length; x < y; x++){
				thisPanel = this._cl_panels[x];
				prevPanel = x > 0 ? this._cl_panels[x - 1] : null
				//adjust for horizontal vs vertical
				size = this._cl_direction === im.UIAccordionView.HORIZONTAL ? a5.cl.CLViewContainer.prototype.width : a5.cl.CLViewContainer.prototype.height;
				//determine if this panel should be expanded or collapsed
				shouldExpand = a5.cl.core.Utils.arrayIndexOf(this._cl_expandedPanels, x) > -1 || !thisPanel.collapsible();
				didExpand = shouldExpand && !thisPanel.isExpanded();
				didCollapse = !shouldExpand && thisPanel.isExpanded();
				//size this panel accordingly
				if(this._cl_handleSize !== null)
					thisPanel.collapsedSize(this._cl_handleSize);
				targetSize = shouldExpand							//if this panel should be expanded... 
					? (this._cl_fillView							//and if we should be filling the view...
						? ((0 - this._cl_handleSize * (y - 1)) + '')//then calculate the size to fill the view
						: thisPanel.expandedSize())					//if not filling, set to the expandedSize
					: thisPanel.collapsedSize();					//else collapse to just the handle
				duration = (didExpand && this._cl_expandDuration > 0) ? this._cl_expandDuration : (didCollapse && this._cl_collapseDuration > 0 ? this._cl_collapseDuration : false);
				if(duration)
					thisPanel.animate(duration, {
						height: targetSize,
						redrawOnProgress: true
					});
				else
					size.call(thisPanel, targetSize);
				//alert the panel of its new state
				thisPanel._cl_expanded = shouldExpand;
				if(didExpand)
					thisPanel.expanded.call(thisPanel);
				else if(didCollapse)
					thisPanel.collapsed.call(thisPanel);
			}
		}
		
		/**
		 * Append a UIAccordionPanel.
		 * @param {a5.cl.ui.UIAccordionPanel} panel The panel to add.
		 */
		proto.addPanel = this.Attributes(
		["a5.Contract", {panel:'a5.cl.ui.UIAccordionPanel'}], 
		function(args){
			if(args){
				this.addSubView(args.panel);
				this.build();
			}
		})
		
		proto.addPanelAtIndex = this.Attributes(
		["a5.Contract", {panel:'a5.cl.ui.UIAccordionPanel', index:'number'}], 
		function(args){
			if(args){
				this.addSubViewAtIndex(args.panel, args.index);
				this.build();
			}
		})
		
		proto.removePanel = this.Attributes(
		["a5.Contract", {panel:'a5.cl.ui.UIAccordionPanel'}], 
		function(args){
			if(args){
				this.removeSubView(args.panel);
			}
		})
		
		proto.removePanelAtIndex = function(index){
			this.removeViewAtIndex(index);
		}
		
		proto.removeAllPanels = function(){
			this.removeAllSubViews();
		}
		
		/**
		 * 
		 * @param {Object} panel
		 */
		proto.expandPanel = function(panel){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				if(thisPanel === panel){
					this.expandPanelAtIndex(x);
				}
			}
		}
		
		/**
		 * 
		 * @param {Object} panel
		 */
		proto.collapsePanel = function(panel){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				var thisPanel = this._cl_panels[x];
				if(thisPanel === panel){
					this.collapsePanelAtIndex(x);
				}
			}
		}
		
		/**
		 * 
		 * @param {Object} index
		 */
		proto.expandPanelAtIndex = function(index){
			if(this._cl_singleSelection){
				this._cl_expandedPanels = [index];
				this._cl_updatePanels();
				return this.getPanelAtIndex(index);
			} else if (a5.cl.core.Utils.arrayIndexOf(this._cl_expandedPanels, index) === -1) {
				this._cl_expandedPanels.push(index);
				this._cl_updatePanels();
				return this.getPanelAtIndex(index);
			}
			return null;
		}
		
		/**
		 * 
		 * @param {Object} index
		 */
		proto.collapsePanelAtIndex = function(index){
			var indexSquared = a5.cl.core.Utils.arrayIndexOf(this._cl_expandedPanels, index);
			if (indexSquared > -1){
				var collapsedPanel = this._cl_expandedPanels.splice(indexSquared, 1)[0];
				this._cl_updatePanels();
				return collapsedPanel;
			}
			return null;
		}
		
		/**
		 * Expands all of the panels in this accordion view.
		 */
		proto.expandAllPanels = function(){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.expandPanelAtIndex(x);
			}
		}
		
		/**
		 * Collapses all of the panels in this accordion view.
		 */
		proto.collapseAllPanels = function(){
			for(var x = 0, y = this._cl_panels.length; x < y; x++){
				this.collapsePanelAtIndex(x);
			}
		}
		
		/**
		 * 
		 */
		proto.totalPanels = function(){
			return this._cl_panels.length;
		}
		
		proto.getPanelAtIndex = function(index){
			return this._cl_panels[index];
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.direction = function(value){
			if (value === im.UIAccordionView.HORIZONTAL || value === im.UIAccordionView.VERTICAL){
				this._cl_direction = value;
				this.relX(value === im.UIAccordionView.HORIZONTAL);
				this.relY(value === im.UIAccordionView.VERTICAL);
				this.build();
				return this;
			}
			return this._cl_direction;
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.handleSize = function(value){
			if (typeof value === 'number') {
				this._cl_handleSize = value;
				this.build();
				return this;
			}
			return this._cl_handleSize;
		}
		
		/**
		 * 
		 * @param {Object} value
		 */
		proto.singleSelection = function(value){
			if (typeof value === 'boolean') {
		if(!this._cl_fillView) //only allow single selection to be modified if fillView is false (otherwise it must be true)
			this._cl_singleSelection = value;
				return this;
			}
			return this._cl_singleSelection;
		}

		/**
		 * 
		 * @param {Object} value
		 */
		proto.fillView = function(value){
			if (typeof value === 'boolean') {
				this._cl_fillView = value;
				if(value) this._cl_singleSelection = true;
				return this;
			}
			return this._cl_fillView;
		}
		
		proto.expandDuration = function(value){
			if(typeof value === 'number'){
				this._cl_expandDuration = value;
				return this;
			}
			return this._cl_expandDuration;
		}
		
		proto.collapseDuration = function(value){
			if(typeof value === 'number'){
				this._cl_collapseDuration = value;
				return this;
			}
			return this._cl_collapseDuration;
		}
		
		proto.Override.removeSubView = function(){
			proto.superclass().removeSubView.apply(this, arguments);
			this.build();
		}
	});
