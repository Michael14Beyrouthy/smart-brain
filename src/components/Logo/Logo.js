import React from 'react';
import Tilt from 'react-parallax-tilt';
import brain from './brain.png'
import './Logo.css'

const Logo = () => {
  return (
    <div className='ma4 mt0' style={{height: '150px', width: '150px'}}>
      <Tilt className='br2 shadow-2'>
      <div className='Tilt pa3' style={{ height: '150px', width: '150px'}}>
        <img style={{paddingTop: '10px', paddingLeft: '10px'}} src={brain}/>
      </div>
    </Tilt>
    </div>
  );
}

export default Logo;