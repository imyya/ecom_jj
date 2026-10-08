"use client";
import { format, parseISO } from "date-fns";
import { ChevronDownIcon, X } from "lucide-react";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DatePicker({ type }: { type: "from" | "to" }) {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const defaultValue = searchParams.get(type)
  const { replace } = useRouter();
  const [date, setDate] = useState<Date|null>(defaultValue ? parseISO(defaultValue) : null);

  const onDateChange = (d?: Date) => {
    if (!d) return;
    setDate(d);
    const params = new URLSearchParams(searchParams.toString());
    const date = format(d, "yyyy-MM-dd")
    params.set(type,date)
    params.delete("page")
    replace(`${pathName}?${params.toString()}`);
  };

    const onReitianilize = () => {
    const params = new URLSearchParams(searchParams.toString());
    setDate(null)
    params.delete("page")
    params.delete(type);
    replace(`${pathName}?${params.toString()}`);
    }
  return (
    <div className="flex items-center gap-3">

    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            data-empty={!date}
            className="h-10 w-32 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
          >
            {date ? (
              format(date, "P", { locale: fr })
            ) : (
              <span>Choisir date</span>
            )}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date?? undefined}
          onSelect={(e) => onDateChange(e)}
          defaultMonth={date ?? undefined}
        />
      </PopoverContent>
    </Popover>
    {
      date &&
    <button
        type="button"
        aria-label="Effacer"
            onClick={()=>onReitianilize()}
        >
          <X
            className="bg-neutral-200 h-4 w-4 rounded-3xl p-0.5 hover:bg-neutral-400 cursor-pointer"
          />
        </button>
    }
    </div>
  );
}
