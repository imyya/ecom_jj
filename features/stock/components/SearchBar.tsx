"use client";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {useDebouncedCallback} from 'use-debounce'
export function SearchBar() {
    const searchParams = useSearchParams();
    const  defaultValue=searchParams.get('search')
    const pathName = usePathname();
    const { replace } = useRouter();
    const [input, setInput] = useState(defaultValue ? defaultValue:'')
    // const [isXOn, setIsXOn] = useState(defaultValue ? defaultValue : false);

  // params.set("search",)

  const onReitianilize = () => {
    const params = new URLSearchParams(searchParams.toString());

    setInput('')
    params.delete("search");
    replace(`${pathName}?${params.toString()}`);
    handleChange.cancel()
    // setIsXOn(false)
  };
  const handleChange = useDebouncedCallback((search: string) => {
      const params = new URLSearchParams(searchParams.toString());

    console.log("searching ...",search)
    if (search) {
    //   setIsXOn(true);
      params.set("search", search);
    } 
    else {
      params.delete("search");
    }
    // if(search=="") setIsXOn(false)
    replace(`${pathName}?${params.toString()}`);
    // console.log(search);
  },300);
  return (
    <div className="flex gap-3 items-center">
      <Input
        value={input}
        onChange={(e) => {setInput(e.target.value)
            handleChange(e.target.value)
        }}
        placeholder="Rechercher ..."
        className="bg-white h-10 w-75"
        // defaultValue={searchParams.get('search')?.toString()}
      />
      {input && (
        <button>

            <X
              onClick={() => onReitianilize()}
              className="bg-neutral-200 h-4 w-4 rounded-3xl p-0.5 hover:bg-neutral-400 cursor-pointer"
            />
        </button>
      )}
    </div>
  );
}
