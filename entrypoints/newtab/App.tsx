import { useState } from "react"
import { Settings } from "lucide-react"
import Clock from "./components/Clock"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Armrest Dashboard</h1>
      <Clock />
      <div className="mt-8">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent direction="right" className="h-full max-w-sm top-0 right-0 left-auto mt-0 rounded-none">
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>
                Configure your dashboard preferences.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Settings panel content goes here.
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
