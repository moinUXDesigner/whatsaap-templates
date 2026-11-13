
// Each template declares its own Meta category.
//
//   Utility (default)  - needs `body` (+ `example` for any {{n}} placeholders).
//   Authentication     - Meta owns the copy, so there is NO `body` here. It
//                        renders "<CODE> is your verification code." plus the
//                        security line and expiry footer. Only knobs are in
//                        `otp`; `example[0]` is the code used for test sends.
module.exports = [

  {
    name: "appccvendorloginotpauth",
    category: "Authentication",
    otp: {
      expiryMinutes: 10,      // -> FOOTER "This code expires in 10 minutes."
      buttonText: "Copy code",
      otpType: "COPY_CODE",   // ONE_TAP/ZERO_TAP also need packageName + signatureHash
    },
    example: ["482913"]
  },
  {
    name: "appccforgotpasswordotpauth",
    category: "Authentication",
    otp: {
      expiryMinutes: 10,
      buttonText: "Copy code",
      otpType: "COPY_CODE",
    },
    example: ["731846"]
  }
];
