import twilio from "twilio";
import { env } from "../config/env.js";

let client;
let verifyServiceSidPromise;

function getClient() {
  if (!client) {
    client = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

function getVerifyServiceSid() {
  if (!verifyServiceSidPromise) {
    verifyServiceSidPromise = resolveVerifyServiceSid().catch((err) => {
      verifyServiceSidPromise = null;
      throw err;
    });
  }
  return verifyServiceSidPromise;
}

async function resolveVerifyServiceSid() {
  if (process.env.TWILIO_VERIFY_SID) {
    return process.env.TWILIO_VERIFY_SID;
  }

  const service = await getClient().verify.v2.services.create({
    friendlyName: "BeautyOnCall OTP",
  });
  return service.sid;
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
