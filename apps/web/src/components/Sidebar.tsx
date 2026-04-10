import { cn } from "@/lib/utils"
import { useState } from "react"
import { tools } from "@/data/tools"
import { createLink, Link } from "@tanstack/react-router"
import Button from "./ui/button"
import { IconMenu } from "@tabler/icons-react"

const ButtonLink = createLink(Button)

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-1 text-white cursor-pointer"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
      >
        <IconMenu size={18} />
      </button>

      <div className={cn(`shrink-0 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transition-all duration-300 w-64 py-4 px-2`, isOpen ? `ml-0` : `-ml-64`)}>
          <div className="flex items-center justify-center pt-1 pb-2">
            <Link to="/" className="pl-6 flex items-center no-underline font-bold text-gray-100">
              <img src="/logo192.png" alt="Logo" className="inline-block mr-2 w-5 h-5" />
              <span className="text-blue-400 text-md">SnapBit Tools</span>
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-y-3 mb-4">
            {tools.map((tool) => (
              <ButtonLink key={tool.slug} to={tool.href} className="flex shrink-0 w-full justify-start bg-transparent ring-1 ring-gray-900 rounded-lg text-sm text-gray-800" activeOptions={{ exact: true }} activeClassName="bg-gray-700">
                  {tool.name}
              </ButtonLink>
            ))}
          </div>
      </div>
    </>
  )
}
