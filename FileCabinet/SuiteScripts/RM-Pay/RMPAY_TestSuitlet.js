/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([
  "N/ui/serverWidget",
  "N/record",
  "N/search",
  "./Lib/RMPay_common_lib",
], function (serverWidget, record, search, rmlib) {
  return {
    onRequest: function (params) {
      var form = serverWidget.createForm({
        title: "Proposal Details",
        hideNavBar: true,
      });
      form.clientScriptModulePath = "./RM-Pay-CL-Proposal.js";
      log.debug({
        title: "params",
        details: JSON.stringify(params),
      });
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
      var ResultsColums = [];
      var CUSTRECORD_RMPAY_BILLS_PP_PARENT = "CUSTRECORD_RMPAY_BILLS_PP_PARENT";
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
        search.createColumn({ name: "altname", label: "Name" })
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

      poIds = JSON.parse(poIds);
      poNumbers = JSON.parse(poNumbers);
      if (poIds.length > 0) {
        var dataResult = rmlib._getDataForProposals(poIds, ResultsColums);
        log.debug({
          title: "dataResult",
          details: JSON.stringify(dataResult),
        });
        for (var i = 0; i < poIds.length; i++) {
          var subtab_n = form.addTab({
            id: "custpagetab_" + i,
            label: poNumbers[i],
          });
          var list = serverWidget.createList({
            title : 'Simple List'
        });
        list.addColumn({
            id : 'column1',
            type : serverWidget.FieldType.TEXT,
            label : 'Text',
            align : serverWidget.LayoutJustification.RIGHT
        });
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
    },
  };
});
