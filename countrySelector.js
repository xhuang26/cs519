(function() {

	var CountryInfo = function(name, iso, scale, rank) {
		this.name = name;
		this.iso = iso;
		this.rank = rank;
		this.color = d3.interpolateSpectral(scale(rank));
	}

	CountryInfo.prototype.getDiv = function() {
		var div = document.createElement('div');
		div.innerHTML = `<div country="${this.name}" class="item countrySelector-items"><svg width="20px" height="20px" class="countrySelector-circle"><circle cx="10" cy="15" r="5" fill="${this.color}" /></svg><span>${this.name}</span></div>`;
		return div;
	};

	var countryInfoMap = d3.map();
	var countrySelector = document.getElementById("countrySelector");
	var items;
	d3.tsv("hdi_table1.tsv", function(error, hdi) {
		var numCountries = hdi.length;
		scale = d3.scaleLinear().domain([1, numCountries]).range([0, 1]);
		hdi.forEach(function(country) {
			var countryInfo = new CountryInfo(country['Country'], country["ISO_A3"], scale, country["HDI rank"]);
			var div = countryInfo.getDiv();
			countrySelector.appendChild(div);
			countryInfoMap.set(country["ISO_A3"], countryInfo);
		});
		items = document.getElementsByClassName("countrySelector-items");
	});
	var input = document.getElementById("countrySelector-searchbar-input");
	
	input.oninput = function() {
		var value = document.getElementById("countrySelector-searchbar-input").value.toLowerCase();
		for(let i=0; i<items.length; i++) {
			var item = items[i];
			var name = item.getAttribute("country").substring(0, value.length).toLowerCase();
			if(name === value) {
				item.style.display = "block";
			} else {
				item.style.display = "none";
			}
		}
	}
})();