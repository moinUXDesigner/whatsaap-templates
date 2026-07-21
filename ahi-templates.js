/**
 * WhatsApp message template definitions for AHI Portal alerts (converted
 * from AHI_Alert_Message_Formats_Approval_req.docx, English versions only).
 * Each entry's `example` values fill the {{n}} placeholders in `body` for
 * Meta's template review.
 */
module.exports = [

  {
    name: "ahiportallive",
    body: "Dear {{1}}, AHI Portal is the official APTRANSCO platform for transformer health records, test results, AHI grades and alerts. Please login at {{2}}, review your assets, and keep data updated for timely maintenance decisions. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "https://aptransco.gov.in"]
  },
  {
    name: "ahidataentrycoverage",
    body: "Dear {{1}}, please enter pending previous transformer test data for {{2}} to complete AHI data-entry coverage. Accurate entries are required because grades, alerts and maintenance recommendations are generated from the submitted data. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Vijayawada 220kV Substation"]
  },
  {
    name: "ahiportalmaint",
    body: "Dear {{1}}, AHI Portal will be under scheduled maintenance on {{2}} from {{3}} to {{4}}. Please save urgent work before the maintenance window. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "15-07-2026", "10:00 AM", "12:00 PM"]
  },
  {
    name: "ahiportalmaintnow",
    body: "Dear {{1}}, AHI Portal is currently under maintenance. Normal service is expected by {{2}}. Please try again after restoration. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "12:00 PM"]
  },
  {
    name: "ahiportalrestart",
    body: "Dear {{1}}, AHI Portal was restarted at {{2}} and is operational. If you were entering data, please re-check your last saved record. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "12:05 PM"]
  },
  {
    name: "ahisubshutdown",
    body: "Dear {{1}}, planned shutdown is scheduled at {{2}} on {{3}} from {{4}} to {{5}}. Coordinate testing and switching activities as approved. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Vijayawada 220kV SS", "20-07-2026", "09:00 AM", "01:00 PM"]
  },
  {
    name: "ahigradedalert",
    body: "Dear {{1}}, PTR {{2}} at {{3}} has AHI Grade D with {{4}} as the weak area. Recommendation: verify latest test results, inspect the equipment and schedule planned maintenance. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "Oil Quality"]
  },
  {
    name: "ahigradeealert",
    body: "Dear {{1}}, PTR {{2}} at {{3}} has AHI Grade E with {{4}} as the weak area. Recommendation: arrange priority inspection, confirm abnormal test results and update corrective action. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "DGA"]
  },
  {
    name: "ahigradefalert",
    body: "Dear {{1}}, PTR {{2}} at {{3}} has AHI Grade F with {{4}} as the critical area. Recommendation: immediate engineering review, confirm critical tests and follow approved safety procedures. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "Bushing Tan Delta"]
  },
  {
    name: "ahitestgradeadvice",
    body: "Dear {{1}}, {{2}} test grade for PTR {{3}} at {{4}} is {{5}}. Recommendation: review the value and trend, repeat or confirm the test if abnormal, and record action taken. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Winding Resistance", "PTR-105", "Vijayawada 220kV SS", "Grade E"]
  },
  {
    name: "ahiparamlimit",
    body: "Dear {{1}}, {{2}} for PTR {{3}} at {{4}} has reached {{5}}. Recommendation: review the latest result, check trend history and take action as per standard. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Oil Quality", "PTR-105", "Vijayawada 220kV SS", "Grade E / BDV low"]
  },
  {
    name: "ahigaslimit",
    body: "Dear {{1}}, DGA gas alert: {{2}} for PTR {{3}} at {{4}} is above typical value with score {{5}}/5. Recommendation: review DGA trend and diagnose urgently. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "C2H2 Acetylene", "PTR-105", "Vijayawada 220kV SS", "4"]
  },
  {
    name: "ahidesigngroup",
    body: "Dear {{1}}, design group {{2}} alert: source PTR {{3}} has Grade F. Recommendation: verify sibling PTR {{4}} at {{5}} and review similar-risk test results. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "DG-220-ABB-01", "PTR-105", "PTR-106", "Vijayawada 220kV SS"]
  },
  {
    name: "ahitestdue",
    body: "Dear {{1}}, {{2}} test for PTR {{3}} at {{4}} is due by {{5}}. Please schedule the test and upload accurate results to the AHI Portal. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "DGA", "PTR-105", "Vijayawada 220kV SS", "25-07-2026"]
  },
  {
    name: "ahitestoverdue",
    body: "Dear {{1}}, {{2}} test for PTR {{3}} at {{4}} is overdue since {{5}}. Please arrange testing immediately and update accurate results in the AHI Portal. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Oil Quality", "PTR-105", "Vijayawada 220kV SS", "10-07-2026"]
  },
  {
    name: "ahisampleupdated",
    body: "Dear {{1}}, new {{2}} data was recorded for PTR {{3}} at {{4}} from {{5}}. Please review the updated result and AHI recommendation. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "DGA", "PTR-105", "Vijayawada 220kV SS", "SAP"]
  },
  {
    name: "ahiescalation",
    body: "Dear {{1}}, escalation: {{2}} alert for PTR {{3}} at {{4}} is pending for over {{5}} hours. Please review, act and acknowledge immediately. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "AHI Grade E", "PTR-105", "Vijayawada 220kV SS", "72"]
  },
  {
    name: "ahibroadcastinfo",
    body: "Dear {{1}}, AHI Portal notice: {{2}} for {{3}}. {{4}}. Please check the portal for details. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "Data Verification Drive", "Vijayawada Circle", "Verify pending transformer records by 31-07-2026"]
  },
  {
    name: "ahitrippingalert",
    body: "Dear {{1}}, tripping alert: PTR {{2}} at {{3}} tripped at {{4}}. Recommendation: inspect equipment, review relay/event details and update action in the AHI Portal. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "14-07-2026 10:30 AM"]
  },
  {
    name: "ahiloadingalert",
    body: "Dear {{1}}, loading alert: PTR {{2}} at {{3}} recorded {{4}}% loading during {{5}}. Recommendation: review loading trend and take approved corrective action. - APTRANSCO - GOVT AP",
    example: ["Ravi Kumar", "PTR-105", "Vijayawada 220kV SS", "115", "last 30 minutes"]
  }
];
