/**
 * WhatsApp message template definitions for PMS (ticketing) application
 * notifications, converted from "PMS APPLICATION TICKETS NOTIFICATIONS.txt".
 * Each entry's `example` values fill the {{n}} placeholders in `body` for
 * Meta's template review.
 */
module.exports = [

  {
    name: "aarempticketraise-prod",
    body: "Dear {{1}},  {{2}} {{3}} your ticket has been forwarded to {{4}}, {{5}} for further action. You will be informed when there is an update on your ticket.\nAPTRANSCO – Government of Andhra Pradesh",
    example: ["Varun", "AEE", "1073080", "VENKATA NARAYANA VEMULAPATI", "PO Engineering Services"]
  },
  {
    name: "aaradminticketrecieved-prod",
    body: "Dear {{1}}, {{2}}, {{3}} you have received ticket from {{4}}, {{5}} for review and further action. Please log in to the APTRANSCO application to view the complete ticket details and update its status accordingly.\nAPTRANSCO – Government of Andhra Pradesh",
    example: ["VENKATA NARAYANA VEMULAPATI", "PO Engineering Services", "1073080", "Varun", "AEE"]
  }
];
