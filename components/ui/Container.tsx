import {cn} from "@/lib/utils"


export default function Container ({
    className,
    children,
}:{
    className?:string
    children: React.ReactNode
}){
    return (
        <div className={cn("mx-auto w-full max-w-7xl px-6 lg:px-12",className)}>
            {children}
        </div>
    )
}