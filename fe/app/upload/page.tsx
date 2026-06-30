"use client";
import { useRef } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

const Upload = () => {
  const videoRef = useRef(null);
  const handleFileChange = () => {};
  return (
    <div className="mx-2 my-5">
      {/* <form action="" className="grid grid-cols-12 gap-2">
        <div className="flex flex-col col-span-5  gap-2 border h-[400px] rounded-3xl items-center justify-center">
          <span className="bg-gray-900 p-3 rounded-full">
            <IoCloudUploadOutline size={28} stroke="red" />
          </span>
          <p className="font-semibold text-lg">Select Video to Upload</p>
          <p className=" text-xs text-center">
            supported Format:MP4 and WebM <br />
            (max size: 10mb){" "}
          </p>
          <button
            type="button"
            className="mt-2 bg-red-500 py-2 px-1.5 rounded-3xl cursor-pointer text-sm"
            onClick={() => {
              videoRef.current && videoRef.current?.value;
            }}
          >
            {" "}
            Upload a video
          </button>
          <input
            ref={videoRef}
            type="file"
            name="uploadVideo"
            id="uploadVide"
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
        </div>
        <div className="border col-span-7 rounded-3xl "> Other forms</div>
      </form> */}
    </div>
  );
};

export default Upload;
