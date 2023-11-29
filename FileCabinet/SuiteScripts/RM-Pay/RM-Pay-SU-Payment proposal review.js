/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([
  "N/ui/serverWidget",
  "N/record",
  "N/search",
  "N/runtime",
  "N/url",
  "./Lib/RMPay_common_lib",
], function (serverWidget, record, search, runtime, url, rmlib) {
  try {
    return {
      onRequest: function (params) {
        var form = serverWidget.createForm({
          title: "Proposal Details",
          hideNavBar: true,
        });
        /*var currentUserDetails = form.addField({
            id: "custpage_loginuser",
            type: serverWidget.FieldType.SELECT,
            label: "Login User:",
            source: "employee",
          });*/

          var vendorSelected = params.request.parameters.vendorSelected;
          var currencySelected = params.request.parameters.currencySelected;
  
          if(!rmlib._validateData(vendorSelected)){
            vendorSelected = ''
          }
          if(!rmlib._validateData(currencySelected)){
            currencySelected = ''
          }

        var form = serverWidget.createForm({
          title: "New Filter",
          hideNavBar: true,
        });
        form.addField({
          id: "custpage_vendor_filter",
          type: serverWidget.FieldType.SELECT,
          source: "vendor",
          label: "Vendor",
        }).defaultValue = vendorSelected
        form.addField({
          id: "custpage_currency_filter",
          type: serverWidget.FieldType.SELECT,
          source: "currency",
          label: "Currency",
        }).defaultValue = currencySelected
        form.addButton({
          id: "custpage_filter",
          label: "Submit",
          functionName: "screenThreeGlobalFilter()",
        });

        form.clientScriptModulePath = "./RM-Pay-CL-Proposal.js";
        log.debug({
          title: "params",
          details: JSON.stringify(params),
        });
        var cs = runtime.getCurrentScript();

        var poIds = params.request.parameters.poIds;
        log.debug({
          title: "poIds",
          details: poIds,
        });
        var poNumbers = params.request.parameters.poNumbers;
        log.debug({
          title: "poNumbers",
          details: poNumbers,
        });

        
        log.debug("vendorSelected----", vendorSelected)
        log.debug("currencySelected----", currencySelected)
        var ResultsColums = [];
        var CUSTRECORD_RMPAY_BILLS_PP_PARENT =
          "CUSTRECORD_RMPAY_BILLS_PP_PARENT";
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_curr_amt",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Amount In Account Currency",
          })
        ); //  ---1
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_amount",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Amount",
          })
        ); //  ---2
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_exrt",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Exchange Rate",
          })
        ); //  ---3
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_vendorbill",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Vendor Bill",
          })
        ); //  //  ---4
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_transnr",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Transaction ID",
          })
        ); //  ---5
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_duedate",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Due Date",
          })
        ); //  ---6
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_currency",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Currency",
          })
        ); //  ---7
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_bills_pp_vendor",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Vendor",
          })
        ); //  ---8
        ResultsColums.push(
          search.createColumn({
            name: "altname",
            label: "Name",
          })
        ); //  ---9
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_pp_currency",
            label: "Currency",
          })
        ); //  ---10
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_pp_amount",
            label: "Amount",
          })
        ); //  ---11
        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_pp_nr_of_bills",
            label: "Number of Bills",
          })
        ); //  ---12
        ResultsColums.push(
          search.createColumn({
            name: "internalid",
            join: CUSTRECORD_RMPAY_BILLS_PP_PARENT,
            label: "Child Id",
          })
        ); //  ---13

        ResultsColums.push(
          search.createColumn({
            name: "custrecord_rmpay_pp_status",
            label: "Status",
          })
        ); //  ---14

        poIds = JSON.parse(poIds);
        poNumbers = JSON.parse(poNumbers);
        if (poIds.length > 0) {
          var dataResult = rmlib._getDataForProposals(poIds, ResultsColums, vendorSelected, currencySelected);
          
          
          log.debug({
            title: "dataResult",
            details: JSON.stringify(dataResult),
          });
          var reclink = "";
          var vendorlink = "";
          for (var i = 0; i < poIds.length; i++) {
            /*var scriptURL = url.resolveScript({
                    scriptId: cs.id,
                    deploymentId: cs.deploymentId,
                    returnExternalURL: true
                  });
                  
                  log.debug({
                    title: "scriptURL",
                    details: scriptURL,
                  });*/
            var subtab_n = form.addTab({
              id: "custpagetab_" + i,
              label: poNumbers[i],
            });
            var sublistObj2 = form.addSublist({
              id: "custtab_" + poIds[i],
              type: serverWidget.SublistType.LIST,
              tab: "custpagetab_" + i,
              label: "Total:",
            });
            sublistObj2
              .addField({
                //id: 'custpage_select_' + poIds[i],
                id: "custpage_select",
                type: serverWidget.FieldType.CHECKBOX,
                label: "Select",
              })
              .updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY,
              });
            sublistObj2.addMarkAllButtons();
            sublistObj2.addField({
              id: "custrecord_rmpay_bills_pp_transnr_" + poIds[i],
              type: serverWidget.FieldType.TEXT,
              label: "Transaction NO",
            });

            sublistObj2
              .addField({
                id: "custrecord_rmpay_bills_pp_vendorbill_" + poIds[i],
                type: serverWidget.FieldType.TEXT,
                source: "transaction",
                label: "Vendor Bill",
              })
              .updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE,
              });
            sublistObj2
              .addField({
                id: "custrecord_rmpay_bills_pp_vendor_" + poIds[i],
                type: serverWidget.FieldType.TEXT,
                source: "vendor",
                label: "Vendor",
              })
              .updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE,
              });
            sublistObj2.addField({
              id: "custrecord_rmpay_bills_pp_duedate_" + poIds[i],
              type: serverWidget.FieldType.DATE,
              label: "Due Date",
            });
            var uniqfld = sublistObj2.addField({
              id: "custrecord_rmpay_bills_pp_curr_amt_" + poIds[i],
              type: serverWidget.FieldType.CURRENCY,
              label: "Amount In Account Currency",
            });
            sublistObj2.updateTotallingFieldId({
              id: "custrecord_rmpay_bills_pp_curr_amt_" + poIds[i],
            });
            sublistObj2
              .addField({
                id: "custrecord_rmpay_bills_pp_currency_" + poIds[i],
                type: serverWidget.FieldType.SELECT,
                label: "Currency",
                source: "currency",
              })
              .updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE,
              });
            sublistObj2
              .addField({
                id: "custrecord_rmpay_bills_pp_exrt_" + poIds[i],
                type: serverWidget.FieldType.FLOAT,
                label: "Exchange Rate",
              })
              .updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE,
              });
            sublistObj2.addField({
              id: "custrecord_rmpay_bills_pp_amount_" + poIds[i],
              type: serverWidget.FieldType.CURRENCY,
              label: "Bill Amount",
            });

            sublistObj2
              .addField({
                id: "custrecord_rmpay_child_id_" + poIds[i],
                type: serverWidget.FieldType.TEXT,
                label: "ID",
              })
              .updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE,
              });

            //var sublistId = "approve"
            sublistObj2.addButton({
              id: "custpage_approve_" + poIds[i],
              label: "Approve",
              //functionName: 'approveScreenThree("'+i+'","'+sublistId+'")'
              functionName:
                'actionScreenThree("' +
                i +
                '","approve","' +
                poIds[i] +
                '","' +
                poNumbers[i] +
                '")',
            });
            sublistObj2.addButton({
              id: "custpage_reject_" + poIds[i],
              label: "Reject",
              functionName:
                'actionScreenThree("' +
                i +
                '","reject","' +
                poIds[i] +
                '","' +
                poNumbers[i] +
                '")',
            });
            sublistObj2.addButton({
              id: "custpage_save_" + poIds[i],
              label: "Save",
              functionName:
                'actionScreenThree("' +
                i +
                '","save","' +
                poIds[i] +
                '","' +
                poNumbers[i] +
                '")',
            });
            //var vendorlink = '';
            for (var d = 0; d < dataResult[poIds[i]].length; d++) {
              var rdata = dataResult[poIds[i]][d];
              if (d == 0) {
                /*form.updateDefaultValues({
                                  custpage_text : 'Text Goes Here'
                              })*/

                log.debug({
                  title: "header values",
                  details: JSON.stringify(rdata),
                });
                // form.addField({
                //   id: 'custrecord_rmpay_bills_pp_flag',
                //   type: serverWidget.FieldType.CHECKBOX,
                //   label: 'Processed',
                // })
                form
                  .addField({
                    id: "altname_" + poIds[i],
                    type: serverWidget.FieldType.TEXT,
                    label: "Name",
                    container: "custpagetab_" + i,
                  })
                  .updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE,
                  }).defaultValue = rdata.altname;

                form
                  .addField({
                    id: "custrecord_rmpay_pp_currency_" + poIds[i],
                    type: serverWidget.FieldType.SELECT,
                    label: "Currency",
                    source: "currency",
                    container: "custpagetab_" + i,
                  })
                  .updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE,
                  }).defaultValue = rdata.custrecord_rmpay_pp_currency;

                form
                  .addField({
                    id: "custrecord_rmpay_pp_amount_" + poIds[i],
                    type: serverWidget.FieldType.TEXT,
                    label: "Total Amount",
                    container: "custpagetab_" + i,
                  })
                  .updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE,
                  }).defaultValue = rdata.custrecord_rmpay_pp_amount;
                form
                  .addField({
                    id: "custrecord_rmpay_pp_nr_of_bills_" + poIds[i],
                    type: serverWidget.FieldType.TEXT,
                    label: "Number of bills",
                    container: "custpagetab_" + i,
                  })
                  .updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE,
                  }).defaultValue = rdata.custrecord_rmpay_pp_nr_of_bills;
                form
                  .addField({
                    id: "custrecord_rmpay_pp_status_" + poIds[i],
                    type: serverWidget.FieldType.TEXT,
                    label: "Status",
                    container: "custpagetab_" + i,
                  })
                  .updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN,
                  }).defaultValue = rdata.custrecord_rmpay_pp_status;
              }
              //var hyperlink = '<a href="/app/common/record/employee.nl?id=' + internalId + '">' + displayValue + '</a>';
              //var hyperlink = 'https://2578009.app.netsuite.com/app/accounting/transactions/vendbill.nl?id='+rdata.custrecord_rmpay_childid.id+'&whence=';
              //var hyperlink = 'https://2578009.app.netsuite.com/app/common/custom/custrecordentry.nl?rectype=227&id='+rdata.custrecord_rmpay_childid.id;

              if (rdata.custrecord_rmpay_bills_pp_vendorbill.id) {
                //var hyperlink = '<a href="https://2578009.app.netsuite.com/app/accounting/transactions/vendbill.nl?id='+rdata.custrecord_rmpay_bills_pp_vendorbill.id+'">'+rdata.custrecord_rmpay_bills_pp_vendorbill.txt+'</a>';
                var hyperlinkurl =
                  "https://2578009.app.netsuite.com/app/accounting/transactions/vendbill.nl?id=" +
                  rdata.custrecord_rmpay_bills_pp_vendorbill.id +
                  "&whence=";
                //var hyperlink = '<a href="'+hyperlinkurl+'">'+rdata.custrecord_rmpay_bills_pp_vendorbill.txt+'</a>';
                if (rmlib._validateData(reclink)) {
                  var urldata = reclink.split("?");
                  var parmdata = urldata[1].split("&");
                  var valuedata =
                    "id=" + rdata.custrecord_rmpay_bills_pp_vendorbill.id;

                  reclink = urldata[0] + "?" + valuedata + "&" + parmdata[1];
                } else {
                  reclink = resolveRecordUrl(
                    rdata.custrecord_rmpay_bills_pp_vendorbill.id,
                    record.Type.VENDOR_BILL
                  );
                }

                // log.debug({
                //   title: 'reclink',
                //   details: reclink
                // })
                var hyperlink =
                  '<a href="' +
                  reclink +
                  '">' +
                  rdata.custrecord_rmpay_bills_pp_vendorbill.txt +
                  "</a>";
                sublistObj2.setSublistValue({
                  id: "custrecord_rmpay_bills_pp_vendorbill_" + poIds[i],
                  line: d,
                  value: hyperlink,
                });

                sublistObj2.setSublistValue({
                  id: "custrecord_rmpay_child_id_" + poIds[i],
                  line: d,
                  value: rdata.custrecord_rmpay_childid.id
                    ? rdata.custrecord_rmpay_childid.id
                    : " ",
                });
              }
              sublistObj2.setSublistValue({
                id: "custrecord_rmpay_bills_pp_transnr_" + poIds[i],
                line: d,
                value: rdata.custrecord_rmpay_bills_pp_transnr
                  ? rdata.custrecord_rmpay_bills_pp_transnr
                  : " ",
              });
              if (rdata.custrecord_rmpay_bills_pp_duedate) {
                sublistObj2.setSublistValue({
                  id: "custrecord_rmpay_bills_pp_duedate_" + poIds[i],
                  line: d,
                  value: rdata.custrecord_rmpay_bills_pp_duedate,
                });
              }
              //custrecord_rmpay_bills_pp_exrt_
              sublistObj2.setSublistValue({
                id: "custrecord_rmpay_bills_pp_exrt_" + poIds[i],
                line: d,
                value: rdata.custrecord_rmpay_bills_pp_exrt
                  ? rdata.custrecord_rmpay_bills_pp_exrt
                  : " ",
              });
              sublistObj2.setSublistValue({
                id: "custrecord_rmpay_bills_pp_curr_amt_" + poIds[i],
                line: d,
                value: rdata.custrecord_rmpay_bills_pp_curr_amt
                  ? rdata.custrecord_rmpay_bills_pp_curr_amt
                  : " ",
              });
              sublistObj2.setSublistValue({
                id: "custrecord_rmpay_bills_pp_currency_" + poIds[i],
                line: d,
                value: rdata.custrecord_rmpay_bills_pp_currency
                  ? rdata.custrecord_rmpay_bills_pp_currency
                  : " ",
              });
              sublistObj2.setSublistValue({
                id: "custrecord_rmpay_bills_pp_amount_" + poIds[i],
                line: d,
                value: rdata.custrecord_rmpay_bills_pp_amount
                  ? rdata.custrecord_rmpay_bills_pp_amount
                  : " ",
              });
              //custrecord_rmpay_bills_pp_vendor
              if (rdata.custrecord_rmpay_bills_pp_vendor.id) {
                // sublistObj2.setSublistValue({
                //   id: "custrecord_rmpay_bills_pp_vendor_" + poIds[i],
                //   line: d,
                //   value: rdata.custrecord_rmpay_bills_pp_vendor.id
                //     ? rdata.custrecord_rmpay_bills_pp_vendor.id
                //     : " ",
                // });
                if (rmlib._validateData(vendorlink)) {
                  var urldata = vendorlink.split("?");
                  var parmdata = urldata[1].split("&");
                  var valuedata =
                    "id=" + rdata.custrecord_rmpay_bills_pp_vendor.id;

                  vendorlink = urldata[0] + "?" + valuedata + "&" + parmdata[1];
                } else {
                  vendorlink = resolveRecordUrl(
                    rdata.custrecord_rmpay_bills_pp_vendor.id,
                    record.Type.VENDOR
                  );
                }

                // log.debug({
                //   title: "vendorlink",
                //   details: vendorlink,
                // });
                var hyperlink =
                  '<a href="' +
                  vendorlink +
                  '">' +
                  rdata.custrecord_rmpay_bills_pp_vendor.txt +
                  "</a>";
                sublistObj2.setSublistValue({
                  id: "custrecord_rmpay_bills_pp_vendor_" + poIds[i],
                  line: d,
                  value: hyperlink,
                });
              }
              //id: 'custpage_select_' + poIds[i],
              sublistObj2.setSublistValue({
                id: "custpage_select",
                line: d,
                value: "T",
              });
            }
          }
        } else {
          //form = "No Propols";
          var htmlImage = form.addField({
            id: "custpage_htmlfield",
            type: serverWidget.FieldType.INLINEHTML,
            label: "HTML Image",
          });
          //htmlImage.defaultValue = "<img src='https://<accountID>.app.netsuite.com/images/logos/netsuite-oracle.svg' alt='Oracle Netsuite logo'>";
          htmlImage.defaultValue = "No Proposals Found.";
        }
        params.response.writePage(form);

        // if (params.request.method === "POST") {
        //   // Set the processing state to 'processing'
        //   params.response.write(
        //     '<script>document.getElementById("custpage_processing_image").style.display = "block";</script>'
        //   );
        // }
        function resolveRecordUrl(recid, rec_type) {
          var scheme = "https://";
          var host = url.resolveDomain({
            hostType: url.HostType.APPLICATION,
          });
          var relativePath = url.resolveRecord({
            recordType: rec_type,
            recordId: recid,
            isEditMode: false,
          });
          return scheme + host + relativePath;
        }
      },
    };
  } catch (error) {
    log.error("Error in onRequest() ", error);
    var scriptId = runtime.getCurrentScript().id;
    var deployment_Id = runtime.getCurrentScript().deploymentId;
    rmlib._generateErrorRecord(scriptId, deployment_Id, error);
  }
});
