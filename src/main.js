window.console.log = () => {}
import App from './App.svelte';
// import makeDictionnary from "./make_dictionnary"
import {initMolangeur} from "./logic/molangeur"
// makeDictionnary()
initMolangeur(()=>console.log("molangeur was initialized"))

const app = new App({
	target: document.body,
	props: {
	}
});


// window.addEventListener("scroll", ()=>{console.log("scroll")})
// window.addEventListener('beforeunload', function (e) {
// 	// Cancel the event
// 	e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
// 	// Chrome requires returnValue to be set
// 	e.returnValue = '';
//   });


export default app;