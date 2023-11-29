/**
 * Client script to collapse a tab when the page loads.
 */
function pageInit(context) {
    // Get the tab and collapse it
    var tab = context.form.getTab({
      id: 'custpage_my_tab', // Specify the tab ID
    });
    tab.setCollapsible(true); // Make sure the tab is collapsible
    tab.setCollapsed(true); // Collapse the tab when the page loads
  }
  