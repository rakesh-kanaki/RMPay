/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/action', 'N/currentRecord', 'N/dataset', 'N/encode', 'N/error', 'N/log', 'N/record', 'N/search','./Lib/RMPay_common_lib'],
    /**
 * @param{action} action
 * @param{currentRecord} currentRecord
 * @param{dataset} dataset
 * @param{encode} encode
 * @param{error} error
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (action, currentRecord, dataset, encode, error, log, record, search,rmlib) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {
            log.debug({
                title: 'requestParams',
                details: JSON.stringify(requestParams)
            });
            var effdate = requestParams.param_date;
            var currency_data = requestParams.param_currency;
            log.debug({
                title: 'effdate',
                details: effdate
            });
            var data ={};
            var _validateAccount = true;
            if(_validateAccount) {   
                var currencyList = currency_data.split(",");         
                if(rmlib._validateData(effdate) && rmlib._validateData(currencyList)) {
                    // send the data for specific date
                    var ExchangeData = rmlib._getExchangeRate(effdate,currencyList);
                } else {
                    if(rmlib._validateData(currencyList)) {
                        // send all the data in return.
                        var ExchangeData = rmlib._getExchangeRate(null,currencyList);
                    }
                }
            }
            return JSON.stringify(data);
        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

        return {get, put, post, delete: doDelete}

    });
