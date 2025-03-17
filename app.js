import React, { useState, useRef } from "react";
import { Camera } from "react-camera-pro";
import axios from "axios";

export default function IDVerification() {
  const camera = useRef(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [mode, setMode] = useState("id");

  const capturePhoto = () => {
    if (!camera.current) return;
    const photo = camera.current.takePhoto();
    if (mode === "id") {
      setIdPhoto(photo);
      setMode("selfie");
    } else {
      setSelfie(photo);
    }
  };

  const uploadToS3 = async () => {
    const formData = new FormData();
    formData.append("national_id", { uri: idPhoto, name: "id.jpg", type: "image/jpeg" });
    formData.append("selfie", { uri: selfie, name: "selfie.jpg", type: "image/jpeg" });

    try {
      await axios.post("http://localhost:8000/verify_id/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Verification images uploaded successfully!");
    } catch (error) {
      console.error("Upload error", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!idPhoto || !selfie ? (
        <Camera ref={camera} aspectRatio={16 / 9} facingMode={mode === "selfie" ? "user" : "environment"} />
      ) : null}
      
      {idPhoto && <img src={idPhoto} alt="ID" className="mt-4 w-64 h-auto" />}
      {selfie && <img src={selfie} alt="Selfie" className="mt-4 w-64 h-auto rounded-full" />}
      
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={capturePhoto}>
        {mode === "id" ? "Capture ID" : "Capture Selfie"}
      </button>
      
      {idPhoto && selfie && (
        <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded" onClick={uploadToS3}>
          Upload
        </button>
      )}
    </div>
  );
}
