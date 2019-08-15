                    iDragObject: function () {
                    return this.waitFor({
                        controlType: "sap.m.CustomListItem",
                        viewName: sViewName,
                        matchers: function (aCollectionOfObjects) {
                            return aCollectionOfObjects.$().hasClass("dragObjectsYouWant");
                        },
                        success: function (aDraggableObjects) {

                            //Trigger the corresponding oEvents to simulate drag and drop
                            //i.e) dragstart, dragenter and drop
                            var oDraggableElement = aDraggableObjects[0];
                            var oEvent = createjQueryDragEventDummy("dragstart", oDraggableElement);
                            DragAndDrop.preprocessEvent(oEvent);
                            oDraggableElement.$().trigger(oEvent);
                            Opa5.assert.ok(oEvent.dragSession, "Drag session Started");

                            this.waitFor({
                                controlType: "sap.m.CustomListItem",
                                viewName: sViewName,
                                matchers: function (aCollectionOfObjects) {
                                    
                                    return aOutboundLocomotives.$().hasClass("droppableZone");
                                },
                                success: function (aCollectionDropZones) {

                                    //Verify if the outbound list is empty
                                    var oDropZone = aCollectionDropZones[0];
                                    Opa5.assert.ok(oDropZone.$().attr("data-state") == "available" ,"Drop zone is available");


                                    //Simulate the dragging to the outbout and drop
                                    oEvent = createjQueryDragEventDummy("dragenter", oDropZone);
                                    DragAndDrop.preprocessEvent(oEvent);
                                    oDropZone.$().trigger("drop");
            
                                },
                                errorMessage:"Drop Zone is not available"
                            });



                        },
                        errorMessage: "Inbound locomotive not dragged"
                    });
                }
                }
