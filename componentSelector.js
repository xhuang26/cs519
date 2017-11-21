(function() {
	var menu = document.getElementsByClassName("componentSelector-menu");
	var xAxis = menu[0].firstElementChild;
	var yAxis = menu[1].firstElementChild;
	for(let i=0; i<menu.length; i++) {
		menu[i].onclick = (function() {
			var index= i;
			var submenu = menu[i].nextElementSibling;
			var submenuItems = submenu.children;
			var text = menu[i].firstElementChild;
			for(let j=0; j<submenuItems.length; j++) {
				submenuItems[j].onclick = function() {
					console.log(submenuItems[j].innerText);
					menu[index].firstElementChild.innerText = submenuItems[j].innerText;
					disableSubmenuItems(submenuItems);
					submenuItems[j].className += " componentSelector-submenu-item-checked";
					onComponentChange();
				}
			}
			
			submenu.style.display = "none";
			return function () {
				if(submenu.style.display == "none") {
					submenu.style.display = "block";
				} else {
					submenu.style.display = "none";
				}
			}
			
		})();
	} 

	function disableSubmenuItems(submenuItems) {
		for(let j=0; j<submenuItems.length; j++) {
			submenuItems[j].className = "item";
		}
	}

	function onComponentChange() {
		xAxis = menu[0].firstElementChild;
		yAxis = menu[1].firstElementChild;
		eventDispatcher.call("componentChange", this, xAxis, yAxis);
	}
})();