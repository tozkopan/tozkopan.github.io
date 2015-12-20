sap.ui.define([ "sap/ui/core/UIComponent" ], function(UIComponent) {
	"use strict";
	return UIComponent.extend("mvideo.cafe.Component", {
		metadata : {
		// rootView : "sap.ui.demo.wt.view.App"
		},
		createContent : function() {
			this.app = new sap.m.SplitApp({
				"mode" : sap.m.SplitAppMode.ShowHideMode
			});
			this.app.setBackgroundColor("white");
			jQuery.sap.includeStyleSheet( "./css/style.css" );

			this.app.handleDetail = function(context, view, edit) {
				var oView = this.getPage(view);
				oView.getModel("local").setProperty("/edit", edit);
				oView.getModel("local").setProperty("/edit_f", edit);
				if (context) {
					oView.setBindingContext(context);
					this.toDetail(view);
				}
			}.bind(this.app);

			return this.app;
		},
		init : function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			sap.ui.getCore().myApp = this.app;

			this.app.addPage(sap.ui.view({
				id : "Master",
				viewName : "mvideo.cafe.view.Master",
				type : "XML",
				viewData : {
					component : this
				}
			}), true);

			this.app.addPage(sap.ui.view({
				id : "Empty",
				viewName : "mvideo.cafe.view.Empty",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);

			this.app.addPage(sap.ui.view({
				id : "Create",
				viewName : "mvideo.cafe.view.Create",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);
			this.app.addPage(sap.ui.view({
				id : "Detail",
				viewName : "mvideo.cafe.view.Detail",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);

			this.app.addPage(sap.ui.view({
				id : "Wizard",
				viewName : "mvideo.cafe.view.Wizard",
				type : "XML",
				viewData : {
					component : this
				}
			}), false);

			this.app.setInitialDetail("Create");
			// this.app.setInitialDetail("Detail");

			// set data model
			var json = {};
			$.when(
				$.getJSON("model/user.json", 		function (data) { json.user = data; }),
				$.getJSON("model/status.json", 		function (data) { json.status = data; }),
				$.getJSON("model/main.json", 		function (data) { json.main = data; }),
				$.getJSON("model/groups.json", 		function (data) { json.groups = data; }),
				$.getJSON("model/benefits.json", 	function (data) { json.benefits = data; }),
				$.getJSON("model/limits.json", 		function (data) { json.limits = data; })
			).then(function(){
				sap.ui.getCore().myApp.myData = json;
				this.setModel(new sap.ui.model.json.JSONModel(json),"raw");
				var oModel = new sap.ui.model.json.JSONModel();
				this.setModel(oModel);
				
				//CURRENT DATA
				var userBenefits = {};
				json.status.forEach(function(item){
					userBenefits[item.id] = jQuery.extend(true, {}, item);
					userBenefits[item.id].content = [];
				});
				json.user.benefits.forEach(function(item){
					var oBenefit = $.grep(json.benefits, function(j){ return j.id == item.id; })[0];
					//var sStatus = json.status[item.status].name;
					userBenefits[item.status].content.push(oBenefit);					
				}.bind(this));
				//TILES				
				var tileGroups = [];
				json.benefits.forEach(function(item){
					if(item.group == "fix"){ //add fixed to user cart, don't add in create view
						if(item.active !== false){ //only active in current time							
							userBenefits["fix"].content.push(item); //"fix" in groups may != "fix" in statuses
						}
						return;
					};
					var index = tileGroups.indexOf( //find index of group or create new
						$.grep(tileGroups, function(j){ return j.group == item.group; })[0]
					);
					if(index < 0)
						index = - 1 + tileGroups.push({
							group: item.group,
							name: $.grep(json.groups, function(j){ return j.id == item.group; })[0].name,
							tiles: []
						});
					var tile = item;
					tileGroups[index].tiles.push(tile);
				}.bind(this));
				
				oModel.setProperty("/benefits",userBenefits);
				oModel.setProperty("/tileGroup",tileGroups);
				oModel.setProperty("/limit",json.user.limit);

				//HISTORY
				oModel.setProperty("/history", {});				
				json.user.history.forEach(function(year){
					var oYear = {
						benefits: {},
						limit: year.limit
					};
					json.status.forEach(function(item){
						oYear.benefits[item.id] = jQuery.extend(true, {}, item);;
						oYear.benefits[item.id].content = [];
					});
					
					year.benefits.forEach(function(item){
						var oBenefit = $.grep(json.benefits, function(j){ return j.id == item.id; })[0];
						//var sStatus = json.status[item.status].name;
						oYear.benefits[item.status].content.push(oBenefit);					
					}.bind(this));

					
					oModel.setProperty("/history/" + year.year, oYear);
				});
				
				//INSTRUCTIONS Create view (1-2-3)
				oModel.setProperty("/instruction", json.main.instruction);
				
				//LIMIT TYPES Master view top lines
				this.setModel( new sap.ui.model.json.JSONModel(json.limits),"limitTypes");
				
			}.bind(this));


			// set i18n model
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : "i18n/messageBundle.properties"
			});
			this.setModel(i18nModel, "i18n");

		}
	});
});