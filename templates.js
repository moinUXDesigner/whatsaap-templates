/**
 * WhatsApp/SMS template definitions for APTRANSCO MIMS Inspection alerts
 * (converted from MIMS_Inspection_SMS_Templates.docx, English versions only).
 * Each entry's `example` values fill the {{n}} placeholders in `body` for
 * Meta's template review.
 */
module.exports = [
  // ---- Inspection raised / closed ----
  {
    name: "mimsinspectionraised",
    body: "APTRANSCO: MIMS Call Ref No. {{1}} for {{2}} inspection has been raised and assigned to {{3}}. {{4}} - GOVT AP",
    example: ["34441", "120KN SRC Insulator", "KMV Projects Limited", "Contact No: 8008901033."]
  },
  {
    name: "mimsinspectionclosed",
    body: "APTRANSCO: MIMS Call Ref No. {{1}} for {{2}} inspection conducted on {{3}} has been completed. Inspection Status: {{4}}. - GOVT AP",
    example: ["34441", "120KN SRC Insulator", "17-09-2026", "Accepted"]
  }
];
