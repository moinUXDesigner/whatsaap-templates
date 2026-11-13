
module.exports = [

  {
    name: "appccvendorloginotp",
    body: "APPCC Portal: Your OTP for login is {{1}}. This OTP is valid for {{2}} minutes. Do not share this OTP with anyone. – APPCC-GOVTAP",
    example: ["482913", "10"]
  },
  {
    name: "appccforgotpasswordotp",
    body: "APPCC Portal: Your OTP to reset your password is {{1}}. This OTP is valid for {{2}} minutes. Do not share this OTP with anyone. - APPCC-GOVTAP",
    example: ["731846", "10"]
  },
  {
    name: "appccinvoiceaccepted",
    body: "APPCC: Your Invoice {{1}} for {{2}} has been accepted. Further processing will continue as per procedure. - APPCC-GOVTAP",
    example: ["INV-2026-00125", "August-2026"]
  },
  {
    name: "appccinvoicerejected",
    body: "APPCC: Your Invoice {{1}} for {{2}} has been rejected. Please check the vendor portal for details and resubmit after correction. - APPCC-GOVTAP",
    example: ["INV-2026-00126", "August-2026"]
  },
  {
    name: "appccloagenerated",
    body: "APPCC: The Letter of Authorization (LOA): {{1}} for Invoice {{2}}, pertaining to the billing period {{3}}, has been successfully generated. LOA Amount: {{4}}. Please log in to the APPCC Vendor Portal to view the LOA details. - APPCC-GOVTAP",
    example: ["LOA-2026-0048", "INV-2026-00125", "August-2026", "Rs. 12,50,000"]
  }
];