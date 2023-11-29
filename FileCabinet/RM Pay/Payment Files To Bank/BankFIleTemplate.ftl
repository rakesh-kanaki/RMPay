<?xml version="1.0" encoding="UTF-8"?>
<order>
    <orderNumber>${proposalid}</orderNumber>
    <customerName>${numberofxx}</customerName>
    <trandetails>
        <#list trandetails as trandetails>
            <item>
                <itemName>${PayRef}</itemName>
                <itemQuantity>${CdtrNm}</itemQuantity>
            </item>
        </#list>
    </trandetails>
</order>