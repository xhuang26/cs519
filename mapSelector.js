(function(){
	var radios = document.getElementsByName("mapSelector");
	var values = [];
	var currentMap = radios[0].getAttribute("value");
	for(let i=0; i< radios.length; i++) {
		values.push(radios[i].getAttribute("value"));
		radios[i].onclick = function() {
			var container = document.getElementById(`${radios[i].getAttribute("value")}Container`);
			var controller = document.getElementById(`${radios[i].getAttribute("value")}Controller`);
			container.style.display = "block";
			controller.style.display = "block";
			radios[i].className += " mapSelector-item__checked";
			currentMap = radios[i].getAttribute("value");
			disableMap();
		}
	}
	disableMap();

	function disableMap() {
		for(let i=0; i< radios.length; i++) {
			if(values[i] !== currentMap) {
				var container = document.getElementById(`${radios[i].getAttribute("value")}Container`);
				var controller = document.getElementById(`${radios[i].getAttribute("value")}Controller`);
				radios[i].className = "item";
				container.style.display = "none";
				controller.style.display = "none";
			}
		}
	}
})();