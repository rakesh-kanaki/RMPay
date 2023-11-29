/**
 * @NApiVersion 2.1
 */
define(["N/search", "N/currency", "N/record", "N/https", "N/format"], function (
  search,
  currency,
  record,
  https,
  format
) {
  try {
    var recordType = {
      RMPayCBD: "customrecord_rmpay_company_bank_details",
      RMPayGC: "customrecord_rmpay_payment_global_config",
      RMPaySub: "customrecord_rmpay_subsidiary",
      RMPayProposal: "customrecord_rmpay_payment_proposal",
      RMPayBillProposal: "customrecord_rmpay_bills_in_pp",
      RMPayError: "customrecord_rmpay_error_log",
      RMPayExhange: "customrecord_rmpay_currexchange",
    };

    var PaymentApprovalSts = {
      PendingFirstApproval: 1,
      PendingSecondApproval: 5,
      PendingFinalApproval: 6,
      Approved: 2,
      Failed: 4,
      Rejected: 3,
    };

    function _globalVariables() {
      var returnObject = {};
      returnObject["recordType"] = {
        RMPayCBD: "customrecord_rmpay_company_bank_details",
        RMPayGC: "customrecord_rmpay_payment_global_config",
        RMPaySub: "customrecord_rmpay_subsidiary",
        RMPayProposal: "customrecord_rmpay_payment_proposal",
        RMPayBillProposal: "customrecord_rmpay_bills_in_pp",
        RMPayError: "customrecord_rmpay_error_log",
        RMPayExhange: "customrecord_rmpay_currexchange",
      };
      returnObject["PaymentApprovalSts"] = {
        PendingFirstApproval: 1,
        PendingSecondApproval: 5,
        PendingFinalApproval: 6,
        Approved: 2,
        Failed: 4,
        Rejected: 3,
      };
      return returnObject;
    }

    /*var StdrecordType = {
    'vendorbill': search.Type.VENDOR_BILL,
    'customer': search.Type.CUSTOMER
  }*/
    // Function Definations.
    function _getPendingPaymentBills(PaymentColums) {
      //var PaymentColums = [];
      var PaymentCreteria = [];

      PaymentCreteria.push([
        "custrecord_rmpay_bills_pp_parent",
        "noneof",
        "@NONE@",
      ]);
      PaymentCreteria.push("AND");
      PaymentCreteria.push([
        "custrecord_rmpay_bills_pp_vendorbill.mainline",
        "is",
        "T",
      ]);
      PaymentCreteria.push("AND");
      PaymentCreteria.push([
        "custrecord_rmpay_bills_pp_status",
        "anyof",
        PaymentApprovalSts.Approved,
      ]);
      PaymentCreteria.push("AND");
      PaymentCreteria.push([
        "custrecord_rmpay_bills_pp_resp_status",
        "anyof",
        PaymentApprovalSts.Approved,
      ]);
      PaymentCreteria.push("AND");
      PaymentCreteria.push([
        "custrecord_rmpay_bills_pp_pay_ref",
        "anyof",
        "@NONE@",
      ]);
      PaymentCreteria.push("AND");
      PaymentCreteria.push([
        "custrecord_rmpay_bills_pp_vendorbill.custbody_rmpay_bbd_no_return_file",
        "is",
        "T",
      ]);
      PaymentCreteria.push("AND");
      PaymentCreteria.push([
        "custrecord_rmpay_pp_company_bank_detail.custrecord_rmpay_cbd_return_file_reader",
        "is",
        "T",
      ]);

      var searchObject = {};
      searchObject.rectype = recordType.RMPayBillProposal;
      searchObject.filters = PaymentCreteria;
      searchObject.columns = PaymentColums;

      return _rmsearchData(searchObject);
    }
    function _validateData(value) {
      if (
        value != null &&
        value.toString() != null &&
        value != "" &&
        value != undefined &&
        value.toString() != undefined &&
        value != "undefined" &&
        value.toString() != "undefined" &&
        value.toString() != "NaN" &&
        value != NaN
      ) {
        return true;
      }
      return false;
    }
    function _rmsearchData(searchdata) {
      // log.debug("searchdata", JSON.stringify(searchdata));
      log.debug("searchdata.filters", searchdata.filters);
      var columnValue = [];
      var csearch = search.create({
        type: searchdata.rectype,
        filters: searchdata.filters,
        columns: searchdata.columns,
      });
      var searchCount = csearch.runPaged().count;
      // log.debug("searchCount", searchCount);

      csearch.run().each(function (result) {
        // .run().each has a limit of 4,000 results
        columnValue.push(result);
        return true;
      });
      // log.debug("columnValue-----", columnValue);
      return columnValue;
    }
    function parseAndFormatDateString(initialFormattedDateString) {
      // Assuming Date format is MM/DD/YYYY
      //var initialFormattedDateString = "07/28/2015";
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
    function _validateRMPaySubsidary(recdata) {
      if (_validateData(recdata)) {
        // Define variables.
        var GetGlobalConfig = [];
        var GetGlobalConfigResult = [];

        //Assign Variables
        GetGlobalConfig.push(["isinactive", "is", "F"]);
        GetGlobalConfig.push("AND");
        GetGlobalConfig.push([
          "custrecord_rmpay_feature_parent.custrecord_rmpay_feature_rmpay",
          "is",
          "T",
        ]);

        GetGlobalConfigResult.push(
          search.createColumn({
            name: "custrecord_rmpay_feature_subsidiary",
            join: "CUSTRECORD_RMPAY_FEATURE_PARENT",
          })
        );
        GetGlobalConfigResult.push(
          search.createColumn({
            name: "custrecord_rmpay_feature_rmpay",
            join: "CUSTRECORD_RMPAY_FEATURE_PARENT",
          })
        );

        var searchObject = {};
        searchObject.rectype = recordType.RMPayGC; //'customrecord_rmpay_subsidiary';
        searchObject.filters = GetGlobalConfig;
        searchObject.columns = GetGlobalConfigResult;

        var GlobalResult = _rmsearchData(searchObject);
        if (_validateData(GlobalResult)) {
          for (var i = 0; i < GlobalResult.length; i++) {
            var setup_susidiary = GlobalResult[i].getValue(
              GetGlobalConfigResult[0]
            );
            var setup_rmpay = GlobalResult[i].getValue(
              GetGlobalConfigResult[1]
            );
            if (setup_rmpay) {
              if (recdata.subsidary == setup_susidiary) {
                // log.debug(
                //   "setup_susidiary-----",
                //   recdata.subsidary + " | " + setup_susidiary
                // );
                return true;
              }
            }
          }
        } else {
          /// missing Global configuration for this Bill.
        }
      } else {
        // invalid data in the parameter.
        // log.debug("invalid data in the parameter.");
      }

      return false;
    }
    function _validateRMVendor(recid) {
      var searchObject = {};
      searchObject.rectype = search.Type.VENDOR_BILL; //StdrecordType.vendorbill;//'customrecord_rmpay_subsidiary';
      searchObject.internalid = recid;
      searchObject.columns = ["custentity_rmpay_vendor_exclude"];
      return true;
    }
    function _getCompanyBankDeatils(searchdata) {
      var BankAccountCreteria = [];
      var BankAccountCreteria1 = [];
      var BankAccountCreteria2 = [];
      var BankAccountResult = [];

      // set the condition.
      BankAccountCreteria1.push([
        "custrecord_rmpay_cbd_subsidiary",
        "anyof",
        searchdata.subsidary,
      ]);
      BankAccountCreteria1.push("AND");
      //BankAccountCreteria1.push(['custrecord_rmpay_cbd_currency', 'anyof', searchdata.currency]);
      BankAccountCreteria1.push([
        "custrecord_rmpay_cbd_pay_currencies",
        "anyof",
        searchdata.currency,
      ]);

      BankAccountCreteria2.push(["custrecord_rmpay_cbd_preferred", "is", "T"]);
      //BankAccountCreteria2.push('AND');
      //BankAccountCreteria2.push(['custrecord_rmpay_cbd_subsidiary', 'anyof', searchdata.subsidary]);

      BankAccountCreteria.push(BankAccountCreteria1);
      BankAccountCreteria.push("OR");
      BankAccountCreteria.push(BankAccountCreteria2);

      BankAccountResult.push(search.createColumn({ name: "internalid" }));
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_preferred" })
      );
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_subsidiary" })
      );
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_pay_currencies" })
      );
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_bank" })
      );
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_api" })
      );
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_bank_country" })
      );
      BankAccountResult.push(
        search.createColumn({ name: "custrecord_rmpay_cbd_currency" })
      );

      var searchObject = {};
      searchObject.rectype = recordType.RMPayCBD; //'customrecord_rmpay_company_bank_details';
      searchObject.filters = BankAccountCreteria;
      searchObject.columns = BankAccountResult;

      var BankAccountData = _rmsearchData(searchObject);

      if (_validateData(BankAccountData)) {
        //Some data found.
        var SubCurrFlag = false;
        var SubPreFlag = false;
        var PreFlagFlg = false;

        var case1 = {};
        var case2 = {};
        var defaultcase = {
          custbody_rmpay_bbd_cbd: "",
          subsidary: "",
          custbody_rmpay_bbd_acct_curr: "",
          custbody_rmpay_bbd_bank_country: "",
          //'bankapi' : ''
        };

        for (var i = 0; i < BankAccountData.length; i++) {
          var setup_susidiary = BankAccountData[i].getValue(
            BankAccountResult[2]
          );
          var setup_currency = BankAccountData[i].getValue(
            BankAccountResult[3]
          );
          var preffFlag = BankAccountData[i].getValue(BankAccountResult[1]);
          //log.debug(JSON.stringify(searchdata), setup_susidiary + " | " + setup_currency + " | " + preffFlag);

          var supportedCurrencyFlg = setup_currency.includes(
            searchdata.currency
          );
          // log.debug(
          //   JSON.stringify(searchdata),
          //   setup_susidiary +
          //     " | " +
          //     setup_currency +
          //     " | " +
          //     preffFlag +
          //     "| supportedCurrencyFlg:" +
          //     supportedCurrencyFlg
          // );
          if (searchdata.subsidary == setup_susidiary && supportedCurrencyFlg) {
            // found correct bank Account.
            if (!SubCurrFlag) {
              SubCurrFlag = true;
              if (BankAccountData[i].getValue(BankAccountResult[5])) {
                case1 = {
                  custbody_rmpay_bbd_cbd: "",
                  subsidary: "",
                  custbody_rmpay_bbd_acct_curr: "",
                  custbody_rmpay_bbd_bank: "",
                  custbody_rmpay_bbd_bank_country: "",
                  //'bankapi' : ''
                };
              } else {
                case1 = {
                  custbody_rmpay_bbd_cbd: BankAccountData[i].getValue(
                    BankAccountResult[0]
                  ),
                  subsidary: BankAccountData[i].getValue(BankAccountResult[2]),
                  custbody_rmpay_bbd_acct_curr: BankAccountData[i].getValue(
                    BankAccountResult[7]
                  ),
                  custbody_rmpay_bbd_bank: BankAccountData[i].getValue(
                    BankAccountResult[4]
                  ),
                  custbody_rmpay_bbd_bank_country: BankAccountData[i].getValue(
                    BankAccountResult[6]
                  ),
                  //'bankapi' : BankAccountData[i].getValue(BankAccountResult[5])
                };
              }
            } else {
              //Throw error for multiple results with same subsidiary & currency.
              //throw new Error('multiple results of Bank Account with same subsidiary & currency');
              throw error.create({
                name: "RM_CONFIGRATION_ERROR",
                message:
                  "Multiple results of Bank Account with same subsidiary & currency",
                notifyOff: false,
              });
            }
          } else if (searchdata.subsidary == setup_susidiary && preffFlag) {
            // Found Default bank Account for subsidiary.
            if (!SubPreFlag) {
              SubPreFlag = true;
              //custrecord_rmpay_cbd_api
              //log.debug({ title: 'custrecord_rmpay_cbd_api', details: "api Flag:" + BankAccountData[i].getValue(BankAccountResult[5]) });
              if (BankAccountData[i].getValue(BankAccountResult[5])) {
                case2 = {
                  custbody_rmpay_bbd_cbd: "",
                  subsidary: "",
                  custbody_rmpay_bbd_acct_curr: "",
                  custbody_rmpay_bbd_bank: "",
                  //'bankapi' : ''
                };
              } else {
                case2 = {
                  custbody_rmpay_bbd_cbd: BankAccountData[i].getValue(
                    BankAccountResult[0]
                  ),
                  subsidary: BankAccountData[i].getValue(BankAccountResult[2]),
                  custbody_rmpay_bbd_acct_curr: BankAccountData[i].getValue(
                    BankAccountResult[7]
                  ),
                  custbody_rmpay_bbd_bank: BankAccountData[i].getValue(
                    BankAccountResult[4]
                  ),
                  custbody_rmpay_bbd_bank_country: BankAccountData[i].getValue(
                    BankAccountResult[6]
                  ),
                  //'bankapi' : BankAccountData[i].getValue(BankAccountResult[5])
                };
              }
            } else {
              //Throw error for multiple results with same subsidiary & Prefered Account.
              //throw new Error('multiple results of Bank Account with same subsidiary & marked "PREFERRED COMPANY BANK DETAIL"');
              throw error.create({
                name: "RM_CONFIGRATION_ERROR",
                message:
                  'Multiple results of Bank Account with same subsidiary & marked "PREFERRED COMPANY BANK DETAIL"',
                notifyOff: false,
              });
            }
          } else if (preffFlag) {
            // Found Default bank Account for Company.
            if (!PreFlagFlg) {
              PreFlagFlg = true;
              defaultcase = {
                custbody_rmpay_bbd_cbd: BankAccountData[i].getValue(
                  BankAccountResult[0]
                ),
                subsidary: BankAccountData[i].getValue(BankAccountResult[2]),
                custbody_rmpay_bbd_acct_curr: BankAccountData[i].getValue(
                  BankAccountResult[7]
                ),
                custbody_rmpay_bbd_bank: BankAccountData[i].getValue(
                  BankAccountResult[4]
                ),
                custbody_rmpay_bbd_bank_country: BankAccountData[i].getValue(
                  BankAccountResult[6]
                ),
                //'bankapi': BankAccountData[i].getValue(BankAccountResult[5])
              };
            } else {
              //Throw error for multiple results with Prefered Account.
              //throw new Error('multiple results of Bank Account marked as "PREFERRED COMPANY BANK DETAIL"');
              throw error.create({
                name: "RM_CONFIGRATION_ERROR",
                message:
                  'Multiple results of Bank Account marked as "PREFERRED COMPANY BANK DETAIL"',
                notifyOff: false,
              });
            }
          }
        }
        if (_validateData(case1) && SubCurrFlag) {
          // log.debug({
          //   title: "RM-Pay beforeSubmit",
          //   details: "case1:" + JSON.stringify(case1),
          // });
          return case1;
        } else if (_validateData(case2) && SubPreFlag) {
          // log.debug({
          //   title: "RM-Pay beforeSubmit",
          //   details: "case2:" + JSON.stringify(case2),
          // });
          return case2;
        }
      } else {
        //No Configuration found.
        //throw ""
      }
      return defaultcase;
    }
    function _getActiveCurrencyList() {
      var currencyCreteria = [];
      var currencyColumns = [];
      var returnobject = {};

      currencyCreteria.push(["isinactive", "is", "F"]);
      currencyColumns.push(
        search.createColumn({ name: "name", sort: search.Sort.ASC })
      );
      currencyColumns.push(search.createColumn({ name: "symbol" }));
      currencyColumns.push(search.createColumn({ name: "internalid" }));

      var searchObject = {};
      searchObject.rectype = "currency"; //'customrecord_rmpay_company_bank_details';
      searchObject.filters = currencyCreteria;
      searchObject.columns = currencyColumns;

      var currencyList = _rmsearchData(searchObject);

      for (var c = 0; c < currencyList.length; c++) {
        returnobject[currencyList[c].getValue(currencyColumns[2])] =
          currencyList[c].getValue(currencyColumns[0]);
      }
      return returnobject;
    }
    function _getAllCurrencies(currencyColumns, record_Type) {
      var currencyCreteria = [];

      currencyCreteria.push(["isinactive", "is", "F"]);

      var searchObject = {};
      searchObject.rectype = record_Type; //'customrecord_rmpay_company_bank_details';
      searchObject.filters = currencyCreteria;
      searchObject.columns = currencyColumns;

      return _rmsearchData(searchObject);
    }
    function _generatePayments(rmdata) {
      if (_validateData(rmdata.VendorBill)) {
        var objRecord = record.transform({
          fromType: record.Type.VENDOR_BILL,
          fromId: rmdata.VendorBill,
          toType: record.Type.VENDOR_PAYMENT,
          isDynamic: true,
        });
        // logic to be added to set any Bank refrence details on payments.
        objRecord.setValue({
          fieldId: "tranid",
          value: rmdata.PaymentReference,
        });
        var paymentId = objRecord.save();
        if (_validateData(paymentId)) {
          var id = record.submitFields({
            type: recordType.RMPayBillProposal,
            id: rmdata.CurrentRecId,
            values: {
              custrecord_rmpay_bills_pp_pay_ref: paymentId,
            },
          });
        }
        return paymentId;
      }
    }
    function _getCurrencyExchangeRateDetails(bcurrency, tcurrency, effdate) {
      var currencyExCreteria = [];
      var currencyColumns = [];
      var returndate = true;
      currencyExCreteria.push(["isinactive", "is", "F"]);
      currencyExCreteria.push("AND");
      currencyExCreteria.push([
        "custrecord_rmpay_ce_exchangedate",
        "ON",
        effdate,
        effdate,
      ]);
      if (_validateData(bcurrency)) {
        currencyExCreteria.push("AND");
        currencyExCreteria.push([
          "custrecord_rmpay_cer_parent.custrecord_rmpay_cer_bankcurrency",
          "anyof",
          bcurrency,
        ]);
        returndate = false;
      }
      if (_validateData(tcurrency)) {
        currencyExCreteria.push("AND");
        currencyExCreteria.push([
          "custrecord_rmpay_cer_parent.custrecord_rmpay_cer_trancurrency",
          "anyof",
          tcurrency,
        ]);
      }

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

      var searchObject = {};
      searchObject.rectype = recordType.RMPayExhange; //'customrecord_rmpay_company_bank_details';
      searchObject.filters = currencyExCreteria;
      searchObject.columns = currencyColumns;

      var ExhangeRateData = _rmsearchData(searchObject);
      // log.debug({
      //   title: "ExhangeRateData:",
      //   details: JSON.stringify(ExhangeRateData),
      // });
      if (_validateData(ExhangeRateData)) {
        if (returndate) {
          return ExhangeRateData;
        }
        return ExhangeRateData[0].getValue(currencyColumns[2]);
      }
      return 0;
    }
    function getCurrencyExchangeRate123(baseCurrency) {
      var currencyExchangeRate = 0;
      var url =
        "https://developer-api-testmode.dnb.no/currencies/v1/convert/" +
        baseCurrency;
      var headers = [];
      headers["x-api-key"] = "7fdfe50f5f7d4e37bab8b394d2d39306";
      headers["Content-Type"] = "application/json";
      headers["Host"] = "developer-api-testmode.dnb.no";
      headers["Accept"] = "*/*";

      currencyExchangeRate = https.request({
        method: https.Method.GET,
        url: url,
        body: "",
        headers: headers,
      });
      // log.debug({
      //   title: "Http Reponse:" + baseCurrency,
      //   details: JSON.stringify(currencyExchangeRate),
      // });

      return currencyExchangeRate;
    }
    function getCurrencies(bcurrency, tranCurrency) {
      // log.debug(
      //   "bcurrecny",
      //   bcurrency + " | " + "tranCurrency" + " | " + tranCurrency
      // );
      var baseCurrency = currency.Currency.getInstanceCurrency.getInstance({
        currencyCode: "NOK",
      }); // Replace with your base currency code
      var targetCurrency = currency.Currency.getInstance({
        currencyCode: "EUR",
      }); // Replace with your target currency code

      var exchangeRate = baseCurrency.getExchangeRate({
        targetCurrency: targetCurrency,
        effectiveDate: new Date(), // Retrieve the exchange rate for the current date
      });

      return exchangeRate;
    }
    function _generateErrorRecord(scriptId, deployment_Id, error) {
      var Errorrec = record.create({
        type: "customrecord_rmpay_error_log",
        isDynamic: true,
      });
      Errorrec.setValue({
        fieldId: "custrecord_rmpay_script_id",
        value: scriptId,
      });
      Errorrec.setValue({
        fieldId: "custrecord_rmpay_script_deployment_id",
        value: deployment_Id,
      });
      Errorrec.setValue({
        fieldId: "custrecord_rmpay_error_type",
        value: error.name,
      });
      Errorrec.setValue({
        fieldId: "custrecord_rmpay_error_message",
        value: error.message,
      });
      Errorrec.setValue({
        fieldId: "custrecord_rmpay_error_details",
        value: error,
      });
      var id = Errorrec.save();

      return id;
    }
    function _getBankCurrencyList(cols, record_Type) {
      return _getAllCurrencies(cols, record_Type);
    }
    function _getCurrentExchangeRecord() {
      var currencyExCreteria = [];
      var currencyColumns = [];

      currencyExCreteria.push(["isinactive", "is", "F"]);
      currencyExCreteria.push("AND");
      currencyExCreteria.push([
        "custrecord_rmpay_ce_exchangedate",
        "onorafter",
        "today",
      ]);
      //currencyCreteria.push(["effectivedate","onorafter","today"]);

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

      var searchObject = {};
      searchObject.rectype = recordType.RMPayExhange; //'customrecord_rmpay_company_bank_details';
      searchObject.filters = currencyExCreteria;
      searchObject.columns = currencyColumns;

      var ExhangeRecordData = _rmsearchData(searchObject);

      if (_validateData(ExhangeRecordData)) {
        for (var i = 0; i < ExhangeRecordData.length; i++) {
          return ExhangeRecordData[i].getValue(currencyColumns[1]);
        }
      }
      return null;
    }
    function _getCurrencyDNBExchangeRate(bcurrecny, tcurrency) {
      var currencyExchangeRate = 0;
      var url =
        "https://developer-api.dnb.no/currencies/v1/" +
        tcurrency +
        "/convert/" +
        bcurrecny +
        "?buyAmount=1";
      //var url = "https://developer-api-testmode.dnb.no/currencies/v1/"+tcurrency+"/convert/"+bcurrecny+"?buyAmount=1";
      var headers = [];
      /*headers["x-api-key"] = "7fdfe50f5f7d4e37bab8b394d2d39306";
    headers["Content-Type"] = "application/json";
    headers["Host"] = "developer-api-testmode.dnb.no";*/
      headers["Accept"] = "*/*";
      headers["x-api-key"] = "f11a8161399a4178a39abbcc607e7f0b";
      headers["Content-Type"] = "application/json";
      headers["Host"] = "developer-api.dnb.no";
      //headers["Accept"] = "*/*";

      currencyExchangeRate = https.request({
        method: https.Method.GET,
        url: url,
        body: "",
        headers: headers,
      });
      // log.debug({
      //   title: "Http Reponse:" + bcurrecny,
      //   details: JSON.stringify(currencyExchangeRate),
      // });

      return currencyExchangeRate;
    }
    function _getDataForProposals(poIds, cols, vendorSelected, currencySelected) {
      var FilterCreteria = [];
      FilterCreteria.push(["internalid", "anyof", poIds]);
      // FilterCreteria.push("AND");
      // FilterCreteria.push([
      //   "custrecord_rm_rmpay_processing_in_map_re",
      //   "is",
      //   "F",
      // ]);

      var searchObject = {};
      searchObject.rectype = recordType.RMPayProposal;
      searchObject.filters = FilterCreteria;
      searchObject.columns = cols;
      var searchResult = _rmsearchData(searchObject);
      var jsonObj = {};
      // log.debug("searchResult.length", searchResult.length);
      for (var i = 0; i < searchResult.length; i++) {
        var id = searchResult[i].id;
        var jsonData = {};
        var jsonheaderData = {};
        // log.debug("searchResult:" + i, searchResult[i]);
        /*for(var c=0; c<cols.length;c++) {
          jsonData[cols[c]] = searchResult[i].getValue(cols[c])
        }*/
        
        jsonData["custrecord_rmpay_bills_pp_curr_amt"] = searchResult[
          i
        ].getValue(cols[0]);
        jsonData["custrecord_rmpay_bills_pp_amount"] = searchResult[i].getValue(
          cols[1]
        );
        jsonData["custrecord_rmpay_bills_pp_exrt"] = searchResult[i].getValue(
          cols[2]
        );
        jsonData["custrecord_rmpay_bills_pp_vendorbill"] = {
          id: searchResult[i].getValue(cols[3]),
          txt: searchResult[i].getText(cols[3]),
        };
        log.debug("VBILL==vendorSelected", searchResult[i].getValue(cols[3])+"==="+vendorSelected)
        jsonData["custrecord_rmpay_bills_pp_transnr"] = searchResult[
          i
        ].getValue(cols[4]);
        jsonData["custrecord_rmpay_bills_pp_duedate"] = searchResult[
          i
        ].getValue(cols[5]);
        jsonData["custrecord_rmpay_childid"] = {
          id: searchResult[i].getValue(cols[12]),
          txt: searchResult[i].getText(cols[12]),
        }; //searchResult[i].getValue(cols[13]);
        jsonData["custrecord_rmpay_bills_pp_currency"] = searchResult[
          i
        ].getValue(cols[6]); //{'id':searchResult[i].getValue(cols[6]),'txt':searchResult[i].getText(cols[6])};
        log.debug("currency===currencySelected", searchResult[i].getValue(cols[6])+"===="+currencySelected)
        jsonData["custrecord_rmpay_bills_pp_vendor"] = {
          id: searchResult[i].getValue(cols[7]),
          txt: searchResult[i].getText(cols[7]),
        };
        jsonData["altname"] = searchResult[i].getValue(cols[8]);
        jsonData["custrecord_rmpay_pp_currency"] = searchResult[i].getValue(
          cols[9]
        );
        jsonData["custrecord_rmpay_pp_amount"] = searchResult[i].getValue(
          cols[10]
        );
        jsonData["custrecord_rmpay_pp_nr_of_bills"] = searchResult[i].getValue(
          cols[11]
        );
        jsonData["custrecord_rmpay_pp_status"] = searchResult[i].getValue(
          cols[13]
        )

        if (jsonObj.hasOwnProperty(id)) {
          if((vendorSelected && currencySelected && vendorSelected == searchResult[i].getValue(cols[7]) && currencySelected == searchResult[i].getValue(cols[6])) || (!vendorSelected && !currencySelected)){

            jsonObj[id].push(jsonData);
          }
        } else {
          jsonObj[id] = [];
          if((vendorSelected && currencySelected && vendorSelected == searchResult[i].getValue(cols[7]) && currencySelected == searchResult[i].getValue(cols[6])) || (!vendorSelected && !currencySelected)){
          jsonObj[id].push(jsonData);
          }
        }

         
         

        
      }
      return jsonObj;
    }
    function getAccountvalidation() {}
    function _getExchangeRate(effdate, currencies) {}

    function getconfigData() {
      try {
        rmdata = {};
        var configRec = record.load({
          type: recordType.RMPayGC,
          id: "1",
          isDynamic: true,
        });
        rmdata.custrecord_rmpay_gc_first_approver = configRec.getValue({
          fieldId: "custrecord_rmpay_gc_first_approver",
        });
        rmdata.custrecord_rmpay_gc_second_approver = configRec.getValue({
          fieldId: "custrecord_rmpay_gc_second_approver",
        });
        rmdata.custrecord_rmpay_gc_final_approver = configRec.getValue({
          fieldId: "custrecord_rmpay_gc_final_approver",
        });
        //log.debug("rmdata config", rmdata)
        return rmdata;
      } catch (e) {
        // log.debug("getconfigData ERROR ==>", e.toString());
        rmdata.status = "2";
        rmdata.errorLog = e.toString();
      }
    }
  } catch (error) {
    // log.error("Error in Library FIle", error);
    var scriptId = "RMPay_common_lib";
    var deployment_Id = "RMPay_common_lib";
    _generateErrorRecord(scriptId, deployment_Id, error);
  }

  // Export public functions
  return {
    _globalVariables: _globalVariables,
    _validateData: _validateData,
    _validateRMPay: _validateRMPaySubsidary,
    _getCompanyBankDeatils: _getCompanyBankDeatils,
    _validateRMVendor: _validateRMVendor,
    _getCurrencyExchangeRateDetails: _getCurrencyExchangeRateDetails,
    _getPendingPaymentBills: _getPendingPaymentBills,
    _generatePayments: _generatePayments,
    _generateErrorRecord: _generateErrorRecord,
    _getCurrencyList: _getAllCurrencies,
    _getBankCurrencyList: _getAllCurrencies,
    _getCurrencyExchangeRate: _getCurrencyDNBExchangeRate,
    _getCurrentExchangeRecord: _getCurrentExchangeRecord,
    _getDataForProposals: _getDataForProposals,
    _getconfigData: getconfigData,
    _validateAccount: getAccountvalidation,
    _getExchangeRate: _getExchangeRate,
    _getActiveCurrencyList: _getActiveCurrencyList,
    parseAndFormatDateString: parseAndFormatDateString,
  };
});
