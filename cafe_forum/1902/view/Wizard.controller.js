jQuery.sap.require("mvideo.cafe.util.Helper");

sap.ui.controller("mvideo.cafe.view.Wizard", {
	helper: mvideo.cafe.util.Helper,

	/*set internal step counter*/
	onInit: function() {
		this.app = this.getView().getViewData().component.app;
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			currentStep: 1,
			step2: {},
			step3: {},
			step4: {}
		}), "local");
	},
	/*general step handler: toggles icons, field edit states & forkes to step handlers*/
	handleStep: function(stepBack) {
		var cHeadLabel = "wizHead";
		var oView = this.getView();
		var oLocal = oView.getModel("local");
		var iCurStep = oLocal.getProperty("/currentStep");

		//alter header display
		setTimeout(function() {
			$("*[id*='" + cHeadLabel + "']", oView.$()).each(function() {
				this.classList.remove("myIconPast");
				this.classList.remove("myIconCurrent");
				this.classList.remove("myIconFuture");

				var stepNum = parseInt(this.id.split("wizHead")[1]);
				if (stepNum < iCurStep) {
					this.classList.add("myIconPast");
				} else if (stepNum === iCurStep) {
					this.classList.add("myIconCurrent");
				} else {
					this.classList.add("myIconFuture");
				}
			});
		}, 100);

		//scroll to step title
		//		var sTitleId = $(".myWizStepTitle", oView.byId("wizBody" + iCurStep).$() )[0].id;
		setTimeout(function() {
			var sTitleId = $("[id$='wizBody" + iCurStep + "']")[0].id;
			document.getElementById(sTitleId).scrollIntoView(true);
		}, 200);

		if (iCurStep === 2) { //step2 field edit
			oLocal.setProperty("/edit", true);
		} else {
			oLocal.setProperty("/edit", false);
		}

		switch (iCurStep) {
			case 1:
				this.handleStep_1(stepBack);
				break;
			case 2:
				this.handleStep_2(stepBack);
				break;
			case 3:
				this.handleStep_3(stepBack);
				break;
			case 4:
				this.handleStep_4(stepBack);
				break;
		}
	},
	/*increase step counter, check data*/
	onNext: function() {
		var oLocal = this.getView().getModel("local").getProperty("/");
		var butControl = this.getView().byId("btnNext");
		butControl.setBusyIndicatorDelay(0);
		console.log("setBusy(true)");
		butControl.setBusy(true);
		setTimeout(function() {
			console.log("setBusy(false)");
			butControl.setBusy(false);
		}, 200);
		if (this.handleStepPAI(oLocal.currentStep)) {
			return;
		} //check conditions

		if (oLocal.currentStep < 4) {
			oLocal.currentStep += 1;
		}
		if (oLocal.currentStep === 2 && !oLocal.step2enabled) {
			oLocal.currentStep += 1;
		}
		if (oLocal.currentStep === 3 && !oLocal.step3enabled) {
			oLocal.currentStep += 1;
		}
		this.getView().getModel("local").setProperty("/", oLocal);
		this.handleStep();
	},
	/*decrease step counter*/
	onPrev: function() {
		var oLocal = this.getView().getModel("local").getProperty("/");
		this.handleStepPAI(oLocal.currentStep, true);
		if (oLocal.currentStep > 1) {
			oLocal.currentStep -= 1;
		}
		if (oLocal.currentStep === 3 && !oLocal.step3enabled) {
			oLocal.currentStep -= 1;
		}
		if (oLocal.currentStep === 2 && !oLocal.step2enabled) {
			oLocal.currentStep -= 1;
		}
		this.getView().getModel("local").setProperty("/", oLocal);
		this.handleStep(true);
	},
	/*check data: mandatory fields not empty, mandatory files & etc.*/
	handleStepPAI: function(step, back) {
		var that = this;
		var local = this.getView().getModel("local");
		var odata = this.getView().getModel("odata");
		var oModel = this.getView().getModel();
		var oCtx = this.getView().getBindingContext();
		var oData = oCtx.getProperty(oCtx.getPath());
		var btnNext = this.getView().byId("btnNext");
		var oRB = this.getView().getModel("i18n").getResourceBundle();
		if (step === 3 && !back) {
			var bSelected = local.getProperty("/step3/approvePersonalData/bSelected");
			if (!bSelected) {
				sap.m.MessageToast.show(oRB.getText("APPROVE_PERSONAL_DATA_MANDATORY"));
				return true;
			}
		}
		if (step === 2 && !back) {
			var aFields = this.getView().getModel("local").getProperty("/step2/fields");
			var domFields = $(".fieldMark", this.getView().$());
			var notAll = false;
			aFields.forEach(function(field, i) {
				var bError = false;
				if (field.Mandatory && !field.Value && !field.DateValue) {
					bError = true;
				} else if (field.BenefitId == 30 && field.Link.indexOf("BENEFICIARY2_") === 0) { //insurance 2nd group
					var sFirstGr = field.Link.replace("BENEFICIARY2_", "BENEFICIARY1_");
					var oFirstGr = $.grep(aFields, function(i2) {
						return i2.Link === sFirstGr;
					});
					if (oFirstGr && oFirstGr[0] && oFirstGr[0].Mandatory) { //copy Mand from 1st group
						var allEmpty2nd = true;
						var allMandNotEmpty2nd = true;
						for (var idx = 0; idx < aFields.length; idx++) {
							if (aFields[idx].Link.indexOf("BENEFICIARY2_") === 0) {
								var sFirstGr_2 = aFields[idx].Link.replace("BENEFICIARY2_", "BENEFICIARY1_");
								var oFirstGr_2 = $.grep(aFields, function(i2) {
									return i2.Link === sFirstGr_2;
								});
								if (aFields[idx].Value) {
									allEmpty2nd = false;
								}
								if (!aFields[idx].Value && oFirstGr_2 && oFirstGr_2[0] && oFirstGr_2[0].Mandatory) {
									allMandNotEmpty2nd = false;
								}
							}
							if (!allEmpty2nd && !allMandNotEmpty2nd) {
								bError = true;
							}
						}
					}
				} else if ((+field.BenefitId === 32 && field.Link === "CELLPHONE") || field.Link === "BENEFICIARY1_COMNR" || field.Link ===
					"BENEFICIARY2_COMNR" || field.Link === "DMS_RELATIVE1_TNUM") { //hcode
					if (!field.Value || !/^\d+$/.test(field.Value) //only numbers
						|| field.Value.toString().substr(0, 1) !== "7" //starts with 7
						|| field.Value.toString().length !== 11) { //total 11 digits
						bError = true;
						sap.m.MessageToast.show(oRB.getText("HCODE_CELLPHONE_FORMAT_ERROR"));
					}
				} else if (+field.BenefitId === 20 && field.Link === "DMS_RELATIVE1_GBDAT") { //dms relative - check age
					var oField = local.getProperty("/DMSField");
					if (oField && oField.getValueState() === "Error") {
						bError = true;
						sap.m.MessageToast.show(oField.getValueStateText());
						oField.openValueStateMessage();
					}
				} else if (+field.BenefitId === 80) {
					if (!+field.Value) {
						bError = true;
					}
				}
				if (bError) {
					notAll = true;
					var oField = sap.ui.getCore().byId(domFields[i].id);
					if (oField.setValueState && oField.getValueState() !== "Error") {
						oField.setValueState("Error");
					}
					if (oField.setValueStateText && oField.getValueState() !== "Error") {
						oField.setValueStateText(oRB.getText("WIZARD_STEP2_EMPTYVALUE"));
						oField.openValueStateMessage();
					}
				}
			});

			if (notAll) { //error occured in some field, stay on the same step
				return notAll;
			}
			var oEntity = {
				Year: oModel.getProperty("/selectedYear"),
				BenefitId: oData.BenefitId,
				Benefit2Id: oData.Benefit2Id
			};
			var aFields = jQuery.extend(true, [], local.getProperty("/step2/fields"));
			if (aFields && aFields.length) {
				oEntity.Fields = aFields;
				oEntity.Fields.forEach(function(item) {
					delete item.Values;
					delete item.Hide;
				});
			}

			btnNext.setBusyIndicatorDelay(0);
			btnNext.setBusy(true);
			setTimeout(function(){
				btnNext.setBusy(false);
			}, 1000);
			// odata.create("/Step2CheckSet", oEntity, {
			// 	async: false,
			// 	success: function(data, response) {
			// 		console.log("Step2CheckSet OK");
			// 		data.Fields.results.forEach(function(item) {
			// 			if (!item.FailState) {
			// 				return;
			// 			}
			// 			notAll = true;
			// 			var field = $.grep(aFields, function(i) {
			// 				return item.Pos === i.Pos;
			// 			})[0];
			// 			if (field) {
			// 				var oField = sap.ui.getCore().byId(domFields[aFields.indexOf(field)].id);
			// 				if (oField.setValueState) {
			// 					oField.setValueState("Error");
			// 				}
			// 				if (oField.setValueStateText) {
			// 					oField.setValueStateText(oRB.getText("WIZARD_STEP2_EMPTYVALUE"));
			// 					oField.openValueStateMessage();
			// 				}
			// 			}
			// 		});
			// 		if (data.Message) {
			// 			sap.m.MessageToast.show(data.Message);
			// 		}
			// 		btnNext.setBusy(false);
			// 	},
			// 	error: function(error) {
			// 		console.log("Step2CheckSet FAIL");
			// 		btnNext.setBusy(false);
			// 	}
			// });
			return notAll;
		}
		if (step === 2 && back) {
			var domFields = $(".fieldMark", this.getView().$());
			$.each(domFields, function(idx, field) {
				//				console.log(field);
				var oField = sap.ui.getCore().byId(field.id);
				if (oField.setValueState) {
					oField.setValueState("None");
				}
				if (oField.setValueStateText) {
					oField.setValueStateText("");
				}
			});
		}
		return false; //default - no hold on current step
	},

	handleStep_1: function(stepBack) {
		var that = this;
		var odata = this.getView().getModel("odata");
		var oLocal = this.getView().getModel("local");
		var benData = this._getBenData();
		var bMobile = this.getView().getModel("device").getProperty("/mv_mobile");
		var sYear = "0000";//this.getView().getModel().getProperty("/selectedYear");
		if (!stepBack) {
			oLocal.setProperty("/step1", {});
			var sUrl = this.helper._setYear(sYear, this.helper.getODataDeferredURI(benData.BenDescription, odata));
			odata.read(sUrl, {
				async: true,
				/*urlParameters: {
					$filter: "Year='" + sYear + "'"
				},*/
				success: function(data, response) {
					console.log("W279 BenDescriptionSet OK");
					var sText = data.Description;
					that.helper.replacePricePlaceHolder(sText, benData.Price, benData.DynFlag, function(text1) {
						that.helper.replaceFileLinksGW(text1, function(text2) {
							that.helper.replaceImgScrLinks(text2, function(text) {
								oLocal.setProperty("/step1/descr", text);
							}, bMobile);
						}, bMobile);
					});
				},
				error: function(error) {
					console.log("BenDescriptionSet FAIL");
				}
			});
		}
	},

	handleStep_2: function(stepBack) {
		var that = this;
		var odata = this.getView().getModel("odata");
		var oLocal = this.getView().getModel("local");
		var benData = this._getBenData();
		var sYear = this.getView().getModel().getProperty("/selectedYear");
		if (!stepBack) {
			oLocal.setProperty("/step2/fields", []);
			oLocal.setProperty("/step2/calcValue", 0);
			odata.read(this.helper.getODataDeferredURI(benData.Fields, odata), {
				async: true,
				urlParameters: {
					$expand: "Values"
				},
				success: function(data, response) {
					console.log("Step2Fields OK");
					data.results.forEach(function(item) {
						if (item.FieldType === "EDU") {
							var aKeyIds = [],
								aKeys = [];
							item.Values.results.forEach(function(i) {
								if (!~aKeyIds.indexOf(i.UpperKey)) {
									aKeyIds.push(i.UpperKey);
									aKeys.push(i);
								}
							});
							item.Values.keys = aKeys;
							item.Values.all = item.Values.results;
							item.Values.results = [];
						}
						item.Value = item.DateValue = null;
						item.Affect = item.Affect === "true";
						item.Mandatory = item.Mandatory === "true";
						delete item.__metadata;
					});
					that.helper.groupStep2Fields(data.results, oLocal);
					//that.calcPrice();
					oLocal.setProperty("/step2/calcValue", benData.Price);
				},
				error: function(error) {
					console.log("Step2Fields FAIL");
				}
			});
			oLocal.setProperty("/step2/descr", "");
			var sUrl = this.helper._setYear(sYear, this.helper.getODataDeferredURI(benData.Step2Description, odata));
			odata.read(sUrl, {
				async: true,
				/*
								urlParameters: {
									$filter: "Year='" + sYear + "'"
								},*/
				success: function(data, response) {
					console.log("Step2Description OK");
					that.helper.replaceFileLinksGW(data.Description, function(text) {
						oLocal.setProperty("/step2/descr", text);
					}, false);
				},
				error: function(error) {
					console.log("Step2Description FAIL");
				}
			});
		}
	},

	handleStep_3: function(stepBack) {
		var that = this;
		var odata = this.getView().getModel("odata");
		var oLocal = this.getView().getModel("local");
		var benData = this._getBenData();
		var sYear = this.getView().getModel().getProperty("/selectedYear");
		if (!stepBack) {
			var skiptoken = ""; //for hardcoded files, omfg
			var aFields = [];
			var s2fields = oLocal.getProperty("/step2/fields");
			if (s2fields) {
				s2fields.forEach(function(item) {
					if (item.FieldType === "DATE") {
						aFields.push(item.Link + "." + that.parseDateToAbap(item.DateValue) || "");
					} else {
						aFields.push(item.Link + "." + item.Value || "");
					}
				});
				skiptoken += aFields.join(";");
			}
			var oApprovePersonalData = {
				bShow: false,
				bSelected: true
			};
			oLocal.setProperty("/step3/approvePersonalData", oApprovePersonalData);
			oLocal.setProperty("/step3/files", {});
			var sPath = this.helper._setYear(sYear, this.helper.getODataDeferredURI(benData.Files, odata));
			odata.read(sPath, {
				urlParameters: {
					// $skiptoken: "cart" + skiptoken
				},
				async: true,
				success: function(data, response) {
					console.log("Step3Files OK");
					var aFiles = [];
					data.results.forEach(function(file) {
						if (!file.Agreement) {
							aFiles.push(file);
						} else {
							oApprovePersonalData.Entity = file;
							oApprovePersonalData.bShow = true;
							oApprovePersonalData.bSelected = false;
						}
					});
					oLocal.setProperty("/step3/files", aFiles);
					oLocal.setProperty("/step3/approvePersonalData", oApprovePersonalData);
				},
				error: function(error) {
					console.log("Step3Files FAIL");
				}
			});
			oLocal.setProperty("/step3/descr", "");
			//			odata.read(this.helper.getODataDeferredURI(benData.Step3Description, odata), {
			odata.read("/Step3DescriptionSet(BenefitId='" + benData.BenefitId + "',Year='" + sYear +
				"',Benefit2Id='" + benData.Benefit2Id + "',Options='" + skiptoken + "')", {
					async: true,
					/*
									urlParameters: {
										$filter: "Year='" + sYear + "'"	
									},*/
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

	handleStep_4: function(stepBack) {
		var that = this;
		var odata = this.getView().getModel("odata");
		var oLocal = this.getView().getModel("local");
		var benData = this._getBenData();
		var sYear = this.getView().getModel().getProperty("/selectedYear");
		if (!stepBack) {
			oLocal.setProperty("/step4", {});
			$('#Wizard--wizBody4>.mvRawHTML').remove(); //bug fix
			var sUrl = this.helper._setYear(sYear, this.helper.getODataDeferredURI(benData.Step4Description, odata));
			odata.read(sUrl, {
				async: true,
				/*
								urlParameters: {
									$filter: "Year='" + sYear + "'"
								},*/
				success: function(data, response) {
					console.log("Step4Description OK");
					oLocal.setProperty("/step4/descr", data.Description);
					$('.mvRawHTML').parent().toggleClass("sapUiHiddenPlaceholder", false);

				},
				error: function(error) {
					console.log("Step4Description FAIL");
				}
			});
		}
	},

	/*filter select data by upperkey*/
	handleMinKeySelect: function(evt) {
		var sKey = evt.getParameter("selectedItem").getProperty("key"),
			localModel = this.getView().getModel("local"),
			fields = localModel.getProperty("/step2/fields")[0];
		fields.Values.results = $.grep(fields.Values.all, function(item) {
			return item.UpperKey == sKey || item.UpperKey == "";
		});
		localModel.refresh(true);
	},

	_getBenData: function() {
		var oCtx = this.getView().getBindingContext();
		return oCtx.getProperty(oCtx.getPath());
	},

	onComplete: function() {
		var that = this;
		var oCtx = this.getView().getBindingContext();
		var butControl = this.getView().byId("btnComplete");
		butControl.setBusyIndicatorDelay(0);
		console.log("setBusy(true)");
		butControl.setBusy(true);
		var odata = this.getView().getModel("odata");
		var odataMime = this.getView().getModel("odataMime");
		var local = this.getView().getModel("local");
		var oComponent = this.getView().getViewData().component;
		var oRB = this.getView().getModel("i18n").getResourceBundle();
		var oData = oCtx.getProperty(oCtx.getPath());
		this._obtainedCheck = jQuery.Deferred();
		// refresh obtained and check if adding is allowed
		var oSettingsModel = this.getView().getModel("settings");
		var oModel = this.getView().getModel();
		var uri = oModel.getProperty("/current_year");
		var sObtainedURI = uri + "/Obtained";
		odata.read(sObtainedURI, {
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
				oModel.refresh(true);
				that._obtainedCheck.resolve();
			},
			error: function(error) {
				console.log(sObtainedURI + " FAIL");
				if (butControl && butControl.setBusy) {
					butControl.setBusy(false);
				}
				var sError = that.helper.getODataErrorMessage(error);
				if (!sError) {
					sError = oRB.getText("CMN_ODATA_CREATE_FAIL");
				}
				sap.m.MessageToast.show(sError);
			}
		});
		this._obtainedCheck.done(function() {
			var bAllowed = mvideo.cafe.util.Formatter.tileEnabled(oData, 
				oModel.getProperty("/benifits_g"), oModel.getProperty("/tileGroup"), 
				oModel.getProperty("/PersInfo/MaxDmsRel"));
			if (!bAllowed) {
				// return MB with error
				sap.m.MessageToast.show( oRB.getText("HCODE_ERROR_BENEFIT_DOUBLE"));
				if (butControl && butControl.setBusy) {
					butControl.setBusy(false);
				}
				return;
			}
			var oEntity = {};
			oEntity.BenefitId = oData.BenefitId;
			oEntity.Benefit2Id = oData.Benefit2Id;
			oEntity.Benefit = oData.Benefit;
			oEntity.Benefit2 = oData.Benefit2;
			oEntity.Year = "0000";
			oEntity.Pskey = "0";
			oEntity.StatusId = "20"; //Added to cart
			if (local.getProperty("/step2/calc")) {
				oEntity.Betrg = local.getProperty("/step2/calcValue");
			} else {
				oEntity.Betrg = oData.Price;
			}

			var aField = jQuery.extend(true, [], local.getProperty("/step2/fields"));
			if (aField && aField.length) {
				oEntity.Fields = aField;
				oEntity.Fields.forEach(function(item) {
					delete item.Values;
					delete item.Hide;
					delete item.keyValue;
					if (item.FieldType === "DDATE") {
						item.DateValue = that.helper.parseDateYYYYMMDD(item.Value);
						item.Value = null;
					}
				});
			}

			odata.create("/ObtainedSet", oEntity, {
				async: true,
				success: function(data, response) {
					console.log("ObtainedSet CREATE OK");
					if (butControl && butControl.setBusy) {
						butControl.setBusy(false);
					}
					sap.m.MessageToast.show(oRB.getText("CMN_ODATA_CREATE_OK"));
					local.setProperty("/currentStep", 1);
					oComponent.readYear( //refresh
						oCtx.getProperty("/current_year")
					);
					//				that.app.backDetail();
				},
				error: function(error) {
					console.log("ObtainedSet CREATE FAIL");
					if (butControl && butControl.setBusy) {
						butControl.setBusy(false);
					}
					var sError = that.helper.getODataErrorMessage(error);
					if (!sError) {
						sError = oRB.getText("CMN_ODATA_CREATE_FAIL");
					}
					sap.m.MessageToast.show(sError);
				}
			});

		}.bind(this));
	},
	/*file download handler*/
	handleStep3Press: function(evt) {
		var oCtx = evt.getSource().getBindingContext("local"),
			oEntity;
		if (oCtx) {
			oEntity = jQuery.extend(true, {}, oCtx.getProperty(oCtx.getPath()));
		} else {
			oEntity = this.getView().getModel("local").getProperty("/step3/approvePersonalData/Entity");
		}
		var aFields = jQuery.extend(true, [], this.getView().getModel("local").getProperty("/step2/fields"));

		this._handleStep3Press(oEntity, aFields);
	},

	_handleStep3Press: function(oEntity, aFields, bPrint) {
		var that = this;
		var oModel = this.getView().getModel();
		var odata = this.getView().getModel("odata"),
			device = this.getView().getModel("device");
		var odataMime = this.getView().getModel("odataMime");
		var oComponent = this.getView().getViewData().component;
		var dynamic = oEntity.Dynamic;
		oEntity.Year = oModel.getProperty("/selectedYear");
		if (dynamic === 'X' || dynamic === 'G') {
			delete oEntity.__metadata;
			if (aFields && aFields.length) {
				oEntity.Fields = aFields;
				oEntity.Fields.forEach(function(item) {
					delete item.__metadata;
					delete item.Values;
					delete item.Hide;
					if (item.DateValue) {
						item.DateValue = that.helper.compensateTimeZone(item.DateValue);
					}
				});
			}
			if (oEntity.Dynamic === 'X' && (device.getProperty("/mv_mobile") || device.getProperty("/mv_tablet"))) {
				oEntity.Dynamic = 'M';
			}

			odata.create("/FilesSet", oEntity, {
				async: true,
				success: function(data, response) {
					if (!bPrint) {
						that.helper.downloadBase64(data.Data, oEntity.Name, oEntity.Extension);
					} else {
						console.log("Printing base64...");
						that.helper.printBase64(data.Data, oEntity.Name, oEntity.Extension);
					}
				},
				error: function(error) {
					console.log("DynFile CREATE FAIL");
					var sError = that.helper.getODataErrorMessage(error);
					if (!sError) {
						sError = "DynFile CREATE FAIL";
					}
					sap.m.MessageToast.show(sError);
				}
			});
		} else if (dynamic === "") {
			odataMime.callFunction("GetMime", {
				method: "GET",
				urlParameters: {
					url: "files/" + oEntity.Filekey
				},
				success: function(data, response) {
					console.log("GetMime OK");
					if (!bPrint) {
						that.helper.downloadURI(data.results[0].Full, oEntity.Name, oEntity.Extension);
					} else {
						console.log("Printing uri...");
						that.helper.printURI(data.results[0].Full, oEntity.Name, oEntity.Extension);
					}
				},
				error: function(error) {
					console.log("GetMime FAIL");
				},
				async: true
			});
		}
	},

	confirmAbort: function(func, aArgs, _this, errFunc, errArgs) {
		var that = this;
		var local = this.getView().getModel("local");
		var curStep = local.getProperty("/currentStep");
		var oRB = this.getView().getModel("i18n").getResourceBundle();

		if (!_this) {
			_this = this;
		}

		if (!(curStep > 1)) {
			func.apply(_this, aArgs);
		} else {
			var MB = sap.m.MessageBox;
			MB.confirm(oRB.getText("WIZARD_CANCEL_CONFIRM"), {
				title: oRB.getText("CMN_MESSAGE_CONFIRM_TITLE"),
				onClose: function(action) {
					if (action === MB.Action.OK) {
						//						that.app.backToTopDetail();
						func.apply(_this, aArgs);
						local.setProperty("/currentStep", 1);
					} else if (errFunc) {
						errFunc.apply(_this, errArgs);
					}
				}
			});
		}
	},

	calcPrice: function() {
		var that = this;
		var local = this.getView().getModel("local");
		if (!local.getProperty("/step2/calc")) {
			return;
		}

		var oldValue = local.getProperty("/step2/calcValue");

		var odata = this.getView().getModel("odata");
		var oModel = this.getView().getModel();
		var oCtx = this.getView().getBindingContext();
		var oData = oCtx.getProperty(oCtx.getPath());
		var oEntity = {
			Key: oData.Calc,
			Year: oModel.getProperty("/selectedYear"),
			BenefitId: oData.BenefitId,
			Benefit2Id: oData.Benefit2Id,
			Betrg: 0
		};

		var aFields = jQuery.extend(true, [], local.getProperty("/step2/fields"));
		if (aFields && aFields.length) {
			oEntity.Fields = aFields;
			oEntity.Fields.forEach(function(item) {
				delete item.Values;
				if (item.DateValue) {
					item.DateValue = that.helper.compensateTimeZone(item.DateValue);
				}
			});
		}

		var onPriceChange = function() {
			var priceDom = $(".step2CalcPrice");
			if (priceDom.data("mvAnimating")) {
				return; //no simultaneous animation
			}
			priceDom.data("mvAnimating", true);
			var orig = {
				color: priceDom.css("color"),
				fontSize: priceDom.css("fontSize"),
				lineHeight: priceDom.css("lineHeight")
			};
			priceDom.css("color", "red");
			priceDom.animate({
				fontSize: "2rem",
				lineHeight: "1rem"
			}, "slow");
			priceDom.animate({
				fontSize: orig.fontSize,
				lineHeight: orig.lineHeight
			}, "slow");
			jQuery.sap.delayedCall(1000, this, function() {
				priceDom.css("color", orig.color);
				priceDom.data("mvAnimating", false);
			});
		};

		var fieldValue;
		if (oData.Calc === "DIRECT_BETRG") { //charity special case
			var oBetrg = $.grep(aFields, function(i) {
				return i.Link === "BETRG";
			});
			if (oBetrg && oBetrg.length) {
				fieldValue = oBetrg[0].Value;
				if (!fieldValue) {
					fieldValue = 0;
				}
				local.setProperty("/step2/calcValue", fieldValue);
				if (oldValue !== fieldValue) {
					onPriceChange();
				}
			}
			return;
		} else if (oData.Calc === "MULTIPLE") {
			var oQuan = $.grep(aFields, function(i) {
				return i.Link === "BEN_QUAN";
			});
			if (oQuan && oQuan.length) {
				fieldValue = oQuan[0].Value * oData.Price;
				if (!fieldValue) {
					fieldValue = 0;
				}
				local.setProperty("/step2/calcValue", fieldValue);
				if (oldValue !== fieldValue) {
					onPriceChange();
				}
			}
			return;
		}

		odata.create("/CalcSet", oEntity, {
			async: true,
			success: function(data, response) {
				console.log("CalcSet CREATE OK");
				var oField = local.getProperty("/DMSField");
				if (data.Comment && oField) {
					if (oField.setValueState && +data.Betrg == 0) {
						oField.setValueState("Error");
					} else {
						oField.setValueState("Warning");
					}
					if (oField.setValueStateText) {
						oField.setValueStateText(data.Comment);
						oField.openValueStateMessage();
					}
				}
				if (oldValue != data.Betrg) {
					//sap.m.MessageToast.show("CHANGE!");
					onPriceChange();
				}
				local.setProperty("/step2/calcValue", data.Betrg);
			},
			error: function(error) {
				console.log("CalcSet CREATE FAIL");
				var sError = that.helper.getODataErrorMessage(error);
				if (!sError) {
					sError = "CalcSet CREATE FAIL";
				}
				sap.m.MessageToast.show(sError);
			}
		});

	},

	onStep2Change: function(evt) {
		this._onStep2Change(evt.getSource());
	},

	_onStep2Change: function(oField) {
		var that = this;
		var cont = this.getView().byId("wizBody2");

		//var oField = evt.getSource();
		var oCtx = oField.getBindingContext("local");
		var field = oCtx.getProperty(oCtx.getPath());
		var oRB = this.getView().getModel("i18n").getResourceBundle();
		var aFields = oCtx.getProperty(oCtx.getPath().split('/').slice(0, -1).join('/'));
		var oModel = this.getView().getModel();

		if (field.FieldType == "DATEF") {
			field.DateValue = that.helper.converMaskToDate(field.Value);
		}
		if (field.DateValue) {
			field.DateValue = that.helper.compensateTimeZone(field.DateValue);
		}

		if (field.Mandatory && (field.Value || field.DateValue)) {
			if (oField.setValueState) {
				oField.setValueState("None");
			}
			if (oField.setValueStateText) {
				oField.setValueStateText("");
			}
		}

		var bError = false;
		//insurance 2nd group
		if (+field.BenefitId === 30 && field.Link.indexOf("BENEFICIARY2_") === 0) {
			var notAllEmpty2nd = false;
			for (var idx = 0; idx < aFields.length; idx++) {
				if (aFields[idx].Link.indexOf("BENEFICIARY2_") === 0 && aFields[idx].Value) {
					notAllEmpty2nd = true;
				}
			}
			if (!notAllEmpty2nd) {
				//clear all 2nd group state
				var o2ndGroup = oField.getParent().getParent().getParent();
				o2ndGroup.getItems().forEach(function(i) {
					i.getItems()[1].getItems().forEach(function(i2) {
						if (i2.setValueState) {
							i2.setValueState("None");
						}
						if (i2.setValueStateText) {
							i2.setValueStateText("");
						}
					});
				});
			}
			//dms relative - check age
		} else if (+field.BenefitId === 20 && field.Link === "DMS_RELATIVE1_GBDAT") {
			this.getView().getModel("local").setProperty("/DMSField", oField);
		}

		if (bError) {
			if (oField.setValueState) {
				oField.setValueState("Error");
				//	oField.openValueStateMessage();
			}
			//if(oField.setValueStateText)
			//oField.setValueStateText(oRB.getText("WIZARD_STEP2_EMPTYVALUE"));
			return; //!!!!! no calc
		} else {
			if (oField.setValueState) {
				oField.setValueState("None");
			}
			if (oField.setValueStateText) {
				oField.setValueStateText("");
			}
		}
		this.calcPrice();
	},

	handleBack: function(evt) {
		this.confirmAbort(this._handleBack, [evt]);
	},
	_handleBack: function() {
		//		this.app.backDetail();
		if (this.app.hasStyleClass("MVideo_cafe_mobile")) {
			this.app.backDetail();
		} else {
			this.app.backToTopDetail();
		}
	},
	setVisible: function(id, visible) {
		this.getView().byId(id).setVisible(visible);
	},

	onlyNumbersLeftAlive: function(evt) {
		evt.getSource().setValue(
			evt.getParameter("newValue").replace(/\D/g, '')
		);
		this._onStep2Change(evt.getSource());
	},

	parseDateToAbap: function(date) {
		if (!date) {
			return null;
		}
		if (!(date instanceof Date)) {
			return date;
		}
		var sDate = ("00" + date.getDate()).substr(-2),
			sMonth = ("00" + (date.getMonth() + 1)).substr(-2),
			sYear = date.getFullYear();
		return sYear + sMonth + sDate;
	},

	integerQuantity: function(evt) {
		this._integerQuantity(evt.getSource(), evt.getParameter("newValue"));
	},
	_integerQuantity: function(oSrc, newValue) {
		oSrc.setValue(newValue.replace(/\D/g, ''));
		var iMax = parseInt(oSrc.data("max")),
			iMin = parseInt(oSrc.data("min"));

		if (oSrc.getValue() < iMin) {
			oSrc.setValue(iMin);
		} else if (oSrc.getValue() > iMax) {
			oSrc.setValue(iMax);
		}

		this._onStep2Change(oSrc);
	},
	iquanPress: function(evt) {
		var oSrc = evt.getSource();
		var oInput = $.grep(
			oSrc.getParent().getItems(),
			function(i) {
				return i.getId().search('input') > 0;
			}
		)[0];

		oInput.setValue(oInput.getValue() - + -parseInt(oSrc.data("iquanPress")));
		this._integerQuantity(oInput, oInput.getValue());
	},

	onStep4Expand: function(evt) {
		evt.getSource().rerender();
	}

});