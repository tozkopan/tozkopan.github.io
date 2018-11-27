jQuery.sap.require("mvideo.cafe.util.Formatter");
jQuery.sap.require("mvideo.cafe.util.Helper");
jQuery.sap.require("sap.m.NavContainer");

sap.ui.controller("mvideo.cafe.view.Create", {
	f: mvideo.cafe.util.Formatter,
	helper: mvideo.cafe.util.Helper,
	
	test: function(){
		console.log("SORTTTTTT");
	},
	
	onMobileBackToMaster: function(evt){
		this.app.backToTopDetail();
	},
	
	onInit: function() {
		this.app = this.getView().getViewData().component.app;
		// prevent default reaction when non-navigational item is taped
		var oldActivate = sap.m.SelectList.prototype._activateItem;
		sap.m.SelectList.prototype._activateItem = function() {
			if (!arguments[0].$().hasClass("mvFirstLevel")) {
				var result = oldActivate.apply(this, arguments);
				return result;
			}
		};
		var oldTouchStart = sap.m.SelectList.prototype.ontouchstart;
		sap.m.SelectList.prototype.ontouchstart = function() {
			if (!arguments[0].srcControl.$().hasClass("mvFirstLevel")) {
				var result = oldTouchStart.apply(this, arguments);
				return result;
			}
		};
		var oldTouchEnd = sap.m.SelectList.prototype.ontouchend;
		sap.m.SelectList.prototype.ontouchend = function() {
			if (!arguments[0].srcControl.$().hasClass("mvFirstLevel")) {
				var result = oldTouchEnd.apply(this, arguments);
				return result;
			}
		};
		var oldTouchCancel = sap.m.SelectList.prototype.ontouchcancel;
		sap.m.SelectList.prototype.ontouchcancel = function() {
			if (!arguments[0].srcControl.$().hasClass("mvFirstLevel")) {
				var result = oldTouchCancel.apply(this, arguments);
				return result;
			}
		};
		var oldTap = sap.m.SelectList.prototype.ontap;
		sap.m.SelectList.prototype.ontap = function() {
			if (!arguments[0].srcControl.$().hasClass("mvFirstLevel")) {
				var result = oldTap.apply(this, arguments);
				return result;
			} /*else {
				arguments[0].srcControl.$().click();
			}*/
		};
		var oldMouseDown = sap.ui.core.delegate.ItemNavigation.prototype.onmousedown;
		sap.ui.core.delegate.ItemNavigation.prototype.onmousedown = function() {
			if (!arguments[0].srcControl.$().hasClass("mvFirstLevel")) {
				var result = oldMouseDown.apply(this, arguments);
				return result;
			}
		};
	},	
	onBack : function() {
		this.app.backDetail();
	},
	
	shake: function(){
		this.getView().byId("bell").shake();
	},
	
	onTilePress: function(evt) {
		var viewWiz = this.app.getDetailPage("Wizard");
		var oCtx = evt.getSource().getBindingContext();
		var oData = oCtx.getProperty( oCtx.getPath() );
		var oLocal = {
			step2enabled: 	oData.Step2 === "true" || oData.Step2 === true,
			step3enabled: 	oData.Step3 === "true" || oData.Step3 === true,
			step2: {
				calc: 	  	oData.DynFlag === "true" || oData.DynFlag === true
			},
			step3: {
			},
			step4: {
			},
			currentStep: 	1
		};
		viewWiz.setModel(new sap.ui.model.json.JSONModel(oLocal), "local");
		this.app.handleDetail(oCtx, "Wizard", true);
		viewWiz.getController().handleStep();
	},
	
	onTileSearch: function(evt){
		var value = evt.getParameter("newValue").toLowerCase();
		var oModel = this.getView().getModel();
		var aOrig = jQuery.extend(true, [], oModel.getProperty("/tileGroupOrig") );
		if(!value){ //simple case
			oModel.setProperty("/tileGroup", aOrig);
			return;
		}
		
		var i1 = aOrig.length;
		while (i1--) { //reverse order
			var supergroup = aOrig[i1];
			var i2 = supergroup.tiles.length;
			var srgname = supergroup.name.toLowerCase() + " " + supergroup.name2.toLowerCase();
			while (i2--) { //reverse order
				var group = supergroup.tiles[i2];
				var i3 = group.tiles.length;
				var gname = group.name.toLowerCase() + " " + group.name2.toLowerCase();
				while (i3--) { //reverse order
					var tile = group.tiles[i3];
					if( !~srgname.indexOf(value)
					&&  !~gname.indexOf(value)
					&&  !~tile.Benefit2.toLowerCase().indexOf(value)){
						group.tiles.splice(i3, 1); //delete if no match
					}
				}
				if(!group.tiles.length){
					supergroup.tiles.splice(i2, 1); //delete empty group
				}
			}
			if(!supergroup.tiles.length){
				aOrig.splice(i1, 1); //delete empty supergroup
			}
		}
		oModel.setProperty("/tileGroup", aOrig);
	},
	
	onMainHelp: function(){
		this.getView().getViewData().component.showMainHelp();
	},
	
	onNotifications: function(){
		this.helper.onNotifications.apply(this, arguments);
	}
	
});