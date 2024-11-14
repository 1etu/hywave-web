"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Gamepad,Menu, X, ChevronDown, Star, Wrench, Sparkles, Check, ArrowUp, ArrowDown, Info, Code, User, GitBranch, MessageCircle, Activity, MoreHorizontal, PackageCheck } from "lucide-react"
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


import changelogData from '../db/changelogs.json'
import { Category, ChangeType, ChangelogEntry } from '@/types/global'

const categories: Category[] = [
  { name: "Hepsi", icon: Star },
  { name: "Oyun", icon: Gamepad },
  { name: "Performans", icon: Activity },
  { name: "Discord", icon: MessageCircle },
  { name: "Diğer", icon: MoreHorizontal },
]

const breathingAnimation = `
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 1; }
  }
`;

const CommitInfoPopover = ({ commitInfo }: { commitInfo: ChangelogEntry['commitInfo'] }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" className="p-1">
        <Code className="w-4 h-4 text-gray-500" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="grid gap-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Güncelleme hakkında teknik detaylar
          </p>
        </div>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center">
            <User className="w-4 h-4 text-gray-500" />
            <span className="col-span-2 text-sm">{commitInfo.author}</span>
          </div>
          <div className={`grid grid-cols-3 items-center ${commitInfo.commitType === "fix" ? "bg-orange-100" : "bg-green-100"}`}>
            <GitBranch className="w-4 h-4 text-gray-500" />
            <span className="col-span-2 text-sm">{commitInfo.commitType}</span>
          </div>
          </div>
      </div>
    </PopoverContent>
  </Popover>
)

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.7, ease: "easeInOut" }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 overflow-hidden"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
      className="relative z-20" 
    >
      <motion.div 
        className="w-32 h-32 bg-gradient-to-br from-black to-gray-800 flex items-center justify-center rounded-2xl shadow-2xl"
        whileHover={{ scale: 1.05, transition: { duration: 0.2, ease: "easeOut" } }}
        whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
      >
        <motion.span 
          className="text-white font-bold text-6xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0, duration: 0.1, type: "spring", stiffness: 150, damping: 12 }}
        >
          H
        </motion.span>
      </motion.div>
    </motion.div>
  </motion.div>
)

