import App from './App.svelte';
// import makeDictionnary from "./make_dictionnary"
// makeDictionnary()

const app = new App({
	target: document.body,
	props: {
	}
});

// window.console.log = () => {}
// window.addEventListener('beforeunload', function (e) {
// 	// Cancel the event
// 	e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
// 	// Chrome requires returnValue to be set
// 	e.returnValue = '';
//   });

export default app;