var eventDispatcher = d3.dispatch("sliderMove", "componentChange", "countrySelect");

function findRange(range, newVal) {
		range[0] = Math.min(range[0], newVal);
		range[1] = Math.max(range[1], newVal);
		return range;
	}