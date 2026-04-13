import { tools } from "@/data/tools";
import { cn } from "@/lib/utils";
import { IconLayoutSidebar, IconLink } from "@tabler/icons-react";
import { Link, useLocation} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { blogPosts } from "@/data/blogs";


export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const current_path = useLocation().pathname;

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) { 

      setIsOpen(false)
    }
  },[current_path])

  useEffect(() => { 
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = window.innerWidth < 768;


  return (
    <>
       {/* background Overlay */}
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-10 "
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          `group fixed top-[15px] left-4 z-50 p-[4px] text-white cursor-pointer transition-colors duration-300`,
          isOpen ? `` : `bg-gray-800 rounded-md ring-1 ring-gray-900/50 hover:opacity-80 `,
        )}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
      >
        <div className="p-1 group-hover:bg-gray-700 rounded-[4px] transition-colors duration-300">
          <IconLayoutSidebar size={20} className="text-brand-primary" />
        </div>
      </button>

      <motion.div
        className={cn(
          `shrink-0 border-r-[1px] border-gray-900 text-white overflow-hidden transition-all duration-300 w-64 py-4 px-2`,
          isOpen ? `ml-0` : `-ml-64`,
          isMobile ? `fixed top-0 left-0 h-full bg-gray-900 z-20` : `relative h-screen`,
        )}
      >
       
        <div className="flex items-center justify-center pt-1 pb-2">
          <Link to="/" className="pl-6 flex items-center no-underline font-bold text-gray-100">
            <img src="/logo192.png" alt="Logo" className="inline-block mr-2 w-5 h-5" />
            <span className="text-blue-400 text-md">SnapBit Tools</span>
          </Link>
        </div>
          <h2 className="mt-4 text-gray-400 text-sm font-semibold mb-2 px-2">Tools</h2>
        <div className="flex flex-col items-center justify-between gap-y-3 mb-4">

          {tools.map((tool) => (
            <Link
              key={tool.slug}
              to={tool.href}
              className={cn(
                "group px-4 py-2 flex text-gray-400 shrink-0 w-full justify-start bg-transparent ring-1 ring-gray-900 rounded-lg text-sm ",
                current_path === tool.href ? "bg-gray-900 text-gray-200 font-semibold" : ""
              )}
              activeOptions={{ exact: true }}
              
            >
              <IconLink size={16} className="w-0 mr-2 group-hover:w-4 transition-all duration-150 " />
              {tool.name}
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-gray-400 text-sm font-semibold mb-2 px-2">Blogs</h2>
          
          {blogPosts.map((post) => (
            <Link
              key={post.href}
              to={post.href}
              className={cn(
                "px-4 py-2 flex text-gray-400 shrink-0 w-full justify-start bg-transparent ring-1 ring-gray-900 rounded-lg text-sm ",
                current_path === post.href ? "bg-gray-900 text-gray-200 font-semibold" : ""
              )}
              activeOptions={{ exact: true }}
            >
              <span className="overflow-hidden truncate">


              {post.title}
              </span>
            </Link>
          ))}

        </div>
      </motion.div>
    </>
  );
}
