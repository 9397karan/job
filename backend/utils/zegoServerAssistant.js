"use strict";

const crypto = require("crypto");

const ErrorCode = {
  success: 0,
  appIDInvalid: 1,
  userIDInvalid: 3,
  secretInvalid: 5,
  effectiveTimeInSecondsInvalid: 6,
};

function RndNum(a, b) {
  return Math.ceil(
    a + (b - a) * Math.random()
  );
}

function makeRandomIv() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyz";

  let result = "";

  for (let i = 0; i < 16; i++) {
    const index = Math.floor(
      Math.random() * chars.length
    );

    result += chars.charAt(index);
  }

  return result;
}

function getAlgorithm(secret) {
  const key = Buffer.from(secret);

  switch (key.length) {
    case 16:
      return "aes-128-cbc";

    case 24:
      return "aes-192-cbc";

    case 32:
      return "aes-256-cbc";

    default:
      throw new Error(
        `Invalid key length: ${key.length}`
      );
  }
}

function aesEncrypt(
  plainText,
  key,
  iv
) {
  const cipher =
    crypto.createCipheriv(
      getAlgorithm(key),
      key,
      iv
    );

  cipher.setAutoPadding(true);

  const encrypted =
    cipher.update(
      plainText,
      "utf8"
    );

  const final =
    cipher.final();

  return Buffer.concat([
    encrypted,
    final,
  ]);
}

function generateToken04(
  appId,
  userId,
  secret,
  effectiveTimeInSeconds,
  payload = ""
) {
  if (
    !appId ||
    typeof appId !== "number"
  ) {
    throw {
      errorCode:
        ErrorCode.appIDInvalid,

      errorMessage:
        "appID invalid",
    };
  }

  if (
    !userId ||
    typeof userId !== "string"
  ) {
    throw {
      errorCode:
        ErrorCode.userIDInvalid,

      errorMessage:
        "userId invalid",
    };
  }

  if (
    !secret ||
    typeof secret !== "string" ||
    secret.length !== 32
  ) {
    throw {
      errorCode:
        ErrorCode.secretInvalid,

      errorMessage:
        "secret must be a 32 byte string",
    };
  }

  if (
    !effectiveTimeInSeconds ||
    typeof effectiveTimeInSeconds !==
      "number"
  ) {
    throw {
      errorCode:
        ErrorCode
          .effectiveTimeInSecondsInvalid,

      errorMessage:
        "effectiveTimeInSeconds invalid",
    };
  }

  const createTime =
    Math.floor(
      Date.now() / 1000
    );

  const tokenInfo = {
    app_id: appId,

    user_id: userId,

    nonce: RndNum(
      -2147483648,
      2147483647
    ),

    ctime: createTime,

    expire:
      createTime +
      effectiveTimeInSeconds,

    payload: payload || "",
  };

  const plainText =
    JSON.stringify(tokenInfo);

  const iv =
    makeRandomIv();

  const encryptedBuffer =
    aesEncrypt(
      plainText,
      secret,
      iv
    );

  const expireBuffer =
    Buffer.alloc(8);

  expireBuffer.writeBigInt64BE(
    BigInt(tokenInfo.expire)
  );

  const ivLengthBuffer =
    Buffer.alloc(2);

  ivLengthBuffer.writeUInt16BE(
    iv.length
  );

  const encryptedLengthBuffer =
    Buffer.alloc(2);

  encryptedLengthBuffer.writeUInt16BE(
    encryptedBuffer.length
  );

  const finalBuffer =
    Buffer.concat([
      expireBuffer,

      ivLengthBuffer,

      Buffer.from(iv),

      encryptedLengthBuffer,

      encryptedBuffer,
    ]);

  return (
    "04" +
    finalBuffer.toString(
      "base64"
    )
  );
}

module.exports = {
  generateToken04,
};