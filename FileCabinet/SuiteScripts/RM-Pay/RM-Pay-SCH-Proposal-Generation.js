/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define([
  "N/record",
  "N/search",
  "N/format",
  "N/runtime",
  "./Lib/RMPay_common_lib",
], /** //, './Lib/RMPay_common_lib.js'
 * @param{action} action
 * @param{record} record
 * @param{search} search
 */ (record, search, format, runtime, rmPayLib) => {
  //Script 4

  /**
   * Defines the Scheduled script trigger point.
   * @param {Object} scriptContext
   * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
   * @since 2015.2
   */
  const execute = (scriptContext) => {
    try {
      var scriptObj = runtime.getCurrentScript();
      var OrderDate = new Date();
      var Dateflt = format.format({
        value: OrderDate,
        type: format.Type.DATE,
      });
      var ExchangeRateObj = rmPayLib._getCurrencyExchangeRateDetails(
        null,
        null,
        Dateflt
      );

      // Call the function with the JSON record
      var exchangeRateDynamicObject = createDynamicObject(ExchangeRateObj);
      //   log.debug("exchangeRateDynamicObject==>", exchangeRateDynamicObject);

      var combinedFirstArray = billSearchData(scriptObj);
      var groupResult = getGroupResult(combinedFirstArray);
      //   log.debug("Group Result Array", groupResult);
      var configData = rmPayLib._getconfigData();
      var proposalArr = [];
      var groupedData = Object.values(groupResult);
      for (var i = 0; i < groupedData.length; i++) {
        //log.debug("groupedData[i]", JSON.stringify(groupedData[i]))
        var objData = {};
        objData.billId = groupedData[i].billId.trim().slice(0, -1);
        objData.altname = getTodayDate() + "-" + groupedData[i].bankName;
        objData.custrecord_rmpay_pp_company_bank_detail = groupedData[i].bankId;
        objData.custrecord_rmpay_pp_subsidiary = groupedData[i].bankSubsidiary;
        objData.custrecord_rmpay_pp_currency = groupedData[i].bankCurrency;
        objData.custbody_rmpay_bbd_no_return_file = groupedData[i].noReturnFile;
        objData.custrecord_rmpay_pp_amount = groupedData[i].billAmount; //.toFixed(2)
        objData.custrecord_rmpay_pp_nr_of_bills = 1;
        objData.custrecord_rmpay_pp_date_created = parseAndFormatDateString(
          new Date()
        )[0]; //getTodayNsDate()
        objData.currency = groupedData[i].tranCurrency;
        objData.total = groupedData[i].totalAmt;
        objData.custbody_rmpay_bbd_acct_curr = groupedData[i].BankCurrency;

        if (
          groupedData[i].bankFirstApprover ||
          groupedData[i].bankSecondApprover ||
          groupedData[i].bankFinalApprover
        ) {
          if (groupedData[i].bankFirstApprover) {
            objData.custrecord_rmpay_pp_first_approver =
              groupedData[i].bankFirstApprover;
            objData.custrecord_rmpay_pp_status =
              rmPayLib._globalVariables().PaymentApprovalSts.PendingFirstApproval;
          }
          if (groupedData[i].bankSecondApprover) {
            objData.custrecord_rmpay_pp_second_approver =
              groupedData[i].bankSecondApprover;
          }
          if (groupedData[i].bankFinalApprover) {
            objData.custrecord_rmpay_pp_final_approver =
              groupedData[i].bankFinalApprover;
            if (!groupedData[i].bankFirstApprover) {
              objData.custrecord_rmpay_pp_status =
                rmPayLib._globalVariables().PaymentApprovalSts.PendingFinalApproval;
            }
          }
          objData.createProposal = true;
        } else if (
          configData.custrecord_rmpay_gc_first_approver ||
          configData.custrecord_rmpay_gc_second_approver ||
          configData.custrecord_rmpay_gc_final_approver
        ) {
          if (configData.custrecord_rmpay_gc_first_approver) {
            objData.custrecord_rmpay_pp_first_approver =
              configData.custrecord_rmpay_gc_first_approver;
            objData.custrecord_rmpay_pp_status =
              rmPayLib._globalVariables().PaymentApprovalSts.PendingFirstApproval;
          }
          if (configData.custrecord_rmpay_gc_second_approver) {
            objData.custrecord_rmpay_pp_second_approver =
              configData.custrecord_rmpay_gc_second_approver;
          }
          if (configData.custrecord_rmpay_gc_final_approver) {
            objData.custrecord_rmpay_pp_final_approver =
              configData.custrecord_rmpay_gc_final_approver;
            if (!configData.custrecord_rmpay_gc_final_approver) {
              objData.custrecord_rmpay_pp_status =
                rmPayLib._globalVariables().PaymentApprovalSts.PendingFinalApproval;
            }
          }
          objData.createProposal = true;
        } else {
          objData.createProposal = false;
          objData.scriptError = "Approver not found";
        }
        proposalArr.push(objData);
      }
      //   log.debug("Proposal Array", proposalArr);
      var createProposal = createPaymentProposal(
        proposalArr,
        exchangeRateDynamicObject
      );
    } catch (error) {
      log.error("Error in Execute", error);
      var scriptId = runtime.getCurrentScript().id;
      var deployment_Id = runtime.getCurrentScript().deploymentId;
      rmPayLib._generateErrorRecord(scriptId, deployment_Id, error);
    }
  };

  function billSearchData(scriptObj) {
    const billId = search.createColumn({ name: "internalid" });
    const bankId = search.createColumn({ name: "custbody_rmpay_bbd_cbd" });
    const billAmount = search.createColumn({
      name: "custbody_rmpay_bbd_curr_amt",
    }); //amount
    const noReturnFile = search.createColumn({
      name: "custbody_rmpay_bbd_no_return_file",
    });
    const bankSubsidiary = search.createColumn({
      name: "custrecord_rmpay_cbd_subsidiary",
      join: "CUSTBODY_RMPAY_BBD_CBD",
    });
    const bankCurrency = search.createColumn({
      name: "custrecord_rmpay_cbd_currency",
      join: "CUSTBODY_RMPAY_BBD_CBD",
    });
    const bankFirstApprover = search.createColumn({
      name: "custrecord_rmpay_cbd_first_approver",
      join: "CUSTBODY_RMPAY_BBD_CBD",
    });
    const bankSecondApprover = search.createColumn({
      name: "custrecord_rmpay_cbd_second_approver",
      join: "CUSTBODY_RMPAY_BBD_CBD",
    });
    const bankFinalApprover = search.createColumn({
      name: "custrecord_rmpay_cbd_final_approver",
      join: "CUSTBODY_RMPAY_BBD_CBD",
    });
    const tranCurrency = search.createColumn({
      name: "currency",
    });
    const totalAmt = search.createColumn({
      name: "total",
    });
    const BankCurrency = search.createColumn({
      name: "custbody_rmpay_bbd_acct_curr",
    });
    var billSearch = "";

    if (scriptObj.deploymentId == "customdeploy_rm_pay_sch_proposal_regener") {
      billSearch = search.create({
        type: "vendorbill",
        filters: [
          ["type", "anyof", "VendBill"],
          "AND",
          ["mainline", "is", "T"],
          "AND",
          ["approvalstatus", "anyof", "2"],
          "AND",
          ["status", "anyof", "VendBill:A"],
          "AND",
          ["vendor.custentity_rmpay_vendor_exclude", "is", "F"],
          "AND",
          ["custbody_rmpay_bbd_ready_for_pp", "is", "T"],
          "AND",
          ["custbody_rmpay_bill_payment_on_hold", "is", "F"],
          "AND",
          [
            "custrecord_rmpay_bills_pp_vendorbill.custrecord_rmpay_bills_pp_parent",
            "anyof",
            "@NONE@",
          ],
        ],
        columns: [
          billId,
          bankId,
          billAmount,
          bankSubsidiary,
          bankCurrency,
          bankFirstApprover,
          bankSecondApprover,
          bankFinalApprover,
          noReturnFile,
          tranCurrency,
          totalAmt,
          BankCurrency,
        ],
      });
    } else {
      billSearch = search.create({
        type: "vendorbill",
        filters: [
          ["type", "anyof", "VendBill"],
          "AND",
          //['internalid', 'anyof', '9735', '9541', '9540'],
          //'AND',
          ["mainline", "is", "T"],
          "AND",
          ["approvalstatus", "anyof", "2"],
          "AND",
          ["status", "anyof", "VendBill:A"],
          "AND",
          ["vendor.custentity_rmpay_vendor_exclude", "is", "F"],
          "AND",
          ["custbody_rmpay_bbd_ready_for_pp", "is", "T"],
          "AND",
          ["custbody_rmpay_bill_payment_on_hold", "is", "F"],
          "AND",
          [
            "custrecord_rmpay_bills_pp_vendorbill.custrecord_rmpay_bills_pp_parent",
            "anyof",
            "@NONE@",
          ],
        ],
        columns: [
          billId,
          bankId,
          billAmount,
          bankSubsidiary,
          bankCurrency,
          bankFirstApprover,
          bankSecondApprover,
          bankFinalApprover,
          noReturnFile,
          tranCurrency,
          totalAmt,
          BankCurrency,
        ],
      });
    }

    var searchResultCount = billSearch.runPaged().count;
    // log.debug("billSearch result count", searchResultCount);
    var objInSearch = {};
    var combinedFirstArray = [];
    billSearch.run().each(function (result) {
      var billId = result.id;
      var isValid = isValidBill(billId);
      //   log.debug("isValid--", isValid);
      if (isValid) {
        var bankId = result.getValue({
          name: "custbody_rmpay_bbd_cbd",
        });
        var bankName = result.getText({
          name: "custbody_rmpay_bbd_cbd",
        });
        var billAmount = result.getValue({
          name: "custbody_rmpay_bbd_curr_amt",
        });
        // log.debug("billAmount====", billAmount);
        var noReturnFile = result.getValue({
          name: "custbody_rmpay_bbd_no_return_file",
        });
        var bankSubsidiary = result.getValue({
          name: "custrecord_rmpay_cbd_subsidiary",
          join: "CUSTBODY_RMPAY_BBD_CBD",
        });
        var bankCurrency = result.getValue({
          name: "custrecord_rmpay_cbd_currency",
          join: "CUSTBODY_RMPAY_BBD_CBD",
        });
        var bankFirstApprover = result.getValue({
          name: "custrecord_rmpay_cbd_first_approver",
          join: "CUSTBODY_RMPAY_BBD_CBD",
        });
        var bankSecondApprover = result.getValue({
          name: "custrecord_rmpay_cbd_second_approver",
          join: "CUSTBODY_RMPAY_BBD_CBD",
        });
        var bankFinalApprover = result.getValue({
          name: "custrecord_rmpay_cbd_final_approver",
          join: "CUSTBODY_RMPAY_BBD_CBD",
        });

        var tranCurrency = result.getValue({
          name: "currency",
        });
        var totalAmt = result.getValue({
          name: "total",
        });
        var BankCurrency = result.getValue({
          name: "custbody_rmpay_bbd_acct_curr",
        });

        objInSearch = {
          bankName: bankName,
          billId: billId,
          bankId: bankId,
          billAmount: billAmount,
          bankSubsidiary: bankSubsidiary,
          bankCurrency: bankCurrency,
          bankFirstApprover: bankFirstApprover,
          bankSecondApprover: bankSecondApprover,
          bankFinalApprover: bankFinalApprover,
          noReturnFile: noReturnFile,
          tranCurrency: tranCurrency,
          totalAmt: totalAmt,
          BankCurrency: BankCurrency,
        };
        if (bankId) {
          combinedFirstArray.push(objInSearch);
        }
      }
      return true;
    });

    return combinedFirstArray;
  }

  function isValidBill(billId) {
    var billRec = record.load({
      type: "vendorbill",
      id: billId,
    });
    var numLines = billRec.getLineCount({
      sublistId: "recmachcustrecord_rmpay_bills_pp_vendorbill",
    });
    if (numLines > 0) {
      for (var i = 0; i < numLines; i++) {
        // var parentID = billRec.getSublistValue({
        //   sublistId: "recmachcustrecord_rmpay_bills_pp_vendorbill",
        //   fieldId: "custrecord_rmpay_bills_pp_parent",
        //   line: i,
        // });
        var parentID = billRec.getSublistValue({
          sublistId: "recmachcustrecord_rmpay_bills_pp_vendorbill",
          fieldId: "custrecord_rmpay_bills_pp_ref",
          line: i,
        });
        var AppStatus = billRec.getSublistValue({
          sublistId: "recmachcustrecord_rmpay_bills_pp_vendorbill",
          fieldId: "custrecord_rmpay_bills_pp_status",
          line: i,
        });
        var BankRespStatus = billRec.getSublistValue({
          sublistId: "recmachcustrecord_rmpay_bills_pp_vendorbill",
          fieldId: "custrecord_rmpay_bills_pp_resp_status",
          line: i,
        });
        if (parentID) {
          if (
            AppStatus ==
              rmPayLib._globalVariables().PaymentApprovalSts.Approved &&
            BankRespStatus ==
              rmPayLib._globalVariables().PaymentApprovalSts.Rejected
          ) {
            return true;
          }
          if (
            AppStatus == rmPayLib._globalVariables().PaymentApprovalSts.Rejected
          ) {
            return true;
          }
          return false;
        }
      }
    }
    return true;
  }

  function getGroupResult(combinedFirstArray) {
    const result = combinedFirstArray.reduce((acc, item) => {
      const key = `${item.bankId}`;
      if (!acc[key]) {
        acc[key] = {
          billAmount: 0,
          billId: "",
          bankName: "",
          bankId: "",
          bankSubsidiary: "",
          bankCurrency: "",
          bankFirstApprover: "",
          bankSecondApprover: "",
          bankFinalApprover: "",
          noReturnFile: "",
          tranCurrency: "",
          totalAmt: "",
          BankCurrency: "",
        };
      }
      //acc[key].billAmount += item.billAmount?parseFloat(item.billAmount):parseFloat(0)
      acc[key].billAmount += parseFloat(item.billAmount);
      acc[key].billId = item.billId + "," + acc[key].billId;
      acc[key].bankId = item.bankId;
      acc[key].bankSubsidiary = item.bankSubsidiary;
      acc[key].bankCurrency = item.bankCurrency;
      acc[key].bankFirstApprover = item.bankFirstApprover;
      acc[key].bankSecondApprover = item.bankSecondApprover;
      acc[key].bankFinalApprover = item.bankFinalApprover;
      acc[key].bankName = item.bankName;
      acc[key].noReturnFile = item.noReturnFile;
      acc[key].tranCurrency = item.tranCurrency;
      acc[key].totalAmt = item.totalAmt;
      acc[key].BankCurrency = item.BankCurrency;
      return acc;
    }, {});
    return result;
  }

  function createPaymentProposal(proposalArr, exchangeRateDynamicObject) {
    for (var k = 0; k < proposalArr.length; k++) {
      try {
        var paymentData = {};
        paymentData.proposalId = "";
        var proposalData = proposalArr[k];
        var billId = proposalData.billId;
        // log.debug("billId====", billId);
        var billCurrency = proposalData.currency;
        // log.debug("billCurrency====", billCurrency);
        var billTotalAmount = proposalData.total;
        // log.debug("billTotalAmount====", billTotalAmount);
        var billBankCurrency = proposalData.custbody_rmpay_bbd_acct_curr;
        // log.debug("billBankCurrency====", billBankCurrency);
        if (proposalData.createProposal) {
          var proposalRec = record.create({
            type: "customrecord_rmpay_payment_proposal",
            isDynamic: true,
          });
          proposalRec.setValue({
            fieldId: "altname",
            value: proposalData["altname"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_company_bank_detail",
            value: proposalData["custrecord_rmpay_pp_company_bank_detail"],
          });
          //   log.debug(
          //     "ssss--",
          //     proposalData["custrecord_rmpay_pp_company_bank_detail"]
          //   );
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_subsidiary",
            value: proposalData["custrecord_rmpay_pp_subsidiary"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_currency",
            value: proposalData["custrecord_rmpay_pp_currency"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_nr_of_bills",
            value: billId.split(",").length,
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_date_created",
            value: proposalData["custrecord_rmpay_pp_date_created"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_first_approver",
            value: proposalData["custrecord_rmpay_pp_first_approver"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_second_approver",
            value: proposalData["custrecord_rmpay_pp_second_approver"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_final_approver",
            value: proposalData["custrecord_rmpay_pp_final_approver"],
          });
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_status",
            value: proposalData["custrecord_rmpay_pp_status"],
          });

          /*Object.keys(proposalData).forEach(function(field){
                        if(field != "billId"){
                            proposalRec.setValue({
                                fieldId: field,
                                value: proposalData[field]
                            })
                        }
                    })*/
          proposalRec.setValue({
            fieldId: "custrecord_rmpay_pp_amount",
            value: proposalData["custrecord_rmpay_pp_amount"],
          });

          paymentData.proposalId = proposalRec.save({
            enableSourcing: false,
            ignoreMandatoryFields: true,
          });
          log.debug("proposalId===", paymentData.proposalId);

          //Create RM Pay - Bills in Payment Proposal
          paymentData.billId = billId;
          paymentData.billCurrency = billCurrency;
          paymentData.billTotalAmount = billTotalAmount;
          paymentData.billBankCurrency = billBankCurrency;
          if (proposalData.scriptError) {
            paymentData.paymentData.scriptError = proposalData.scriptError;
          }
          paymentData.respApprov =
            proposalData.custbody_rmpay_bbd_no_return_file;
          createBillsInPaymentProposalRecord(
            paymentData,
            billId,
            exchangeRateDynamicObject
          );
          //updateBillRecord(proposalId,billId)
        }
      } catch (e) {
        log.error("289 error", e);
      }
    }
  }

  function createBillsInPaymentProposalRecord(
    paymentData,
    billIds,
    exchangeRateDynamicObject
  ) {
    // log.debug("paymentData.proposalId", paymentData.proposalId);
    var proposalRec = record.load({
      type: "customrecord_rmpay_payment_proposal", //'customrecord_rmpay_bills_in_pp',
      id: paymentData.proposalId,
    });
    var objSublist = proposalRec.getSublist({
      sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
    });
    // log.debug("objSublist", JSON.stringify(objSublist));
    var billIds = billIds.split(",");
    for (var j = 0; j < billIds.length; j++) {
      //log.debug("billIds pp", billIds[j])
      // proposalRec.selectLine({
      //     sublistId: 'recmachcustrecord_rmpay_bills_pp_parent',
      //     line: j
      // })
      //log.debug("aaaa", "Newline")
      // add the condition here to update exchange rate.

      //custbody_rmpay_bbd_exch_rate
      //Logic to get Exchange Rate.
      var exchangeRateObject = exchangeRateDynamicObject;

      var tranCurrency = paymentData.billCurrency;
      var BankCurrency = paymentData.billBankCurrency;
      if (tranCurrency && BankCurrency && exchangeRateObject) {
        var ExchangeRate = 0;
        if (
          exchangeRateObject[BankCurrency] &&
          exchangeRateObject[BankCurrency][tranCurrency]
        ) {
          // Check if the exchange rate for the BankCurrency to tranCurrency exists.
          ExchangeRate = exchangeRateObject[BankCurrency][tranCurrency];
        }
        log.debug("ExchangeRate", ExchangeRate);

        proposalRec.setSublistValue({
          sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
          fieldId: "custrecord_rmpay_bills_pp_exrt",
          value: ExchangeRate,
          line: j,
        });
      }

      proposalRec.setSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "custrecord_rmpay_bills_pp_vendorbill",
        value: billIds[j],
        line: j,
      });

      proposalRec.setSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "custrecord_rmpay_bills_pp_parent",
        value: paymentData.proposalId,
        line: j,
      });
      proposalRec.setSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "custrecord_rmpay_bills_pp_script_error",
        value: paymentData.scriptError,
        line: j,
      });
      // proposalRec.setSublistValue({
      //     sublistId: 'recmachcustrecord_rmpay_bills_pp_parent',
      //     fieldId: 'custrecord_rmpay_bills_pp_ref',
      //     value: paymentData.proposalId,
      //     line: j
      // })
      proposalRec.setSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "custrecord_rmpay_bills_pp_or_ref",
        value: paymentData.proposalId,
        line: j,
      });
      proposalRec.setSublistValue({
        sublistId: "recmachcustrecord_rmpay_bills_pp_parent",
        fieldId: "custrecord_rmpay_bills_pp_resp_appr",
        value: paymentData.respApprov,
        line: j,
      });
      // proposalRec.commitLine({
      //     sublistId: 'recmachcustrecord_rmpay_bills_pp_parent',
      //     line: j
      //})
    }
    var paymentProposalId = proposalRec.save({
      enableSourcing: false,
      ignoreMandatoryFields: true,
    });
    log.debug("paymentProposalId===", paymentProposalId);
  }

  function updateBillRecord(proposalId, billIds) {
    //Not using
    var billIds = billIds.split(",");
    for (var j = 0; j < billIds.length; j++) {
      record.submitFields({
        type: "vendorbill",
        id: billIds[j],
        values: {
          custbody_rmpay_bbd_pp_ref: proposalId,
        },
      });
    }
  }

  function getTodayDate() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    var today = day + "-" + month + "-" + year;
    return today;
  }

  function getTodayNsDate() {
    var currentDate = new Date();
    var formattedDate = format.format({
      value: currentDate,
      type: format.Type.DATE,
    });
    formattedDate = formattedDate.toString();
    return formattedDate;
  }

  function parseAndFormatDateString(initialFormattedDateString) {
    // Assuming Date format is MM/DD/YYYY ---- D.Mon.YYYY
    //var initialFormattedDateString = "03/21/2023";
    var parsedDateStringAsRawDateObject = format.parse({
      value: initialFormattedDateString,
      type: format.Type.DATE,
    });
    var formattedDateString = format.format({
      value: parsedDateStringAsRawDateObject,
      type: format.Type.DATE,
    });
    return [parsedDateStringAsRawDateObject, formattedDateString];
  }
  function createDynamicObject(ExchangeRateObj) {
    var currencyColumns = [];
    currencyColumns.push(
      search.createColumn({
        name: "custrecord_rmpay_ce_exchangedate",
        label: "Exchange Effective Date",
      })
    );
    currencyColumns.push(
      search.createColumn({
        name: "internalid",
        sort: search.Sort.DESC,
        label: "Internal ID",
      })
    );
    currencyColumns.push(
      search.createColumn({
        name: "custrecord_rmpay_cer_rate",
        join: "CUSTRECORD_RMPAY_CER_PARENT",
        label: "Exchange Rate",
      })
    );
    currencyColumns.push(
      search.createColumn({
        name: "custrecord_rmpay_cer_trancurrency",
        join: "CUSTRECORD_RMPAY_CER_PARENT",
        label: "Transaction Currency",
      })
    );
    currencyColumns.push(
      search.createColumn({
        name: "custrecord_rmpay_cer_bankcurrency",
        join: "CUSTRECORD_RMPAY_CER_PARENT",
        label: "Bank Currency",
      })
    );
    currencyColumns.push(
      search.createColumn({ name: "internalid", sort: search.Sort.DESC })
    );

    // Create a new object to store the extracted data
    var resultObject = {};
    // for (var u = 0; u < ExchangeRateObj.length; u++) {
    //   var exchangeRate = ExchangeRateObj[u].getValue(currencyColumns[2]);
    //   var tranCurrency = ExchangeRateObj[u].getValue(currencyColumns[3]);
    //   var bankCurrency = ExchangeRateObj[u].getValue(currencyColumns[4]);

    //   if (!resultObject[bankCurrency]) {
    //     resultObject[bankCurrency] = [];
    //   }

    //   var exchangeRateObj = {
    //     [tranCurrency]: exchangeRate,
    //   };

    //   resultObject[bankCurrency].push(exchangeRateObj);
    // }
    for (var u = 0; u < ExchangeRateObj.length; u++) {
      var exchangeRate = ExchangeRateObj[u].getValue(currencyColumns[2]);
      var tranCurrency = ExchangeRateObj[u].getValue(currencyColumns[3]);
      var bankCurrency = ExchangeRateObj[u].getValue(currencyColumns[4]);
      if (exchangeRate && tranCurrency && bankCurrency) {
        if (!resultObject[bankCurrency]) {
          resultObject[bankCurrency] = {};
        }

        resultObject[bankCurrency][tranCurrency] = exchangeRate;
      }
    }
    log.debug("resultObject", resultObject);
    return resultObject;
  }

  return { execute };
});
