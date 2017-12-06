(function() {
	var controllers = document.getElementById("topPanelControllers");
	controllers.style.display = "none";
	document.getElementById("topPanelButton").onclick = function() {
		console.log(controllers.style.display);
		controllers.style.display = controllers.style.display == "block" ? "none" : "block";
	}

	document.getElementById("parallelContainer").onclick = function() {
		this.className = this.className === "parallelContainer__hide" ? "" : "parallelContainer__hide";
		var arrow = document.getElementsByClassName("arrow")[0];

		arrow.id = arrow.id === "bottom" ? "top" : "bottom";
	}

})();