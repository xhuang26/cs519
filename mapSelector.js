(function(){
	var radios = document.getElementsByName("mapSelector");
	var values = [];
	var currentMap = radios[0].getAttribute("value");
	for(let i=0; i< radios.length; i++) {
		values.push(radios[i].getAttribute("value"));
		radios[i].onclick = function() {
			console.log(`${radios[i].getAttribute("value")}Container`);
			var container = document.getElementById(`${radios[i].getAttribute("value")}Container`);
			container.style.display = "block";
			radios[i].className += " mapSelector-item__checked";
			currentMap = radios[i].getAttribute("value");
			disableMap();
		}
	}
	disableMap();

	function disableMap() {
		for(let i=0; i< radios.length; i++) {
			console.log(values[i], currentMap);
			if(values[i] !== currentMap) {
				var container = document.getElementById(`${radios[i].getAttribute("value")}Container`);
				radios[i].className = "mapSelector-item";
				container.style.display = "none";
			}
		}
	}
})();