sap.ui.define([
	"sap/m/ColumnListItem"
], function(BaseControl) {
	"use strict";

	var oControl = BaseControl.extend("metinv.table.ColumnListItem", {
		metadata: {
			events: {
				cellPress: {
					parameters: {
						cellIndex: {
							type: "int"
						}
					}
				}
			}
		},
		renderer: {}
	});

	oControl.prototype.ontap = function(oEvent) {
		var cell = $(oEvent.target).closest("td").get(0);
			// oTable = this.byId(cell.closest(".sapMList").id);
		BaseControl.prototype.ontap.apply(this, arguments);
		console.log("my ontap " + cell.cellIndex);
		this.fireCellPress({
			cellIndex: cell.cellIndex
		});
	};

	return oControl;

}, /* bExport= */ true);