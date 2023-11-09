import './App.css';
import React, {Component} from 'react';
import ParticlesBg from 'particles-bg';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Rank from './components/Rank/Rank'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'

const generateRequestOptions = (imageUrl) => {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = '4c3a80317dce4a39b77c5c29866b14e6';
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = 'miniskipper44';       
  const APP_ID = 'facerecognitionbrain';
  // Change these to whatever model and image URL you want to use
  const MODEL_ID = 'face-detection';
  const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
  const IMAGE_URL = imageUrl;
  // const IMAGE_URL = 'https://samples.clarifai.com/metro-north.jpg';


  ///////////////////////////////////////////////////////////////////////////////////
  // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
  ///////////////////////////////////////////////////////////////////////////////////

  const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
  });

  const requestOptions = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Authorization': 'Key ' + PAT
      },
      body: raw
  };

  return requestOptions;
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
     this.setState({input : event.target.value});
  }

  onButtonSubmit = async () => {

    this.setState({imageUrl : this.state.input});

    try {
      //we had to pass over this.state.input as opposed to this.state.imageUrl because of a funky way that react works
      const requestOptions = generateRequestOptions(this.state.input);
      
      const response = await fetch("https://api.clarifai.com/v2/models/" + "face-detection" + "/outputs", requestOptions);

      if (response) {
        try 
        { 
          const fetchResponse = await fetch('https://smart-brain-backend-2he1.onrender.com/image', {
            method: 'put',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: this.state.user.id
            })
          }); 
          const count = await fetchResponse.json();
          this.setState(Object.assign(this.state.user, { entries: count }));
        }
        catch (e) {
          console.log(e);
        }
        
      }

      const responseJson = await response.json();  
      // console.log(responseJson.outputs[0].data.regions[0].region_info.bounding_box);
      const faceBox = this.calculateFaceLocation(responseJson);
      this.displayFaceBox(faceBox);
    

    } catch (error) {
      console.log('error', error);
    }
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    }
    else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }


  render () {
    const { route, isSignedIn, box, imageUrl, user } = this.state;

    if (route === 'home') {
      return (<div className="App">
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        <div> 
          <Logo />
          <Rank name={user.name} entries={user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
        <ParticlesBg type="cobweb" bg={true} />
      </div>);
    } else if (route === 'signin' || route === 'signout') {
      return (
        <div className="App">
          <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
          <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          <ParticlesBg type="cobweb" bg={true} />
        </div>
      );
    } else if (route === 'register') {
      return (
        <div className="App">
          <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
          <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          <ParticlesBg type="cobweb" bg={true} />
        </div>
      );
    }
  }
}

export default App;
