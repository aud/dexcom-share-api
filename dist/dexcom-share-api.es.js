function extractNumber(str) {
  const match = str.match(/\d+/g);
  return match ? parseInt(match[0]) : null;
}
function mgdlToMmol(mgdl) {
  return +(mgdl / 18).toFixed(2);
}
var Trend;
(function(Trend2) {
  Trend2[Trend2["DoubleUp"] = 0] = "DoubleUp";
  Trend2[Trend2["SingleUp"] = 1] = "SingleUp";
  Trend2[Trend2["FortyFiveUp"] = 2] = "FortyFiveUp";
  Trend2[Trend2["Flat"] = 3] = "Flat";
  Trend2[Trend2["FortyFiveDown"] = 4] = "FortyFiveDown";
  Trend2[Trend2["SingleDown"] = 5] = "SingleDown";
  Trend2[Trend2["DoubleDown"] = 6] = "DoubleDown";
})(Trend || (Trend = {}));
const fetch = typeof window !== "undefined" ? window.fetch : require("isomorphic-fetch");
class DexcomClient {
  constructor({ username, password, server } = {
    username: void 0,
    password: void 0,
    server: void 0
  }) {
    Object.defineProperty(this, "username", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "password", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "server", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    if (typeof username === "undefined")
      throw new Error("Must provide username");
    if (typeof password === "undefined")
      throw new Error("Must provide password");
    if (typeof server === "undefined")
      throw new Error("Must provide server");
    if (!DexcomClient.DEXCOM_SERVERS.includes(server)) {
      throw new Error(`Invalid server. Valid servers: ${DexcomClient.DEXCOM_SERVERS.join(", ")}`);
    }
    this.username = username;
    this.password = password;
    this.server = server;
  }
  static get APPLICATION_ID() {
    return "d8665ade-9673-4e27-9ff6-92db4ce13d13";
  }
  static get DEXCOM_SERVERS() {
    return ["eu", "us"];
  }
  async getAccountId() {
    try {
      const result = await fetch(this.apiUrl("General/AuthenticatePublisherAccount"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          applicationId: DexcomClient.APPLICATION_ID,
          accountName: this.username,
          password: this.password
        })
      });
      const data = await result.json();
      if (result.status !== 200) {
        throw new Error(`Dexcom server responded with status: ${result.status}, data: ${JSON.stringify(data)}`);
      }
      return data;
    } catch (err) {
      throw new Error(`Request failed with error: ${err}`);
    }
  }
  async getSessionId() {
    try {
      const accountId = await this.getAccountId();
      const result = await fetch(this.apiUrl("General/LoginPublisherAccountById"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          applicationId: DexcomClient.APPLICATION_ID,
          accountId,
          password: this.password
        })
      });
      const data = await result.json();
      if (result.status !== 200) {
        throw new Error(`Dexcom server responded with status: ${result.status}, data: ${JSON.stringify(data)}`);
      }
      return data;
    } catch (err) {
      throw new Error(`Request failed with error: ${err}`);
    }
  }
  async getEstimatedGlucoseValues({ minutes, maxCount } = { minutes: 1440, maxCount: 1 }) {
    try {
      const sessionId = await this.getSessionId();
      const result = await fetch(this.apiUrl("Publisher/ReadPublisherLatestGlucoseValues"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          maxCount,
          minutes,
          sessionId
        })
      });
      const data = await result.json();
      if (result.status !== 200) {
        throw new Error(`Dexcom server responded with status: ${result.status}, data: ${JSON.stringify(data)}`);
      }
      return data.map((entry) => {
        let trend = entry.Trend;
        if (typeof trend === "number") {
          trend = Trend[trend - 1];
        }
        return {
          mmol: mgdlToMmol(entry.Value),
          mgdl: entry.Value,
          trend: trend.toLowerCase(),
          timestamp: new Date(extractNumber(entry.WT)).getTime()
        };
      });
    } catch (err) {
      throw new Error(`Request failed with error: ${err}`);
    }
  }
  apiUrl(resource) {
    let host;
    switch (this.server) {
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
export { DexcomClient };
