
/**
 * @class Presents the user with a modal alert window with an option list.
 * @name a5.cl.ui.UIAlertOptionList
 * @extends a5.cl.ui.UIAlertWindow
 */
a5.cl.ui.UIAlertOptionList = {};

a5.cl.ui.UIAlertOptionList._listItems = null;

/**
 * @memberOf a5.cl.ui.UIAlertOptionList
 * @static 
 * @param {Object} title
 * @param {Object} itemsArray
 * @param {Object} onComplete
 * @param {Object} onCancel
 */
a5.cl.ui.UIAlertOptionList.show = function(params){
	var self = this,
	onCancel = params.onCancel,
	onComplete = params.onComplete,
	itemsArray = params.items || [],
	instance = a5.cl.ui.UIAlertWindow.show({
		title:params.title,
		onCancel:function(){
			if(onCancel) onCancel();
			self._onhide();
		}
	});
	instance.contentArea().innerHTML = '';
	a5.cl.ui.UIAlertOptionList._listItems = [];
	for (var i = 0, l=itemsArray.length; i < l; i++) {
		var listItem = document.createElement('div');
		listItem.innerHTML = itemsArray[i];
		listItem.id = i;
		listItem.style.width = '90%';
		listItem.style.backgroundColor = '#ccc';
		listItem.style.WebkitBorderRadius = listItem.style.MozBorderRadius = '5px';
		listItem.style.padding = '5px';
		listItem.style.margin = '2px auto';
		listItem.style.color = '#0F065F';
		listItem.style.fontWeight = 'bold';
		listItem.style.textAlign = 'left';
		listItem.style.cursor = 'pointer';
		a5.cl.ui.UIAlertOptionList._listItems.push(listItem);
		listItem.onclick = function(){
			var id = this.id;
			var html = this.innerHTML;
			instance.hide(this.id, true);
			if(onComplete) onComplete(id, html);
		}
		instance.contentArea().appendChild(listItem);
	}
}
	
a5.cl.ui.UIAlertOptionList._onhide = function(){
	var listItems = a5.cl.ui.UIAlertOptionList._listItems;
	for (var i = 0, l=listItems.length; i < l; i++) listItems[i].onclick = null;
}