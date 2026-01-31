import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  const getCategoryColor = (category) => {
    const colors = {
      design: 'bg-purple-100 text-purple-800',
      writing: 'bg-green-100 text-green-800',
      development: 'bg-blue-100 text-blue-800',
      marketing: 'bg-yellow-100 text-yellow-800',
      data: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {job.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
            {job.status.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(job.category)}`}>
            {job.category}
          </span>
          {job.skillsRequired?.slice(0, 3).map((skill, index) => (
            <span key={index} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
              {skill}
            </span>
          ))}
          {job.skillsRequired?.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
              +{job.skillsRequired.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Budget</p>
            <p className="font-semibold text-gray-900">
              ${job.budget?.min || 0} - ${job.budget?.max || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium text-gray-900">{job.duration}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 mr-2">
              {job.client?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{job.client?.name || 'Unknown Client'}</p>
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span className="text-sm text-gray-600">
                  {job.client?.rating?.average?.toFixed(1) || 'N/A'} 
                  ({job.client?.rating?.count || 0})
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">{job.bidCount || 0} bids</p>
            <Link
              to={`/jobs/${job._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;