
a5.Package('a5.cl.ui.core')
	.Static('UIUtils', function(UIUtils){
		UIUtils.drawTriangle = function(direction, color, width, height){
			var elem = document.createElement('div');
			elem.style.width = elem.style.height = '0';
			elem.style.borderStyle = 'solid';
			switch(direction){
				case 'up':
					elem.style.borderColor = 'transparent transparent ' + color;
					elem.style.borderWidth = '0 ' + (width / 2) + 'px ' + height + 'px';
					break;
				case 'down':
					elem.style.borderColor = color + ' transparent transparent transparent';
					elem.style.borderWidth = height + 'px ' + (width / 2) + 'px 0';
					break;
				case 'left':
					elem.style.borderColor = 'transparent ' + color + ' transparent transparent';
					elem.style.borderWidth = (height / 2) + 'px ' + width + 'px' + (height / 2) + 'px 0';
					break;
				case 'right':
					elem.style.borderColor = 'transparent transparent transparent ' + color;
					elem.style.borderWidth = (height / 2) + 'px 0 ' + (height / 2) + 'px ' + width + 'px';
					break;
			}
			return elem;
		}
		
		UIUtils.getGlobalPosition = function(elem, context){
			//if views were passed in, get the actual dom elements
			if(elem instanceof a5.cl.CLView)
				elem = elem._cl_viewElement;
			if(context instanceof a5.cl.CLView)
				context = context._cl_viewElement;
			else
				context = a5.cl.Instance().MVC().application().view();
			
			var obj = elem,
				topVal = 0,
				leftVal = 0;
			do { //climb the DOM
				if(context && obj === context)
					break;
				topVal += obj.offsetTop - obj.scrollTop + obj.clientTop;
				leftVal += obj.offsetLeft - obj.scrollLeft + obj.clientLeft;
			} while (obj = obj.offsetParent);
			topVal -= elem.clientTop;
			leftVal -= elem.clientLeft;
			
			return {top:topVal, left:leftVal};
		}
		
		UIUtils.selectTextRange = function(start, end, field){
			if(field.createTextRange) {
				var newend = end - start,
					selRange = field.createTextRange();
				selRange.collapse(true);
				selRange.moveStart("character", start);
				selRange.moveEnd("character", newend);
				selRange.select();
			} else if( field.setSelectionRange ){
				field.setSelectionRange(start, end);
			}
			field.focus();
		}
});
