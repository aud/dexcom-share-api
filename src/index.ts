import {extractNumber, mgdlToMmol} from "./utilities";
import type {LoginProps, LatestGloucoseProps, DexcomEntry, GloucoseEntry} from "./types";
const fetch = require("node-fetch");

// This seems to be a blessed ID the Dexcom Share app uses. This is in no way
// special to this library, is it used in several (nightscout, dexcomedy,
// etc).
const APPLICATION_ID = "d8665ade-9673-4e27-9ff6-92db4ce13d13";

// Returns the Dexcom account_id for a given username and password. This is
// needed as apart of the login flow, in order to generate a session. As a
// user, usually you wouldn't need to call this function directly unless you're
// rebuilding the login flow yourself.
export async function getAccountId({username, password}: LoginProps): Promise<string> {
  try {
    const result = await fetch("https://shareous1.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId: APPLICATION_ID,
        accountName: username,
        password: password,
      }),
    });

    const data = await result.json();

    if (result.status !== 200) {
      throw new Error(`Dexcom server responded with status: ${result.status}, data: ${JSON.stringify(data)}`);
    }

    return data;
  } catch(err) {
    throw new Error(`Request failed with error: ${err}`);
  }
}

// Returns the Dexcom session_id for a given account. This provides a token
// that will allow access to various Dexcom APIs scoped under your account, for
// eg. reading gloucose data.
export async function getSessionId({username, password}: LoginProps): Promise<string> {
  try {
    const accountId = await getAccountId({username, password});

    const result = await fetch("https://shareous1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountById", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        applicationId: APPLICATION_ID,
        accountId: accountId,
        password: password,
      }),
    });

    const data = await result.json();

    if (result.status !== 200) {
      throw new Error(`Dexcom server responded with status: ${result.status}, data: ${JSON.stringify(data)}`);
    }

    return data;
  } catch(err) {
    throw new Error(`Request failed with error: ${err}`);
  }
}

// Returns the latest gloucose levels between a given time (expressed as
// minutes) in the past and now. By default this returns the latest entry in
// the past 24 hours. This API can accept `minutes` and `maxCount` params,
// which controls the number of entries you will be returned. For eg., if you
// wanted to return the last 10 entries from this hour:
//
//   getLatestGlucoseValues({username: "user", password: "pass", minutes: 60, maxCount: 10});
export async function getLatestGlucoseValues({
  username,
  password,
  minutes,
  maxCount,
}: LoginProps & LatestGloucoseProps): Promise<GloucoseEntry[]> {
  try {
    const sessionId = await getSessionId({username, password});

    const result = await fetch("https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxCount: maxCount || 1,
        minutes: minutes || 1440,
        sessionId,
      }),
    });

    const data = await result.json();

    if (result.status !== 200) {
      throw new Error(`Dexcom server responded with status: ${result.status}, data: ${JSON.stringify(data)}`);
    }

    // The object Dexcom returns from this API is unnecessarily confusing, make
    // it clearer:
    return data.map((entry: DexcomEntry) => {
      return {
        mmol: mgdlToMmol(entry.Value),
        mgdl: entry.Value,
        // TODO: May need to handle US trends.. (still 1-7?)
        trend: entry.Trend.toLowerCase(),
        timestamp: new Date(extractNumber(entry.WT) as number).getTime(),
      }
    });
  } catch(err) {
    throw new Error(`Request failed with error: ${err}`);
  }
}
