var eventDispatcher = d3.dispatch("sliderMove", "componentChange", "countrySelectorCountrySelect", "mapCountrySelect", "multivariateCountrySelect", "graphCountrySelect", "mapFilterCountries", "countrySelectorFilterCountries", "multivariateFilterCountries");

var gray = d3.color('rgba(0,0,0,1)');
var strokeColor = "#191A1A";

function findRange(range, newVal) {
	range[0] = Math.min(range[0], newVal);
	range[1] = Math.max(range[1], newVal);
	return range;
}

function dispatchCountrySelect(iso) {
	eventDispatcher.call('mapCountrySelect', this, iso);
    eventDispatcher.call('countrySelectorCountrySelect', this, iso);
    eventDispatcher.call('graphCountrySelect', this, iso);
    eventDispatcher.call('multivariateCountrySelect', this, iso);
}