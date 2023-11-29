/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define([
  "N/search",
  "N/record",
  "N/runtime",
  "./Lib/RMPay_common_lib",
], function (search, record, runtime, rmPayLib) {
  // Load the search results file, count the number of letters in the file, and
  // store this count in another file
  // var numCounter = 0;
  var PaymentApprovalSts = rmPayLib._globalVariables().PaymentApprovalSts;
  // log.debug("PaymentApprovalSts", PaymentApprovalSts);
  function getInputData() {
    try {
      return search.create({
        type: "customrecord_rm_pay_pp_processing_data",
        filters: [
          ["custrecord_rm_pay_pp_rec_already_process", "is", "F"],
          "AND",
          ["isinactive", "is", "F"],
        ],
        columns: ["internalid"],
      });
    } catch (error) {
      log.error("Error in getInputData() ", error);
      var scriptId = runtime.getCurrentScript().id;
      var deployment_Id = runtime.getCurrentScript().deploymentId;
      var recId = rmPayLib._generateErrorRecord(scriptId, deployment_Id, error);
    }
  }

  function map(context) {
    try {
      var searchResult = JSON.parse(context.value);
      var paymentProposalProcessingRecId = searchResult.id;

      context.write({
        key: paymentProposalProcessingRecId, // Key to identify the record in the reduce phase
        value: "someData", // Data to be passed to the reduce phase
      });
    } catch (error) {
      log.error("Error in map() ", error);
      var scriptId = runtime.getCurrentScript().id;
      var deployment_Id = runtime.getCurrentScript().deploymentId;
      rmPayLib._generateErrorRecord(scriptId, deployment_Id, error);
    }
  }

  function reduce(context) {
    try {
      var paymentProposalProcessingRecId = context.key;

      if (!paymentProposalProcessingRecId) {
        return;
      }
      var paymentProposalProcessingRec = record.load({
        type: "customrecord_rm_pay_pp_processing_data",
        id: paymentProposalProcessingRecId,
      });

      var JSONData = paymentProposalProcessingRec.getValue(
        "custrecord_rm_pay_pp_processing_data"
      );

      JSONData = JSON.parse(JSONData);

      if (!JSONData.proposalid) {
        return;
      }
      var poRec = record.load({
        type: "customrecord_rmpay_payment_proposal",
        id: JSONData.proposalid,
      });

      var poRecStatus = poRec.getValue({
        fieldId: "custrecord_rmpay_pp_status",
      });

      if (
        JSONData.buttonpressed === "approve" ||
        JSONData.buttonpressed === "save"
      ) {
        var newStatus =
          setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove(
            poRec,
            poRecStatus,
            JSONData
          );

        setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove(
          poRec,
          newStatus,
          JSONData
        );
      }
      if (JSONData.buttonpressed === "reject") {
        setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
          poRec,
          JSONData
        );

        setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnReject(poRec);
      }

      poRec.setValue({
        fieldId: "custrecord_rm_rmpay_processing_in_map_re",
        value: false,
      });

      poRec.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
      if (JSONData.proposalid) {
        if (JSONData.buttonpressed === "approve") {
          setSerialNumbersOnLines(JSONData.proposalid);
        }
      }
      paymentProposalProcessingRec.setValue({
        fieldId: "custrecord_rm_pay_pp_rec_already_process",
        value: true,
      });

      paymentProposalProcessingRec.save({
        enableSourcing: true,
        ignoreMandatoryFields: true,
      });
    } catch (error) {
      log.error("Error in reduce() ", error);
      var scriptId = runtime.getCurrentScript().id;
      var deployment_Id = runtime.getCurrentScript().deploymentId;
      rmPayLib._generateErrorRecord(scriptId, deployment_Id, error);
    }
  }

  // function summarize(summary) {
  //   // var type = summary.toString();
  //   // log.audit({ title: type + " Usage Consumed ", details: summary.usage });
  //   // log.audit({
  //   //   title: type + " Concurrency Number ",
  //   //   details: summary.concurrency,
  //   // });
  //   // log.audit({ title: type + " Number of Yields ", details: summary.yields });
  //   // var contents = "";
  //   // summary.output.iterator().each(function (key, value) {
  //   //   contents += key + " " + value + "\n";
  //   //   return true;
  //   // });
  //   // // Create the output file
  //   // //
  //   // // Update the name parameter to use the file name of the output file
  //   // var fileObj = file.create({
  //   //   name: "domainCount.txt",
  //   //   fileType: file.Type.PLAINTEXT,
  //   //   contents: contents,
  //   // });
  //   // // Specify the folder location of the output file, and save the file
  //   // //
  //   // // Update the fileObj.folder property with the ID of the folder in
  //   // // the file cabinet that contains the output file
  //   // fileObj.folder = -15;
  //   // fileObj.save();
  // }
  // Below function retrieves all results from a search result set, handling pagination.

  function setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove(
    poRec,
    poRecStatus,
    JSONData
  ) {
    try {
      if (JSONData.buttonpressed === "approve") {
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
              value: JSONData.currentuserid,
            });
            poRec.setValue({
              fieldId: "custrecord_rmpay_pp_first_approver",
              value: JSONData.currentuserrole,
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
              value: JSONData.currentuserid,
            });
            poRec.setValue({
              fieldId: "custrecord_rmpay_pp_second_approver",
              value: JSONData.currentuserrole,
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
              value: JSONData.currentuserid,
            });
            poRec.setValue({
              fieldId: "custrecord_rmpay_pp_final_approver",
              value: JSONData.currentuserrole,
            });

            poRec.setValue({
              fieldId: "custrecord_rmpay_pp_status",
              value: PaymentApprovalSts.Approved, //Approved
            });
            returnValue = PaymentApprovalSts.Approved;
          }
        }
        return returnValue;
      }
    } catch (error) {
      log.error(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecOnApprove() ",
        error
      );
      return false;
    }
  }
  function setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove(
    poRec,
    newStatus,
    JSONData
  ) {
    try {
      if (
        newStatus != PaymentApprovalSts.Approved ||
        newStatus != PaymentApprovalSts.Rejected
      ) {
        var numCounter = 0;
        var PaymentProposalRecLineCount = poRec.getLineCount({
          sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        });

        if (PaymentProposalRecLineCount > 0) {
          for (var j = 0; j < PaymentProposalRecLineCount; j++) {
            // for (var j = PaymentProposalRecLineCount - 1; j >= 0; j--) {
            var billNumInPP = poRec.getSublistValue({
              sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
              fieldId: "id",
              line: j,
            });

            var found = false; // Flag to track if billNumInPP is found in JSONData.order

            for (i = 0; i < JSONData.order.length; i++) {
              if (billNumInPP === JSONData.order[i]) {
                if (JSONData.buttonpressed === "approve") {
                  // Set approval status to new Status if billNumInPP is found

                  poRec.setSublistValue({
                    sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
                    fieldId: "custrecord_rmpay_bills_pp_status",
                    value: newStatus,
                    line: j,
                  });
                }

                found = true; // Set the flag to true
                break; // No need to continue checking
              }
            }

            if (!found) {
              if (
                JSONData.buttonpressed === "approve" ||
                JSONData.buttonpressed === "save"
              ) {
                if (billNumInPP) {
                  numCounter++;
                  unlinkBillsFromPaymentProposalRecord(billNumInPP);
                }
              }
            }
          }

          // if (newStatus === PaymentApprovalSts.Approved) {
          // for (d = 0; d < PaymentProposalRecLineCount - numCounter; d++) {
          //   poRec.setSublistValue({
          //     sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
          //     fieldId: "custrecord_rmpay_bills_pp_number",
          //     value: d + 1,
          //     line: d,
          //   });
          // }
          // }
        }
        // if (PaymentProposalRecLineCount > 0) {
        //   for (var j = 0; j < PaymentProposalRecLineCount; j++) {
        //     var billNumInPP = poRec.getSublistValue({
        //       sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        //       fieldId: "id",
        //       line: j,
        //     });

        //     if (!(billNumInPP in JSONData.order)) {
        //       //Update data in RM Pay - Bills in Payment Proposal
        //       log.debug("In Unlink");
        //       unlinkBillsFromPaymentProposalRecord(billNumInPP);
        //     } else {
        //       // Selected
        //       //Update RM Pay - Bills in Payment Proposal
        //       numCounter++;
        //       if (ButtonName == "approve") {
        //         poRec.setSublistValue({
        //           sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        //           fieldId: "custrecord_rmpay_bills_pp_status",
        //           value: paymentProposalRecNewStatus,
        //           line: j,
        //         });
        //       }

        //       poRec.setSublistValue({
        //         sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        //         fieldId: "custrecord_rmpay_bills_pp_number",
        //         value: numCounter, //approve to change
        //         line: j,
        //       });
        //     }
        //   }
        // }
      }
    } catch (error) {
      log.error(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnApprove() ",
        error
      );
      return false;
    }
  }
  function setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject(
    poRec,
    JSONData
  ) {
    try {
      poRec.setValue({
        fieldId: "custrecord_rmpay_pp_status",
        value: PaymentApprovalSts.Rejected,
      });
      poRec.setValue({
        fieldId: "custrecord_rmpay_pp_reject_note",
        value: JSONData.rejectionReason,
      });

      poRec.setValue({
        fieldId: "custrecord_rmpay_pp_rejected_by",
        value: JSONData.currentuserid,
      });
    } catch (error) {
      log.error(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecOnReject() ",
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
          var billNumInPP = poRec.getSublistValue({
            sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
            fieldId: "id",
            line: j,
          });

          unlinkBillsFromPaymentProposalRecord(billNumInPP);
        }
      }
    } catch (error) {
      log.error(
        "Error in setApprovalStatusAndUserDetailsOfPaymentProposalRecLinesOnReject() ",
        error
      );
      return false;
    }
  }
  function unlinkBillsFromPaymentProposalRecord(billNumInPP) {
    try {
      if (billNumInPP) {
        var recId = record.submitFields({
          type: "customrecord_rmpay_bills_in_pp",
          id: billNumInPP,
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
    } catch (error) {
      log.error("Error in unlinkBillsFromPaymentProposalRecord() ", error);
    }
  }
  function setSerialNumbersOnLines(paymentproposalId) {
    try {
      var ppRec = record.load({
        type: "customrecord_rmpay_payment_proposal",
        id: paymentproposalId,
      });

      var paymentProposalStatus = ppRec.getValue("custrecord_rmpay_pp_status");

      if (paymentProposalStatus == PaymentApprovalSts.Approved) {
        var ppRecLineCount = ppRec.getLineCount({
          sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        });
        if (ppRecLineCount > 0) {
          for (var r = 0; r < ppRecLineCount; r++) {
            ppRec.setSublistValue({
              sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
              fieldId: "custrecord_rmpay_bills_pp_number",
              value: r + 1,
              line: r,
            });
          }
        }
        ppRec.save({
          enableSourcing: true,
          ignoreMandatoryFields: true,
        });
      }
    } catch (error) {
      log.error("Error in setSerialNumbersOnLines()");
    }
  }

  return {
    getInputData: getInputData,
    map: map,
    reduce: reduce,
    // summarize: summarize,
  };
});
