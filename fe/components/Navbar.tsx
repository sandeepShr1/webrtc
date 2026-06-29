"use client";
import Image from "next/image";
import Link from "next/link";
import { IoHomeOutline } from "react-icons/io5";
import { MdOutlineLocalMovies } from "react-icons/md";
import { LuDrama } from "react-icons/lu";
import { MdOutlineLibraryMusic } from "react-icons/md";
import { PiMaskHappyLight } from "react-icons/pi";
import { IoSearchOutline } from "react-icons/io5";
import { IoMenuSharp } from "react-icons/io5";
import { useState } from "react";
import { GrClose } from "react-icons/gr";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <nav className="flex justify-between  my-1.5">
        <div className="flex gap-10">
          <div className="flex gap-1 justify-center items-center gap-1 cursor-pointer">
            <div className="lg:hidden text-gray-200">
              {!isOpen ? (
                <IoMenuSharp size={23} onClick={() => setIsOpen(!isOpen)} />
              ) : (
                <GrClose size={23} onClick={() => setIsOpen(!isOpen)} />
              )}
            </div>
            <Image
              src={"/images/Group.png"}
              alt="logo"
              width={30}
              height={20}
            />
            <Image
              src={"/images/logo.png"}
              alt="logo"
              width={130}
              height={50}
            />
          </div>
          <div className="hidden gap-2.5 navlist lg:!flex">
            <div className="flex items-center gap-1">
              <IoHomeOutline />
              <Link href={"/"} className="active">
                Home
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <MdOutlineLocalMovies />
              <Link href={"/"} className="">
                Movie
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <LuDrama />
              <Link href={"/"}>Drama</Link>
            </div>
            <div className="flex items-center gap-1">
              <MdOutlineLibraryMusic />
              <Link href={"/"}>Music Video</Link>
            </div>

            <div className="flex items-center gap-1">
              <PiMaskHappyLight />
              <Link href={"/"}>Comedies</Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <IoSearchOutline className="cursor-pointer" size={23} />
          <button className="bg-red-600 px-4 rounded-md h-full hover:bg-red-500 cursor-pointer">
            Sign In
          </button>
        </div>
      </nav>
      <div
        className={` bg-gray-900 flex-col items-center w-full py-5 mt-4 gap-2.5 navlist lg:!hidden transition-transform duration-300 ease-in-out ${isOpen ? "flex" : "hidden"}`}
      >
        <div className="flex items-center gap-1">
          <IoHomeOutline />
          <Link href={"/"} className="active">
            Home
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <MdOutlineLocalMovies />
          <Link href={"/"} className="">
            Movie
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <LuDrama />
          <Link href={"/"}>Drama</Link>
        </div>
        <div className="flex items-center gap-1">
          <MdOutlineLibraryMusic />
          <Link href={"/"}>Music Video</Link>
        </div>

        <div className="flex items-center gap-1">
          <PiMaskHappyLight />
          <Link href={"/"}>Comedies</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
