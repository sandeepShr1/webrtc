import React from "react";

const Banner = () => {
  return (
    <div className="my-auto flex flex-col gap-3 justify-center h-[400px] bg-[url('/images/bg.jpg')] bg-cover bg-center">
      <p>Welcome to BD Screens</p>
      <h2 className="text-4xl font-semibold">
        Download Unlimited <br /> Movies, Drama, Music Video <br /> and More
        Content
      </h2>
      <p className="text-xs">
        Enjoy exclusive Music Video popular movies and Live shows.
      </p>
      <p className="text-xs">Subscribe DB Screen now</p>
      <button className="bg-red-600 w-[150px] px-4 py-1.5 rounded-md  hover:bg-red-500 cursor-pointer">
        Subscribe
      </button>
    </div>
  );
};

export default Banner;
