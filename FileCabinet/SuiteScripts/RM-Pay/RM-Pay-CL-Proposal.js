/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *@NModuleScope SameAccount
 */
define([
  "N/url",
  "N/currentRecord",
  "N/record",
  "N/runtime",
  "N/search",
], function (url, currentRecord, record, runtime, search) {
  var suitelet;
  var overlay;
  var globalCurrentUser = runtime.getCurrentUser();

  var PaymentApprovalSts = {
    PendingFirstApproval: 1,
    PendingSecondApproval: 5,
    PendingFinalApproval: 6,
    Approved: 2,
    Failed: 4,
    Rejected: 3,
  };
  function pageInit(context) {
    try {
      getHtmlContent();
      disableCheckboxesbasedOnRoles(context);
    } catch (error) {
      alert("Error in PageInit==>" + error);
    }
  }

  function disableCheckboxesbasedOnRoles(context) {
    try {
      var objRecord = context.currentRecord;
      // Get the current user
      var currentUser = runtime.getCurrentUser();

      // Get the current role's ID
      var roleId = currentUser.role;

      //Disabling first approver tab checkboxes
      var numLinesFirstApprover = objRecord.getLineCount({
        sublistId: "custpage_pending_first_approver",
      });

      for (var y = 0; y < numLinesFirstApprover; y++) {
        var firstApproverVal = objRecord.getSublistValue({
          sublistId: "custpage_pending_first_approver",
          fieldId: "custpage_first_approver_val",
          line: y,
        });

        if (firstApproverVal) {
          if (Number(firstApproverVal) === roleId || roleId === 3) {
            // Check if the user has the "Administrator" role OR if firstApproverVal matches the current role ID
            var selectChkBox = objRecord.getSublistField({
              sublistId: "custpage_pending_first_approver",
              fieldId: "custpage_select",
              line: y,
            });

            selectChkBox.isDisabled = false; // Enable the checkbox
          } else {
            var selectChkBox = objRecord.getSublistField({
              sublistId: "custpage_pending_first_approver",
              fieldId: "custpage_select",
              line: y,
            });

            selectChkBox.isDisabled = true; // Disable the checkbox
          }
        }
      }
      //Disabling second approver tab checkboxes
      var numLinesSecondApprover = objRecord.getLineCount({
        sublistId: "custpage_pending_second_approver",
      });

      for (var z = 0; z < numLinesSecondApprover; z++) {
        var secondApproverVal = objRecord.getSublistValue({
          sublistId: "custpage_pending_second_approver",
          fieldId: "custpage_second_approver_val",
          line: z,
        });

        if (secondApproverVal) {
          if (Number(secondApproverVal) === roleId || roleId === 3) {
            // Check if the user has the "Administrator" role OR if secondApproverVal matches the current role ID
            var selectChkBox = objRecord.getSublistField({
              sublistId: "custpage_pending_second_approver",
              fieldId: "custpage_select",
              line: z,
            });

            selectChkBox.isDisabled = false; // Enable the checkbox
          } else {
            var selectChkBox = objRecord.getSublistField({
              sublistId: "custpage_pending_second_approver",
              fieldId: "custpage_select",
              line: z,
            });

            selectChkBox.isDisabled = true; // Disable the checkbox
          }
        }
      }

      //Disabling final approver tab checkboxes
      var numLinesFinalApprover = objRecord.getLineCount({
        sublistId: "custpage_pending_final_approver",
      });

      for (var x = 0; x < numLinesFinalApprover; x++) {
        var finalApproverVal = objRecord.getSublistValue({
          sublistId: "custpage_pending_final_approver",
          fieldId: "custpage_final_approver_val",
          line: x,
        });

        if (finalApproverVal) {
          // Check if the user has the "Administrator" role OR if finalApproverVal matches the current role ID
          if (Number(finalApproverVal) === roleId || roleId === 3) {
            var selectChkBox = objRecord.getSublistField({
              sublistId: "custpage_pending_final_approver",
              fieldId: "custpage_select",
              line: x,
            });

            selectChkBox.isDisabled = false; // Enable the checkbox
          } else {
            var selectChkBox = objRecord.getSublistField({
              sublistId: "custpage_pending_final_approver",
              fieldId: "custpage_select",
              line: x,
            });

            selectChkBox.isDisabled = true; // Disable the checkbox
          }
        }
      }
    } catch (error) {
      alert("Error in disableCheckboxesbasedOnRoles==>" + error);
    }
  }
  function backButton() {
    history.back();
  }

  function preview() {
    window.onbeforeunload = null; //Remove redirect alert
    var currentRec = currentRecord.get();
    var selectedLine = [];
    selectedLine = selectLines(
      "custpage_pending_first_approver",
      selectedLine,
      currentRec
    );
    console.log("selectedLine1", selectedLine);
    selectedLine = selectLines(
      "custpage_pending_second_approver",
      selectedLine,
      currentRec
    );
    console.log("selectedLine2", selectedLine);
    selectedLine = selectLines(
      "custpage_pending_final_approver",
      selectedLine,
      currentRec
    );
    console.log("selectedLine3", selectedLine);
    selectedLine = selectLines("custpage_approved", selectedLine, currentRec);
    console.log("selectedLine4", selectedLine);
    selectedLine = selectLines("custpage_rejected", selectedLine, currentRec);
    console.log("selectedLine5", selectedLine);

    if (selectedLine.length != 0) {
      var currentUrl = document.location.href;
      currentUrl = currentUrl + "&selectedLine=" + JSON.stringify(selectedLine);
      window.location = currentUrl;
    } else {
      alert("Please select one line to preview.");
      return false;
    }
  }

  function selectLines(sublistName, selectedLine, currentRec) {
    var count = currentRec.getLineCount({
      sublistId: sublistName,
    });
    for (var i = count - 1; i >= 0; i--) {
      var select = currentRec.getSublistValue(
        sublistName,
        "custpage_select",
        i
      );
      var lineKey = currentRec.getSublistValue(
        sublistName,
        "custpage_internalid",
        i
      );
      console.log("select", select);
      if (select == true) {
        selectedLine.push(lineKey);
      }
    }
    console.log("selectedLine2", selectedLine);
    return selectedLine;
  }

  function clear() {
    //window.location = "/app/site/hosting/scriptlet.nl?script=196&deploy=1";
    var suiteletUrl = url.resolveScript({
      scriptId: "customscript_rm_rmpay_suitlet",
      deploymentId: "customdeploy_rmpay_suitlet",
    });
    window.location = suiteletUrl;
  }

  function reviewApproveReject() {
    var currentRec = currentRecord.get();

    var returnObj = {
      lineDetailed: [],
      lineApproved: [],
      lineRejected: [],
      lineDetaileId: [],
      lineDetailNumber: [],
      rejReasonValidation: [],
      lineStatus: [],
    };
    returnObj = selectedLineForRevAppRej(
      "custpage_pending_first_approver",
      returnObj,
      currentRec
    );
    console.log("returnObj1", returnObj);
    returnObj = selectedLineForRevAppRej(
      "custpage_pending_second_approver",
      returnObj,
      currentRec
    );
    console.log("returnObj2", returnObj);
    returnObj = selectedLineForRevAppRej(
      "custpage_pending_final_approver",
      returnObj,
      currentRec
    );
    console.log("returnObj3", returnObj);
    if (
      returnObj.lineApproved.length != 0 ||
      returnObj.lineRejected.length != 0 ||
      returnObj.lineDetailed.length != 0
    ) {
      var confirmButtonPressed = confirm(
        "Are you sure you want to perform this action?"
      );
      if (!confirmButtonPressed) {
        // User clicked "Cancel" or closed the dialog
        return; // Stay on the same page or perform other actions as needed
      }
    }
    if (
      returnObj.lineApproved.length == 0 &&
      returnObj.lineRejected.length == 0 &&
      returnObj.lineDetailed.length == 0
    ) {
      alert("Please select any one option from sublist.");
    } else if (returnObj.rejReasonValidation.length !== 0) {
      alert(
        "Enter Rejection Reasons for the following Sales Order : " +
          returnObj.rejReasonValidation
      );
      return false;
    } else {
      var commonArray = [];
      if (
        returnObj.lineApproved.length != 0 ||
        returnObj.lineRejected.length != 0
      ) {
        console.log("entry to approve/rej");
        commonArray = approveReject(returnObj);
        // if (returnObj.lineDetailed.length == 0) {
        //   // redirectToScreenTwo();
        //   reloadPageWithoutAlert(); //After Approve/Reject reload page
        // }
      }
      if (returnObj.lineDetailed.length != 0) {
        if (commonArray.length == 0) {
          //window.location = "/app/site/hosting/scriptlet.nl?script=207&deploy=1&poIds=" + JSON.stringify(returnObj.lineDetaileId) + "&poNumbers=" + JSON.stringify(returnObj.lineDetailNumber)
          //window.open("/app/site/hosting/scriptlet.nl?script=207&deploy=1&poIds="+JSON.stringify(returnObj.lineDetaileId)+"&poNumbers="+JSON.stringify(returnObj.lineDetailNumber),"","width=1000,height=800")
          /*var suiteletUrl = url.resolveScript({
                          scriptId: 'customscript_rm_rmpay_detailed_view',
                          deploymentId: 'customdeploy_rm_rmpay_detailed_view'
                      });*/
          var suiteletUrl = url.resolveScript({
            scriptId: "customscript_rmpay_paymentreview",
            deploymentId: "customdeploy_rmpay_paymentreview",
          });
          suiteletUrl += "&poIds=" + JSON.stringify(returnObj.lineDetaileId);
          suiteletUrl +=
            "&poNumbers=" + JSON.stringify(returnObj.lineDetailNumber);
          // suiteletUrl += "&poStatus=" + JSON.stringify(returnObj.lineStatus);
          console.log("suitelet2", suiteletUrl);
          //window.open(suiteletUrl,"","width=1000,height=800")
          // window.open(suiteletUrl);
          window.onbeforeunload = null; //Remove redirect alert
          window.location = suiteletUrl;
        }
      }
    }
  }

  function selectedLineForRevAppRej(sublistName, returnObj, currentRec) {
    var count = currentRec.getLineCount({
      sublistId: sublistName,
    });
    var poArr = [];
    for (var i = count - 1; i >= 0; i--) {
      var detailedViewSelect = currentRec.getSublistValue(
        sublistName,
        "custpage_detail_review",
        i
      );
      var approveSelect = currentRec.getSublistValue(
        sublistName,
        "custpage_approve",
        i
      );
      var rejecteSelect = currentRec.getSublistValue(
        sublistName,
        "custpage_reject",
        i
      );
      var lineKey = currentRec.getSublistValue(
        sublistName,
        "custpage_internalid",
        i
      );
      var poId = currentRec.getSublistValue(
        sublistName,
        "custpage_internalid",
        i
      );
      var poNumb = currentRec.getSublistValue(
        sublistName,
        "custpage_proposal_id",
        i
      );
      var status = currentRec.getSublistValue(
        sublistName,
        "custpage_status",
        i
      );
      var statusVal = currentRec.getSublistValue(
        sublistName,
        "custpage_status_val",
        i
      );
      var rejectReason = currentRec.getSublistText(
        sublistName,
        "custpage_reject_reason",
        i
      );

      returnObj.lineStatus.push(statusVal);

      if (detailedViewSelect == true) {
        //returnObj.lineDetailed.push(lineKey);
        returnObj.lineDetailed.push({ id: lineKey, status: status });
        returnObj.lineDetaileId.push(poId);
        returnObj.lineDetailNumber.push(poNumb);
      }
      if (approveSelect == true) {
        //returnObj.lineApproved.push(poId);
        returnObj.lineApproved.push({
          id: poId,
          status: status,
          poNumber: poNumb,
          statusVal: statusVal,
        });
      }
      if (rejecteSelect == true) {
        //returnObj.lineRejected.push(poId);
        returnObj.lineRejected.push({
          id: poId,
          rejectReason: rejectReason,
          status: status,
          poNumber: poNumb,
          statusVal: statusVal,
        });
      }
      if (rejecteSelect == true && !rejectReason) {
        //poArr.push(poNumb);
        returnObj.rejReasonValidation.push(poNumb);
      }
    }
    if (poArr.length !== 0) {
      alert(
        "Enter Rejection Reasons for the following Proposal Order : " + poArr
      );
      return false;
    }
    console.log("returnObj", JSON.stringify(returnObj));

    return returnObj;
  }

  function selectedLineForScreenThree(
    sublistName,
    returnObj,
    currentRec,
    poId,
    ButtonName
  ) {
    var count = currentRec.getLineCount({
      sublistId: sublistName,
    });
    for (var i = count - 1; i >= 0; i--) {
      var approveSelect = currentRec.getSublistValue(
        sublistName,
        "custpage_select",
        i
      );
      var id = currentRec.getSublistValue(
        sublistName,
        "custrecord_rmpay_child_id_" + poId,
        i
      );
      if (
        approveSelect == true &&
        (ButtonName == "approve" ||
          ButtonName == "reject" ||
          ButtonName == "save")
      ) {
        returnObj.selectedData.push(id);
      }
    }
    console.log("returnObj", JSON.stringify(returnObj));
    return returnObj;
  }

  function approveReject(returnObj) {
    try {
      var app = returnObj.lineApproved;
      var rej = returnObj.lineRejected;
      var line_Status = returnObj.lineStatus;
      console.log("app", app);
      console.log("rej", rej);
      var poApprovedArr = [];
      var poRejectedArr = [];
      var commonArray = CommonItemsArray(app, rej);
      if (commonArray.length != 0) {
        alert(
          "We can not select Approve and Reject for same Proposal. " +
            commonArray
        );
      } else {
        var flagCustRecord = 0;
        for (var i = 0; i < app.length; i++) {
          var poApproved = returnObj.lineApproved[i].poNumber;
          poApprovedArr.push(poApproved);

          var paymentproposalValues = search.lookupFields({
            type: "customrecord_rmpay_payment_proposal",
            id: app[i].id,
            columns: ["custrecord_rmpay_pp_status"], // You can include multiple field IDs in the array if needed.
          });

          if (paymentproposalValues.length !== 0) {
            var PP_Status =
              paymentproposalValues.custrecord_rmpay_pp_status[0].text;

            if (PP_Status === app[i].status) {
              var poRec = record.load({
                type: "customrecord_rmpay_payment_proposal",
                id: app[i].id,
              });

              var paymentProposalBillCount = poRec.getLineCount({
                sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
              });

              var button_Pressed = "approve";
              var rejectionReason = "";
              if (app.length > 10 || paymentProposalBillCount > 10) {
                createPaymentProposalProcessingRecord(
                  poRec,
                  button_Pressed,
                  rejectionReason
                );
                flagCustRecord++;
              } else {
                var poRecStatus = app[i].statusVal;

                var newStatus =
                  setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove(
                    poRec,
                    poRecStatus
                  );

                setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove(
                  poRec,
                  newStatus
                );

                var rec_id = poRec.save({
                  enableSourcing: true,
                  ignoreMandatoryFields: true,
                });
              }
            } else {
              alert(
                "The original status is changed so you cannot perform this action now."
              );
              reloadPageWithoutAlert();
            }
          }
        }

        for (var i = 0; i < rej.length; i++) {
          var poRejected = returnObj.lineRejected[i].poNumber;
          poRejectedArr.push(poRejected);

          var paymentproposal_Values = search.lookupFields({
            type: "customrecord_rmpay_payment_proposal",
            id: rej[i].id,
            columns: ["custrecord_rmpay_pp_status"], // You can include multiple field IDs in the array if needed.
          });

          if (paymentproposal_Values.length !== 0) {
            var PP_Stats =
              paymentproposal_Values.custrecord_rmpay_pp_status[0].text;
            if (PP_Stats === rej[i].status) {
              var poRec = record.load({
                type: "customrecord_rmpay_payment_proposal",
                id: rej[i].id,
              });

              var paymentProposalBillCount = poRec.getLineCount({
                sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
              });

              var button_Pressed = "reject";
              var rejectionReason = rej[i].rejectReason;

              if (rej.length > 10 || paymentProposalBillCount > 10) {
                createPaymentProposalProcessingRecord(
                  poRec,
                  button_Pressed,
                  rejectionReason
                );
                flagCustRecord++;
              } else {
                setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
                  poRec,
                  rejectionReason
                );

                setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnReject(
                  poRec
                );
                var rec_id = poRec.save({
                  enableSourcing: true,
                  ignoreMandatoryFields: true,
                });
              }
            } else {
              alert(
                "The original status is changed so you cannot perform this action now."
              );
              reloadPageWithoutAlert();
            }
          }
        }

        if (flagCustRecord != 0) {
          alert(
            "Your data will be processed in background for " +
              flagCustRecord +
              " records by map reduce script as the selected entries have more than 10 bills in that and it will take upto 15 min of time. Please do not resubmit for approval."
          );
        }
        redirectToScreenTwo();
      }
      return commonArray;
    } catch (error) {
      alert("Error in approveReject()" + error);
    }
  }

  function CommonItemsArray(array_1, array_2) {
    var commonArray = []; // Create an array for common items in another two arrays.
    for (var i = 0; i < array_1.length; i++) {
      for (var j = 0; j < array_2.length; j++) {
        if (array_1[i] == array_2[j]) {
          // If the item is common in both arrays
          commonArray.push(array_1[i]); // Push common items to the array
        }
      }
    }
    return commonArray; // Return the common items
  }

  function fieldChanged(scriptContext) {
    if (scriptContext.fieldId == "custpage_approve") {
      var lineNum = scriptContext.currentRecord.getCurrentSublistIndex(
        scriptContext.sublistId
      );

      var val = scriptContext.currentRecord.getSublistValue({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_approve",
        line: lineNum,
      });
      console.log("lineNum", lineNum);
      var rej = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_reject",
        line: lineNum,
      });
      var detailed = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_detail_review",
        line: lineNum,
      });
      if (val == true) {
        rej.isDisabled = true;
        detailed.isDisabled = true;
      } else {
        rej.isDisabled = false;
        detailed.isDisabled = false;
      }
    }
    if (scriptContext.fieldId == "custpage_reject") {
      var lineNum = scriptContext.currentRecord.getCurrentSublistIndex(
        scriptContext.sublistId
      );
      var val = scriptContext.currentRecord.getSublistValue({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_reject",
        line: lineNum,
      });
      console.log("lineNum", lineNum);
      var appr = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_approve",
        line: lineNum,
      });
      var detailed = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_detail_review",
        line: lineNum,
      });
      var rejectReason = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_reject_reason",
        line: lineNum,
      });
      if (val == true) {
        appr.isDisabled = true;
        detailed.isDisabled = true;
        rejectReason.isDisabled = false;
      } else {
        appr.isDisabled = false;
        detailed.isDisabled = false;
        rejectReason.isDisabled = true;
        scriptContext.currentRecord.setCurrentSublistValue({
          sublistId: scriptContext.sublistId,
          fieldId: "custpage_reject_reason",
          line: lineNum,
          value: "",
        });
      }
    }
    if (scriptContext.fieldId == "custpage_detail_review") {
      var lineNum = scriptContext.currentRecord.getCurrentSublistIndex(
        scriptContext.sublistId
      );
      var val = scriptContext.currentRecord.getSublistValue({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_detail_review",
        line: lineNum,
      });
      console.log("lineNum", lineNum);
      var rej = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_reject",
        line: lineNum,
      });
      var appr = scriptContext.currentRecord.getSublistField({
        sublistId: scriptContext.sublistId,
        fieldId: "custpage_approve",
        line: lineNum,
      });
      if (val == true) {
        rej.isDisabled = true;
        appr.isDisabled = true;
      } else {
        rej.isDisabled = false;
        appr.isDisabled = false;
      }
    }
    return true;
  }

  function reloadPageWithoutAlert() {
    window.onbeforeunload = null; // Disable the default "beforeunload" event handler
    location.reload();
  }

  function actionScreenThree(tabNumber, ButtonName, poId, poNumber) {
    try {
      var rejectionNote = "";
      var currentRec = currentRecordGet();
      var returnObj = selectedLineForScreenThree(
        "custtab_" + poId,
        { selectedData: [] },
        currentRec,
        poId,
        ButtonName
      );

      showDialogWithGif();

      setTimeout(function () {
        console.log("overlay2", "");
        // custfun()   //First Fun

        rejectionNote = isActionConfirmed(ButtonName, rejectionNote);
        if (rejectionNote == "" || !rejectionNote) {
          hideOverlay();
          return;
        }

        setTimeout(function () {
          showDialogWithGif();
          console.log("overlay3", "");

          setTimeout(function () {
            console.log("overlay4", "");
            if (
              returnObj.selectedData.length === 0 &&
              (ButtonName === "approve" || ButtonName === "save")
            ) {
              // if (!alertConfirm())
              //   rejectPaymentProposalIfSelectedDataIsZero(poId);
              // hideOverlay();
              // return;
              if (alertConfirm()) {
                rejectPaymentProposalIfSelectedDataIsZero(poId, poNumber);
                hideOverlay();
                redirectToScreenTwo();
                return;
              }
            }
            // custfun(); //Second Fun

            setTimeout(function () {
              showDialogWithGif();
              console.log("overlay5", "");

              setTimeout(function () {
                console.log("overlay6", "");
                var poRec = ppRecordLod(poId);
                if (
                  returnObj.selectedData.length > 10 &&
                  (ButtonName == "approve" ||
                    ButtonName == "save" ||
                    ButtonName == "reject")
                ) {
                  createPaymentProposalRecordIfMoreThanTenRecords(
                    poRec,
                    returnObj.selectedData,
                    ButtonName,
                    rejectionNote
                  );
                  hideOverlay();
                  // alert("poId" + poId);
                  // alert("poId .length" + poId.length);
                  var url = removeURLParam(window.location.href, "poIds", poId);
                  url = removeURLParam(url, "poNumbers", poNumber);
                  console.log("url--", url);

                  // alert("url" + url);
                  var ppFLag = redirectToScreenTwoByCheckingURL(url);

                  if (ppFLag == true) {
                    redirectToScreenTwo();
                  } else {
                    location.href = url;
                  }
                  return false;
                }
                // custfun(); //Third Fun

                setTimeout(function () {
                  showDialogWithGif();
                  console.log("overlay7", "");

                  setTimeout(function () {
                    console.log("overlay8", "");
                    // custfun("111", "222121"); //Fourth Fun
                    ProcessPaymentProposalRecordIfLessThanTenRecords(
                      poRec,
                      rejectionNote,
                      ButtonName,
                      poId,
                      returnObj,
                      poNumber
                    );
                    hideOverlay();
                    var url = removeURLParam(
                      window.location.href,
                      "poIds",
                      poId
                    );
                    url = removeURLParam(url, "poNumbers", poNumber);
                    console.log("url--", url);
                    var ppFLag = redirectToScreenTwoByCheckingURL(url);

                    if (ppFLag == true) {
                      redirectToScreenTwo();
                    } else {
                      location.href = url;
                    }

                    //             setTimeout(function () {
                    //               showDialogWithGif();
                    //               console.log("overlay7", "");

                    //               setTimeout(function () {
                    //                 console.log("overlay8", "");
                    //                 custfun("111", "222121"); //Fifth Fun
                    //                 hideOverlay();
                    //               }, 1000);
                    //             }, 1000);
                  }, 1000);
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);

      // var url = removeURLParam(window.location.href, "poIds", poId);
      // url = removeURLParam(url, "poNumbers", poNumber);
      // console.log("url--", url);
      // location.href = url;
    } catch (error) {
      alert("Error In actionScreenThree()" + error);
    }
  }
  function confirmAction(promptText) {
    var confirmButtonPressed = confirm(promptText);
    return confirmButtonPressed;
  }

  function handleReject(rejectionNote) {
    if (!rejectionNote) {
      rejectionNote = prompt("Enter rejection note for proposal:");
      if (!rejectionNote) return false;
    }

    return rejectionNote;
  }

  function isActionConfirmed(ButtonName, rejectionNote) {
    if (ButtonName === "approve") {
      return confirmAction("Are you sure you want to approve?");
    } else if (ButtonName === "save") {
      return confirmAction("Are you sure you want to save?");
    } else if (ButtonName === "reject") {
      return (
        confirmAction("Are you sure you want to reject?") &&
        handleReject(rejectionNote)
      );
    }
    return rejectionNote; // Default to true if ButtonName doesn't match any condition
  }

  function currentRecordGet() {
    return currentRecord.get();
  }

  function createPaymentProposalRecordIfMoreThanTenRecords(
    poRec,
    returnObjSelectedData,
    ButtonName,
    rejectionNote
  ) {
    var unSelectedDataArray = [];

    var poRecCount = poRec.getLineCount({
      sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
    });
    for (var i = 0; i < poRecCount; i++) {
      var billId = poRec.getSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "id",
        line: i,
      });

      if (!returnObjSelectedData.includes(billId)) {
        //Update data in RM Pay - Bills in Payment Proposal
        unSelectedDataArray.push(billId);
      }
    }

    // alert("unSelectedDataArray" + unSelectedDataArray);

    if (returnObjSelectedData.length > 0) {
      createPaymentProposalProcessingRecordForScreenThree(
        poRec,
        returnObjSelectedData,
        ButtonName,
        rejectionNote
      );
    }
  }

  function ProcessPaymentProposalRecordIfLessThanTenRecords(
    poRec,
    rejectionNote,
    ButtonName,
    poId,
    returnObj,
    poNumber
  ) {
    var poRecCount = poRec.getLineCount({
      sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
    });

    var poRecStatus = poRec.getValue("custrecord_rmpay_pp_status");

    var currentRecPPStatusVal = "custrecord_rmpay_pp_status_" + poId;
    var currentRecPPStatus = currentRecord
      .get()
      .getValue(currentRecPPStatusVal);

    if (poRecStatus === currentRecPPStatus) {
      if (poRecCount > 0) {
        if (
          (ButtonName == "approve" ||
            ButtonName == "save" ||
            ButtonName == "reject") &&
          returnObj.selectedData.length > 0
        ) {
          var paymentProposalRecNewStatus = "";
          if (ButtonName == "approve") {
            paymentProposalRecNewStatus =
              setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove(
                poRec,
                poRecStatus
              );
          }
          var numCounter = 0;
          for (var j = 0; j < poRecCount; j++) {
            var id = poRec.getSublistValue({
              sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
              fieldId: "id",
              line: j,
            });

            if (ButtonName == "approve" || ButtonName == "save") {
              if (!returnObj.selectedData.includes(id)) {
                //Update data in RM Pay - Bills in Payment Proposal
                unlinkBillsFromPaymentProposalRecord(id);
              } else {
                // Selected
                //Update RM Pay - Bills in Payment Proposal
                numCounter++;

                if (ButtonName == "approve") {
                  poRec.setSublistValue({
                    sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
                    fieldId: "custrecord_rmpay_bills_pp_status",
                    value: paymentProposalRecNewStatus,
                    line: j,
                  });
                }

                poRec.setSublistValue({
                  sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
                  fieldId: "custrecord_rmpay_bills_pp_number",
                  value: numCounter,
                  line: j,
                });
              }
            } else if (
              ButtonName == "reject" ||
              returnObj.selectedData.length == 0
            ) {
              //Update RM Pay - Bills in Payment Proposal
              setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
                poRec,
                rejectionNote
              );
              unlinkBillsFromPaymentProposalRecord(id);
            }
          }
        }

        // if (ButtonName == "reject" || returnObj.selectedData.length == 0) {
        //   unlinkBillsFromPaymentProposalRecord(id);

        //   setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnReject(
        //     poRec
        //   );
        // }

        var rec_id = poRec.save({
          enableSourcing: true,
          ignoreMandatoryFields: true,
        });
      }

      // var url = removeURLParam(window.location.href, "poIds", poId);
      // url = removeURLParam(url, "poNumbers", poNumber);
      // console.log("url--", url);
      // location.href = url;
    } else {
      alert(
        "The original status is changed so you cannot perform this action now."
      );
      reloadPageWithoutAlert();
    }
  }

  function ppRecordLod(poId) {
    return record.load({
      type: "customrecord_rmpay_payment_proposal",
      id: poId,
    });
  }

  function rejectPaymentProposalIfSelectedDataIsZero(poId, poNumber) {
    try {
      var rejectionNote = "Rejected by uncheck";
      var unSelectedDataArray = [];
      var poRec = ppRecordLod(poId);
      var poRecCount = poRec.getLineCount({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
      });
      if (poRecCount < 10) {
        for (var i = 0; i < poRecCount; i++) {
          var billId = poRec.getSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "id",
            line: i,
          });

          unlinkBillsFromPaymentProposalRecord(billId);
        }
        //Update RM Pay - Bills in Payment Proposal
        setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
          poRec,
          rejectionNote
        );
      } else if (poRecCount > 10) {
        for (var i = 0; i < poRecCount; i++) {
          var billId = poRec.getSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "id",
            line: i,
          });
          unSelectedDataArray.push(billId);
        }
        createPaymentProposalProcessingRecordForScreenThree(
          poRec,
          unSelectedDataArray,
          "reject",
          rejectionNote
        );
      }
      var rec_id = poRec.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
      var url = removeURLParam(window.location.href, "poIds", poId);
      url = removeURLParam(url, "poNumbers", poNumber);
      console.log("url--", url);
      location.href = url;
    } catch (error) {
      alert("Error in rejectPaymentProposalIfSelectedDataIsZero()" + error);
    }
  }

  function actionScreenThreeABC(tabNumber, ButtonName, poId, poNumber) {
    try {
      var rejectionNote = "";
      if (ButtonName === "approve") {
        var confirmButtonPressed = confirm("Are you sure you want to approve?");
        if (!confirmButtonPressed) {
          // User clicked "Cancel" or closed the dialog
          return; // Stay on the same page or perform other actions as needed
        }
      }
      if (ButtonName === "save") {
        var confirmButtonPressed = confirm("Are you sure you want to save?");
        if (!confirmButtonPressed) {
          // User clicked "Cancel" or closed the dialog
          return; // Stay on the same page or perform other actions as needed
        }
      }
      if (ButtonName === "reject") {
        var confirmButtonPressed = confirm("Are you sure you want to reject?");
        if (!confirmButtonPressed) {
          // User clicked "Cancel" or closed the dialog
          return; // Stay on the same page or perform other actions as needed
        } else {
          rejectionNote = prompt("Enter rejection note for proposal:");
          if (!rejectionNote) {
            // User clicked "Cancel" or closed the dialog
            return; // Stay on the same page or perform other actions as needed
          }
        }
      }

      var currentRec = currentRecord.get();

      var returnObj = {
        selectedData: [],
      };
      var sublistName = "custtab_" + poId;

      returnObj = selectedLineForScreenThree(
        sublistName,
        returnObj,
        currentRec,
        poId,
        ButtonName
      );

      if (
        returnObj.selectedData.length == 0 &&
        (ButtonName == "approve" || ButtonName == "save")
      ) {
        if (!alertConfirm()) {
          return false;
        }
      }

      // alert("returnObj.selectedData" + returnObj.selectedData);

      var poRec = record.load({
        type: "customrecord_rmpay_payment_proposal",
        id: poId,
      });

      if (
        returnObj.selectedData.length > 10 &&
        (ButtonName == "approve" ||
          ButtonName == "save" ||
          ButtonName == "reject")
      ) {
        var returnObjSelectedData = returnObj.selectedData;
        var unSelectedDataArray = [];

        var poRecCount = poRec.getLineCount({
          sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        });
        for (var i = 0; i < poRecCount; i++) {
          var billId = poRec.getSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "id",
            line: i,
          });

          if (!returnObj.selectedData.includes(billId)) {
            //Update data in RM Pay - Bills in Payment Proposal
            unSelectedDataArray.push(billId);
          }
        }

        // alert("unSelectedDataArray" + unSelectedDataArray);

        if (returnObjSelectedData.length > 0) {
          //showDialogWithGif();
          // setTimeout(function () {
          createPaymentProposalProcessingRecordForScreenThree(
            poRec,
            returnObjSelectedData,
            ButtonName,
            rejectionNote
          );
          hideOverlay();
          //}, 1000); //Hide Set Timeout
        }
        // if (unSelectedDataArray.length > 0) {
        //   createPaymentProposalProcessingRecordForScreenThree(
        //     poRec,
        //     unSelectedDataArray,
        //     "Reject",
        //     rejectionNote
        //   );
        // }

        return false;
      }

      var poRecCount = poRec.getLineCount({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
      });

      var poRecStatus = poRec.getValue("custrecord_rmpay_pp_status");

      var currentRecPPStatusVal = "custrecord_rmpay_pp_status_" + poId;
      var currentRecPPStatus = currentRec.getValue(currentRecPPStatusVal);

      if (poRecStatus === currentRecPPStatus) {
        // showDialogWithGif();

        // setTimeout(function () {
        if (poRecCount > 0) {
          if (
            (ButtonName == "approve" ||
              ButtonName == "save" ||
              ButtonName == "reject") &&
            returnObj.selectedData.length > 0
          ) {
            var paymentProposalRecNewStatus = "";
            if (ButtonName == "approve") {
              paymentProposalRecNewStatus =
                setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove(
                  poRec,
                  poRecStatus
                );
            }
            var numCounter = 0;
            for (var j = 0; j < poRecCount; j++) {
              var id = poRec.getSublistValue({
                sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
                fieldId: "id",
                line: j,
              });

              if (ButtonName == "approve" || ButtonName == "save") {
                if (!returnObj.selectedData.includes(id)) {
                  //Update data in RM Pay - Bills in Payment Proposal
                  unlinkBillsFromPaymentProposalRecord(id);
                } else {
                  // Selected
                  //Update RM Pay - Bills in Payment Proposal
                  numCounter++;

                  if (ButtonName == "approve") {
                    poRec.setSublistValue({
                      sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
                      fieldId: "custrecord_rmpay_bills_pp_status",
                      value: paymentProposalRecNewStatus,
                      line: j,
                    });
                  }

                  poRec.setSublistValue({
                    sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
                    fieldId: "custrecord_rmpay_bills_pp_number",
                    value: numCounter,
                    line: j,
                  });
                }
              } else if (ButtonName == "reject") {
                //Update RM Pay - Bills in Payment Proposal
                unlinkBillsFromPaymentProposalRecord(id);
              }
            }
          }

          if (ButtonName == "reject" || returnObj.selectedData.length == 0) {
            setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
              poRec,
              rejectionNote
            );

            setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnReject(
              poRec
            );
          }

          var rec_id = poRec.save({
            enableSourcing: true,
            ignoreMandatoryFields: true,
          });
        }

        // hideOverlay();
        // }, 1000); //Hide Set Timeout

        var url = removeURLParam(window.location.href, "poIds", poId);
        url = removeURLParam(url, "poNumbers", poNumber);
        console.log("url--", url);
        location.href = url;
      } else {
        alert(
          "The original status is changed so you cannot perform this action now."
        );
        reloadPageWithoutAlert();
      }
    } catch (error) {
      alert("Error In actionScreenThree()" + error);
    }
  }

  function removeURLParam(url, removeParam, removeValue) {
    // Decode the URL to get the value of the selectedLine parameter
    var decodedUrl = decodeURIComponent(url);
    console.log("decodedUrl", decodedUrl);
    // Find the selectedLine parameter in the URL
    var selectedLineStart = decodedUrl.indexOf(removeParam);

    if (selectedLineStart !== -1) {
      // Extract the selectedLine parameter value
      var selectedLineEnd = decodedUrl.indexOf("&", selectedLineStart);
      var selectedLineParam = decodedUrl.slice(
        selectedLineStart,
        selectedLineEnd !== -1 ? selectedLineEnd : undefined
      );

      // Parse the selectedLine parameter as JSON
      var selectedLineArray = JSON.parse(
        selectedLineParam.substring(selectedLineParam.indexOf("=") + 1)
      );

      // Remove "100652592" from the array
      var indexToRemove = selectedLineArray.indexOf(removeValue);
      if (indexToRemove !== -1) {
        selectedLineArray.splice(indexToRemove, 1);
      }
      // Encode the modified selectedLine parameter back into the URL
      //var encodedSelectedLine = encodeURIComponent(JSON.stringify(selectedLineArray));
      url = decodedUrl.replace(
        selectedLineParam,
        removeParam + "=" + JSON.stringify(selectedLineArray)
      );
      console.log("new url", url);
    }
    console.log(url);
    return url;
  }

  function alertConfirm() {
    var result = false;
    var r = confirm(
      "0 transactions are selected and the Payment Proposal will be set with status “Rejected”. Do you want to continue?"
    );
    console.log("r==========", r);
    if (r == true) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }

  function setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove(
    poRec,
    poRecStatus
  ) {
    try {
      var returnValue = "";
      var first_Approver = poRec.getValue({
        fieldId: "custrecord_rmpay_pp_first_approver",
      });
      var second_Approver = poRec.getValue({
        fieldId: "custrecord_rmpay_pp_second_approver",
      });
      var final_Approver = poRec.getValue({
        fieldId: "custrecord_rmpay_pp_final_approver",
      });

      if (poRecStatus == PaymentApprovalSts.PendingFirstApproval) {
        if (first_Approver) {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_first_approver_nm",
            value: globalCurrentUser.id,
          });
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_first_approver",
            value: globalCurrentUser.role,
          });
        }
        if (second_Approver) {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: PaymentApprovalSts.PendingSecondApproval, //Pending Second Approval
          });
          returnValue = PaymentApprovalSts.PendingSecondApproval;
        } else if (final_Approver) {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: PaymentApprovalSts.PendingFinalApproval, //Pending Final Approval
          });
          returnValue = PaymentApprovalSts.PendingFinalApproval;
        } else {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: PaymentApprovalSts.Approved, //Approved
          });
          returnValue = PaymentApprovalSts.Approved;
        }
      }

      if (poRecStatus == PaymentApprovalSts.PendingSecondApproval) {
        if (second_Approver) {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_second_appr_nm",
            value: globalCurrentUser.id,
          });
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_second_approver",
            value: globalCurrentUser.role,
          });
        }
        if (final_Approver) {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: PaymentApprovalSts.PendingFinalApproval, //Pending Final Approval
          });
          returnValue = PaymentApprovalSts.PendingFinalApproval;
        } else {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: PaymentApprovalSts.Approved, //Approved
          });
          returnValue = PaymentApprovalSts.Approved;
        }
      }

      if (poRecStatus == PaymentApprovalSts.PendingFinalApproval) {
        if (final_Approver) {
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_final_approver_nm",
            value: globalCurrentUser.id,
          });
          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_final_approver",
            value: globalCurrentUser.role,
          });

          poRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: PaymentApprovalSts.Approved, //Approved
          });
          returnValue = PaymentApprovalSts.Approved;
        }
      }
      return returnValue;
    } catch (error) {
      alert(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove() " +
          error
      );
      return false;
    }
  }

  function setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
    poRec,
    rejectionReason
  ) {
    try {
      poRec.setValue({
        fieldId: "custrecord_rmpay_pp_status",
        value: PaymentApprovalSts.Rejected,
      });
      poRec.setValue({
        fieldId: "custrecord_rmpay_pp_reject_note",
        value: rejectionReason,
      });

      poRec.setValue({
        fieldId: "custrecord_rmpay_pp_rejected_by",
        value: globalCurrentUser.id,
      });
    } catch (error) {
      alert(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove() " +
          error
      );
      return false;
    }
  }

  function setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove(
    poRec,
    newStatus
  ) {
    try {
      var PaymentProposalRecLineCount = poRec.getLineCount({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
      });

      if (PaymentProposalRecLineCount > 0) {
        for (var j = 0; j < PaymentProposalRecLineCount; j++) {
          // var PaymentProposalLineBillStatus = poRec.getSublistValue({
          //   sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
          //   fieldId: "custrecord_rmpay_bills_pp_status",
          //   line: j,
          // });

          poRec.setSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "custrecord_rmpay_bills_pp_status",
            value: newStatus,
            line: j,
          });

          poRec.setSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "custrecord_rmpay_bills_pp_number",
            value: j + 1, //for updating serial numbers on line
            line: j,
          });
        }
      }
    } catch (error) {
      alert(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove() " +
          error
      );
      return false;
    }
  }

  function setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnReject(
    poRec
  ) {
    try {
      var PaymentProposalRecLineCount = poRec.getLineCount({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
      });

      if (PaymentProposalRecLineCount > 0) {
        for (var j = 0; j < PaymentProposalRecLineCount; j++) {
          var PaymentProposalLineBillStatus = poRec.getSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "custrecord_rmpay_bills_pp_status",
            line: j,
          });

          poRec.setSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "custrecord_rmpay_bills_pp_status",
            value: PaymentApprovalSts.Rejected,
            line: j,
          });

          poRec.setSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "custrecord_rmpay_bills_pp_number",
            value: j + 1, //for updating serial numbers on line
            line: j,
          });
        }
      }
      // Commented Mayur B
      //  record.submitFields({
      //    //Rejected
      //    type: "customrecord_rmpay_bills_in_pp",
      //    id: id,
      //    values: {
      //      custrecord_rmpay_bills_pp_parent: "",
      //    },
      //    options: {
      //      enableSourcing: false,
      //      ignoreMandatoryFields: true,
      //    },
      //  });
    } catch (error) {
      alert(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove() " +
          error
      );
      return false;
    }
  }

  function unlinkBillsFromPaymentProposalRecord(billId) {
    record.submitFields({
      type: "customrecord_rmpay_bills_in_pp",
      id: billId,
      values: {
        custrecord_rmpay_bills_pp_status: PaymentApprovalSts.Rejected,
        custrecord_rmpay_bills_pp_parent: "", //Unlink from parent
      },
      options: {
        enableSourcing: true,
        ignoreMandatoryFields: true,
      },
    });
  }

  function redirectToScreenTwo() {
    try {
      //resolved the suitlet script url using deployment and script id
      var suitelet_Url = url.resolveScript({
        scriptId: "customscript_rm_rmpay_suitlet",
        deploymentId: "customdeploy_rmpay_suitlet",
      });

      window.onbeforeunload = null;

      window.location = suitelet_Url;
    } catch (error) {
      alert("Error in redirectToScreenTwo() " + error);
    }
  }
  function redirectToScreenTwoByCheckingURL(url_) {
    try {
      var decodedUrl = decodeURIComponent(url_);

      // Use a regular expression to extract the value of "poids."
      var poidsMatch = decodedUrl.match(/poIds=\[\"(.*?)\"\]/);
      var firstPoids = "";
      if (poidsMatch) {
        // Extract the matched value from the regular expression.
        var poidsValue = poidsMatch[1];

        // Split the value into an array and remove unnecessary characters.
        var poids = poidsValue.split(",").map(function (value) {
          return value.replace(/"/g, "").trim();
        });

        // If you want only the first "poids" value:
        firstPoids = poids[0];
      }

      if (firstPoids === "") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      alert("Error in redirectToScreenTwo() " + error);
    }
  }
  function createPaymentProposalProcessingRecord(
    poRec,
    button_Pressed,
    rejectionReason
  ) {
    poRec.setValue({
      fieldId: "custrecord_rm_rmpay_processing_in_map_re",
      value: true,
    });

    poRec.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });
    var objArray = [];
    var propsalDataValue = {};
    propsalDataValue["buttonpressed"] = button_Pressed;
    propsalDataValue["proposalid"] = poRec.id;
    propsalDataValue["rejectionReason"] = rejectionReason;
    propsalDataValue["currentuserid"] = globalCurrentUser.id;
    propsalDataValue["currentuserrole"] = globalCurrentUser.role;
    var orderData = {};
    var paymentProposalBill_Count = poRec.getLineCount({
      sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
    });

    for (var t = 0; t < paymentProposalBill_Count; t++) {
      var billId = poRec.getSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "id",
        line: t,
      });

      if (billId) {
        objArray.push(billId);
      }
    }
    propsalDataValue["order"] = objArray;
    // alert(
    //   "Your data will be processed in background by map reduce script as the selected entries are more than 10 and it will take upto 15 min of time. Please do not resubmit for approval."
    // );

    var paymentProposalProcessingRec = record.create({
      type: "customrecord_rm_pay_pp_processing_data",
      isDynamic: true,
    });
    paymentProposalProcessingRec.setValue({
      fieldId: "custrecord_rm_pay_pp_rec",
      value: poRec.id,
    });
    paymentProposalProcessingRec.setValue({
      fieldId: "custrecord_rm_pay_pp_processing_data",
      value: JSON.stringify(propsalDataValue),
    });
    var recId = paymentProposalProcessingRec.save();
    // return false;
  }

  function createPaymentProposalProcessingRecordForScreenThree(
    poRec,
    returnObjSelectedData,
    ButtonName,
    rejectionNote
  ) {
    poRec.setValue({
      fieldId: "custrecord_rm_rmpay_processing_in_map_re",
      value: true,
    });

    poRec.save({
      enableSourcing: true,
      ignoreMandatoryFields: true,
    });
    var objArray = [];
    var propsalDataValue = {};
    propsalDataValue["buttonpressed"] = ButtonName;
    propsalDataValue["proposalid"] = poRec.id;
    propsalDataValue["rejectionReason"] = rejectionNote;
    propsalDataValue["currentuserid"] = globalCurrentUser.id;
    propsalDataValue["currentuserrole"] = globalCurrentUser.role;
    propsalDataValue["order"] = returnObjSelectedData;
    // var orderData = {};
    // objArray.push(returnObjSelectedData);
    // propsalDataValue["order"] = objArray;

    alert(
      "Your data will be processed in background by map reduce script as the selected entries are more than 10 and it will take upto 15 min of time. Please do not resubmit for approval."
    );

    var paymentProposalProcessingRec = record.create({
      type: "customrecord_rm_pay_pp_processing_data",
      isDynamic: true,
    });
    paymentProposalProcessingRec.setValue({
      fieldId: "custrecord_rm_pay_pp_rec",
      value: poRec.id,
    });
    paymentProposalProcessingRec.setValue({
      fieldId: "custrecord_rm_pay_pp_processing_data",
      value: JSON.stringify(propsalDataValue),
    });
    var recId = paymentProposalProcessingRec.save();
  }

  function showDialogWithGif() {
    overlay.style.display = "flex"; //block
  }

  function getHtmlContent() {
    var loadingGifUrl = "https://i.gifer.com/ZKZg.gif";
    //"https://media.tenor.com/wpSo-8CrXqUAAAAj/loading-loading-forever.gif";
    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "100";

    var image = document.createElement("img");
    image.src = loadingGifUrl;
    image.alt = "Loading...";

    image.style.width = "50px";
    image.style.height = "50px";

    overlay.appendChild(image);
    document.body.appendChild(overlay);

    var title = document.createElement("div");
    title.innerText = "Loading  Please Wait...";
    title.style.color = "white";
    title.style.fontSize = "20px";
    overlay.appendChild(title);
    overlay.style.display = "none";
    console.log("OVERPLAY", overlay);
    return overlay;
  }

  function hideOverlay() {
    //overlay.style.display = 'none';
    console.log("Clickeddddddddddd");
    overlay.style.display = "none";
  }

  function screenThreeGlobalFilter() {
    var selectedLine = [];
    var currentRec = currentRecord.get();
    var vendorSelected = currentRec.getValue({
      fieldId: "custpage_vendor_filter",
    });
    var currencySelected = currentRec.getValue({
      fieldId: "custpage_currency_filter",
    })
    if(!vendorSelected || !currencySelected){
      alert("Please select Vendor and Currency")
      return false
    }
    console.log("vendorSelected", vendorSelected);
    console.log("currencySelected", currencySelected);
    // selectedLine= selectedChildData('custpage_sdata', vendorSelected, currentRec)
    var currentUrl = document.location.href;
    currentUrl = removeParam('vendorSelected',currentUrl);
    currentUrl = removeParam('currencySelected',currentUrl);
    // console.log("selectedLine2", selectedLine)
    currentUrl = currentUrl + "&vendorSelected=" + vendorSelected + "&currencySelected=" + currencySelected
    console.log("currentUrl", currentUrl)
    window.location = currentUrl;
  }

  function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
  }

  return {
    pageInit: pageInit,
    preview: preview,
    backButton: backButton,
    clear: clear,
    reviewApproveReject: reviewApproveReject,
    fieldChanged: fieldChanged,
    actionScreenThree: actionScreenThree,
    screenThreeGlobalFilter: screenThreeGlobalFilter,
  };
});
