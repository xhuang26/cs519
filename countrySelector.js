(function() {

	var selectedCountry = null;
	var CountryInfo = function(name, iso, scale, rank) {
		this.name = name;
		this.iso = iso;
		this.rank = rank;
		this.color = d3.interpolateSpectral(scale(rank));
	}

	CountryInfo.prototype.getDiv = function() {
		var div = document.createElement('div');
		div.innerHTML = `<div country="${this.name}" iso="${this.iso}" class="item countrySelector-items"><svg width="20px" height="20px" class="countrySelector-circle"><circle cx="10" cy="15" r="5" fill="${this.color}" /></svg><span>${this.name}</span></div>`;
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
		for(let i=0; i<items.length; i++) {
			items[i].onclick = (function() {
				var item = items[i];
				return function() {

					if(selectedCountry != null) {
						selectedCountry.className = "item countrySelector-items";
						eventDispatcher.call('countrySelect', this, [item.getAttribute("iso")]);
					//	eventDispatcher.call('updatingCountryLine', this, item.getAttribute("iso"));
					} else {
						eventDispatcher.call('countrySelect', this, [item.getAttribute("iso")]);
					//	eventDispatcher.call('updatingCountryLine', this, item.getAttribute("iso"));
					}
					selectedCountry = item;
					selectedCountry.className +=  " countrySelector-items__selected";
				}


			})();
			items[i].onmouseover = (function() {
				var item = items[i];
				return function() {
					eventDispatcher.call('mouseOverCountryLine', this, item.getAttribute("iso"));
				}
			})();
			items[i].onmouseout = (function() {
				var item = items[i];
				return function() {
					eventDispatcher.call('mouseOutCountryLine', this, item.getAttribute("iso"));
				}
			})();
		}
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
//countryInfoMap.get(item.getAttribute("iso"))
