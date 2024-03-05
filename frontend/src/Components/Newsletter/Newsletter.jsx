import React from 'react'
import  './Newsletter.css';

const Newsletter = () => {
    return (
        <div className='newsletter'>
            <h1>Get Exlusive Offers on your Email</h1>
            <p>Suscribe to our newsletter and stay updated</p>
            <div>
                <input type="email" placeholder="Your Email"/>
                <button>Suscribe</button>
            </div>
        </div>
    )
}

export default Newsletter