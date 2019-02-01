sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	var Component = UIComponent.extend("sap.f.sample.FlexibleColumnLayoutSimple.Component", {
		metadata: {
		    manifest: "json"
		}
	});
	return Component;
}, true);
