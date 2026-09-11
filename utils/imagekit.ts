import ImageKit from "@imagekit/nodejs";

const globalForImageKit = globalThis as unknown as { imagekit?: ImageKit };

const imagekit =
  globalForImageKit.imagekit ??
  new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForImageKit.imagekit = imagekit;
}

export default imagekit;