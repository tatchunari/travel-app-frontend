/**
 * Utility function to handle the actual file upload to Cloudinary.
 * This is an unsigned upload, requiring only the Cloud Name and the Preset.
 */

// IMPORTANT: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL CLOUDINARY CREDENTIALS
// Cloud Name is required to determine the API endpoint.
const CLOUD_NAME: string = "dpjnnzvyf";
// Upload Preset name from Cloudinary settings (must be Unsigned)
const UPLOAD_PRESET: string = "travel_app_unsigned";

// Cloudinary's standard upload endpoint
const UPLOAD_URL: string = `https://api.cloudinary.com/v1_1/dpjnnzvyf/image/upload`;

/**
 * Uploads a single file to Cloudinary and returns the secure public URL.
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

    xhr.onload = (event: Event) => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          // Cloudinary returns the secure URL under the 'secure_url' property
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
        } catch (e: unknown) {
          // Ignore JSON parsing error if response is not JSON
        }
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = (event: Event) => {
      reject(new Error("Network error during Cloudinary upload."));
    };

    xhr.send(formData);
  });
}
