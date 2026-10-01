import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupWordDetailed } from "../dictionary";
import { isLookupCandidate } from "../words";

afterEach(() => vi.unstubAllGlobals());

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

describe("isLookupCandidate", () => {
  it("accepts 1-3 English words only", () => {
    expect(isLookupCandidate("able")).toBe(true);
    expect(isLookupCandidate("ice cream")).toBe(true);
    expect(isLookupCandidate("a piece of cake")).toBe(false);
    expect(isLookupCandidate("Closure là gì?")).toBe(false);
    expect(isLookupCandidate("")).toBe(false);
  });
});

describe("lookupWordDetailed", () => {
  it("prefers the US audio/phonetic and joins parts of speech", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        reply(200, [
          {
            word: "mockable",
            phonetics: [
              { text: "/ˈeɪbl/", audio: "https://x/a-uk.mp3" },
              { text: "/ˈeɪbəl/", audio: "//x/a-us.mp3" },
            ],
            meanings: [{ partOfSpeech: "adjective" }, { partOfSpeech: "noun" }],
          },
          { word: "mockable", meanings: [{ partOfSpeech: "adjective" }] },
        ]),
      ),
    );
    const r = await lookupWordDetailed("mockable");
    expect(r).toEqual({
      status: "ok",
      info: { word: "mockable", phonetic: "/ˈeɪbəl/", partOfSpeech: "adjective, noun", audioUrl: "https://x/a-us.mp3" },
    });
  });

  it("maps 404 to notfound (and caches it) and errors to error (not cached)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(404, { title: "No Definitions Found" }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await lookupWordDetailed("zzmissing")).status).toBe("notfound");
    expect((await lookupWordDetailed("zzmissing")).status).toBe("notfound");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const failing = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", failing);
    expect((await lookupWordDetailed("zzoffline")).status).toBe("error");
    expect((await lookupWordDetailed("zzoffline")).status).toBe("error");
    expect(failing).toHaveBeenCalledTimes(2);
  });

  it("does not call the network for ineligible text", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await lookupWordDetailed("this is far too long")).status).toBe("ineligible");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
