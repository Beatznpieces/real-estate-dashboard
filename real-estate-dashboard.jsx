import React, { useState } from 'react';
import { Calendar, Home, Clock, Plus, Edit2, Filter, Users, AlertCircle, CheckSquare, Download } from 'lucide-react';

const RealEstateDashboard = () => {
  const [activeTab, setActiveTab] = useState('timeline');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [newProperty, setNewProperty] = useState({
    address: '',
    sellersName: '',
    occupancy: 'Owner Occupied',
    price: '',
    agent: '',
    status: 'Active'
  });

  // Sample data - in production this would come from a database
  const [properties, setProperties] = useState([
    {
      id: 1,
      address: '123 Oak Street, Austin, TX',
      status: 'Active',
      price: '$450,000',
      agent: 'Sarah Johnson',
      sellersName: 'John & Mary Smith',
      occupancy: 'Owner Occupied',
      checklist: {
        escrowOpened: true,
        listingDocsSigned: true,
        sellersDisclosures: true,
        inspectionsOrdered: false,
        photographyScheduled: true,
        avidCompleted: false
      },
      listingDates: {
        mlsDate: '2026-01-20',
        brokerTourDate: '2026-01-22',
        openHouseDateTime: '2026-01-29T10:00'
      },
      events: [
        { type: 'Showing', date: '2026-01-28T14:00', client: 'Smith Family' },
        { type: 'Open House', date: '2026-01-29T10:00', duration: '3 hours' }
      ]
    },
    {
      id: 2,
      address: '456 Maple Ave, Austin, TX',
      status: 'Pending',
      price: '$625,000',
      agent: 'Sarah Johnson',
      sellersName: 'Robert & Linda Chen',
      occupancy: 'Vacant',
      checklist: {
        escrowOpened: true,
        listingDocsSigned: true,
        sellersDisclosures: true,
        inspectionsOrdered: true,
        photographyScheduled: true,
        avidCompleted: true
      },
      listingDates: {
        mlsDate: '2026-01-10',
        brokerTourDate: '2026-01-12',
        openHouseDateTime: '2026-01-15T14:00'
      },
      events: [
        { type: 'Inspection', date: '2026-01-28T09:00', inspector: 'ABC Inspections' },
        { type: 'Closing', date: '2026-02-15T15:00', title: 'Final Closing' }
      ]
    },
    {
      id: 3,
      address: '789 Pine Road, Round Rock, TX',
      status: 'Active',
      price: '$385,000',
      agent: 'Michael Chen',
      sellersName: 'Patricia Martinez',
      occupancy: 'Owner Occupied',
      checklist: {
        escrowOpened: false,
        listingDocsSigned: true,
        sellersDisclosures: false,
        inspectionsOrdered: false,
        photographyScheduled: false,
        avidCompleted: false
      },
      listingDates: {
        mlsDate: '',
        brokerTourDate: '',
        openHouseDateTime: ''
      },
      events: [
        { type: 'Showing', date: '2026-01-30T16:00', client: 'Johnson Family' }
      ]
    },
    {
      id: 4,
      address: '321 Elm Street, Georgetown, TX',
      status: 'Pending',
      price: '$515,000',
      agent: 'Sarah Johnson',
      sellersName: 'David & Susan Wilson',
      occupancy: 'Vacant',
      checklist: {
        escrowOpened: true,
        listingDocsSigned: true,
        sellersDisclosures: true,
        inspectionsOrdered: true,
        photographyScheduled: true,
        avidCompleted: true
      },
      listingDates: {
        mlsDate: '2026-01-05',
        brokerTourDate: '2026-01-08',
        openHouseDateTime: '2026-01-12T13:00'
      },
      events: [
        { type: 'Appraisal', date: '2026-02-01T11:00', appraiser: 'First American' },
        { type: 'Final Walkthrough', date: '2026-02-10T14:00', client: 'Davis Family' }
      ]
    }
  ]);

  // Get all events sorted by date
  const getAllEvents = () => {
    const allEvents = [];
    properties.forEach(property => {
      property.events.forEach(event => {
        allEvents.push({
          ...event,
          property: property.address,
          propertyId: property.id,
          status: property.status,
          agent: property.agent
        });
      });
    });
    return allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get time until event
  const getTimeUntil = (dateStr) => {
    const now = new Date('2026-01-28T08:00'); // Current mock time
    const eventDate = new Date(dateStr);
    const diffMs = eventDate - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 0) return 'Past';
    if (diffHrs < 1) return 'Less than 1 hour';
    if (diffHrs < 24) return `In ${diffHrs} hours`;
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Get urgency level
  const getUrgency = (dateStr) => {
    const now = new Date('2026-01-28T08:00');
    const eventDate = new Date(dateStr);
    const diffHrs = (eventDate - now) / (1000 * 60 * 60);

    if (diffHrs < 0) return 'past';
    if (diffHrs < 6) return 'urgent';
    if (diffHrs < 24) return 'today';
    if (diffHrs < 72) return 'soon';
    return 'upcoming';
  };

  const urgencyColors = {
    urgent: 'bg-red-100 border-red-400 text-red-900',
    today: 'bg-orange-100 border-orange-400 text-orange-900',
    soon: 'bg-yellow-100 border-yellow-400 text-yellow-900',
    upcoming: 'bg-blue-100 border-blue-400 text-blue-900',
    past: 'bg-gray-100 border-gray-300 text-gray-500'
  };

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Closed': 'bg-gray-100 text-gray-800'
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const toggleChecklistItem = (propertyId, checklistKey) => {
    setProperties(properties.map(property => {
      if (property.id === propertyId) {
        return {
          ...property,
          checklist: {
            ...property.checklist,
            [checklistKey]: !property.checklist[checklistKey]
          }
        };
      }
      return property;
    }));
  };

  const getChecklistProgress = (checklist) => {
    const items = Object.values(checklist);
    const completed = items.filter(item => item).length;
    return Math.round((completed / items.length) * 100);
  };

  const checklistLabels = {
    escrowOpened: 'Escrow Opened',
    listingDocsSigned: 'Listing Documents Signed',
    sellersDisclosures: "Seller's Disclosures Completed",
    inspectionsOrdered: 'Inspections Ordered',
    photographyScheduled: 'Photography Scheduled',
    avidCompleted: 'AVID Completed'
  };

  const updateListingDate = (propertyId, dateField, value) => {
    setProperties(properties.map(property => {
      if (property.id === propertyId) {
        return {
          ...property,
          listingDates: {
            ...property.listingDates,
            [dateField]: value
          }
        };
      }
      return property;
    }));
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTimeDisplay = (dateStr) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleAddProperty = () => {
    const property = {
      id: properties.length + 1,
      address: newProperty.address,
      status: newProperty.status,
      price: newProperty.price,
      agent: newProperty.agent,
      sellersName: newProperty.sellersName,
      occupancy: newProperty.occupancy,
      checklist: {
        escrowOpened: false,
        listingDocsSigned: false,
        sellersDisclosures: false,
        inspectionsOrdered: false,
        photographyScheduled: false,
        avidCompleted: false
      },
      listingDates: {
        mlsDate: '',
        brokerTourDate: '',
        openHouseDateTime: ''
      },
      events: []
    };
    
    setProperties([...properties, property]);
    setShowAddPropertyModal(false);
    
    // Reset form
    setNewProperty({
      address: '',
      sellersName: '',
      occupancy: 'Owner Occupied',
      price: '',
      agent: '',
      status: 'Active'
    });
  };

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // In a real app, this would call your backend API
      // For now, we'll show this triggers the PDF generation
      const allEvents = getAllEvents();
      
      // This would be sent to your backend
      const pdfData = {
        events: allEvents,
        properties: properties,
        generatedDate: new Date().toLocaleString()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('PDF export feature ready! In production, this would:\n\n1. Send event data to your backend\n2. Generate a formatted PDF with all events\n3. Return a downloadable PDF file\n\nThe backend would use a library like reportlab (Python) or pdfkit (Node.js) to create the PDF.');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const filteredProperties = filterStatus === 'all' 
    ? properties 
    : properties.filter(p => p.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Real Estate Dashboard</h1>
                <p className="text-sm text-gray-600">Track properties and upcoming events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {isGeneratingPDF ? 'Generating...' : 'Export to PDF'}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'timeline' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline View
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'properties' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            Properties View
          </button>
        </div>

        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Upcoming Events
              </h2>
              
              <div className="space-y-3">
                {getAllEvents().map((event, idx) => {
                  const urgency = getUrgency(event.date);
                  const property = properties.find(p => p.id === event.propertyId);
                  const progress = property ? getChecklistProgress(property.checklist) : 0;
                  
                  return (
                    <div
                      key={idx}
                      className={`border-l-4 p-4 rounded-lg ${urgencyColors[urgency]}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{event.type}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[event.status]}`}>
                              {event.status}
                            </span>
                            {property && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                {progress}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1">{event.property}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.agent}
                            </span>
                          </div>
                          {(event.client || event.inspector || event.appraiser) && (
                            <p className="text-xs mt-1 opacity-75">
                              {event.client || event.inspector || event.appraiser}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold block mb-2">
                            {getTimeUntil(event.date)}
                          </span>
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold mb-2">Urgency Legend</h3>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  Urgent (6 hours)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-400 rounded"></div>
                  Today (24 hours)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  Soon (3 days)
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Properties View */}
        {activeTab === 'properties' && (
          <div>
            {/* Filter and Add Property */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Properties</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowAddPropertyModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Property
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProperties.map(property => {
                const progress = getChecklistProgress(property.checklist);
                return (
                  <div key={property.id} className="bg-white p-5 rounded-lg shadow-sm border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{property.address}</h3>
                        <p className="text-lg font-bold text-blue-600">{property.price}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[property.status]}`}>
                        {property.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {property.agent}
                      </div>
                      {property.sellersName && (
                        <div className="flex items-center gap-1 pl-5">
                          <span className="text-xs">Seller: {property.sellersName}</span>
                        </div>
                      )}
                      {property.occupancy && (
                        <div className="flex items-center gap-1 pl-5">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            property.occupancy === 'Owner Occupied' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {property.occupancy}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Listing Key Dates */}
                    <div className="border-t pt-3 mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Key Listing Dates
                      </h4>
                      <div className="space-y-2">
                        <div className="bg-gray-50 p-2 rounded">
                          <label className="block text-xs text-gray-600 mb-1">On MLS</label>
                          <input
                            type="date"
                            value={property.listingDates.mlsDate}
                            onChange={(e) => updateListingDate(property.id, 'mlsDate', e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {property.listingDates.mlsDate && (
                            <p className="text-xs text-gray-500 mt-1">{formatDateDisplay(property.listingDates.mlsDate)}</p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded">
                          <label className="block text-xs text-gray-600 mb-1">Broker Tour</label>
                          <input
                            type="date"
                            value={property.listingDates.brokerTourDate}
                            onChange={(e) => updateListingDate(property.id, 'brokerTourDate', e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {property.listingDates.brokerTourDate && (
                            <p className="text-xs text-gray-500 mt-1">{formatDateDisplay(property.listingDates.brokerTourDate)}</p>
                          )}
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded">
                          <label className="block text-xs text-gray-600 mb-1">Open House</label>
                          <input
                            type="datetime-local"
                            value={property.listingDates.openHouseDateTime}
                            onChange={(e) => updateListingDate(property.id, 'openHouseDateTime', e.target.value)}
                            className="w-full text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {property.listingDates.openHouseDateTime && (
                            <p className="text-xs text-gray-500 mt-1">{formatDateTimeDisplay(property.listingDates.openHouseDateTime)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* New Listing Checklist */}
                    <div className="border-t border-b py-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase">New Listing Checklist</h4>
                        <span className="text-xs font-medium text-blue-600">{progress}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(property.checklist).map(([key, value]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={() => toggleChecklistItem(property.id, key)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-600'}`}>
                              {checklistLabels[key]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase">Upcoming Events</h4>
                      <div className="space-y-2">
                        {property.events.map((event, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{event.type}</span>
                              <span className="text-xs text-gray-600">{getTimeUntil(event.date)}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {formatDate(event.date)} at {formatTime(event.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="mt-3 w-full text-sm text-blue-600 hover:text-blue-800 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.address}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>Showing</option>
                  <option>Open House</option>
                  <option>Inspection</option>
                  <option>Appraisal</option>
                  <option>Closing</option>
                  <option>Final Walkthrough</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows="3"></textarea>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Event would be saved here!');
                    setShowAddModal(false);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              Add New Property
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property Address*</label>
                <input 
                  type="text"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                  placeholder="e.g., 123 Main Street, Austin, TX 78701"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Seller Name*</label>
                <input 
                  type="text"
                  value={newProperty.sellersName}
                  onChange={(e) => setNewProperty({...newProperty, sellersName: e.target.value})}
                  placeholder="e.g., John & Jane Doe"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Occupancy Status*</label>
                <select 
                  value={newProperty.occupancy}
                  onChange={(e) => setNewProperty({...newProperty, occupancy: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Owner Occupied">Owner Occupied</option>
                  <option value="Vacant">Vacant</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">List Price*</label>
                  <input 
                    type="text"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                    placeholder="$450,000"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select 
                    value={newProperty.status}
                    onChange={(e) => setNewProperty({...newProperty, status: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Listing Agent*</label>
                <input 
                  type="text"
                  value={newProperty.agent}
                  onChange={(e) => setNewProperty({...newProperty, agent: e.target.value})}
                  placeholder="e.g., Sarah Johnson"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-3">* Required fields. You can add listing dates and checklist items after creating the property.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    setShowAddPropertyModal(false);
                    setNewProperty({
                      address: '',
                      sellersName: '',
                      occupancy: 'Owner Occupied',
                      price: '',
                      agent: '',
                      status: 'Active'
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProperty}
                  disabled={!newProperty.address || !newProperty.sellersName || !newProperty.price || !newProperty.agent}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateDashboard;
