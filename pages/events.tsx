"use client"

import { motion } from "framer-motion"
import Layout from "../components/layout"
import { CalendarIcon, MapPinIcon, ClockIcon } from "lucide-react"

// Sample events data (replace with API data later)
const events = [
  {
    id: 1,
    title: "Detroit Riverfront 5K",
    date: "TBD",
    time: "TBD",
    location: "Detroit Riverwalk",
    description: "Join us for a scenic run along the Detroit River. All skill levels welcome!",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Homepage.jpg-xAsGzsetdgzj2aWAQNwoah9GPVy81z.jpeg",
  },
  {
    id: 2,
    title: "Community Training Session",
    date: "TBD",
    time: "TBD",
    location: "Belle Isle State Park",
    description: "Weekly group training session followed by breakfast and socializing.",
    image: "https://t3.ftcdn.net/jpg/06/16/17/88/360_F_616178830_rySDz4kA4m5l7tiWta1O0qLAFhFqw2eS.jpg",
  },
  {
    id: 3,
    title: "Charity Fun Run",
    date: "TBD",
    time: "TBD",
    location: "Downtown Detroit",
    description: "Annual charity run supporting local Arab community initiatives.",
    image: "https://t3.ftcdn.net/jpg/06/16/17/88/360_F_616178830_rySDz4kA4m5l7tiWta1O0qLAFhFqw2eS.jpg",
  },
]

export default function Events() {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <section className="bg-[#041E42] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Upcoming Events</h1>
            <p className="text-xl md:text-2xl mb-8">Join us for our next community run</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#041E42] mb-2">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        {event.location}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <button className="w-full bg-[#041E42] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#041E42]/90 transition-colors">
                      Register Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </Layout>
  )
}

