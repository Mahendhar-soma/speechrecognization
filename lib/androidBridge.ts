export type AndroidBridge = {
  shareImage?: (imageUrl: string) => void;
  shareText?: (text: string) => void;
};

declare global {
  interface Window {
    Android?: AndroidBridge;
  }
}

export function getAndroidBridge(): AndroidBridge | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.Android;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string" && reader.result) {
        resolve(reader.result);
        return;
      }
      reject(new Error("card-failed"));
    };
    reader.onerror = () => {
      reject(new Error("card-failed"));
    };
    reader.readAsDataURL(blob);
  });
}
