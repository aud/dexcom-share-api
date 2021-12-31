require("isomorphic-fetch");

import {extractNumber, mgdlToMmol} from "./utilities";
import type {
  LatestGlucoseProps,
  GlucoseEntry,
  DexcomEntry,
  DexcomServer,
  ConfigurationProps,
} from "./types";

export class DexcomClient {
  private username: string;
  private password: string;
  private server: DexcomServer;

  // This seems to be a blessed ID the Dexcom Share app uses. This is in no way
  // special to this library, is it used in several (nightscout, dexcomedy,
  // etc).
  static get APPLICATION_ID() {
    return "d8665ade-9673-4e27-9ff6-92db4ce13d13";
  }

  private static get DEXCOM_SERVERS() {
    return ["eu", "us"];
  }

  constructor({username, password, server}: ConfigurationProps) {
    if (typeof username === "undefined") throw new Error("Must provide username");
    if (typeof password === "undefined") throw new Error("Must provide password");
    if (typeof server === "undefined") throw new Error("Must provide server");
    if (!DexcomClient.DEXCOM_SERVERS.includes(server)) {
      throw new Error(`Invalid server. Valid servers: ${DexcomClient.DEXCOM_SERVERS.join(", ")}`);
    }

    this.username = username;
    this.password = password;
    this.server = server;
  }

  // Returns the Dexcom account_id. This is needed as apart of the login flow,
  // in order to generate a session. As a user, usually you wouldn't need to
  // call this function directly unless you're rebuilding the login flow
  // yourself.
  async getAccountId(): Promise<string> {
    try {
      const result = await fetch(this.apiUrl("General/AuthenticatePublisherAccount"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: DexcomClient.APPLICATION_ID,
          accountName: this.username,
          password: this.password,
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
  // eg. reading glucose data.
  async getSessionId(): Promise<string> {
    try {
      const accountId = await this.getAccountId();

      const result = await fetch(this.apiUrl("General/LoginPublisherAccountById"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: DexcomClient.APPLICATION_ID,
          accountId: accountId,
          password: this.password,
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

  // Returns the latest glucose levels between a given time (expressed as
  // minutes) in the past and now. By default this returns the latest entry in
  // the past 24 hours. This API can accept `minutes` and `maxCount` params,
  // which controls the number of entries you will be returned. For eg., if you
  // wanted to return the last 10 entries from this hour:
  //
  //   getEstimatedGlucoseValues({minutes: 60, maxCount: 10});
  async getEstimatedGlucoseValues(
    { minutes, maxCount }: LatestGlucoseProps = { minutes: 1440, maxCount: 1 }
  ): Promise<GlucoseEntry[]> {
    try {
      const sessionId = await this.getSessionId()

      const result = await fetch(this.apiUrl("Publisher/ReadPublisherLatestGlucoseValues"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxCount,
          minutes,
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

  private apiUrl(resource: string) {
    let host;

    switch(this.server) {
      case "us":
        host = "share2.dexcom.com";
        break;
      case "eu":
        host = "shareous1.dexcom.com";
        break;
    }

    return `https://${host}/ShareWebServices/Services/${resource}`;
  }
}
