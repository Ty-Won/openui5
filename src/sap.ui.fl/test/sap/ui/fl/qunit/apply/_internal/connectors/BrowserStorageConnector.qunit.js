/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/apply/_internal/connectors/LocalStorageConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/_internal/connectors/LocalStorageConnector",
	"sap/ui/thirdparty/sinon-4",
	"sap/base/util/merge",
	"sap/ui/thirdparty/jquery"
], function(
	BrowserStorageUtils,
	JsObjectConnector,
	SessionStorageConnector,
	LocalStorageConnector,
	ConnectorUtils,
	JsObjectWriteConnector,
	SessionStorageWriteConnector,
	LocalStorageWriteConnector,
	sinon,
	merge,
	jQuery
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	QUnit.module("Loading of Connector", {}, function() {
		QUnit.test("given a custom connector is configured", function(assert) {
			return ConnectorUtils.getApplyConnectors().then(function (aConnectors) {
				assert.equal(aConnectors.length, 2, "two connectors are loaded");
				assert.equal(aConnectors[0].connectorName, "StaticFileConnector", "the StaticFileConnector is the first connector");
				assert.equal(aConnectors[1].connectorName, "BrowserStorageConnector", "the BrowserStorageConnector is the second connector");
			});
		});
	});

	var oTestData = {
		change1: {
			fileName: "id_1445501120486_15",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "CUSTOMER"
		},
		change2: {
			fileName: "id_1445517849455_16",
			fileType: "change",
			reference: "sap.ui.fl.test",
			layer: "USER"
		},
		change3: {
			fileName: "id_1445517849455_17",
			fileType: "change",
			reference: "sap.ui.fl.test.1",
			layer: "CUSTOMER"
		},
		variant1: {
			fileName: "id_1445501120486_27",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		variant2: {
			fileName: "id_1445501120486_28",
			fileType: "ctrl_variant",
			variantManagementReference: "variantManagement0",
			variantReference: "variantManagement0"
		},
		variantChange1: {
			fileName: "id_1507716136285_38_setTitle",
			fileType: "ctrl_variant_change",
			changeType: "setTitle",
			selector: {
				id: "id_1445501120486_27"
			}
		},
		variantManagementChange: {
			fileName: "id_1510920910626_29_setDefault",
			fileType: "ctrl_variant_management_change",
			changeType: "setDefault",
			selector: {
				id: "variantManagement0"
			}
		}
	};

	function parameterizedTest(oApplyStorageConnector, oWriteStorageConnector, sStorage) {
		QUnit.module("loadFlexData: Given some changes in the " + sStorage, {
			before: function() {
				this.oOriginalStorageState = {};
				this.oOriginalStorageState = merge({}, oApplyStorageConnector.oStorage);
				oApplyStorageConnector.oStorage.clear();

				oWriteStorageConnector.saveChange(oTestData.change1.fileName, oTestData.change1);
				oWriteStorageConnector.saveChange(oTestData.change2.fileName, oTestData.change2);
				oWriteStorageConnector.saveChange(oTestData.change3.fileName, oTestData.change3);
				oWriteStorageConnector.saveChange(oTestData.variant1.fileName, oTestData.variant1);
				oWriteStorageConnector.saveChange(oTestData.variant2.fileName, oTestData.variant2);
				oWriteStorageConnector.saveChange(oTestData.variantChange1.fileName, oTestData.variantChange1);
				oWriteStorageConnector.saveChange(oTestData.variantManagementChange.fileName, oTestData.variantManagementChange);
			},
			beforeEach: function() {
				this.oCreateMapStub = sandbox.stub(BrowserStorageUtils, "createChangesMapWithVariants").returns("returnValue");
				this.oAddChangesStub = sandbox.stub(BrowserStorageUtils, "addChangesToMap");
				this.oSortChangesStub = sandbox.stub(BrowserStorageUtils, "sortChanges");
				this.oAssignReferencedChangesStub = sandbox.stub(BrowserStorageUtils, "assignVariantReferenceChanges");
			},
			after: function() {
				oApplyStorageConnector.oStorage.clear();
				oApplyStorageConnector = this.oOriginalStorageState;
			},
			afterEach: function() {
				sandbox.restore();
			}
		}, function () {
			QUnit.test("when loadFlexData is called without filter parameters", function(assert) {
				return oApplyStorageConnector.loadFlexData({}).then(function(vValue) {
					assert.equal(vValue, "returnValue", "the return value of the Utils methods is returned");
					assert.equal(this.oCreateMapStub.callCount, 1, "createChangesMapWithVariants was called");
					assert.deepEqual(this.oCreateMapStub.lastCall.args[0].length, 2, "2 variants were passed");
					assert.equal(this.oAddChangesStub.callCount, 1, "addChangesToMap was called");
					assert.deepEqual(this.oAddChangesStub.lastCall.args[0], "returnValue", "the just created changes map was passed");

					var oGroupedChanges = this.oAddChangesStub.lastCall.args[1];
					assert.equal(oGroupedChanges.uiChanges.length, 3, "there are 3 ui changes");
					assert.equal(oGroupedChanges.controlVariantChanges.length, 1, "there is 1 control variant change");
					assert.equal(oGroupedChanges.controlVariantManagementChanges.length, 1, "there is 1 control variant management change");

					assert.equal(this.oSortChangesStub.callCount, 1, "sortChanges was called");
					assert.equal(this.oAssignReferencedChangesStub.callCount, 1, "assignVariantReferenceChanges was called");
				}.bind(this));
			});

			QUnit.test("when loadFlexData is called with a layer", function(assert) {
				return oApplyStorageConnector.loadFlexData({layer: "USER"}).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 1, "1 change is passed");

					return oApplyStorageConnector.loadFlexData({layer: "CUSTOMER"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 2, "2 changes are passed");

					return oApplyStorageConnector.loadFlexData({layer: "VENDOR"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 0, "no changes are passed");
				}.bind(this));
			});

			QUnit.test("when loadFlexData is called with a reference", function(assert) {
				return oApplyStorageConnector.loadFlexData({reference: "sap.ui.fl.test"}).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 2, "2 changes are passed");

					return oApplyStorageConnector.loadFlexData({reference: "sap.ui.fl.test.1"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 1, "1 change is passed");

					return oApplyStorageConnector.loadFlexData({reference: "sap.ui.fl.test.2"});
				}.bind(this)).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 0, "no changes are passed");
				}.bind(this));
			});

			QUnit.test("when loadFlexData is called with a layer and a reference", function(assert) {
				return oApplyStorageConnector.loadFlexData({layer: "CUSTOMER", reference: "sap.ui.fl.test"}).then(function() {
					assert.equal(this.oAddChangesStub.lastCall.args[1].uiChanges.length, 1, "1 change is passed");
				}.bind(this));
			});
		});
	}

	parameterizedTest(SessionStorageConnector, SessionStorageWriteConnector, "SessionStorage");
	parameterizedTest(LocalStorageConnector, LocalStorageWriteConnector, "LocalStorage");
	parameterizedTest(JsObjectConnector, JsObjectWriteConnector, "JsObjectStorage");

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
