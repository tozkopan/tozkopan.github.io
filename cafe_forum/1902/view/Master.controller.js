jQuery.sap.require("mvideo.cafe.util.Formatter");
jQuery.sap.require("mvideo.cafe.util.Helper");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.uxap.HierarchicalSelect");

sap.ui.controller("mvideo.cafe.view.Master", {
	f: mvideo.cafe.util.Formatter,
	helper: mvideo.cafe.util.Helper,

	toCreate: function() {
		var hasAfterNav = this.app._oDetailNav._hasAfterNav;
		var oCreateView = this.app.getDetailPage("Create");
		if (this.getView().getModel("device").getProperty("/mv_mobile")	&& !hasAfterNav) {
			var fnAfterNav = function(evt, arguments) {
				if (evt.getParameter("toId") == "Create" && oCreateView) {
					// evt.getParameter("fromId") == "Master"
					var oCreateAB = oCreateView.byId("Create--ObjectPageLayout-anchBar");	
					if (oCreateAB) {
						oCreateAB.getAggregation("_select").open();
					}
				}
			};
	//		this.app._oDetailNav.attachAfterNavigate(fnAfterNav);
			this.app._oDetailNav.attachNavigate(fnAfterNav);
			this.app._oDetailNav._hasAfterNav = true;
		}
		this.app.toDetail("Create");
	},
	toEmpty: function() {
		this.app.toDetail("Empty");
	},

	onInit: function() {
		this.app = this.getView().getViewData().component.app;
		//Add help tooltip to Add button
		var toCreate = this.getView().byId("mvMasterToCreate");
		toCreate.addEventDelegate({
			onAfterRendering: function() {
				console.log("add toCreate tooltip");
				if (toCreate._noMoreShow) {
					return;
				}
				
				toCreate.$().addClass("mv_tocreate_parent");
				var $tooltip = $("<span class='mv_tocreate'>" + this.getView().getModel("i18n").getResourceBundle().getText("MASTER_ADD_HELP") +
					"</span>");
				toCreate.$().append($tooltip);
				var iRight = 40; //parseInt( $toCreate.css("right") ) || 0;

				for (var iter = 0; iter < 2 * 6; iter++) {
					console.log("shake toCreate tooltip");
					$tooltip.animate({
						right: ((iter % 2 === 0 ? iRight : iRight + 10))
					}, 400);
				}
			}
		}, this);

		var fnOnGlobalClick = function() {
			console.log("hide toCreate tooltip");
			var $tooltip = $(".mv_tocreate", toCreate.$());
			toCreate._noMoreShow = true;
			$tooltip.css("visibility", "hidden");
			$("body").off("click", ".sapMShell", fnOnGlobalClick);
		};
		$("body").on("click", ".sapMShell", fnOnGlobalClick);
		// toCreate.attachPress(fnOnGlobalClick);
	},

	onAfterRendering: function() {
		
		if (sap.ushell) {
				document.body.className = document.body.className.replace("sapUiSizeCompact", "");
			}
		$(".masterName").dblclick(function() {
			//dev functions
		});
	},
	onSend: function() {
		//setTimeout(this.app.getDetailPage("Wizard").getController().confirmAbort, 100, this._onSend, [], this);
		if (this.app.getCurrentDetailPage().getId() === "Complete") {
			return;
		}
		this.app.getDetailPage("Wizard").getController().confirmAbort(this._onSend, [], this);
	},

	_onSend: function() {
		var that = this;
		var aLimits = this.getView().getModel().getProperty("/limits");
		var iAvailable = jQuery.grep(aLimits, function(i) {
			return i.id === "Available";
		})[0].price;
		var iOverdraft = jQuery.grep(aLimits, function(i) {
			return i.id === "Overdraft";
		})[0].price;
		var uploadUrl = "/sap/opu/odata/sap/ZMV_BEN_MAIN_SRV/UploadSet";
		var viewComplete = this.app.getDetailPage("Complete");
		var nextBtn = viewComplete.byId("btnNext"); //set busy
		nextBtn.setBusyIndicatorDelay(0);
		nextBtn.setBusy(true);
		nextBtn._myDef = {
			GetDeductions: jQuery.Deferred(),
			GetPersInfo: jQuery.Deferred()
		};

		jQuery.when(
			nextBtn._myDef.GetDeductions,
			nextBtn._myDef.GetPersInfo
		).done(function() {
			nextBtn.setBusy(false);
		});

		var oLocal = {
			uploadUrl: uploadUrl,
			limitOverflow: "???",
			cellphoneCancel: false,
			hasWarnings: false,
			completeAllowed: true,
			charitySelected: 4, //hidden
			available: iAvailable,
			overdraft: iOverdraft,
			currentStep: 1
		};
		if (iOverdraft > 0) {
			oLocal.limitOverflow = "OVER";
		} else if (iAvailable > 0) {
			oLocal.limitOverflow = "CHARITY";
		} else {
			oLocal.limitOverflow = "EXACT";
		}

		var local = new sap.ui.model.json.JSONModel(oLocal);
		viewComplete.setModel(local, "local");

		var odata = this.getView().getModel("odata");
		console.log('GetDeductions - pre');

		// odata.callFunction("GetDeductions", {
		// 	urlParameters: {
		// 		Year: this.getView().getModel().getProperty("/selectedYear")
		// 	},
		// 	method: 'GET',
		// 	success: function(data, response) {
		// 		console.log('GetDeductions - success');
		// 		local.setProperty("/deduct", data.results);
		// 		nextBtn._myDef.GetDeductions.resolve();
		// 	},
		// 	error: function(error) {
		// 		nextBtn._myDef.GetDeductions.resolve();
		// 	}
		// });
		
		setTimeout(function(){
			var iOverdraft = local.getProperty("/overdraft"),
				iQuarter = Math.floor(iOverdraft/4),
				iRest = iOverdraft - iQuarter*4;
			local.setProperty("/deduct", [{
				Date: "2017-03-01",
				Deduc: iQuarter + +(iRest > 0 && 1)
			}, {
				Date: "2017-06-01",
				Deduc: iQuarter + +(iRest > 1 && 1)
			}, {
				Date: "2017-09-01",
				Deduc: iQuarter + +(iRest > 2 && 1)
			}, {
				Date: "2017-12-01",
				Deduc: iQuarter
			}]);
			nextBtn._myDef.GetDeductions.resolve();
		}, 1000);

		console.log('GetDeductions - post');
		odata.callFunction("GetPersInfo",{
			urlParameters:{
				Key: "HAS_WARNINGS"
			},
			method: "GET",
			success: function(data,response){
				viewComplete.getModel("local").setProperty("/completeAllowed", (data.Stop !== "true" && data.Stop !== true));
				viewComplete.getModel("local").setProperty("/hasWarnings", (
					data.HasWarnings === "true" || data.HasWarnings === true || data.HasWarnings === "X"
				));
				viewComplete.getModel("local").setProperty("/toAdmin",(
					data.ToAdmin === "true" || data.ToAdmin === true || data.ToAdmin === "X"
				));
				viewComplete.getModel("local").setProperty("/warningTxt", that.helper.msgToArray(data.Message));
				viewComplete.getModel("local").refresh();
				nextBtn._myDef.GetPersInfo.resolve();
			},
			error: function(error){
				nextBtn._myDef.GetPersInfo.resolve();
			}
		});

		odata.remove("/UploadSet('')", {
			async: true,
			success: function(data, response) { console.log("UploadSet success");},
			error: function(error) { console.log("UploadSet error");}
		});

		viewComplete.getController().handleStep();
		this.app.toDetail("Complete");
	},

	onListPress: function(evt) {
		var oSrc = evt.getSource();
		this.app.getDetailPage("Wizard").getController().confirmAbort(this._onListPress, [oSrc], this);
	},

	_onListPress: function(oSrc) {
		var that = this;
		var odata = this.getView().getModel("odata");
		var viewDet = this.app.getDetailPage("Detail");
		var oCtx = oSrc.getBindingContext();
		var oData = oCtx.getProperty(oCtx.getPath());
		var oRB = this.getView().getModel("i18n").getResourceBundle();
		var sYear = "0000";//this.getView().getModel().getProperty("/selectedYear");
		var bMobile = this.getView().getModel("device").getProperty("/mv_mobile");
		var bActiveLink = oData.StatusId == "40";
		var oLocal = new sap.ui.model.json.JSONModel({
			step1: {},
			step2: {},
			step3: {}
		});
		viewDet.setModel(oLocal, "local"); //clear

		odata.read(this.helper.getODataDeferredURI(oData.Tile, odata), {
			async: true,
			success: function(data, response) {
				var that_data = data;
				console.log("Tile OK");
				var step2enabled = data.Step2 == "true";
				if (+data.BenefitId === 80) { //charity
					step2enabled = false;
				}
				var step3enabled = data.Step3 == "true";
				oLocal.setProperty("/step2enabled", step2enabled);
				// odata.read(that.helper.getODataDeferredURI(data.BenDescription, odata), {
				var sOptions = "";
				// if(+oData.StatusId === 40){ //if approved, then add this
				// 	sOptions = "approved." + that.getView().getModel().getProperty("/selectedYear") + "')";
				// 	sBenDescrUrl += ",Options='approved." + that.getView().getModel().getProperty("/selectedYear") + "')";
				// }

				var sBenDescrUrl = "/BenDescriptionSet(BenefitId='" + data.BenefitId + "',Benefit2Id='" + data.Benefit2Id + "',Year='" + sYear +
					"',Options='" + "')";
				odata.read(sBenDescrUrl, {
					async: true,
					success: function(data, response) {
						console.log("200 - BenDescriptionSet OK");
						var sText = data.Description;
						that.helper.replacePricePlaceHolder(sText, that_data.Price, that_data.DynFlag, function(text1) {
							that.helper.replaceFileLinksGW(text1,function(text2){
								that.helper.replaceImgScrLinks(text2, function(text) {
									oLocal.setProperty("/step1/descr", text);
									oLocal.refresh(true);
								}, bMobile);
							}, bMobile, bActiveLink);
						});
					},
					error: function(error) {
						console.log("BenDescriptionSet FAIL");
					}
				});

				var oApprovePersonalData = {
					bShow: false,
					bSelected: true
				};
				oLocal.setProperty("/step3/approvePersonalData", oApprovePersonalData);

				//if (step2enabled) {
					// odata.read(that.helper.getODataDeferredURI(data.Fields, odata), {
					odata.read("TileSet(Year='0000',Benefit2Id='" + data.Benefit2Id
					+ "',BenefitId='" + data.BenefitId + "')/Fields", {
						async: true,
						urlParameters: {
							// $skiptoken: "select_data=" + oData.Pskey,
							$expand: "Values"
						},
						success: function(data, response) {
							console.log("229 - Step2Fields OK");
							data.results.forEach(function(item) {
								if (item.FieldType === "DATE") {
									item.DateValue = new Date(item.DateValue);
								}
								item.Affect = item.Affect === "true";
								item.Mandatory = item.Mandatory === "true";
								delete item.__metadata;
							});
							that.helper.groupStep2Fields(data.results, oLocal);
							oLocal.refresh(true);

							var skiptoken = ["select_data=" + oData.Pskey];
							if (+oData.StatusId === 20) {
								var aFields = [];
								oLocal.getProperty("/step2/fields").forEach(function(item) {
									aFields.push(item.Link + '.' + item.Value);
								});
								skiptoken.push("cart" + aFields.join(';'));
							}

							odata.read(that.helper.getODataDeferredURI(that_data.Files, odata), {
								urlParameters: {
									// $skiptoken: skiptoken.join('//')
								},
								async: true,
								success: function(data) {
									console.log("Step3Files OK");
									var bFirstAgreement = true,
										aFiles = [];
									data.results.forEach(function(item) {
										if (!item.Agreement) {
											aFiles.push(item);
										} else if (bFirstAgreement) {
											bFirstAgreement = false;
											aFiles.Name = oRB.getText("HCODE_AGREEMENT_DOCUMENT_NAME");
											aFiles.push(item);
										}
									});
									oLocal.setProperty("/step3/files", aFiles);
								},
								error: function(error) {
									console.log("Step3Files FAIL");
								}
							});

							if (+that_data.BenefitId === 32) { //mobile - description
								var s2fields = oLocal.getProperty("/step2/fields");
								var aS2fields = [];
								if (s2fields) {
									s2fields.forEach(function(item) {
										aS2fields.push(item.Link + "." + item.Value);
									});
								}

								oLocal.setProperty("/step3/descr", "");
								odata.read("/Step3DescriptionSet(BenefitId='" + that_data.BenefitId + "',Benefit2Id='" + that_data.Benefit2Id + "',Year='" +
									sYear + "',Options='" + aS2fields.join(';') + "')", {
										async: true,
										success: function(data, response) {
											console.log("Step3Description OK");
											oLocal.setProperty("/step3/descr", data.Description);
										},
										error: function(error) {
											console.log("Step3Description FAIL");
										}
									});
							}

						},
						error: function(error) {
							console.log("Step2Fields FAIL");
						}
					});
				//				else{ //step3 even w/o step2
				//					var skiptoken = ["select_data=" + oData.Pskey];
				//					if(oData.StatusId == 20){
				//						skiptoken.push("cart");
				//					}
				//					odata.read(that.helper.getODataDeferredURI(that_data.Files, odata), {
				//						urlParameters: {
				//							$skiptoken: skiptoken.join('//')
				//						},
				//						async: true,
				//						success: function(data,response){
				//							console.log("Step3Files OK");
				//							oLocal.setProperty("/step3/files", data.results);
				//						},
				//						error: function(error){
				//							console.log("Step3Files FAIL");						
				//						}
				//					});
				//				}
			},
			error: function(error) {
				console.log("Tile FAIL");
			}
		});

		this.app.handleDetail(oCtx, "Detail", false);
	},

	onDelete: function(evt) {
		var listItem = evt.getParameter("listItem");
		var oCtx = (listItem) ? listItem.getBindingContext() : evt.getSource().getBindingContext();
		this.app.getDetailPage("Wizard").getController().confirmAbort(this._onDelete, [oCtx], this);
	},

	_onDelete: function(oCtx) {
		var that = this,
			MB = sap.m.MessageBox,
			oRB = this.getView().getModel("i18n").getResourceBundle(),
			sText = oRB.getText("MASTER_DELETE_CONFIRM"),
			oData = oCtx.getProperty(oCtx.getPath());
		if(+oData.BenefitId === 30){
			sText = oRB.getText("MASTER_DELETE_CONFIRM_30");
		}
		MB.confirm(sText, {
			title: oRB.getText("CMN_MESSAGE_CONFIRM_TITLE"),
			onClose: function(action) {
				if (action === MB.Action.OK) {
					that.handleDelete(oCtx);
				}
			}
		});
	},

	handleDelete: function(oCtx) {
		var that = this;
		var oData = oCtx.getProperty(oCtx.getPath());
		var oComponent = this.getView().getViewData().component;
		var odata = this.getView().getModel("odata");
		var oRB = this.getView().getModel("i18n").getResourceBundle();

		// var sURI = this.helper.getODataRelativeURI(oData.__metadata.self, odata);
		var sURI = this.helper.getODataRelativeURI(oData.__metadata.uri, odata);

		odata.remove(sURI, {
			async: true,
			success: function(data, response) {
				console.log("Delete " + sURI + " OK");
				sap.m.MessageToast.show(oRB.getText("CMN_ODATA_DELETE_OK"));
				oComponent.readYear( //refresh
					oCtx.getProperty("/current_year")
				);
				that.app.backToTopDetail();
			},
			error: function(error) {
				console.log("Delete " + sURI + " FAIL");
				var sError = that.helper.getODataErrorMessage(error);
				if (!sError) {
					sError = oRB.getText("CMN_ODATA_DELETE_FAIL");
				}
				sap.m.MessageToast.show(sError);
			}
		});
	},

	getGroupHeader: function(oGroup) {
		var sName = mvideo.cafe.util.Formatter.getGroupHeader(oGroup.key);
		return new sap.m.GroupHeaderListItem({
			title: sName,
			upperCase: false
		});
	},
	getAvailableHeader: function(oGroup) {
		var sName = mvideo.cafe.util.Formatter.tileInfo(oGroup.key);
		var header = new sap.m.DisplayListItem({
			label: sName,
			value: 12000
		});
		header.addStyleClass("sapMGHLI");
		//header.attachPress(function(){ console.log("ssss")} );
		return header;
	},

	onLimitHelp: function(evt) {
		if (!this._oLimitHelp) {
			this._oLimitHelp = sap.ui.xmlfragment("mvideo.cafe.view.limit_help", this);
			this.getView().addDependent(this._oLimitHelp);
		}
		var oSrc = evt.getSource();
		var oModel = this.getView().getModel();
		oModel.setProperty("/limit_help", {
			info: oSrc.data("text")
		});

		this._oLimitHelp.openBy(oSrc);
	},

	mainListPanelExpand: function(evt) {
		var oCtx = evt.getSource().getParent().getBindingContext();
		var sPath = oCtx.getPath() + "/expanded";
		var oModel = oCtx.getModel();
		console.log("Master Expand pre " + oModel.getProperty(sPath));
		oModel.setProperty(sPath, !oModel.getProperty(sPath));
		console.log("Master Expand post " + oModel.getProperty(sPath));
	},

	onYearSelect: function(evt) {
		var oItem = evt.getParameter("selectedItem");
		var oSelect = this.getView().byId("yearSelect");
		if (oSelect._myLastSelected != oItem.getKey()) {
			this.app.getDetailPage("Wizard").getController().confirmAbort(
				this._onYearSelect, [oItem], this, this._onNotYearSelect, []
			);
		}
	},
	_onNotYearSelect: function() {
		var oSelect = this.getView().byId("yearSelect");
		oSelect.setSelectedKey(oSelect._myLastSelected);
	},
	_onYearSelect: function(oItem) {
		//var oSelect = this.getView().byId("yearSelect");
		var oComponent = this.getView().getViewData().component;
		oComponent.readYear(oItem.data("uri"));
	},

	onMainHelp: function() {
		this.getView().getViewData().component.showMainHelp();
	},
	onNotifications: function() {
		this.helper.onNotifications.apply(this, arguments);
	}
});