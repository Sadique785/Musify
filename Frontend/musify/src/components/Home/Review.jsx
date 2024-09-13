import React from 'react'
import Slider from 'react-slick';
import { FaStar } from 'react-icons/fa'


const Review = () => {

  const reviews = [
    {
      id: 1,
      stars: 5,
      comment: "I’ve been with Musify for around 3 years now. And I haven’t found a single other app that compares. Musify stands alone without exaggeration.",
      name: "Celine Brown",
    },
    {
      id: 2,
      stars: 5,
      comment: "I love using this every day. It has changed my life.",
      name: "Jane Smith",
    },
    {
      id: 3,
      stars: 5,
      comment: "I am definitely addicted to this app. Far Better than the looping apps. Probably the best web composition tool around.",
      name: "Michael Brown",
    },
    {
      id: 4,
      stars: 4,
      comment: "Words cannot describe how thrilled I was when I found this platform. It is perfect for me since I want to be a film score composer when I get older and this is perfect because it has tons of different orchestral instrumental options.",
      name: "Emily Davis",
    },
    {
      id: 5,
      stars: 5,
      comment: "Fantastic! Will definitely Use it  again.",
      name: "Chris Wilson",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
  }

  return (
    <section className="custom-gradient-2 p-8 bg-gray-100 h-[50vh] flex flex-col items-center">
      <h2 className="text-3xl text-white font-bold mb-4">WHAT'S THE WORD</h2>
        <Slider {...settings} className='w-full'>
          {reviews.map((review) => (
            <div key={review.id} className='p-4 mt-7 bg-transparent font-mulish  rounded-lg flex flex-col items-start ' >
              <div className='flex mb-2'>
                {[...Array(review.stars)].map((_, index) => (
                  <FaStar key={index} className='text-yellow-500' />
                ))}

              </div>
              <p className='mb-4 text-white  text-left '>{review.comment}</p>
              <div className='text-left text-white'>
                <h3 className='text-xs font-extralight' >{review.name}</h3>
              </div>
            </div>
          ))

          }

        </Slider>
    </section>
  )
}

export default Review
