import twilio from "twilio";
import { env } from "../config/env.js";

let client;
let verifyServiceSid;

function getClient() {
  if (!client) {
    client = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

async function getVerifyServiceSid() {
  if (verifyServiceSid) return verifyServiceSid;

  if (process.env.TWILIO_VERIFY_SID) {
    verifyServiceSid = process.env.TWILIO_VERIFY_SID;
    return verifyServiceSid;
  }

  const service = await getClient().verify.v2.services.create({
    friendlyName: "BeautyOnCall OTP",
  });
  verifyServiceSid = service.sid;
  return verifyServiceSid;
}

export async function sendOTP(phoneNumber) {
  const sid = await getVerifyServiceSid();
  const verification = await getClient()
    .verify.v2.services(sid)
    .verifications.create({ to: phoneNumber, channel: "sms" });
  return verification.status;
}

export async function verifyOTP(phoneNumber, code) {
  const sid = await getVerifyServiceSid();
  const check = await getClient()
    .verify.v2.services(sid)
    .verificationChecks.create({ to: phoneNumber, code });
  return check.status === "approved";
}
