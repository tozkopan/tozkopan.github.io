sap.ui.define([
	"./Base.controller"
], function(Controller) {
	"use strict";

	return Controller.extend("metinv.table.controller.First", {
		onInit: function(){
			console.log("onInit First");
			this.getRouter().getRoute("First").attachMatched(this.onMatched.bind(this));
			this.getView().setModel(new this.JM({
				smallSpacing: false,
				noPadCells: false
			}), "local");
			this.byId("mainTable").addEventDelegate({
				onAfterRendering: function(){
					this.colorCells();
				}.bind(this)
			});
		},
		onMatched: function(evt){
			console.log("matched First");
			var localModel = this.getModel("local");
			localModel.setProperty("/firstDay", new Date(2018, 1, 12));
			this.onFirstDayChange();
		},
		onFirstDayChange: function(evt){
			var mainModel = this.getModel(),
				localModel = this.getModel("local"),
				dFirstDay = new Date(localModel.getProperty("/firstDay").getTime()),
				iDelta = evt && +evt.getSource().data("delta") || 0;
			dFirstDay.setDate(dFirstDay.getDate() + iDelta);
			localModel.setProperty("/firstDay", dFirstDay);
			var aList = mainModel.getProperty("/list");
			aList.forEach(function(oRow){
				oRow.Week = {};
				if(!oRow.Table){ return; }
				for (var i = 0; i < 7; i++) {
					var sDate = this.DU.dateToAbap(this.DU.addDays(dFirstDay, i));
					oRow.Week[i] = oRow.Table.find(function(o){
						return o.Date === sDate;
					});
				}
			}.bind(this));
			mainModel.setProperty("/list", aList);
			this.byId("mainTable").rerender();
		},
		changeSpacing: function(evt){
			var localModel = this.getModel("local");
			localModel.setProperty("/smallSpacing", !localModel.getProperty("/smallSpacing"));
		},
		changeNoPadCells: function(evt){
			var localModel = this.getModel("local"),
				bNoPadCells = !localModel.getProperty("/noPadCells");
			this.byId("mainTable").$().parent()[bNoPadCells ? "addClass" : "removeClass"]("noPadCells");
			localModel.setProperty("/noPadCells", bNoPadCells);
		},
		dayFromFirst: function(dDate, delta){
			var dCurrent = this.DU.addDays(dDate, delta);
			return dCurrent && dCurrent.getDate();
		},
		dayCell: function(oDayTable, bSmall){
			if(!oDayTable){
				return "–";
			} else if(oDayTable.Type === "NN"){
				return "НН";
			} else if(!oDayTable.From){
				return "–";
			} else {
				var sTimes = [oDayTable.From, oDayTable.To].map(function(s){
					return s && this.DU.formatTime(s);
				}.bind(this));
				return sTimes[0] + (bSmall ? "–" : "\n–\n") + sTimes[1];
			}
		},
		formatWeekRange: function(dDate){
			return this.DU.formatDateRange(
				dDate,
				this.DU.addDays(dDate, 7)
			);
		},
		onCellPress: function(evt){
			var //mainModel = this.getModel(),
				localModel = this.getModel("local"),
				oRow = evt.getSource(),
				iIndex = evt.getParameter("cellIndex"),
				iDelta = iIndex - 2; //delta in days -1 preceeding column and -1 as shift is one lesser
			if(iDelta < 0){ return; }
			var oDayTable = oRow.getBindingContext().getProperty("Week/" + iDelta);
			localModel.setProperty("/selected", {
				row: oRow.getBindingContext().getProperty(),
				time: oDayTable,
				day: this.DU.addDays(localModel.getProperty("/firstDay"), iDelta)
			});
			console.log("onCellPress " + iDelta);
			this.colorCells();
		},
		colWidth: function(bSmall){
			return bSmall ? "72px" : "40px";
		},
		onToggleNN: function(evt){
			var mainModel = this.getModel(),
				localModel = this.getModel("local"),
				bPressed = evt.getSource().getPressed(),
				oSelected = localModel.getProperty("/selected"),
				sDateSelected = this.DU.dateToAbap(oSelected.day),
				aList = mainModel.getProperty("/list");
			aList.forEach(function(x){
				if(x.Pernr === oSelected.row.Pernr){
					x.Table.forEach(function(y){
						if(y.Date === sDateSelected){
							y.Type = bPressed ? "NN" : "";
						}
					});
				}
			});
			mainModel.setProperty("/list", aList);
			this.onFirstDayChange();
			// local>/selected/time/Type
		},
		onSearch: function(evt){
			var oTable = this.byId("mainTable"),
				sQuery = evt.getSource().getValue();
			oTable.getBinding("items").filter([new this.Filter({
				filters:[
					new this.Filter("Name",  "Contains", sQuery),
					new this.Filter("Plans", "Contains", sQuery),
					new this.Filter("Orgeh", "Contains", sQuery)
				],
				and: false
			})]);
		},
		colorCells: function(){
			var localModel = this.getModel("local"),
				oTable = this.byId("mainTable"),
				oSelected = localModel.getProperty("/selected");
				
			$("td", oTable.$()).removeClass("tdNN").removeClass("tdSelected");
			$("span[data-type=NN]").closest("td").addClass("tdNN");
			if(oSelected){
				$("span[data-date=" + this.DU.dateToAbap(oSelected.day)
					+ "][data-pernr=" + oSelected.row.Pernr + "]").closest("td").addClass("tdSelected");
			}
		},
		test: function(dDate){
			
		}
	});
});