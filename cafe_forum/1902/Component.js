//jQuery.sap.registerModulePath("mvideo.cafe", "/sap/bc/ui5_ui5/sap/zmv_benefit/");
//jQuery.sap.registerModulePath("mvideo.cafe.controls","/sap/bc/ui5_ui5/sap/zmv_benefit/controls");
jQuery.sap.declare("mvideo.cafe.Component");
// jQuery.sap.require("mvideo.cafe.util.Helper");
// jQuery.sap.require("mvideo.cafe.util.Helper");
// jQuery.sap.require("mvideo.cafe.controls.Dialog");
// jQuery.sap.require("mvideo.cafe.controls.Device");
sap.ui.define([
    "sap/ui/core/UIComponent",
    "mvideo/cafe/mockserver/Main"
 //   "mvideo/cafe/util/Helper",
 //   "mvideo/cafe/util/Helper",
 //   "mvideo/cafe/controls/Dialog",
  //  "mvideo/cafe/controls/Device"
], function(UIComponent, mockserver) {
//sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";
	return UIComponent.extend("mvideo.cafe.Component", {
		metadata: {
			includes: ["css_pc/main.css", "css_pc/helpFragment.css", "css_pc/misc.css",
				"css_pc/viewComplete.css", "css_pc/viewCreate.css", "css_pc/viewDetail.css",
				"css_pc/viewMaster.css", "css_pc/viewSteps.css", "css_pc/viewWizard.css"
			],
			config: {
				UrlMain: "/sap/opu/odata/sap/ZMV_BEN_MAIN_SRV/",
				UrlMime: "/sap/opu/odata/sap/ZMV_BEN_CACHED_SRV/"
			}
		},
		
		/* Create and set main parameters for the whole app*/
		createContent: function() {
			this.app = new sap.m.SplitApp({});
			this.app.addStyleClass("MVideo_cafe");
			this.app.setBackgroundColor("white");
			this.app.handleDetail = function(context, view, edit) {
				var oView = this.getPage(view);
				oView.getModel("local").setProperty("/edit", edit);
				oView.getModel("local").setProperty("/edit_f", edit);
				oView.getModel("local").setProperty("/nedit", !edit);
				oView.getModel("local").setProperty("/nedit_f", !edit);
				if (context) {
					oView.setBindingContext(context);
					this.toDetail(view);
				}
			}.bind(this.app);
			return this.app;
		},

		//used for local testing, via ./WEB-INF/web.xml servlet
		addProxy: function(url) {
			// if (window.location.hostname === "localhost")
			// 	// return "http://sap-gwd.corp.mvideo.ru:8060" + url;
			// 	return "/MVideo_2/proxy" + url;
			// else
			return url;
		},

		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			jQuery.sap.require("mvideo.cafe.controls.Dialog");
			jQuery.sap.require("mvideo.cafe.util.Helper");
			jQuery.sap.require("mvideo.cafe.util.Helper");
			jQuery.sap.require("mvideo.cafe.controls.Device");
			var sRootPath = jQuery.sap.getModulePath("mvideo.cafe");
			this.app._sRootPath = sRootPath;
			sap.ui.getCore().myApp = this.app;
			//	sap.ui.Device.isLandscape();
			var comp_that = this;
			var oCfg = this.getMetadata().getConfig();
			// set i18n model
			if (sap.ushell) {
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: sRootPath + "/i18n/messageBundle.properties" //TMP
				});
			} else {
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/messageBundle.properties" 
				});
			}
			this.setModel(i18nModel, "i18n");
			var oBundle = i18nModel.getResourceBundle();

			//register custom font
			sap.ui.core.IconPool.addIcon('bullhorn', 'mvideo', 'icomoon', 'e900');
			sap.ui.core.IconPool.addIcon('bell', 'mvideo', 'icomoon', 'e901');
			sap.ui.core.IconPool.addIcon('bubbles', 'mvideo', 'icomoon', 'e902');
			sap.ui.core.IconPool.addIcon('bubbles2', 'mvideo', 'icomoon', 'e903');
			sap.ui.core.IconPool.addIcon('bubbles4', 'mvideo', 'icomoon', 'e904');
			sap.ui.core.IconPool.addIcon('mail', 'mvideo', 'icomoon', 'e905');
			sap.ui.core.IconPool.addIcon('mail4', 'mvideo', 'icomoon', 'e906');

			// set the device model
			var oDeviceModel = new sap.ui.model.json.JSONModel(sap.ui.Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			if (oDeviceModel.getProperty("/system/phone")) {
				var elements = document.querySelectorAll('link[rel=stylesheet]');
				for (var i = 0; i < elements.length; i++) {
					elements[i].href = elements[i].href.replace("css_pc", "css_mobile");
				}
			}
			oDeviceModel.setProperty("/mv_desktop", oDeviceModel.getProperty("/system/desktop") || oDeviceModel.getProperty("/system/tablet"));
			oDeviceModel.setProperty("/mv_mobile", oDeviceModel.getProperty("/system/phone"));
			oDeviceModel.setProperty("/mv_tablet", oDeviceModel.getProperty("/system/tablet"));
			oDeviceModel.setProperty("/mv_ios", oDeviceModel.getProperty("/os/OS/name") === "iOS" || oDeviceModel.getProperty("/os/OS/name") ===
				"ios");
				
			if (sap.ushell) {
				document.body.className = document.body.className.replace("sapUiSizeCompact", "");
			}
			// toggle portrait mode	
			var fnIsWideScreen = function() {
				var bWide = oDeviceModel.getProperty("/system/tablet") || oDeviceModel.getProperty("/system/desktop") || oDeviceModel.getProperty(
					"/orientation/landscape");
				oDeviceModel.setProperty("/mv_wide", bWide);
				if (bWide) {
					this.app.removeStyleClass("MVideo_cafe_portrait");
				} else {
					this.app.addStyleClass("MVideo_cafe_portrait");
				}
			}.bind(this);
			fnIsWideScreen();
			sap.ui.Device.orientation.attachHandler(function(evt) {
				oDeviceModel.setProperty("/orientation", sap.ui.Device.orientation);
				fnIsWideScreen();
			});
			this.setModel(oDeviceModel, "device");
			if (oDeviceModel.getProperty("/mv_desktop") || oDeviceModel.getProperty("/mv_tablet")) {
				this.app.addStyleClass("MVideo_cafe_desktop");
				this.app.setMode(sap.m.SplitAppMode.ShowHideMode);
			} else {
				this.app.addStyleClass("MVideo_cafe_mobile");
				this.app.setMode(sap.m.SplitAppMode.HideMode);
			}

			//settings model
			if (sap.ushell) {
				var oSettingsModel = new sap.ui.model.json.JSONModel(sRootPath + "/model/settings.json"); //TMP
			} else {
				var oSettingsModel = new sap.ui.model.json.JSONModel("model/settings.json");
			} 
			this.setModel(oSettingsModel, "settings");
			oSettingsModel.attachRequestCompleted(function(evt) {
				console.log("tozlog: settings model loaded");
				var model = evt.getSource();
				model.getProperty("/create_description").forEach(function(item, i, array) {
					array[i].text = oBundle.getText(item.text);
					array[i].add = oBundle.getText(item.add);
				});
				model.getProperty("/limits").forEach(function(item, i, array) {
					array[i].name = oBundle.getText(item.name);
					array[i].info = oBundle.getText(item.info);
				});
				model.getProperty("/statuses").forEach(function(item, i, array) {
					array[i].name = oBundle.getText(item.name);
				});
				model.setProperty("/localhost", window.location.hostname === "localhost");
				model.refresh();
			});

			/* Load main help on start */
			// set data model
			var oModel = new sap.ui.model.json.JSONModel();
			if (sap.ushell) {
				oModel.setProperty("/sRootPath", sRootPath + "/");
			} else {
				oModel.setProperty("/sRootPath", "");
			}
			this.setModel(oModel);
			
			// var sODataURL = oCfg.UrlMain;
			// sODataURL = this.addProxy(sODataURL);
			// var oMainModel = new sap.ui.model.odata.ODataModel(sODataURL);
			
			var oMainModel = new mockserver();
			
			this.setModel(oMainModel, "odata");
			oMainModel.attachMetadataLoaded(function() {
				var that = this;
				this.oTileDeferred = jQuery.Deferred();
				this.oTileGroupDeferred = jQuery.Deferred();

				comp_that.readNotifications();

				oModel.setProperty("/PersInfo", {});
				oMainModel.callFunction("GetPersInfo", {
					urlParameters: {
						Key: "NAME,MAX_DMS_REL"
					},
					method: 'GET',
					async: true,
					success: function(data, response) {
						console.log("PersInfo OK");
						var aName = data.Name.split('#');
						oModel.setProperty("/PersInfo/SecondName", aName[0]);
						oModel.setProperty("/PersInfo/FirstName", aName[1]);
						oModel.setProperty("/PersInfo/MaxDmsRel", data.MaxDmsRel);
						oModel.setProperty("/PersInfo/Persk", data.Persk);
						oModel.setProperty("/PersInfo/Retail", data.Retail === "X");
						oModel.setProperty("/PersInfo/AdminEnameCase", data.AdminEnameCase);
					},
					error: function(error) {
						console.log("PersInfo FAIL");
					}
				});

				oMainModel.read("/TileSet", {
					async: true,
					success: function(data, response) {
						console.log("TileSet OK");
						oModel.setProperty("/Tile", data.results);
						that.oTileDeferred.resolve();
					},
					error: function(error) {
						console.log("TileSet FAIL");
					}
				});

				oMainModel.read("/TileGroupSet", {
					async: true,
					success: function(data, response) {
						console.log("TileGroupSet OK");
						oModel.setProperty("/TileGroup", data.results);
						var aSGroups = [],
							aGroups = [];
						for (var i = 0; i < data.results.length; i++) {
							var iId = " ";
							aSGroups.forEach(function(item, id) {
								if (item.id === data.results[i].Tilesupergroup) {
									iId = id;
								}
							});
							if (iId === " ") {
								var oSGroup = {
									id: data.results[i].Tilesupergroup,
									name: data.results[i].Text1sgr,
									groupDisable: data.results[i].GroupDisable === "true" || data.results[i].GroupDisable === true,
									groups: []
								};
								if (data.results[i].Text2sgr) {
									oSGroup.name += ' ' + data.results[i].Text2sgr;
								}
								aSGroups.push(oSGroup);
								iId = aSGroups.length - 1;
							}
							var oGroup = {
								id: data.results[i].Tilegroup,
								name: data.results[i].Text1,
								groupDisable: data.results[i].GroupDisable === "true" || data.results[i].GroupDisable === true
							};
							if (data.results[i].Text2) {
								oGroup.name += ' ' + data.results[i].Text2;
							}
							aSGroups[iId].groups.push(oGroup);
						}
						oModel.setProperty("/groups", aSGroups);
						that.oTileGroupDeferred.resolve();
					},
					error: function(error) {
						console.log("TileGroupSet FAIL");
					}
				});
				// sort tiles into groups & supergroups
				jQuery.when(
					this.oTileDeferred,
					this.oTileGroupDeferred
				).done(function() {
					console.log("Both OK");
					var data = oModel.getData();
					var oTileGroup = {};
					data.Tile.forEach(function(item) {
						if (!oTileGroup[item.Tilegroup]) {
							oTileGroup[item.Tilegroup] = [];
						}
						oTileGroup[item.Tilegroup].push(item);
					});
					var aSGroups = [];
					data.TileGroup.forEach(function(item) {
						if (!oTileGroup[item.Tilegroup]) {
							return;
						}
						var iId = " ";
						aSGroups.forEach(function(group, id) {
							if (group.id === item.Tilesupergroup) {
								iId = id;
							}
						});
						if (iId === " ") {
							var oSGroup = {
								name: item.Text1sgr,
								name2: item.Text2sgr,
								id: item.Tilesupergroup,
								groupDisable: item.GroupDisable === "true" || item.GroupDisable === true,
								tiles: []
							};
							aSGroups.push(oSGroup);
							iId = aSGroups.length - 1;
						}
						var oGroup = {
							name: item.Text1,
							name2: item.Text2,
							id: item.Tilegroup,
							groupDisable: item.GroupDisable === "true" || item.GroupDisable === true,
							tiles: oTileGroup[item.Tilegroup]
						};
						aSGroups[iId].tiles.push(oGroup);
					});
					oModel.setProperty("/tileGroup", aSGroups);
					oModel.setProperty("/tileGroupOrig", aSGroups);
					fnGetIcons.apply(comp_that, [data.Tile, oCfg]);
				});

				oMainModel.read("/YearsSet", {
					async: true,
					success: function(data, response) {
						console.log("YearsSet OK");
						var aYears = data.results;

						aYears.sort(function(a, b) {
							return b.Year - a.Year;
						}); //desc
						aYears = aYears.map(function(oYear) {
							oYear.Open = oYear.Open === true || oYear.Open === "true";
							oYear.OnAdmin = oYear.OnAdmin === true || oYear.OnAdmin === "true";
							return oYear;
						});
						aYears.forEach(function(item) {
							item.uri = mvideo.cafe.util.Helper.getODataRelativeURI(
								item.__metadata.uri, oMainModel
							);
							if (item.Open) {
								item.Text = oBundle.getText("MASTER_YEAR_CURRENT");
							} else {
								item.Text = item.Year + oBundle.getText("MASTER_YEAR_SUFFIX");
							}
						});
						if (aYears && aYears.length) {
							oModel.setProperty("/selectedYear", aYears[0].Year);
							var curUri = aYears[0].uri;
							oModel.setProperty("/years", aYears);
							comp_that.readYear(curUri);
						}
					},
					error: function(error) {
						console.log("YearsSet FAIL");
					}
				});
			});
			// get tile icons
			var fnGetIcons = function(aTile, oCfg) {
				var helper = mvideo.cafe.util.Helper;
				var that = this;
				var aURL = [];
				aTile.forEach(function(item) {
					if (item.Urlicon) {
						aURL.push(item.Urlicon);
					}
				});
				
				var aTileSuperGroup = oModel.getProperty("/tileGroup");
				aTileSuperGroup.forEach(function(tileSuperGroup) {
					tileSuperGroup.tiles.forEach(function(tileGroup) {
						tileGroup.tiles.forEach(function(tile) {
							tile.FullUrlicon = "mockserver/" + tile.Urlicon;
						});
					});
				});
				oModel.refresh(true); //IE icon bug
				
				// aURL = helper.deleteDublicates(aURL);
				// var sODataURL = oCfg.UrlMime;
				// sODataURL = this.addProxy(sODataURL);
				// var oModelMime = new sap.ui.model.odata.ODataModel(sODataURL);
				// this.setModel(oModelMime, "odataMime");
				// oModelMime.attachMetadataLoaded(function() {
				// 	oModelMime.callFunction("GetMime", {
				// 		method: "GET",
				// 		urlParameters: {
				// 			url: aURL.join("//")
				// 		},
				// 		success: function(data, response) {
				// 			console.log("GetMime ok");
				// 			var aIcons = data.results;
				// 			var oModel = that.getModel();
				// 			var aTileSuperGroup = oModel.getProperty("/tileGroup");
				// 			aTileSuperGroup.forEach(function(tileSuperGroup) {
				// 				tileSuperGroup.tiles.forEach(function(tileGroup) {
				// 					tileGroup.tiles.forEach(function(tile) {
				// 						var oIcon = $.grep(aIcons, function(e) {
				// 							return e.Short == tile.Urlicon;
				// 						});
				// 						if (oIcon && oIcon[0]) {
				// 							tile.FullUrlicon = oIcon[0].Full;
				// 						}
				// 						tile.FullUrlicon = that.addProxy(tile.FullUrlicon);
				// 					});
				// 				});
				// 			});
				// 			oModel.refresh(true); //IE icon bug
				// 		},
				// 		error: function(error) {
				// 			console.log("testFunc err");
				// 		},
				// 		async: true
				// 	});
				// });
			};
			var fnAddPage = function(sName, bMaster) {
				this.app.addPage(sap.ui.view({
					id: sName,
					viewName: "mvideo.cafe.view." + sName,
					type: "XML",
					viewData: {
						component: this
					}
				}), bMaster);
			}.bind(this);
			fnAddPage("Master", true);
			fnAddPage("Blank", false);
			fnAddPage("Empty", false);
			fnAddPage("Create", false);
			fnAddPage("Detail", false);
			fnAddPage("Wizard", false);
			fnAddPage("Complete", false);
			this.app.setInitialDetail("Empty");

			oMainModel.callFunction("GetParam", {
				urlParameters: {
					Param: "STARTUP_HELP"
				},
				method: 'GET',
				async: true,
				success: function(data, response) {
					console.log("GetParam STARTUP_HELP OK");
					if (data.Value !== "X") {
						comp_that.showMainHelp(true);
					}	
				},
				error: function(error) {
					console.log("GetParam STARTUP_HELP FAIL");
					comp_that.showMainHelp(true);
				}
			});
			                   
		},

		/* Read single year */
		readYear: function(uri) {
			var that = this;
			var odataModel = this.getModel("odata");
			var oModel = this.getModel();
			var oSettingsModel = this.getModel("settings");
			var oRB = this.getModel("i18n").getResourceBundle();
			var MB = sap.m.MessageBox;
			var viewMaster = this.app.getMasterPage("Master");
			var oYear = $.grep(
				oModel.getProperty("/years"),
				function(i) {
					return i.uri === uri;
				}
			)[0];
			uri = uri.split("mockserver/").pop();
			odataModel.bCache = false;
			oYear.OnAdmin = oYear.OnAdmin === true || oYear.OnAdmin === "true";
			oYear.Open = oYear.Open === true || oYear.Open === "true";
			viewMaster.byId('yearSelect')._myLastSelected = oYear.Year;
			this.getModel("settings").setProperty("/currentYear", oYear);
			var sTopDetail = (oYear.Open) ? "Create" : "Empty";
			if (this.app.hasStyleClass("MVideo_cafe_desktop")) {
				this.app.toDetail(sTopDetail);
			}
			this.app.setInitialDetail(sTopDetail);

			this.app.toMaster("Master");
			this.app.setInitialMaster("Master");

			var oLimitList = viewMaster.byId("limitList");
			var oMainList = viewMaster.byId("mainList");
			var oYearSelect = viewMaster.byId("yearSelect");
			[oLimitList, oMainList, oYearSelect].forEach(function(i) {
				i.setBusyIndicatorDelay(0);
				i.setBusy(true);
			});
			oLimitList._myDef = jQuery.Deferred();
			oMainList._myDef = jQuery.Deferred();
			jQuery.when(
				oLimitList._myDef,
				oMainList._myDef
			).done(function() {
				oYearSelect.setBusy(false);
			});

			//read Obtained benefits
			var sObtainedURI = uri + "/Obtained";
			odataModel.read(sObtainedURI, {
				async: true,
				success: function(data, response) {
					console.log(sObtainedURI + " OK");
					var aBenefits = [];
					var oBenefits = {};
					data.results.forEach(function(item) {
						if (!oBenefits[item.StatusId]) {
							oBenefits[item.StatusId] = [];
						}
						oBenefits[item.StatusId].push(item);
					});
					for (var item in oBenefits) {
						var sText = "???";
						var aText = $.grep(
							oSettingsModel.getProperty("/statuses"),
							function(e) {
								return e.id == item;
							}
						);
						if (aText && aText[0]) {
							sText = aText[0].name;
						}
						var oBen = {
							text: sText,
							status: item,
							expanded: !(item === "FX"), //fixed bens not expanded
							content: oBenefits[item]
						};
						aBenefits.push(oBen);
					}
					oModel.setProperty("/benifits_g", aBenefits);
					oModel.setProperty("/current_year", uri);
					//oModel.refresh(true);
					oMainList.setBusy(false);
					oMainList._myDef.resolve();
				},
				error: function(error) {
					console.log(sObtainedURI + " FAIL");
					oMainList.setBusy(false);
					oMainList._myDef.resolve();
				}
			});

			//clear limits
			var aLimits = oSettingsModel.getProperty("/limits");
			aLimits.forEach(function(item) {
				item.price = 0;
			});
			oModel.setProperty("/limits", aLimits);
			var iLimits = 0;
			//read limits
		//	var sLimitURI = uri + "/Limit";
			var sLimitURI = "/LimitSet('" + oModel.getProperty("/selectedYear") + "')";
			var fnReadLimits = function() {
				odataModel.read(sLimitURI, {
					async: true,
					success: function(data, response) {
						iLimits = 2;
						console.log(sLimitURI + " OK");
						var fDeducSum = 0;
						var fSum = oModel.getProperty("/benifits_g").reduce(function(sum1, oBenGr){
							if(oBenGr.status !== "FX"){
								sum1 += oBenGr.content.reduce(function(sum2, oBen){
									if(+oBen.BenefitId === 10){ //DMS
										fDeducSum += +oBen.Betrg;
									}
									return sum2 + +oBen.Betrg;
								},0);
							}
							return sum1;
						},0);
						data.Available = data.Total - fSum;
						data.OverdraftLimit = fDeducSum;
						if(data.Available < 0){
							data.Overdraft = -data.Available;
							data.Available = 0;
						}
						aLimits.forEach(function(item) {
							item.price = parseFloat(data[item.id]);
						});
						oModel.setProperty("/limits", aLimits);
						oLimitList.setBusy(false);
						oLimitList._myDef.resolve();
						if (oYear.Open !== "true" && oYear.Open !== true) {
							var oEmptyController = that.app.getPage("Empty").getController();
							oEmptyController.readDeduction(aLimits);
						}
					},
					error: function(error) {
						console.log(sLimitURI + " FAIL");
						oLimitList.setBusy(false);
						iLimits++;
						if (iLimits < 2) {
							fnReadLimits();
						} else {
							MB.error(oRB.getText("HCODE_REFRESH_PAGE_MSG"), {
								onClose: function() {
									oLimitList._myDef.resolve();
								}
							});
						}
					}
				});
			};
			fnReadLimits();
		},

		/* Show popup with help */
		showMainHelp: function(onStartup) {
			var that = this;
			var oRB = this.getModel("i18n").getResourceBundle();
			var odata = this.getModel("odata");
			var oHelpDialog = new mvideo.cafe.controls.Dialog({
				//var oHelpDialog = new sap.m.Dialog({
				title: oRB.getText('MAIN_HELP_TITLE'),
				content: [
					sap.ui.xmlfragment("mvideo.cafe.view.main_help", this),
					sap.ui.xmlfragment("mvideo.cafe.view.main_help_2", this)
				],
				stretch: true,
				showHeader: false,
				afterClose: function() {
					oHelpDialog.destroy();
				},
				beforeClose: function() {
					var oNoMoreDOM = $(".mhNoMore", oHelpDialog.$())[0];
					if (oNoMoreDOM) {
						var oNoMore = sap.ui.getCore().byId(oNoMoreDOM.id);
						if (oNoMore && oNoMore.getSelected()) {
							odata.callFunction("SetParam", {
								urlParameters: {
									Param: "STARTUP_HELP",
									Value: "X"
								},
								method: 'GET',
								async: true,
								success: function(data, response) {
									console.log("SetParam STARTUP_HELP OK");
								},
								error: function(error) {
									console.log("SetParam STARTUP_HELP FAIL");
								}
							});

						}
					}
				}
			});
			oHelpDialog.setModel(new sap.ui.model.json.JSONModel({
		//		step: 1
				step: 2
			}), "local");
			oHelpDialog.setModel(this.getModel("device"), "device");
			oHelpDialog.setModel(this.getModel());
			oHelpDialog.addStyleClass("MVideo_cafe");
			oHelpDialog.addStyleClass("helpFragment");
			if (this.getModel("device").getProperty("/mv_desktop")) {
				oHelpDialog.addStyleClass("MVideo_cafe_desktop");
			} else {
				oHelpDialog.addStyleClass("MVideo_cafe_mobile");
			}

			var fnForseSetWidthHeight = function(oDom, iWidth, iHeight) {
				var sStyle = oDom.attr("style") || "";
				//remove height/width
				if (sStyle) {
					sStyle = sStyle.split(";").filter(function(item) {
						return !(~item.indexOf("height") || ~item.indexOf("width"));
					}).join(";");
				}	
				sStyle += " height: " + iHeight + "px !important;";
				sStyle += " width: " + iWidth + "px !important;";
				oDom.attr("style", sStyle);
			};
			var iSizeMin = $(window).height();
			var iSizeMax = $(window).width();
			if (iSizeMin > iSizeMax) {
				var tmp = iSizeMax;
				iSizeMax = iSizeMin;
				iSizeMin = tmp;
			}

			var fnSetClass = function() {
				console.log("oHelpDialog - fnSetClass");
				oHelpDialog.$().css("transform-origin", "top left");
				if (sap.ui.Device.system.desktop 
				//	&& !sap.ui.Device.system.tablet) 
					|| sap.ui.Device.orientation.landscape) {
					oHelpDialog.$().css("transform", "rotate(0deg)");
				} else {
					oHelpDialog.$().css("transform", "rotate(90deg) translate(0%, -100%)");
					fnForseSetWidthHeight(oHelpDialog.$(), iSizeMax, iSizeMin);
					//overwrite width/height to fix rotation
				}
			};
			sap.ui.Device.orientation.attachHandler(function(){
				fnSetClass();
			});
			oHelpDialog.addEventDelegate({
				onAfterRendering: function() {
					fnSetClass();
					console.log("oHelpDialog.addEventDelegate - turn sensor");
				}
			});
			
			onStartup = false; //TEST CHANGE
			if (onStartup) {
				oHelpDialog.getModel("local").setProperty("/step", 1);
				oHelpDialog.onStartup_onAfterRendering = false;
				oHelpDialog.addEventDelegate({
					onAfterRendering: function() {
						console.log("oHelpDialog.addEventDelegate - onStartup true");
						if (oHelpDialog.onStartup_onAfterRendering) {
							return;
						}
						oHelpDialog.onStartup_onAfterRendering = true;
						var oBtnNextDOM = $(".mhNextBtn", oHelpDialog.$())[0];
						if (oBtnNextDOM) {
							var oBtnNext = sap.ui.getCore().byId(oBtnNextDOM.id);
							oBtnNext.attachPress(function() {
								oHelpDialog.getModel("local").setProperty("/step", 2);
							});
						}
					}
				});
			} else {
				oHelpDialog.getModel("local").setProperty("/step", 2);
				oHelpDialog.addEventDelegate({
					onAfterRendering: function() {
						console.log("oHelpDialog.addEventDelegate - onStartup false");
						var oNoMoreDOM = $(".mhNoMore", oHelpDialog.$())[0];
						if (oNoMoreDOM) {
							var oNoMore = sap.ui.getCore().byId(oNoMoreDOM.id);
							oNoMore.setVisible(false);
						}
					}
				});
			}
			oHelpDialog.setModel(this.getModel("i18n"), "i18n");
			oHelpDialog.open();
		},

		readNotifications: function() {
			var odataModel = this.getModel("odata"),
				oModel = this.getModel();
			odataModel.read("/MailSet", {
				urlParameters: null,
				success: function(data) {
					var aMessages = data.results.sort(function(a, b) {
						var fnParse = function(x) {
							return parseInt(x.SendDateNum + x.SendTimeNum);
						};
						return fnParse(a) - fnParse(b);
					}).map(function(item) {
						item.Read = item.Read === "true";
						return item;
					});
					oModel.setProperty("/Messages", aMessages);
				},
				error: function() {
					console.log("error readNotifications");
				}
			});
		},
		closeMainHelp: function(evt) {
			var oSrc = evt.getSource();
			while (oSrc && !oSrc.close) {
				oSrc = oSrc.getParent();
			}
			if (oSrc) {
				oSrc.close();
			}
		}

	});
});