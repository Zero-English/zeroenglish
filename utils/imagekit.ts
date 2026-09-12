import ImageKit from "@imagekit/nodejs";

const globalForImageKit = globalThis as unknown as { imagekit?: ImageKit };

function getImageKit(): ImageKit {
  if (!globalForImageKit.imagekit) {
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error(
        "IMAGEKIT_PRIVATE_KEY is not set; provide it to use the media library.",
      );
    }
    globalForImageKit.imagekit = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    });
  }
  return globalForImageKit.imagekit;
}

// Lazily create the ImageKit client on first use so importing this module does
// not throw when IMAGEKIT_PRIVATE_KEY is missing at build/import time.
const imagekit = new Proxy({} as ImageKit, {
  get(_target, prop, receiver) {
    return Reflect.get(getImageKit(), prop, receiver);
  },
});

export default imagekit;