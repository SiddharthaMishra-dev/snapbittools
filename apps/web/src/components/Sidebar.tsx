import { cn } from "@/lib/utils"
import { useState } from "react"
import { tools } from "@/data/tools"
import { createLink, Link } from "@tanstack/react-router"
import Button from "./ui/button"
import { IconLayoutSidebar, IconLink, IconMenu } from "@tabler/icons-react"

const ButtonLink = createLink(Button)

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(`group fixed top-[15px] left-4 z-50 p-[4px] text-white cursor-pointer transition-colors duration-300`,
          isOpen? ``: `bg-gray-800 rounded-md ring-1 ring-gray-900/50 hover:opacity-80 `
        )}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}

      >
        <div className="p-1 group-hover:bg-gray-700 rounded-[4px] transition-colors duration-300">

        <IconLayoutSidebar size={20} className="text-brand-primary"/>
        </div>
      </button>

      <div className={cn(`shrink-0 border-r-[1px] border-gray-900 text-white overflow-hidden transition-all duration-300 w-64 py-4 px-2`, isOpen ? `ml-0` : `-ml-64`)}>
          <div className="flex items-center justify-center pt-1 pb-2">
            <Link to="/" className="pl-6 flex items-center no-underline font-bold text-gray-100">
              <img src="/logo192.png" alt="Logo" className="inline-block mr-2 w-5 h-5" />
              <span className="text-blue-400 text-md">SnapBit Tools</span>
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-y-3 mb-4">
            {tools.map((tool) => (
              <Link key={tool.slug} to={tool.href} className="group px-4 py-2 flex text-gray-400 shrink-0 w-full justify-start bg-transparent ring-1 ring-gray-900 rounded-lg text-sm " activeOptions={{ exact: true }} activeClassName="bg-gray-700">
                <IconLink size={16} className="w-0 mr-2 group-hover:w-4 transition-all duration-150 " /> 
                {tool.name}
              </Link>
            ))}
          </div>
      </div>
    </>
  )
}
