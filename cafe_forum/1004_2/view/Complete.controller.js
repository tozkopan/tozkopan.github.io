jQuery.sap.require("mvideo.cafe.util.Helper");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.controller("mvideo.cafe.view.Complete", {
	helper : mvideo.cafe.util.Helper,
	
	onInit : function() {
		this.app = this.getView().getViewData().component.app;
//		this._wizard = this.getView().byId("myWizard");
	},
	handleStep : function(stepBack) {
		var oView = this.getView();
		var oLocal = oView.getModel("local");
		var iCurStep = oLocal.getProperty("/currentStep");
		
		//alter header display
		setTimeout(function(){
			$( "*[id*='completeHead']", oView.$() ).each(function(){
				var stepNum = parseInt( this.id.split("completeHead")[1]);
				this.classList.remove("myIconPast");
				this.classList.remove("myIconCurrent");
				this.classList.remove("myIconFuture");
				if( stepNum < iCurStep ){
					this.classList.add("myIconPast");
				} else if( stepNum == iCurStep ){
					this.classList.add("myIconCurrent");
				} else {
					this.classList.add("myIconFuture");
				}				
			});
		}, 200);
		
		//scroll to step title
//		var sTitleId = $(".myWizStepTitle", oView.byId("wizBody" + iCurStep).$() )[0].id;
		setTimeout(function(){
			var sTitleId = $("[id$='completeBody" + iCurStep + "']")[0].id;			
			document.getElementById( sTitleId ).scrollIntoView();
		}, 200);
		switch (iCurStep) {
			case 1:		this.handleStep_1(stepBack);	break;
			case 2:		this.handleStep_2(stepBack);	break;
		}
	},
	
	onNext : function() {
		var oLocal = this.getView().getModel("local").getProperty("/");
		oLocal.currentStep += 1;
		this.getView().getModel("local").setProperty("/", oLocal);
		this.handleStep();
	},
	
	onPrev : function() {
		var oLocal = this.getView().getModel("local").getProperty("/");		
		oLocal.currentStep -= 1;
		this.getView().getModel("local").setProperty("/", oLocal);
		this.handleStep(true);
	},
	
	handleStep_1 : function(stepBack) {
		var aGroup = $.grep(this.getView().getModel().getProperty("/Tile"),
			// function(i){ return ~[770,780,790,800].indexOf(+i.BenefitId); }
			function(i){ return ~[770,780,790].indexOf(+i.BenefitId); }
		);
		// var aGroup = [{
		// 	Benefit2: "Благотворительный фонд 1"
		// },{
		// 	Benefit2: "Благотворительный фонд 2"
		// },{
		// 	Benefit2: "Благотворительный фонд 3"
		// },{
		// 	Benefit2: "Благотворительный фонд 4"
		// }];
		var oRBG = this.getView().byId("rbg_0");
		if (aGroup && oRBG) {
			oRBG.removeAllButtons();
			oRBG.addButton(new sap.m.RadioButton("charity_hidden", {
				text: "",
				visible: false,
				selected: true
			}));
			aGroup.forEach(function(ben, i) {
				oRBG.addButton(new sap.m.RadioButton("charity_" + (i + 1), {
					text: "\"" + ben.Benefit2 + "\" - " + ben.MainDescription,
					visible: true,
					selected: false
				}));
			});
		}
	},
	
	handleStep_2 : function(stepBack) {
		var local = this.getView().getModel("local");
		var odata = this.getView().getModel("odata");
		var oLocal = local.getProperty("/");
		var sYear = this.getView().getModel().getProperty("/current_year");
		var btnComplete = this.getView().byId("btnComplete");
		var MB = sap.m.MessageBox;
		var oRB = this.getView().getModel("i18n").getResourceBundle();
		if(oLocal.limitOverflow === "CHARITY" && +oLocal.charitySelected <= 0){ //0 || -1 === hidden
			oLocal.currentStep -= 1;
			local.setProperty("/currentStep", oLocal.currentStep); //back
			MB.show(oRB.getText("COMPLETE_CHARITY_WARNING"),{
				title:oRB.getText("CMN_MESSAGE_WARNING_TITLE")
			});
			return;
		}
		if (oLocal.hasWarnings) {
			var sMsg = oLocal.warningTxt.join("\n\n");
			MB.warning(sMsg, {
				title: oRB.getText("CMN_MESSAGE_WARNING_TITLE")
			});
		}
		var btnComplete = this.getView().byId("btnComplete");
		btnComplete.setBusyIndicatorDelay(0);
		btnComplete.setBusy(true);
		
		//Get all files
		var aRequest = [];
//		var aBen = $.grep(
//			this.getView().getModel().getProperty("/benifits_g"),
//			function(i){ return i.status == 20; }
//		)[0].content;
		var aBen = [], iFitness, aAllBen = [], 
			aTiles = this.getView().getModel().getProperty("/TileGroup");
		this.getView().getModel().getProperty("/benifits_g").forEach(function(i){
			aBen = aBen.concat(i.content);
		});
		/*get all benefits for displaying benName in filesTable*/
		this.getView().getModel().getProperty("/Tile").forEach(function(i){
			aAllBen = aAllBen.concat({
				BenefitId: i.BenefitId,
				Tilegroup: i.Tilegroup,
				Benefit2: ""
			});
		});
		aAllBen.forEach(function(item) {
			var oTile = $.grep(aTiles, function(i){
				return i.Tilegroup == item.Tilegroup || i.Tilesupergroup == item.Tilegroup;
			})[0];
			if (oTile) {
				item.Benefit2 = oTile.Text2sgr ? (oTile.Text1sgr + " " + oTile.Text2sgr) : oTile.Text1sgr;
			}
		});
		
		var aFiles = [{
			Benefit2: (aBen && aBen[0] && aBen[0].Benefit2) || "Льгота 1",
			Pskey: "",
			Year: "0000",
			Enabled: true,
			Filekey: "",
			Optional: "false",
			Name: "Шаблон заявления"
			
		}];
		local.setProperty("/Files", aFiles);
		
		btnComplete.setBusy(false);
		btnComplete.setEnabled(true);
		
		odata.read("/FilesSet", {
			async: true,
			urlParameters: {
				$skiptoken: "sendcart=" //+ aRequest.join(";") --- select from DB instead
										+ sYear
			},
			success: function(data,response){
				var aFiles = data.results.filter(function(item){
					return !item.Agreement; //only non agreements
				}), bOptional = true;
				aFiles.forEach(function(item){
					var oBen = $.grep(aBen, function(i){
						return i.BenefitId == item.BenefitId && i.Benefit2Id == item.Benefit2Id
							&& i.Pskey.substr(-3) == item.Seqnr;
					})[0];
					if (!oBen) {
						oBen = $.grep(aAllBen, function(i){
							return i.BenefitId == item.BenefitId;
						})[0];
					}
					if(oBen){						
						item.Benefit2 = oBen.Benefit2;
						item.Pskey = oBen.Pskey;
						item.Year = oBen.Year;
					} 
					if (item.Filekey == "DMS_DEDUCTION_EMPL") {
						item.Benefit2 = oRB.getText("HCODE_DMS_BENNAME");
					}
					item.Enabled = (item.Filekey !== "FITNES") ? true : false;
					if ((item.Optional == "false" || item.Optional == false) && bOptional) {
						bOptional = false;
					}
				});
				local.setProperty("/Files",aFiles);
				if(aFiles && aFiles.length && !bOptional){ //got files -> upload it first
					btnComplete.setEnabled(false);
				}else{
					btnComplete.setEnabled(true);
				}
				btnComplete.setBusy(false);
			},
			error : function(error){
				btnComplete.setBusy(false);
				btnComplete.setEnabled(true);
			}
		});
	},
	
	handlePrintPress : function(evt) {	
		this._handleDocPress( evt.getSource(), true );
	},
	
	handleDocPress : function(evt) {
		this._handleDocPress( evt.getSource(), false );
	},
	
	_handleDocPress : function(oSrc, print) {
		var that = this;
		var bPrint = !!print;
		var oCtx = oSrc.getBindingContext("local");
		var odata = this.getView().getModel("odata");
		var oEntityOrig = oCtx.getProperty( oCtx.getPath() );
		var oEntity = jQuery.extend(true, {},  oEntityOrig);
		delete oEntity.Benefit2;
		delete oEntity.Pskey;
		delete oEntity.Enabled;
		odata.read(that.helper.getODataDeferredURI(oEntity.Fields, odata), {
			async: true,
			urlParameters: {
				$skiptoken: "select_data=" + oEntityOrig.Pskey
			},
			success: function(data,response){
				console.log("Step2Fields OK");
				data.results.forEach(function(item){								
					if (item.FieldType == "DATE") {
						item.DateValue = new Date( item.DateValue );
					}
					item.Affect = item.Affect === "true";
					item.Mandatory = item.Mandatory === "true";
					delete item.__metadata;
				});
				that.app.getDetailPage("Wizard").getController()._handleStep3Press(oEntity, data.results, bPrint);
			},
			error: function(error){
				console.log("Step2Fields FAIL");
				that.app.getDetailPage("Wizard").getController()._handleStep3Press(oEntity, [], bPrint);
			}
		});
	},
	
	onMyUploadFail : function(evt){
		console.log("onMyUploadFail");
		var tblComplete = this.getView().byId("completeTable");
		tblComplete.setBusy(false);
		evt.getSource().setValueState(
			sap.ui.core.ValueState.Error
		);
	},
	
	onUploadComplete : function(evt){
		console.log("onUploadComplete");
		var iStatus = parseInt( evt.getParameter("status") );
		if ( iStatus >= 200 && iStatus < 300 ){
			evt.getSource().setValueState(
				sap.ui.core.ValueState.Success
			);
			var btnComplete = this.getView().byId("btnComplete");
			var aRows = this.getView().byId("completeTable").getRows();
			var bAllOk = true;
			aRows.forEach(function(row){
				var oFU = row.getCells()[2];
				if(oFU.getValueState() !== sap.ui.core.ValueState.Success && oFU.getVisible()) {
					bAllOk = false;
				}	
			});
			if(bAllOk) {
				btnComplete.setEnabled(true);
			}
		}
		var tblComplete = this.getView().byId("completeTable");
		tblComplete.setBusy(false);
	},
	
	onChange : function(evt){
		console.log("onChange");
		var btnComplete = this.getView().byId("btnComplete");
		var tblComplete = this.getView().byId("completeTable");
		tblComplete.setBusyIndicatorDelay(0);
		if (!evt.getParameter("newValue") ){ //empty filename
			evt.getSource().setValueState(
				sap.ui.core.ValueState.Error
			);
			tblComplete.setBusy(false);
		}else{
			btnComplete.setEnabled(false); //block on change
			tblComplete.setBusy(true);
		}
	},
	
	onGetToken : function(evt){
		var odata = this.getView().getModel("odata");
		odata.refreshSecurityToken(function(){			
			console.log("refreshSecurityToken");
		}, null, false);
		evt.getSource().setToken(
			odata.getSecurityToken()
		);
	},
	
	onComplete : function(){
		var that = this;
		var MB = sap.m.MessageBox;
		var oRB = this.getView().getModel("i18n").getResourceBundle();		
		var bRetail = this.getView().getModel().getProperty("/PersInfo/Retail");
		var oLocal = this.getView().getModel("local").getProperty("/");
		//check charity before retail
		if(bRetail){
			if(oLocal.limitOverflow === "CHARITY" && +oLocal.charitySelected <= 0){ //0 || -1 === hidden
				MB.show(oRB.getText("COMPLETE_CHARITY_WARNING"),{
					title: oRB.getText("CMN_MESSAGE_WARNING_TITLE")
				});
				return;
			}
		}
		var sText = oRB.getText("COMPLETE_APPROVE_TEXT");
		if (bRetail && oLocal.toAdmin) {
			sText+="\n" + oRB.getText("EMPTY_GOTO_ADMIN", this.getView().getModel().getProperty("/PersInfo/AdminEnameCase"));
		}
		MB.confirm(sText,{
			title:oRB.getText("COMPLETE_APPROVE_TITLE"),
			onClose: function(action){
				if(action == MB.Action.OK){
					that.doComplete.apply(that);
				}
			}.bind(this)
		});
	},
	
	doComplete : function(evt) {
		var that = this;
		var odata = this.getView().getModel("odata");
		var oModel = this.getView().getModel();
		var oComponent = this.getView().getViewData().component;
		var MB = sap.m.MessageBox;
		var oRB = this.getView().getModel("i18n").getResourceBundle();
		var oSelYear = this.getView().getModel().getProperty("/selectedYear");
		var myApp = sap.ui.getCore().myApp;
		var sCharity = '';
		var aGroup = $.grep(this.getView().getModel().getProperty("/Tile"),
				function(i){ return +i.BenefitId == 80; }
			);
		var oLocal = this.getView().getModel("local").getProperty("/");
		if(oLocal.limitOverflow == "CHARITY" && oLocal.charitySelected){
			sCharity = aGroup[oLocal.charitySelected - 1].Benefit2Id;
		}
		myApp.setBusyIndicatorDelay(0);
		myApp.setBusy(true);
		odata.callFunction("SendCart",{
			urlParameters:{
				Year: oSelYear,
				Charity: sCharity
			},
			method: 'GET',
			success: function(data){
				odata.read("/YearsSet", {
					async: true,
					success: function(data2){
						console.log("YearsSet OK");
							var aYears = data2.results;
							data2.results.forEach(function(item){
								item.uri = mvideo.cafe.util.Helper.getODataRelativeURI(
									item.__metadata.uri, odata
								);
								if( item.Open === "true" || item.Open === true ){
									item.Text = oRB.getText("MASTER_YEAR_CURRENT");
								}else{
									item.Text = item.Year + oRB.getText("MASTER_YEAR_SUFFIX");
								}
							});
							oModel.setProperty("/years", aYears);
							myApp.setBusy(false);
							MB.show(oRB.getText("COMPLETE_SENT"),{
								title:oRB.getText("CMN_MESSAGE_SUCCESS_TITLE")
							});
							oComponent.readYear( //refresh
								oModel.getProperty("/current_year")
							);
					},
					error: function(error){
						console.log("YearsSet FAIL");
						myApp.setBusy(false);
						var sError = that.helper.getODataErrorMessage(error);
						if (!sError) {
							sError = oRB.getText("CMN_ODATA_CREATE_FAIL");
						}
						sap.m.MessageToast.show( sError );
					}
				});
			},
			error :  function(error){
				console.log("SendCart");
				myApp.setBusy(false);
				var sError = that.helper.getODataErrorMessage(error);
				if (!sError) {
					sError = oRB.getText("CMN_ODATA_CREATE_FAIL");
				}
				MB.show(sError,{
					title: oRB.getText("CMN_MESSAGE_ERROR_TITLE"),
					icon:  MB.Icon.ERROR
				});
			}
		});
	},
	
	handleBack : function(evt) {
		this.app.backToTopDetail();
	},
	setVisible : function(id, visible) {
		this.getView().byId(id).setVisible(visible);
	}
	
});