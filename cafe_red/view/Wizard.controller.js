sap.ui.controller("mvideo.cafe.view.Wizard", {
	onInit : function() {
		this.app = this.getView().getViewData().component.app;
		this.getView().setModel(new sap.ui.model.json.JSONModel({}), "local");
	},
	// onBeforeRendering: function() {
	// },
	 onAfterRendering: function() {
	 },
	// onExit: function() {
	// }
	
	buttonLag: false, //fix Wizard bugs
	buttonLagDelay: 300,
	
	onNext : function() {
		if(this.buttonLag == true) return;		
		this.buttonLag = true;
		setTimeout(function(){
			this.buttonLag = false;
		}.bind(this), this.buttonLagDelay);

		aSteps = this._wizard.getSteps();
		var curStep = aSteps[this._wizard.getProgress() -1];
		if(curStep.getId() == "step4"){
			//block progress if file is empty
			var aFiles = curStep.getContent()[0].getItems();
			var bEmpty = false;
			for (var int = 0; int < aFiles.length; int++) {
				var oUpload = aFiles[int].getContent()[0].getItems()[2];
				if(this.setFileState( oUpload ))
					bEmpty = true;
			}
			if(bEmpty)
				return;
		}
		var toStep = aSteps[this._wizard.getProgress() -1 +1]; //next step
		if(toStep === undefined){
			
		}else{
			this.handleStep( toStep.getId(), true ); 
		};
		this._wizard.nextStep();
	},
	onPrev : function() {
		if(this.buttonLag == true) return;
		this.buttonLag = true;
		setTimeout(function(){
			this.buttonLag = false;
		}.bind(this), this.buttonLagDelay);

		aSteps = this._wizard.getSteps();
		var toStep = aSteps[this._wizard.getProgress() -1 -1]; //previous step
		if(toStep === undefined){
			this.app.backDetail();
		}else{
			this.handleStep( toStep.getId(), false ); 
		};
		this._wizard.previousStep();				
	},
	handleStep : function(id, forward){
		switch (id) {
		case "step1":
			this.setVisible("btnNext",false);
			this.setVisible("btnPrev",false);
			this.setVisible("btnStart",true);
			this.setVisible("btnComplete",false);
			this.setVisible("step1",true); 
//			this.setVisible("step2",false); 
//			this.setVisible("step3",false); 
//			this.setVisible("step4",false);
			this.getView().getModel("local").setProperty("/edit", false);
			this.getView().getModel("local").setProperty("/edit_f", false);
			this._wizard.mAggregations._page.getSubHeader().setVisible(true);
			
			if(forward === false){				
				this._wizard.discardProgress(
					this._wizard.getSteps()[0]
				);
			}
		break;
		case "step2":
			this.setVisible("btnNext",true);
			this.setVisible("btnPrev",true);
			this.setVisible("btnStart",false);
			this.setVisible("btnComplete",false);
			this.setVisible("step1",true); 
			this.setVisible("step2",true); 
//			this.setVisible("step3",false); 
//			this.setVisible("step4",false);
			this.getView().getModel("local").setProperty("/edit", false);
			this.getView().getModel("local").setProperty("/edit_f", true);
			this._wizard.mAggregations._page.getSubHeader().setVisible(true);
		break;
		case "step3":
			this.setVisible("btnNext",true);
			this.setVisible("btnPrev",true);
			this.setVisible("btnStart",false);
			this.setVisible("btnComplete",false);
			this.setVisible("step1",true); 
			this.setVisible("step2",true); 
			this.setVisible("step3",true); 
//			this.setVisible("step4",false);
			this.getView().getModel("local").setProperty("/edit", false);
			this.getView().getModel("local").setProperty("/edit_f", false);
			this._wizard.mAggregations._page.getSubHeader().setVisible(true);
		break;
		case "step4":
			this.setVisible("btnNext",true);
			this.setVisible("btnPrev",true);
			this.setVisible("btnStart",false);
			this.setVisible("btnComplete",false);
			this.setVisible("step1",true); 
			this.setVisible("step2",true); 
			this.setVisible("step3",true); 
			this.setVisible("step4",true);
			this.getView().getModel("local").setProperty("/edit", true);
			this.getView().getModel("local").setProperty("/edit_f", false);
			this._wizard.mAggregations._page.getSubHeader().setVisible(true);
		break;
		case "step5":
			this.setVisible("btnNext",false);
			this.setVisible("btnPrev",true);
			this.setVisible("btnStart",false);
			this.setVisible("btnComplete",true);
			this.setVisible("step1",false); 
			this.setVisible("step2",false); 
			this.setVisible("step3",false); 
			this.setVisible("step4",false);
			this.getView().getModel("local").setProperty("/edit", false);
			this.getView().getModel("local").setProperty("/edit_f", false);
//			this._wizard.mAggregations._page.getSubHeader().setVisible(false);
		break;
		}
		
	},
	onComplete : function(){
		this.app._oMasterNav.setVisible(true);
		this.app.backDetail();
	},
	handleBack : function(evt) {
		fnBack = function (){
			this.app._oMasterNav.setVisible(true);
			this.app.backDetail();			
		}.bind(this);
		
		if(this._wizard.getProgress() > 1){
			MB = sap.m.MessageBox;
			MB.confirm("Вы действительно хотите отменить оформление льготы?"
					+ " Введенные данные будут потеряны!",{
				title:"Подтверждение",
				onClose: function(action){
					if(action == MB.Action.OK){
						fnBack()
					}
				}
			});
		}else{
			fnBack();
		}
	},
	setVisible : function(id, visible) {
		var o = this.getView().byId(id)
		if(!o) o = sap.ui.getCore().byId(id); 
		if(o) o.setVisible(visible);
	},
	
	onFileChange : function(evt) {
		this.setFileState( evt.getSource() );
	},
	
	setFileState : function(uploader) {
		if(uploader.getValue()){
			uploader.setValueState("Success");
			return false;
		}else{
			uploader.setValueState("Error");
			return true;
		}
	},
	onStep2Change : function(evt) {
		var oForm = evt.getSource().getParent().getParent().getParent();
		var oCtx = oForm.getBindingContext();
		var aFields = oCtx.getProperty( oCtx.getPath() ).fields;
		var oFields = {};
		aFields.forEach(function(row){
			oFields[row.id] = row.value;
		});
		aFields.forEach(function(item,i,array){
			if(item.calc){
				switch (item.id) {
				case "price":
					item.value = 1000 + parseInt( oFields.dob.split(".").pop() );
					break;
				}
			}
		});
	},	
});