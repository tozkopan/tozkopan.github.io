/*jQuery.sap.require("mvideo.cafe.controls.HierarchicalSelect");
jQuery.sap.require("sap.uxap.AnchorBar");
 
sap.uxap.AnchorBar.extend("mvideo.cafe.controls.AnchorBar", {*/

sap.ui.define([
	"sap/uxap/AnchorBar",
	"mvideo/cafe/controls/HierarchicalSelect"
], function(BaseControl, HierarchicalSelect) {
	"use strict";

	var Control = BaseControl.extend("mvideo.cafe.controls.AnchorBar", {
		metadata: {
			aggregations: {
				_select: {type: "mvideo.cafe.controls.HierarchicalSelect", multiple: false, visibility: "hidden"},
				_popovers: {type: "sap.m.Popover", multiple: true, visibility: "hidden"},
				_scrollArrowLeft: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},
				_scrollArrowRight: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			}},
		renderer: { }
	});
	
	Control.prototype._getHierarchicalSelect = function() {
		if (!this.getAggregation('_select')) {

			this.setAggregation('_select', new HierarchicalSelect({
				width: "100%",
				icon: "sap-icon://overflow",
				change: jQuery.proxy(this._onSelectChange, this)
			}));
		}

		return this.getAggregation('_select');
	};
		
	return Control;

}, true);