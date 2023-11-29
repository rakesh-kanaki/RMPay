/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
  "N/ui/serverWidget",
  "N/search",
  "N/url",
  "N/redirect",
  "N/runtime",
  "N/record",
  "N/file",
  "./Lib/RMPay_common_lib",
], function (ui, search, url, redirect, runtime, record, file, rmPayLib) {
  var selectedSubsidaires = "";
  var selectedSubsidairestxt = "";
  var roleId = "";
  function onRequest(context) {
    try {
      if (context.request.method === "GET") {
        // Create the Suitelet form
        var form = ui.createForm({
          title: "Proposal Search",
          hideNavBar: true,
        });
        // Get the current user
        var currentUser = runtime.getCurrentUser();

        // Get the current role's ID
        roleId = currentUser.role;

        // log.audit("roleId", roleId);

        if (roleId != 3) {
          var roleRec = record.load({
            type: "ROLE",
            id: roleId,
          });
          selectedSubsidaires = roleRec.getValue("subsidiaryrestriction");
          selectedSubsidairestxt = roleRec.getText("subsidiaryrestriction");
          formFilter = createFilter(
            form,
            selectedSubsidaires,
            selectedSubsidairestxt
          );
        } else {
          formFilter = createFilter(form, "", "");
        }

        from = formFilter.form;
        form = addResult(context, formFilter, selectedSubsidaires);
        form.clientScriptModulePath = "./RM-Pay-CL-Proposal.js";
        //form.clientScriptFileId  = 4586;
        // Add the Submit button to the form
        form.addButton({
          id: "custpage_clear_button",
          label: "Clear",
          functionName: "clear()",
        });

        const dialogHtmlField = form.addField({
          id: "custpage_jqueryui_loading_dialog",
          type: "inlinehtml",
          label: "Dialog HTML Field",
        });
        dialogHtmlField.defaultValue = file
          .load({
            // id: "SuiteScripts/[whatever your path to HTML file is]",
            id: 12971,
          })
          .getContents();

        // Display the Suitelet form
        context.response.writePage(form);
      } else if (context.request.method === "POST") {
        // Retrieve the submitted filter values
        var subsidiary = context.request.parameters.custpage_subsidiary;
        var brand = context.request.parameters.custpage_account;
        var currency = context.request.parameters.custpage_currency;
        // Redirect to the same Suitelet page with URL parameters
        var suiteletUrl = url.resolveScript({
          scriptId: "customscript_rm_rmpay_suitlet",
          deploymentId: "customdeploy_rmpay_suitlet",
        });
        suiteletUrl += "&custpage_subsidiary=" + encodeURIComponent(subsidiary);
        suiteletUrl += "&custpage_account=" + encodeURIComponent(brand);
        suiteletUrl += "&custpage_currency=" + encodeURIComponent(currency);
        redirect.redirect({ url: suiteletUrl });
      }
    } catch (error) {
      log.error("Error In onRequest", error);
      var scriptId = runtime.getCurrentScript().id;
      var deployment_Id = runtime.getCurrentScript().deploymentId;
      rmPayLib._generateErrorRecord(scriptId, deployment_Id, error);
    }
  }
  function addResult(context, formFileter, selectedSubsidaires) {
    // Retrieve the submitted filter values
    var subsidiary = context.request.parameters.custpage_subsidiary;
    var brand = context.request.parameters.custpage_account;
    var currency = context.request.parameters.custpage_currency;
    var selectedLine = context.request.parameters.selectedLine;
    var form = formFileter.form;

    log.debug("urldata=", subsidiary + "|" + brand + "|" + currency);
    log.debug("selectedLine=", selectedLine);

    var lineToShow = [];
    var review = false;
    if (selectedLine && selectedLine != undefined) {
      // Create the Suitelet form
      form = ui.createForm({
        title: "Proposal Search",
        hideNavBar: true,
      });
      log.debug("entry=");
      lineToShow = JSON.parse(selectedLine);
      form.addButton({
        id: "custpage_back_button",
        label: "Back",
        functionName: "backButton()",
      });
      review = true;
    }

    //if ((subsidiary || brand || currency) && selectedLine == undefined){
    if (selectedLine == undefined) {
      form.addButton({
        id: "custpage_preview_button",
        label: "Review",
        functionName: "preview()",
      });
    }

    var defaultSearchFlag;
    log.debug("parameters", subsidiary + "" + brand + "" + currency);
    if (!subsidiary && !brand && !currency) {
      log.debug("Default display");
      defaultSearchFlag = 1;
    } else {
      log.debug("filtered Search display");
      defaultSearchFlag = 0;
    }

    var results = searchResult(
      subsidiary,
      brand,
      currency,
      formFileter,
      defaultSearchFlag,
      selectedSubsidaires
    );

    if (review == false) {
      // Add the sublist to the form
      var sublistParam1 = {};
      sublistParam1.sublistId = "custpage_pending_first_approver";
      sublistParam1.sublistLabel = "Pending First Approver";
      sublistParam1.type = ui.SublistType.LIST;
      var sublist1 = createSublistTable(form, sublistParam1, review, true);

      var sublistParam2 = {};
      sublistParam2.sublistId = "custpage_pending_second_approver";
      sublistParam2.sublistLabel = "Pending Second Approver";
      sublistParam2.type = ui.SublistType.LIST;
      var sublist2 = createSublistTable(form, sublistParam2, review, true);

      var sublistParam3 = {};
      sublistParam3.sublistId = "custpage_pending_final_approver";
      sublistParam3.sublistLabel = "Pending Final Approver";
      sublistParam3.type = ui.SublistType.LIST;
      var sublist3 = createSublistTable(form, sublistParam3, review, true);

      var sublistParam4 = {};
      sublistParam4.sublistId = "custpage_approved";
      sublistParam4.sublistLabel = "Approved";
      sublistParam4.type = ui.SublistType.LIST;
      var sublist4 = createSublistTable(form, sublistParam4, review, false);

      var sublistParam5 = {};
      sublistParam5.sublistId = "custpage_rejected";
      sublistParam5.sublistLabel = "Rejected";
      sublistParam5.type = ui.SublistType.LIST;
      var sublist5 = createSublistTable(form, sublistParam5, review, false);
    } else {
      form.addButton({
        id: "custpage_review_approve_rej",
        label: "Process",
        functionName: "reviewApproveReject()",
      });
      // Add the sublist to the form
      var sublistParam1 = {};
      sublistParam1.sublistId = "custpage_pending_first_approver";
      sublistParam1.sublistLabel = "Pending First Approver";
      sublistParam1.type = ui.SublistType.LIST;
      var sublist1 = createSublistReviewTable(
        form,
        sublistParam1,
        review,
        true
      );

      var sublistParam2 = {};
      sublistParam2.sublistId = "custpage_pending_second_approver";
      sublistParam2.sublistLabel = "Pending Second Approver";
      sublistParam2.type = ui.SublistType.LIST;
      var sublist2 = createSublistReviewTable(
        form,
        sublistParam2,
        review,
        true
      );

      var sublistParam3 = {};
      sublistParam3.sublistId = "custpage_pending_final_approver";
      sublistParam3.sublistLabel = "Pending Final Approver";
      sublistParam3.type = ui.SublistType.LIST;
      var sublist3 = createSublistReviewTable(
        form,
        sublistParam3,
        review,
        true
      );

      var sublistParam4 = {};
      sublistParam4.sublistId = "custpage_approved";
      sublistParam4.sublistLabel = "Approved";
      sublistParam4.type = ui.SublistType.LIST;
      var sublist4 = createSublistReviewTable(
        form,
        sublistParam4,
        review,
        false
      );

      var sublistParam5 = {};
      sublistParam5.sublistId = "custpage_rejected";
      sublistParam5.sublistLabel = "Rejected";
      sublistParam5.type = ui.SublistType.LIST;
      var sublist5 = createSublistReviewTable(
        form,
        sublistParam5,
        review,
        false
      );
    }

    var sublist1Line = 0;
    var sublist2Line = 0;
    var sublist3Line = 0;
    var sublist4Line = 0;
    var sublist5Line = 0;
    // Add the search results to the sublist
    log.debug("Results Length", results.length);
    for (var i = 0; i < results.length; i++) {
      var result = results[i];
      var lineKey = result.getValue({ name: "internalId", summary: "GROUP" });
      log.debug("Result+i", result);
      if (lineToShow.indexOf(lineKey) != -1 || lineToShow.length == 0) {
        log.debug(
          "Result ref Status",
          result.getText({
            name: "custrecord_rmpay_pp_status",
            summary: "GROUP",
          })
        );

        if (
          result.getText({
            name: "custrecord_rmpay_pp_status",
            summary: "GROUP",
          }) == "Pending First Approval"
        ) {
          if (
            result.getValue({
              name: "internalid",
              summary: "COUNT",
              join: "CUSTRECORD_RMPAY_BILLS_PP_PARENT",
            }) != 0
          ) {
            log.debug("entry to sublist condition");
            createSublistTableValues(sublist1, sublist1Line, result);
            sublist1Line++;
          }
        } else if (
          result.getText({
            name: "custrecord_rmpay_pp_status",
            summary: "GROUP",
          }) == "Pending Second Approval"
        ) {
          if (
            result.getValue({
              name: "internalid",
              summary: "COUNT",
              join: "CUSTRECORD_RMPAY_BILLS_PP_PARENT",
            }) != 0
          ) {
            log.debug("entry to sublist condition");
            createSublistTableValues(sublist2, sublist2Line, result);
            sublist2Line++;
          }
        } else if (
          result.getText({
            name: "custrecord_rmpay_pp_status",
            summary: "GROUP",
          }) == "Pending Final Approval"
        ) {
          if (
            result.getValue({
              name: "internalid",
              summary: "COUNT",
              join: "CUSTRECORD_RMPAY_BILLS_PP_PARENT",
            }) != 0
          ) {
            log.debug("entry to sublist condition");
            createSublistTableValues(sublist3, sublist3Line, result);
            sublist3Line++;
          }
        } else if (
          result.getText({
            name: "custrecord_rmpay_pp_status",
            summary: "GROUP",
          }) == "Approved"
        ) {
          log.debug("entry to sublist condition");
          createSublistTableValues(sublist4, sublist4Line, result);
          sublist4Line++;
        } else if (
          result.getText({
            name: "custrecord_rmpay_pp_status",
            summary: "GROUP",
          }) == "Rejected"
        ) {
          createSublistTableValues(sublist5, sublist5Line, result);
          sublist5Line++;
        }
      }
    }
    return form;
  }
  function createSublistTableValues(sublistName, i, result) {
    result.getValue({ name: "custrecord_rmpay_pp_status", summary: "GROUP" });
    var valueIdArr = createTableValueJson();
    log.debug("valueIdArr", valueIdArr);

    for (var k = 0; k < valueIdArr.length; k++) {
      log.debug("valueIdArr111", valueIdArr[k]);
      if (valueIdArr[k].sublistid == "custpage_itemcount") {
        sublistName.setSublistValue({
          id: valueIdArr[k].sublistid,
          line: i,
          value: result.getValue({
            name: valueIdArr[k].id,
            summary: valueIdArr[k].summary,
            join: valueIdArr[k].join,
          }),
        });
      } else if (
        result.getValue({
          name: valueIdArr[k].id,
          summary: valueIdArr[k].summary,
        })
      ) {
        sublistName.setSublistValue({
          id: valueIdArr[k].sublistid,
          line: i,
          //value: result.getValue({name:valueIdArr[k].id ,summary:valueIdArr[k].summary})
          value:
            valueIdArr[k].type == "txt"
              ? result.getText({
                  name: valueIdArr[k].id,
                  summary: valueIdArr[k].summary,
                })
              : result.getValue({
                  name: valueIdArr[k].id,
                  summary: valueIdArr[k].summary,
                }),
        });
      }
    }
  }
  function createTableValueJson() {
    var valueIdArr = [
      {
        sublistid: "custpage_proposal_id",
        id: "name",
        summary: "GROUP",
        type: "val",
      },
      //{sublistid:'custpage_date',id:"created",summary: "GROUP",type:"val"},
      //{sublistid:'custpage_date',id:"created",summary: "GROUP",type:"val"},
      {
        sublistid: "custpage_altname",
        id: "altname",
        summary: "GROUP",
        type: "val",
      },
      {
        sublistid: "custpage_amount",
        id: "custrecord_rmpay_pp_amount",
        summary: "SUM",
        type: "val",
      },
      {
        sublistid: "custpage_status",
        id: "custrecord_rmpay_pp_status",
        summary: "GROUP",
        type: "txt",
      },
      {
        sublistid: "custpage_status_val",
        id: "custrecord_rmpay_pp_status",
        summary: "GROUP",
        type: "val",
      },
      {
        sublistid: "custpage_internalid",
        id: "internalid",
        summary: "GROUP",
        type: "val",
      },
      {
        sublistid: "custpage_first_approver",
        id: "custrecord_rmpay_pp_first_approver",
        summary: "GROUP",
        type: "txt",
      },
      {
        sublistid: "custpage_first_approver_val",
        id: "custrecord_rmpay_pp_first_approver",
        summary: "GROUP",
        type: "val",
      },
      {
        sublistid: "custpage_second_approver",
        id: "custrecord_rmpay_pp_second_approver",
        summary: "GROUP",
        type: "txt",
      },
      {
        sublistid: "custpage_second_approver_val",
        id: "custrecord_rmpay_pp_second_approver",
        summary: "GROUP",
        type: "val",
      },
      {
        sublistid: "custpage_final_approver",
        id: "custrecord_rmpay_pp_final_approver",
        summary: "GROUP",
        type: "txt",
      },
      {
        sublistid: "custpage_final_approver_val",
        id: "custrecord_rmpay_pp_final_approver",
        summary: "GROUP",
        type: "val",
      },
      {
        sublistid: "custpage_itemcount",
        id: "internalid",
        summary: "COUNT",
        join: "CUSTRECORD_RMPAY_BILLS_PP_PARENT",
        type: "val",
      },
      {
        sublistid: "custpage_pp_subsidiary",
        id: "custrecord_rmpay_pp_subsidiary",
        summary: "GROUP",
        type: "val",
      },
    ];
    return valueIdArr;
  }
  function createSublistTable(form, sublistParam, isSelectOption) {
    var columnArray = createTableHeaderJson(isSelectOption);
    var sublist = form.addSublist({
      id: sublistParam.sublistId,
      type: sublistParam.type,
      label: sublistParam.sublistLabel,
    });
    sublist.addMarkAllButtons();
    // Add the line fields to the sublist
    for (var i = 0; i < columnArray.length; i++) {
      sublist.addField(columnArray[i]);
    }
    //Hide Internal ID Column
    var internalIdField = sublist.getField({
      id: "custpage_internalid",
    });
    internalIdField.updateDisplayType({
      displayType: ui.FieldDisplayType.HIDDEN,
    });

    //Hide First Approver Val
    var firstApproverVal = sublist.getField({
      id: "custpage_first_approver_val",
    });
    firstApproverVal.updateDisplayType({
      displayType: ui.FieldDisplayType.HIDDEN,
    });

    //Hide Second Approver Val
    var secondApproverVal = sublist.getField({
      id: "custpage_second_approver_val",
    });
    secondApproverVal.updateDisplayType({
      displayType: ui.FieldDisplayType.HIDDEN,
    });

    //Hide Final Approver Val
    var finalApproverVal = sublist.getField({
      id: "custpage_final_approver_val",
    });
    finalApproverVal.updateDisplayType({
      displayType: ui.FieldDisplayType.HIDDEN,
    });

    //Subsidiary Inline
    var pp_Subsidiary = sublist.getField({
      id: "custpage_pp_subsidiary",
    });
    pp_Subsidiary.updateDisplayType({
      displayType: ui.FieldDisplayType.INLINE,
    });

    return sublist;
  }
  function createTableHeaderJson(isSelectOption) {
    var columnArray = [
      {
        id: "custpage_select",
        type: ui.FieldType.CHECKBOX,
        label: "Select",
        displayType: isSelectOption ? ui.FieldDisplayType.HIDDEN : "",
      },
      {
        id: "custpage_internalid",
        type: ui.FieldType.TEXT,
        label: "ID",
      },
      {
        id: "custpage_proposal_id",
        type: ui.FieldType.TEXT,
        label: "Proposal ID",
      },
      // {
      //     id: 'custpage_date',
      //     type: ui.FieldType.DATE,
      //     label: 'Date Created'
      // },
      {
        id: "custpage_altname",
        type: ui.FieldType.TEXT,
        label: "Name",
      },
      {
        id: "custpage_first_approver",
        type: ui.FieldType.TEXT,
        label: "First Approver",
      },
      {
        id: "custpage_first_approver_val",
        type: ui.FieldType.TEXT,
        label: "First Approver Val",
      },
      {
        id: "custpage_second_approver",
        type: ui.FieldType.TEXT,
        label: "Second Approver",
      },
      {
        id: "custpage_second_approver_val",
        type: ui.FieldType.TEXT,
        label: "Second Approver Val",
      },
      {
        id: "custpage_final_approver",
        type: ui.FieldType.TEXT,
        label: "Final Approver",
      },
      {
        id: "custpage_final_approver_val",
        type: ui.FieldType.TEXT,
        label: "Final Approver Val",
      },
      {
        id: "custpage_amount",
        type: ui.FieldType.CURRENCY,
        label: "Amount",
      },
      {
        id: "custpage_status",
        type: ui.FieldType.TEXT,
        label: "Status",
      },
      {
        id: "custpage_itemcount",
        type: ui.FieldType.TEXT,
        label: "Items Count",
      },
      {
        id: "custpage_pp_subsidiary",
        type: ui.FieldType.SELECT,
        label: "Subsidiary",
        source: "subsidiary",
      },
    ];
    return columnArray;
  }
  function createSublistReviewTable(form, sublistParam, isSelectOption) {
    var columnArray = createReviewTableHeaderJson(isSelectOption);
    var sublist = form.addSublist({
      id: sublistParam.sublistId,
      type: sublistParam.type,
      label: sublistParam.sublistLabel,
    });
    //sublist.addMarkAllButtons(); Hide Buttons
    // Add the line fields to the sublist
    for (var i = 0; i < columnArray.length; i++) {
      sublist.addField(columnArray[i]);
    }
    //Reject Reason code
    var rejectReason = sublist.getField({
      id: "custpage_reject_reason",
    });
    rejectReason.updateDisplayType({ displayType: ui.FieldDisplayType.ENTRY });
    rejectReason.updateDisplayType({
      displayType: ui.FieldDisplayType.DISABLED,
    });

    //Hide Internal ID Column
    var internalIdField = sublist.getField({
      id: "custpage_internalid",
    });
    internalIdField.updateDisplayType({
      displayType: ui.FieldDisplayType.HIDDEN,
    });
    //Hide Status Val
    var status_Val = sublist.getField({
      id: "custpage_status_val",
    });
    status_Val.updateDisplayType({
      displayType: ui.FieldDisplayType.HIDDEN,
    });
    return sublist;
  }
  function createReviewTableHeaderJson(isSelectOption) {
    var columnArray = [
      {
        id: "custpage_detail_review",
        type: ui.FieldType.CHECKBOX,
        label: "Detail Review",
        displayType: isSelectOption ? ui.FieldDisplayType.HIDDEN : "",
      },
      {
        id: "custpage_approve",
        type: ui.FieldType.CHECKBOX,
        label: "Approve",
        displayType: isSelectOption ? ui.FieldDisplayType.HIDDEN : "",
      },
      {
        id: "custpage_reject",
        type: ui.FieldType.CHECKBOX,
        label: "Reject",
        displayType: isSelectOption ? ui.FieldDisplayType.HIDDEN : "",
      },
      {
        id: "custpage_internalid",
        type: ui.FieldType.TEXT,
        label: "ID",
      },
      {
        id: "custpage_proposal_id",
        type: ui.FieldType.TEXT,
        label: "Proposal ID",
      },
      // {
      //     id: 'custpage_date',
      //     type: ui.FieldType.DATE,
      //     label: 'Created Date'
      // },
      {
        id: "custpage_altname",
        type: ui.FieldType.TEXT,
        label: "Name",
      },
      {
        id: "custpage_itemcount",
        type: ui.FieldType.TEXT,
        label: "Item Count",
      },
      {
        id: "custpage_amount",
        type: ui.FieldType.CURRENCY,
        label: "Amount",
      },
      {
        id: "custpage_status",
        type: ui.FieldType.TEXT,
        label: "Status",
      },
      {
        id: "custpage_status_val",
        type: ui.FieldType.TEXT,
        label: "Status Val",
      },
      {
        id: "custpage_first_approver",
        type: ui.FieldType.TEXT,
        label: "First Approver",
      },
      {
        id: "custpage_second_approver",
        type: ui.FieldType.TEXT,
        label: "Second Approver",
      },
      {
        id: "custpage_final_approver",
        type: ui.FieldType.TEXT,
        label: "Final Approver",
      },
      {
        id: "custpage_reject_reason",
        type: ui.FieldType.TEXT,
        label: "Rejection Reason",
      },
    ];
    return columnArray;
  }
  function searchResult(
    subsidiary,
    brand,
    currency,
    formFileter,
    defaultSearchFlag,
    selectedSubsidaires
  ) {
    var subsidiaryField = formFileter.subsidiaryField;
    var accountField = formFileter.accountField;
    var currencyField = formFileter.currencyField;
    // Create the search filters based on the submitted values
    var filters = [];
    log.debug("defaultSearchFlag===", defaultSearchFlag);
    if (defaultSearchFlag == 0) {
      if (subsidiary && subsidiary != undefined) {
        filters.push(["custrecord_rmpay_pp_subsidiary", "anyof", subsidiary]);
        subsidiaryField.defaultValue = subsidiary;
      }

      if (subsidiary && brand) {
        filters.push("AND");
      }
      if (brand && brand != undefined) {
        filters.push([
          "custrecord_rmpay_pp_company_bank_detail",
          "anyof",
          brand,
        ]);
        accountField.defaultValue = brand;
      }
      if ((currency && brand) || (subsidiary && currency)) {
        filters.push("AND");
      }
      if (currency && currency != undefined) {
        //filters.push(['entity', 'is', customerId]);
        //currencyField.defaultValue = customerId;
        filters.push(["custrecord_rmpay_pp_currency", "anyof", currency]);
        currencyField.defaultValue = currency;
      }
      filters.push("AND");
      filters.push(["custrecord_rm_rmpay_processing_in_map_re", "is", "F"]);
    } else {
      filters.push(["name", "isnotempty", ""]);
      if (selectedSubsidaires && selectedSubsidaires != undefined) {
        filters.push("AND");
        filters.push([
          "custrecord_rmpay_pp_subsidiary",
          "anyof",
          selectedSubsidaires,
        ]);
        // subsidiaryField.defaultValue = subsidiary;
      }
      filters.push("AND");
      filters.push(["custrecord_rm_rmpay_processing_in_map_re", "is", "F"]);
    }
    log.debug("urldata=", filters);
    log.audit("roleID", roleId);
    // Create the search columns for the sales orders
    var columns = [
      search.createColumn({
        name: "created",
        summary: "GROUP",
        label: "Date Created",
      }),
      search.createColumn({
        name: "altname",
        summary: "GROUP",
        label: "Name",
      }),
      search.createColumn({
        name: "name",
        summary: "GROUP",
        label: "ID",
      }),
      search.createColumn({
        name: "internalid",
        summary: "GROUP",
        label: "Internal ID",
      }),
      search.createColumn({
        name: "internalid",
        summary: search.Summary.COUNT,
        join: "CUSTRECORD_RMPAY_BILLS_PP_PARENT",
        label: "Item",
      }),
      search.createColumn({
        name: "custrecord_rmpay_pp_first_approver",
        summary: "GROUP",
        label: "First Approver",
      }),
      search.createColumn({
        name: "custrecord_rmpay_pp_second_approver",
        summary: "GROUP",
        label: "Second Approver",
      }),
      search.createColumn({
        name: "custrecord_rmpay_pp_final_approver",
        summary: "GROUP",
        label: "Final Approver",
      }),
      search.createColumn({
        name: "custrecord_rmpay_pp_status",
        summary: "GROUP",
        label: "Status",
      }),
      search.createColumn({
        name: "custrecord_rmpay_pp_amount",
        summary: "SUM",
        label: "Amount",
      }),
      search.createColumn({
        name: "created",
        summary: "GROUP",
        label: "PP Date Created",
      }),
      search.createColumn({
        name: "custrecord_rmpay_pp_subsidiary",
        summary: "GROUP",
        label: "Subsidiary",
      }),
    ];
    var results = 0;
    log.debug("filters.length", filters.length);
    if (filters.length > 0) {
      // Perform the search
      var proposalSearch = search.create({
        type: "customrecord_rmpay_payment_proposal",
        filters: filters,
        columns: columns,
      });
      results = proposalSearch.run().getRange({
        start: 0,
        end: 1000, // Adjust this number based on your needs
      });
    }
    return results;
  }
  function createFilter(form, selectedSubsidaires, selectedSubsidairestxt) {
    var formFilter = {};
    // Add the filter fields to the form
    if (selectedSubsidaires != "") {
      formFilter.subsidiaryField = form.addField({
        id: "custpage_subsidiary",
        type: ui.FieldType.SELECT,
        label: "Select Subsidiary",
      });

      // selectedSubsidaires = selectedSubsidaires.split(",");
      // selectedSubsidairestxt = selectedSubsidairestxt.split(",");

      log.audit(
        "selectedSubsidaires",
        selectedSubsidaires + " " + selectedSubsidairestxt
      );
      for (i = 0; i < selectedSubsidaires.length; i++) {
        formFilter.subsidiaryField.addSelectOption({
          value: selectedSubsidaires[i],
          text: selectedSubsidairestxt[i],
        });
      }
    } else {
      formFilter.subsidiaryField = form.addField({
        id: "custpage_subsidiary",
        type: ui.FieldType.SELECT,
        label: "Select Subsidiary",
        source: "subsidiary",
      });
    }

    formFilter.accountField = form.addField({
      id: "custpage_account",
      type: ui.FieldType.SELECT,
      label: "Select Account",
      source: "account",
    });
    formFilter.currencyField = form.addField({
      id: "custpage_currency",
      type: ui.FieldType.SELECT,
      label: "Select Currency",
      source: "currency",
    });
    form.addSubmitButton({
      label: "Search",
    });
    formFilter.form = form;
    return formFilter;
  }
  return {
    onRequest: onRequest,
  };
});
