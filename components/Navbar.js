import nav from "@/lib/nav.config"
import Link from "next/link"

export default function Navbar(){
    return(
        <div className="">
            {nav.map((item, index)=>(
                <Link key={index} href={item.href}>
                    <button className="font-medium text-lg">
                        {item.title}
                    </button>
                </Link>
            ))}
        </div>
    )
}