/**
 * Utility function to handle the actual file upload to Cloudinary.
 * This is an unsigned upload, requiring only the Cloud Name and the Preset.
 */

const CLOUD_NAME: string = "dpjnnzvyf";
const UPLOAD_PRESET: string = "travel_app_unsigned";

const UPLOAD_URL: string = `https://api.cloudinary.com/v1_1/dpjnnzvyf/image/upload`;

/**
 * @param file The file object to upload.
 * @param onProgress Callback to report upload progress (0-100).
 * @returns The secure URL of the uploaded image.
 */
export async function uploadFileToCloudinary(
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  if (!CLOUD_NAME || CLOUD_NAME === "<YOUR_CLOUD_NAME>") {
    throw new Error(
      "Cloudinary setup error: Please provide your CLOUD_NAME in src/api/CloudinaryUploader.ts"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", UPLOAD_URL, true);

    // Track upload progress for the progress bar
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            resolve(response.secure_url as string);
          } else {
            reject(new Error("Cloudinary response missing secure URL."));
          }
        } catch (e: unknown) {
          reject(new Error("Failed to parse Cloudinary response."));
        }
      } else {
        let errorMessage: string = `Cloudinary Upload Failed: Status ${xhr.status}`;
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error && response.error.message) {
            errorMessage += ` - ${response.error.message}`;
          }
        } catch (e: unknown) {}
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudinary upload."));
    };

    xhr.send(formData);
  });
}
