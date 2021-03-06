/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/hasStableId",
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/sinon-4"
],
function (
	hasStableId,
	Log,
	UIComponent,
	ComponentContainer,
	DesignTime,
	OverlayRegistry,
	VerticalLayout,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Control with unstable ID", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new VerticalLayout();
				}
			});

			this.oComponent = new FixtureComponent();
			this.oLayout = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when hasStableId is called", function (assert) {
			var oStub = sandbox.stub(Log, "warning")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes("Control ID was generated dynamically by SAPUI5");
					})
				)
				.returns();

			assert.strictEqual(hasStableId(this.oLayoutOverlay), false);
			assert.strictEqual(oStub.callCount, 1);
		});

		QUnit.test("when hasStableId is called with high severity", function (assert) {
			var oStub = sandbox.stub(Log, "error")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes("Control ID was generated dynamically by SAPUI5");
					})
				)
				.returns();

			assert.strictEqual(hasStableId(this.oLayoutOverlay, /* Suppress = */ false, "error"), false);
			assert.strictEqual(oStub.callCount, 1);
		});

		QUnit.test("when hasStableId is called multiple times, the following values must be taken from cache", function (assert) {
			var oStub = sandbox.stub(Log, "warning")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes("Control ID was generated dynamically by SAPUI5");
					})
				)
				.returns();

			hasStableId(this.oLayoutOverlay);
			hasStableId(this.oLayoutOverlay);
			hasStableId(this.oLayoutOverlay);

			assert.strictEqual(oStub.callCount, 1);
		});

		QUnit.test("when hasStableId is called multiple times with cache flush parameter", function (assert) {
			var oStub = sandbox.stub(Log, "warning")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes("Control ID was generated dynamically by SAPUI5");
					})
				)
				.returns();

			hasStableId(this.oLayoutOverlay, /* Suppress = */false, /* Error type = */"warning", true);
			hasStableId(this.oLayoutOverlay, /* Suppress = */false, /* Error type = */"warning", true);
			hasStableId(this.oLayoutOverlay, /* Suppress = */false, /* Error type = */"warning", true);

			assert.strictEqual(oStub.callCount, 3);
		});
	});

	QUnit.module("Control with stable ID", {
		beforeEach: function (assert) {
			var fnDone = assert.async();

			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function () {
					return new VerticalLayout("layout");
				}
			});

			this.oComponent = new FixtureComponent();
			this.oLayout = this.oComponent.getRootControl();

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oLayout
				]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);
		},
		afterEach: function () {
			this.oDesignTime.destroy();
			this.oComponentContainer.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when hasStableId is called", function (assert) {
			var oStub = sandbox.stub(Log, "warning")
				.callThrough()
				.withArgs(
					sinon.match(function (sMessage) {
						return sMessage.includes("Control ID was generated dynamically by SAPUI5");
					})
				)
				.returns();

			assert.strictEqual(hasStableId(this.oLayoutOverlay), true);
			assert.strictEqual(oStub.callCount, 0);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
