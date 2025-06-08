import React from 'react';

const AITool = ({ title, description, onClick, buttonText }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <button
        onClick={onClick}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default AITool;