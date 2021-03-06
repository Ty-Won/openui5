/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LrepConnector",
	"sap/ui/thirdparty/sinon-4"
], function(
	jQuery,
	Settings,
	Cache,
	Utils,
	LrepConnector,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.registry.Settings", {
		beforeEach: function() {
			var oSettings = {
				isKeyUser: false,
				isAtoAvailable: false,
				isAtoEnabled: false,
				features: {
					addField: ["CUSTOMER", "VENDOR"],
					changeTypeOnlyForUser: ["USER"],
					completelyDisabledChangeType: []
				}
			};
			this.cut = new Settings(oSettings);
		},
		afterEach: function() {
			Settings._instance = undefined;

			sandbox.restore();
		}
	}, function() {
		QUnit.test("init", function(assert) {
			assert.ok(this.cut._oSettings);
		});

		QUnit.test("isKeyUser", function(assert) {
			assert.equal(this.cut._oSettings.isKeyUser, false);
			var bIsKeyUser = this.cut.isKeyUser();
			assert.equal(bIsKeyUser, false);
		});

		QUnit.test("isModelS", function(assert) {
			assert.equal(this.cut._oSettings.isAtoAvailable, false);
			var bIsModelS = this.cut.isModelS();
			assert.equal(bIsModelS, false);
		});

		QUnit.test("isAtoEnabled", function(assert) {
			assert.equal(this.cut._oSettings.isAtoEnabled, false);
			var bIsAtoEnabled = this.cut.isAtoEnabled();
			assert.equal(bIsAtoEnabled, false);
		});

		QUnit.test("variants sharing is enabled by default", function(assert) {
			assert.equal(this.cut._oSettings.isVariantSharingEnabled, true);
			var bIsVariantSharingEnabled = this.cut.isVariantSharingEnabled();
			assert.equal(bIsVariantSharingEnabled, true);
		});

		QUnit.test("variants sharing is set to false", function(assert) {
			var oSettings = {
				isVariantSharingEnabled: false
			};
			this.cut = new Settings(oSettings);
			assert.equal(this.cut._oSettings.isVariantSharingEnabled, false);
			var bIsVariantSharingEnabled = this.cut.isVariantSharingEnabled();
			assert.equal(bIsVariantSharingEnabled, false);
		});

		QUnit.test("get instance from flex settings request when flex data promise is not available", function(assert) {
			var done = assert.async();

			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};

			var oStubCreateConnector = sandbox.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
				loadSettings : function() {
					return Promise.resolve(oSetting);
				}
			});
			var oStubGetFlexDataPromise = sandbox.stub(Cache, "getFlexDataPromise").returns(undefined);
			Settings.getInstance().then(function(oSettings) {
				assert.equal(oStubGetFlexDataPromise.callCount, 1);
				assert.equal(oStubCreateConnector.callCount, 1);
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oStubCreateConnector.callCount, 1);
					assert.equal(oSettings, oSettings2);
					oStubCreateConnector.restore();
					oStubGetFlexDataPromise.restore();
					done();
				});
			});
		});

		QUnit.test("get instance from flex settings request when flex data promise is rejected", function(assert) {
			var done = assert.async();

			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};
			var oStubCreateConnector = sandbox.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
				loadSettings : function() {
					return Promise.resolve(oSetting);
				}
			});
			var oStubGetFlexDataPromise = sandbox.stub(Cache, "getFlexDataPromise").rejects();
			Settings.getInstance().then(function(oSettings) {
				assert.equal(oStubGetFlexDataPromise.callCount, 1);
				assert.equal(oStubCreateConnector.callCount, 1);
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oStubCreateConnector.callCount, 1);
					assert.equal(oSettings, oSettings2);
					oStubCreateConnector.restore();
					oStubGetFlexDataPromise.restore();
					done();
				});
			});
		});

		QUnit.test("get instance from cache when flex data promise is resolved", function(assert) {
			var done = assert.async();

			var oFileContent = {
				changes: {
					settings: {
						isKeyUser: true,
						isAtoAvailable: true
					}
				}
			};
			var oStubGetFlexDataPromise = sandbox.stub(Cache, "getFlexDataPromise").resolves(oFileContent);
			Settings.getInstance().then(function(oSettings) {
				assert.equal(oStubGetFlexDataPromise.callCount, 1);
				assert.equal(oSettings.isKeyUser(), true);
				assert.equal(oSettings.isModelS(), true);
				Settings.getInstance().then(function(oSettings2) {
					assert.equal(oSettings, oSettings2);
					oStubGetFlexDataPromise.restore();
					done();
				});
			});
		});

		QUnit.test("getInstanceOrUndef", function(assert) {
			var done = assert.async();

			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true
			};
			var oStubCreateConnector = sandbox.stub(sap.ui.fl.LrepConnector, "createConnector").returns({
				loadSettings : function() {
					return Promise.resolve(oSetting);
				}
			});
			var oSettings0 = Settings.getInstanceOrUndef();
			assert.ok(!oSettings0);
			Settings.getInstance().then(function(oSettings1) {
				assert.ok(oSettings1);
				assert.equal(oStubCreateConnector.callCount, 1);
				var oSettings2 = Settings.getInstanceOrUndef();
				assert.equal(oSettings1, oSettings2);
				assert.equal(oStubCreateConnector.callCount, 1);
				oStubCreateConnector.restore();
				done();
			});
		});
	});

	QUnit.module("Given that Settings file is loaded", {
		afterEach: function() {
			delete Settings._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and the system is a trial system", function(assert) {
			assert.notOk(Settings.getInstanceOrUndef(), "initially the instance is undefined");

			// call initialize function again to initialize with trial
			sandbox.stub(Utils, "isTrialSystem").returns(true);
			Settings._initInstance();

			var oSettings = Settings.getInstanceOrUndef();
			assert.ok(oSettings, "the settings instance is available");
			assert.equal(oSettings.isKeyUser(), true);
			assert.equal(oSettings.isAtoAvailable(), false);
			assert.equal(oSettings.isAtoEnabled(), false);
			assert.equal(oSettings.isProductiveSystem(), false);
			assert.equal(oSettings.isVariantSharingEnabled(), false);
		});
	});

	QUnit.module("Given that Settings loading failed", {
		afterEach: function() {
			delete Settings._instance;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("a default response is resolving the request", function(assert) {
			var oLrepConnector = new LrepConnector();
			sandbox.stub(oLrepConnector, "loadSettings").resolves();
			sandbox.stub(LrepConnector, "createConnector").returns(oLrepConnector);

			return Settings.getInstance().then(function (oSettings) {
				assert.ok(oSettings, "the settings instance is available");
				assert.equal(oSettings.isKeyUser(), false);
				assert.equal(oSettings.isAtoAvailable(), false);
				assert.equal(oSettings.isAtoEnabled(), false);
				assert.equal(oSettings.isProductiveSystem(), true);
				assert.equal(oSettings.isVariantSharingEnabled(), false);
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
