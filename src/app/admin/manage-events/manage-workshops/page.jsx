"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa"
import axios from "axios"

export default function ManageWorkshops() {
  const [workshops, setWorkshops] = useState([])
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/workshops")
      const workshopsData = response.data.map((workshop) => ({
        ...workshop,
        imageUrl: workshop.image || workshop.imageUrl,
      }))
      setWorkshops(workshopsData)
    } catch (error) {
      console.error("Error fetching workshops:", error)
    } finally {
      setLoading(false)
    }
}

  const handleEditWorkshop = (workshop) => {
    setEditingWorkshop({ ...workshop, imageFile: null})
  }

  const handleUpdateWorkshop = async () => {
    if (!editingWorkshop) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("id", editingWorkshop.id);
      formData.append("title", editingWorkshop.title);
      formData.append("price", editingWorkshop.price);
      formData.append("description", editingWorkshop.description);
      formData.append("duration", editingWorkshop.duration);
      formData.append("instructor", editingWorkshop.instructor);

      if (editingWorkshop.imageFile) {
        formData.append("image", editingWorkshop.imageFile);
      } else if (editingWorkshop.imageUrl) {
        formData.append("imageUrl", editingWorkshop.imageUrl); // Retain existing URL
      }

      if (editingWorkshop.id) {
        await axios.put("/api/workshops", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/workshops", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setEditingWorkshop(null);
      fetchWorkshops(); // Refresh the workshops list
      setSuccessMessage(editingWorkshop.id ? "Workshop updated successfully!" : "Workshop added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving workshop:", error);
      alert("Failed to save workshop. Please try again.");
    } finally {
      setLoading(false);
    }
};


  const handleDeleteWorkshop = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workshop?")) return
    try {
      setLoading(true)
      await axios.delete(`/api/workshops?id=${id}`)
      fetchWorkshops()
    } catch (error) {
      console.error("Error deleting workshop:", error)
      alert("Failed to delete workshop.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditingWorkshop((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditingWorkshop((prev) => (prev ? { ...prev, imageUrl: reader.result, imageFile: file } : null))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHighlightChange = (index, value) => {
    setEditingWorkshop((prev) => {
      if (!prev) return null
      const newHighlights = [...prev.highlights]
      newHighlights[index] = value
      return { ...prev, highlights: newHighlights }
    })
  }

  const handleAddHighlight = () => {
    setEditingWorkshop((prev) => {
      if (!prev) return null
      return { ...prev, highlights: [...prev.highlights, ""] }
    })
  }

  const handleAddWorkshop = () => {
    setEditingWorkshop({
      id: 0,
      title: "",
      instructor: "",
      price: "",
      imageUrl: "",
      imageFile: null,
      description: "",
      lastUpdated: new Date().toISOString(),
      duration: "",
      highlights: [""],
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Workshops</h1>
      {successMessage && (
        <div
          className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <button
        onClick={handleAddWorkshop}
        className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
      >
        <FaPlus className="inline mr-2" /> Add New Workshop
      </button>

      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map((workshop) => (
          <div key={workshop.id} className="bg-white rounded-lg shadow-md p-6">
            <img
              src={workshop.image ? workshop.image : workshop.imageUrl}
              alt={workshop.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{workshop.title}</h2>
            <p className="text-gray-600 mb-2">{workshop.instructor}</p>
            <p className="text-gray-800 mb-2">{workshop.price}</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleEditWorkshop(workshop)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                <FaEdit className="inline mr-2" /> Edit
              </button>
              <button
                onClick={() => router.push(`/workshops/${workshop.id}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                <FaEye className="inline mr-2" /> View Details
              </button>
              <button
                onClick={() => handleDeleteWorkshop(workshop.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {editingWorkshop && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">{editingWorkshop.id ? "Edit Workshop" : "Add New Workshop"}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateWorkshop()
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
                  value={editingWorkshop.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instructor">
                  Instructor
                </label>
                <input
                  type="text"
                  id="instructor"
                  name="instructor"
                  value={editingWorkshop.instructor}
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
                  value={editingWorkshop.price}
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
                  value={editingWorkshop.duration}
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
                  value={editingWorkshop.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
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
                {editingWorkshop.highlights.map((highlight, index) => (
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
                  {editingWorkshop.id ? "Update Workshop" : "Add Workshop"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
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

