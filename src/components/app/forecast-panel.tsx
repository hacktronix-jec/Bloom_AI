"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Bot, Flower, Leaf } from "lucide-react"

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
import { generateBloomForecast, GenerateBloomForecastOutput } from "@/ai/flows/generate-bloom-forecast"
import type { Marker } from "./map"

const FormSchema = z.object({
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  date: z.object({
    from: z.date(),
    to: z.date(),
  }),
})

type ForecastPanelProps = {
  addMarker: (marker: Omit<Marker, "id">) => void;
};

export function ForecastPanel({ addMarker }: ForecastPanelProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<GenerateBloomForecastOutput | null>(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      location: "Kyoto, Japan",
      date: {
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 30)),
      },
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await generateBloomForecast({
        location: data.location,
        startDate: format(data.date.from, "yyyy-MM-dd"),
        endDate: format(data.date.to, "yyyy-MM-dd"),
      });
      setResult(response);
      addMarker({
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
        name: data.location,
        status: "Forecasted Bloom",
        icon: <Flower className="text-accent" />
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Predict Blooms</CardTitle>
          <CardDescription>
            Generate a bloom forecast for any location.
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
                      <Input placeholder="e.g., Kyoto, Japan" {...field} />
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
                    <FormLabel>Forecast Period</FormLabel>
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
                              <span>Pick a date range</span>
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
                    Predicting...
                  </>
                ) : (
                  "Generate Forecast"
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
              <Bot /> AI Forecast
            </CardTitle>
            <CardDescription>{form.getValues("location")}</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert">
            <p>{result.forecast}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
