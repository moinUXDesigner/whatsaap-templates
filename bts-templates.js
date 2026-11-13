/**
 * WhatsApp/SMS template definitions for APTRANSCO VBTS (Bill Tracking System)
 * SLA reminders, bill hold notices, management ageing overview and BG expiry alerts
 * (converted from BTS_SLA_HOLD_BG_SMS_TEMPLATES.docx).
 * Each entry's `example` values fill the {{n}} placeholders in `body` for
 * Meta's template review.
 */
module.exports = [
  // ---- SLA reminder & escalation ----
  {
    name: "slareminderholder",
    body: "Dear {{1}}, Bill No. {{2}} pertaining to vendor {{3}} is pending with you and has exceeded the prescribed SLA by {{4}} day(s). Kindly take necessary action for early processing. - APTRANSCO - GOVT AP",
    example: ["K Suvarchala Devi", "3000000404-INV-26-001", "Amara Raja Power Systems Limited", "2"]
  },
  {
    name: "slaescalationnextlevel",
    body: "Dear {{1}}, Bill No. {{2}} pertaining to vendor {{3}} pending with {{4}} has exceeded the prescribed SLA by {{5}} day(s). The same is brought to your notice for necessary follow-up and early disposal. - APTRANSCO - GOVT AP",
    example: ["Rekhadi Nookaraju", "3000000404-INV-26-001", "Amara Raja Power Systems Limited", "K Suvarchala Devi, Assistant Executive Engineer", "2"]
  },
  {
    name: "slareminderaccountshq",
    body: "Dear {{1}}, Bill No. {{2}} pertaining to vendor {{3}} is pending at Accounts-HQ for LOA approval and payment release and has exceeded the prescribed SLA by {{4}} day(s). Kindly follow up for early release. - APTRANSCO - GOVT AP",
    example: ["B Anjaneyulu", "3000000404-INV-26-001", "Amara Raja Power Systems Limited", "4"]
  },

  // ---- Bill hold messages ----
  {
    name: "billholdvendornotice",
    body: "Dear {{1}}, your Bill No. {{2}} has been kept on hold by {{3}}, {{4}}. Reason: {{5}}. Remarks: {{6}}. You are requested to submit the corrected/required document(s) at the earliest so that the bill can be taken up for further processing and payment. - APTRANSCO - GOVT AP",
    example: ["Amara Raja Power Systems Limited", "3000000404-INV-26-001", "K Suvarchala Devi", "Assistant Executive Engineer", "Awaiting vendor clarification", "Tax Invoice amount and Form 14 are not matched"]
  },
  {
    name: "billholdofficernotice",
    body: "Dear {{1}}, Bill No. {{2}} pertaining to vendor {{3}} has been kept on hold by {{4}}, {{5}}. {{6}}. The concerned officer is requested to take necessary action to facilitate further processing of the bill. - APTRANSCO - GOVT AP",
    example: ["Rekhadi Nookaraju", "2000000087-HR-26-002", "GE T&D India Limited (100753)", "B Anjaneyulu", "Senior Accounts Officer", "Reason: Budget issue. Remarks: SAP Budget is not available against SC: SI-15-23"]
  },
  {
    name: "billholdremovedvendor",
    body: "Dear {{1}}, the hold on your Bill No. {{2}} has been removed by {{3}}, {{4}}. The bill has resumed normal processing. - APTRANSCO - GOVT AP",
    example: ["Amara Raja Power Systems Limited", "3000000404-INV-26-001", "K Suvarchala Devi", "Assistant Executive Engineer"]
  },
  {
    name: "billholdremovedofficer",
    body: "Dear {{1}}, the hold on Bill No. {{2}} pertaining to vendor {{3}} has been removed by {{4}}, {{5}}. The bill has resumed normal processing. - APTRANSCO - GOVT AP",
    example: ["Rekhadi Nookaraju", "2000000087-HR-26-002", "GE T&D India Limited (100753)", "B Anjaneyulu", "Senior Accounts Officer"]
  },

  // ---- Management ageing overview ----
  {
    name: "ageingbillsover30days",
    body: "Dear {{1}}, {{2}} bill(s) in {{3}} have been pending for more than 30 days. Download the list: {{4}} - APTRANSCO - GOVT AP",
    example: ["Nistala Venkata Ramana Murthy", "47", "All Zones", "https://vbts.aptransco.co.in/d/4d71e0b9c5a6"]
  },

  // ---- BG validity expiry alerts ----
  {
    name: "bgexpiryvendor",
    body: "Dear M/S {{1}}, your Bank Guarantee No. {{2}}, Pertaining to the Purchase order No. {{3}} is due to expire on {{4}}. Please extend validity well before the expiry date as per the purchase order terms and condition- APTRANSCO - GOVT AP",
    example: ["GE VERNOVA T&D INDIA LIMITED", "260129IBGP00086", "1179-PMM/2026", "03.01.2027"]
  },
  {
    name: "bgexpiryofficer",
    body: "Dear {{1}}, The Bank Guarantee No. {{2}}, Pertaining to the Purchase order No. {{3}} is due to expire on {{4}}. Please pursue M/S {{5}} to extend validity well before the expiry date- APTRANSCO - GOVT AP",
    example: ["Siva Rao", "260129IBGP00086", "1179-PMM/2026", "03.01.2027", "GE VERNOVA T&D INDIA LIMITED"]
  },
  {
    name: "bgexpiryvendorurgent",
    body: "Dear M/S {{1}}, your Bank Guarantee No. {{2}}, Pertaining to the Purchase order No. {{3}} is due to expire on {{4}}. Please extend validity immediately, as per the purchase order terms and conditions, to avoid delay in processing your bills- APTRANSCO - GOVT AP",
    example: ["GE VERNOVA T&D INDIA LIMITED", "260129IBGP00086", "1179-PMM/2026", "03.01.2027"]
  },
  {
    name: "bgexpiryofficerurgent",
    body: "Dear {{1}}, The Bank Guarantee No. {{2}}, Pertaining to the Purchase order No. {{3}} is due to expire on {{4}}. Please pursue M/S {{5}} immediately, to extend validity, to avoid delay in processing of bills- APTRANSCO - GOVT AP",
    example: ["Siva Rao", "260129IBGP00086", "1179-PMM/2026", "03.01.2027", "GE VERNOVA T&D INDIA LIMITED"]
  }
];
