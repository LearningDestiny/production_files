'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import axios from 'axios'

export default function ManageInternships() {
  const [internships, setInternships] = useState([]);
  const [editingInternship, setEditingInternship] = useState(null);
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
        setLoading(true);
        const response = await axios.get("/api/internships");
        const internshipsData = response.data.map((internship) => ({
            ...internship,
            imageUrl: internship.image || internship.imageUrl,
        }));
        setInternships(internshipsData);
    } catch (error) {
        console.error("Error fetching internships:", error);
    } finally {
        setLoading(false);
    }
};

  const handleEditInternship = (internship) => {
    setEditingInternship({ ...internship, imageFile: null, highlights: internship.highlights || [],  });
  };

  const handleUpdateInternship = async () => {
    if (!editingInternship) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("id", editingInternship.id);
      formData.append("title", editingInternship.title);
      formData.append("company", editingInternship.company);
      formData.append("stipend", editingInternship.stipend);
      formData.append("duration", editingInternship.duration);
      formData.append("description", editingInternship.description);
      formData.append("summaryDescription", editingInternship.summaryDescription);
      formData.append("location", editingInternship.location);
      formData.append("organizer", editingInternship.organizer);

      if (editingInternship.imageFile) {
        formData.append("image", editingInternship.imageFile);
      } else if (editingInternship.imageUrl) {
        formData.append("imageUrl", editingInternship.imageUrl); // Retain existing URL
      }

      if (editingInternship.id) {
        await axios.put("/api/internships", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/api/internships", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setEditingInternship(null);
      fetchInternships();
      setSuccessMessage(editingInternship.id ? "Internship updated successfully!" : "Internship added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving internship:", error);
      alert("Failed to save internship. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInternship = async (id) => {
    if (!window.confirm("Are you sure you want to delete this internship?")) return;
    try {
      setLoading(true);
      await axios.delete(`/api/internships?id=${id}`);
      fetchInternships();
    } catch (error) {
      console.error("Error deleting internship:", error);
      alert("Failed to delete internship.");
    } finally {
      setLoading(false);
    }
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingInternship((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingInternship((prev) => prev ? { ...prev, imageUrl: reader.result, imageFile: file } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHighlightChange = (index, value) => {
    setEditingInternship((prev) => {
      if (!prev) return null;
      const newHighlights = [...prev.highlights];
      newHighlights[index] = value;
      return { ...prev, highlights: newHighlights };
    });
  };

  const handleAddHighlight = () => {
    setEditingInternship((prev) => {
      if (!prev) return null;
      return { ...prev, highlights: [...(prev.highlights || []), ''] };
    });
  };

  const handleAddInternship = () => {
    setEditingInternship({
      id: '',
      title: '',
      company: '',
      stipend: '',
      duration: '',
      description: '',
      summaryDescription: '',
      imageUrl: '',
      imageFile: null,
      highlights: [''],
      location: '',
      organizer: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Internships</h1>
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <button
        onClick={handleAddInternship}
        className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 cursor-pointer"
      >
        <FaPlus className="inline mr-2" /> Add New Internship
      </button>

      {loading && <p>Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <div key={internship.id} className="bg-white rounded-lg shadow-md p-6">
            <img
              src={internship.image ? internship.image : internship.imageUrl}
              alt={internship.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{internship.title}</h2>
            <p className="text-gray-600 mb-2">{internship.company}</p>
            <p className="text-gray-800 mb-2">{internship.stipend}</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleEditInternship(internship)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 cursor-pointer"
              >
                <FaEdit className="inline mr-2" /> Edit
              </button>
              <button
                onClick={() => router.push(`/internship/${internship.id}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 cursor-pointer"
              >
                <FaEye className="inline mr-2" /> View Details
              </button>
              <button
                onClick={() => handleDeleteInternship(internship.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 cursor-pointer"
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingInternship && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">
              {editingInternship.id ? 'Edit Internship' : 'Add New Internship'}
            </h3>
            <form onSubmit={handleUpdateInternship}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editingInternship.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={editingInternship.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Stipend
                </label>
                <input
                  type="text"
                  name="stipend"
                  value={editingInternship.stipend}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={editingInternship.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editingInternship.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Summary Description
                </label>
                <textarea
                  name="summaryDescription"
                  value={editingInternship.summaryDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
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
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editingInternship.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={editingInternship.organizer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Highlights
                </label>
                {editingInternship.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) =>
                        handleHighlightChange(index, e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingInternship((prev) => ({
                          ...prev,
                          highlights: prev.highlights.filter(
                            (_, i) => i !== index
                          ),
                        }))
                      }
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                >
                  <FaPlus className="inline mr-2" /> Add Highlight
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {editingInternship.id ? 'Update Internship' : 'Add Internship'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingInternship(null)}
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
  );
};
