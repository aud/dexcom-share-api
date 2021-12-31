const fetch = require("node-fetch");

jest.mock("node-fetch", () => jest.fn());

import {DexcomClient} from "./index";

describe("DexcomClient", () => {
  describe("new", () => {
    it("validates initialization options", () => {
      // @ts-expect-error
      expect(() => new DexcomClient({})).toThrowError("Must provide username");
      expect(() => {
        // @ts-expect-error
        new DexcomClient({username: "user"})
      }).toThrowError("Must provide password");

      expect(() => {
        // @ts-expect-error
        new DexcomClient({username: "user", password: "password"})
      }).toThrowError("Must provide server");

      expect(() => {
        // @ts-expect-error
        new DexcomClient({username: "user", password: "password", server: "invalid"})
      }).toThrowError("Invalid server. Valid servers: eu, us");
    });
  });

  describe("getAccountId", () => {
    it("throws an error when status is not 200", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "eu"});

      const json = jest.fn();
      json.mockResolvedValue("fail")

      const mockFetch = fetch;
      mockFetch.mockResolvedValue({ status: 500, json });

      await expect(client.getAccountId()).rejects.toThrow(
        "Request failed with error: Error: Dexcom server responded with status: 500, data: \"fail\""
      )
    });

    it("makes request and returns data", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "eu"});

      const fakeUuid = "0f549f40-e164-41e9-bb43-cdd7f7006732";

      const json = jest.fn();
      json.mockResolvedValue(fakeUuid)

      const mockFetch = fetch;
      mockFetch.mockResolvedValue({ status: 200, json });

      const result = await client.getAccountId();

      expect(result).toStrictEqual(fakeUuid);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://shareous1.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount",
        {
          body: JSON.stringify({
            applicationId: DexcomClient.APPLICATION_ID,
            accountName: "user",
            password: "pass",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
    });
  });

  describe("getSessionId", () => {
    it("throws an error when status is not 200", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "eu"});

      const json = jest.fn();
      json.mockResolvedValue("fail")

      const mockFetch = fetch;
      mockFetch.mockResolvedValue({ status: 500, json });

      await expect(client.getSessionId()).rejects.toThrow(
        "Request failed with error: Error: Dexcom server responded with status: 500, data: \"fail\""
      )
    });

    it("makes request and returns data", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "us"});

      const fakeUuid = "0f549f40-e164-41e9-bb43-cdd7f7006732";

      const json = jest.fn();
      json.mockResolvedValue(fakeUuid)

      const mockFetch = fetch;
      mockFetch.mockResolvedValue({ status: 200, json });

      const result = await client.getSessionId();

      expect(result).toStrictEqual(fakeUuid);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://share2.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount",
        {
          body: JSON.stringify({
            applicationId: DexcomClient.APPLICATION_ID,
            accountName: "user",
            password: "pass",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://share2.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountById",
        {
          body: JSON.stringify({
            applicationId: DexcomClient.APPLICATION_ID,
            accountId: fakeUuid,
            password: "pass",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
    });
  });

  describe("getEstimatedGlucoseValues", () => {
    it("throws an error when status is not 200", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "eu"});

      const json = jest.fn();
      json.mockResolvedValue("fail")

      const mockFetch = fetch;
      mockFetch.mockResolvedValue({ status: 500, json });

      await expect(client.getEstimatedGlucoseValues()).rejects.toThrow(
        "Request failed with error: Error: Dexcom server responded with status: 500, data: \"fail\""
      )
    });

    it("makes request and returns data", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "eu"});

      const fakeData = [
        {
          WT: "Date(1640812425000)",
          ST: "Date(1640812425000)",
          DT: "Date(1640812425000-0500)",
          Value: 185,
          Trend: "Flat"
        }
      ]

      const fakeUuid = "0f549f40-e164-41e9-bb43-cdd7f7006732";
      const uuidJson = jest.fn();
      uuidJson.mockResolvedValue(fakeUuid)

      const json = jest.fn();
      json.mockResolvedValue(fakeData)

      const mockFetch = fetch;
      mockFetch
        .mockReturnValueOnce({ status: 200, json: uuidJson })
        .mockReturnValueOnce({ status: 200, json: uuidJson })
        .mockReturnValueOnce({ status: 200, json })

      const result = await client.getEstimatedGlucoseValues();

      const expectedResult = [
        {
          mgdl: 185,
          mmol: 10.28,
          timestamp: 1640812425000,
          trend: "flat",
        }
      ]

      expect(result).toStrictEqual(expectedResult);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "https://shareous1.dexcom.com/ShareWebServices/Services/General/AuthenticatePublisherAccount",
        {
          body: JSON.stringify({
            applicationId: DexcomClient.APPLICATION_ID,
            accountName: "user",
            password: "pass",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://shareous1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountById",
        {
          body: JSON.stringify({
            applicationId: DexcomClient.APPLICATION_ID,
            accountId: fakeUuid,
            password: "pass",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        "https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues",
        {
          body: JSON.stringify({
            maxCount: 1,
            minutes: 1440,
            sessionId: fakeUuid,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
    });

    it("handles converting numerical trends", async () => {
      const client = new DexcomClient({username: "user", password: "pass", server: "eu"});

      const fakeData = [
        {
          WT: "Date(1640812425000)",
          ST: "Date(1640812425000)",
          DT: "Date(1640812425000-0500)",
          Value: 185,
          Trend: 1, // doubleup
        }
      ]

      const fakeUuid = "0f549f40-e164-41e9-bb43-cdd7f7006732";
      const uuidJson = jest.fn();
      uuidJson.mockResolvedValue(fakeUuid)

      const json = jest.fn();
      json.mockResolvedValue(fakeData)

      const mockFetch = fetch;
      mockFetch
        .mockReturnValueOnce({ status: 200, json: uuidJson })
        .mockReturnValueOnce({ status: 200, json: uuidJson })
        .mockReturnValueOnce({ status: 200, json })

      const result = await client.getEstimatedGlucoseValues();

      const expectedResult = [
        {
          mgdl: 185,
          mmol: 10.28,
          timestamp: 1640812425000,
          trend: "doubleup",
        }
      ]

      expect(result).toStrictEqual(expectedResult);
    });
  });
});
