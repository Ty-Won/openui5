sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/rta/test/SmartLinkUtil",
	"sap/ui/rta/util/UrlParser",
	"sap/ui/core/CustomData"
], function(
	UIComponent,
	FakeLrepConnectorSessionStorage,
	SmartLinkUtil,
	UrlParser,
	CustomData
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.qunitrta.Component", {

		metadata: {
			manifest: "json"
		},

		init : function() {
			this._bShowAdaptButton = this.getComponentData().showAdaptButton ? this.getComponentData().showAdaptButton : false;
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Initialize the application
		 *
		 * @returns {sap.ui.core.Control} the content
		 */
		createContent : function() {
			SmartLinkUtil.mockUShellServices();

			// app specific setup
			this._createFakeLrep();

			var oApp = new sap.m.App({
				id : this.createId("app"),
				customData : [new CustomData({
					key : "sap-ui-custom-settings",
					value : {
						"sap.ui.dt" : {
							designtime : "sap/ui/rta/test/InstanceSpecificScopedRoot.designtime"
						}
					}
				})]
			});

			var oModel = new sap.ui.model.json.JSONModel({
				showAdaptButton : this._bShowAdaptButton
			});

			var oPage = sap.ui.view(this.createId("idMain1"), {
				viewName : "sap.ui.rta.qunitrta.ComplexTest",
				type : sap.ui.core.mvc.ViewType.XML
			});

			this.oView = oPage;

			oPage.setModel(oModel, "view");

			oApp.addPage(oPage);

			return oApp;
		},

		/**
		 * Create the FakeLrep with localStorage
		 * @private
		 */
		_createFakeLrep: function () {
			if (UrlParser.getParam('sap-rta-mock-lrep') !== false) {
				FakeLrepConnectorSessionStorage.enableFakeConnector();
			}
		}

	});
});
