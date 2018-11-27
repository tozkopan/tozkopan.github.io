sap.ui.define([
	"sap/m/Dialog",
	"sap/m/DialogRenderer"
], function(BaseControl, DialogRenderer) {
	"use strict";
	var Control = BaseControl.extend("mvideo.cafe.controls.Dialog", {
		// the control API:
		metadata: {
			properties: {},
			aggregations: {},
			associations: {},
			events: {}
		},
		renderer: {}
	});
	
	var oldBeforeRendering = Control.prototype.onAfterRendering;
	Control.prototype.onAfterRendering = function() {
		oldBeforeRendering.call(this);
		this.$().addClass("MVideo_cafe");
	};

	Control.prototype._processButton = function(oButton) {
		var that = this;
		if (!this._oButtonDelegate) {
			this._oButtonDelegate = {
				ontap: function() {
					that._oCloseTrigger = this;
				}
			};
		}
		if (oButton) {
			oButton.addDelegate(this._oButtonDelegate, true, oButton);
			//		if ( !(oButton.getType() === sap.m.ButtonType.Accept || oButton.getType() === sap.m.ButtonType.Reject)) {
			//			oButton.setType(sap.m.ButtonType.Transparent);
			//		}
		}
	};

	return Control;

}, true);