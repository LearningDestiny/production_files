"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa"
import axios from "axios"

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/events")
      const eventsData = response.data.map((event) => ({
        ...event,
        imageUrl: event.image || event.imageUrl,
      }))
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvent = (event) => {
    setEditingEvent({ ...event, imageFile: null })
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("id", editingEvent.id)
      formData.append("title", editingEvent.title)
      formData.append("date", editingEvent.date)
      formData.append("description", editingEvent.description)
      formData.append("price", editingEvent.price)
      formData.append("duration", editingEvent.duration)
      formData.append("summaryDescription", editingEvent.summaryDescription)

      if (editingEvent.imageFile) {
        formData.append("image", editingEvent.imageFile)
      } else if (editingEvent.imageUrl) {
        formData.append("imageUrl", editingEvent.imageUrl) // Retain existing URL
      }

      if (editingEvent.id) {
        await axios.put("/api/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        await axios.post("/api/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      setEditingEvent(null)
      fetchEvents()
      setSuccessMessage(editingEvent.id ? "Event updated successfully!" : "Event added successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving event:", error)
      alert("Failed to save event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return
    try {
      setLoading(true)
      await axios.delete(`/api/events?id=${id}`)
      fetchEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditingEvent({ ...editingEvent, [name]: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditingEvent((prev) => (prev ? { ...prev, imageUrl: reader.result, imageFile: file } : null))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...editingEvent.highlights]
    newHighlights[index] = value
    setEditingEvent({ ...editingEvent, highlights: newHighlights })
  }

  const handleAddHighlight = () => {
    setEditingEvent({
      ...editingEvent,
      highlights: [...editingEvent.highlights, ""],
    })
  }

  const handleAddEvent = () => {
    setEditingEvent({
      title: "",
      date: "",
      price: "",
      duration: "",
      description: "",
      summaryDescription: "",
      imageUrl: "",
      imageFile: null,
      highlights: [""],
      location: "",
      organizer: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Events</h1>
      {successMessage && (
        <div
          className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <button
        onClick={handleAddEvent}
        className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
      >
        <FaPlus className="inline mr-2" /> Add New Event
      </button>

      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <img
              src={event.image ? event.image : event.imageUrl}
              alt={event.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-2">{event.date}</p>
            <p className="text-gray-800 mb-2">{event.price}</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleEditEvent(event)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                <FaEdit className="inline mr-2" /> Edit
              </button>
              <button
                onClick={() => router.push(`/edit-eventid=${event.id}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                <FaEye className="inline mr-2" /> View Details
              </button>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">{editingEvent.id ? "Edit Event" : "Add New Event"}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateEvent()
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingEvent.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  Date
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={editingEvent.date}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={editingEvent.price}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={editingEvent.duration}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editingEvent.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summaryDescription">
                  Summary Description
                </label>
                <textarea
                  id="summaryDescription"
                  name="summaryDescription"
                  value={editingEvent.summaryDescription}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="2"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                  Image
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  accept="image/*"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Highlights</label>
                {editingEvent.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                >
                  <FaPlus className="inline mr-2" /> Add Highlight
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {editingEvent.id ? "Update Event" : "Add Event"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

