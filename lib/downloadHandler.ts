export const IOS_APP_STORE_URL =
  "https://apps.apple.com/us/app/the-fur-finder/id6763890902";

export const ANDROID_BETA_URL = "/join-testing?platform=android#android-beta-request";

export const downloadApp = (os: "android" | "ios" | "") => {
  if (os === "ios") {
    return IOS_APP_STORE_URL;
  }

  if (os === "android") {
    return ANDROID_BETA_URL;
  }

  return "/download";
};
