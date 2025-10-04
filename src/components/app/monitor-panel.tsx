"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Leaf, Flower, Bot, Satellite } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { detectAndMonitorBlooms, DetectAndMonitorBloomsOutput } from "@/ai/flows/detect-and-monitor-blooms"
import type { Marker } from "./map"
import { Progress } from "../ui/progress"

const FormSchema = z.object({
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  date: z.object({
    from: z.date(),
    to: z.date(),
  }),
})

type MonitorPanelProps = {
  addMarker: (marker: Omit<Marker, "id">) => void;
};

export function MonitorPanel({ addMarker }: MonitorPanelProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<DetectAndMonitorBloomsOutput | null>(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      location: "California, USA",
      date: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
      },
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await detectAndMonitorBlooms({
        location: data.location,
        startDate: format(data.date.from, "yyyy-MM-dd"),
        endDate: format(data.date.to, "yyyy-MM-dd"),
      });
      setResult(response);
      addMarker({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
        name: data.location,
        status: response.bloomStatus,
        icon: response.confidenceLevel > 0.7 ? <Flower className="text-destructive" /> : <Leaf className="text-primary" />
      });
    } catch (error) {
      console.error(error);
      // You can use a toast to show the error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Detect Blooms</CardTitle>
          <CardDescription>
            Use AI to analyze satellite data for bloom events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., California, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Detect Blooms"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {result && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Bot /> AI Analysis Result
            </CardTitle>
            <CardDescription>{form.getValues("location")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-lg">{result.bloomStatus}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <FormLabel>Confidence Level</FormLabel>
                <span className="text-sm font-medium text-primary">{(result.confidenceLevel * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.confidenceLevel * 100} />
            </div>
            <div>
              <FormLabel>Data Sources</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.satelliteDataUsed.map((source) => (
                  <div key={source} className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm bg-secondary">
                    <Satellite className="h-4 w-4 text-muted-foreground" />
                    {source}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
