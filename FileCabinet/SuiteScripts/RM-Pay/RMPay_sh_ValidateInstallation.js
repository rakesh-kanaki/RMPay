/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/error', 'N/format', 'N/format/i18n', 'N/log', 'N/search','N/record'],
    /**
 * @param{error} error
 * @param{format} format
 * @param{i18n} i18n
 * @param{log} log
 * @param{search} search
 */
    (error, format, i18n, log, search,record) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const customrecord_rmpay_validateinstallSearchColName = search.createColumn({ name: 'name', sort: search.Sort.ASC });
            const customrecord_rmpay_validateinstallSearchColEffectiveDate = search.createColumn({ name: 'custrecord_rmpay_vi_effdate' });
            const customrecord_rmpay_validateinstallSearch = search.create({
                type: 'customrecord_rmpay_validateinstall',
                filters: [
                    ['custrecord_rmpay_vi_effdate', 'on', 'today'],
                    'AND',
                    ['isinactive', 'is', 'F'],
                ],
                columns: [
                    customrecord_rmpay_validateinstallSearchColName,
                    customrecord_rmpay_validateinstallSearchColEffectiveDate,
                ],
            });
            const customrecord_rmpay_validateinstallSearchPagedData = customrecord_rmpay_validateinstallSearch.runPaged({ pageSize: 1000 });
            log.debug({
                title: 'customrecord_rmpay_validateinstallSearchPagedData',
                details: JSON.stringify(customrecord_rmpay_validateinstallSearchPagedData)
            });
            /*for (let i = 0; i < customrecord_rmpay_validateinstallSearchPagedData.pageRanges.length; i++) {
                const customrecord_rmpay_validateinstallSearchPage = customrecord_rmpay_validateinstallSearchPagedData.fetch({ index: i });
                customrecord_rmpay_validateinstallSearchPage.data.forEach((result: search.Result): void => {
                  const name = result.getValue(customrecord_rmpay_validateinstallSearchColName);
                  const effectiveDate = result.getValue(customrecord_rmpay_validateinstallSearchColEffectiveDate);
                });
              }*/
              customrecord_rmpay_validateinstallSearch.run().each(function(r){
                //console.log(r.toJSON());
                log.debug({
                    title: 'r.toJSON()',
                    details: r.toJSON()
                });
                var id = r.id;
                var recid = record.submitFields({
                    type: r.recordType,
                    id: r.id,
                    values: {
                      'isinactive': true
                    }
                  })
                return true;
             });
        }

        return { execute }

    });