export default function Changelog() {
  const [selectedCategory, setSelectedCategory] = useState("Hepsi")
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [hoveredEntry, setHoveredEntry] = useState<ChangelogEntry | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("changelog")
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>(() => {
    return changelogData.map(entry => ({
      ...entry,
      changes: entry.changes.map(change => ({
        ...change,
        type: change.type as ChangeType
      }))
    }));
  });
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchPopupRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [filteredEntries, setFilteredEntries] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault()
        setIsSearchOpen(true)
        setTimeout(() => searchPopupRef.current?.focus(), 100)
      } else if (e.key === "Escape") {
        setIsSearchOpen(false)
        setActivePopup(null)
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scrollAreaRef.current) {
        const scrollAmount = 100;
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            scrollAreaRef.current.scrollBy(0, -scrollAmount);
            break;
          case 'ArrowDown':
            e.preventDefault();
            scrollAreaRef.current.scrollBy(0, scrollAmount);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const filtered = changelogEntries.filter(entry => 
      (selectedCategory === "Hepsi" || entry.categories.includes(selectedCategory)) &&
      (selectedVersion === null || entry.version === selectedVersion) &&
      (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entry.changes.some(change => change.text.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    setFilteredEntries(filtered);
  }, [changelogEntries, selectedCategory, selectedVersion, searchQuery]);

  const versionCounts = useMemo(() => {
    return changelogEntries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.version] = (acc[entry.version] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [changelogEntries])

  const categoryCounts = useMemo(() => {
    const entries = selectedVersion
      ? changelogEntries.filter(entry => entry.version === selectedVersion)
      : changelogEntries

    return entries.reduce((acc, entry) => {
      entry.categories.forEach(category => {
        acc[category] = (acc[category] || 0) + 1
      })
      acc["Hepsi"] = (acc["Hepsi"] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [changelogEntries, selectedVersion])

  const CategoryIcon = ({ name }: { name: string }) => {
    const IconComponent = categories.find(cat => cat.name === name)?.icon || Star
    return <IconComponent className="w-4 h-4 mr-2" />
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setIsSignInOpen(false)
    }, 1500)
  }

  useEffect(() => {
    const surpriz = () => {
      console.clear();
      
      const styles = [
        'font-size: 20px',
        'font-weight: small',
        'color: #10B981',
        'text-shadow: 0 0 5px #34D399, 0 0 5px #34D399, 0 0 3px #34D399',
        'background: linear-gradient(45deg, transparent, rgba(52, 211, 153, 0.2), transparent)',
        'padding: 10px',
        'text-align: center',
      ].join(';');

      console.log('%c', 'color: #FFD93D; font-weight: bold;');
      console.log('%cHYWAVE.DEV/JOBS', styles);
    };

    surpriz();

    const intervalId = setInterval(surpriz, 5000);

    return () => clearInterval(intervalId);
  }, []);


  const getUpdateTypeColor = (type: 'NEW_FEATURE' | 'FIX' | 'IMPROVEMENT' | 'OTHER') => {
    switch (type) {
      case 'NEW_FEATURE':
        return 'text-green-500 bg-green-500/10';
      case 'FIX':
        return 'text-orange-500 bg-orange-500/10';
      case 'IMPROVEMENT':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getUpdateTypeIcon = (type: 'NEW_FEATURE' | 'FIX' | 'IMPROVEMENT' | 'OTHER') => {
    switch (type) {
      case 'NEW_FEATURE':
        return (
          <>
            <style jsx>{breathingAnimation}</style>
            <Sparkles className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-1 animate-breathe" 
                      style={{ animation: 'breathe 2s ease-in-out infinite' }} />
          </>
        );
      case 'FIX':
        return <Wrench className="w-5 h-5 mr-2 text-orange-500 flex-shrink-0 mt-1" />;
      case 'IMPROVEMENT':
        return <ArrowUp className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-1" />;
      default:
        return <Info className="w-5 h-5 mr-2 text-gray-500 flex-shrink-0 mt-1" />;
    }
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const keywords = ['SSS', 'Kurallar', 'Hizmet Koşulları', 'Başvur', 'İletişim'];
    const matchedKeywords = keywords.filter(keyword => 
      keyword.toLowerCase().includes(value.toLowerCase())
    );
    setSearchSuggestions(matchedKeywords);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery('')
    setSearchSuggestions([])
    setIsSearchOpen(false)
    switch (suggestion.toLowerCase()) {
      case 'sss':
        setActivePopup('faq')
        break
      case 'kurallar':
        setActivePopup('rules')
        break
      case 'hizmet koşulları':
        setActivePopup('tos')
        break
      case 'başvur':
      case 'iletişim':
        break
    }
  }

  const handlePathChange = (newPath: string) => {
    if (newPath === 'dev') {
      setActiveTab("changelog");
    } else if (newPath === 'community') {
      setActiveTab("forum");
    }
  };

  const handleLogoClick = () => {
    setActiveTab("changelog");
  };

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      {!isLoading && (
        <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
          <header className="flex items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <button 
                onClick={handleLogoClick}
                className="w-8 h-8 bg-black flex items-center justify-center rounded"
              >
                <span className="text-white font-bold text-lg">H</span>
              </button>
              <h1 className="text-xs font-bold ml-2">
                <button 
                  onClick={handleLogoClick}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  hywave
                </button>
                <span className="text-gray-300 dark:text-gray-600"> / </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-all duration-300">
                    <span className="flex items-center">
                      <span className="relative flex items-center">
                        {activeTab === "changelog" ? "dev" : "community"}
                      </span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handlePathChange('dev')} className="relative">
                      dev
                      {activeTab === "changelog" && <Check className="ml-2 h-3 w-3" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePathChange('community')} className="relative">
                      community
                      {activeTab === "forum" && <Check className="ml-2 h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </h1>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                <Input 
                  ref={searchInputRef}
                  className="pl-8 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Ara.. (Fokus için '/' tuşuna basın)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2  -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                style={{ textShadow: '1px 1px 2px rgba(16, 185, 129, 0.5)' }}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              <Button 
                className="border border-emerald-500 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500/100 disabled:opacity-50 disabled:cursor-not-allowed "
                onClick={() => setIsSignInOpen(true)}
              >
                <span className="relative z-10">Oyna</span>
              </Button>
            </div>
          </header>
          <div className="flex flex-1 overflow-hidden">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
                >
                  <ScrollArea className="flex-grow">
                    <nav className="p-4 space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Versiyonlar</h2>
                        <div className="space-y-1">
                          {Object.entries(versionCounts).map(([version, count]) => (
                            <Button
                              key={version}
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-between ${selectedVersion === version ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                              onClick={() => setSelectedVersion(version === selectedVersion ? null : version)}
                            >
                              <span className="flex items-center">
                                <PackageCheck className="w-4 h-4 mr-2" />
                                {version}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">{count}</span>
                            </Button>
                          ))}
                        </div>
                        {selectedVersion && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => setSelectedVersion(null)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Filtreyi Temizle
                          </Button>
                        )}
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GÜNCELLEMELER</h2>
                        <div className="space-y-1">
                          {categories.map((category) => (
                            <Button
                              key={category.name}
                              variant="ghost"
                              size="sm"
                              className={`w-full justify-between ${selectedCategory === category.name ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                              onClick={() => setSelectedCategory(category.name === selectedCategory ? "Hepsi" : category.name)}
                            >
                              <span className="flex items-center">
                                <category.icon className="w-4 h-4 mr-2" />
                                {category.name}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">{categoryCounts[category.name] || 0}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </nav>
                  </ScrollArea>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                    <span className="text-xs bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-clip-text text-transparent pointer-events-none cursor-default select-none">Not affiliated with FiveM and Tebex</span>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                      <button onClick={() => setActivePopup('tos')} className="px-1 py-0.5 text-xs rounded transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600">Hizmet Koşulları</button>
                      <button onClick={() => setActivePopup('faq')} className="px-1 py-0.5 text-xs rounded transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600">SSS</button>
                      <button onClick={() => setActivePopup('rules')} className="px-1 py-0.5 text-xs rounded transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600">Kurallar</button>

                    </div>
                    <p className="text-center bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-clip-text text-transparent pointer-events-none cursor-default select-none">© 2020 Hywave - Bütün Hakları Saklıdır.</p>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
            <main className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <TabsList className="w-full justify-start bg-gray-100 dark:bg-gray-800 p-0 h-12">
                  <TabsTrigger value="changelog" className="flex-1 h-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                    Güncellemeler
                  </TabsTrigger>
                  <TabsTrigger value="forum" className="flex-1 h-full data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 relative">
                    Topluluk
                    <Badge className="ml-2 text-xs bg-red-500/20 text-red-500">BAKIM</Badge>

                  </TabsTrigger>
                </TabsList>
                <TabsContent value="changelog" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-6 space-y-8">
                      {filteredEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="space-y-4 relative"
                          onMouseEnter={() => setHoveredEntry(entry)}
                          onMouseLeave={() => setHoveredEntry(null)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400 cursor-default select-none">{entry.date}</span>
                              <Badge variant="outline" className="text-sm font-medium bg-emerald-500/20 border-emerald-500/20">
                                <span className="bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                                  {entry.version}
                                </span>
                              </Badge>
                              {entry.categories.map((category, catIndex) => (
                                <Badge key={catIndex} className="text-sm font-medium bg-emerald-500/20 text-emerald-500">
                                  {catIndex === 0 && <CategoryIcon name={category} />}
                                  {category}
                                </Badge>
                              ))}
                              <motion.div
                                whileTap={{ scale: 0.95 }}
                              >
                              </motion.div>
                            </div>
                            <CommitInfoPopover commitInfo={entry.commitInfo} />
                          </div>
                          <h2 className="text-2xl font-helvetica text-gray-800 dark:text-gray-100">{entry.title}</h2>
                          <p className="text-gray-600 dark:text-gray-300">{entry.description}</p>
                          <ul className="space-y-2">
                            {entry.changes.map((change, changeIndex) => (
                              <motion.li
                                key={changeIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: changeIndex * 0.1 }}
                                className={`flex items-start ${getUpdateTypeColor(change.type as 'NEW_FEATURE' | 'FIX' | 'IMPROVEMENT' | 'OTHER')}`}
                              >
                                {getUpdateTypeIcon(change.type as 'NEW_FEATURE' | 'FIX' | 'IMPROVEMENT' | 'OTHER')}
                                <span className="relative">
                                  <span className={`absolute inset-0 ${getUpdateTypeColor(change.type as 'NEW_FEATURE' | 'FIX' | 'IMPROVEMENT' | 'OTHER')} opacity-10 blur-sm pointer-events-none cursor-default select-none`}></span>
                                  <span className="relative cursor-default select-none pointer-events-none">{change.text}</span>
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                          <div className="mt-4 space-y-2">
                            <p className="text-gray-600 dark:text-gray-400 font-roboto400 w1/3 leading-8  ">{entry.developerNotes}</p>
                          </div>
                          <AnimatePresence>
                            {hoveredEntry === entry && entry.images.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-1/2 transform -translate-x-1/2 mt-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 flex space-x-4 max-w-3xl"
                              >
                                {entry.images.map((image, imageIndex) => (
                                  <div key={imageIndex} className="relative">
                                    <Image
                                      src={image}
                                      alt={`Update image ${imageIndex + 1}`}
                                      width={300}
                                      height={200}
                                      className="rounded-md object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-md" />
                                    <span className="absolute bottom-2 left-2 text-white text-sm font-medium">
                                      Image {imageIndex + 1}
                                    </span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {index < filteredEntries.length - 1 && (
                            <Separator className="mt-8 bg-gray-200 dark:bg-gray-700" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}