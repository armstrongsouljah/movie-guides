const $elem = (selector) => document.querySelector(selector);
const signIn = $elem("#signin");
const signUp = $elem('#signup');
const logOut = $elem('#logout');
const movieList = $elem('.movies');
const loginForm = $elem('#login_form');
const loginModal = $elem('#login_modal');
const signupForm = $elem('#signup_form');
const intro = $elem('.intro');
const recaptchaContainer = $elem('.recaptcha-container');
const phoneForm = $elem('.phoneForm');
const codeContainer = $elem('.login_code');
const codeForm = $elem('.codeForm');
const captchaError = $elem('captcha-error');
const googleLogin = $elem('#google-login');

// initially hide the code form
codeContainer.style.display = "none";


// initialize all modals
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.modal');
    var collapsibles = document.querySelectorAll('.collapsible');
    var instances = M.Modal.init(elems);
    M.textareaAutoResize($elem('#movie_details'));
    M.Collapsible.init(collapsibles);
});

// handle signup
signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = signupForm['email'].value;
    const password = signupForm['password'].value;

    // register the user
    auth.createUserWithEmailAndPassword(email, password)
        .then(response => {
            console.log('new user', response.user);
            signupForm.reset()
            const signupModal = $elem('#add_user');
            M.Modal.getInstance(signupModal).close();
        })
        .catch(error => console.error(error))
})

// log the user out.

//handle phone number signin signup
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainer)

// get phone data
phoneForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = phoneForm['phone-number'].value;
    const appVerifier = window.recaptchaVerifier;

    // send verification code
    auth.signInWithPhoneNumber(phone, appVerifier)
        .then(response => {
            console.log(response)
            window.confirmationResult = response;
            phoneForm.style.display = "none";
            phoneForm.reset()
            codeContainer.style.display = "block";
        })
        .catch(error => console.error(error));
});

// log the user in
codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = codeForm['verify-code'].value;
    console.log(code)
    window.confirmationResult.confirm(code)
        .then(result => {
            console.log(result.user)
            codeForm.reset()
            codeForm.style.display = "none";
            logOut.style.display = "block";
            signIn.style.display = "none";
        })
        .catch(error => console.error(error))
})

// log the user in with email/password
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const login_email = loginForm['login_email'].value;
    const login_password = loginForm['login_password'].value;
    auth.signInWithEmailAndPassword(login_email, login_password)
        .then(user => {
            loginForm.reset()
            M.Modal.getInstance(loginModal).close()
        })
})

// log the user out
logOut.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
        console.log('User signed out successfuly')
        logOut.style.display = "none"
    })
})

// get currently logged in user
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        //   console.log('user logged in ', user);
        signIn.style.display = "none";
        recaptchaContainer.style.display = "none";
    } else {
        console.log('not logged in')
        signIn.style.display = "block";
    }
})


// sign in with google
const provider = new firebase.auth.GoogleAuthProvider();
// add user scope
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

// use sign in popup window.
googleLogin.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signInWithPopup(provider).then(result => console.log(result)).catch(error => console.error(error))

})

function onSignIn(googleUser) {
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = auth.onAuthStateChanged(function(firebaseUser) {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.getAuthResponse().id_token);
        // Sign in with credential from the Google user.
        auth.signInWithCredential(credential).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      } else {
        console.log('User already signed-in Firebase.');
      }
    });
  }


  function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
            providerData[i].uid === googleUser.getBasicProfile().getId()) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  }