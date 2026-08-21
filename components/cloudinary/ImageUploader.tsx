"use client";

import { CldUploadWidget } from "next-cloudinary";

const ImageUploader = () => {
  return (
    <CldUploadWidget
      uploadPreset="socialpay_products"
      signatureEndpoint="/api/cloudinary/signature"
      onSuccess={(result) => {
        console.log("Upload successful:", result);
      }}
    >
      {({ open }) => {
        return (
          <button
            type="button"
            onClick={() => open()}
            className="rounded-md bg-black px-4 py-2 text-white"
          >
            Upload Product Image
          </button>
        );
      }}
    </CldUploadWidget>
  );
};

export default ImageUploader;
