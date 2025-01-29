import React, { useRef, useEffect } from 'react';

const ChatShimmer = () => {
    const shimmerMessages = Array(6).fill(null);

    return (
        <>
          {shimmerMessages.map((_, index) => (
            <div 
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? 'items-start' : 'items-end'
              } w-full mb-4 animate-pulse`}
            >
              <div 
                className={`
                  max-w-[100%] 
                  w-20
                  relative 
                  ${index % 2 === 0
                    ? 'bg-blue-200 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl' 
                    : 'bg-gray-200 rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl'
                  } 
                  px-4 py-2 
                  mb-1
                  h-8
                  w-[${Math.floor(Math.random() * (70 - 30 + 1) + 30)}%]
                `}
              />
            </div>
          ))}
        </>
      );

}


export default ChatShimmer;