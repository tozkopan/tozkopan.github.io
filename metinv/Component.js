sap.ui.define([
	"sap/ui/core/UIComponent",
	"./util/polyfill"
], function(UIComponent, polyfill) {
	"use strict";

	return UIComponent.extend("metinv.table.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();
		}
	});
});