/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/currency', 'N/email', 'N/error', 'N/log', 'N/search', './Lib/RMPay_common_lib'],
    /**
 * @param{currency} currency
 * @param{email} email
 * @param{error} error
 * @param{log} log
 * @param{search} search
 */
    (currency, email, error, log, search, rmlib) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            try {
                var PaymentColums = [];
                PaymentColums.push(search.createColumn({ name: 'custrecord_rmpay_bills_pp_parent' }));
                PaymentColums.push(search.createColumn({ name: 'custrecord_rmpay_bills_pp_resp_rec' }));
                PaymentColums.push(search.createColumn({ name: 'custrecord_rmpay_bills_pp_approved' }));
                PaymentColums.push(search.createColumn({ name: 'custbody_rmpay_bbd_no_return_file', join: 'CUSTRECORD_RMPAY_BILLS_PP_VENDORBILL' }));
                PaymentColums.push(search.createColumn({ name: 'custrecord_rmpay_bills_pp_vendorbill' }));
                PaymentColums.push(search.createColumn({ name: 'custrecord_rmpay_bills_pp_payref' }));

                var searchResult = rmlib._getPendingPaymentBills(PaymentColums);
                log.debug('execute', 'searchresult:' + searchResult);

                if (rmlib._validateData(searchResult)) {
                    for (var i = 0; i < searchResult.length; i++) {
                        var PaymentProposalParent = searchResult[i].getValue(PaymentColums[0]);
                        var PaymentApprovedByBank = searchResult[i].getValue(PaymentColums[1]);
                        var PaymentProposalApproved = searchResult[i].getValue(PaymentColums[2]);
                        var ReturnFileP002NotInvolved = searchResult[i].getValue(PaymentColums[3]);
                        var VendorBill = searchResult[i].getValue(PaymentColums[4]);
                        var PaymentReference = searchResult[i].getValue(PaymentColums[5]);
                        var CurrentRecId = searchResult[i].id;

                        var executionFlag = true;

                        //Case 1: where Return file from bank is not needed.
                        if (ReturnFileP002NotInvolved && executionFlag) {
                            executionFlag = false;
                            if (rmlib._validateData(VendorBill)) {
                                var rmdata = {};
                                rmdata.VendorBill = VendorBill;
                                rmdata.CurrentRecId = CurrentRecId;
                                rmdata.PaymentReference = PaymentReference;
                                log.debug('execute', 'rmdata:' + JSON.stringify(rmdata));
                                var recId = rmlib._generatePayments(rmdata);
                                log.debug('execute', 'Payment Generated:' + recId);

                                

                            } else {
                                throw error.create({
                                    name: 'RM_VENDORBILL_MISSING_ERROR',
                                    message: 'The vendor Bill is not associated with this Approved Proposal.',
                                    notifyOff: false
                                });
                            }
                        }
                    }

                }
            } catch (e) {
                log.debug(' error===>',e.toString())
            }
        }

        return { execute }

    });
