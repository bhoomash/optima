import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingRoom, setViewingRoom] = useState(null);

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

      {/* Room Detail Modal */}
      {viewingRoom && (
        <div className="modal-overlay" onClick={() => setViewingRoom(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Room Details</h3>
              <button className="modal-close" onClick={() => setViewingRoom(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#6b7280' }}>
                    <HiOutlineOfficeBuilding />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{viewingRoom.name}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{viewingRoom.roomId}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>
                      <span className={`badge ${viewingRoom.type === 'lab' ? 'badge-warning' : 'badge-primary'}`}>{viewingRoom.type}</span>
                    </p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '1.25rem' }}>{viewingRoom.capacity || '—'}</p>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Building</p>
                  <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingRoom.building || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <HiOutlineSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.1rem' }} />
        <input
          type="text"
          placeholder="Search rooms by ID, name, type, or building..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.25rem', width: '100%' }}
        />
      </div>

      {/* Rooms Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
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
                {rooms
                  .filter((room) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      room.roomId?.toLowerCase().includes(q) ||
                      room.name?.toLowerCase().includes(q) ||
                      room.type?.toLowerCase().includes(q) ||
                      room.building?.toLowerCase().includes(q) ||
                      String(room.capacity).includes(q)
                    );
                  })
                  .map((room) => (
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
                          className="btn btn-primary btn-sm"
                          onClick={() => setViewingRoom(room)}
                          title="View details"
                        >
                          <HiOutlineEye /> View
                        </button>
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
