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
		div.innerHTML = `<div country="${this.name}" iso="${this.iso}" class="item countrySelector-items"><svg width="20px" height="20px" class="countrySelector-circle"><circle id="circle-${this.iso}" cx="10" cy="15" r="5" fill="${this.color}" /></svg><span>${this.name}</span></div>`;
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
					dispatchCountrySelect(item.getAttribute("iso"));
				}
			})();
			// items[i].onmouseover = (function() {
			// 	var item = items[i];
			// 	return function() {
			// 		eventDispatcher.call('mouseOverCountryLine', this, item.getAttribute("iso"));
			// 	}
			// })();
			// items[i].onmouseout = (function() {
			// 	var item = items[i];
			// 	return function() {
			// 		eventDispatcher.call('mouseOutCountryLine', this, item.getAttribute("iso"));
			// 	}
			// })();

		}

		eventDispatcher.on("countrySelectorCountrySelect", function(countryISO) {
			for(let i=0; i<items.length; i++) {
				var iso = items[i].getAttribute("iso");
				if(iso === countryISO) {
					items[i].className += " countrySelector-items__selected";
				} else {
					items[i].className = "item countrySelector-items";
				}
			}
		});

		eventDispatcher.on("countrySelectorFilterCountries", function(countryISOArray) {
			document.getElementById("countryDetailInfo").style.visibility = "hidden";
			var newItemsPrior = [];
			var newItemsRest = [];
			for(let i=0; i<items.length; i++) {
				var iso = items[i].getAttribute("iso");
				if(countryISOArray.includes(iso)) {
					items[i].className = "item countrySelector-items";
					d3.select(`#circle-${iso}`).style('fill', countryInfoMap.get(iso).color);
					newItemsPrior.push(items[i]);
					items[i].onclick = (function() {
						var item = items[i];
						return function() {
							dispatchCountrySelect(item.getAttribute("iso"));
						}
					})();
				} else {
					
					items[i].className = "countrySelector-items countrySelector-items__disabled";
					d3.select(`#circle-${iso}`).style('fill', "rgba(220,220,220, 0.3)");
					newItemsRest.push(items[i]);
					items[i].onclick = function() {
						return;
					};
				}
			}
			countrySelector.innerHTML = "";
			
			newItems = newItemsPrior.concat(newItemsRest);
			for(let i=0; i<newItems.length; i++) {
				countrySelector.appendChild(newItems[i]);
			}
			
		});
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
