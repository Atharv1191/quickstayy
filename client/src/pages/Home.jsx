import React from 'react'
import Hero from '../components/Hero'
import Featureddestination from '../components/Featureddestination'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonials from '../components/Testimonials'
import NewsLetter from '../components/NewsLetter'
import RecomendedHotels from '../components/RecomendedHotels'

const Home = () => {
  return (
    <>
        <Hero/>
        <RecomendedHotels/>
        <Featureddestination/>
        <ExclusiveOffers/>
        <Testimonials/>
        <NewsLetter/>
    </>
  )
}

export default Home