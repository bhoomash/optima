import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import { roomsApi } from '../services/api';
import RoomForm from '../components/RoomForm';

/**
 * Rooms Management Page
 * Handles CRUD operations for rooms
 */
function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch all rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roomsApi.getAll();
      setRooms(response.data.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching rooms' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle form submit
  const handleSubmit = async (data) => {
    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom.roomId, data);
        setMessage({ type: 'success', text: 'Room updated successfully' });
      } else {
        await roomsApi.create(data);
        setMessage({ type: 'success', text: 'Room created successfully' });
      }
      setShowForm(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error saving room' 
      });
    }
  };

  // Handle delete
  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomsApi.delete(roomId);
        setMessage({ type: 'success', text: 'Room deleted successfully' });
        fetchRooms();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting room' });
      }
    }
  };

  // Handle edit
  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Rooms Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingRoom(null); setShowForm(true); }}
        >
          <HiOutlinePlus /> Add Room
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Room Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <RoomForm 
                onSubmit={handleSubmit}
                initialData={editingRoom}
                onCancel={() => { setShowForm(false); setEditingRoom(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"><span></span><span></span><span></span><span></span></div>
            <p>Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineOfficeBuilding /></div>
            <h3>No Rooms</h3>
            <p>Add your first room to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Room ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Building</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.roomId}>
                    <td>{room.roomId}</td>
                    <td>{room.name}</td>
                    <td>
                      <span className={`badge ${room.type === 'lab' ? 'badge-warning' : 'badge-primary'}`}>
                        {room.type}
                      </span>
                    </td>
                    <td>{room.capacity}</td>
                    <td>{room.building || '-'}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(room)}
                        >
                          <HiOutlinePencil /> Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(room.roomId)}
                        >
                          <HiOutlineTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomsPage;
