"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, MapPin, Camera } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { Marker } from "./map"
import { useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

const FormSchema = z.object({
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  date: z.date(),
  notes: z.string().optional(),
  species: z.string().min(2, { message: "Please specify a species."})
})

type CitizenSciencePanelProps = {
    addMarker: (marker: Omit<Marker, "id">) => void;
};


export function CitizenSciencePanel({ addMarker }: CitizenSciencePanelProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      location: "Central Park, NYC",
      date: new Date(),
      notes: "",
      species: "Cherry Blossom",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not connect to the database.",
        });
        return;
    }
    
    setIsLoading(true)

    const reportsCollection = collection(firestore, 'citizenReports');
    try {
        await addDocumentNonBlocking(reportsCollection, {
            userId: 'anonymous',
            latitude: 40.785091 + (Math.random() - 0.5) * 0.1, // Add some jitter
            longitude: -73.968285 + (Math.random() - 0.5) * 0.1, // Add some jitter
            species: data.species,
            reportDate: data.date.toISOString(),
            notes: data.notes,
            location: data.location,
            validationStatus: "pending",
        });

        toast({
          title: "Report Submitted!",
          description: "Thank you for contributing to BloomWatch AI.",
        })
        addMarker({
            lat: 40.785091,
            lng: -73.968285,
            name: data.location,
            status: `Reported: ${data.species}`,
            icon: <MapPin className="text-blue-500" />
        });
        form.reset()
    } catch(e) {
        console.error(e)
        toast({
            variant: "destructive",
            title: "Submission Error",
            description: "Could not submit your report. Please try again.",
        })
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Report a Sighting</CardTitle>
          <CardDescription>
            Help us map blooms by submitting your observations.
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
                    <FormLabel>Location of Sighting</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Central Park, NYC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Species</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cherry Blossom" {...field} />
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
                    <FormLabel>Date of Sighting</FormLabel>
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
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you saw, e.g., type of flower, stage of bloom..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Photo (Optional)</FormLabel>
                <FormControl>
                    <div className="relative flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x400px)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" />
                        </label>
                    </div> 
                </FormControl>
                <FormDescription>
                    Adding a photo helps us verify sightings.
                </FormDescription>
              </FormItem>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
