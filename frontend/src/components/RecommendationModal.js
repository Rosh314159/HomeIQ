import React from 'react';

const RecommendationModal = ({ 
  isOpen, 
  onClose, 
  options, 
  setOptions, 
  onGetRecommendations 
}) => {
  // Skip rendering if not open
  if (!isOpen) return null;
  
  const handleOptionChange = (e) => {
    const { name, type, value, checked } = e.target;
  
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Find Similar Properties</h2>
         
        {/* Priority Selection */}
        <div className="mt-4">
          <label className="block font-medium text-gray-700 mb-2">Prioritization:</label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="priority"
                value="location"
                checked={options.priority === "location"}
                onChange={handleOptionChange}
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-800">Prioritize Location</span>
                <p className="text-sm text-gray-500">Find properties in the same area</p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="priority"
                value="price"
                checked={options.priority === "price"}
                onChange={handleOptionChange}
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-800">Prioritize Price</span>
                <p className="text-sm text-gray-500">Find properties in a similar price range</p>
              </div>
            </label>
            
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="priority"
                value=""
                checked={options.priority === ""}
                onChange={handleOptionChange}
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-800">Balanced Search</span>
                <p className="text-sm text-gray-500">Equal consideration to all factors</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* Options Form */}
        <div className="mt-6">
          <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="affordableOnly"
              checked={options.affordableOnly}
              onChange={(e) => setOptions({...options, affordableOnly: e.target.checked})}
              className="w-5 h-5 text-green-600"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-800">Only Show Affordable Properties</span>
              <p className="text-sm text-gray-500">Based on your financial profile</p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onGetRecommendations}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
          >
            Find Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal;