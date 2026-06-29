/**
 * WhatsApp message template definitions (converted from the SMS templates doc).
 * Each entry's `example` values fill the {{n}} placeholders in `body` for
 * Meta's template review.
 */
module.exports = [
  {
    name: "l1engineerbillnotification",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been submitted by {{4}} for processing. - APTRANSCO - GOVT AP",
    example: ["Officer One", "Material", "MB-2026-00035", "Sample Vendor Pvt Ltd"],
  },
  {
    name: "infobillsubmittednotification",
    body: "Update: {{1}} Bill {{2}} has been submitted by {{3}} for processing. - APTRANSCO - GOVT AP",
    example: ["Material", "MB-2026-00035", "Sample Vendor Pvt Ltd"],
  },
  {
    name: "vendorbillprocessedl2",
    body: "Dear {{1}}, your {{2}} Bill {{3}} for an amount of Rs.{{4}} has been processed and submitted to {{5}} ({{6}}) for verification. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035", "1,25,000", "Officer Two", "DEE-2"],
  },
  {
    name: "l2engineerverificationrequest",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been submitted by {{4}} for your verification. - APTRANSCO - GOVT AP",
    example: ["Officer Two", "Material", "MB-2026-00035", "Officer One"],
  },
  {
    name: "vendorbillverifiedl3",
    body: "Dear {{1}}, your {{2}} Bill {{3}} has been verified and submitted to {{4}} ({{5}}) for approval. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035", "Officer Three", "DGM"],
  },
  {
    name: "l3engineerapprovalrequest",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been submitted by {{4}} for your approval. - APTRANSCO - GOVT AP",
    example: ["Officer Three", "Material", "MB-2026-00035", "Officer Two"],
  },
  {
    name: "vendorbillapprovedl4",
    body: "Dear {{1}}, your {{2}} Bill {{3}} has been approved and submitted to {{4}} ({{5}}) for review. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035", "Officer Four", "SE"],
  },
  {
    name: "l4engineerreviewrequest",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been submitted by {{4}} for your review. - APTRANSCO - GOVT AP",
    example: ["Officer Four", "Material", "MB-2026-00035", "Officer Three"],
  },
  {
    name: "vendorbillreviewedaccounts",
    body: "Dear {{1}}, your {{2}} Bill {{3}} has been reviewed and forwarded to Accounts for invoice processing. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035"],
  },
  {
    name: "l5accountsinvoiceprocessing",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been forwarded by {{4}} ({{5}}) for your invoice processing. - APTRANSCO - GOVT AP",
    example: ["Officer Five", "Material", "MB-2026-00035", "Officer Four", "SE"],
  },
  {
    name: "infobillforwardedaccounts",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been forwarded to Accounts for invoice processing. - APTRANSCO - GOVT AP",
    example: ["Officer Six", "Material", "MB-2026-00035"],
  },
  {
    name: "l6invoiceparked",
    body: "Dear {{1}}, Invoice for {{2}} Bill {{3}} has been parked and submitted for review/posting/LOA generation. - APTRANSCO - GOVT AP",
    example: ["Officer Six", "Material", "MB-2026-00035"],
  },
  {
    name: "l7invoiceposted",
    body: "Dear {{1}}, Invoice for {{2}} Bill {{3}} has been posted and submitted for posting/LOA generation. - APTRANSCO - GOVT AP",
    example: ["Officer Seven", "Material", "MB-2026-00035"],
  },
  {
    name: "vendorbillhqpayment",
    body: "Dear {{1}}, your {{2}} Bill {{3}} for an amount of Rs.{{4}} has been submitted to HQ for payment processing. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035", "1,25,000"],
  },
  {
    name: "engineerbillhqpayment",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been submitted to HQ for payment processing. - APTRANSCO - GOVT AP",
    example: ["Officer Seven", "Material", "MB-2026-00035"],
  },
  {
    name: "vendorpaymentreleased",
    body: "Dear {{1}}, payment against {{2}} Bill {{3}} for an amount of Rs.{{4}} has been released successfully. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035", "1,25,000"],
  },
  {
    name: "engineerpaymentreleased",
    body: "Dear {{1}}, payment against {{2}} Bill {{3}} has been released successfully. - APTRANSCO - GOVT AP",
    example: ["Officer Five", "Material", "MB-2026-00035"],
  },
  {
    name: "vendormissingdocuments",
    body: "Dear {{1}}, additional documents are requested for your {{2}} Bill {{3}}. Please log in to the Bill Tracking Portal for details. Remarks: {{4}}. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035", "GST invoice copy missing"],
  },
  {
    name: "engineermissingdocuments",
    body: "Additional documents have been requested from the vendor for {{1}} Bill {{2}} by {{3}}. Remarks: {{4}}. - APTRANSCO - GOVT AP",
    example: ["Material", "MB-2026-00035", "Officer Two", "GST invoice copy missing"],
  },
  {
    name: "vendorbillrejected",
    body: "Dear {{1}}, your {{2}} Bill {{3}} has been rejected. Please log in to the Bill Tracking Portal for details. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035"],
  },
  {
    name: "engineerbillrejected",
    body: "Update: {{1}} Bill {{2}} submitted by {{3}} has been rejected. - APTRANSCO - GOVT AP",
    example: ["Material", "MB-2026-00035", "Sample Vendor Pvt Ltd"],
  },
  {
    name: "vendorbillresubmitted",
    body: "Dear {{1}}, your {{2}} Bill {{3}} has been resubmitted successfully and is under review. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035"],
  },
  {
    name: "engineerbillresubmitted",
    body: "Dear {{1}}, {{2}} Bill {{3}} has been resubmitted by the vendor. Remarks: {{4}}. - APTRANSCO - GOVT AP",
    example: ["Officer One", "Material", "MB-2026-00035", "GST invoice copy attached"],
  },
  {
    name: "vendorbillclosed",
    body: "Dear {{1}}, your {{2}} Bill {{3}} has been processed successfully and closed. - APTRANSCO - GOVT AP",
    example: ["Sample Vendor Pvt Ltd", "Material", "MB-2026-00035"],
  },
  {
    name: "engineerbillclosed",
    body: "Dear {{1}}, {{2}} Bill {{3}} submitted by {{4}} has been processed successfully and closed. - APTRANSCO - GOVT AP",
    example: ["Officer Seven", "Material", "MB-2026-00035", "Sample Vendor Pvt Ltd"],
  },
  {
    name: "vendorbillprocessedl2",
    body: "Dear {{1}}, your {{2}} Bill {{3}} for an amount of Rs.{{4}} has been processed and submitted to {{5}} ({{6}}) for verification. - APTRANSCO - GOVT AP",
    example: ["Amara Raja Power Systems Limited", "Material", "MB-2026-00035", "1,25,000", "Chandra Mouli Thodeti", "DEE-2"]
  },
  {
    name: "vendormissingdocuments",
    body: "Dear {{1}}, additional documents are requested for your {{2}} Bill {{3}}. Please log in to the Bill Tracking Portal for details. Remarks: {{4}}. - APTRANSCO - GOVT AP",
    example: ["Amara Raja Power Systems Limited", "Material", "MB-2026-00035", "GST invoice copy missing"]
  }
];
